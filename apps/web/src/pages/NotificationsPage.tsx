import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { formatDistanceToNowStrict } from 'date-fns'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/hooks/useNotifications'
import type { NotificationWithActor } from '@/features/notifications/api/notifications'

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
      return 'New message from a moderator'
    case 'announcement':
      return 'New community announcement'
    case 'badge_earned':
      return 'You earned a new badge'
    default:
      return 'New notification'
  }
}

export default function NotificationsPage() {
  const { notifications, unreadCount } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <div className="mx-auto max-w-2xl">
      <Helmet>
        <title>Notifications · CareCircle</title>
      </Helmet>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          You&apos;re all caught up.
        </p>
      )}

      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {notifications.map((notification) => (
          <Link
            key={notification.id}
            to={
              notification.target_type === 'post' && notification.target_id
                ? `/posts/${notification.target_id}`
                : '#'
            }
            onClick={() => {
              if (!notification.is_read) markRead.mutate(notification.id)
            }}
            className={cn(
              'flex flex-col gap-0.5 p-4 hover:bg-surface-hover',
              !notification.is_read && 'bg-primary/5',
            )}
          >
            <span className="text-sm text-foreground">
              {notificationMessage(notification)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNowStrict(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
