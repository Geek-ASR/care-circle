import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import type { CommunityMemberRole } from '@/types/database'
import {
  grantSiteRole,
  listAuditLog,
  listModerationLog,
  listSiteRoleGrants,
  revokeSiteRole,
  setMemberRole,
} from '../api/governance'

/** Postgres exception text from our governance triggers is already human-readable. */
function errorText(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : ''
  if (/only |cannot |No user named/.test(message)) {
    return message.charAt(0).toUpperCase() + message.slice(1) + '.'
  }
  if (/duplicate key/.test(message)) return 'That user already has this role.'
  return fallback
}

export function useModerationLog(communityId: string | undefined) {
  return useQuery({
    queryKey: ['moderation-log', communityId],
    queryFn: () => listModerationLog(communityId as string),
    enabled: Boolean(communityId),
  })
}

export function useSetMemberRole(communityId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: CommunityMemberRole }) =>
      setMemberRole(communityId, userId, role),
    onSuccess: (_data, { role }) => {
      void queryClient.invalidateQueries({ queryKey: ['community-members', communityId] })
      void queryClient.invalidateQueries({ queryKey: ['moderation'] })
      void queryClient.invalidateQueries({ queryKey: ['communities', 'mine'] })
      toast({
        title: role === 'moderator' ? 'Moderator added' : 'Moderator removed',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Could not change role',
        description: errorText(error, 'Please try again.'),
        variant: 'danger',
      })
    },
  })
}

export function useAuditLog(enabled: boolean) {
  return useQuery({ queryKey: ['audit-log'], queryFn: () => listAuditLog(), enabled })
}

export function useSiteRoleGrants(enabled: boolean) {
  return useQuery({ queryKey: ['site-roles'], queryFn: listSiteRoleGrants, enabled })
}

export function useSiteRoleMutations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['site-roles'] })
    void queryClient.invalidateQueries({ queryKey: ['audit-log'] })
  }

  return {
    grant: useMutation({
      mutationFn: ({ username, role }: { username: string; role: string }) =>
        grantSiteRole(username, role, user!.id),
      onSuccess: () => {
        invalidate()
        toast({ title: 'Role granted', variant: 'success' })
      },
      onError: (error) =>
        toast({
          title: 'Could not grant role',
          description: errorText(error, 'Please try again.'),
          variant: 'danger',
        }),
    }),
    revoke: useMutation({
      mutationFn: ({ userId, role }: { userId: string; role: string }) =>
        revokeSiteRole(userId, role),
      onSuccess: () => {
        invalidate()
        toast({ title: 'Role revoked', variant: 'success' })
      },
      onError: (error) =>
        toast({
          title: 'Could not revoke role',
          description: errorText(error, 'Please try again.'),
          variant: 'danger',
        }),
    }),
  }
}
