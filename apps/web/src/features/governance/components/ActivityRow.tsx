import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ProfileSummary } from '../api/governance'

export type Tone = 'neutral' | 'primary' | 'warning' | 'danger' | 'success'

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-hover text-muted-foreground',
  primary: 'bg-primary/12 text-primary',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
  success: 'bg-success/12 text-success',
}

export function PersonLink({
  profile,
  fallback,
}: {
  profile: ProfileSummary | null
  fallback: string
}) {
  if (!profile) return <span className="font-medium text-foreground">{fallback}</span>
  return (
    <Link
      to={`/u/${profile.username}`}
      className="font-medium text-foreground hover:text-primary"
    >
      {profile.display_name ?? `@${profile.username}`}
    </Link>
  )
}

/** One entry in a moderation / audit timeline. */
export function ActivityRow({
  icon: Icon,
  tone,
  children,
  detail,
  at,
}: {
  icon: LucideIcon
  tone: Tone
  children: React.ReactNode
  detail?: React.ReactNode
  at: string
}) {
  return (
    <li className="flex gap-3 py-3">
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          TONES[tone],
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{children}</p>
        {detail && <p className="mt-0.5 text-xs text-subtle-foreground">{detail}</p>}
      </div>
      <time
        dateTime={at}
        title={new Date(at).toLocaleString()}
        className="shrink-0 text-xs text-subtle-foreground"
      >
        {formatDistanceToNowStrict(new Date(at), { addSuffix: true })}
      </time>
    </li>
  )
}
