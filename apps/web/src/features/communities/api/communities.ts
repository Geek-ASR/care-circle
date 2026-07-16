import { supabase } from '@/services/supabaseClient'
import type { Community, CommunityMemberRole, CommunityRule } from '@/types/database'
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

export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .eq('is_approved', true)
    .maybeSingle()

  if (error) throw error
  return data
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

export async function leaveCommunity(communityId: string, userId: string) {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', userId)

  if (error) throw error
}
