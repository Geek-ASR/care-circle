import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToTable } from '@/services/realtime'
import type { PollVote } from '@/types/database'
import { getPollResults, votePoll } from '../api/polls'

export function usePollResults(postId: string | undefined, isPoll: boolean) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const enabled = Boolean(postId) && isPoll

  const query = useQuery({
    queryKey: ['poll', postId],
    queryFn: () => getPollResults(postId as string, user?.id),
    enabled,
  })

  useEffect(() => {
    if (!enabled || !postId) return
    return subscribeToTable<PollVote>(
      `poll:${postId}`,
      { table: 'poll_votes', filter: `post_id=eq.${postId}` },
      () => {
        void queryClient.invalidateQueries({ queryKey: ['poll', postId] })
      },
    )
  }, [enabled, postId, queryClient])

  return query
}

export function useVotePoll(postId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pollOptionId: string) => votePoll(postId, pollOptionId, user!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['poll', postId] })
    },
  })
}
