import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { cn } from '@/utils/cn'
import type { MessageWithSender } from '../types'

export function MessageBubble({
  message,
  isOwn,
}: {
  message: MessageWithSender
  isOwn: boolean
}) {
  const name = message.sender?.display_name ?? message.sender?.username ?? '[deleted]'
  const initials = name.charAt(0).toUpperCase()

  return (
    <div className={cn('flex items-end gap-2', isOwn && 'flex-row-reverse')}>
      {!isOwn && (
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={message.sender?.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex max-w-[75%] flex-col gap-0.5', isOwn && 'items-end')}>
        <div
          className={cn(
            'whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm',
            isOwn
              ? 'rounded-br-sm bg-primary text-primary-foreground'
              : 'rounded-bl-sm bg-surface-hover text-foreground',
          )}
        >
          {message.body}
        </div>
        <span className="px-1 text-[11px] text-muted-foreground">
          {format(new Date(message.created_at), 'h:mm a')}
        </span>
      </div>
    </div>
  )
}
