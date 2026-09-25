import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Compass, Plus, Search, SearchX } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
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
      <PageHeader
        icon={Compass}
        title="Browse communities"
        description="Find people who understand what you're going through — every condition, not just the chronic ones."
        actions={
          user && (
            <Button asChild size="sm">
              <Link to="/communities/new">
                <Plus className="h-4 w-4" /> Create community
              </Link>
            </Button>
          )
        }
      />

      <div className="relative max-w-lg">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
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
          placeholder="Search by name, condition or keyword…"
          className="h-11 pl-10"
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
                  ? 'inline-flex shrink-0 items-center rounded-full border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm'
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
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        {filtered?.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {!isLoading && filtered?.length === 0 && (
        <EmptyState
          icon={SearchX}
          title={
            query || activeCategory
              ? 'No communities match your filters'
              : 'No communities yet'
          }
          description={
            user
              ? "Can't find your condition? Start a community for it — every circle begins with one person."
              : 'Try a different search or category.'
          }
          action={
            user && (
              <Button asChild size="sm" variant="outline">
                <Link to="/communities/new">
                  <Plus className="h-4 w-4" /> Start a community
                </Link>
              </Button>
            )
          }
        />
      )}
    </div>
  )
}
