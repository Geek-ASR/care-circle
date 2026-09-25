import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { queryKeys } from '@/services/queryClient'
import { toast } from '@/store/toastStore'
import type { WikiPage } from '@/types/database'
import {
  createResource,
  createRule,
  createWikiPage,
  deleteResource,
  deleteRule,
  deleteWikiPage,
  reorderRules,
  updateCommunityDetails,
  updateResource,
  updateRule,
  updateWikiPage,
  type CommunityDetailsInput,
  type ResourceInput,
  type RuleInput,
  type WikiPageInput,
} from '../api/communitySettings'

function onError(title: string) {
  return (error: unknown) => {
    const message = error instanceof Error ? error.message : undefined
    // 23505 = unique_violation (e.g. a wiki slug already in use).
    const isDuplicate =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    toast({
      title,
      description: isDuplicate
        ? 'Something with that name already exists in this community.'
        : (message ?? 'Please try again in a moment.'),
      variant: 'danger',
    })
  }
}

export function useUpdateCommunityDetails(communityId: string, slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CommunityDetailsInput) =>
      updateCommunityDetails(communityId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.community(slug) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.communities() })
      void queryClient.invalidateQueries({ queryKey: ['communities', 'mine'] })
      toast({ title: 'Community updated', variant: 'success' })
    },
    onError: onError('Could not save changes'),
  })
}

export function useRuleMutations(communityId: string) {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['community-rules', communityId] })

  return {
    create: useMutation({
      mutationFn: ({ input, position }: { input: RuleInput; position: number }) =>
        createRule(communityId, input, position),
      onSuccess: invalidate,
      onError: onError('Could not add rule'),
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: RuleInput }) =>
        updateRule(id, input),
      onSuccess: invalidate,
      onError: onError('Could not update rule'),
    }),
    remove: useMutation({
      mutationFn: deleteRule,
      onSuccess: invalidate,
      onError: onError('Could not delete rule'),
    }),
    reorder: useMutation({
      mutationFn: reorderRules,
      onSettled: invalidate,
      onError: onError('Could not reorder rules'),
    }),
  }
}

export function useResourceMutations(communityId: string) {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['community-resources', communityId] })

  return {
    create: useMutation({
      mutationFn: ({ input, position }: { input: ResourceInput; position: number }) =>
        createResource(communityId, input, position),
      onSuccess: invalidate,
      onError: onError('Could not add resource'),
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: ResourceInput }) =>
        updateResource(id, input),
      onSuccess: invalidate,
      onError: onError('Could not update resource'),
    }),
    remove: useMutation({
      mutationFn: deleteResource,
      onSuccess: invalidate,
      onError: onError('Could not delete resource'),
    }),
  }
}

export function useWikiMutations(communityId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['wiki-pages', communityId] })
    void queryClient.invalidateQueries({ queryKey: ['wiki-page', communityId] })
  }

  return {
    create: useMutation({
      mutationFn: (input: WikiPageInput) => createWikiPage(communityId, user!.id, input),
      onSuccess: () => {
        invalidate()
        toast({ title: 'Wiki page created', variant: 'success' })
      },
      onError: onError('Could not create wiki page'),
    }),
    update: useMutation({
      mutationFn: ({ page, input }: { page: WikiPage; input: WikiPageInput }) =>
        updateWikiPage(page, input),
      onSuccess: () => {
        invalidate()
        toast({ title: 'Wiki page saved', variant: 'success' })
      },
      onError: onError('Could not save wiki page'),
    }),
    remove: useMutation({
      mutationFn: deleteWikiPage,
      onSuccess: invalidate,
      onError: onError('Could not delete wiki page'),
    }),
  }
}
