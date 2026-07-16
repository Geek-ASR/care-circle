import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { CommunityWithCondition } from '../types'

export function CommunityCard({ community }: { community: CommunityWithCondition }) {
  return (
    <Link to={`/r/${community.slug}`}>
      <Card className="h-full transition-colors hover:bg-surface-hover">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
              aria-hidden="true"
            >
              {community.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <CardTitle className="truncate">{community.name}</CardTitle>
              <p className="truncate text-xs text-muted-foreground">
                /r/{community.slug}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {community.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {community.description}
            </p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {community.member_count.toLocaleString()} members
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
