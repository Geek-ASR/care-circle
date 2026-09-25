import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs',
      'transition-[border-color,box-shadow] duration-150 placeholder:text-subtle-foreground',
      'hover:border-border-strong',
      'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
