-- ============================================================================
-- CareCircle: Row Level Security policies
-- ----------------------------------------------------------------------------
-- Enables RLS on every application table (no exceptions) and defines a
-- default-deny policy set: if a table has no policy for a given
-- command/role, that command is refused. Storage policies live in
-- 20260101000009_storage_buckets.sql; this file covers every table created
-- in migrations 20260101000001 through 20260101000008.
--
-- Conventions used throughout:
--   * `to public`       -> open to anon AND authenticated (genuinely public reads).
--   * `to authenticated` -> requires a JWT (permanent OR Supabase anonymous-auth
--                            sessions both get the `authenticated` Postgres role;
--                            `anon` is reserved for zero-JWT requests).
--   * Ownership checks use auth.uid() directly; privilege checks use the
--     is_admin() / is_moderator_of() / is_community_member() helpers from
--     20260101000003_rls_helper_functions.sql.
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- is_conversation_participant(): additional RLS helper, defined here (rather
-- than in 20260101000003_rls_helper_functions.sql) because it depends on
-- conversation_participants, which doesn't exist until
-- 20260101000005_messaging.sql. SECURITY DEFINER so conversation_participants'
-- own SELECT policy can use it without a table querying its own
-- RLS-filtered self via a raw correlated subquery (self-referential
-- policies are a classic source of recursive-RLS bugs).
-- ----------------------------------------------------------------------------
create or replace function public.is_conversation_participant(conv_id uuid, uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conv_id
      and cp.user_id = uid
  );
$$;

comment on function public.is_conversation_participant(uuid, uuid) is 'True if uid is a participant in conversation conv_id.';

-- ============================================================================
-- Identity & taxonomy
-- ============================================================================

-- ---- profiles ---------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_public"
  on public.profiles for select
  to public
  using (true);

-- No INSERT policy: rows are created exclusively by handle_new_user(),
-- which runs SECURITY DEFINER as the table owner and therefore bypasses RLS.
-- Direct client INSERTs are refused by default-deny.

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No DELETE policy: profile rows are removed only via the auth.users
-- ON DELETE CASCADE (account deletion via the Auth admin API/service role).

-- ---- conditions ---------------------------------------------------------------
alter table public.conditions enable row level security;

create policy "conditions_select_public"
  on public.conditions for select
  to public
  using (true);

create policy "conditions_admin_write"
  on public.conditions for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---- roles / permissions / role_permissions ----------------------------------
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

create policy "roles_select_authenticated"
  on public.roles for select
  to authenticated
  using (true);

create policy "roles_admin_write"
  on public.roles for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "permissions_select_authenticated"
  on public.permissions for select
  to authenticated
  using (true);

create policy "permissions_admin_write"
  on public.permissions for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "role_permissions_select_authenticated"
  on public.role_permissions for select
  to authenticated
  using (true);

create policy "role_permissions_admin_write"
  on public.role_permissions for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---- user_roles (site-wide role grants) --------------------------------------
alter table public.user_roles enable row level security;

create policy "user_roles_select_authenticated"
  on public.user_roles for select
  to authenticated
  using (true);

create policy "user_roles_admin_write"
  on public.user_roles for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---- follows ------------------------------------------------------------------
-- Not explicitly scoped by the spec; treated like community_members (public
-- social graph, non-sensitive) rather than fully private.
alter table public.follows enable row level security;

create policy "follows_select_public"
  on public.follows for select
  to public
  using (true);

create policy "follows_insert_own"
  on public.follows for insert
  to authenticated
  with check (follower_id = auth.uid());

create policy "follows_delete_own"
  on public.follows for delete
  to authenticated
  using (follower_id = auth.uid());

-- ============================================================================
-- Communities
-- ============================================================================

-- ---- communities ----------------------------------------------------------
alter table public.communities enable row level security;

-- Approved communities are publicly visible; unapproved (pending-review)
-- communities are visible only to their creator, that community's
-- moderators, and site admins.
create policy "communities_select_scoped"
  on public.communities for select
  to public
  using (
    is_approved = true
    or created_by = auth.uid()
    or public.is_moderator_of(id, auth.uid())
    or public.is_admin(auth.uid())
  );

