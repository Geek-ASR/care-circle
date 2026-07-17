import { useMutation } from '@tanstack/react-query'
import { toast } from '@/store/toastStore'
import { createReport, type CreateReportInput } from '../api/reports'

export function useCreateReport() {
  return useMutation({
    mutationFn: (input: CreateReportInput) => createReport(input),
    onSuccess: () => {
      toast({
        title: 'Report submitted',
        description:
          'Thanks for helping keep the community safe. A moderator will review it.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Could not submit report',
        description: 'Please try again.',
        variant: 'danger',
      })
    },
  })
}
