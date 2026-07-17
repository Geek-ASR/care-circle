import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage, Skeleton } from '@/components/ui'
import type { FollowListEntry } from '../types'

export function FollowListItems({
  entries,
  isLoading,
  emptyMessage,
}: {
  entries: FollowListEntry[] | undefined
  isLoading: boolean
  emptyMessage: string
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          to={`/u/${entry.username}`}
          className="flex items-center gap-3 p-3 hover:bg-surface-hover"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={entry.avatar_url ?? undefined} alt="" />
            <AvatarFallback>
              {(entry.display_name ?? entry.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {entry.display_name ?? entry.username}
            </p>
            <p className="truncate text-xs text-muted-foreground">@{entry.username}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
