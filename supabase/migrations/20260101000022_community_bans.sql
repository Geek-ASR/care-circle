-- ============================================================================
-- CareCircle: Community bans and mutes
-- ----------------------------------------------------------------------------
-- moderation_actions has allowed 'mute_user', 'temp_ban' and 'ban_user' since
-- the trust & safety migration, but nothing recorded who is currently
-- restricted or enforced it. This adds that state and wires it into the
-- write policies:
--
--   * mute  - can still read, vote and stay a member, but cannot post or
--             comment in the community.
--   * ban   - removed from the community, cannot rejoin, post or comment.
--
-- Either kind can be temporary (expires_at) or permanent (expires_at null).
-- Expired rows simply stop matching is_restricted_from(); nothing needs to
-- run on a schedule to lift them.
-- ============================================================================

set search_path = public, extensions;

create table public.community_bans (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('ban', 'mute')),
  reason text check (char_length(reason) <= 500),
  expires_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  -- One row per (community, user, kind): re-restricting someone updates the
  -- existing row (new reason/expiry) instead of stacking duplicates.
  unique (community_id, user_id, kind)
);

comment on table public.community_bans is
  'Active and historical per-community restrictions. A row is in effect while expires_at is null or in the future.';

create index community_bans_user_id_idx on public.community_bans (user_id);
create index community_bans_created_by_idx on public.community_bans (created_by);

-- ----------------------------------------------------------------------------
-- is_restricted_from(): true if uid currently has an active restriction of
-- one of the given kinds in community cid. SECURITY DEFINER for the same
-- reason as is_moderator_of(): policies on other tables call it, and the
-- caller can't necessarily see community_bans rows themselves.
-- ----------------------------------------------------------------------------
create or replace function public.is_restricted_from(
  cid uuid,
  uid uuid default auth.uid(),
  kinds text[] default array['ban', 'mute']
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_bans b
    where b.community_id = cid
      and b.user_id = uid
      and b.kind = any (kinds)
      and (b.expires_at is null or b.expires_at > now())
  );
$$;

comment on function public.is_restricted_from(uuid, uuid, text[]) is
  'True if uid has an unexpired ban/mute (of the given kinds) in community cid.';

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.community_bans enable row level security;

-- Moderators see their community's list; a restricted user can see their own
-- rows so the app can tell them why and until when.
create policy "community_bans_select_moderator_or_self"
  on public.community_bans for select
  to authenticated
  using (user_id = auth.uid() or public.is_moderator_of(community_id, auth.uid()));

-- Moderators can restrict members, but not other moderators (only a site
-- admin can), and never themselves.
create policy "community_bans_insert_moderator"
  on public.community_bans for insert
  to authenticated
  with check (
    public.is_moderator_of(community_id, auth.uid())
    and created_by = auth.uid()
    and user_id <> auth.uid()
    and (public.is_admin(auth.uid()) or not public.is_moderator_of(community_id, user_id))
  );

create policy "community_bans_update_moderator"
  on public.community_bans for update
  to authenticated
  using (public.is_moderator_of(community_id, auth.uid()))
  with check (
    public.is_moderator_of(community_id, auth.uid())
    and created_by = auth.uid()
    and user_id <> auth.uid()
    and (public.is_admin(auth.uid()) or not public.is_moderator_of(community_id, user_id))
  );

create policy "community_bans_delete_moderator"
  on public.community_bans for delete
  to authenticated
  using (public.is_moderator_of(community_id, auth.uid()));

-- ----------------------------------------------------------------------------
-- Side effects of restricting someone: log it, remove a banned user from the
-- community, and let them know. SECURITY DEFINER so it can write the audit
-- row and system notification regardless of the moderator's own RLS reach.
-- The notification has no actor_id on purpose: it comes from "the
-- moderators", not an individual, to reduce the risk of retaliation.
-- ----------------------------------------------------------------------------
create or replace function public.community_bans_after_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
begin
  v_action := case
    when new.kind = 'mute' then 'mute_user'
    when new.expires_at is null then 'ban_user'
    else 'temp_ban'
  end;

  insert into public.moderation_actions
    (moderator_id, community_id, target_type, target_id, action_type, reason)
  values
    (coalesce(new.created_by, auth.uid()), new.community_id, 'user', new.user_id, v_action, new.reason);

  if new.kind = 'ban' then
    delete from public.community_members
    where community_id = new.community_id and user_id = new.user_id;
  end if;

  insert into public.notifications (user_id, actor_id, type, target_type, target_id)
  values (new.user_id, null, 'moderator_message', 'community', new.community_id);

  return new;
end;
$$;

create trigger community_bans_after_insert_or_update
  after insert or update of kind, expires_at, reason on public.community_bans
  for each row execute function public.community_bans_after_write();

-- Only the trigger should ever call this; keep it out of the public RPC API.
revoke execute on function public.community_bans_after_write() from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- Enforcement in existing write policies.
-- ----------------------------------------------------------------------------

-- Posting: neither banned nor muted users can post in the community.
drop policy "posts_insert_own" on public.posts;

create policy "posts_insert_own"
  on public.posts for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and not public.is_restricted_from(community_id, auth.uid())
  );

-- Commenting: same rule, keeping the locked-post check from
-- 20260101000011_security_hardening.sql.
drop policy "comments_insert_own" on public.comments;

create policy "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.posts p
      where p.id = comments.post_id
        and (p.is_locked = false or public.is_moderator_of(p.community_id, auth.uid()))
        and not public.is_restricted_from(p.community_id, auth.uid())
    )
  );

-- Joining: a banned user can't simply rejoin (muted users can).
drop policy "community_members_insert_self" on public.community_members;

create policy "community_members_insert_self"
  on public.community_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'member'
    and not public.is_restricted_from(community_id, auth.uid(), array['ban'])
  );
