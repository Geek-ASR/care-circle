import { supabase } from '@/services/supabaseClient'

export interface ReputationEvent {
  id: string
  user_id: string
  delta: number
  reason: string
  source_type: string | null
  source_id: string | null
  created_at: string
}

/** Recent reputation ledger entries (RLS: only the user themself or an admin). */
export async function listReputationEvents(
  userId: string,
  limit = 20,
): Promise<ReputationEvent[]> {
  const { data, error } = await supabase
    .from('reputation_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as ReputationEvent[]
}

export interface TopContributor {
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  reputation_score: number
  post_count: number
  comment_count: number
  score: number
}

/** Most helpful members of a community recently (community_top_contributors RPC). */
export async function listTopContributors(
  communityId: string,
  days = 30,
  limit = 5,
): Promise<TopContributor[]> {
  const { data, error } = await supabase.rpc('community_top_contributors', {
    cid: communityId,
    p_days: days,
    p_limit: limit,
  })
  if (error) throw error
  return (data ?? []) as TopContributor[]
}
