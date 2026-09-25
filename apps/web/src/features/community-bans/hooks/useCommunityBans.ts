import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import {
  liftRestriction,
  listCommunityBans,
  listCommunityMembers,
  listMyRestrictions,
  restrictUser,
  type RestrictUserInput,
} from '../api/bans'
import { strongestActive } from '../utils/restrictions'

export function useCommunityMembers(communityId: string | undefined) {
  return useQuery({
    queryKey: ['community-members', communityId],
    queryFn: () => listCommunityMembers(communityId as string),
    enabled: Boolean(communityId),
  })
}

export function useCommunityBans(communityId: string | undefined) {
  return useQuery({
    queryKey: ['community-bans', communityId],
    queryFn: () => listCommunityBans(communityId as string),
    enabled: Boolean(communityId),
  })
}

/** The current user's strongest active restriction in a community, if any. */
export function useMyRestriction(communityId: string | undefined) {
  const { user } = useAuth()
  const query = useQuery({
    queryKey: ['community-bans', communityId, 'mine', user?.id],
    queryFn: () => listMyRestrictions(communityId as string, user!.id),
    enabled: Boolean(communityId && user),
    staleTime: 60_000,
  })
  return { restriction: strongestActive(query.data ?? []), isLoading: query.isLoading }
}

function useInvalidate(communityId: string) {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['community-bans', communityId] })
    void queryClient.invalidateQueries({ queryKey: ['community-members', communityId] })
    void queryClient.invalidateQueries({ queryKey: ['communities'] })
  }
}

export function useRestrictUser(communityId: string) {
  const { user } = useAuth()
  const invalidate = useInvalidate(communityId)
  return useMutation({
    mutationFn: (input: Omit<RestrictUserInput, 'communityId' | 'createdBy'>) =>
      restrictUser({ ...input, communityId, createdBy: user!.id }),
    onSuccess: (_data, input) => {
      invalidate()
      toast({
        title: input.kind === 'ban' ? 'User banned' : 'User muted',
        description: 'They have been notified. You can lift this at any time.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Could not apply restriction',
        description:
          error instanceof Error && /row-level security/i.test(error.message)
            ? 'Moderators can only restrict regular members.'
            : 'Please try again in a moment.',
        variant: 'danger',
      })
    },
  })
}

export function useLiftRestriction(communityId: string) {
  const invalidate = useInvalidate(communityId)
  return useMutation({
    mutationFn: liftRestriction,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Restriction lifted', variant: 'success' })
    },
    onError: () => {
      toast({ title: 'Could not lift restriction', variant: 'danger' })
    },
  })
}
