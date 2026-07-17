import { Skeleton } from '@/components/ui'
import { useAdminStats } from '../hooks/useModeration'

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-2xl font-semibold text-foreground">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export function AdminOverview() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
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
      <StatCard label="Pending communities" value={stats.pendingCommunities} />
      <StatCard label="Pending reports" value={stats.pendingReports} />
    </div>
  )
}
