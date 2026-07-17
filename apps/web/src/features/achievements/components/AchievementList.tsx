import { Check } from 'lucide-react'
import { BadgeIcon } from '@/features/badges/components/BadgeIcon'
import { useUserAchievements } from '../hooks/useAchievements'

export function AchievementList({
  userId,
  showInProgress,
}: {
  userId: string | undefined
  showInProgress: boolean
}) {
  const { data: achievements } = useUserAchievements(userId)

  const visible = (achievements ?? []).filter(
    (achievement) => achievement.completed_at || showInProgress,
  )

  if (visible.length === 0) return null

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Achievements
      </h2>
      {visible.map((achievement) => {
        const completed = Boolean(achievement.completed_at)
        const target = achievement.target_value ?? 1
        const percent = Math.min(100, Math.round((achievement.progress / target) * 100))

        return (
          <div
            key={achievement.id}
            className="flex items-center gap-3 rounded-md border border-border p-3"
          >
            <span
              className={
                completed
                  ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary'
                  : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover text-muted-foreground'
              }
            >
              {completed ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <BadgeIcon icon={achievement.icon} className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{achievement.name}</p>
              {achievement.description && (
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              )}
              {!completed && (
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </div>
            {!completed && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {achievement.progress}/{target}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
