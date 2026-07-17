import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/store/toastStore'
import {
  createConditionResource,
  deleteConditionResource,
  listConditionResources,
  type CreateConditionResourceInput,
} from '../api/resources'

export function useConditionResources(conditionId: string | undefined) {
  return useQuery({
    queryKey: ['condition-resources', conditionId],
    queryFn: () => listConditionResources(conditionId as string),
    enabled: Boolean(conditionId),
  })
}

export function useCreateConditionResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateConditionResourceInput) => createConditionResource(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['condition-resources', variables.conditionId],
      })
      toast({ title: 'Resource added', variant: 'success' })
    },
    onError: () => {
      toast({ title: 'Could not add resource', variant: 'danger' })
    },
  })
}

export function useDeleteConditionResource(conditionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteConditionResource(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['condition-resources', conditionId],
      })
    },
    onError: () => {
      toast({ title: 'Could not remove resource', variant: 'danger' })
    },
  })
}
