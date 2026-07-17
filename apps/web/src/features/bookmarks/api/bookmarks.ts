import { supabase } from '@/services/supabaseClient'
import type { PostWithRelations } from '@/features/posts/types'

export async function isPostBookmarked(postId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data !== null
}

export async function addBookmark(postId: string, userId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .insert({ post_id: postId, user_id: userId })
  if (error) throw error
}

export async function removeBookmark(postId: string, userId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function listBookmarkedPosts(userId: string): Promise<PostWithRelations[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(
      'created_at, post:posts(*, author:profiles!posts_author_id_fkey(username, display_name, avatar_url), community:communities(slug, name), post_media(storage_path, position))',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as { post: PostWithRelations }[])
    .filter((row) => row.post && row.post.status === 'published')
    .map((row) => row.post)
}
