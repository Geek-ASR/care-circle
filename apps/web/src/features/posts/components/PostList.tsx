import { useCallback } from 'react'
import { Skeleton } from '@/components/ui'
import { useInView } from '@/hooks/useInView'
import { usePostsFeed } from '../hooks/usePosts'
import type { PostSort } from '../types'
import { PostCard } from './PostCard'

export function PostList({
  communityId,
  sort,
  showCommunity = true,
}: {
  communityId?: string
  sort: PostSort
  showCommunity?: boolean
}) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    usePostsFeed(communityId, sort)

  const handleInView = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const sentinelRef = useInView<HTMLDivElement>(handleInView, Boolean(hasNextPage))

  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No posts yet. Be the first to share something.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} showCommunity={showCommunity} />
      ))}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      {isFetchingNextPage && <Skeleton className="h-32" />}
    </div>
  )
}
