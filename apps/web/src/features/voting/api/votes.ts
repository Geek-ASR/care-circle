import { supabase } from '@/services/supabaseClient'
import { createNotification } from '@/features/notifications/api/notifications'

export type VoteTarget = { type: 'post'; id: string } | { type: 'comment'; id: string }

function targetColumn(target: VoteTarget) {
  return target.type === 'post' ? 'post_id' : 'comment_id'
}

/** Casts, changes, or (if the same value is sent twice) removes a vote. Returns the resulting vote. */
export async function castVote(
  target: VoteTarget,
  userId: string,
  value: 1 | -1,
): Promise<0 | 1 | -1> {
  const column = targetColumn(target)

  const { data: existing, error: fetchError } = await supabase
    .from('votes')
    .select('id, value')
    .eq('user_id', userId)
    .eq(column, target.id)
    .maybeSingle()
  if (fetchError) throw fetchError

  if (existing && existing.value === value) {
    const { error } = await supabase.from('votes').delete().eq('id', existing.id)
    if (error) throw error
    return 0
  }

  if (existing) {
    const { error } = await supabase.from('votes').update({ value }).eq('id', existing.id)
    if (error) throw error
    return value
  }

  const { error } = await supabase.from('votes').insert({
    user_id: userId,
    [column]: target.id,
    value,
  })
  if (error) throw error

  if (target.type === 'post' && value === 1) {
    void notifyOnUpvote(target.id, userId).catch(() => {
      // Best-effort: a failed notification insert should never block the vote itself.
    })
  }

  return value
}

async function notifyOnUpvote(postId: string, actorId: string) {
  const { data: post } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .maybeSingle()

  if (post?.author_id) {
    await createNotification({
      userId: post.author_id,
      actorId,
      type: 'upvote',
      targetType: 'post',
      targetId: postId,
    })
  }
}

export async function getUserVotes(
  targetType: 'post' | 'comment',
  targetIds: string[],
  userId: string,
): Promise<Record<string, 1 | -1>> {
  if (targetIds.length === 0) return {}
  const column = targetType === 'post' ? 'post_id' : 'comment_id'

  const { data, error } = await supabase
    .from('votes')
    .select(`${column}, value`)
    .eq('user_id', userId)
    .in(column, targetIds)

  if (error) throw error
  return Object.fromEntries(
    (data as unknown as Record<string, string | number>[]).map((row) => [
      row[column] as string,
      row.value as 1 | -1,
    ]),
  )
}
