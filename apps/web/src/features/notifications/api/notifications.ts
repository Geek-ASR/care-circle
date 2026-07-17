import { supabase } from '@/services/supabaseClient'
import type { Notification, NotificationType } from '@/types/database'

export interface NotificationWithActor extends Notification {
  actor: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface CreateNotificationInput {
  userId: string
  actorId: string
  type: NotificationType
  targetType: 'post' | 'comment' | 'user'
  targetId: string
}

/**
 * There is no custom backend to generate notifications server-side, so the RLS policy on
 * `notifications` (see supabase/migrations/20260101000010_rls_policies.sql) requires the
 * inserting client to name itself as `actor_id` — it can still write a row for a different
 * `user_id` (the recipient). This is the one place that INSERT happens; every action that
 * should notify someone calls this, wrapped so a failure here never blocks the action itself.
 *
 * Checks the recipient's notification_settings first (opt-out: an absent or `true` value
 * means "notify", only an explicit `false` skips it) - profiles are publicly readable to
 * authenticated callers, so this is a plain read, not a privileged check.
 */
export async function createNotification(input: CreateNotificationInput) {
  if (input.userId === input.actorId) return // never notify yourself

  const { data: recipient } = await supabase
    .from('profiles')
    .select('notification_settings')
    .eq('id', input.userId)
    .maybeSingle()

  const settings = (recipient?.notification_settings ?? {}) as Record<string, boolean>
  if (settings[input.type] === false) return

  const { error } = await supabase.from('notifications').insert({
    user_id: input.userId,
    actor_id: input.actorId,
    type: input.type,
    target_type: input.targetType,
    target_id: input.targetId,
  })
  if (error) throw error
}

export async function listNotifications(
  userId: string,
  limit = 20,
): Promise<NotificationWithActor[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(
      '*, actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url)',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as unknown as NotificationWithActor[]
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count ?? 0
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
}
