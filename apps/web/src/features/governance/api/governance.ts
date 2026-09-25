import { supabase } from '@/services/supabaseClient'
import type { CommunityMemberRole } from '@/types/database'

export interface ProfileSummary {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

const PROFILE_COLUMNS = 'id, username, display_name, avatar_url'

async function profilesById(ids: string[]): Promise<Map<string, ProfileSummary>> {
  const unique = [...new Set(ids)]
  if (unique.length === 0) return new Map()
  const { data, error } = await supabase
    .from('profile_public_view')
    .select(PROFILE_COLUMNS)
    .in('id', unique)
  if (error) throw error
  return new Map((data as ProfileSummary[]).map((p) => [p.id, p]))
}

// ---------------------------------------------------------------------------
// Community moderation log (moderation_actions; readable by that community's
// moderators and site admins).
// ---------------------------------------------------------------------------

export interface ModerationLogEntry {
  id: string
  action_type: string
  reason: string | null
  target_type: string | null
  target_id: string | null
  created_at: string
  moderator: ProfileSummary | null
  targetUser: ProfileSummary | null
}

export async function listModerationLog(
  communityId: string,
  limit = 100,
): Promise<ModerationLogEntry[]> {
  const { data, error } = await supabase
    .from('moderation_actions')
    .select('id, action_type, reason, target_type, target_id, created_at, moderator_id')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  const rows = data as (Omit<ModerationLogEntry, 'moderator' | 'targetUser'> & {
    moderator_id: string | null
  })[]
  const profiles = await profilesById([
    ...rows.map((r) => r.moderator_id).filter((id): id is string => Boolean(id)),
    ...rows
      .filter((r) => r.target_type === 'user' && r.target_id)
      .map((r) => r.target_id as string),
  ])

  return rows.map(({ moderator_id, ...row }) => ({
    ...row,
    moderator: moderator_id ? (profiles.get(moderator_id) ?? null) : null,
    targetUser:
      row.target_type === 'user' && row.target_id
        ? (profiles.get(row.target_id) ?? null)
        : null,
  }))
}

/**
 * Changes a member's community role. Governance rules (who may promote or
 * demote whom) are enforced by the community_members_governance trigger.
 */
export async function setMemberRole(
  communityId: string,
  userId: string,
  role: CommunityMemberRole,
) {
  const { error } = await supabase
    .from('community_members')
    .update({ role })
    .eq('community_id', communityId)
    .eq('user_id', userId)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Site-wide audit log and roles (site admins only).
// ---------------------------------------------------------------------------

export interface AuditLogEntry {
  id: string
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  actor: ProfileSummary | null
  targetUser: ProfileSummary | null
}

export async function listAuditLog(limit = 100): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action, target_type, target_id, metadata, created_at, actor_id')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  const rows = data as (Omit<AuditLogEntry, 'actor' | 'targetUser'> & {
    actor_id: string | null
  })[]
  const profiles = await profilesById([
    ...rows.map((r) => r.actor_id).filter((id): id is string => Boolean(id)),
    ...rows
      .filter((r) => r.target_type === 'user' && r.target_id)
      .map((r) => r.target_id as string),
  ])

  return rows.map(({ actor_id, ...row }) => ({
    ...row,
    actor: actor_id ? (profiles.get(actor_id) ?? null) : null,
    targetUser:
      row.target_type === 'user' && row.target_id
        ? (profiles.get(row.target_id) ?? null)
        : null,
  }))
}

export interface SiteRoleGrant {
  role: string
  granted_at: string
  user: ProfileSummary | null
}

export async function listSiteRoleGrants(): Promise<SiteRoleGrant[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, granted_at, role:roles(name)')
    .order('granted_at', { ascending: false })
  if (error) throw error

  const rows = data as unknown as {
    user_id: string
    granted_at: string
    role: { name: string } | null
  }[]
  const profiles = await profilesById(rows.map((r) => r.user_id))
  return rows
    .filter((r) => r.role && r.role.name !== 'member')
    .map((r) => ({
      role: r.role!.name,
      granted_at: r.granted_at,
      user: profiles.get(r.user_id) ?? null,
    }))
}

async function roleIdByName(name: string): Promise<string> {
  const { data, error } = await supabase
    .from('roles')
    .select('id')
    .eq('name', name)
    .single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function grantSiteRole(
  username: string,
  roleName: string,
  grantedBy: string,
) {
  const { data: profile, error } = await supabase
    .from('profile_public_view')
    .select('id')
    .eq('username', username.trim().replace(/^@/, ''))
    .maybeSingle()
  if (error) throw error
  if (!profile) throw new Error(`No user named @${username.replace(/^@/, '')}`)

  const roleId = await roleIdByName(roleName)
  const { error: insertError } = await supabase.from('user_roles').insert({
    user_id: (profile as { id: string }).id,
    role_id: roleId,
    granted_by: grantedBy,
  })
  if (insertError) throw insertError
}

export async function revokeSiteRole(userId: string, roleName: string) {
  const roleId = await roleIdByName(roleName)
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', roleId)
  if (error) throw error
}
