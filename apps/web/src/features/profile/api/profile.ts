import { supabase } from '@/services/supabaseClient'
import type { Profile } from '@/types/database'

export type PublicProfile = Omit<Profile, 'privacy_settings' | 'notification_settings'>

const PUBLIC_COLUMNS =
  'id, username, display_name, avatar_url, banner_url, verified_diagnosis, reputation_score, theme_preference, onboarding_completed, created_at, updated_at'

// Diagnosis/bio/age/gender/country/website/social_links are revoked at the column
// level from the `anon` role (see supabase/migrations/20260101000011_security_hardening.sql)
// — an anonymous viewer's request must not ask for them, or the query fails outright.
const AUTHENTICATED_COLUMNS = `${PUBLIC_COLUMNS}, bio, country, age, gender, diagnosis_condition_id, diagnosis_year, website, social_links`

export async function getProfileByUsername(
  username: string,
  isViewerAuthenticated: boolean,
): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(isViewerAuthenticated ? AUTHENTICATED_COLUMNS : PUBLIC_COLUMNS)
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
