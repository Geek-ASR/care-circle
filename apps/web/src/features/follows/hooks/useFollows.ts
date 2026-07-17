import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import { createNotification } from '@/features/notifications/api/notifications'
import {
  followUser,
  isFollowing,
  listFollowedUserIds,
  listFollowers,
  listFollowing,
  unfollowUser,
} from '../api/follows'

export function useIsFollowing(followeeId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['follows', 'is-following', user?.id ?? 'anon', followeeId],
    queryFn: () => isFollowing(user!.id, followeeId as string),
    enabled: Boolean(user && followeeId && followeeId !== user.id),
  })
}

export function useToggleFollow(followeeId: string, username: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (currentlyFollowing: boolean) => {
      if (currentlyFollowing) {
        await unfollowUser(user!.id, followeeId)
      } else {
        await followUser(user!.id, followeeId)
        await createNotification({
          userId: followeeId,
          actorId: user!.id,
          type: 'follow',
          targetType: 'user',
          targetId: followeeId,
        }).catch(() => {})
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['follows', 'is-following', user?.id ?? 'anon', followeeId],
      })
      void queryClient.invalidateQueries({ queryKey: ['profile', 'username', username] })
    },
    onError: () => {
      toast({
        title: 'Could not update follow status',
        description: 'Please try again in a moment.',
        variant: 'danger',
      })
    },
  })
}

export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: ['follows', 'followers', userId],
    queryFn: () => listFollowers(userId as string),
    enabled: Boolean(userId),
  })
}

export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ['follows', 'following', userId],
    queryFn: () => listFollowing(userId as string),
    enabled: Boolean(userId),
  })
}

export function useFollowedUserIds() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['follows', 'followed-ids', user?.id],
    queryFn: () => listFollowedUserIds(user!.id),
    enabled: Boolean(user),
  })
}
