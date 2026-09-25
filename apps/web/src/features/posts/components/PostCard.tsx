import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import { ExternalLink, MessageSquare, Pin, Share2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { ContributorFlair } from '@/features/reputation/components/ContributorFlair'
import { VoteControl } from '@/features/voting/components/VoteControl'
import { avatarGradient } from '@/utils/avatarColor'
import { markdownExcerpt } from '@/utils/markdownExcerpt'
import { getPostMediaUrl } from '../api/postMedia'
import { sharePost } from '../utils/share'
import type { PostWithVote } from '../hooks/usePosts'
import { PostTypeBadge } from './PostTypeBadge'
import { StarRating } from './StarRating'

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const actionClasses =
  'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground'

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
  const excerpt = markdownExcerpt(post.body)
  const timeAgo = formatDistanceToNowStrict(new Date(post.created_at), {
    addSuffix: true,
  })

  return (
    <article className="group rounded-2xl border border-border bg-surface p-4 shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md sm:p-5">
      <header className="flex items-center gap-2.5 text-xs text-muted-foreground">
        {showCommunity && post.community ? (
          <>
            <Link to={`/r/${post.community.slug}`} className="shrink-0">
              <CommunityAvatar
                name={post.community.name}
                slug={post.community.slug}
                size="sm"
              />
            </Link>
            <div className="flex min-w-0 flex-col">
              <Link
                to={`/r/${post.community.slug}`}
                className="truncate text-[13px] font-semibold text-foreground hover:text-primary"
              >
                {post.community.name}
              </Link>
              <span className="truncate">
                {post.author ? (
                  <Link
                    to={`/u/${post.author.username}`}
                    className="hover:text-foreground"
                  >
                    {authorName}
                  </Link>
                ) : (
                  authorName
                )}
                {post.author && (
                  <ContributorFlair
                    reputation={post.author.reputation_score}
                    className="ml-1 align-[-2px]"
                  />
                )}{' '}
                · {timeAgo}
                {post.edited_at && ' · edited'}
              </span>
            </div>
          </>
        ) : (
          <>
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author?.avatar_url ?? undefined} alt="" />
              <AvatarFallback
                className={`${avatarGradient(post.author?.username ?? authorName)} text-xs font-semibold text-white`}
              >
                {authorInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              {post.author ? (
                <Link
                  to={`/u/${post.author.username}`}
                  className="truncate text-[13px] font-semibold text-foreground hover:text-primary"
                >
                  {authorName}
                  <ContributorFlair
                    reputation={post.author.reputation_score}
                    className="ml-1 align-[-2px]"
                  />
                </Link>
              ) : (
                <span className="text-[13px] font-semibold">{authorName}</span>
              )}
              <span>
                {timeAgo}
                {post.edited_at && ' · edited'}
              </span>
            </div>
          </>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {post.is_pinned && (
            <Badge variant="primary">
              <Pin className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Pinned</span>
            </Badge>
          )}
          <PostTypeBadge postType={post.post_type} />
        </div>
      </header>

      <Link to={`/posts/${post.id}`} className="mt-3 block">
        <h2 className="font-display text-[17px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h2>
        {excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
        )}
      </Link>

      {(post.rating != null ||
        post.is_nsfw ||
        post.is_spoiler ||
        (post.post_tags?.length ?? 0) > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {post.rating != null && <StarRating value={post.rating} size="sm" />}
          {post.is_nsfw && <Badge variant="danger">NSFW</Badge>}
          {post.is_spoiler && <Badge variant="warning">Spoiler</Badge>}
          {post.post_tags?.map(({ tag }) => (
            <Badge key={tag.id} variant="outline">
              #{tag.name}
            </Badge>
          ))}
        </div>
      )}

      {post.post_type === 'link' && post.url && (
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface-sunken px-3.5 py-2.5 text-sm transition-colors hover:border-primary/40"
        >
          <ExternalLink className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-foreground">
              {hostnameOf(post.url)}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {post.url}
            </span>
          </span>
        </a>
      )}

      {thumbnail && (
        <Link to={`/posts/${post.id}`} className="mt-3 block">
          <img
            src={thumbnail}
            alt=""
            className="max-h-96 w-full rounded-xl border border-border object-cover"
            loading="lazy"
          />
        </Link>
      )}

      <footer className="mt-4 flex items-center gap-1.5">
        <VoteControl
          target={{ type: 'post', id: post.id }}
          score={post.score}
          userVote={post.userVote}
          orientation="horizontal"
          size="sm"
        />
        <Link to={`/posts/${post.id}`} className={actionClasses}>
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          {post.comment_count}
          <span className="hidden sm:inline">
            {post.comment_count === 1 ? 'comment' : 'comments'}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => void sharePost(post.id, post.title)}
          className={actionClasses}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Share</span>
          <span className="sr-only sm:hidden">Share</span>
        </button>
      </footer>
    </article>
  )
}
