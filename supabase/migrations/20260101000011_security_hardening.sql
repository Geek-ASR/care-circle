-- ============================================================================
-- CareCircle: Security hardening
-- ----------------------------------------------------------------------------
-- Fixes for issues found in a dedicated security review of
-- 20260101000000 through 20260101000010, before this schema ever touches a
-- real deployment. Each section below names the finding it closes.
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- FINDING: notifications_insert_actor only constrained actor_id, not the
-- recipient (user_id) - any authenticated (or anonymous-auth) session could
-- flood an arbitrary user's inbox with fabricated notifications, since
-- nothing tied the row to a real event.
--
-- FIX: require evidence the claimed event actually happened (a matching
-- comment/vote/follow row authored by the actor, created recently for
-- reply/mention), or admin. A partial unique index also caps actor-driven
-- notifications to one per (recipient, actor, type, target) - a user
-- rapidly voting/unvoting the same post can no longer spam duplicates (the
-- second insert just fails, which the application already treats as a
-- best-effort no-op). Known tradeoff: multiple distinct replies from the
-- same actor on the same post collapse into a single notification, since
-- reply notifications are keyed at the post level, not per-comment - traded
-- for insert simplicity; revisit if under-notification becomes a real
-- complaint.
-- ----------------------------------------------------------------------------
drop policy "notifications_insert_actor" on public.notifications;

create policy "notifications_insert_verified"
  on public.notifications for insert
  to authenticated
  with check (
    public.is_admin(auth.uid())
    or (
      actor_id = auth.uid()
      and (
        (
          type = 'reply' and target_type = 'post'
          and exists (
            select 1 from public.comments c
            where c.post_id = notifications.target_id
              and c.author_id = auth.uid()
              and c.created_at > now() - interval '5 minutes'
          )
        )
        or (
          type = 'mention' and target_type = 'post'
          and exists (
            select 1 from public.posts p
            where p.id = notifications.target_id
              and p.author_id = auth.uid()
              and p.created_at > now() - interval '5 minutes'
          )
        )
        or (
          type = 'mention' and target_type = 'comment'
          and exists (
            select 1 from public.comments c
            where c.id = notifications.target_id
              and c.author_id = auth.uid()
              and c.created_at > now() - interval '5 minutes'
          )
        )
        or (
          type = 'upvote' and target_type = 'post'
          and exists (
            select 1 from public.votes v
            where v.post_id = notifications.target_id
              and v.user_id = auth.uid()
              and v.value = 1
          )
        )
        or (
          type = 'follow' and target_type = 'user'
          and target_id = notifications.user_id
          and exists (
            select 1 from public.follows f
            where f.follower_id = auth.uid()
              and f.followee_id = notifications.user_id
          )
        )
      )
    )
  );

create unique index notifications_dedupe_idx
  on public.notifications (user_id, actor_id, type, target_type, target_id)
  where actor_id is not null;

-- ----------------------------------------------------------------------------
-- FINDING: conversation_participants_insert_self_or_participant let any
-- authenticated user self-insert into ANY existing conversation_id, with no
-- check that they were actually invited - full read access to arbitrary
-- private DMs to anyone who could guess/obtain a conversation UUID.
--
-- FIX: track who created a conversation; self-join is only permitted for
-- the conversation's own creator (the normal "start a DM" bootstrap flow -
-- create the conversation, then add yourself and the other party in the
-- same flow). Everyone else can only be added by an existing participant.
-- ----------------------------------------------------------------------------
alter table public.conversations
  add column created_by uuid references public.profiles (id) on delete set null;

create index conversations_created_by_idx on public.conversations (created_by);

drop policy "conversations_insert_authenticated" on public.conversations;

create policy "conversations_insert_own"
  on public.conversations for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy "conversation_participants_insert_self_or_participant" on public.conversation_participants;

