import { useState } from 'react'
import { MessagesSquare } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useCommentsRealtimeSync, useCommentTree } from '../hooks/useComments'
import type { CommentSort } from '../types'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'
import { CommentSortTabs } from './CommentSortTabs'

export function CommentThread({ postId }: { postId: string }) {
  const [sort, setSort] = useState<CommentSort>('best')
  const { tree, count, isLoading } = useCommentTree(postId, sort)
  useCommentsRealtimeSync(postId)

  return (
    <section
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7"
      aria-label="Comments"
    >
      <CommentForm postId={postId} />

      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          Discussion
          <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        </h2>
        <CommentSortTabs value={sort} onChange={setSort} />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      )}

      {!isLoading && tree.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <MessagesSquare className="h-6 w-6 text-subtle-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to offer support or share your experience.
          </p>
        </div>
      )}

      <div className="flex flex-col divide-y divide-border">
        {tree.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>
    </section>
  )
}
