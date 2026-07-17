import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdatePrivacySettings } from '../hooks/useProfile'

export function PrivacySettingsForm() {
  const { profile } = useAuth()
  const updateSettings = useUpdatePrivacySettings()

  const settings = profile?.privacy_settings ?? {}
  const visibility = settings.profile_visibility ?? 'public'
  const showAge = settings.show_age ?? false
  const showDiagnosis = settings.show_diagnosis ?? true

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 rounded-md border border-border p-4">
        <Label htmlFor="profile-visibility">Who can view your profile</Label>
        <p className="text-xs text-muted-foreground">
          Applies to your bio, posts list, and other details. Your username stays visible
          in posts and comments either way.
        </p>
        <Select
          value={visibility}
          onValueChange={(value) =>
            updateSettings.mutate({
              ...settings,
              profile_visibility: value as typeof visibility,
            })
          }
        >
          <SelectTrigger id="profile-visibility" className="mt-1 max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Everyone</SelectItem>
            <SelectItem value="members_only">Signed-in members only</SelectItem>
            <SelectItem value="private">Only me</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
        <div>
          <Label htmlFor="show-age">Show my age</Label>
          <p className="text-xs text-muted-foreground">
            Visible to other signed-in members on your profile.
          </p>
        </div>
        <Switch
          id="show-age"
          checked={showAge}
          onCheckedChange={(checked) =>
            updateSettings.mutate({ ...settings, show_age: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
        <div>
          <Label htmlFor="show-diagnosis">Show my diagnosis</Label>
          <p className="text-xs text-muted-foreground">
            Visible to other signed-in members on your profile.
          </p>
        </div>
        <Switch
          id="show-diagnosis"
          checked={showDiagnosis}
          onCheckedChange={(checked) =>
            updateSettings.mutate({ ...settings, show_diagnosis: checked })
          }
        />
      </div>
    </div>
  )
}