-- New communities always start unapproved; approval can only happen via a
-- later UPDATE, which prevent_unauthorized_approval() restricts to admins.
create policy "communities_insert_own"
  on public.communities for insert
  to authenticated
  with check (created_by = auth.uid() and is_approved = false);

create policy "communities_update_moderator"
  on public.communities for update
  to authenticated
  using (public.is_moderator_of(id, auth.uid()))
  with check (public.is_moderator_of(id, auth.uid()));

create policy "communities_delete_admin"
  on public.communities for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ---- community_members -----------------------------------------------------
alter table public.community_members enable row level security;

create policy "community_members_select_public"
  on public.community_members for select
  to public
  using (true);

-- Self-join only, and only ever as a plain 'member'. Escalation to
-- moderator/admin happens via UPDATE by an existing moderator/admin.
create policy "community_members_insert_self"
  on public.community_members for insert
  to authenticated
  with check (user_id = auth.uid() and role = 'member');

create policy "community_members_update_moderator"
  on public.community_members for update
  to authenticated
  using (public.is_moderator_of(community_id, auth.uid()))
  with check (public.is_moderator_of(community_id, auth.uid()));

create policy "community_members_delete_self_or_moderator"
  on public.community_members for delete
  to authenticated
  using (user_id = auth.uid() or public.is_moderator_of(community_id, auth.uid()));

-- ---- community_rules / community_resources / wiki_pages -------------------
alter table public.community_rules enable row level security;
alter table public.community_resources enable row level security;
alter table public.wiki_pages enable row level security;

create policy "community_rules_select_public"
  on public.community_rules for select
  to public
  using (true);

create policy "community_rules_moderator_write"
  on public.community_rules for all
  to authenticated
  using (public.is_moderator_of(community_id, auth.uid()))
  with check (public.is_moderator_of(community_id, auth.uid()));

create policy "community_resources_select_public"
  on public.community_resources for select
  to public
  using (true);

create policy "community_resources_moderator_write"
  on public.community_resources for all
  to authenticated
  using (public.is_moderator_of(community_id, auth.uid()))
  with check (public.is_moderator_of(community_id, auth.uid()));

create policy "wiki_pages_select_public"
  on public.wiki_pages for select
  to public
  using (true);

create policy "wiki_pages_moderator_write"
  on public.wiki_pages for all
  to authenticated
  using (public.is_moderator_of(community_id, auth.uid()))
  with check (public.is_moderator_of(community_id, auth.uid()));

-- ============================================================================
-- Content
-- ============================================================================

-- ---- posts ------------------------------------------------------------------
alter table public.posts enable row level security;

-- Published posts are public; authors can always see their own (including
-- draft/removed/deleted, for their own history/undo UI); moderators/admins
-- can see everything in their community for review purposes.
create policy "posts_select_scoped"
  on public.posts for select
  to public
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_moderator_of(community_id, auth.uid())
  );

create policy "posts_insert_own"
  on public.posts for insert
  to authenticated
  with check (author_id = auth.uid());

-- UPDATE is intentionally still restricted even though the app never hard-
-- deletes: this is how status is moved to 'deleted'/'removed', pinning/
-- locking happens, etc. prevent_unauthorized_post_changes() adds the
-- column-level restrictions RLS can't express (score/comment_count/pin/
-- remove are moderator- or trigger-only even for the post's own author).
create policy "posts_update_own_or_moderator"
  on public.posts for update
  to authenticated
  using (author_id = auth.uid() or public.is_moderator_of(community_id, auth.uid()) or public.is_admin(auth.uid()))
  with check (author_id = auth.uid() or public.is_moderator_of(community_id, auth.uid()) or public.is_admin(auth.uid()));

-- No DELETE policy: user-facing delete is UPDATE status='deleted'. Hard
-- DELETE only happens via cascade or a service-role admin/GDPR path.

-- ---- post_media ---------------------------------------------------------------
alter table public.post_media enable row level security;

create policy "post_media_select_scoped"
  on public.post_media for select
  to public
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and (p.status = 'published' or p.author_id = auth.uid() or public.is_moderator_of(p.community_id, auth.uid()))
    )
  );

