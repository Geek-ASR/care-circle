import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToTable } from '@/services/realtime'
import { queryKeys } from '@/services/queryClient'
import { getUserVotes } from '@/features/voting/api/votes'
import { getCommentReactions } from '@/features/reactions/api/reactions'
import type { Comment } from '@/types/database'
import {
  createComment,
  listComments,
  setCommentStatus,
  updateComment,
} from '../api/comments'
import { buildCommentTree } from '../utils/tree'
import type { CommentSort, CommentWithAuthor } from '../types'

function useCommentsQuery(postId: string | undefined) {
  return useQuery({
    queryKey: postId ? queryKeys.comments(postId) : ['comments', 'none'],
    queryFn: async (): Promise<CommentWithAuthor[]> => listComments(postId as string),
    enabled: Boolean(postId),
  })
}

export function useCommentTree(postId: string | undefined, sort: CommentSort) {
  const { user } = useAuth()
  const commentsQuery = useCommentsQuery(postId)

  const votesQuery = useQuery({
    queryKey: ['comment-votes', postId, user?.id ?? 'anon'],
    queryFn: () =>
      getUserVotes(
        'comment',
        (commentsQuery.data ?? []).map((c) => c.id),
        user!.id,
      ),
    enabled: Boolean(
      postId && user && commentsQuery.data && commentsQuery.data.length > 0,
    ),
  })

  const reactionsQuery = useQuery({
    queryKey: ['comment-reactions', postId, user?.id ?? 'anon'],
    queryFn: () =>
      getCommentReactions(
        (commentsQuery.data ?? []).map((c) => c.id),
        user?.id,
      ),
    enabled: Boolean(postId && commentsQuery.data && commentsQuery.data.length > 0),
  })

  const tree = useMemo(
    () =>
      buildCommentTree(
        commentsQuery.data ?? [],
        votesQuery.data ?? {},
        reactionsQuery.data ?? {},
        sort,
      ),
    [commentsQuery.data, votesQuery.data, reactionsQuery.data, sort],
  )

  return {
    tree,
    count: commentsQuery.data?.length ?? 0,
    isLoading: commentsQuery.isLoading,
  }
}

export function useCommentsRealtimeSync(postId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!postId) return
    return subscribeToTable<Comment>(
      `comments:${postId}`,
      { table: 'comments', filter: `post_id=eq.${postId}` },
      () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) })
      },
    )
  }, [postId, queryClient])
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      authorId: string
      parentCommentId: string | null
      body: string
    }) => createComment({ postId, ...input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) })
      void queryClient.invalidateQueries({ queryKey: ['post', postId], exact: false })
    },
  })
}

export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
      updateComment(commentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) })
    },
  })
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => setCommentStatus(commentId, 'deleted'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) })
    },
  })
}
