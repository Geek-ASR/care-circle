import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { searchAll } from '../api/search'

export function useSearch(query: string) {
  const debounced = useDebounce(query, 300)
  const trimmed = debounced.trim()

  const result = useQuery({
    queryKey: ['search', trimmed],
    queryFn: () => searchAll(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 15_000,
  })

  return {
    ...result,
    isSearching: trimmed.length >= 2,
    data: result.data ?? { posts: [], communities: [], users: [], tags: [] },
  }
}
