import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import {
  createHealthLog,
  deleteHealthLog,
  listHealthLogs,
  type HealthLogInput,
} from '../api/healthLogs'

export function useHealthLogs() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['health-logs', user?.id],
    queryFn: () => listHealthLogs(user!.id),
    enabled: Boolean(user),
  })
}

export function useCreateHealthLog() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: HealthLogInput) => createHealthLog(user!.id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['health-logs', user?.id] })
      toast({ title: 'Entry saved', variant: 'success' })
    },
    onError: () => {
      toast({ title: 'Could not save entry', variant: 'danger' })
    },
  })
}

export function useDeleteHealthLog() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteHealthLog(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['health-logs', user?.id] })
    },
    onError: () => {
      toast({ title: 'Could not delete entry', variant: 'danger' })
    },
  })
}
