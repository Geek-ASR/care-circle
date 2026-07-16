import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/services/queryClient'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import {
  getCommunityBySlug,
  getMembership,
  joinCommunity,
  leaveCommunity,
  listCommunities,
  listCommunityRules,
  listMyCommunities,
} from '../api/communities'

export function useCommunities() {
  return useQuery({
    queryKey: queryKeys.communities(),
    queryFn: listCommunities,
    staleTime: 60_000,
  })
}

export function useCommunity(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.community(slug ?? ''),
    queryFn: () => getCommunityBySlug(slug as string),
    enabled: Boolean(slug),
  })
}

export function useMyCommunities() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['communities', 'mine', user?.id ?? 'signed-out'],
    queryFn: () => listMyCommunities(user!.id),
    enabled: Boolean(user),
    staleTime: 30_000,
  })
}

export function useCommunityRules(communityId: string | undefined) {
  return useQuery({
    queryKey: ['community-rules', communityId ?? 'none'],
    queryFn: () => listCommunityRules(communityId as string),
    enabled: Boolean(communityId),
  })
}

export function useCommunityMembership(communityId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: communityId
      ? queryKeys.communityMembership(communityId, user?.id ?? 'signed-out')
      : ['community-membership', 'none'],
    queryFn: () => getMembership(communityId as string, user!.id),
    enabled: Boolean(communityId && user),
  })
}

export function useJoinCommunity(communityId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => joinCommunity(communityId, user!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['community-membership'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.communities() })
      void queryClient.invalidateQueries({ queryKey: ['communities', 'mine'] })
    },
    onError: () => {
      toast({
        title: 'Could not join community',
        description: 'Please try again in a moment.',
        variant: 'danger',
      })
    },
  })
}

export function useLeaveCommunity(communityId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => leaveCommunity(communityId, user!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['community-membership'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.communities() })
      void queryClient.invalidateQueries({ queryKey: ['communities', 'mine'] })
    },
    onError: () => {
      toast({
        title: 'Could not leave community',
        description: 'Please try again in a moment.',
        variant: 'danger',
      })
    },
  })
}
