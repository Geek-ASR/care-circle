/**
 * Hand-authored row types mirroring `supabase/migrations/`.
 *
 * Once the Supabase project is linked, prefer generating authoritative types with:
 *   supabase gen types typescript --linked > src/types/supabase-generated.ts
 * and pass that `Database` type to `createClient<Database>()` in services/supabaseClient.ts.
 * Until then, these types are the source of truth for app code and must be kept in
 * sync with the migrations by hand.
 */

export type UUID = string
export type ISODateString = string

export type PostType =
  | 'text'
  | 'image'
  | 'link'
  | 'poll'
  | 'question'
  | 'experience'
  | 'success_story'
  | 'treatment_review'
  | 'medication_review'
  | 'doctor_review'
  | 'hospital_review'
  | 'research_discussion'
  | 'lifestyle_tip'

export type PostStatus = 'draft' | 'published' | 'removed' | 'deleted'
export type CommentStatus = 'published' | 'removed' | 'deleted'
export type CommunityMemberRole = 'member' | 'moderator' | 'admin'
export type ThemePreference = 'dark' | 'light' | 'system'
export type NotificationType =
  | 'reply'
  | 'mention'
  | 'upvote'
  | 'follow'
  | 'moderator_message'
  | 'announcement'
  | 'badge_earned'
export type ReportReason =
  | 'spam'
  | 'abuse'
  | 'harassment'
  | 'misinformation'
  | 'medical_misinformation'
  | 'violence'
  | 'self_harm'
  | 'scam'
  | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed'
export type ReportTargetType = 'post' | 'comment' | 'user' | 'message'

export interface Profile {
  id: UUID
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  country: string | null
  age: number | null
  gender: string | null
  diagnosis_condition_id: UUID | null
  diagnosis_year: number | null
  verified_diagnosis: boolean
  website: string | null
  social_links: Record<string, string>
  reputation_score: number
  privacy_settings: {
    show_age?: boolean
    show_diagnosis?: boolean
    profile_visibility?: 'public' | 'members_only' | 'private'
  }
  notification_settings: Record<string, boolean>
  theme_preference: ThemePreference
  onboarding_completed: boolean
  created_at: ISODateString
  updated_at: ISODateString
}

export interface Condition {
  id: UUID
  name: string
  slug: string
  description: string | null
  category: string | null
  created_at: ISODateString
}

export interface Role {
  id: UUID
  name: string
  description: string | null
}

export interface Permission {
  id: UUID
  name: string
  description: string | null
}

export interface UserRole {
  user_id: UUID
  role_id: UUID
  granted_by: UUID | null
  granted_at: ISODateString
}

export interface Follow {
  follower_id: UUID
  followee_id: UUID
  created_at: ISODateString
}

export interface Community {
  id: UUID
  slug: string
  name: string
  description: string | null
  banner_url: string | null
  logo_url: string | null
  condition_id: UUID | null
  member_count: number
  is_approved: boolean
  is_nsfw: boolean
  created_by: UUID | null
  created_at: ISODateString
  updated_at: ISODateString
}

export interface CommunityMember {
  community_id: UUID
  user_id: UUID
  role: CommunityMemberRole
  joined_at: ISODateString
}

export interface CommunityRule {
  id: UUID
  community_id: UUID
  title: string
  description: string | null
  position: number
  created_at: ISODateString
}

export interface CommunityResource {
  id: UUID
  community_id: UUID
  title: string
  url: string | null
  description: string | null
  category: string | null
  position: number
  created_at: ISODateString
}

export interface WikiPage {
  id: UUID
  community_id: UUID
  slug: string
  title: string
  content: string
  created_by: UUID | null
  version: number
  updated_at: ISODateString
  created_at: ISODateString
}

export interface Post {
  id: UUID
  community_id: UUID
  author_id: UUID | null
  post_type: PostType
  title: string
  body: string | null
  url: string | null
  is_pinned: boolean
  is_locked: boolean
  is_nsfw: boolean
  is_spoiler: boolean
  score: number
  comment_count: number
  status: PostStatus
  edited_at: ISODateString | null
  created_at: ISODateString
  updated_at: ISODateString
}

