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
