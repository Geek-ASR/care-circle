import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { BookOpen, ExternalLink, Plus, Users } from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCommunity,
  useCommunityResources,
  useCommunityRules,
  useWikiPages,
} from '@/features/communities/hooks/useCommunities'
import { JoinLeaveButton } from '@/features/communities/components/JoinLeaveButton'
import { PostList } from '@/features/posts/components/PostList'
import { PostSortTabs } from '@/features/posts/components/PostSortTabs'
import type { PostSort } from '@/features/posts/types'
import NotFoundPage from './NotFoundPage'

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { data: community, isLoading } = useCommunity(slug)
  const { data: rules } = useCommunityRules(community?.id)
  const { data: resources } = useCommunityResources(community?.id)
  const { data: wikiPages } = useWikiPages(community?.id)
  const [sort, setSort] = useState<PostSort>('hot')

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!community) return <NotFoundPage />

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <Helmet>
        <title>{community.name} · CareCircle</title>
        <meta name="description" content={community.description ?? undefined} />
      </Helmet>

      {!community.is_approved && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground lg:col-span-2">
          This community is pending admin approval and isn&apos;t visible to other members
          yet. Only you can see it right now.
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {community.banner_url && (
            <div className="h-32 w-full bg-surface-hover">
              <img
                src={community.banner_url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {community.logo_url ? (
                  <img
                    src={community.logo_url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {community.name.charAt(0)}
                  </span>
                )}
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {community.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">r/{community.slug}</p>
                </div>
              </div>
              <JoinLeaveButton communityId={community.id} />
            </div>
            {community.description && (
              <p className="mt-3 text-sm text-muted-foreground">
                {community.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {community.member_count.toLocaleString()} members
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <PostSortTabs value={sort} onChange={setSort} />
          {user && (
            <Button asChild size="sm" variant="outline">
              <Link to={`/submit?community=${community.slug}`}>
                <Plus className="h-4 w-4" /> Create post
              </Link>
            </Button>
          )}
        </div>

        <PostList communityId={community.id} sort={sort} showCommunity={false} />
      </div>

      <aside className="flex flex-col gap-4">
        {rules && rules.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Community rules
            </h2>
            <ol className="flex flex-col gap-2">
              {rules.map((rule, i) => (
                <li key={rule.id} className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {i + 1}. {rule.title}
                  </span>
                  {rule.description && <p className="mt-0.5">{rule.description}</p>}
                </li>
              ))}
            </ol>
          </div>
        )}

        {resources && resources.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Resources</h2>
            <ul className="flex flex-col gap-2">
              {resources.map((resource) => (
                <li key={resource.id} className="text-sm">
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      {resource.title}
                    </a>
                  ) : (
                    <span className="text-foreground">{resource.title}</span>
                  )}
                  {resource.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {resource.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {wikiPages && wikiPages.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Wiki</h2>
            <ul className="flex flex-col gap-2">
              {wikiPages.map((page) => (
                <li key={page.id}>
                  <Link
                    to={`/r/${community.slug}/wiki/${page.slug}`}
                    className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary"
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  )
}
