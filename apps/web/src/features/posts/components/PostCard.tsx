import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import { MessageSquare, Pin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui'
import { VoteControl } from '@/features/voting/components/VoteControl'
import { getPostMediaUrl } from '../api/postMedia'
import type { PostWithVote } from '../hooks/usePosts'
import { PostTypeBadge } from './PostTypeBadge'
import { StarRating } from './StarRating'

export function PostCard({
  post,
  showCommunity = true,
}: {
  post: PostWithVote
  showCommunity?: boolean
}) {
  const authorName = post.author?.display_name ?? post.author?.username ?? '[deleted]'
  const authorInitial = authorName.charAt(0).toUpperCase()
  const thumbnail = post.post_media?.[0]?.storage_path
    ? getPostMediaUrl(post.post_media[0].storage_path)
    : null

  return (
    <article className="flex gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-surface-hover">
      <VoteControl
        target={{ type: 'post', id: post.id }}
        score={post.score}
        userVote={post.userVote}
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {post.is_pinned && (
            <span className="flex items-center gap-1 text-primary">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
          {showCommunity && post.community && (
            <Link
              to={`/r/${post.community.slug}`}
              className="font-medium text-foreground hover:underline"
            >
              r/{post.community.slug}
            </Link>
          )}
          <span>·</span>
          <Avatar className="h-4 w-4">
            <AvatarImage src={post.author?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="text-[9px]">{authorInitial}</AvatarFallback>
          </Avatar>
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

        <Link to={`/posts/${post.id}`} className="block">
          <h2 className="text-base font-semibold leading-snug text-foreground">
            {post.title}
          </h2>
        </Link>

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <PostTypeBadge postType={post.post_type} />
          {post.rating != null && <StarRating value={post.rating} size="sm" />}
          {post.is_nsfw && <Badge variant="danger">NSFW</Badge>}
          {post.is_spoiler && <Badge variant="warning">Spoiler</Badge>}
          {post.post_tags?.map(({ tag }) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>

        {post.post_type === 'link' && post.url && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block truncate text-sm text-primary hover:underline"
          >
            {post.url}
          </a>
        )}

        {thumbnail && (
          <Link to={`/posts/${post.id}`} className="mt-2 block">
            <img
              src={thumbnail}
              alt=""
              className="max-h-80 w-full rounded-md border border-border object-cover"
              loading="lazy"
            />
          </Link>
        )}

        <Link
          to={`/posts/${post.id}`}
          className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <MessageSquare className="h-4 w-4" />
          {post.comment_count} comments
        </Link>
      </div>
    </article>
  )
}
