import { useState } from 'react'
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
    <section className="flex flex-col gap-4" aria-label="Comments">
      <CommentForm postId={postId} />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {count} {count === 1 ? 'comment' : 'comments'}
        </h2>
        <CommentSortTabs value={sort} onChange={setSort} />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}

      {!isLoading && tree.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No comments yet. Start the conversation.
        </p>
      )}

      <div className="flex flex-col divide-y divide-border">
        {tree.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>
    </section>
  )
}
