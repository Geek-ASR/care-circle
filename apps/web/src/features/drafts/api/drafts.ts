import { supabase } from '@/services/supabaseClient'
import type { Draft, PostType } from '@/types/database'

export interface DraftContent {
  communityId: string | null
  postType: PostType | null
  title: string
  body: string
}

/** The user's most recently edited post draft, if any (RLS: drafts_owner_all). */
export async function getLatestDraft(userId: string): Promise<Draft | null> {
  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveDraft(
  userId: string,
  draftId: string | null,
  content: DraftContent,
): Promise<string> {
  const row = {
    community_id: content.communityId || null,
    post_type: content.postType,
    title: content.title,
    body: content.body,
  }
  if (draftId) {
    const { error } = await supabase.from('drafts').update(row).eq('id', draftId)
    if (error) throw error
    return draftId
  }
  const { data, error } = await supabase
    .from('drafts')
    .insert({ ...row, user_id: userId })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function deleteDraft(draftId: string) {
  const { error } = await supabase.from('drafts').delete().eq('id', draftId)
  if (error) throw error
}
