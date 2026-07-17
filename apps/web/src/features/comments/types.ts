import type { Comment } from '@/types/database'
import type { ReactionSummary } from '@/features/reactions/api/reactions'

export type CommentSort = 'best' | 'new' | 'old'

export interface CommentAuthor {
  username: string
  display_name: string | null
  avatar_url: string | null
}

export interface CommentWithAuthor extends Comment {
  author: CommentAuthor | null
}

export interface CommentNode extends CommentWithAuthor {
  userVote: 0 | 1 | -1
  reactions: ReactionSummary[]
  children: CommentNode[]
}
