import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import { Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications'
import type { NotificationWithActor } from '../api/notifications'

function notificationMessage(notification: NotificationWithActor): string {
  const actor =
    notification.actor?.display_name ?? notification.actor?.username ?? 'Someone'
  switch (notification.type) {
    case 'reply':
      return `${actor} replied to you`
    case 'mention':
      return `${actor} mentioned you`
    case 'upvote':
      return `${actor} upvoted your post`
    case 'follow':
      return `${actor} started following you`
    case 'moderator_message':
      return `New message from a moderator`
    case 'announcement':
      return `New community announcement`
    case 'badge_earned':
      return `You earned a new badge`
    default:
      return 'New notification'
  }
}

function notificationHref(notification: NotificationWithActor): string {
  if (notification.target_type === 'post' && notification.target_id) {
    return `/posts/${notification.target_id}`
  }
  return '/notifications'
}

export function NotificationBell() {
  const { user } = useAuth()
  const { notifications, unreadCount } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="primary"
              className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1 text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        )}
        {notifications.map((notification) => (
          <DropdownMenuItem key={notification.id} asChild>
            <Link
              to={notificationHref(notification)}
              onClick={() => {
                if (!notification.is_read) markRead.mutate(notification.id)
              }}
              className="flex flex-col items-start gap-0.5"
            >
              <span
                className={
                  notification.is_read ? 'text-muted-foreground' : 'text-foreground'
                }
              >
                {notificationMessage(notification)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNowStrict(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
