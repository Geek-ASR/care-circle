import type { PostType } from '@/types/database'

export interface SearchPostResult {
  id: string
  title: string
  post_type: PostType
  community: { slug: string; name: string } | null
}

export interface SearchCommunityResult {
  id: string
  slug: string
  name: string
  description: string | null
  member_count: number
  logo_url: string | null
}

export interface SearchUserResult {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export interface SearchTagResult {
  id: string
  name: string
  slug: string
}

export interface SearchResults {
  posts: SearchPostResult[]
  communities: SearchCommunityResult[]
  users: SearchUserResult[]
  tags: SearchTagResult[]
}
