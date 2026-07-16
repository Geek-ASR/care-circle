import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useVote } from '../hooks/useVote'
import type { VoteTarget } from '../api/votes'

interface VoteControlProps {
  target: VoteTarget
  score: number
  userVote?: 0 | 1 | -1
  orientation?: 'vertical' | 'horizontal'
  size?: 'sm' | 'md'
}

export function VoteControl({
  target,
  score,
  userVote = 0,
  orientation = 'vertical',
  size = 'md',
}: VoteControlProps) {
  const vote = useVote(target, score, userVote)
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
      )}
    >
      <button
        type="button"
        aria-pressed={vote.userVote === 1}
        aria-label="Upvote"
        onClick={() => vote.vote(1)}
        className={cn(
          'rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-primary',
          vote.userVote === 1 && 'text-primary',
        )}
      >
        <ChevronUp className={iconSize} />
      </button>
      <span
        className={cn(
          'min-w-4 text-center text-xs font-semibold tabular-nums',
          vote.userVote === 1 && 'text-primary',
          vote.userVote === -1 && 'text-danger',
          vote.userVote === 0 && 'text-foreground',
        )}
      >
        {vote.score}
      </span>
      <button
        type="button"
        aria-pressed={vote.userVote === -1}
        aria-label="Downvote"
        onClick={() => vote.vote(-1)}
        className={cn(
          'rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-danger',
          vote.userVote === -1 && 'text-danger',
        )}
      >
        <ChevronDown className={iconSize} />
      </button>
    </div>
  )
}
