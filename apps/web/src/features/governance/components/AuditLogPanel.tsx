import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  KeyRound,
  ScrollText,
  ShieldMinus,
  ShieldPlus,
  UserCog,
  XCircle,
} from 'lucide-react'
import { Skeleton } from '@/components/ui'
import type { AuditLogEntry } from '../api/governance'
import { useAuditLog } from '../hooks/useGovernance'
import { ActivityRow, PersonLink, type Tone } from './ActivityRow'

function describe(entry: AuditLogEntry): {
  icon: typeof ScrollText
  tone: Tone
  text: React.ReactNode
} {
  const m = entry.metadata as Record<string, string | undefined>
  const actor = <PersonLink profile={entry.actor} fallback="The system" />
  const target = <PersonLink profile={entry.targetUser} fallback="a user" />

  switch (entry.action) {
    case 'site_role_granted':
      return {
        icon: ShieldPlus,
        tone: 'primary',
        text: (
          <>
            {actor} granted {target} the site{' '}
            <strong className="text-foreground">{m.role}</strong> role
          </>
        ),
      }
    case 'site_role_revoked':
      return {
        icon: ShieldMinus,
        tone: 'warning',
        text: (
          <>
            {actor} revoked {target}&apos;s site{' '}
            <strong className="text-foreground">{m.role}</strong> role
          </>
        ),
      }
    case 'community_role_changed':
      return {
        icon: UserCog,
        tone: 'neutral',
        text: (
          <>
            {actor} changed {target}&apos;s community role from {m.from} to{' '}
            <strong className="text-foreground">{m.to}</strong>
          </>
        ),
      }
    case 'community_approved':
    case 'community_unapproved': {
      const approved = entry.action === 'community_approved'
      return {
        icon: approved ? CheckCircle2 : XCircle,
        tone: approved ? 'success' : 'danger',
        text: (
          <>
            {actor} {approved ? 'approved' : 'unapproved'}{' '}
            {m.slug ? (
              <Link
                to={`/r/${m.slug}`}
                className="font-medium text-primary hover:underline"
              >
                r/{m.slug}
              </Link>
            ) : (
              'a community'
            )}
          </>
        ),
      }
    }
    default:
      return {
        icon: KeyRound,
        tone: 'neutral',
        text: (
          <>
            {actor} · {entry.action.replace(/_/g, ' ')}
          </>
        ),
      }
  }
}

export function AuditLogPanel() {
  const { data: entries, isLoading } = useAuditLog(true)

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />

  if (!entries || entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong/70 px-4 py-8 text-center text-sm text-muted-foreground">
        No audited events yet. Role changes and community approvals will appear here.
      </p>
    )
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {entries.map((entry) => {
        const { icon, tone, text } = describe(entry)
        return (
          <ActivityRow key={entry.id} icon={icon} tone={tone} at={entry.created_at}>
            {text}
          </ActivityRow>
        )
      })}
    </ul>
  )
}
