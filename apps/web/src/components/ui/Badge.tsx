import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-transparent',
  {
    variants: {
      variant: {
        default: 'bg-surface-hover text-foreground ring-border',
        primary: 'bg-primary/12 text-primary ring-primary/25',
        secondary: 'bg-secondary/12 text-secondary ring-secondary/25',
        accent: 'bg-accent/12 text-accent ring-accent/25',
        success: 'bg-success/12 text-success ring-success/25',
        warning: 'bg-warning/12 text-warning ring-warning/25',
        danger: 'bg-danger/12 text-danger ring-danger/25',
        outline: 'text-muted-foreground ring-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
)
Badge.displayName = 'Badge'
