import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ExternalLink } from 'lucide-react'
import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui'
import { useConditions } from '@/features/conditions/hooks/useConditions'
import { useConditionResources } from '@/features/resources/hooks/useResources'
import type { ResourceCategory } from '@/types/database'

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  hotline: 'Hotline',
  organization: 'Organization',
  research: 'Research',
  financial_assistance: 'Financial assistance',
  other: 'Other',
}

export default function ResourcesPage() {
  const { data: conditions, isLoading: isLoadingConditions } = useConditions()
  const [searchParams, setSearchParams] = useSearchParams()
  const slug = searchParams.get('condition') ?? ''

  const selectedCondition = useMemo(
    () => conditions?.find((c) => c.slug === slug),
    [conditions, slug],
  )
  const { data: resources, isLoading: isLoadingResources } = useConditionResources(
    selectedCondition?.id,
  )

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Helmet>
        <title>Resources · CareCircle</title>
      </Helmet>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Resources</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Curated hotlines, organizations, and research for specific conditions.
        </p>
      </div>

      {isLoadingConditions ? (
        <Skeleton className="h-10 max-w-xs" />
      ) : (
        <Select
          value={slug}
          onValueChange={(value) =>
            setSearchParams({ condition: value }, { replace: true })
          }
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Choose a condition" />
          </SelectTrigger>
          <SelectContent>
            {conditions?.map((condition) => (
              <SelectItem key={condition.id} value={condition.slug}>
                {condition.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!selectedCondition && !isLoadingConditions && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Choose a condition to see its resources.
        </p>
      )}

      {selectedCondition && isLoadingResources && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20" />
        </div>
      )}

      {selectedCondition && !isLoadingResources && resources?.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No resources added for {selectedCondition.name} yet.
        </p>
      )}

      {selectedCondition && resources && resources.length > 0 && (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {resources.map((resource) => (
            <div key={resource.id} className="flex flex-col gap-1.5 p-4">
              <div className="flex items-center gap-2">
                {resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    {resource.title}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    {resource.title}
                  </span>
                )}
                {resource.category && (
                  <Badge variant="outline">{CATEGORY_LABELS[resource.category]}</Badge>
                )}
              </div>
              {resource.description && (
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
