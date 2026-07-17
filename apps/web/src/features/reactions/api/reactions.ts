import { supabase } from '@/services/supabaseClient'

export const REACTION_EMOJIS = ['👍', '❤️', '🙏', '💪', '😢'] as const

export interface ReactionSummary {
  emoji: string
  count: number
  reactedByMe: boolean
}

/** One query for every comment on a post, aggregated client-side (no cached count column). */
export async function getCommentReactions(
  commentIds: string[],
  userId: string | undefined,
): Promise<Record<string, ReactionSummary[]>> {
  if (commentIds.length === 0) return {}

  const { data, error } = await supabase
    .from('reactions')
    .select('comment_id, emoji, user_id')
    .in('comment_id', commentIds)

  if (error) throw error

  const byComment: Record<string, Record<string, ReactionSummary>> = {}
  for (const row of data as { comment_id: string; emoji: string; user_id: string }[]) {
    const comment = (byComment[row.comment_id] ??= {})
    const summary = (comment[row.emoji] ??= {
      emoji: row.emoji,
      count: 0,
      reactedByMe: false,
    })
    summary.count += 1
    if (row.user_id === userId) summary.reactedByMe = true
  }

  return Object.fromEntries(
    Object.entries(byComment).map(([commentId, emojiMap]) => [
      commentId,
      Object.values(emojiMap),
    ]),
  )
}

/** Adds the reaction if the user hasn't used it on this comment yet, otherwise removes it. */
export async function toggleReaction(commentId: string, userId: string, emoji: string) {
  const { data: existing, error: fetchError } = await supabase
    .from('reactions')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle()
  if (fetchError) throw fetchError

  if (existing) {
    const { error } = await supabase.from('reactions').delete().eq('id', existing.id)
    if (error) throw error
    return false
  }

  const { error } = await supabase
    .from('reactions')
    .insert({ comment_id: commentId, user_id: userId, emoji })
  if (error) throw error
  return true
}
