import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, Users } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Input,
  Skeleton,
} from '@/components/ui'
import { PostTypeBadge } from '@/features/posts/components/PostTypeBadge'
import { useSearch } from '@/features/search/hooks/useSearch'

function SearchSection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: ReactNode
}) {
  if (count === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title} · {count}
      </h2>
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {children}
      </div>
    </section>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { data, isLoading, isSearching } = useSearch(query)

  const totalResults =
    data.posts.length + data.communities.length + data.users.length + data.tags.length

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Helmet>
        <title>{query ? `Search: ${query}` : 'Search'} · CareCircle</title>
      </Helmet>

      <div>
        <h1 className="mb-3 text-xl font-semibold text-foreground">Search</h1>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              const value = e.target.value
              setSearchParams(value ? { q: value } : {}, { replace: true })
            }}
            placeholder="Search posts, communities, people, tags..."
            className="pl-9"
            aria-label="Search"
          />
        </div>
      </div>

      {!isSearching && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Type at least 2 characters to search.
        </p>
      )}

      {isSearching && isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      )}

      {isSearching && !isLoading && totalResults === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No results for &ldquo;{query}&rdquo;.
        </p>
      )}

      {isSearching && !isLoading && (
        <div className="flex flex-col gap-6">
          <SearchSection title="Communities" count={data.communities.length}>
            {data.communities.map((community) => (
              <Link
                key={community.id}
                to={`/r/${community.slug}`}
                className="flex items-center gap-3 p-3 hover:bg-surface-hover"
              >
                {community.logo_url ? (
                  <img
                    src={community.logo_url}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {community.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {community.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    /r/{community.slug} · {community.member_count.toLocaleString()}{' '}
                    members
                  </p>
                </div>
              </Link>
            ))}
          </SearchSection>

          <SearchSection title="Posts" count={data.posts.length}>
            {data.posts.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="flex flex-col gap-1 p-3 hover:bg-surface-hover"
              >
                <span className="text-sm font-medium text-foreground">{post.title}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <PostTypeBadge postType={post.post_type} />
                  {post.community && <span>r/{post.community.slug}</span>}
                </span>
              </Link>
            ))}
          </SearchSection>

          <SearchSection title="People" count={data.users.length}>
            {data.users.map((user) => (
              <Link
                key={user.id}
                to={`/u/${user.username}`}
                className="flex items-center gap-3 p-3 hover:bg-surface-hover"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                  <AvatarFallback>
                    {(user.display_name ?? user.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.display_name ?? user.username}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
                <Users
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </SearchSection>

          {data.tags.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Tags · {data.tags.length}
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
