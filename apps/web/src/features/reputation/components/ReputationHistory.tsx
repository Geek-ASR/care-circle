import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNowStrict, subDays } from 'date-fns'
import { MessageSquare, FileText, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { cn } from '@/utils/cn'
import { listReputationEvents, type ReputationEvent } from '../api/reputation'

function describe(event: ReputationEvent) {
  if (event.reason === 'vote_received') {
    const what = event.source_type === 'comment' ? 'comment' : 'post'
    return event.delta > 0 ? `Upvote on your ${what}` : `Vote change on your ${what}`
  }
  return event.reason.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

/**
 * Private reputation ledger shown on the viewer's own profile. RLS only lets a
 * user read their own reputation_events, so this is never rendered for others.
 */
export function ReputationHistory({ userId }: { userId: string }) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['reputation-events', userId],
    queryFn: () => listReputationEvents(userId, 20),
  })

  const monthAgo = subDays(new Date(), 30)
  const lastMonth = (events ?? []).filter((e) => new Date(e.created_at) >= monthAgo)
  const gained = lastMonth.reduce((sum, e) => sum + e.delta, 0)

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">
            Reputation activity
          </h2>
          <p className="text-xs text-muted-foreground">Only you can see this.</p>
        </div>
        {!isLoading && lastMonth.length > 0 && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
              gained >= 0 ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger',
            )}
          >
            {gained >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {gained >= 0 ? '+' : ''}
            {gained} in the last 30 days
          </span>
        )}
      </div>

      {isLoading && (
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      )}

      {!isLoading && events?.length === 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border-strong/70 px-4 py-4 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          You earn reputation when people upvote your posts (+5) and comments (+2).
        </div>
      )}

      {events && events.length > 0 && (
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {events.map((event) => {
            const Icon = event.source_type === 'comment' ? MessageSquare : FileText
            const content = (
              <>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-muted-foreground">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-foreground">
                    {describe(event)}
                  </span>
                  <span className="block text-xs text-subtle-foreground">
                    {formatDistanceToNowStrict(new Date(event.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    event.delta >= 0 ? 'text-success' : 'text-danger',
                  )}
                >
                  {event.delta >= 0 ? '+' : ''}
                  {event.delta}
                </span>
              </>
            )
            return (
              <li key={event.id}>
                {event.source_type === 'post' && event.source_id ? (
                  <Link
                    to={`/posts/${event.source_id}`}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-hover"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 py-2.5">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
