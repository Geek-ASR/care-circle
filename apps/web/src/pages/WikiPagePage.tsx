import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronLeft, Pencil } from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { useIsModeratorOfCommunity } from '@/features/moderation/hooks/useModeration'
import { MarkdownContent } from '@/components/MarkdownContent'
import { useCommunity, useWikiPage } from '@/features/communities/hooks/useCommunities'
import NotFoundPage from './NotFoundPage'

export default function WikiPagePage() {
  const { slug, wikiSlug } = useParams<{ slug: string; wikiSlug: string }>()
  const { data: community, isLoading: isLoadingCommunity } = useCommunity(slug)
  const { data: page, isLoading: isLoadingPage } = useWikiPage(community?.id, wikiSlug)
  const { isModerator } = useIsModeratorOfCommunity(community?.id)

  if (isLoadingCommunity || isLoadingPage) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40" />
      </div>
    )
  }

  if (!community || !page) return <NotFoundPage />

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Helmet>
        <title>
          {page.title} · r/{community.slug} wiki · CareCircle
        </title>
      </Helmet>

      <Link
        to={`/r/${community.slug}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to r/{community.slug}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          {page.title}
        </h1>
        {isModerator && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/r/${community.slug}/settings?tab=wiki&page=${page.slug}`}>
              <Pencil className="h-4 w-4" /> Edit page
            </Link>
          </Button>
        )}
      </div>
      <p className="-mt-2 text-xs text-subtle-foreground">
        Version {page.version} · updated {new Date(page.updated_at).toLocaleDateString()}
      </p>

      {page.content ? (
        <article className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7">
          <MarkdownContent content={page.content} />
        </article>
      ) : (
        <p className="text-sm text-muted-foreground">This page has no content yet.</p>
      )}
    </div>
  )
}
