import { Flame, MessagesSquare, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { PostSort } from '../types'

const OPTIONS: { value: PostSort; label: string; icon: typeof Flame }[] = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'new', label: 'New', icon: Sparkles },
  { value: 'top', label: 'Top', icon: TrendingUp },
  { value: 'controversial', label: 'Controversial', icon: MessagesSquare },
]

export function PostSortTabs({
  value,
  onChange,
}: {
  value: PostSort
  onChange: (sort: PostSort) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Sort posts"
      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface p-1"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-surface-hover text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
