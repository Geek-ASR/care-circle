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
import { notificationHref, notificationMessage } from '../utils/format'

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
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] justify-center bg-secondary px-1 text-[10px] font-bold text-secondary-foreground ring-2 ring-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2.5 py-2">
          <DropdownMenuLabel className="p-0 font-display text-sm text-foreground">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-2 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
          </div>
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
                  notification.is_read
                    ? 'text-muted-foreground'
                    : 'font-medium text-foreground'
                }
              >
                {!notification.is_read && (
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full bg-primary align-middle"
                    aria-hidden="true"
                  />
                )}
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
