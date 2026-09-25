import { Helmet } from 'react-helmet-async'
import { Label, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { ProfileSettingsForm } from '@/features/profile/components/ProfileSettingsForm'
import { PrivacySettingsForm } from '@/features/profile/components/PrivacySettingsForm'
import { NotificationSettingsForm } from '@/features/notifications/components/NotificationSettingsForm'
import { BlockedUsersList } from '@/features/blocks/components/BlockedUsersList'
import { useThemeStore } from '@/store/themeStore'
import { PageHeader } from '@/components/PageHeader'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="mx-auto max-w-2xl">
      <Helmet>
        <title>Settings · CareCircle</title>
      </Helmet>
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Manage your profile, privacy and notifications."
        className="mb-6"
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent
          value="profile"
          className="mt-5 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7"
        >
          <ProfileSettingsForm />
        </TabsContent>

        <TabsContent
          value="privacy"
          className="mt-5 flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7"
        >
          <PrivacySettingsForm />
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Blocked users
            </h2>
            <BlockedUsersList />
          </div>
        </TabsContent>

        <TabsContent
          value="notifications"
          className="mt-5 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7"
        >
          <NotificationSettingsForm />
        </TabsContent>

        <TabsContent
          value="appearance"
          className="mt-5 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="theme-switch">Light theme</Label>
              <p className="text-xs text-muted-foreground">
                CareCircle defaults to dark mode.
              </p>
            </div>
            <Switch
              id="theme-switch"
              checked={theme === 'light'}
              onCheckedChange={() => toggleTheme()}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
