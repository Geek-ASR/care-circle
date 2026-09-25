import { Link } from 'react-router-dom'
import { ArrowUpRight, Users } from 'lucide-react'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { getConditionCategory } from '@/features/conditions/constants'
import type { CommunityWithCondition } from '../types'

export function CommunityCard({ community }: { community: CommunityWithCondition }) {
  const category = getConditionCategory(community.condition?.category ?? null)

  return (
    <Link
      to={`/r/${community.slug}`}
      className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex items-start gap-3.5">
        <CommunityAvatar
          name={community.name}
          slug={community.slug}
          logoUrl={community.logo_url}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold text-foreground">
            {community.name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">r/{community.slug}</p>
        </div>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-subtle-foreground opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      {community.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {community.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-foreground">
            {community.member_count.toLocaleString()}
          </span>
          {community.member_count === 1 ? 'member' : 'members'}
        </div>
        {category && (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <category.icon className="h-3 w-3 shrink-0" aria-hidden="true" />
            {category.label}
          </span>
        )}
      </div>
    </Link>
  )
}
