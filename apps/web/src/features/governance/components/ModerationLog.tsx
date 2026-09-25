import { Link } from 'react-router-dom'
import {
  Ban,
  CheckCircle2,
  Lock,
  MessageSquareX,
  Pin,
  ScrollText,
  Timer,
  Trash2,
  TriangleAlert,
  VolumeX,
  type LucideIcon,
} from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useModerationLog } from '../hooks/useGovernance'
import type { ModerationLogEntry } from '../api/governance'
import { ActivityRow, PersonLink, type Tone } from './ActivityRow'

const ACTIONS: Record<string, { verb: string; icon: LucideIcon; tone: Tone }> = {
  remove_post: { verb: 'removed a post', icon: Trash2, tone: 'danger' },
  remove_comment: { verb: 'removed a comment', icon: MessageSquareX, tone: 'danger' },
  pin_post: { verb: 'pinned or unpinned a post', icon: Pin, tone: 'primary' },
  lock_post: { verb: 'locked or unlocked a post', icon: Lock, tone: 'primary' },
  warn_user: { verb: 'warned', icon: TriangleAlert, tone: 'warning' },
  mute_user: { verb: 'muted', icon: VolumeX, tone: 'warning' },
  temp_ban: { verb: 'temporarily banned', icon: Timer, tone: 'danger' },
  ban_user: { verb: 'permanently banned', icon: Ban, tone: 'danger' },
  approve_post: { verb: 'approved a post', icon: CheckCircle2, tone: 'success' },
}

function Target({ entry }: { entry: ModerationLogEntry }) {
  if (entry.target_type === 'user') {
    return <PersonLink profile={entry.targetUser} fallback="a user" />
  }
  if (entry.target_type === 'post' && entry.target_id) {
    return (
      <Link to={`/posts/${entry.target_id}`} className="text-primary hover:underline">
        view post
      </Link>
    )
  }
  return null
}

export function ModerationLog({ communityId }: { communityId: string }) {
  const { data: entries, isLoading } = useModerationLog(communityId)

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong/70 px-6 py-10 text-center">
        <ScrollText className="h-6 w-6 text-subtle-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          No moderation actions yet. Removals, pins, locks, mutes and bans will be
          recorded here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Every moderator action in this community, newest first. Only moderators can see
        this log, and entries can&apos;t be edited or deleted.
      </p>
      <ul className="flex flex-col divide-y divide-border">
        {entries.map((entry) => {
          const action = ACTIONS[entry.action_type] ?? {
            verb: entry.action_type.replace(/_/g, ' '),
            icon: ScrollText,
            tone: 'neutral' as const,
          }
          return (
            <ActivityRow
              key={entry.id}
              icon={action.icon}
              tone={action.tone}
              at={entry.created_at}
              detail={entry.reason ? `Reason: ${entry.reason}` : undefined}
            >
              <PersonLink profile={entry.moderator} fallback="A moderator" />{' '}
              {action.verb} <Target entry={entry} />
            </ActivityRow>
          )
        })}
      </ul>
    </div>
  )
}
