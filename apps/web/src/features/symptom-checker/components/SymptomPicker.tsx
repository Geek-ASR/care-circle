import { useMemo } from 'react'
import { Skeleton } from '@/components/ui'
import { cn } from '@/utils/cn'
import { SYMPTOM_CATEGORIES } from '../constants'
import { useSymptoms } from '../hooks/useSymptomChecker'

interface SymptomPickerProps {
  selected: string[]
  onToggle: (symptomId: string) => void
}

export function SymptomPicker({ selected, onToggle }: SymptomPickerProps) {
  const { data: symptoms, isLoading } = useSymptoms()

  const groups = useMemo(() => {
    if (!symptoms) return []
    return SYMPTOM_CATEGORIES.map((category) => ({
      category,
      items: symptoms.filter((s) => s.category === category.value),
    })).filter((group) => group.items.length > 0)
  }, [symptoms])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map(({ category, items }) => (
        <div key={category.value}>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <category.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {category.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {items.map((symptom) => {
              const active = selected.includes(symptom.id)
              return (
                <button
                  key={symptom.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggle(symptom.id)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground',
                  )}
                >
                  {symptom.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
