import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import { cn } from '@/utils/cn'
import { REACTION_EMOJIS, type ReactionSummary } from '../api/reactions'
import { useToggleReaction } from '../hooks/useReactions'

export function ReactionBar({
  postId,
  commentId,
  reactions,
}: {
  postId: string
  commentId: string
  reactions: ReactionSummary[]
}) {
  const { user } = useAuth()
  const toggle = useToggleReaction(postId)

  function handleClick(emoji: string) {
    if (!user) {
      toast({ title: 'Sign in to react' })
      return
    }
    toggle.mutate({ commentId, emoji })
  }

  const byEmoji = new Map(reactions.map((r) => [r.emoji, r]))

  return (
    <div className="flex flex-wrap items-center gap-1">
      {REACTION_EMOJIS.map((emoji) => {
        const summary = byEmoji.get(emoji)
        const count = summary?.count ?? 0
        const reacted = summary?.reactedByMe ?? false

        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleClick(emoji)}
            aria-pressed={reacted}
            aria-label={`React with ${emoji}`}
            className={cn(
              'flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-colors',
              reacted
                ? 'border-primary/50 bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:bg-surface-hover',
              count === 0 && !reacted && 'opacity-50 hover:opacity-100',
            )}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
