export type ReportTargetType = 'post' | 'comment' | 'user' | 'message'
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed'

export interface ReportWithContext {
  id: string
  target_type: ReportTargetType
  target_id: string
  reason: string
  description: string | null
  status: ReportStatus
  created_at: string
  reporter: { username: string } | null
  targetPreview: string
  postId: string | null
  communityId: string | null
  communitySlug: string | null
}

export type ModerationActionType =
  'remove_post' | 'remove_comment' | 'pin_post' | 'lock_post'
