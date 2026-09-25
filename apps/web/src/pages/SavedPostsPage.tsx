import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui'
import { useBookmarkedPosts } from '@/features/bookmarks/hooks/useBookmarks'
import { PostCard } from '@/features/posts/components/PostCard'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Bookmark } from 'lucide-react'

export default function SavedPostsPage() {
  const { data: posts, isLoading } = useBookmarkedPosts()

  return (
    <div className="flex flex-col gap-4">
      <Helmet>
        <title>Saved posts · CareCircle</title>
      </Helmet>
      <PageHeader
        icon={Bookmark}
        title="Saved posts"
        description="Posts you've bookmarked to come back to."
      />

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      )}

      {!isLoading && posts?.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap Save on any post to keep it here for later."
        />
      )}

      <div className="flex flex-col gap-3">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
