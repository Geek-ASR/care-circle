import { supabase } from '@/services/supabaseClient'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please choose a PNG, JPEG, WebP, or GIF image.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Images must be under 8MB.'
  }
  return null
}

export async function uploadPostImage(file: File, userId: string, postId: string) {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${postId}-${Date.now()}.${extension}`

  const { error } = await supabase.storage.from('post-media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { error: insertError } = await supabase.from('post_media').insert({
    post_id: postId,
    storage_path: path,
    media_type: file.type === 'image/gif' ? 'gif' : 'image',
    position: 0,
  })
  if (insertError) throw insertError

  return getPostMediaUrl(path)
}

export function getPostMediaUrl(storagePath: string): string {
  return supabase.storage.from('post-media').getPublicUrl(storagePath).data.publicUrl
}

export async function listPostMedia(postId: string) {
  const { data, error } = await supabase
    .from('post_media')
    .select('*')
    .eq('post_id', postId)
    .order('position')
  if (error) throw error
  return data
}
