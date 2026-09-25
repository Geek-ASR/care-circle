import { toast } from '@/store/toastStore'

/** Absolute URL for a post, respecting the GitHub Pages base path. */
export function postUrl(postId: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${window.location.origin}${base}/posts/${postId}`
}

/**
 * Opens the native share sheet where there is one (mobile), otherwise copies the link.
 * A dismissed share sheet or a blocked clipboard is silently ignored.
 */
export async function sharePost(postId: string, title: string) {
  const url = postUrl(postId)
  try {
    if (navigator.share) {
      await navigator.share({ title, url })
      return
    }
    await navigator.clipboard.writeText(url)
    toast({ title: 'Link copied', description: 'Share it with someone who needs it.' })
  } catch {
    /* share sheet dismissed or clipboard blocked — nothing to report */
  }
}
