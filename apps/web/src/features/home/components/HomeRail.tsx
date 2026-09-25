import { Link } from 'react-router-dom'
import {
  ChevronRight,
  LifeBuoy,
  ListChecks,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { useCommunities } from '@/features/communities/hooks/useCommunities'

const TOOLS = [
  {
    to: '/symptom-checker',
    icon: ListChecks,
    title: 'Symptom checker',
    text: 'Find communities that match what you’re experiencing',
  },
  {
    to: '/tracker',
    icon: Stethoscope,
    title: 'Health tracker',
    text: 'Log symptoms, mood and energy over time',
  },
  {
    to: '/resources',
    icon: LifeBuoy,
    title: 'Resources',
    text: 'Trusted organisations and crisis lines',
  },
]

function RailCard({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Right-hand column on the signed-in home feed (xl screens and up). */
export function HomeRail() {
  const { data: communities, isLoading } = useCommunities()
  const popular = communities?.slice(0, 5) ?? []

  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-4 xl:flex">
      <RailCard
        title="Popular communities"
        action={
          <Link
            to="/communities"
            className="text-xs font-medium text-primary hover:underline"
          >
            See all
          </Link>
        }
      >
        <ul className="-mx-2 flex flex-col">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-3 flex-1" />
              </li>
            ))}
          {popular.map((community, index) => (
            <li key={community.id}>
              <Link
                to={`/r/${community.slug}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover"
              >
                <span className="w-3 text-xs font-semibold tabular-nums text-subtle-foreground">
                  {index + 1}
                </span>
                <CommunityAvatar
                  name={community.name}
                  slug={community.slug}
                  logoUrl={community.logo_url}
                  size="sm"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {community.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {community.member_count.toLocaleString()} members
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </RailCard>

      <RailCard title="Your health tools">
        <ul className="-mx-2 flex flex-col">
          {TOOLS.map(({ to, icon: Icon, title, text }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {text}
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 text-subtle-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </RailCard>

      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl"
        />
        <div className="relative flex gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-sm font-semibold text-foreground">
              A safe space, together
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Be kind, share experience rather than prescriptions, and report anything
              that feels off. Moderators review every report.
            </p>
          </div>
        </div>
      </section>
    </aside>
  )
}
