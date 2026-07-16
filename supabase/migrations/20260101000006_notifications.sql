-- ============================================================================
-- CareCircle: Notifications
-- ----------------------------------------------------------------------------
-- Per-user notification inbox (replies, mentions, upvotes, follows,
-- moderator messages, announcements, badge awards). target_type/target_id
-- form a loose polymorphic reference (e.g. target_type='post', target_id=
-- posts.id) resolved by the application, not a DB-level FK, since the
-- target can be one of several tables.
-- ============================================================================

set search_path = public, extensions;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null check (type in (
    'reply', 'mention', 'upvote', 'follow', 'moderator_message', 'announcement', 'badge_earned'
  )),
  target_type text,
  target_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'Per-user notification inbox. user_id is the recipient; actor_id is who triggered it (nullable for system notifications).';

create index notifications_user_id_is_read_created_at_idx on public.notifications (user_id, is_read, created_at desc);
create index notifications_actor_id_idx on public.notifications (actor_id);
create index notifications_target_idx on public.notifications (target_type, target_id);