create policy "post_media_insert_own"
  on public.post_media for insert
  to authenticated
  with check (
    exists (select 1 from public.posts p where p.id = post_media.post_id and p.author_id = auth.uid())
  );

create policy "post_media_update_own"
  on public.post_media for update
  to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and (p.author_id = auth.uid() or public.is_moderator_of(p.community_id, auth.uid()))
    )
  )
  with check (
    exists (select 1 from public.posts p where p.id = post_media.post_id and p.author_id = auth.uid())
  );

create policy "post_media_delete_own_or_moderator"
  on public.post_media for delete
  to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and (p.author_id = auth.uid() or public.is_moderator_of(p.community_id, auth.uid()))
    )
  );

-- ---- post_versions (insert-only edit history) --------------------------------
alter table public.post_versions enable row level security;

create policy "post_versions_select_own_or_moderator"
  on public.post_versions for select
  to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_versions.post_id
        and (p.author_id = auth.uid() or public.is_moderator_of(p.community_id, auth.uid()))
    )
  );

create policy "post_versions_insert_own"
  on public.post_versions for insert
  to authenticated
  with check (
    edited_by = auth.uid()
    and exists (select 1 from public.posts p where p.id = post_versions.post_id and p.author_id = auth.uid())
  );

-- No UPDATE/DELETE: history snapshots are immutable.

-- ---- poll_options / poll_votes -----------------------------------------------
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

create policy "poll_options_select_scoped"
  on public.poll_options for select
  to public
  using (
    exists (
      select 1 from public.posts p
      where p.id = poll_options.post_id
        and (p.status = 'published' or p.author_id = auth.uid() or public.is_moderator_of(p.community_id, auth.uid()))
    )
  );

create policy "poll_options_insert_own"
  on public.poll_options for insert
  to authenticated
  with check (
    exists (select 1 from public.posts p where p.id = poll_options.post_id and p.author_id = auth.uid())
  );

create policy "poll_options_delete_own"
  on public.poll_options for delete
  to authenticated
  using (
    exists (select 1 from public.posts p where p.id = poll_options.post_id and p.author_id = auth.uid())
  );

-- Deviation from the spec's "votes/reactions/bookmarks/drafts are fully
-- private" rule: poll_options has no cached vote-count column, so poll
-- results have nowhere else to come from. poll_votes SELECT is therefore
-- scoped to "can you see the underlying post" (like poll_options) rather
-- than "is this your own row" - individual ballots are visible to anyone
-- who can see the poll, which is how most single-choice poll UIs surface
-- live results.
create policy "poll_votes_select_scoped"
  on public.poll_votes for select
  to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = poll_votes.post_id
        and (p.status = 'published' or p.author_id = auth.uid() or public.is_moderator_of(p.community_id, auth.uid()))
    )
  );

create policy "poll_votes_insert_own"
  on public.poll_votes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "poll_votes_update_own"
  on public.poll_votes for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "poll_votes_delete_own"
  on public.poll_votes for delete
  to authenticated
  using (user_id = auth.uid());

-- ---- drafts (fully private) ---------------------------------------------------
alter table public.drafts enable row level security;

create policy "drafts_owner_all"
  on public.drafts for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---- tags / post_tags ----------------------------------------------------------
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;

create policy "tags_select_public"
  on public.tags for select
  to public
  using (true);

create policy "tags_insert_authenticated"
  on public.tags for insert
  to authenticated
  with check (true);

create policy "tags_update_admin"
  on public.tags for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "tags_delete_admin"
  on public.tags for delete
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "post_tags_select_scoped"
  on public.post_tags for select
  to public
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_tags.post_id
        and (p.status = 'published' or p.author_id = auth.uid() or public.is_moderator_of(p.community_id, auth.uid()))
    )
  );

create policy "post_tags_insert_own"
  on public.post_tags for insert
  to authenticated
  with check (
    exists (select 1 from public.posts p where p.id = post_tags.post_id and p.author_id = auth.uid())
  );

create policy "post_tags_delete_own_or_moderator"
  on public.post_tags for delete
  to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_tags.post_id
        and (p.author_id = auth.uid() or public.is_moderator_of(p.community_id, auth.uid()))
    )
  );

