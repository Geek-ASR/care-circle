import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { PostList } from '@/features/posts/components/PostList'
import { PostSortTabs } from '@/features/posts/components/PostSortTabs'
import type { PostSort } from '@/features/posts/types'

export default function HomePage() {
  const [sort, setSort] = useState<PostSort>('hot')

  return (
    <div className="flex flex-col gap-4">
      <Helmet>
        <title>CareCircle — communities for people living with chronic illness</title>
      </Helmet>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Home</h1>
        <PostSortTabs value={sort} onChange={setSort} />
      </div>
      <PostList sort={sort} />
    </div>
  )
}
