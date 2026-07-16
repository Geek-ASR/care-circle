import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from './LoadingScreen'

export function RequireAuth() {
  const { user, isAuthLoading } = useAuth()
  const location = useLocation()

  if (isAuthLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}
