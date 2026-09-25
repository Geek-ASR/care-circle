import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { BookOpen, ExternalLink, Plus, Settings2, Users } from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCommunity,
  useCommunityResources,
  useCommunityRules,
  useWikiPages,
} from '@/features/communities/hooks/useCommunities'
import { JoinLeaveButton } from '@/features/communities/components/JoinLeaveButton'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { avatarGradient } from '@/utils/avatarColor'
import { getConditionCategory } from '@/features/conditions/constants'
import { PostList } from '@/features/posts/components/PostList'
import { PostSortTabs } from '@/features/posts/components/PostSortTabs'
import type { PostSort } from '@/features/posts/types'
import { useIsModeratorOfCommunity } from '@/features/moderation/hooks/useModeration'
import { useMyRestriction } from '@/features/community-bans/hooks/useCommunityBans'
import { RestrictionNotice } from '@/features/community-bans/components/RestrictionNotice'
import NotFoundPage from './NotFoundPage'

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { data: community, isLoading } = useCommunity(slug)
  const { data: rules } = useCommunityRules(community?.id)
  const { data: resources } = useCommunityResources(community?.id)
  const { data: wikiPages } = useWikiPages(community?.id)
  const [sort, setSort] = useState<PostSort>('hot')
  const { isModerator } = useIsModeratorOfCommunity(community?.id)
  const { restriction } = useMyRestriction(community?.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    )
  }

  if (!community) return <NotFoundPage />

  const conditionCategory = getConditionCategory(community.condition?.category ?? null)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Helmet>
        <title>{community.name} · CareCircle</title>
        <meta name="description" content={community.description ?? undefined} />
      </Helmet>

      {!community.is_approved && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3.5 text-sm text-foreground lg:col-span-2">
          This community is pending admin approval and isn&apos;t visible to other members
          yet. Only you can see it right now.
        </div>
      )}

      <div className="flex flex-col gap-5 lg:col-span-2">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
          <div className="relative h-32 w-full sm:h-40">
            {community.banner_url ? (
              <img
                src={community.banner_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="relative h-full w-full bg-surface-sunken"
              >
                <div
                  className={`absolute inset-0 opacity-35 ${avatarGradient(community.slug)}`}
                />
                <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent" />
                <div className="bg-dot-grid absolute inset-0 opacity-50" />
              </div>
            )}
          </div>
          <div className="px-5 pb-5 sm:px-6">
            <div className="relative -mt-10 flex flex-wrap items-end justify-between gap-4">
              <CommunityAvatar
                name={community.name}
                slug={community.slug}
                logoUrl={community.logo_url}
                size="xl"
                className="border-4 border-surface shadow-md"
              />
              <div className="flex items-center gap-2">
                {isModerator && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/r/${community.slug}/settings`}>
                      <Settings2 className="h-4 w-4" /> Manage
                    </Link>
                  </Button>
                )}
                {user && !restriction && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/submit?community=${community.slug}`}>
                      <Plus className="h-4 w-4" /> Create post
                    </Link>
                  </Button>
                )}
                {restriction?.kind !== 'ban' && (
                  <JoinLeaveButton communityId={community.id} />
                )}
              </div>
            </div>
            <div className="mt-3">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
                {community.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>r/{community.slug}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="font-medium text-foreground">
                    {community.member_count.toLocaleString()}
                  </span>
                  {community.member_count === 1 ? 'member' : 'members'}
                </span>
                {conditionCategory && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <conditionCategory.icon
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      {conditionCategory.label}
                    </span>
                  </>
                )}
              </div>
              {community.description && (
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {community.description}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        {restriction && <RestrictionNotice restriction={restriction} />}
        <PostSortTabs value={sort} onChange={setSort} />

        <PostList communityId={community.id} sort={sort} showCommunity={false} />
      </div>

      <aside className="flex flex-col gap-4">
        {rules && rules.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h2 className="mb-3 font-display text-sm font-semibold text-foreground">
              Community rules
            </h2>
            <ol className="flex flex-col gap-3">
              {rules.map((rule, i) => (
                <li key={rule.id} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-medium text-foreground">{rule.title}</span>
                    {rule.description && <p className="mt-0.5">{rule.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {resources && resources.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h2 className="mb-3 font-display text-sm font-semibold text-foreground">
              Resources
            </h2>
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
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h2 className="mb-3 font-display text-sm font-semibold text-foreground">
              Wiki
            </h2>
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

        {community.condition && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-xs">
            {conditionCategory && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-hover px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <conditionCategory.icon
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                {conditionCategory.label}
              </span>
            )}
            <Link
              to={`/resources?condition=${community.condition.slug}`}
              className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {community.condition.name} resources
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
