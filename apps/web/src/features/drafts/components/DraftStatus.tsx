import { format } from 'date-fns'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import type { DraftStatus as Status } from '../hooks/useDraftAutosave'

export function DraftStatus({
  status,
  savedAt,
}: {
  status: Status
  savedAt: Date | null
}) {
  if (status === 'idle') return null
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-subtle-foreground"
      aria-live="polite"
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Saving
          draft…
        </>
      )}
      {status === 'saved' && savedAt && (
        <>
          <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> Draft saved at{' '}
          {format(savedAt, 'h:mm a')}
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-warning" aria-hidden="true" />{' '}
          Couldn&apos;t save draft
        </>
      )}
    </span>
  )
}
