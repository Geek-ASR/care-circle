import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { getConditionCategory } from '@/features/conditions/constants'
import type { SymptomCheckResult } from '@/types/database'

export function ResultsList({ results }: { results: SymptomCheckResult[] }) {
  if (results.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nothing matched closely enough to suggest a community. Try selecting a few more
        symptoms, or{' '}
        <Link to="/communities" className="text-primary hover:underline">
          browse communities
        </Link>{' '}
        directly.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map((result) => {
        const category = getConditionCategory(result.conditionCategory)
        return (
          <div
            key={result.conditionId}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {result.conditionName}
                </h3>
                {category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <category.icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {category.label}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Matched: {result.matchedSymptomNames.join(', ')}
              </p>
            </div>
            {result.communitySlug && (
              <Button asChild size="sm" className="shrink-0 self-start">
                <Link to={`/r/${result.communitySlug}`}>Visit community</Link>
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
