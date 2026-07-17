import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import { blockUser, isBlocked, listBlockedUsers, unblockUser } from '../api/blocks'

export function useIsBlocked(blockedId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['blocks', 'is-blocked', user?.id, blockedId],
    queryFn: () => isBlocked(user!.id, blockedId as string),
    enabled: Boolean(user && blockedId && blockedId !== user.id),
  })
}

export function useToggleBlock(blockedId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (currentlyBlocked: boolean) =>
      currentlyBlocked
        ? unblockUser(user!.id, blockedId)
        : blockUser(user!.id, blockedId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['blocks', 'is-blocked', user?.id, blockedId],
      })
      void queryClient.invalidateQueries({ queryKey: ['blocks', 'list', user?.id] })
    },
    onError: () => {
      toast({
        title: 'Could not update block status',
        description: 'Please try again in a moment.',
        variant: 'danger',
      })
    },
  })
}

export function useBlockedUsers() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['blocks', 'list', user?.id],
    queryFn: () => listBlockedUsers(user!.id),
    enabled: Boolean(user),
  })
}