-- ---- comments -------------------------------------------------------------------
alter table public.comments enable row level security;

create policy "comments_select_scoped"
  on public.comments for select
  to public
  using (
    status <> 'deleted'
    or author_id = auth.uid()
    or exists (select 1 from public.posts p where p.id = comments.post_id and public.is_moderator_of(p.community_id, auth.uid()))
  );

create policy "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "comments_update_own_or_moderator"
  on public.comments for update
  to authenticated
  using (
    author_id = auth.uid()
    or exists (select 1 from public.posts p where p.id = comments.post_id and public.is_moderator_of(p.community_id, auth.uid()))
  )
  with check (
    author_id = auth.uid()
    or exists (select 1 from public.posts p where p.id = comments.post_id and public.is_moderator_of(p.community_id, auth.uid()))
  );

-- No DELETE policy: user-facing delete is UPDATE status='deleted', so
-- replies survive.

-- ---- votes / reactions / bookmarks (fully private) -------------------------------
alter table public.votes enable row level security;
alter table public.reactions enable row level security;
alter table public.bookmarks enable row level security;

create policy "votes_owner_all"
  on public.votes for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reactions_owner_all"
  on public.reactions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "bookmarks_owner_all"
  on public.bookmarks for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================================
-- Messaging
-- ============================================================================

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy "conversations_select_participant"
  on public.conversations for select
  to authenticated
  using (public.is_conversation_participant(id, auth.uid()));

-- Any authenticated user may start a conversation; the app must then also
-- insert the relevant conversation_participants rows (see below). In
-- practice, prefer calling public.create_conversation(...) (defined in
-- 20260101000005_messaging.sql) instead of a raw client-side INSERT here:
-- this policy's WITH CHECK is satisfied, but a plain
-- `INSERT ... RETURNING id` will still fail RLS, because RETURNING on
-- INSERT is also gated by the table's SELECT policy below, which a
-- brand-new conversation with zero participants can never satisfy.
-- create_conversation() sidesteps that chicken-and-egg problem.
create policy "conversations_insert_authenticated"
  on public.conversations for insert
  to authenticated
  with check (true);

create policy "conversation_participants_select_participant"
  on public.conversation_participants for select
  to authenticated
  using (public.is_conversation_participant(conversation_id, auth.uid()));

-- A user can add themselves (join), or an existing participant can add
-- others (invite into a group chat).
create policy "conversation_participants_insert_self_or_participant"
  on public.conversation_participants for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_conversation_participant(conversation_id, auth.uid()));

create policy "conversation_participants_update_own"
  on public.conversation_participants for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "conversation_participants_delete_own"
  on public.conversation_participants for delete
  to authenticated
  using (user_id = auth.uid());

create policy "messages_select_participant"
  on public.messages for select
  to authenticated
  using (public.is_conversation_participant(conversation_id, auth.uid()));

create policy "messages_insert_participant"
  on public.messages for insert
  to authenticated
  with check (sender_id = auth.uid() and public.is_conversation_participant(conversation_id, auth.uid()));

create policy "messages_update_own"
  on public.messages for update
  to authenticated
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- No DELETE policy: message history is treated as immutable once sent
-- (messages has no status/soft-delete column).

-- ============================================================================
-- Notifications (fully private to the recipient)
-- ============================================================================

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

