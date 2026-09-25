import { Navigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LoadingScreen } from '@/components/LoadingScreen'
import { getCommunitySlugById } from '@/features/communities/api/communities'
import NotFoundPage from './NotFoundPage'

/**
 * /community/:communityId -> /r/:slug. Lets things that only know a community's id
 * (e.g. system notifications) link to it without also storing the slug.
 */
export default function CommunityRedirectPage() {
  const { communityId } = useParams<{ communityId: string }>()
  const { data: slug, isLoading } = useQuery({
    queryKey: ['community-slug', communityId],
    queryFn: () => getCommunitySlugById(communityId as string),
    enabled: Boolean(communityId),
  })

  if (isLoading) return <LoadingScreen />
  if (!slug) return <NotFoundPage />
  return <Navigate to={`/r/${slug}`} replace />
}
