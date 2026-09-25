import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ' +
    'transition-[background-color,border-color,color,box-shadow,filter] duration-150 ' +
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-strong ' +
          'shadow-[inset_0_1px_0_rgb(255_255_255/0.18),var(--shadow-sm)]',
        brand:
          'bg-brand-gradient-deep text-white shadow-md hover:brightness-110 ' +
          'shadow-[inset_0_1px_0_rgb(255_255_255/0.22),var(--shadow-md)]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:brightness-105',
        soft: 'bg-primary/12 text-primary hover:bg-primary/20',
        outline:
          'border border-border bg-surface text-foreground shadow-xs hover:border-border-strong hover:bg-surface-hover',
        ghost:
          'bg-transparent text-muted-foreground hover:bg-surface-hover hover:text-foreground',
        danger: 'bg-danger text-danger-foreground shadow-sm hover:brightness-105',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'h-9 w-9 shrink-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

// Framer Motion's event handler types (onDrag, onAnimationStart, ...) conflict with the
// native DOM ones, since motion.button's props aren't just HTMLButtonElement attributes.
type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>

export interface ButtonProps
  extends NativeButtonProps, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size }), className)} {...props} />
      )
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