-- A notification's recipient (user_id) is virtually never the inserting
-- client (Alice replying to Bob's post creates a notification *for* Bob).
-- We instead require the inserting client to name themselves as the actor,
-- and reserve actor_id IS NULL (system/announcement notifications) for
-- admins, since there's no separate backend to do this out-of-band.
create policy "notifications_insert_actor"
  on public.notifications for insert
  to authenticated
  with check (actor_id = auth.uid() or (actor_id is null and public.is_admin(auth.uid())));

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_delete_own"
  on public.notifications for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- Reputation
-- ============================================================================

alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.reputation_events enable row level security;

create policy "badges_select_public"
  on public.badges for select
  to public
  using (true);

create policy "badges_admin_write"
  on public.badges for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Awarded badges are visible on public profiles; awarding itself is an
-- admin/system action (no client-side self-awarding).
create policy "user_badges_select_public"
  on public.user_badges for select
  to public
  using (true);

create policy "user_badges_admin_write"
  on public.user_badges for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "achievements_select_public"
  on public.achievements for select
  to public
  using (true);

create policy "achievements_admin_write"
  on public.achievements for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Progress tracking has no automated trigger in this schema, so, like
-- badges, writes are restricted to admin/system rather than being
-- client-editable (a user could otherwise fabricate their own progress).
create policy "user_achievements_select_public"
  on public.user_achievements for select
  to public
  using (true);

create policy "user_achievements_admin_write"
  on public.user_achievements for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- reputation_events is an append-only ledger. Only admins can insert
-- (mirroring moderation_actions/audit_logs - there's no custom backend to
-- do this out-of-band), and a user can read their own history.
create policy "reputation_events_select_own_or_admin"
  on public.reputation_events for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "reputation_events_insert_admin"
  on public.reputation_events for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

-- No UPDATE/DELETE: the ledger is immutable.

-- ============================================================================
-- Trust & safety
-- ============================================================================

alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.activity_logs enable row level security;

create policy "reports_insert_authenticated"
  on public.reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- Visible to: the reporter (their own submission), site admins, and
-- moderators of the community that owns the reported post/comment. 'user'/
-- 'message' targets have no natural community scope, so those are visible
-- to admins only (beyond the reporter themselves).
create policy "reports_select_scoped"
  on public.reports for select
  to authenticated
  using (
    reporter_id = auth.uid()
    or public.is_admin(auth.uid())
    or (
      target_type = 'post'
      and exists (select 1 from public.posts p where p.id = reports.target_id and public.is_moderator_of(p.community_id, auth.uid()))
    )
    or (
      target_type = 'comment'
      and exists (
        select 1 from public.comments c
        join public.posts p on p.id = c.post_id
        where c.id = reports.target_id and public.is_moderator_of(p.community_id, auth.uid())
      )
    )
  );

create policy "reports_update_scoped"
  on public.reports for update
  to authenticated
  using (
    public.is_admin(auth.uid())
    or (
      target_type = 'post'
      and exists (select 1 from public.posts p where p.id = reports.target_id and public.is_moderator_of(p.community_id, auth.uid()))
    )
    or (
      target_type = 'comment'
      and exists (
        select 1 from public.comments c
        join public.posts p on p.id = c.post_id
        where c.id = reports.target_id and public.is_moderator_of(p.community_id, auth.uid())
      )
    )
  )
  with check (
    public.is_admin(auth.uid())
    or (
      target_type = 'post'
      and exists (select 1 from public.posts p where p.id = reports.target_id and public.is_moderator_of(p.community_id, auth.uid()))
    )
    or (
      target_type = 'comment'
      and exists (
        select 1 from public.comments c
        join public.posts p on p.id = c.post_id
        where c.id = reports.target_id and public.is_moderator_of(p.community_id, auth.uid())
      )
    )
  );

-- No DELETE: reports are retained for the trust & safety record.

create policy "moderation_actions_select_scoped"
  on public.moderation_actions for select
  to authenticated
  using (public.is_admin(auth.uid()) or (community_id is not null and public.is_moderator_of(community_id, auth.uid())));

create policy "moderation_actions_insert_scoped"
  on public.moderation_actions for insert
  to authenticated
  with check (
    moderator_id = auth.uid()
    and (public.is_admin(auth.uid()) or (community_id is not null and public.is_moderator_of(community_id, auth.uid())))
  );

-- No UPDATE/DELETE: the moderation log is immutable.

create policy "audit_logs_select_admin"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "audit_logs_insert_admin"
  on public.audit_logs for insert
  to authenticated
  with check (public.is_admin(auth.uid()) and actor_id = auth.uid());

-- No UPDATE/DELETE: the audit log is immutable.

create policy "activity_logs_select_own"
  on public.activity_logs for select
  to authenticated
  using (user_id = auth.uid());

create policy "activity_logs_insert_own"
  on public.activity_logs for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "activity_logs_delete_own"
  on public.activity_logs for delete
  to authenticated
  using (user_id = auth.uid());

-- No UPDATE: activity entries are append-only (owner can only add/clear).
