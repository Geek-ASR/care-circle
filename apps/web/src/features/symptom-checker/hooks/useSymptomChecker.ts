import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import {
  createSymptomCheck,
  deleteSymptomCheck,
  listConditionCommunitySlugs,
  listConditionSymptomMap,
  listSymptomChecks,
  listSymptoms,
  type CreateSymptomCheckInput,
} from '../api/symptomChecker'

export function useSymptoms() {
  return useQuery({
    queryKey: ['symptoms'],
    queryFn: listSymptoms,
    staleTime: 10 * 60_000,
  })
}

export function useConditionSymptomMap() {
  return useQuery({
    queryKey: ['condition-symptoms'],
    queryFn: listConditionSymptomMap,
    staleTime: 10 * 60_000,
  })
}

export function useConditionCommunitySlugs() {
  return useQuery({
    queryKey: ['condition-community-slugs'],
    queryFn: listConditionCommunitySlugs,
    staleTime: 10 * 60_000,
  })
}

export function useSymptomChecks() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['symptom-checks', user?.id],
    queryFn: () => listSymptomChecks(user!.id),
    enabled: Boolean(user),
  })
}

export function useCreateSymptomCheck() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSymptomCheckInput) => createSymptomCheck(user!.id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['symptom-checks', user?.id] })
    },
    onError: () => {
      toast({ title: 'Could not save your check', variant: 'danger' })
    },
  })
}

export function useDeleteSymptomCheck() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSymptomCheck(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['symptom-checks', user?.id] })
    },
    onError: () => {
      toast({ title: 'Could not delete that check', variant: 'danger' })
    },
  })
}
