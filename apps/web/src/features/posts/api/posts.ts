import { supabase } from '@/services/supabaseClient'
import type { PostType } from '@/types/database'
import type { CreatePostInput, PostSort, PostWithRelations } from '../types'

const POST_SELECT =
  '*, author:profiles!posts_author_id_fkey(username, display_name, avatar_url), community:communities(slug, name)'

interface ListPostsParams {
  communityId?: string
  sort: PostSort
  page: number
  pageSize?: number
}

export interface ListPostsResult {
  posts: PostWithRelations[]
  nextPage: number | null
}

export async function listPosts({
  communityId,
  sort,
  page,
  pageSize = 15,
}: ListPostsParams): Promise<ListPostsResult> {
  // Hot/controversial are re-ranked client-side (see features/posts/utils/ranking.ts), so
  // both pull a recency-bounded window from the DB rather than a true keyset order.
  let query = supabase.from('posts').select(POST_SELECT).eq('status', 'published')

  if (communityId) query = query.eq('community_id', communityId)

  const from = page * pageSize
  const to = from + pageSize - 1

  switch (sort) {
    case 'new':
      query = query.order('created_at', { ascending: false })
      break
    case 'top':
      query = query.order('score', { ascending: false })
      break
    case 'hot':
    case 'controversial':
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data, error } = await query.range(from, to)
  if (error) throw error

  const posts = data as unknown as PostWithRelations[]
  return { posts, nextPage: posts.length === pageSize ? page + 1 : null }
}

export async function getPost(postId: string): Promise<PostWithRelations | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('id', postId)
    .maybeSingle()

  if (error) throw error
  return data as unknown as PostWithRelations | null
}

export async function createPost(input: CreatePostInput) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      community_id: input.communityId,
      author_id: input.authorId,
      post_type: input.postType,
      title: input.title,
      body: input.body ?? null,
      url: input.url ?? null,
      is_nsfw: input.isNsfw ?? false,
      is_spoiler: input.isSpoiler ?? false,
    })
    .select(POST_SELECT)
    .single()

  if (error) throw error
  return data as unknown as PostWithRelations
}

export async function updatePostContent(
  postId: string,
  authorId: string,
  { title, body }: { title: string; body: string | null },
) {
  const { data: previous, error: fetchError } = await supabase
    .from('posts')
    .select('title, body')
    .eq('id', postId)
    .single()
  if (fetchError) throw fetchError

  await supabase.from('post_versions').insert({
    post_id: postId,
    title: previous.title,
    body: previous.body,
    edited_by: authorId,
  })

  const { error } = await supabase
    .from('posts')
    .update({ title, body, edited_at: new Date().toISOString() })
    .eq('id', postId)

  if (error) throw error
}

export type { PostType }

export async function setPostStatus(
  postId: string,
  status: 'published' | 'removed' | 'deleted',
) {
  const { error } = await supabase.from('posts').update({ status }).eq('id', postId)
  if (error) throw error
}

export async function togglePin(postId: string, isPinned: boolean) {
  const { error } = await supabase
    .from('posts')
    .update({ is_pinned: isPinned })
    .eq('id', postId)
  if (error) throw error
}

export async function toggleLock(postId: string, isLocked: boolean) {
  const { error } = await supabase
    .from('posts')
    .update({ is_locked: isLocked })
    .eq('id', postId)
  if (error) throw error
}
