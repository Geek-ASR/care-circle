import { cn } from '@/utils/cn'
import type { ConditionCategory } from '../constants'

/**
 * Visual-only pill for a condition category (icon + label). Deliberately not a
 * <button>/<Link> itself - CommunitiesPage wraps it in a filter <button>,
 * LandingPage wraps it in a <Link>, so each caller keeps the right semantics.
 */
export function CategoryChip({
  category,
  active,
  className,
}: {
  category: ConditionCategory
  active?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground',
        className,
      )}
    >
      <category.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {category.label}
    </span>
  )
}