create policy "conversation_participants_insert_creator_or_participant"
  on public.conversation_participants for insert
  to authenticated
  with check (
    public.is_conversation_participant(conversation_id, auth.uid())
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_participants.conversation_id
        and c.created_by = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- FINDING: poll_votes_set_post_id() (which derives post_id from
-- poll_option_id to keep the one-vote-per-poll UNIQUE(post_id, user_id)
-- constraint honest) only ran BEFORE INSERT. poll_votes_update_own let a
-- user UPDATE poll_option_id to point at a different poll's option while
-- post_id stayed stale, defeating the one-vote-per-poll invariant for any
-- tally computed by joining on poll_option_id.
--
-- FIX: run the same derivation on UPDATE.
-- ----------------------------------------------------------------------------
create trigger poll_votes_before_update_set_post_id
  before update on public.poll_votes
  for each row execute function public.poll_votes_set_post_id();

-- ----------------------------------------------------------------------------
-- FINDING: profiles_select_public and community_members_select_public were
-- `to public` (includes anonymous, unauthenticated requests direct against
-- PostgREST, not just this app's UI). That exposed diagnosis_condition_id,
-- diagnosis_year, age, gender, country, bio, etc. - and, via
-- community_members, exactly which users belong to which condition-specific
-- community (an implicit diagnosis disclosure with no login required at
-- all) - to anyone, regardless of privacy_settings.
--
-- FIX, two layers:
--   1. community_members and follows: SELECT narrowed from `public` to
--      `authenticated`. Nothing in this app queries either table for
--      anonymous visitors (membership/follow UI only ever renders once a
--      user is signed in), so this has no user-facing effect beyond closing
--      the hole.
--   2. profiles: rather than removing anonymous access outright (author
--      usernames/avatars need to stay visible on posts/comments for
--      anonymous browsing to work, which is a hard product requirement),
--      REVOKE column-level SELECT on the sensitive fields from `anon`
--      specifically. `anon` keeps identity-only columns; `authenticated`
--      keeps full access. This is enforced by Postgres independent of RLS
--      and independent of what this app's own queries ask for - a direct
--      PostgREST request for a revoked column as `anon` now fails outright
--      rather than silently succeeding.
--
--      Known residual gap, explicitly not fixed here: any *logged-in* user
--      can still see any other user's sensitive fields regardless of their
--      privacy_settings (show_age/show_diagnosis) - RLS/column privileges
--      are both all-or-nothing per role, and privacy_settings is meant to
--      be finer-grained than that. A correct fix needs a public-profile
--      view (or splitting profiles into a public + owner-private table)
--      with per-row conditional column exposure, which is a larger change
--      than this hardening pass - tracked as follow-up work, not silently
--      dropped.
-- ----------------------------------------------------------------------------
drop policy "community_members_select_public" on public.community_members;

create policy "community_members_select_authenticated"
  on public.community_members for select
  to authenticated
  using (true);

drop policy "follows_select_public" on public.follows;

create policy "follows_select_authenticated"
  on public.follows for select
  to authenticated
  using (true);

revoke select (
  bio, country, age, gender, diagnosis_condition_id, diagnosis_year, website,
  social_links, privacy_settings, notification_settings
) on public.profiles from anon;

-- ----------------------------------------------------------------------------
-- FINDING: posts.is_locked had no enforcement anywhere - any post author
-- could flip it themselves, and comments_insert_own never checked it, so
-- new comments could still be inserted on a "locked" post regardless.
--
-- FIX: prevent_unauthorized_post_changes() already gates is_pinned and
-- remove/restore to moderators - extend it to is_locked. comments_insert_own
-- is redefined to block new comments when the parent post is locked, unless
-- the inserter moderates that post's community.
-- ----------------------------------------------------------------------------
create or replace function public.prevent_unauthorized_post_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 or auth.uid() is null then
    return new;
  end if;

  if new.score is distinct from old.score then
    raise exception 'posts.score is maintained automatically via votes and cannot be set directly';
  end if;

  if new.comment_count is distinct from old.comment_count then
    raise exception 'posts.comment_count is maintained automatically and cannot be set directly';
  end if;

  if new.community_id is distinct from old.community_id and not public.is_admin(auth.uid()) then
    raise exception 'Only an admin can move a post to a different community';
  end if;

  if not public.is_moderator_of(old.community_id, auth.uid()) then
    if new.is_pinned is distinct from old.is_pinned then
      raise exception 'Only moderators can pin/unpin a post';
    end if;
    if new.is_locked is distinct from old.is_locked then
      raise exception 'Only moderators can lock/unlock a post';
    end if;
    if new.status is distinct from old.status and (new.status = 'removed' or old.status = 'removed') then
      raise exception 'Only moderators can remove or restore a post';
    end if;
  end if;

  return new;
end;
$$;

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
    )
  );

-- ----------------------------------------------------------------------------
-- FINDING: communities_insert_own lets a user create a community, but
-- nothing ever adds them to community_members - and
-- community_members_insert_self only permits self-inserting as
-- role='member', while promotion to moderator requires is_moderator_of(),
-- which is false for everyone on a brand-new community. A community's
-- creator had no path to becoming its first moderator short of a site admin
-- manually running an UPDATE.
--
-- FIX: auto-add the creator as a 'moderator' of their own new community.
-- SECURITY DEFINER so it can bypass community_members_insert_self's
-- role='member' restriction for this one bootstrap case.
-- ----------------------------------------------------------------------------
create or replace function public.add_community_creator_as_moderator()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.community_members (community_id, user_id, role)
    values (new.id, new.created_by, 'moderator')
    on conflict (community_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

comment on function public.add_community_creator_as_moderator() is
  'AFTER INSERT trigger on communities: bootstraps the creator as the community''s first moderator.';

create trigger communities_after_insert_add_creator_moderator
  after insert on public.communities
  for each row execute function public.add_community_creator_as_moderator();

-- ----------------------------------------------------------------------------
-- MINOR: set_updated_at() was the only trigger function without an explicit
-- search_path. Harmless on its own (not SECURITY DEFINER, so there's no
-- privilege boundary to hijack), fixed for consistency with every other
-- function in this schema.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
