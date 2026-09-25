import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { formatDistanceToNowStrict } from 'date-fns'
import { ArrowLeft, MessageSquare, Pencil, Share2, Trash2 } from 'lucide-react'
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
import { ModeratorPostActions } from '@/features/moderation/components/ModeratorPostActions'
import { useIsModeratorOfCommunity } from '@/features/moderation/hooks/useModeration'
import { EditHistoryDialog } from '@/features/posts/components/EditHistoryDialog'
import { useAuth } from '@/contexts/AuthContext'
import {
  usePost,
  usePostRealtimeSync,
  useSetPostStatus,
} from '@/features/posts/hooks/usePosts'
import { usePostMedia } from '@/features/posts/hooks/usePostMedia'
import { getPostMediaUrl } from '@/features/posts/api/postMedia'
import { updatePostContent } from '@/features/posts/api/posts'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { sharePost } from '@/features/posts/utils/share'
import { useMyRestriction } from '@/features/community-bans/hooks/useCommunityBans'
import { RestrictionNotice } from '@/features/community-bans/components/RestrictionNotice'
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
  const { isModerator } = useIsModeratorOfCommunity(post?.community_id)
  const { restriction } = useMyRestriction(post?.community_id)

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
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
    await queryClient.invalidateQueries({ queryKey: ['post-versions', postId] })
    setEditing(false)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Helmet>
        <title>{post.title} · CareCircle</title>
        {post.body && <meta name="description" content={post.body.slice(0, 160)} />}
      </Helmet>

      <Link
        to={post.community ? `/r/${post.community.slug}` : '/'}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {post.community ? `Back to ${post.community.name}` : 'Back to feed'}
      </Link>

      <article className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7">
        <div className="min-w-0 flex-1">
          <header className="flex items-center gap-3 text-xs text-muted-foreground">
            {post.community && (
              <Link to={`/r/${post.community.slug}`} className="shrink-0">
                <CommunityAvatar
                  name={post.community.name}
                  slug={post.community.slug}
                  size="md"
                />
              </Link>
            )}
            <div className="flex min-w-0 flex-col gap-0.5">
              {post.community && (
                <Link
                  to={`/r/${post.community.slug}`}
                  className="truncate text-sm font-semibold text-foreground hover:text-primary"
                >
                  {post.community.name}
                </Link>
              )}
              <span className="truncate">
                {post.author ? (
                  <Link
                    to={`/u/${post.author.username}`}
                    className="font-medium text-foreground/80 hover:text-foreground"
                  >
                    {authorName}
                  </Link>
                ) : (
                  authorName
                )}{' '}
                ·{' '}
                {formatDistanceToNowStrict(new Date(post.created_at), {
                  addSuffix: true,
                })}
                {post.edited_at && ' · edited'}
              </span>
            </div>
          </header>

          {editing ? (
            <div className="flex flex-col gap-2">
              <input
                className="mt-5 rounded-lg border border-border bg-surface px-3 py-2 font-display text-lg font-semibold text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
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
              <h1 className="mt-5 font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-[28px]">
                {post.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PostTypeBadge postType={post.post_type} />
                {post.rating != null && <StarRating value={post.rating} size="sm" />}
                {post.is_nsfw && <Badge variant="danger">NSFW</Badge>}
                {post.is_spoiler && <Badge variant="warning">Spoiler</Badge>}
                {post.is_locked && <Badge variant="outline">Locked</Badge>}
                {post.post_tags?.map(({ tag }) => (
                  <Badge key={tag.id} variant="outline">
                    #{tag.name}
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
                  className="mt-4 flex items-center gap-2 break-all rounded-xl border border-border bg-surface-sunken px-4 py-3 text-sm font-medium text-primary transition-colors hover:border-primary/40"
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
                    className="mt-4 max-h-[36rem] w-full rounded-xl border border-border bg-surface-sunken object-contain"
                  />
                ))}

              {post.body && (
                <MarkdownContent
                  content={post.body}
                  className="mt-5 text-[15px] leading-relaxed"
                />
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
                <VoteControl
                  target={{ type: 'post', id: post.id }}
                  score={post.score}
                  userVote={post.userVote}
                  orientation="horizontal"
                />
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
                </span>
                <BookmarkButton postId={post.id} />
                <button
                  type="button"
                  onClick={() => void sharePost(post.id, post.title)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" /> Share
                </button>
                {!isOwner && (
                  <span className="ml-auto">
                    <ReportDialog targetType="post" targetId={post.id} />
                  </span>
                )}
              </div>

              {post.edited_at && (isOwner || isModerator) && (
                <div className="mt-3">
                  <EditHistoryDialog
                    postId={post.id}
                    current={{
                      createdAt: post.created_at,
                      title: post.title,
                      body: post.body,
                      editedAt: post.edited_at,
                    }}
                  />
                </div>
              )}

              <ModeratorPostActions
                postId={post.id}
                communityId={post.community_id}
                author={
                  post.author_id && post.author && !isOwner
                    ? { id: post.author_id, name: authorName }
                    : null
                }
                isPinned={post.is_pinned}
                isLocked={post.is_locked}
              />

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
        <p className="rounded-xl border border-border bg-surface-sunken px-4 py-3 text-center text-sm text-muted-foreground">
          This post is locked. New comments are disabled.
        </p>
      ) : (
        <CommentThread
          postId={post.id}
          readOnlyNotice={
            restriction ? <RestrictionNotice restriction={restriction} /> : undefined
          }
        />
      )}
    </div>
  )
}
