import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage, Button, Skeleton } from '@/components/ui'
import { useBlockedUsers, useToggleBlock } from '../hooks/useBlocks'

function UnblockButton({ userId }: { userId: string }) {
  const toggle = useToggleBlock(userId)
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={toggle.isPending}
      onClick={() => toggle.mutate(true)}
    >
      Unblock
    </Button>
  )
}

export function BlockedUsersList() {
  const { data: blocked, isLoading } = useBlockedUsers()

  if (isLoading) {
    return <Skeleton className="h-16" />
  }

  if (!blocked || blocked.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">You haven&apos;t blocked anyone.</p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {blocked.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between gap-3 p-3">
          <Link to={`/u/${entry.username}`} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={entry.avatar_url ?? undefined} alt="" />
              <AvatarFallback>
                {(entry.display_name ?? entry.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground">
              {entry.display_name ?? entry.username}
            </span>
          </Link>
          <UnblockButton userId={entry.id} />
        </div>
      ))}
    </div>
  )
}
