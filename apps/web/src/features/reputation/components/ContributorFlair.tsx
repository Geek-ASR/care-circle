import { Award } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { cn } from '@/utils/cn'
import { contributorTier } from '../utils/tiers'

const STYLES = {
  primary: 'text-primary',
  accent: 'text-accent',
  success: 'text-success',
} as const

/** Small inline recognition badge shown next to an author's name. */
export function ContributorFlair({
  reputation,
  className,
}: {
  reputation: number | null | undefined
  className?: string
}) {
  const tier = contributorTier(reputation)
  if (!tier) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex shrink-0 items-center',
            STYLES[tier.variant],
            className,
          )}
          aria-label={tier.label}
        >
          <Award className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {tier.label} · {reputation!.toLocaleString()} reputation
      </TooltipContent>
    </Tooltip>
  )
}
