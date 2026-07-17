import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui'
import { useBookmarkedPosts } from '@/features/bookmarks/hooks/useBookmarks'
import { PostCard } from '@/features/posts/components/PostCard'

export default function SavedPostsPage() {
  const { data: posts, isLoading } = useBookmarkedPosts()

  return (
    <div className="flex flex-col gap-4">
      <Helmet>
        <title>Saved posts · CareCircle</title>
      </Helmet>
      <h1 className="text-xl font-semibold text-foreground">Saved posts</h1>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      )}

      {!isLoading && posts?.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Posts you save will show up here.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
