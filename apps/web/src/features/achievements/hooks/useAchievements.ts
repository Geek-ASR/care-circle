import { useQuery } from '@tanstack/react-query'
import { listUserAchievements } from '../api/achievements'

export function useUserAchievements(userId: string | undefined) {
  return useQuery({
    queryKey: ['achievements', 'user', userId],
    queryFn: () => listUserAchievements(userId as string),
    enabled: Boolean(userId),
  })
}
