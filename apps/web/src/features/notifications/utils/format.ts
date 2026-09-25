import {
  AtSign,
  Award,
  Bell,
  Megaphone,
  MessageSquare,
  ShieldAlert,
  ThumbsUp,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import type { NotificationWithActor } from '../api/notifications'

/** One-line summary of a notification, shared by the bell dropdown and the page. */
export function notificationMessage(notification: NotificationWithActor): string {
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
      return notification.target_type === 'community'
        ? 'Moderators changed your access to a community'
        : 'New message from a moderator'
    case 'announcement':
      return 'New community announcement'
    case 'badge_earned':
      return 'You earned a new badge'
    default:
      return 'New notification'
  }
}

export function notificationHref(notification: NotificationWithActor): string {
  if (notification.target_id) {
    if (notification.target_type === 'post') return `/posts/${notification.target_id}`
    if (notification.target_type === 'community') {
      return `/community/${notification.target_id}`
    }
  }
  return '/notifications'
}

const ICONS: Record<string, LucideIcon> = {
  reply: MessageSquare,
  mention: AtSign,
  upvote: ThumbsUp,
  follow: UserPlus,
  moderator_message: ShieldAlert,
  announcement: Megaphone,
  badge_earned: Award,
}

export function notificationIcon(notification: NotificationWithActor): LucideIcon {
  return ICONS[notification.type] ?? Bell
}
