import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { BarChart3, HelpCircle, ImagePlus, Star } from 'lucide-react'
import { PostList } from '@/features/posts/components/PostList'
import { PostSortTabs } from '@/features/posts/components/PostSortTabs'
import { HomeRail } from '@/features/home/components/HomeRail'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { avatarGradient } from '@/utils/avatarColor'
import type { PostSort } from '@/features/posts/types'

const QUICK_ACTIONS = [
  { type: 'question', label: 'Ask', icon: HelpCircle },
  { type: 'poll', label: 'Poll', icon: BarChart3 },
  { type: 'treatment_review', label: 'Review', icon: Star },
  { type: 'image', label: 'Photo', icon: ImagePlus },
] as const

function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 5) return 'Up late'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const { user, profile } = useAuth()
  const [sort, setSort] = useState<PostSort>('hot')
  const [feedScope, setFeedScope] = useState<'all' | 'following'>('all')

  const name = profile?.display_name ?? profile?.username ?? ''
  const firstName = name.split(' ')[0]

  return (
    <div className="flex gap-8">
      <Helmet>
        <title>CareCircle — communities for people living with illness</title>
      </Helmet>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            {greeting()}
            {firstName && `, ${firstName}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what your circle is talking about today.
          </p>
        </div>

        {user && (
          <div className="rounded-2xl border border-border bg-surface p-3 shadow-xs">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
                <AvatarFallback
                  className={`${avatarGradient(profile?.username ?? user.id)} font-semibold text-white`}
                >
                  {(name || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Link
                to="/submit"
                className="flex h-10 flex-1 items-center rounded-full border border-border bg-surface-sunken px-4 text-sm text-subtle-foreground transition-colors hover:border-border-strong hover:text-muted-foreground"
              >
                Share something with your circle…
              </Link>
            </div>
            <div className="mt-2 flex flex-wrap gap-1 pl-[52px]">
              {QUICK_ACTIONS.map(({ type, label, icon: Icon }) => (
                <Link
                  key={type}
                  to={`/submit?type=${type}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={feedScope}
            onValueChange={(v) => setFeedScope(v as 'all' | 'following')}
          >
            <TabsList>
              <TabsTrigger value="all">All posts</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
          </Tabs>
          <PostSortTabs value={sort} onChange={setSort} />
        </div>

        <PostList sort={sort} feedScope={feedScope} />
      </div>

      <HomeRail />
    </div>
  )
}
