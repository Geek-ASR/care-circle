import { Button } from '@/components/ui'
import { useIsFollowing, useToggleFollow } from '../hooks/useFollows'

export function FollowButton({ userId, username }: { userId: string; username: string }) {
  const { data: following, isLoading } = useIsFollowing(userId)
  const toggle = useToggleFollow(userId, username)

  if (isLoading) {
    return (
      <Button size="sm" variant="outline" disabled>
        …
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      variant={following ? 'outline' : 'primary'}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate(Boolean(following))}
    >
      {following ? 'Following' : 'Follow'}
    </Button>
  )
}
