import { supabase } from '@/services/supabaseClient'
import type { Badge } from '@/types/database'

export interface UserBadgeWithBadge {
  badge_id: string
  awarded_at: string
  badge: Badge
}

export async function listAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase.from('badges').select('*').order('name')
  if (error) throw error
  return data as Badge[]
}

export async function listUserBadges(userId: string): Promise<UserBadgeWithBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id, awarded_at, badge:badges(*)')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false })
  if (error) throw error
  return data as unknown as UserBadgeWithBadge[]
}

export async function awardBadge(userId: string, badgeId: string) {
  const { error } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badgeId })
  if (error) throw error
}
