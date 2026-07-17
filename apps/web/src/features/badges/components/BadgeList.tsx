import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { useUserBadges } from '../hooks/useBadges'
import { BadgeIcon } from './BadgeIcon'

export function BadgeList({ userId }: { userId: string | undefined }) {
  const { data: badges } = useUserBadges(userId)

  if (!badges || badges.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map(({ badge }) => (
        <Tooltip key={badge.id}>
          <TooltipTrigger asChild>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <BadgeIcon icon={badge.icon} className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{badge.name}</p>
            {badge.description && (
              <p className="max-w-56 text-muted-foreground">{badge.description}</p>
            )}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
