import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import { Badge, Button, Skeleton, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { REASON_LABELS } from '@/features/reports/components/ReportDialog'
import { useReports, useResolveReport } from '../hooks/useModeration'
import type { ReportWithContext } from '../types'

function ReportRow({ report }: { report: ReportWithContext }) {
  const resolve = useResolveReport()
  const canRemove = report.target_type === 'post' || report.target_type === 'comment'
  const isResolved = report.status !== 'pending'

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={report.status === 'pending' ? 'warning' : 'outline'}>
          {report.status}
        </Badge>
        <span>
          {REASON_LABELS[report.reason as keyof typeof REASON_LABELS] ?? report.reason}
        </span>
        {report.communitySlug && <span>· r/{report.communitySlug}</span>}
        <span>· reported by {report.reporter?.username ?? '[deleted]'}</span>
        <span>
          · {formatDistanceToNowStrict(new Date(report.created_at), { addSuffix: true })}
        </span>
      </div>

      {report.postId ? (
        <Link
          to={`/posts/${report.postId}`}
          className="text-sm font-medium text-foreground hover:underline"
        >
          {report.targetPreview}
        </Link>
      ) : (
        <p className="text-sm font-medium text-foreground">{report.targetPreview}</p>
      )}

      {report.description && (
        <p className="text-sm text-muted-foreground">
          &ldquo;{report.description}&rdquo;
        </p>
      )}

      {!isResolved && (
        <div className="mt-1 flex items-center gap-2">
          {canRemove && (
            <Button
              size="sm"
              variant="danger"
              disabled={resolve.isPending}
              onClick={() => resolve.mutate({ report, resolution: 'remove' })}
            >
              Remove content
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={resolve.isPending}
            onClick={() => resolve.mutate({ report, resolution: 'dismiss' })}
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  )
}

export function ReportQueue() {
  const { data: reports, isLoading } = useReports()
  const [tab, setTab] = useState<'pending' | 'resolved'>('pending')

  const pending = reports?.filter((r) => r.status === 'pending') ?? []
  const resolved = reports?.filter((r) => r.status !== 'pending') ?? []
  const visible = tab === 'pending' ? pending : resolved

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'pending' | 'resolved')}>
        <TabsList>
          <TabsTrigger value="pending">Pending · {pending.length}</TabsTrigger>
          <TabsTrigger value="resolved">Resolved · {resolved.length}</TabsTrigger>
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tab === 'pending'
            ? "No pending reports. You're all caught up."
            : 'Nothing resolved yet.'}
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {visible.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}
