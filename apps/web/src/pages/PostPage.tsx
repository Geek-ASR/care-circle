import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { formatDistanceToNowStrict } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge, Button, Skeleton } from '@/components/ui'
import { MarkdownContent } from '@/components/MarkdownContent'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { VoteControl } from '@/features/voting/components/VoteControl'
import { PostTypeBadge } from '@/features/posts/components/PostTypeBadge'
import { StarRating } from '@/features/posts/components/StarRating'
import { PollVoting } from '@/features/polls/components/PollVoting'
import { CommentThread } from '@/features/comments/components/CommentThread'
import { BookmarkButton } from '@/features/bookmarks/components/BookmarkButton'
import { ReportDialog } from '@/features/reports/components/ReportDialog'
import { useAuth } from '@/contexts/AuthContext'
import {
  usePost,
  usePostRealtimeSync,
  useSetPostStatus,
} from '@/features/posts/hooks/usePosts'
import { usePostMedia } from '@/features/posts/hooks/usePostMedia'
import { getPostMediaUrl } from '@/features/posts/api/postMedia'
import { updatePostContent } from '@/features/posts/api/posts'
import NotFoundPage from './NotFoundPage'

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: post, isLoading } = usePost(postId)
  const { data: media } = usePostMedia(post?.post_type === 'image' ? postId : undefined)
  const setPostStatus = useSetPostStatus()
  usePostRealtimeSync(postId)

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (!post || post.status !== 'published') return <NotFoundPage />

  const isOwner = user?.id === post.author_id
  const authorName = post.author?.display_name ?? post.author?.username ?? '[deleted]'

  function startEditing() {
    setEditTitle(post!.title)
    setEditBody(post!.body ?? '')
    setEditing(true)
  }

  async function saveEdit() {
    if (!postId || !user) return
    await updatePostContent(postId, user.id, { title: editTitle, body: editBody || null })
    await queryClient.invalidateQueries({ queryKey: ['post', postId], exact: false })
    setEditing(false)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Helmet>
        <title>{post.title} · CareCircle</title>
        {post.body && <meta name="description" content={post.body.slice(0, 160)} />}
      </Helmet>

      <article className="flex gap-3 rounded-lg border border-border bg-surface p-4">
        <VoteControl
          target={{ type: 'post', id: post.id }}
          score={post.score}
          userVote={post.userVote}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {post.community && (
              <Link
                to={`/r/${post.community.slug}`}
                className="font-medium text-foreground hover:underline"
              >
                r/{post.community.slug}
              </Link>
            )}
            <span>·</span>
            {post.author ? (
              <span>
                Posted by{' '}
                <Link
                  to={`/u/${post.author.username}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {authorName}
                </Link>
              </span>
            ) : (
              <span>Posted by {authorName}</span>
            )}
            <span>·</span>
            <span>
              {formatDistanceToNowStrict(new Date(post.created_at), { addSuffix: true })}
            </span>
            {post.edited_at && <span className="italic">(edited)</span>}
          </div>

          {editing ? (
            <div className="flex flex-col gap-2">
              <input
                className="rounded-md border border-border bg-surface px-3 py-2 text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <MarkdownEditor value={editBody} onChange={setEditBody} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => void saveEdit()}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold leading-snug text-foreground">
                {post.title}
              </h1>

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <PostTypeBadge postType={post.post_type} />
                {post.rating != null && <StarRating value={post.rating} size="sm" />}
                {post.is_nsfw && <Badge variant="danger">NSFW</Badge>}
                {post.is_spoiler && <Badge variant="warning">Spoiler</Badge>}
                {post.is_locked && <Badge variant="outline">Locked</Badge>}
                {post.post_tags?.map(({ tag }) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {post.post_type === 'poll' && (
                <div className="mt-3">
                  <PollVoting postId={post.id} />
                </div>
              )}

              {post.post_type === 'link' && post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block break-all text-sm text-primary hover:underline"
                >
                  {post.url}
                </a>
              )}

              {post.post_type === 'image' &&
                media?.map((item) => (
                  <img
                    key={item.id}
                    src={getPostMediaUrl(item.storage_path)}
                    alt=""
                    className="mt-3 max-h-[32rem] w-full rounded-md object-contain"
                  />
                ))}

              {post.body && <MarkdownContent content={post.body} className="mt-3" />}

              <div className="mt-3 flex items-center gap-4">
                <BookmarkButton postId={post.id} />
                {!isOwner && <ReportDialog targetType="post" targetId={post.id} />}
              </div>

              {isOwner && (
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={startEditing}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-danger"
                    onClick={async () => {
                      await setPostStatus.mutateAsync({
                        postId: post.id,
                        status: 'deleted',
                      })
                      navigate(post.community ? `/r/${post.community.slug}` : '/')
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </article>

      {post.is_locked ? (
        <p className="text-center text-sm text-muted-foreground">
          This post is locked. New comments are disabled.
        </p>
      ) : (
        <CommentThread postId={post.id} />
      )}
    </div>
  )
}
