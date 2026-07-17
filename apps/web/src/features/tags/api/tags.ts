import { supabase } from '@/services/supabaseClient'
import type { Tag } from '@/types/database'

export async function listTags(): Promise<Tag[]> {
  const { data, error } = await supabase.from('tags').select('*').order('name')
  if (error) throw error
  return data
}

/** Replaces a post's tag associations. Only meaningful right after creating a post
 * (nothing to delete yet), but written to be safe to call again later (e.g. an edit flow). */
export async function setPostTags(postId: string, tagIds: string[]) {
  if (tagIds.length === 0) return

  const { error } = await supabase
    .from('post_tags')
    .insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })))

  if (error) throw error
}
