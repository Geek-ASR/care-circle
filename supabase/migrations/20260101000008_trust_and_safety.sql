-- ============================================================================
-- CareCircle: Trust & safety
-- ----------------------------------------------------------------------------
-- User reports, the moderation-action log (community-scoped), the
-- system/admin-level audit log, and the per-user activity feed log.
-- target_type/target_id are loose polymorphic references resolved by the
-- application (the target can be posts, comments, users, or messages).
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- reports
-- ----------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  target_type text not null check (target_type in ('post', 'comment', 'user', 'message')),
  target_id uuid not null,
  reason text not null check (reason in (
    'spam', 'abuse', 'harassment', 'misinformation', 'medical_misinformation',
    'violence', 'self_harm', 'scam', 'other'
  )),
  description text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index reports_target_idx on public.reports (target_type, target_id);
create index reports_reporter_id_idx on public.reports (reporter_id);
create index reports_reviewed_by_idx on public.reports (reviewed_by);
create index reports_pending_idx on public.reports (created_at) where status = 'pending';

-- ----------------------------------------------------------------------------
-- moderation_actions: community-scoped moderator action log.
-- ----------------------------------------------------------------------------
create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid references public.profiles (id) on delete set null,
  community_id uuid references public.communities (id) on delete cascade,
  target_type text,
  target_id uuid,
  action_type text check (action_type in (
    'remove_post', 'remove_comment', 'pin_post', 'lock_post', 'warn_user',
    'mute_user', 'temp_ban', 'ban_user', 'approve_post'
  )),
  reason text,
  created_at timestamptz not null default now()
);

create index moderation_actions_community_id_idx on public.moderation_actions (community_id);
create index moderation_actions_moderator_id_idx on public.moderation_actions (moderator_id);
create index moderation_actions_target_idx on public.moderation_actions (target_type, target_id);

-- ----------------------------------------------------------------------------
-- audit_logs: system/admin-level audit trail (role grants, community
-- approvals, etc.). Not community-scoped.
-- ----------------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index audit_logs_target_idx on public.audit_logs (target_type, target_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- activity_logs: per-user "recent activity" feed.
-- ----------------------------------------------------------------------------
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  action_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_user_id_created_at_idx on public.activity_logs (user_id, created_at desc);
