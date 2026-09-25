import { format } from 'date-fns'
import { Ban, VolumeX } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { CommunityBan } from '@/types/database'

/** Tells a restricted member what's going on, why, and until when. */
export function RestrictionNotice({
  restriction,
  className,
}: {
  restriction: Pick<CommunityBan, 'kind' | 'reason' | 'expires_at'>
  className?: string
}) {
  const isBan = restriction.kind === 'ban'
  const Icon = isBan ? Ban : VolumeX
  const until = restriction.expires_at
    ? `until ${format(new Date(restriction.expires_at), 'MMM d, yyyy · h:mm a')}`
    : 'permanently'

  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-4 text-sm',
        isBan ? 'border-danger/40 bg-danger/8' : 'border-warning/40 bg-warning/8',
        className,
      )}
    >
      <Icon
        className={cn('mt-0.5 h-5 w-5 shrink-0', isBan ? 'text-danger' : 'text-warning')}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-foreground">
          {isBan
            ? `You're banned from this community ${until}.`
            : `You're muted in this community ${until}.`}
        </p>
        <p className="text-muted-foreground">
          {isBan
            ? 'You can still read public posts, but you can’t join, post or comment here.'
            : 'You can still read and vote, but you can’t post or comment here for now.'}
        </p>
        {restriction.reason && (
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Reason:</span>{' '}
            {restriction.reason}
          </p>
        )}
      </div>
    </div>
  )
}
