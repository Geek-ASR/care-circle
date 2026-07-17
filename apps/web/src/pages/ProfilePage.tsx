import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CalendarDays, Globe, MapPin, MessageCircle } from 'lucide-react'
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
import { useIsSiteAdmin } from '@/features/moderation/hooks/useModeration'
import { BadgeList } from '@/features/badges/components/BadgeList'
import { AwardBadgeDialog } from '@/features/badges/components/AwardBadgeDialog'
import { AchievementList } from '@/features/achievements/components/AchievementList'
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
        <Skeleton className="h-32" />
        <Skeleton className="h-24" />
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

      <div>
        {profile.banner_url && (
          <div className="h-32 w-full overflow-hidden rounded-lg bg-surface-hover">
            <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div
          className={
            profile.banner_url
              ? '-mt-8 flex items-end gap-4 px-2'
              : 'flex items-end gap-4'
          }
        >
          <Avatar className="h-16 w-16 border-4 border-background">
            <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">
              {profile.display_name ?? profile.username}
            </h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
          {user && user.id !== profile.id && (
            <div className="flex items-center gap-2">
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
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <Link
            to={`/u/${profile.username}/followers`}
            className="text-foreground hover:underline"
          >
            <span className="font-semibold">{profile.follower_count}</span>{' '}
            <span className="text-muted-foreground">followers</span>
          </Link>
          <Link
            to={`/u/${profile.username}/following`}
            className="text-foreground hover:underline"
          >
            <span className="font-semibold">{profile.following_count}</span>{' '}
            <span className="text-muted-foreground">following</span>
          </Link>
        </div>

        {profile.bio ? (
          <p className="mt-4 text-sm text-foreground">{profile.bio}</p>
        ) : (
          <p className="mt-4 text-sm italic text-muted-foreground">No bio yet.</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="primary">{profile.reputation_score} reputation</Badge>
          {profile.verified_diagnosis && (
            <Badge variant="success">Verified diagnosis</Badge>
          )}
        </div>

        <div className="mt-3">
          <BadgeList userId={profile.id} />
        </div>
      </div>

      <AchievementList userId={profile.id} showInProgress={user?.id === profile.id} />

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Posts
        </h2>

        {isLoadingPosts && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        )}

        {!isLoadingPosts && posts?.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {profile.display_name ?? profile.username} hasn&apos;t posted yet.
          </p>
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
