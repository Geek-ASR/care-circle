import { supabase } from '@/services/supabaseClient'
import type { CommunityResource, CommunityRule, WikiPage } from '@/types/database'

/**
 * Moderator-only writes for a community's own content. Every call here is gated
 * server-side by RLS (communities_update_moderator, *_moderator_write policies,
 * all via is_moderator_of()), so the UI hiding these screens from non-moderators
 * is a convenience, not the security boundary.
 */

export interface CommunityDetailsInput {
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
}

export async function updateCommunityDetails(
  communityId: string,
  input: CommunityDetailsInput,
) {
  const { error } = await supabase
    .from('communities')
    .update({
      description: input.description,
      logo_url: input.logoUrl,
      banner_url: input.bannerUrl,
    })
    .eq('id', communityId)
  if (error) throw error
}

export interface RuleInput {
  title: string
  description: string | null
}

export async function createRule(
  communityId: string,
  input: RuleInput,
  position: number,
): Promise<CommunityRule> {
  const { data, error } = await supabase
    .from('community_rules')
    .insert({ community_id: communityId, ...input, position })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateRule(ruleId: string, input: RuleInput) {
  const { error } = await supabase.from('community_rules').update(input).eq('id', ruleId)
  if (error) throw error
}

export async function deleteRule(ruleId: string) {
  const { error } = await supabase.from('community_rules').delete().eq('id', ruleId)
  if (error) throw error
}

/** Persists a new order by rewriting each row's position to its index. */
export async function reorderRules(orderedIds: string[]) {
  const results = await Promise.all(
    orderedIds.map((id, position) =>
      supabase.from('community_rules').update({ position }).eq('id', id),
    ),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}

export interface ResourceInput {
  title: string
  url: string | null
  description: string | null
}

export async function createResource(
  communityId: string,
  input: ResourceInput,
  position: number,
): Promise<CommunityResource> {
  const { data, error } = await supabase
    .from('community_resources')
    .insert({ community_id: communityId, ...input, position })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateResource(resourceId: string, input: ResourceInput) {
  const { error } = await supabase
    .from('community_resources')
    .update(input)
    .eq('id', resourceId)
  if (error) throw error
}

export async function deleteResource(resourceId: string) {
  const { error } = await supabase
    .from('community_resources')
    .delete()
    .eq('id', resourceId)
  if (error) throw error
}

export interface WikiPageInput {
  title: string
  slug: string
  content: string
}

export async function createWikiPage(
  communityId: string,
  createdBy: string,
  input: WikiPageInput,
): Promise<WikiPage> {
  const { data, error } = await supabase
    .from('wiki_pages')
    .insert({ community_id: communityId, created_by: createdBy, ...input })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateWikiPage(page: WikiPage, input: WikiPageInput) {
  const { error } = await supabase
    .from('wiki_pages')
    .update({ ...input, version: page.version + 1 })
    .eq('id', page.id)
  if (error) throw error
}

export async function deleteWikiPage(pageId: string) {
  const { error } = await supabase.from('wiki_pages').delete().eq('id', pageId)
  if (error) throw error
}
