import { supabase } from '@/services/supabaseClient'
import type { Achievement } from '@/types/database'

export interface AchievementProgress extends Achievement {
  progress: number
  completed_at: string | null
}

export async function listUserAchievements(
  userId: string,
): Promise<AchievementProgress[]> {
  const [
    { data: achievements, error: achError },
    { data: userAch, error: userAchError },
  ] = await Promise.all([
    supabase.from('achievements').select('*').order('target_value'),
    supabase
      .from('user_achievements')
      .select('achievement_id, progress, completed_at')
      .eq('user_id', userId),
  ])
  if (achError) throw achError
  if (userAchError) throw userAchError

  const progressById = new Map(
    (
      userAch as {
        achievement_id: string
        progress: number
        completed_at: string | null
      }[]
    ).map((row) => [row.achievement_id, row]),
  )

  return (achievements as Achievement[]).map((achievement) => ({
    ...achievement,
    progress: progressById.get(achievement.id)?.progress ?? 0,
    completed_at: progressById.get(achievement.id)?.completed_at ?? null,
  }))
}
