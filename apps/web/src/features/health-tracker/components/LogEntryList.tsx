import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { Badge, Button, Skeleton } from '@/components/ui'
import { useDeleteHealthLog, useHealthLogs } from '../hooks/useHealthLogs'

const MOOD_EMOJI: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
}

export function LogEntryList() {
  const { data: logs, isLoading } = useHealthLogs()
  const deleteLog = useDeleteHealthLog()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No entries yet. Log how you&apos;re feeling to start tracking patterns over time.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex flex-col gap-2 rounded-lg border border-border p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              {format(new Date(log.logged_at), 'MMM d, yyyy · h:mm a')}
              {log.mood && <span className="ml-2">{MOOD_EMOJI[log.mood]}</span>}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={deleteLog.isPending}
              onClick={() => deleteLog.mutate(log.id)}
              aria-label="Delete entry"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {log.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {log.symptoms.map((symptom, i) => (
                <Badge key={i} variant="outline">
                  {symptom.name} · {symptom.severity}/5
                </Badge>
              ))}
            </div>
          )}

          {log.medications.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {log.medications.map((medication, i) => (
                <Badge key={i} variant="primary">
                  {medication.name}
                  {medication.dosage && ` · ${medication.dosage}`}
                </Badge>
              ))}
            </div>
          )}

          {log.notes && <p className="text-sm text-muted-foreground">{log.notes}</p>}
        </div>
      ))}
    </div>
  )
}
