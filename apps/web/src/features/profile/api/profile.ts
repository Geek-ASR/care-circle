import { supabase } from '@/services/supabaseClient'
import type { Profile } from '@/types/database'

export type PublicProfile = Omit<
  Profile,
  'privacy_settings' | 'notification_settings' | 'gender'
>

/**
 * Reads from profile_public_view (supabase/migrations/20260101000020_privacy_and_blocks.sql)
 * instead of the profiles table directly - the view enforces profile_visibility,
 * show_age/show_diagnosis, and the anon column revoke entirely in Postgres, so this
 * no longer needs to know which columns are safe to ask for based on who's asking.
 */
export async function getProfileByUsername(
  username: string,
): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from('profile_public_view')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error) throw error
  return data as unknown as PublicProfile | null
}

export interface UpdateProfileInput {
  displayName: string
  bio: string
  country: string
  website: string
  avatarUrl: string | null
  bannerUrl: string | null
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.displayName || null,
      bio: input.bio || null,
      country: input.country || null,
      website: input.website || null,
      avatar_url: input.avatarUrl,
      banner_url: input.bannerUrl,
    })
    .eq('id', userId)

  if (error) throw error
}

export interface PrivacySettings {
  show_age?: boolean
  show_diagnosis?: boolean
  profile_visibility?: 'public' | 'members_only' | 'private'
}

export async function updatePrivacySettings(userId: string, settings: PrivacySettings) {
  const { error } = await supabase
    .from('profiles')
    .update({ privacy_settings: settings })
    .eq('id', userId)
  if (error) throw error
}

export async function updateNotificationSettings(
  userId: string,
  settings: Record<string, boolean>,
) {
  const { error } = await supabase
    .from('profiles')
    .update({ notification_settings: settings })
    .eq('id', userId)
  if (error) throw error
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${extension}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (error) throw error
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
}

export async function uploadBanner(file: File, userId: string): Promise<string> {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/banner-${Date.now()}.${extension}`
  const { error } = await supabase.storage
    .from('banners')
    .upload(path, file, { upsert: true })
  if (error) throw error
  return supabase.storage.from('banners').getPublicUrl(path).data.publicUrl
}
