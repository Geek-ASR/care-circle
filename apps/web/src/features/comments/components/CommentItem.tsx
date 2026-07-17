import { useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { ChevronDown, ChevronRight, MessageSquare, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { MarkdownContent } from '@/components/MarkdownContent'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { VoteControl } from '@/features/voting/components/VoteControl'
import { ReportDialog } from '@/features/reports/components/ReportDialog'
import { ReactionBar } from '@/features/reactions/components/ReactionBar'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'
import type { CommentNode } from '../types'
import { useDeleteComment, useUpdateComment } from '../hooks/useComments'
import { CommentForm } from './CommentForm'

const MAX_INDENT_DEPTH = 6

export function CommentItem({
  comment,
  postId,
  depth = 0,
}: {
  comment: CommentNode
  postId: string
  depth?: number
}) {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState(comment.body ?? '')

  const updateComment = useUpdateComment(postId)
  const deleteComment = useDeleteComment(postId)

  const isOwner = user?.id === comment.author_id
  const isRemoved = comment.status !== 'published'
  const authorName =
    comment.author?.display_name ?? comment.author?.username ?? '[deleted]'

  return (
    <div
      className={cn(depth > 0 && 'ml-3 border-l border-border pl-3 sm:ml-4 sm:pl-4')}
      style={depth > MAX_INDENT_DEPTH ? { marginLeft: 0, paddingLeft: 12 } : undefined}
    >
      <div className="flex gap-2 py-2">
        <VoteControl
          target={{ type: 'comment', id: comment.id }}
          score={comment.score}
          userVote={comment.userVote}
          orientation="vertical"
          size="sm"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand thread' : 'Collapse thread'}
              className="flex items-center gap-1 hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              <span className="font-medium text-foreground">{authorName}</span>
            </button>
            <span>·</span>
            <span>
              {formatDistanceToNowStrict(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </span>
            {comment.is_edited && <span className="italic">(edited)</span>}
          </div>

          {!collapsed && (
            <>
              {editing ? (
                <div className="mt-1 flex flex-col gap-2">
                  <MarkdownEditor value={editBody} onChange={setEditBody} minRows={3} />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={updateComment.isPending}
                      onClick={async () => {
                        await updateComment.mutateAsync({
                          commentId: comment.id,
                          body: editBody,
                        })
                        setEditing(false)
                      }}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-1">
                  {isRemoved ? (
                    <p className="text-sm italic text-muted-foreground">
                      [{comment.status === 'deleted' ? 'deleted' : 'removed'}]
                    </p>
                  ) : (
                    <MarkdownContent content={comment.body ?? ''} />
                  )}
                </div>
              )}

              {!isRemoved && !editing && (
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() => setReplying((r) => !r)}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Reply
                  </button>
                  {!isOwner && (
                    <ReportDialog targetType="comment" targetId={comment.id} />
                  )}
                  {isOwner && (
                    <>
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => setEditing(true)}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-danger"
                        onClick={() => deleteComment.mutate(comment.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </>
                  )}
                </div>
              )}

              {!isRemoved && !editing && (
                <div className="mt-1.5">
                  <ReactionBar
                    postId={postId}
                    commentId={comment.id}
                    reactions={comment.reactions}
                  />
                </div>
              )}

              {replying && (
                <div className="mt-2">
                  <CommentForm
                    postId={postId}
                    parentCommentId={comment.id}
                    placeholder={`Reply to ${authorName}…`}
                    onDone={() => setReplying(false)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!collapsed && comment.children.length > 0 && (
        <div>
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
