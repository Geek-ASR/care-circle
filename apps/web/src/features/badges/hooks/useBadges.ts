import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { createNotification } from '@/features/notifications/api/notifications'
import { toast } from '@/store/toastStore'
import { awardBadge, listAllBadges, listUserBadges } from '../api/badges'

export function useAllBadges() {
  return useQuery({
    queryKey: ['badges', 'all'],
    queryFn: listAllBadges,
    staleTime: 10 * 60_000,
  })
}

export function useUserBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ['badges', 'user', userId],
    queryFn: () => listUserBadges(userId as string),
    enabled: Boolean(userId),
  })
}

export function useAwardBadge(userId: string) {
  const { user: admin } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (badgeId: string) => {
      await awardBadge(userId, badgeId)
      await createNotification({
        userId,
        actorId: admin!.id,
        type: 'badge_earned',
        targetType: 'user',
        targetId: badgeId,
      }).catch(() => {})
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['badges', 'user', userId] })
      toast({ title: 'Badge awarded', variant: 'success' })
    },
    onError: () => {
      toast({ title: 'Could not award badge', variant: 'danger' })
    },
  })
}
