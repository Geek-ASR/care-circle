import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/LoadingScreen'
import { AppShell } from '@/layouts/AppShell'
import HomePage from './HomePage'
import LandingPage from './LandingPage'

/**
 * "/" resolves differently depending on who's looking, same as github.com's root:
 * anonymous visitors get the marketing landing page, signed-in users get their feed
 * (inside the normal app shell). AppShell accepts explicit children for this one case
 * since it can't be reached via nested-route <Outlet/> the way every other page is.
 */
export default function RootRoute() {
  const { user, isAuthLoading } = useAuth()

  if (isAuthLoading) return <LoadingScreen />

  if (!user) return <LandingPage />

  return (
    <AppShell>
      <HomePage />
    </AppShell>
  )
}
