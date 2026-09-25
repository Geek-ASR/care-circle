import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/** Friendly placeholder for "nothing here yet" — icon, message, optional next step. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong/70 bg-surface/50 px-6 py-14 text-center',
        className,
      )}
    >
      <span
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover text-muted-foreground ring-1 ring-border"
        aria-hidden="true"
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="font-display text-base font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
