import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search } from 'lucide-react'
import { Input, Skeleton } from '@/components/ui'
import { useCommunities } from '@/features/communities/hooks/useCommunities'
import { CommunityCard } from '@/features/communities/components/CommunityCard'

export default function CommunitiesPage() {
  const { data: communities, isLoading } = useCommunities()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawQuery = searchParams.get('q') ?? ''
  const query = rawQuery.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!query || !communities) return communities
    return communities.filter(
      (community) =>
        community.name.toLowerCase().includes(query) ||
        community.slug.toLowerCase().includes(query) ||
        community.description?.toLowerCase().includes(query),
    )
  }, [communities, query])

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Browse communities · CareCircle</title>
      </Helmet>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Browse communities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find people who understand what you&apos;re going through.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={rawQuery}
          onChange={(e) => {
            const value = e.target.value
            setSearchParams(value ? { q: value } : {}, { replace: true })
          }}
          placeholder="Search communities..."
          className="pl-9"
          aria-label="Search communities"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        {filtered?.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {!isLoading && filtered?.length === 0 && (
        <p className="text-center text-muted-foreground">
          {query ? `No communities match "${rawQuery}".` : 'No communities yet.'}
        </p>
      )}
    </div>
  )
}
