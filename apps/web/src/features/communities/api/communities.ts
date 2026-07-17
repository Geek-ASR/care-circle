import { supabase } from '@/services/supabaseClient'
import type {
  Community,
  CommunityMemberRole,
  CommunityResource,
  CommunityRule,
  WikiPage,
} from '@/types/database'
import type { CommunityWithCondition, MyCommunity } from '../types'

export async function listCommunities(): Promise<CommunityWithCondition[]> {
  const { data, error } = await supabase
    .from('communities')
    .select('*, condition:conditions(name, slug)')
    .eq('is_approved', true)
    .order('member_count', { ascending: false })

  if (error) throw error
  return data as unknown as CommunityWithCondition[]
}

/**
 * No is_approved filter here: RLS (communities_select_scoped) already allows an
 * unapproved community's creator/moderators/admins to see it pending review, and
 * this needs to return that row so the "your community is pending approval" state
 * can render instead of a 404.
 */
export async function getCommunityBySlug(
  slug: string,
): Promise<CommunityWithCondition | null> {
  const { data, error } = await supabase
    .from('communities')
    .select('*, condition:conditions(name, slug)')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data as unknown as CommunityWithCondition | null
}

export interface CreateCommunityInput {
  name: string
  slug: string
  description: string
  conditionId: string | null
  createdBy: string
}

export async function createCommunity(input: CreateCommunityInput): Promise<Community> {
  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      condition_id: input.conditionId,
      created_by: input.createdBy,
      is_approved: false,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as Community
}

export async function listMyCommunities(userId: string): Promise<MyCommunity[]> {
  const { data, error } = await supabase
    .from('community_members')
    .select('role, community:communities(*)')
    .eq('user_id', userId)

  if (error) throw error
  return (data as unknown as { role: CommunityMemberRole; community: Community }[])
    .filter((row) => row.community)
    .map((row) => ({ ...row.community, membershipRole: row.role }))
}

export async function getMembership(communityId: string, userId: string) {
  const { data, error } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data as { role: CommunityMemberRole } | null
}

export async function joinCommunity(communityId: string, userId: string) {
  const { error } = await supabase
    .from('community_members')
    .insert({ community_id: communityId, user_id: userId, role: 'member' })

  if (error) throw error
}

export async function listCommunityRules(communityId: string): Promise<CommunityRule[]> {
  const { data, error } = await supabase
    .from('community_rules')
    .select('*')
    .eq('community_id', communityId)
    .order('position')

  if (error) throw error
  return data
}

export async function listCommunityResources(
  communityId: string,
): Promise<CommunityResource[]> {
  const { data, error } = await supabase
    .from('community_resources')
    .select('*')
    .eq('community_id', communityId)
    .order('position')

  if (error) throw error
  return data
}

export async function listWikiPages(communityId: string): Promise<WikiPage[]> {
  const { data, error } = await supabase
    .from('wiki_pages')
    .select('*')
    .eq('community_id', communityId)
    .order('title')

  if (error) throw error
  return data
}

export async function getWikiPage(
  communityId: string,
  slug: string,
): Promise<WikiPage | null> {
  const { data, error } = await supabase
    .from('wiki_pages')
    .select('*')
    .eq('community_id', communityId)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function leaveCommunity(communityId: string, userId: string) {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', userId)

  if (error) throw error
}
