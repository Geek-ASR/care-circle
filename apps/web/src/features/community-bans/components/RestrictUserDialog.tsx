import { useState, type ReactNode } from 'react'
import { Ban, VolumeX } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Textarea,
} from '@/components/ui'
import { cn } from '@/utils/cn'
import type { CommunityBanKind } from '@/types/database'
import { useRestrictUser } from '../hooks/useCommunityBans'
import { DURATIONS, expiryFor, type DurationValue } from '../utils/restrictions'

const QUICK_REASONS = [
  'Harassment or bullying',
  'Spam or self-promotion',
  'Giving dangerous medical advice',
  'Repeated rule violations',
]

const KINDS: {
  value: CommunityBanKind
  label: string
  icon: typeof Ban
  text: string
}[] = [
  {
    value: 'mute',
    label: 'Mute',
    icon: VolumeX,
    text: 'Can still read and stay a member, but can’t post or comment.',
  },
  {
    value: 'ban',
    label: 'Ban',
    icon: Ban,
    text: 'Removed from the community and can’t rejoin, post or comment.',
  },
]

export function RestrictUserDialog({
  communityId,
  userId,
  userName,
  defaultKind = 'mute',
  trigger,
}: {
  communityId: string
  userId: string
  userName: string
  defaultKind?: CommunityBanKind
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<CommunityBanKind>(defaultKind)
  const [duration, setDuration] = useState<DurationValue>('7d')
  const [reason, setReason] = useState('')
  const restrict = useRestrictUser(communityId)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setKind(defaultKind)
          setDuration('7d')
          setReason('')
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restrict {userName}</DialogTitle>
          <DialogDescription>
            They&apos;ll get a notification from the moderators (your name isn&apos;t
            shown). Every restriction is recorded in the moderation log.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            restrict.mutate(
              {
                userId,
                kind,
                reason: reason.trim() || null,
                expiresAt: expiryFor(duration),
              },
              { onSuccess: () => setOpen(false) },
            )
          }}
        >
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-medium text-foreground">Action</legend>
            {KINDS.map(({ value, label, icon: Icon, text }) => (
              <label
                key={value}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-colors',
                  kind === value
                    ? value === 'ban'
                      ? 'border-danger bg-danger/8'
                      : 'border-warning bg-warning/8'
                    : 'border-border hover:bg-surface-hover',
                )}
              >
                <input
                  type="radio"
                  name="restriction-kind"
                  value={value}
                  checked={kind === value}
                  onChange={() => setKind(value)}
                  className="sr-only"
                />
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      value === 'ban' ? 'text-danger' : 'text-warning',
                    )}
                    aria-hidden="true"
                  />
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">{text}</span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">Duration</legend>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <label
                  key={d.value}
                  className={cn(
                    'cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                    duration === d.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground',
                  )}
                >
                  <input
                    type="radio"
                    name="restriction-duration"
                    value={d.value}
                    checked={duration === d.value}
                    onChange={() => setDuration(d.value)}
                    className="sr-only"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor="restriction-reason">Reason (shared with the member)</Label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="rounded-full bg-surface-hover px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {r}
                </button>
              ))}
            </div>
            <Textarea
              id="restriction-reason"
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain which rule was broken"
              className="min-h-20"
            />
          </div>

          <DialogFooter className="mt-0">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={kind === 'ban' ? 'danger' : 'primary'}
              disabled={restrict.isPending}
            >
              {restrict.isPending
                ? 'Applying…'
                : kind === 'ban'
                  ? 'Ban user'
                  : 'Mute user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
