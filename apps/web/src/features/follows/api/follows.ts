import { supabase } from '@/services/supabaseClient'
import type { FollowListEntry } from '../types'

export async function isFollowing(
  followerId: string,
  followeeId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId)
    .maybeSingle()
  if (error) throw error
  return data !== null
}

export async function followUser(followerId: string, followeeId: string) {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, followee_id: followeeId })
  if (error) throw error
}

export async function unfollowUser(followerId: string, followeeId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId)
  if (error) throw error
}

/** Followee ids for a user's "Following" feed - RLS on follows is authenticated-only, so this always runs as the signed-in viewer. */
export async function listFollowedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('followee_id')
    .eq('follower_id', userId)
  if (error) throw error
  return (data as { followee_id: string }[]).map((row) => row.followee_id)
}

export async function listFollowers(userId: string): Promise<FollowListEntry[]> {
  const { data, error } = await supabase
    .from('follows')
    .select(
      'follower:profiles!follows_follower_id_fkey(id, username, display_name, avatar_url)',
    )
    .eq('followee_id', userId)
  if (error) throw error
  return (data as unknown as { follower: FollowListEntry }[]).map((row) => row.follower)
}

export async function listFollowing(userId: string): Promise<FollowListEntry[]> {
  const { data, error } = await supabase
    .from('follows')
    .select(
      'followee:profiles!follows_followee_id_fkey(id, username, display_name, avatar_url)',
    )
    .eq('follower_id', userId)
  if (error) throw error
  return (data as unknown as { followee: FollowListEntry }[]).map((row) => row.followee)
}
