import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, formatDistanceToNowStrict } from 'date-fns'
import { Ban, Search, ShieldCheck, ShieldMinus, ShieldPlus, VolumeX } from 'lucide-react'
import { useIsSiteAdmin } from '@/features/moderation/hooks/useModeration'
import { useSetMemberRole } from '@/features/governance/hooks/useGovernance'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Input,
  Skeleton,
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { avatarGradient } from '@/utils/avatarColor'
import type { MemberProfile } from '../api/bans'
import {
  useCommunityBans,
  useCommunityMembers,
  useLiftRestriction,
} from '../hooks/useCommunityBans'
import { isActive } from '../utils/restrictions'
import { RestrictUserDialog } from './RestrictUserDialog'

function Person({
  profile,
  fallbackId,
}: {
  profile: MemberProfile | null
  fallbackId: string
}) {
  const name = profile?.display_name ?? profile?.username ?? 'Deleted user'
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
        <AvatarFallback
          className={`${avatarGradient(profile?.username ?? fallbackId)} text-xs font-semibold text-white`}
        >
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        {profile ? (
          <Link
            to={`/u/${profile.username}`}
            className="block truncate text-sm font-medium text-foreground hover:text-primary"
          >
            {name}
          </Link>
        ) : (
          <span className="block truncate text-sm font-medium text-foreground">
            {name}
          </span>
        )}
        {profile && (
          <span className="block truncate text-xs text-muted-foreground">
            @{profile.username}
          </span>
        )}
      </div>
    </div>
  )
}

export function MembersManager({
  communityId,
  createdBy,
}: {
  communityId: string
  /** The community's creator, who (with admins) may demote other moderators. */
  createdBy: string | null
}) {
  const { user } = useAuth()
  const { data: isSiteAdmin } = useIsSiteAdmin()
  const setRole = useSetMemberRole(communityId)
  const { data: members, isLoading: isLoadingMembers } = useCommunityMembers(communityId)
  const { data: bans, isLoading: isLoadingBans } = useCommunityBans(communityId)
  const lift = useLiftRestriction(communityId)
  const [query, setQuery] = useState('')

  const myRole = members?.find((m) => m.user_id === user?.id)?.role
  // Mirrors can_manage_moderators() in the database; the server enforces it.
  const canManageModerators =
    Boolean(isSiteAdmin) ||
    (createdBy !== null && createdBy === user?.id) ||
    myRole === 'admin'

  const activeBans = useMemo(() => (bans ?? []).filter((b) => isActive(b)), [bans])
  const restrictedIds = useMemo(
    () => new Map(activeBans.map((b) => [b.user_id, b.kind])),
    [activeBans],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members ?? []
    return (members ?? []).filter(
      (m) =>
        m.profile?.username.toLowerCase().includes(q) ||
        m.profile?.display_name?.toLowerCase().includes(q),
    )
  }, [members, query])

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">
            Restricted users
          </h2>
          <p className="text-sm text-muted-foreground">
            Muted members can read but not post; banned users are removed and can’t
            rejoin.
          </p>
        </div>

        {isLoadingBans && <Skeleton className="h-16 rounded-xl" />}
        {!isLoadingBans && activeBans.length === 0 && (
          <p className="rounded-xl border border-dashed border-border-strong/70 px-4 py-5 text-center text-sm text-muted-foreground">
            Nobody is restricted right now.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {activeBans.map((ban) => (
            <li
              key={ban.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <Person profile={ban.user} fallbackId={ban.user_id} />
              </div>
              <div className="flex min-w-0 flex-col items-start gap-1 sm:items-end">
                <Badge variant={ban.kind === 'ban' ? 'danger' : 'warning'}>
                  {ban.kind === 'ban' ? (
                    <Ban className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <VolumeX className="h-3 w-3" aria-hidden="true" />
                  )}
                  {ban.kind === 'ban' ? 'Banned' : 'Muted'}{' '}
                  {ban.expires_at
                    ? `until ${format(new Date(ban.expires_at), 'MMM d')}`
                    : 'permanently'}
                </Badge>
                {ban.reason && (
                  <span className="max-w-64 truncate text-xs text-muted-foreground">
                    {ban.reason}
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={lift.isPending}
                onClick={() => lift.mutate(ban.id)}
              >
                Lift
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              Members
            </h2>
            <p className="text-sm text-muted-foreground">
              {members ? `${members.length.toLocaleString()} shown` : 'Loading members…'}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a member"
              className="pl-9"
              aria-label="Find a member"
            />
          </div>
        </div>

        {isLoadingMembers && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        )}

        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
          {filtered.map((member) => {
            const isStaff = member.role !== 'member'
            const isSelf = member.user_id === user?.id
            const restriction = restrictedIds.get(member.user_id)
            const name =
              member.profile?.display_name ?? member.profile?.username ?? 'this user'
            return (
              <li
                key={member.user_id}
                className="flex flex-wrap items-center gap-3 bg-surface px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <Person profile={member.profile} fallbackId={member.user_id} />
                </div>
                <span className="text-xs text-subtle-foreground">
                  Joined{' '}
                  {formatDistanceToNowStrict(new Date(member.joined_at), {
                    addSuffix: true,
                  })}
                </span>
                {isStaff && (
                  <Badge variant="primary">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    {member.role === 'admin' ? 'Admin' : 'Moderator'}
                  </Badge>
                )}
                {restriction === 'mute' && <Badge variant="warning">Muted</Badge>}
                {member.role === 'member' && !restriction && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={setRole.isPending}
                    onClick={() => {
                      if (window.confirm(`Make ${name} a moderator of this community?`)) {
                        setRole.mutate({ userId: member.user_id, role: 'moderator' })
                      }
                    }}
                  >
                    <ShieldPlus className="h-4 w-4" /> Make moderator
                  </Button>
                )}
                {member.role === 'moderator' && (isSelf || canManageModerators) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={setRole.isPending}
                    onClick={() => {
                      const question = isSelf
                        ? 'Step down as a moderator? You will lose access to these settings.'
                        : `Remove ${name} as a moderator?`
                      if (window.confirm(question)) {
                        setRole.mutate({ userId: member.user_id, role: 'member' })
                      }
                    }}
                  >
                    <ShieldMinus className="h-4 w-4" />{' '}
                    {isSelf ? 'Step down' : 'Remove moderator'}
                  </Button>
                )}
                {!isStaff && !isSelf && (
                  <div className="flex items-center gap-1">
                    <RestrictUserDialog
                      communityId={communityId}
                      userId={member.user_id}
                      userName={name}
                      defaultKind="mute"
                      trigger={
                        <Button type="button" variant="ghost" size="sm">
                          <VolumeX className="h-4 w-4" /> Mute
                        </Button>
                      }
                    />
                    <RestrictUserDialog
                      communityId={communityId}
                      userId={member.user_id}
                      userName={name}
                      defaultKind="ban"
                      trigger={
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="hover:text-danger"
                        >
                          <Ban className="h-4 w-4" /> Ban
                        </Button>
                      }
                    />
                  </div>
                )}
              </li>
            )
          })}
          {!isLoadingMembers && filtered.length === 0 && (
            <li className="bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
              No members match “{query}”.
            </li>
          )}
        </ul>
      </section>
    </div>
  )
}
