import { Link, NavLink } from 'react-router-dom'
import {
  Bookmark,
  Compass,
  Home,
  LifeBuoy,
  ListChecks,
  Plus,
  Shield,
  Stethoscope,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { useMyCommunities } from '@/features/communities/hooks/useCommunities'
import { useIsModerator } from '@/features/moderation/hooks/useModeration'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { Skeleton } from '@/components/ui'

export const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary/10 text-foreground before:absolute before:inset-y-2 before:-left-3 before:w-1 before:rounded-r-full before:bg-primary'
      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
  )

const iconClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'h-[18px] w-[18px] shrink-0 transition-colors',
    isActive ? 'text-primary' : 'text-subtle-foreground group-hover:text-foreground',
  )

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle-foreground">
      {children}
    </h2>
  )
}

/**
 * Shared nav content (Home / Browse communities / Your communities), used by both the
 * desktop sidebar (AppShellSidebar) and the mobile drawer (MobileNav) so the two never
 * drift out of sync.
 */
export function AppShellNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const { data: myCommunities, isLoading } = useMyCommunities()
  const { isModerator } = useIsModerator()

  const item = (to: string, label: string, Icon: typeof Home, end = false) => (
    <NavLink to={to} end={end} className={navLinkClasses} onClick={onNavigate}>
      {({ isActive }) => (
        <>
          <Icon className={iconClasses({ isActive })} aria-hidden="true" />
          {label}
        </>
      )}
    </NavLink>
  )

  return (
    <>
      <div className="flex flex-col gap-0.5">
        <SectionLabel>Discover</SectionLabel>
        {item('/', 'Home', Home, true)}
        {item('/communities', 'Browse communities', Compass)}
        {item('/resources', 'Resources', LifeBuoy)}
      </div>

      <div className="flex flex-col gap-0.5">
        <SectionLabel>Your health</SectionLabel>
        {item('/symptom-checker', 'Symptom checker', ListChecks)}
        {user && item('/tracker', 'Health tracker', Stethoscope)}
        {user && item('/saved', 'Saved posts', Bookmark)}
        {isModerator && item('/moderation', 'Moderation', Shield)}
      </div>

      {user && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between pr-1">
            <SectionLabel>Your communities</SectionLabel>
            <Link
              to="/communities/new"
              onClick={onNavigate}
              aria-label="Create a community"
              className="-mt-1 rounded-md p-1 text-subtle-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="mx-3 my-1 h-7" />
            ))}
          {!isLoading && myCommunities?.length === 0 && (
            <Link
              to="/communities"
              onClick={onNavigate}
              className="mx-1 rounded-lg border border-dashed border-border-strong/70 px-3 py-3 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              You haven&apos;t joined any communities yet.{' '}
              <span className="font-medium text-primary">Find your circle →</span>
            </Link>
          )}
          {myCommunities?.map((community) => (
            <NavLink
              key={community.id}
              to={`/r/${community.slug}`}
              className={navLinkClasses}
              onClick={onNavigate}
            >
              <CommunityAvatar
                name={community.name}
                slug={community.slug}
                logoUrl={community.logo_url}
                size="xs"
              />
              <span className="truncate">{community.name}</span>
            </NavLink>
          ))}
        </div>
      )}

      <div className="mt-auto px-3 pt-4 text-[11px] leading-relaxed text-subtle-foreground">
        CareCircle is peer support, not medical advice. In an emergency, contact your
        local emergency services.
      </div>
    </>
  )
}
