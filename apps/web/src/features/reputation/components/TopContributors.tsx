import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Trophy } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, Skeleton } from '@/components/ui'
import { avatarGradient } from '@/utils/avatarColor'
import { cn } from '@/utils/cn'
import { listTopContributors } from '../api/reputation'
import { ContributorFlair } from './ContributorFlair'

const MEDALS = ['text-amber-400', 'text-slate-300', 'text-orange-400']

/** "Top contributors this month" card for a community's sidebar. */
export function TopContributors({ communityId }: { communityId: string }) {
  const { data: contributors, isLoading } = useQuery({
    queryKey: ['top-contributors', communityId],
    queryFn: () => listTopContributors(communityId),
    staleTime: 5 * 60_000,
  })

  if (!isLoading && (!contributors || contributors.length === 0)) return null

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
      <h2 className="mb-1 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
        <Trophy className="h-4 w-4 text-warning" aria-hidden="true" /> Top contributors
      </h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Most helpful in the last 30 days
      </p>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
      )}

      <ol className="-mx-2 flex flex-col">
        {contributors?.map((c, index) => {
          const name = c.display_name ?? c.username
          return (
            <li key={c.user_id}>
              <Link
                to={`/u/${c.username}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover"
              >
                <span
                  className={cn(
                    'w-4 text-center text-xs font-bold tabular-nums',
                    MEDALS[index] ?? 'text-subtle-foreground',
                  )}
                >
                  {index + 1}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={c.avatar_url ?? undefined} alt="" />
                  <AvatarFallback
                    className={`${avatarGradient(c.username)} text-xs font-semibold text-white`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                    <span className="truncate">{name}</span>
                    <ContributorFlair reputation={c.reputation_score} />
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {c.post_count} {c.post_count === 1 ? 'post' : 'posts'} ·{' '}
                    {c.comment_count} {c.comment_count === 1 ? 'reply' : 'replies'}
                  </span>
                </span>
                <span className="text-xs font-semibold tabular-nums text-primary">
                  +{c.score}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
