import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToTable } from '@/services/realtime'
import { getUserVotes } from '@/features/voting/api/votes'
import type { Post } from '@/types/database'
import {
  createPost,
  getPost,
  listPosts,
  setPostStatus,
  type ListPostsResult,
} from '../api/posts'
import type { CreatePostInput, PostSort, PostWithRelations } from '../types'
import { controversialScore, hotScore } from '../utils/ranking'

export interface PostWithVote extends PostWithRelations {
  userVote: 0 | 1 | -1
}

function rankPage(posts: PostWithRelations[], sort: PostSort): PostWithRelations[] {
  if (sort === 'hot') {
    return [...posts].sort(
      (a, b) => hotScore(b.score, b.created_at) - hotScore(a.score, a.created_at),
    )
  }
  if (sort === 'controversial') {
    return [...posts].sort(
      (a, b) =>
        controversialScore(b.score, b.comment_count) -
        controversialScore(a.score, a.comment_count),
    )
  }
  return posts
}

export function usePostsFeed(communityId: string | undefined, sort: PostSort) {
  const { user } = useAuth()

  return useInfiniteQuery({
    queryKey: ['posts', communityId ?? 'global', sort, user?.id ?? 'anon'],
    queryFn: async ({
      pageParam,
    }): Promise<{ posts: PostWithVote[]; nextPage: number | null }> => {
      const result: ListPostsResult = await listPosts({
        communityId,
        sort,
        page: pageParam,
      })
      const ranked = rankPage(result.posts, sort)

      const votes = user
        ? await getUserVotes(
            'post',
            ranked.map((p) => p.id),
            user.id,
          )
        : {}

      return {
        posts: ranked.map((post) => ({ ...post, userVote: votes[post.id] ?? 0 })),
        nextPage: result.nextPage,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 15_000,
  })
}

export function usePost(postId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['post', postId, user?.id ?? 'anon'],
    queryFn: async (): Promise<PostWithVote | null> => {
      const post = await getPost(postId as string)
      if (!post) return null
      const votes = user ? await getUserVotes('post', [post.id], user.id) : {}
      return { ...post, userVote: votes[post.id] ?? 0 }
    },
    enabled: Boolean(postId),
  })
}

/** Live-updates score/comment_count on the currently open post as votes/comments come in. */
export function usePostRealtimeSync(postId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!postId) return
    return subscribeToTable<Post>(
      `post:${postId}`,
      { table: 'posts', event: 'UPDATE', filter: `id=eq.${postId}` },
      () => {
        void queryClient.invalidateQueries({ queryKey: ['post', postId], exact: false })
      },
    )
  }, [postId, queryClient])
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useSetPostStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      postId,
      status,
    }: {
      postId: string
      status: 'published' | 'removed' | 'deleted'
    }) => setPostStatus(postId, status),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
      void queryClient.invalidateQueries({
        queryKey: ['post', variables.postId],
        exact: false,
      })
    },
  })
}
