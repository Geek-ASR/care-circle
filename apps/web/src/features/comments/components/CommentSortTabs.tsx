import { cn } from '@/utils/cn'
import type { CommentSort } from '../types'

const OPTIONS: { value: CommentSort; label: string }[] = [
  { value: 'best', label: 'Best' },
  { value: 'new', label: 'New' },
  { value: 'old', label: 'Old' },
]

export function CommentSortTabs({
  value,
  onChange,
}: {
  value: CommentSort
  onChange: (sort: CommentSort) => void
}) {
  return (
    <div role="tablist" aria-label="Sort comments" className="flex items-center gap-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-sm px-2 py-1 text-xs font-medium transition-colors',
            option.value === value
              ? 'bg-surface-hover text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
