import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import { setCommentStatus } from '@/features/comments/api/comments'
import {
  setPostStatus,
  togglePin as togglePostPin,
  toggleLock as togglePostLock,
} from '@/features/posts/api/posts'
import {
  approveCommunity,
  isSiteAdmin,
  listModeratedCommunityIds,
  listPendingCommunities,
  listReports,
  logModerationAction,
  rejectCommunity,
  updateReportStatus,
} from '../api/moderation'
import type { ReportStatus, ReportWithContext } from '../types'

export function useIsSiteAdmin() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['moderation', 'is-admin', user?.id],
    queryFn: isSiteAdmin,
    enabled: Boolean(user),
  })
}

export function useModeratedCommunityIds() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['moderation', 'moderated-communities', user?.id],
    queryFn: () => listModeratedCommunityIds(user!.id),
    enabled: Boolean(user),
  })
}

/** True if the viewer moderates at least one community or is a site admin. */
export function useIsModerator() {
  const { data: isAdmin, isLoading: isLoadingAdmin } = useIsSiteAdmin()
  const { data: moderatedIds, isLoading: isLoadingCommunities } =
    useModeratedCommunityIds()

  return {
    isModerator: Boolean(isAdmin) || Boolean(moderatedIds && moderatedIds.length > 0),
    isAdmin: Boolean(isAdmin),
    isLoading: isLoadingAdmin || isLoadingCommunities,
  }
}

/** True if the viewer moderates this specific community (or is a site admin). */
export function useIsModeratorOfCommunity(communityId: string | undefined) {
  const { isAdmin, isLoading: isLoadingAdmin } = useIsModerator()
  const { data: moderatedIds, isLoading: isLoadingCommunities } =
    useModeratedCommunityIds()

  return {
    isModerator: isAdmin || Boolean(communityId && moderatedIds?.includes(communityId)),
    isLoading: isLoadingAdmin || isLoadingCommunities,
  }
}

export function useReports() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['moderation', 'reports', user?.id],
    queryFn: listReports,
    enabled: Boolean(user),
  })
}

export function useResolveReport() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      report,
      resolution,
    }: {
      report: ReportWithContext
      resolution: 'dismiss' | 'remove'
    }) => {
      if (resolution === 'remove') {
        if (report.target_type === 'post') {
          await setPostStatus(report.target_id, 'removed')
        } else if (report.target_type === 'comment') {
          await setCommentStatus(report.target_id, 'removed')
        }
        if (report.communityId) {
          await logModerationAction({
            moderatorId: user!.id,
            communityId: report.communityId,
            targetType: report.target_type,
            targetId: report.target_id,
            actionType: report.target_type === 'post' ? 'remove_post' : 'remove_comment',
          })
        }
      }
      const status: ReportStatus = resolution === 'remove' ? 'actioned' : 'dismissed'
      await updateReportStatus(report.id, status, user!.id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['moderation', 'reports'] })
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
      void queryClient.invalidateQueries({ queryKey: ['post'] })
      void queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
    onError: () => {
      toast({
        title: 'Could not resolve report',
        description: 'Please try again in a moment.',
        variant: 'danger',
      })
    },
  })
}

export function useTogglePostPin(postId: string, communityId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (nextPinned: boolean) => {
      await togglePostPin(postId, nextPinned)
      await logModerationAction({
        moderatorId: user!.id,
        communityId,
        targetType: 'post',
        targetId: postId,
        actionType: 'pin_post',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['post', postId], exact: false })
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useTogglePostLock(postId: string, communityId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (nextLocked: boolean) => {
      await togglePostLock(postId, nextLocked)
      await logModerationAction({
        moderatorId: user!.id,
        communityId,
        targetType: 'post',
        targetId: postId,
        actionType: 'lock_post',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['post', postId], exact: false })
    },
  })
}

export function usePendingCommunities() {
  return useQuery({
    queryKey: ['moderation', 'pending-communities'],
    queryFn: listPendingCommunities,
  })
}

export function useApproveCommunity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (communityId: string) => approveCommunity(communityId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['moderation', 'pending-communities'],
      })
      void queryClient.invalidateQueries({ queryKey: ['communities'] })
    },
    onError: () => {
      toast({ title: 'Could not approve community', variant: 'danger' })
    },
  })
}

export function useRejectCommunity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (communityId: string) => rejectCommunity(communityId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['moderation', 'pending-communities'],
      })
    },
    onError: () => {
      toast({ title: 'Could not reject community', variant: 'danger' })
    },
  })
}
