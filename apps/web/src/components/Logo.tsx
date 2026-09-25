import { useId } from 'react'
import { cn } from '@/utils/cn'

/**
 * CareCircle brand mark: an open ring (the "circle" of people around you) holding a
 * heart, on the teal -> violet brand gradient. Kept as inline SVG so it scales crisply
 * and needs no extra request; public/favicon.svg is the same drawing.
 */
export function LogoMark({ className }: { className?: string }) {
  const gradientId = useId()
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('h-8 w-8 shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="0.55" stopColor="#38a3c9" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <circle
        cx="16"
        cy="16"
        r="9.5"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.95"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="47 12.7"
        transform="rotate(-62 16 16)"
      />
      <path
        fill="#fff"
        d="M16 20.6c-.2 0-.4-.1-.5-.2l-3-2.9c-.9-.9-1.6-1.8-1.6-3.1a2.9 2.9 0 0 1 5.1-1.9 2.9 2.9 0 0 1 5.1 1.9c0 1.3-.7 2.2-1.6 3.1l-3 2.9c-.1.1-.3.2-.5.2Z"
      />
    </svg>
  )
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string
  markClassName?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={markClassName} />
      {showWordmark && (
        <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
          Care<span className="text-primary">Circle</span>
        </span>
      )}
    </span>
  )
}
