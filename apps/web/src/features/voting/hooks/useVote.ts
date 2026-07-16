import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import { castVote, type VoteTarget } from '../api/votes'

/**
 * Local optimistic vote state for a single post/comment. Score/vote reset whenever the
 * underlying query data changes (e.g. a realtime update lands), so this never drifts
 * permanently out of sync even though it isn't wired into the global query cache.
 */
export function useVote(
  target: VoteTarget,
  initialScore: number,
  initialUserVote: 0 | 1 | -1 = 0,
) {
  const { user } = useAuth()
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<0 | 1 | -1>(initialUserVote)

  useEffect(() => setScore(initialScore), [initialScore])
  useEffect(() => setUserVote(initialUserVote), [initialUserVote])

  const mutation = useMutation({
    mutationFn: (value: 1 | -1) => castVote(target, user!.id, value),
  })

  function vote(value: 1 | -1) {
    if (!user) {
      toast({
        title: 'Sign in to vote',
        description: 'Create a free account to join the conversation.',
      })
      return
    }

    const prevVote = userVote
    const prevScore = score
    const nextVote: 0 | 1 | -1 = userVote === value ? 0 : value

    setUserVote(nextVote)
    setScore(prevScore + (nextVote - prevVote))

    mutation.mutate(value, {
      onError: () => {
        setUserVote(prevVote)
        setScore(prevScore)
        toast({
          title: 'Vote failed',
          description: 'Please try again.',
          variant: 'danger',
        })
      },
    })
  }

  return { score, userVote, vote, isVoting: mutation.isPending }
}
