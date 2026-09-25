import { useState } from 'react'
import { format } from 'date-fns'
import { ShieldCheck, UserPlus } from 'lucide-react'
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useSiteRoleGrants, useSiteRoleMutations } from '../hooks/useGovernance'
import { PersonLink } from './ActivityRow'

const ROLES = [
  {
    value: 'moderator',
    label: 'Site moderator',
    help: 'Reviews reports across all communities.',
  },
  {
    value: 'admin',
    label: 'Site admin',
    help: 'Full access, including approving communities and granting roles.',
  },
]

export function SiteRolesPanel() {
  const { user } = useAuth()
  const { data: grants, isLoading } = useSiteRoleGrants(true)
  const { grant, revoke } = useSiteRoleMutations()
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('moderator')

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface-sunken p-4"
        onSubmit={(e) => {
          e.preventDefault()
          grant.mutate({ username, role }, { onSuccess: () => setUsername('') })
        }}
      >
        <p className="text-sm font-medium text-foreground">Grant a site role</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grant-username">Username</Label>
            <Input
              id="grant-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grant-role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="grant-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={!username.trim() || grant.isPending}>
            <UserPlus className="h-4 w-4" /> Grant
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {ROLES.find((r) => r.value === role)?.help} Every change is recorded in the
          audit log.
        </p>
      </form>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Current staff
        </h3>
        {isLoading && <Skeleton className="h-24 rounded-xl" />}
        {grants && grants.length === 0 && (
          <p className="text-sm text-muted-foreground">No site roles granted yet.</p>
        )}
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
          {grants?.map((g) => (
            <li
              key={`${g.user?.id}-${g.role}`}
              className="flex flex-wrap items-center gap-3 bg-surface px-4 py-3"
            >
              <span className="min-w-0 flex-1 text-sm">
                <PersonLink profile={g.user} fallback="Hidden profile" />
                {g.user && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    @{g.user.username}
                  </span>
                )}
              </span>
              <Badge variant={g.role === 'admin' ? 'accent' : 'primary'}>
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                {g.role === 'admin' ? 'Admin' : 'Moderator'}
              </Badge>
              <span className="text-xs text-subtle-foreground">
                since {format(new Date(g.granted_at), 'MMM d, yyyy')}
              </span>
              {g.user && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="hover:text-danger"
                  disabled={revoke.isPending}
                  onClick={() => {
                    const self = g.user!.id === user?.id
                    const question = self
                      ? `Remove your own ${g.role} role? You may lose access to this page.`
                      : `Revoke ${g.user!.username}'s ${g.role} role?`
                    if (window.confirm(question)) {
                      revoke.mutate({ userId: g.user!.id, role: g.role })
                    }
                  }}
                >
                  Revoke
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
