import { supabase } from '@/services/supabaseClient'

export interface BlockedUserEntry {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocker_id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle()
  if (error) throw error
  return data !== null
}

export async function blockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from('blocks')
    .insert({ blocker_id: blockerId, blocked_id: blockedId })
  if (error) throw error
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
  if (error) throw error
}

export async function listBlockedUsers(blockerId: string): Promise<BlockedUserEntry[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select(
      'blocked:profiles!blocks_blocked_id_fkey(id, username, display_name, avatar_url)',
    )
    .eq('blocker_id', blockerId)
  if (error) throw error
  return (data as unknown as { blocked: BlockedUserEntry }[]).map((row) => row.blocked)
}
