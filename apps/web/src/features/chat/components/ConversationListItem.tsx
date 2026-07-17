import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui'
import { cn } from '@/utils/cn'
import type { ConversationSummary } from '../types'

export function ConversationListItem({
  conversation,
}: {
  conversation: ConversationSummary
}) {
  const other = conversation.otherParticipants[0]
  const name = other?.display_name ?? other?.username ?? 'Deleted user'
  const initials = name.charAt(0).toUpperCase()
  const hasUnread = conversation.unreadCount > 0

  return (
    <Link
      to={`/messages/${conversation.id}`}
      className="flex items-center gap-3 rounded-md p-3 hover:bg-surface-hover"
    >
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarImage src={other?.avatar_url ?? undefined} alt="" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm',
              hasUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground',
            )}
          >
            {name}
          </span>
          {conversation.last_message_at && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDistanceToNowStrict(new Date(conversation.last_message_at), {
                addSuffix: false,
              })}
            </span>
          )}
        </div>
        <p
          className={cn(
            'truncate text-sm',
            hasUnread ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {conversation.last_message_preview ?? 'No messages yet'}
        </p>
      </div>
      {hasUnread && (
        <Badge
          variant="primary"
          className="h-5 min-w-5 shrink-0 justify-center px-1.5 text-[10px]"
        >
          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
        </Badge>
      )}
    </Link>
  )
}
