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
import {
  notificationHref,
  notificationIcon,
  notificationMessage,
} from '@/features/notifications/utils/format'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { Bell, CheckCheck } from 'lucide-react'

export default function NotificationsPage() {
  const { notifications, unreadCount } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <div className="mx-auto max-w-2xl">
      <Helmet>
        <title>Notifications · CareCircle</title>
      </Helmet>
      <PageHeader
        icon={Bell}
        title="Notifications"
        description="Replies, mentions, follows and badges — all in one place."
        className="mb-6"
        actions={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          )
        }
      />

      {notifications.length === 0 && (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="Replies, mentions, new followers and badges will show up here."
        />
      )}

      {notifications.length > 0 && (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
          {notifications.map((notification) => {
            const Icon = notificationIcon(notification)
            return (
              <Link
                key={notification.id}
                to={notificationHref(notification)}
                onClick={() => {
                  if (!notification.is_read) markRead.mutate(notification.id)
                }}
                className={cn(
                  'flex items-start gap-3 p-4 transition-colors hover:bg-surface-hover',
                  !notification.is_read && 'bg-primary/[0.05]',
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    notification.is_read
                      ? 'bg-surface-hover text-muted-foreground'
                      : 'bg-primary/12 text-primary',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={cn(
                      'text-sm',
                      notification.is_read
                        ? 'text-muted-foreground'
                        : 'font-medium text-foreground',
                    )}
                  >
                    {notificationMessage(notification)}
                  </span>
                  <span className="text-xs text-subtle-foreground">
                    {formatDistanceToNowStrict(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </span>
                {!notification.is_read && (
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                    aria-label="Unread"
                  />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
