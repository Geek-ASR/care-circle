import { useQuery } from '@tanstack/react-query'
import { listPostMedia } from '../api/postMedia'

export function usePostMedia(postId: string | undefined) {
  return useQuery({
    queryKey: ['post-media', postId ?? 'none'],
    queryFn: () => listPostMedia(postId as string),
    enabled: Boolean(postId),
  })
}
