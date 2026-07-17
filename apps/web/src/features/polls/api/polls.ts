import { supabase } from '@/services/supabaseClient'
import type { PollOptionResult, PollResults } from '../types'

export async function createPollOptions(postId: string, optionTexts: string[]) {
  const rows = optionTexts.map((option_text, position) => ({
    post_id: postId,
    option_text,
    position,
  }))
  const { error } = await supabase.from('poll_options').insert(rows)
  if (error) throw error
}

/**
 * poll_options has no cached vote-count column (see the RLS policy comment
 * in 20260101000010_rls_policies.sql), so results are aggregated client-side
 * from the raw poll_votes rows - same pattern as comment reactions.
 */
export async function getPollResults(
  postId: string,
  userId: string | undefined,
): Promise<PollResults> {
  const [{ data: options, error: optionsError }, { data: votes, error: votesError }] =
    await Promise.all([
      supabase
        .from('poll_options')
        .select('id, option_text, position')
        .eq('post_id', postId)
        .order('position'),
      supabase.from('poll_votes').select('poll_option_id, user_id').eq('post_id', postId),
    ])
  if (optionsError) throw optionsError
  if (votesError) throw votesError

  const counts = new Map<string, number>()
  let myVoteOptionId: string | null = null
  for (const vote of votes as { poll_option_id: string; user_id: string }[]) {
    counts.set(vote.poll_option_id, (counts.get(vote.poll_option_id) ?? 0) + 1)
    if (vote.user_id === userId) myVoteOptionId = vote.poll_option_id
  }

  const results: PollOptionResult[] = (
    options as { id: string; option_text: string; position: number }[]
  ).map((option) => ({ ...option, voteCount: counts.get(option.id) ?? 0 }))

  return {
    options: results,
    totalVotes: results.reduce((sum, option) => sum + option.voteCount, 0),
    myVoteOptionId,
  }
}

/** Votes for pollOptionId, or moves an existing vote to it (single-choice polls stay changeable). */
export async function votePoll(postId: string, pollOptionId: string, userId: string) {
  const { data: existing, error: fetchError } = await supabase
    .from('poll_votes')
    .select('poll_option_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()
  if (fetchError) throw fetchError

  if (existing) {
    if (existing.poll_option_id === pollOptionId) return
    const { error } = await supabase
      .from('poll_votes')
      .update({ poll_option_id: pollOptionId })
      .eq('post_id', postId)
      .eq('user_id', userId)
    if (error) throw error
    return
  }

  const { error } = await supabase
    .from('poll_votes')
    .insert({ poll_option_id: pollOptionId, user_id: userId, post_id: postId })
  if (error) throw error
}
