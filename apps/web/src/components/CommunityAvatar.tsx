import { cn } from '@/utils/cn'
import { avatarGradient } from '@/utils/avatarColor'

const SIZES = {
  xs: 'h-5 w-5 rounded-md text-[10px]',
  sm: 'h-8 w-8 rounded-lg text-xs',
  md: 'h-11 w-11 rounded-xl text-base',
  lg: 'h-16 w-16 rounded-2xl text-2xl',
  xl: 'h-20 w-20 rounded-2xl text-3xl',
} as const

/** A community's logo, or a stable gradient tile with its initial when it has none. */
export function CommunityAvatar({
  name,
  slug,
  logoUrl,
  size = 'md',
  className,
}: {
  name: string
  slug: string
  logoUrl?: string | null
  size?: keyof typeof SIZES
  className?: string
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        className={cn('shrink-0 object-cover', SIZES[size], className)}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center font-display font-bold text-white shadow-sm',
        'shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]',
        avatarGradient(slug),
        SIZES[size],
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
