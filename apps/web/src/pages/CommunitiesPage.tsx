import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Plus, Search } from 'lucide-react'
import { Button, Input, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useCommunities } from '@/features/communities/hooks/useCommunities'
import { CommunityCard } from '@/features/communities/components/CommunityCard'
import { CategoryChip } from '@/features/conditions/components/CategoryChip'
import { CONDITION_CATEGORIES } from '@/features/conditions/constants'

export default function CommunitiesPage() {
  const { user } = useAuth()
  const { data: communities, isLoading } = useCommunities()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawQuery = searchParams.get('q') ?? ''
  const query = rawQuery.trim().toLowerCase()
  const activeCategory = searchParams.get('category') ?? ''

  const availableCategories = useMemo(() => {
    if (!communities) return []
    const present = new Set(
      communities
        .map((c) => c.condition?.category)
        .filter((c): c is string => Boolean(c)),
    )
    return CONDITION_CATEGORIES.filter((c) => present.has(c.value))
  }, [communities])

  const filtered = useMemo(() => {
    if (!communities) return communities
    return communities.filter((community) => {
      const matchesQuery =
        !query ||
        community.name.toLowerCase().includes(query) ||
        community.slug.toLowerCase().includes(query) ||
        community.description?.toLowerCase().includes(query)
      const matchesCategory =
        !activeCategory || community.condition?.category === activeCategory
      return matchesQuery && matchesCategory
    })
  }, [communities, query, activeCategory])

  function setCategory(value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('category', value)
    else next.delete('category')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Browse communities · CareCircle</title>
      </Helmet>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Browse communities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Find people who understand what you&apos;re going through — every condition,
            not just the chronic ones.
          </p>
        </div>
        {user && (
          <Button asChild size="sm" variant="outline">
            <Link to="/communities/new">
              <Plus className="h-4 w-4" /> Create community
            </Link>
          </Button>
        )}
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
            const next = new URLSearchParams(searchParams)
            if (value) next.set('q', value)
            else next.delete('q')
            setSearchParams(next, { replace: true })
          }}
          placeholder="Search communities..."
          className="pl-9"
          aria-label="Search communities"
        />
      </div>

      {availableCategories.length > 0 && (
        <fieldset className="flex flex-wrap gap-2 border-0 p-0">
          <legend className="sr-only">Filter by category</legend>
          <button type="button" onClick={() => setCategory('')}>
            <span
              className={
                !activeCategory
                  ? 'inline-flex shrink-0 items-center rounded-full border border-primary bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary'
                  : 'inline-flex shrink-0 items-center rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground'
              }
            >
              All
            </span>
          </button>
          {availableCategories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() =>
                setCategory(activeCategory === category.value ? '' : category.value)
              }
            >
              <CategoryChip
                category={category}
                active={activeCategory === category.value}
              />
            </button>
          ))}
        </fieldset>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        {filtered?.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {!isLoading && filtered?.length === 0 && (
        <p className="text-center text-muted-foreground">
          {query || activeCategory
            ? 'No communities match your filters.'
            : 'No communities yet.'}
        </p>
      )}
    </div>
  )
}
