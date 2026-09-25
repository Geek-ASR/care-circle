import { supabase } from '@/services/supabaseClient'
import type {
  CommunityBan,
  CommunityBanKind,
  CommunityMemberRole,
} from '@/types/database'

export interface MemberProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export interface CommunityMemberRow {
  user_id: string
  role: CommunityMemberRole
  joined_at: string
  profile: MemberProfile | null
}

export interface CommunityBanWithUser extends CommunityBan {
  user: MemberProfile | null
}

const PROFILE_COLUMNS = 'id, username, display_name, avatar_url'

export async function listCommunityMembers(
  communityId: string,
): Promise<CommunityMemberRow[]> {
  const { data, error } = await supabase
    .from('community_members')
    .select(`user_id, role, joined_at, profile:profiles(${PROFILE_COLUMNS})`)
    .eq('community_id', communityId)
    .order('joined_at', { ascending: false })
    .limit(500)
  if (error) throw error
  return data as unknown as CommunityMemberRow[]
}

/** Every restriction row for a community, newest first (moderators only via RLS). */
export async function listCommunityBans(
  communityId: string,
): Promise<CommunityBanWithUser[]> {
  const { data, error } = await supabase
    .from('community_bans')
    .select(`*, user:profiles!community_bans_user_id_fkey(${PROFILE_COLUMNS})`)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as CommunityBanWithUser[]
}

/** The signed-in user's own restrictions in a community (RLS lets them read these). */
export async function listMyRestrictions(
  communityId: string,
  userId: string,
): Promise<CommunityBan[]> {
  const { data, error } = await supabase
    .from('community_bans')
    .select('*')
    .eq('community_id', communityId)
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export interface RestrictUserInput {
  communityId: string
  userId: string
  kind: CommunityBanKind
  reason: string | null
  expiresAt: string | null
  createdBy: string
}

/**
 * Creates or replaces a ban/mute. (community_id, user_id, kind) is unique, so
 * restricting someone who's already restricted updates the reason/expiry. The
 * database trigger logs the moderation action, notifies the user and, for bans,
 * removes their membership.
 */
export async function restrictUser(input: RestrictUserInput) {
  const { error } = await supabase.from('community_bans').upsert(
    {
      community_id: input.communityId,
      user_id: input.userId,
      kind: input.kind,
      reason: input.reason,
      expires_at: input.expiresAt,
      created_by: input.createdBy,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'community_id,user_id,kind' },
  )
  if (error) throw error
}

export async function liftRestriction(banId: string) {
  const { error } = await supabase.from('community_bans').delete().eq('id', banId)
  if (error) throw error
}
