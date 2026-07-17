-- ============================================================================
-- CareCircle: Privacy settings enforcement and user blocking
-- ----------------------------------------------------------------------------
-- profiles.privacy_settings (show_age/show_diagnosis/profile_visibility) has
-- existed since the very first migration and was explicitly called out as
-- unenforced in 20260101000011_security_hardening.sql: "any logged-in user
-- can still see any other user's sensitive fields regardless of their
-- privacy_settings... a correct fix needs a public-profile view... tracked
-- as follow-up work, not silently dropped." This is that follow-up.
--
-- RLS is row-level and column grants are role-level - neither can express
-- "hide this column only for this row when this row's own jsonb says so."
-- A view can, since its SELECT list is just SQL and auth.uid()/auth.role()
-- are live per-request regardless of who owns the view. Callers looking up
-- someone else's profile now query this view instead of the raw table; the
-- owner's own profile fetch (AuthContext) keeps reading the table directly,
-- since privacy settings never apply to yourself.
-- ============================================================================

set search_path = public, extensions;

-- security_invoker = false (views' traditional default): the view must see
-- every row in public.profiles regardless of the caller's own row-level
-- access, since the privacy gating below IS the visibility logic (the base
-- table's own "using (true)" policy is permissive at the row level - the
-- real protection this session's security hardening pass added was the
-- column-level REVOKE of sensitive fields from anon, which this view must
-- reproduce itself via auth.role() checks rather than silently bypass by
-- exposing those columns to anyone who can query the view).
create view public.profile_public_view
with (security_invoker = false)
as
select
  id, username, display_name, avatar_url, banner_url, verified_diagnosis,
  reputation_score, follower_count, following_count, theme_preference,
  onboarding_completed, created_at, updated_at,
  case when auth.role() = 'authenticated' then bio else null end as bio,
  case when auth.role() = 'authenticated' then country else null end as country,
  case when auth.role() = 'authenticated' then website else null end as website,
  case when auth.role() = 'authenticated' then social_links else '{}'::jsonb end as social_links,
  case
    when auth.role() = 'authenticated'
      and (coalesce((privacy_settings ->> 'show_age')::boolean, false) or id = auth.uid())
      then age
    else null
  end as age,
  case
    when auth.role() = 'authenticated'
      and (coalesce((privacy_settings ->> 'show_diagnosis')::boolean, true) or id = auth.uid())
      then diagnosis_condition_id
    else null
  end as diagnosis_condition_id,
  case
    when auth.role() = 'authenticated'
      and (coalesce((privacy_settings ->> 'show_diagnosis')::boolean, true) or id = auth.uid())
      then diagnosis_year
    else null
  end as diagnosis_year
from public.profiles
where
  coalesce(privacy_settings ->> 'profile_visibility', 'public') = 'public'
  or id = auth.uid()
  or (
    coalesce(privacy_settings ->> 'profile_visibility', 'public') = 'members_only'
    and auth.role() = 'authenticated'
  );

comment on view public.profile_public_view is
  'Privacy-aware read of profiles for viewing someone ELSE''s profile - respects profile_visibility (hides the row entirely), show_age/show_diagnosis (nulls those columns), and reproduces the anon column-revoke from 20260101000011_security_hardening.sql (bio/country/website/social_links/age/diagnosis all null for anon). Never use this for the caller''s own profile fetch, where privacy settings do not apply.';

grant select on public.profile_public_view to anon, authenticated;

-- ----------------------------------------------------------------------------
-- blocks: private (only the blocker can see who they've blocked, unlike the
-- semi-public follows graph). Enforcement is scoped, not exhaustive: prevents
-- new DMs between a blocked pair (see get_or_create_direct_conversation()
-- below) and backs a "block" button + "blocked users" settings list.
-- Content-hiding across feeds is deliberately out of scope for this pass.
-- ----------------------------------------------------------------------------
create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_no_self_block check (blocker_id <> blocked_id)
);

create index blocks_blocked_id_idx on public.blocks (blocked_id);

alter table public.blocks enable row level security;

create policy "blocks_select_own"
  on public.blocks for select
  to authenticated
  using (blocker_id = auth.uid());

create policy "blocks_insert_own"
  on public.blocks for insert
  to authenticated
  with check (blocker_id = auth.uid());

create policy "blocks_delete_own"
  on public.blocks for delete
  to authenticated
  using (blocker_id = auth.uid());

-- ----------------------------------------------------------------------------
-- get_or_create_direct_conversation(): redefined to refuse starting a new DM
-- when either party has blocked the other. Existing conversations are left
-- alone (blocking doesn't retroactively hide message history).
-- ----------------------------------------------------------------------------
create or replace function public.get_or_create_direct_conversation(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  existing_id uuid;
begin
  if caller_id is null then
    raise exception 'get_or_create_direct_conversation requires an authenticated caller';
  end if;
  if p_other_user_id = caller_id then
    raise exception 'cannot start a conversation with yourself';
  end if;

  if exists (
    select 1 from public.blocks
    where (blocker_id = caller_id and blocked_id = p_other_user_id)
       or (blocker_id = p_other_user_id and blocked_id = caller_id)
  ) then
    raise exception 'cannot start a conversation with a blocked user';
  end if;

  select cp1.conversation_id into existing_id
  from public.conversation_participants cp1
  join public.conversation_participants cp2
    on cp2.conversation_id = cp1.conversation_id and cp2.user_id = p_other_user_id
  join public.conversations c on c.id = cp1.conversation_id
  where cp1.user_id = caller_id
    and c.is_group = false
    and c.community_id is null
  limit 1;

  if existing_id is not null then
    return existing_id;
  end if;

  return public.create_conversation(array[p_other_user_id], false, null);
end;
$$;
