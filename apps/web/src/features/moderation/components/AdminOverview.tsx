import { Skeleton } from '@/components/ui'
import { useAdminStats } from '../hooks/useModeration'

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={
        highlight && value > 0
          ? 'rounded-2xl border border-warning/40 bg-warning/8 p-5'
          : 'rounded-2xl border border-border bg-surface p-5 shadow-xs'
      }
    >
      <p className="font-display text-3xl font-bold tracking-tight text-foreground">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

export function AdminOverview() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard label="Users" value={stats.users} />
      <StatCard label="Published posts" value={stats.posts} />
      <StatCard label="Published comments" value={stats.comments} />
      <StatCard label="Approved communities" value={stats.approvedCommunities} />
      <StatCard label="Pending communities" value={stats.pendingCommunities} highlight />
      <StatCard label="Pending reports" value={stats.pendingReports} highlight />
    </div>
  )
}
