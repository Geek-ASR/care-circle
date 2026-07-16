import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/services/queryClient'
import { listConditions } from '../api/conditions'

export function useConditions() {
  return useQuery({
    queryKey: queryKeys.conditions(),
    queryFn: listConditions,
    staleTime: 10 * 60_000,
  })
}
