import type { Post, PostType } from '@/types/database'

export type PostSort = 'hot' | 'new' | 'top' | 'controversial'

export interface PostAuthor {
  username: string
  display_name: string | null
  avatar_url: string | null
}

export interface PostCommunitySummary {
  slug: string
  name: string
}

export interface PostWithRelations extends Post {
  author: PostAuthor | null
  community: PostCommunitySummary | null
  post_media: { storage_path: string; position: number }[]
  post_tags: { tag: { id: string; name: string; slug: string } }[]
}

export interface CreatePostInput {
  communityId: string
  authorId: string
  postType: PostType
  title: string
  body?: string
  url?: string
  rating?: number
  isNsfw?: boolean
  isSpoiler?: boolean
}
