import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { MarkdownContent } from '@/components/MarkdownContent'
import { useCommunity, useWikiPage } from '@/features/communities/hooks/useCommunities'
import NotFoundPage from './NotFoundPage'

export default function WikiPagePage() {
  const { slug, wikiSlug } = useParams<{ slug: string; wikiSlug: string }>()
  const { data: community, isLoading: isLoadingCommunity } = useCommunity(slug)
  const { data: page, isLoading: isLoadingPage } = useWikiPage(community?.id, wikiSlug)

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

      <h1 className="text-2xl font-semibold text-foreground">{page.title}</h1>

      {page.content ? (
        <MarkdownContent content={page.content} />
      ) : (
        <p className="text-sm text-muted-foreground">This page has no content yet.</p>
      )}
    </div>
  )
}
