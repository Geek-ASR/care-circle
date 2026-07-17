import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { PostList } from '@/features/posts/components/PostList'
import { PostSortTabs } from '@/features/posts/components/PostSortTabs'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
import type { PostSort } from '@/features/posts/types'

export default function HomePage() {
  const [sort, setSort] = useState<PostSort>('hot')
  const [feedScope, setFeedScope] = useState<'all' | 'following'>('all')

  return (
    <div className="flex flex-col gap-4">
      <Helmet>
        <title>CareCircle — communities for people living with chronic illness</title>
      </Helmet>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Home</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={feedScope}
            onValueChange={(v) => setFeedScope(v as 'all' | 'following')}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
          </Tabs>
          <PostSortTabs value={sort} onChange={setSort} />
        </div>
      </div>
      <PostList sort={sort} feedScope={feedScope} />
    </div>
  )
}
