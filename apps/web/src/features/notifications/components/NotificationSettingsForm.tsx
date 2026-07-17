import { Label, Switch } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateNotificationSettings } from '@/features/profile/hooks/useProfile'
import type { NotificationType } from '@/types/database'

const TOGGLES: { type: NotificationType; label: string; description: string }[] = [
  {
    type: 'reply',
    label: 'Replies',
    description: 'When someone replies to your post or comment',
  },
  {
    type: 'upvote',
    label: 'Upvotes',
    description: 'When your post or comment is upvoted',
  },
  { type: 'follow', label: 'New followers', description: 'When someone follows you' },
  {
    type: 'badge_earned',
    label: 'Achievements & badges',
    description: 'When you complete an achievement or are awarded a badge',
  },
]

export function NotificationSettingsForm() {
  const { profile } = useAuth()
  const updateSettings = useUpdateNotificationSettings()

  const settings = profile?.notification_settings ?? {}

  function handleToggle(type: NotificationType, checked: boolean) {
    updateSettings.mutate({ ...settings, [type]: checked })
  }

  return (
    <div className="flex flex-col gap-1">
      {TOGGLES.map(({ type, label, description }) => (
        <div
          key={type}
          className="flex items-center justify-between gap-4 rounded-md border border-border p-4"
        >
          <div>
            <Label htmlFor={`notif-${type}`}>{label}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Switch
            id={`notif-${type}`}
            checked={settings[type] !== false}
            onCheckedChange={(checked) => handleToggle(type, checked)}
          />
        </div>
      ))}
    </div>
  )
}
