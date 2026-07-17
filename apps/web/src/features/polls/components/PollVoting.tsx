import { Check } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'
import { usePollResults, useVotePoll } from '../hooks/usePolls'

export function PollVoting({ postId }: { postId: string }) {
  const { user } = useAuth()
  const { data, isLoading } = usePollResults(postId, true)
  const voteMutation = useVotePoll(postId)

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
    )
  }

  const hasVoted = data.myVoteOptionId !== null

  return (
    <div className="flex flex-col gap-2">
      {data.options.map((option) => {
        const percent =
          data.totalVotes === 0
            ? 0
            : Math.round((option.voteCount / data.totalVotes) * 100)
        const isMine = option.id === data.myVoteOptionId

        return (
          <button
            key={option.id}
            type="button"
            disabled={!user || voteMutation.isPending}
            onClick={() => voteMutation.mutate(option.id)}
            className={cn(
              'relative flex w-full items-center justify-between overflow-hidden rounded-md border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed',
              isMine
                ? 'border-primary text-foreground'
                : 'border-border text-foreground hover:bg-surface-hover',
            )}
          >
            {hasVoted && (
              <span
                className="absolute inset-y-0 left-0 -z-10 bg-primary/10"
                style={{ width: `${percent}%` }}
                aria-hidden="true"
              />
            )}
            <span className="flex items-center gap-2">
              {isMine && (
                <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              )}
              {option.option_text}
            </span>
            {hasVoted && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {percent}% · {option.voteCount}
              </span>
            )}
          </button>
        )
      })}
      <p className="text-xs text-muted-foreground">
        {data.totalVotes} {data.totalVotes === 1 ? 'vote' : 'votes'}
        {!user && ' · Sign in to vote'}
      </p>
    </div>
  )
}