export interface PostMedia {
  id: UUID
  post_id: UUID
  storage_path: string
  media_type: 'image' | 'video' | 'gif'
  position: number
  created_at: ISODateString
}

export interface PostVersion {
  id: UUID
  post_id: UUID
  body: string | null
  title: string | null
  edited_by: UUID | null
  created_at: ISODateString
}

export interface PollOption {
  id: UUID
  post_id: UUID
  option_text: string
  position: number
}

export interface PollVote {
  poll_option_id: UUID
  post_id: UUID
  user_id: UUID
  created_at: ISODateString
}

export interface Draft {
  id: UUID
  user_id: UUID
  community_id: UUID | null
  post_type: PostType | null
  title: string | null
  body: string | null
  updated_at: ISODateString
  created_at: ISODateString
}

export interface Tag {
  id: UUID
  name: string
  slug: string
}

export interface PostTag {
  post_id: UUID
  tag_id: UUID
}

export interface Comment {
  id: UUID
  post_id: UUID
  author_id: UUID | null
  parent_comment_id: UUID | null
  body: string | null
  path: string
  is_edited: boolean
  score: number
  status: CommentStatus
  created_at: ISODateString
  updated_at: ISODateString
}

export interface Vote {
  id: UUID
  user_id: UUID
  post_id: UUID | null
  comment_id: UUID | null
  value: -1 | 1
  created_at: ISODateString
}

export interface Reaction {
  id: UUID
  user_id: UUID
  post_id: UUID | null
  comment_id: UUID | null
  emoji: string
  created_at: ISODateString
}

export interface Bookmark {
  id: UUID
  user_id: UUID
  post_id: UUID
  created_at: ISODateString
}

export interface Conversation {
  id: UUID
  is_group: boolean
  community_id: UUID | null
  created_by: UUID | null
  created_at: ISODateString
}

export interface ConversationParticipant {
  conversation_id: UUID
  user_id: UUID
  last_read_at: ISODateString | null
}

export interface Message {
  id: UUID
  conversation_id: UUID
  sender_id: UUID | null
  body: string | null
  attachment_url: string | null
  edited_at: ISODateString | null
  created_at: ISODateString
}

export interface Notification {
  id: UUID
  user_id: UUID
  actor_id: UUID | null
  type: NotificationType
  target_type: string | null
  target_id: UUID | null
  is_read: boolean
  created_at: ISODateString
}

export interface Badge {
  id: UUID
  name: string
  description: string | null
  icon: string | null
  criteria: string | null
}

export interface UserBadge {
  user_id: UUID
  badge_id: UUID
  awarded_at: ISODateString
}

export interface Achievement {
  id: UUID
  name: string
  description: string | null
  icon: string | null
  target_value: number | null
}

export interface UserAchievement {
  user_id: UUID
  achievement_id: UUID
  progress: number
  completed_at: ISODateString | null
}

export interface ReputationEvent {
  id: UUID
  user_id: UUID
  delta: number
  reason: string
  source_type: string | null
  source_id: UUID | null
  created_at: ISODateString
}

export interface Report {
  id: UUID
  reporter_id: UUID | null
  target_type: ReportTargetType
  target_id: UUID
  reason: ReportReason
  description: string | null
  status: ReportStatus
  reviewed_by: UUID | null
  created_at: ISODateString
  reviewed_at: ISODateString | null
}

export interface ModerationAction {
  id: UUID
  moderator_id: UUID | null
  community_id: UUID | null
  target_type: string | null
  target_id: UUID | null
  action_type: string
  reason: string | null
  created_at: ISODateString
}

export interface AuditLog {
  id: UUID
  actor_id: UUID | null
  action: string
  target_type: string | null
  target_id: UUID | null
  metadata: Record<string, unknown>
  created_at: ISODateString
}

export interface ActivityLog {
  id: UUID
  user_id: UUID
  action_type: string
  metadata: Record<string, unknown>
  created_at: ISODateString
}
