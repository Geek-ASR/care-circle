import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  BadgeCheck,
  CalendarDays,
  Globe,
  MapPin,
  MessageCircle,
  PenSquare,
  Settings,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Skeleton,
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useProfileByUsername } from '@/features/profile/hooks/useProfile'
import { usePostsByAuthor } from '@/features/posts/hooks/usePosts'
import { PostCard } from '@/features/posts/components/PostCard'
import { useStartConversation } from '@/features/chat/hooks/useChat'
import { FollowButton } from '@/features/follows/components/FollowButton'
import { BlockButton } from '@/features/blocks/components/BlockButton'
import { useIsSiteAdmin } from '@/features/moderation/hooks/useModeration'
import { BadgeList } from '@/features/badges/components/BadgeList'
import { AwardBadgeDialog } from '@/features/badges/components/AwardBadgeDialog'
import { AchievementList } from '@/features/achievements/components/AchievementList'
import { EmptyState } from '@/components/EmptyState'
import { avatarGradient } from '@/utils/avatarColor'
import NotFoundPage from './NotFoundPage'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfileByUsername(username)
  const { data: posts, isLoading: isLoadingPosts } = usePostsByAuthor(profile?.id)
  const startConversation = useStartConversation()
  const { data: isAdmin } = useIsSiteAdmin()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    )
  }

  if (!profile) return <NotFoundPage />

  const initials = (profile.display_name ?? profile.username).charAt(0).toUpperCase()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Helmet>
        <title>{profile.display_name ?? profile.username} · CareCircle</title>
      </Helmet>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <div className="relative h-28 w-full sm:h-36">
          {profile.banner_url ? (
            <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div aria-hidden="true" className="relative h-full w-full bg-surface-sunken">
              <div
                className={`absolute inset-0 opacity-35 ${avatarGradient(profile.username)}`}
              />
              <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent" />
              <div className="bg-dot-grid absolute inset-0 opacity-50" />
            </div>
          )}
        </div>

        <div className="px-5 pb-6 sm:px-7">
          <div className="relative -mt-12 flex flex-wrap items-end justify-between gap-4">
            <Avatar className="h-24 w-24 border-4 border-surface shadow-md">
              <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
              <AvatarFallback
                className={`${avatarGradient(profile.username)} font-display text-3xl font-bold text-white`}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            {user && user.id !== profile.id && (
              <div className="flex flex-wrap items-center gap-2">
                <FollowButton userId={profile.id} username={profile.username} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startConversation.mutate(profile.id)}
                  disabled={startConversation.isPending}
                >
                  <MessageCircle className="h-4 w-4" /> Message
                </Button>
                {isAdmin && <AwardBadgeDialog userId={profile.id} />}
                <BlockButton userId={profile.id} />
              </div>
            )}
            {user && user.id === profile.id && (
              <Button asChild size="sm" variant="outline">
                <Link to="/settings">
                  <Settings className="h-4 w-4" /> Edit profile
                </Link>
              </Button>
            )}
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {profile.display_name ?? profile.username}
              </h1>
              {profile.verified_diagnosis && (
                <Badge variant="success">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified
                  diagnosis
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>

          {profile.bio ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground">
              {profile.bio}
            </p>
          ) : (
            <p className="mt-4 text-sm italic text-muted-foreground">No bio yet.</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {profile.country && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.country}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Globe className="h-3.5 w-3.5" />{' '}
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> Joined{' '}
              {format(new Date(profile.created_at), 'MMMM yyyy')}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-surface-sunken">
            <Link
              to={`/u/${profile.username}/followers`}
              className="flex flex-col items-center gap-0.5 py-3 transition-colors hover:bg-surface-hover"
            >
              <span className="font-display text-lg font-bold text-foreground">
                {profile.follower_count.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">Followers</span>
            </Link>
            <Link
              to={`/u/${profile.username}/following`}
              className="flex flex-col items-center gap-0.5 py-3 transition-colors hover:bg-surface-hover"
            >
              <span className="font-display text-lg font-bold text-foreground">
                {profile.following_count.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">Following</span>
            </Link>
            <div className="flex flex-col items-center gap-0.5 py-3">
              <span className="font-display text-lg font-bold text-primary">
                {profile.reputation_score.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">Reputation</span>
            </div>
          </div>

          <div className="mt-4">
            <BadgeList userId={profile.id} />
          </div>
        </div>
      </section>

      <AchievementList userId={profile.id} showInProgress={user?.id === profile.id} />

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Posts</h2>

        {isLoadingPosts && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        )}

        {!isLoadingPosts && posts?.length === 0 && (
          <EmptyState
            icon={PenSquare}
            title="No posts yet"
            description={`${profile.display_name ?? profile.username} hasn't posted anything yet.`}
          />
        )}

        <div className="flex flex-col gap-3">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}
