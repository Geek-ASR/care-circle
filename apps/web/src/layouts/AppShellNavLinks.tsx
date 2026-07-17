import { NavLink } from 'react-router-dom'
import { Compass, Home, LifeBuoy, Shield, Stethoscope } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { useMyCommunities } from '@/features/communities/hooks/useCommunities'
import { useIsModerator } from '@/features/moderation/hooks/useModeration'
import { Skeleton } from '@/components/ui'

export const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-surface-hover text-foreground'
      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
  )

/**
 * Shared nav content (Home / Browse communities / Your communities), used by both the
 * desktop sidebar (AppShellSidebar) and the mobile drawer (MobileNav) so the two never
 * drift out of sync.
 */
export function AppShellNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const { data: myCommunities, isLoading } = useMyCommunities()
  const { isModerator } = useIsModerator()

  return (
    <>
      <div className="flex flex-col gap-1">
        <NavLink to="/" end className={navLinkClasses} onClick={onNavigate}>
          <Home className="h-4 w-4" aria-hidden="true" />
          Home
        </NavLink>
        <NavLink to="/communities" className={navLinkClasses} onClick={onNavigate}>
          <Compass className="h-4 w-4" aria-hidden="true" />
          Browse communities
        </NavLink>
        {user && (
          <NavLink to="/tracker" className={navLinkClasses} onClick={onNavigate}>
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
            Health tracker
          </NavLink>
        )}
        <NavLink to="/resources" className={navLinkClasses} onClick={onNavigate}>
          <LifeBuoy className="h-4 w-4" aria-hidden="true" />
          Resources
        </NavLink>
        {isModerator && (
          <NavLink to="/moderation" className={navLinkClasses} onClick={onNavigate}>
            <Shield className="h-4 w-4" aria-hidden="true" />
            Moderation
          </NavLink>
        )}
      </div>

      {user && (
        <div className="flex flex-col gap-1">
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your communities
          </h2>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="mx-3 h-8" />
            ))}
          {!isLoading && myCommunities?.length === 0 && (
            <p className="px-3 text-sm text-muted-foreground">
              Join a community to see it here.
            </p>
          )}
          {myCommunities?.map((community) => (
            <NavLink
              key={community.id}
              to={`/r/${community.slug}`}
              className={navLinkClasses}
              onClick={onNavigate}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-hover text-[10px] font-semibold uppercase text-muted-foreground"
                aria-hidden="true"
              >
                {community.name.charAt(0)}
              </span>
              <span className="truncate">{community.name}</span>
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}
