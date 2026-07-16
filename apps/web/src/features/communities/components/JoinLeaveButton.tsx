import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCommunityMembership,
  useJoinCommunity,
  useLeaveCommunity,
} from '../hooks/useCommunities'

export function JoinLeaveButton({ communityId }: { communityId: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: membership, isLoading } = useCommunityMembership(communityId)
  const join = useJoinCommunity(communityId)
  const leave = useLeaveCommunity(communityId)

  if (!user) {
    return (
      <Button size="sm" onClick={() => navigate('/login')}>
        Join
      </Button>
    )
  }

  if (isLoading) {
    return (
      <Button size="sm" variant="outline" disabled>
        …
      </Button>
    )
  }

  if (membership) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={leave.isPending}
        onClick={() => leave.mutate()}
      >
        Joined
      </Button>
    )
  }

  return (
    <Button size="sm" disabled={join.isPending} onClick={() => join.mutate()}>
      Join
    </Button>
  )
}
