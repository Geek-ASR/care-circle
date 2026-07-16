import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Redirects signed-in users who haven't finished onboarding (no username/diagnosis
 * set yet) to /onboarding. Anonymous visitors and fully onboarded users pass through.
 */
export function RequireOnboarding() {
  const { user, profile, isProfileLoading } = useAuth()
  const location = useLocation()

  const needsOnboarding =
    Boolean(user) &&
    !isProfileLoading &&
    profile !== null &&
    !profile.onboarding_completed

  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
