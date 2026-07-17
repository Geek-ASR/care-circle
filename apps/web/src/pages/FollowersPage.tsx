import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui'
import { useProfileByUsername } from '@/features/profile/hooks/useProfile'
import { useFollowers } from '@/features/follows/hooks/useFollows'
import { FollowListItems } from '@/features/follows/components/FollowListItems'
import NotFoundPage from './NotFoundPage'

export default function FollowersPage() {
  const { username } = useParams<{ username: string }>()
  const { data: profile, isLoading: isLoadingProfile } = useProfileByUsername(username)
  const { data: entries, isLoading: isLoadingList } = useFollowers(profile?.id)

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16" />
      </div>
    )
  }

  if (!profile) return <NotFoundPage />

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Helmet>
        <title>Followers · {profile.display_name ?? profile.username} · CareCircle</title>
      </Helmet>
      <h1 className="text-xl font-semibold text-foreground">
        {profile.display_name ?? profile.username}&apos;s followers
      </h1>
      <FollowListItems
        entries={entries}
        isLoading={isLoadingList}
        emptyMessage="No followers yet."
      />
    </div>
  )
}
