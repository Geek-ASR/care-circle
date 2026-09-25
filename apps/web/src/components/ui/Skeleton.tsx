import { cn } from '@/utils/cn'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('shimmer rounded-lg', className)} aria-hidden="true" {...props} />
  )
}
