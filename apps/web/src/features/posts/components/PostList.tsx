import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MessagesSquare, UserPlus } from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/EmptyState'
import { useInView } from '@/hooks/useInView'
import { usePostsFeed } from '../hooks/usePosts'
import type { PostSort } from '../types'
import { PostCard } from './PostCard'

export function PostList({
  communityId,
  sort,
  showCommunity = true,
  feedScope = 'all',
}: {
  communityId?: string
  sort: PostSort
  showCommunity?: boolean
  feedScope?: 'all' | 'following'
}) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    usePostsFeed(communityId, sort, feedScope)

  const handleInView = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const sentinelRef = useInView<HTMLDivElement>(handleInView, Boolean(hasNextPage))

  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={feedScope === 'following' ? UserPlus : MessagesSquare}
        title={
          feedScope === 'following' ? 'Your following feed is empty' : 'No posts yet'
        }
        description={
          feedScope === 'following'
            ? 'Follow people whose stories resonate with you and their posts will show up here.'
            : 'Start the conversation — ask a question or share what has helped you.'
        }
        action={
          feedScope === 'following' ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/communities">Explore communities</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/submit">Create a post</Link>
            </Button>
          )
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} showCommunity={showCommunity} />
      ))}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      {isFetchingNextPage && <PostCardSkeleton />}
    </div>
  )
}

function PostCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    </div>
  )
}
