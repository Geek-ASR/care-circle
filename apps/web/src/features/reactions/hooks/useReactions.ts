import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import { toggleReaction } from '../api/reactions'

export function useToggleReaction(postId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      toggleReaction(commentId, user!.id, emoji),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comment-reactions', postId] })
    },
    onError: () => {
      toast({ title: 'Could not update reaction', variant: 'danger' })
    },
  })
}
