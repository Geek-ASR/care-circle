import { supabase } from '@/services/supabaseClient'
import { createNotification } from '@/features/notifications/api/notifications'
import type { CommentWithAuthor } from '../types'

const COMMENT_SELECT =
  '*, author:profiles!comments_author_id_fkey(username, display_name, avatar_url)'

export async function listComments(postId: string): Promise<CommentWithAuthor[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as unknown as CommentWithAuthor[]
}

export async function createComment(input: {
  postId: string
  authorId: string
  parentCommentId: string | null
  body: string
}) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: input.postId,
      author_id: input.authorId,
      parent_comment_id: input.parentCommentId,
      body: input.body,
    })
    .select(COMMENT_SELECT)
    .single()

  if (error) throw error
  const comment = data as unknown as CommentWithAuthor

  void notifyOnReply(comment).catch(() => {
    // Best-effort: a failed notification insert should never block the comment itself.
  })

  return comment
}

async function notifyOnReply(comment: CommentWithAuthor) {
  if (comment.parent_comment_id) {
    const { data: parent } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', comment.parent_comment_id)
      .maybeSingle()

    if (parent?.author_id) {
      await createNotification({
        userId: parent.author_id,
        actorId: comment.author_id as string,
        type: 'reply',
        targetType: 'post',
        targetId: comment.post_id,
      })
    }
    return
  }

  const { data: post } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', comment.post_id)
    .maybeSingle()

  if (post?.author_id) {
    await createNotification({
      userId: post.author_id,
      actorId: comment.author_id as string,
      type: 'reply',
      targetType: 'post',
      targetId: comment.post_id,
    })
  }
}

export async function updateComment(commentId: string, body: string) {
  const { error } = await supabase
    .from('comments')
    .update({ body, is_edited: true })
    .eq('id', commentId)

  if (error) throw error
}

export async function setCommentStatus(
  commentId: string,
  status: 'published' | 'removed' | 'deleted',
) {
  const { error } = await supabase.from('comments').update({ status }).eq('id', commentId)
  if (error) throw error
}
