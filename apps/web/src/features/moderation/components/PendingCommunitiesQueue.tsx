import { Link } from 'react-router-dom'
import { Button, Skeleton } from '@/components/ui'
import {
  useApproveCommunity,
  usePendingCommunities,
  useRejectCommunity,
} from '../hooks/useModeration'

export function PendingCommunitiesQueue() {
  const { data: communities, isLoading } = usePendingCommunities()
  const approve = useApproveCommunity()
  const reject = useRejectCommunity()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-20" />
      </div>
    )
  }

  if (!communities || communities.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No communities waiting for approval.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {communities.map((community) => (
        <div key={community.id} className="flex flex-col gap-2 p-4">
          <div>
            <Link
              to={`/r/${community.slug}`}
              className="text-sm font-medium text-foreground hover:underline"
            >
              {community.name}
            </Link>
            <p className="text-xs text-muted-foreground">/r/{community.slug}</p>
          </div>
          {community.description && (
            <p className="text-sm text-muted-foreground">{community.description}</p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <Button
              size="sm"
              disabled={approve.isPending}
              onClick={() => approve.mutate(community.id)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={reject.isPending}
              onClick={() => reject.mutate(community.id)}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
