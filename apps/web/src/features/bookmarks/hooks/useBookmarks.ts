import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import { getUserVotes } from '@/features/voting/api/votes'
import type { PostWithVote } from '@/features/posts/hooks/usePosts'
import {
  addBookmark,
  isPostBookmarked,
  listBookmarkedPosts,
  removeBookmark,
} from '../api/bookmarks'

export function useIsBookmarked(postId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['bookmark', postId, user?.id ?? 'anon'],
    queryFn: () => isPostBookmarked(postId, user!.id),
    enabled: Boolean(user),
  })
}

export function useToggleBookmark(postId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (currentlyBookmarked: boolean) => {
      if (currentlyBookmarked) {
        await removeBookmark(postId, user!.id)
      } else {
        await addBookmark(postId, user!.id)
      }
      return !currentlyBookmarked
    },
    onSuccess: (nowBookmarked) => {
      void queryClient.invalidateQueries({ queryKey: ['bookmark', postId] })
      void queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] })
      toast({
        title: nowBookmarked ? 'Saved' : 'Removed from saved posts',
        variant: 'success',
      })
    },
    onError: () => {
      toast({ title: 'Could not update saved posts', variant: 'danger' })
    },
  })
}

export function useBookmarkedPosts() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['bookmarks', user?.id ?? 'anon'],
    queryFn: async (): Promise<PostWithVote[]> => {
      const posts = await listBookmarkedPosts(user!.id)
      const votes = await getUserVotes(
        'post',
        posts.map((p) => p.id),
        user!.id,
      )
      return posts.map((post) => ({ ...post, userVote: votes[post.id] ?? 0 }))
    },
    enabled: Boolean(user),
  })
}
