import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

/**
 * Centralized query key factory so cache invalidation stays consistent across
 * features instead of ad-hoc string arrays scattered through the codebase.
 */
export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  profileByUsername: (username: string) => ['profile', 'username', username] as const,
  communities: () => ['communities'] as const,
  community: (slug: string) => ['community', slug] as const,
  communityMembership: (communityId: string, userId: string) =>
    ['community', communityId, 'membership', userId] as const,
  posts: (communityId: string, sort: string) => ['posts', communityId, sort] as const,
  post: (postId: string) => ['post', postId] as const,
  comments: (postId: string) => ['comments', postId] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  conditions: () => ['conditions'] as const,
  conversations: (userId: string) => ['conversations', userId] as const,
  conversationMessages: (conversationId: string) =>
    ['conversations', conversationId, 'messages'] as const,
}
