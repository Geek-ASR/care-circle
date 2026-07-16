import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToTable } from '@/services/realtime'
import { queryKeys } from '@/services/queryClient'
import type { Notification } from '@/types/database'
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications'

export function useNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id

  const listQuery = useQuery({
    queryKey: userId ? queryKeys.notifications(userId) : ['notifications', 'signed-out'],
    queryFn: () => listNotifications(userId as string),
    enabled: Boolean(userId),
  })

  const unreadQuery = useQuery({
    queryKey: userId
      ? ['notifications', userId, 'unread-count']
      : ['notifications', 'signed-out'],
    queryFn: () => getUnreadCount(userId as string),
    enabled: Boolean(userId),
  })

  useEffect(() => {
    if (!userId) return
    return subscribeToTable<Notification>(
      `notifications:${userId}`,
      { table: 'notifications', event: 'INSERT', filter: `user_id=eq.${userId}` },
      () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) })
        void queryClient.invalidateQueries({
          queryKey: ['notifications', userId, 'unread-count'],
        })
      },
    )
  }, [userId, queryClient])

  return {
    notifications: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    unreadCount: unreadQuery.data ?? 0,
  }
}

export function useMarkNotificationRead() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      if (!user) return
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) })
      void queryClient.invalidateQueries({
        queryKey: ['notifications', user.id, 'unread-count'],
      })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markAllNotificationsRead(user!.id),
    onSuccess: () => {
      if (!user) return
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) })
      void queryClient.invalidateQueries({
        queryKey: ['notifications', user.id, 'unread-count'],
      })
    },
  })
}
