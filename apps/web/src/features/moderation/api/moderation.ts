import { supabase } from '@/services/supabaseClient'
import type { Community } from '@/types/database'
import type {
  ModerationActionType,
  ReportStatus,
  ReportTargetType,
  ReportWithContext,
} from '../types'

export async function isSiteAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw error
  return Boolean(data)
}

export async function listModeratedCommunityIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('user_id', userId)
    .in('role', ['moderator', 'admin'])
  if (error) throw error
  return (data as { community_id: string }[]).map((row) => row.community_id)
}

interface ReportRow {
  id: string
  target_type: ReportTargetType
  target_id: string
  reason: string
  description: string | null
  status: ReportStatus
  created_at: string
  reporter: { username: string } | null
}

interface PostLookupRow {
  id: string
  title: string
  community_id: string
  community: { slug: string } | null
}

/** RLS already scopes this to reports the caller can see (own reports, or moderated/admin scope). */
export async function listReports(): Promise<ReportWithContext[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(
      'id, target_type, target_id, reason, description, status, created_at, reporter:profiles!reports_reporter_id_fkey(username)',
    )
    .order('created_at', { ascending: false })
  if (error) throw error

  const rows = data as unknown as ReportRow[]
  const directPostIds = rows
    .filter((row) => row.target_type === 'post')
    .map((row) => row.target_id)
  const commentIds = rows
    .filter((row) => row.target_type === 'comment')
    .map((row) => row.target_id)

  const { data: commentRows, error: commentsError } = commentIds.length
    ? await supabase.from('comments').select('id, body, post_id').in('id', commentIds)
    : { data: [] as { id: string; body: string | null; post_id: string }[], error: null }
  if (commentsError) throw commentsError

  const commentPostIds = (commentRows ?? []).map((row) => row.post_id)
  const allPostIds = Array.from(new Set([...directPostIds, ...commentPostIds]))

  const { data: postRows, error: postsError } = allPostIds.length
    ? await supabase
        .from('posts')
        .select('id, title, community_id, community:communities(slug)')
        .in('id', allPostIds)
    : { data: [] as PostLookupRow[], error: null }
  if (postsError) throw postsError

  const postsById = new Map(
    ((postRows as unknown as PostLookupRow[] | null) ?? []).map((p) => [p.id, p]),
  )
  const commentsById = new Map((commentRows ?? []).map((c) => [c.id, c]))

  return rows.map((row) => {
    if (row.target_type === 'post') {
      const post = postsById.get(row.target_id)
      return {
        ...row,
        targetPreview: post?.title ?? '[removed post]',
        postId: post?.id ?? null,
        communityId: post?.community_id ?? null,
        communitySlug: post?.community?.slug ?? null,
      }
    }
    if (row.target_type === 'comment') {
      const comment = commentsById.get(row.target_id)
      const post = comment ? postsById.get(comment.post_id) : undefined
      return {
        ...row,
        targetPreview: comment?.body?.slice(0, 140) ?? '[removed comment]',
        postId: post?.id ?? null,
        communityId: post?.community_id ?? null,
        communitySlug: post?.community?.slug ?? null,
      }
    }
    return {
      ...row,
      targetPreview: `Reported ${row.target_type}`,
      postId: null,
      communityId: null,
      communitySlug: null,
    }
  })
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  reviewerId: string,
) {
  const { error } = await supabase
    .from('reports')
    .update({ status, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
    .eq('id', reportId)
  if (error) throw error
}

export async function logModerationAction(input: {
  moderatorId: string
  communityId: string
  targetType: string
  targetId: string
  actionType: ModerationActionType
  reason?: string
}) {
  const { error } = await supabase.from('moderation_actions').insert({
    moderator_id: input.moderatorId,
    community_id: input.communityId,
    target_type: input.targetType,
    target_id: input.targetId,
    action_type: input.actionType,
    reason: input.reason ?? null,
  })
  if (error) throw error
}

export async function listPendingCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Community[]
}

export async function approveCommunity(communityId: string) {
  const { error } = await supabase
    .from('communities')
    .update({ is_approved: true })
    .eq('id', communityId)
  if (error) throw error
}

export async function rejectCommunity(communityId: string) {
  const { error } = await supabase.from('communities').delete().eq('id', communityId)
  if (error) throw error
}
