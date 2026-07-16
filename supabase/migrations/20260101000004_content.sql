-- ============================================================================
-- CareCircle: Content (posts, comments, votes, reactions, polls, tags, etc.)
-- ----------------------------------------------------------------------------
-- The core content graph: posts and their media/edit-history/polls, tags,
-- threaded comments (materialized via ltree), voting, emoji reactions,
-- bookmarks, and autosave drafts.
--
-- Soft-delete convention: user-facing "delete" of a post/comment is an
-- UPDATE of status to 'deleted', never a SQL DELETE. Hard DELETE only
-- happens via cascade (e.g. community deletion) or admin/GDPR erasure.
-- author_id/sender_id-style FKs use ON DELETE SET NULL (not CASCADE) so
-- content survives account deletion and can render as "[deleted user]".
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- posts
-- ----------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  post_type text not null check (post_type in (
    'text', 'image', 'link', 'poll', 'question', 'experience', 'success_story',
    'treatment_review', 'medication_review', 'doctor_review', 'hospital_review',
    'research_discussion', 'lifestyle_tip'
  )),
  title text not null,
  body text,
  url text,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  is_nsfw boolean not null default false,
  is_spoiler boolean not null default false,
  score integer not null default 0,
  comment_count integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'removed', 'deleted')),
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_title_not_blank check (char_length(btrim(title)) > 0)
);

comment on table public.posts is 'User-generated posts. author_id is nullable (ON DELETE SET NULL) so posts survive account deletion, rendered as "[deleted user]". User-facing delete is status=''deleted'', never a hard DELETE.';

create index posts_community_id_created_at_idx on public.posts (community_id, created_at desc) where status = 'published';
create index posts_community_id_score_idx on public.posts (community_id, score desc) where status = 'published';
create index posts_author_id_idx on public.posts (author_id);
create index posts_title_trgm_idx on public.posts using gin (title gin_trgm_ops);
create index posts_pinned_idx on public.posts (community_id) where is_pinned = true and status = 'published';

create trigger set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- post_media
-- ----------------------------------------------------------------------------
create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  storage_path text not null,
  media_type text check (media_type in ('image', 'video', 'gif')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index post_media_post_id_idx on public.post_media (post_id);

-- ----------------------------------------------------------------------------
-- post_versions: insert-only edit-history snapshots. The application inserts
-- a row here immediately before applying an edit to posts.title/body.
-- ----------------------------------------------------------------------------
create table public.post_versions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  body text,
  title text,
  edited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index post_versions_post_id_idx on public.post_versions (post_id);
create index post_versions_edited_by_idx on public.post_versions (edited_by);

-- ----------------------------------------------------------------------------
-- poll_options / poll_votes
-- ----------------------------------------------------------------------------
create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  option_text text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index poll_options_post_id_idx on public.poll_options (post_id);

create table public.poll_votes (
  poll_option_id uuid not null references public.poll_options (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Denormalized from poll_options.post_id (auto-populated by trigger below)
  -- so we can enforce "one vote per user per poll" with a simple UNIQUE
  -- constraint, since polls are single-choice.
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_option_id, user_id),
  unique (post_id, user_id)
);

create index poll_votes_user_id_idx on public.poll_votes (user_id);

create or replace function public.poll_votes_set_post_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select post_id into new.post_id
  from public.poll_options
  where id = new.poll_option_id;

  if new.post_id is null then
    raise exception 'poll_option % does not exist', new.poll_option_id;
  end if;

  return new;
end;
$$;

comment on function public.poll_votes_set_post_id() is
  'Derives poll_votes.post_id from poll_option_id so the one-vote-per-poll UNIQUE(post_id, user_id) constraint stays correct without trusting client input.';

create trigger poll_votes_before_insert_set_post_id
  before insert on public.poll_votes
  for each row execute function public.poll_votes_set_post_id();

-- ----------------------------------------------------------------------------
-- drafts: autosave drafts, private to the owning user.
-- ----------------------------------------------------------------------------
create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  community_id uuid references public.communities (id) on delete set null,
  post_type text,
  title text,
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index drafts_user_id_idx on public.drafts (user_id);
create index drafts_community_id_idx on public.drafts (community_id);

create trigger set_updated_at
  before update on public.drafts
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- tags / post_tags
-- ----------------------------------------------------------------------------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create index post_tags_tag_id_idx on public.post_tags (tag_id);

-- ----------------------------------------------------------------------------
-- comments: threaded via ltree materialized path.
-- ----------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  parent_comment_id uuid references public.comments (id) on delete cascade,
  body text,
  path ltree,
  is_edited boolean not null default false,
  score integer not null default 0,
  status text not null default 'published' check (status in ('published', 'removed', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.comments is 'Threaded comments. path is a materialized ltree path (label = comment id with hyphens replaced by underscores) maintained by comments_set_path(). Same soft-delete rule as posts: user delete = status=''deleted'', replies survive.';

create index comments_post_id_created_at_idx on public.comments (post_id, created_at);
create index comments_path_gist_idx on public.comments using gist (path);
create index comments_author_id_idx on public.comments (author_id) where status = 'published';
create index comments_parent_comment_id_idx on public.comments (parent_comment_id);

create trigger set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- comments_set_path(): computes the ltree materialized path on insert.
-- Root comments get a single-label path (their own id); replies get their
-- parent's path with their own id appended. ltree labels may not contain
-- hyphens, so uuid hyphens are replaced with underscores.
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER so the parent-lookup isn't subject to the replying
-- user's own RLS visibility of the parent comment (structural integrity
-- shouldn't depend on read access). search_path includes `extensions`
-- (unlike the other SECURITY DEFINER functions in this file) because this
-- function's DECLARE section and body both use the ltree type/operators,
-- which live in that schema - a function's own SET search_path clause is
-- what Postgres uses to resolve those at CREATE-time, not the session's.
create or replace function public.comments_set_path()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  parent_path ltree;
  parent_post_id uuid;
  label text;
begin
  label := replace(new.id::text, '-', '_');

  if new.parent_comment_id is null then
    new.path := label::ltree;
  else
    select path, post_id into parent_path, parent_post_id
    from public.comments
    where id = new.parent_comment_id;

    if parent_path is null then
      raise exception 'Parent comment % does not exist', new.parent_comment_id;
    end if;

    if parent_post_id <> new.post_id then
      raise exception 'Parent comment % belongs to a different post', new.parent_comment_id;
    end if;

    new.path := parent_path || label::ltree;
  end if;

  return new;
end;
$$;

comment on function public.comments_set_path() is
  'BEFORE INSERT trigger on comments: computes the ltree materialized path from the parent chain.';

create trigger comments_before_insert_set_path
  before insert on public.comments
  for each row execute function public.comments_set_path();

-- ----------------------------------------------------------------------------
-- votes: one vote per user per post OR comment. Postgres unique constraints
-- ignore NULLs, so UNIQUE(user_id, post_id) and UNIQUE(user_id, comment_id)
-- correctly allow exactly one vote per user per target of either kind.
-- ----------------------------------------------------------------------------
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  constraint votes_single_target check (num_nonnulls(post_id, comment_id) = 1),
  unique (user_id, post_id),
  unique (user_id, comment_id)
);

create index votes_post_id_idx on public.votes (post_id) where post_id is not null;
create index votes_comment_id_idx on public.votes (comment_id) where comment_id is not null;

-- ----------------------------------------------------------------------------
-- reactions: emoji reactions, many per user per target (one per emoji).
-- ----------------------------------------------------------------------------
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  constraint reactions_single_target check (num_nonnulls(post_id, comment_id) = 1),
  unique (user_id, post_id, emoji),
  unique (user_id, comment_id, emoji)
);

create index reactions_post_id_idx on public.reactions (post_id) where post_id is not null;
create index reactions_comment_id_idx on public.reactions (comment_id) where comment_id is not null;

-- ----------------------------------------------------------------------------
-- bookmarks
-- ----------------------------------------------------------------------------
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create index bookmarks_post_id_idx on public.bookmarks (post_id);

-- ----------------------------------------------------------------------------
-- votes maintenance: recompute posts.score / comments.score from votes.
-- Recomputes via SUM scoped to the affected target row only (never a full
-- table scan). On UPDATE we recompute both the OLD and NEW target in case
-- post_id/comment_id changed; in the common case (only `value` flips) this
-- just recomputes the same target twice, which is harmless.
--
-- SECURITY DEFINER: the voting user has RLS permission to write their own
-- votes row but not necessarily to UPDATE the target post/comment directly
-- (e.g. voting on someone else's post) - this bypasses that gap for the
-- sole purpose of recomputing the cached score column. The posts/comments
-- BEFORE UPDATE guard triggers (see prevent_unauthorized_post_changes /
-- prevent_unauthorized_comment_changes) let this through via a
-- pg_trigger_depth() check since it always runs nested inside this trigger.
-- ----------------------------------------------------------------------------
create or replace function public.update_vote_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    if old.post_id is not null then
      update public.posts
      set score = coalesce((select sum(value) from public.votes where post_id = old.post_id), 0)
      where id = old.post_id;
    end if;
    if old.comment_id is not null then
      update public.comments
      set score = coalesce((select sum(value) from public.votes where comment_id = old.comment_id), 0)
      where id = old.comment_id;
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    if new.post_id is not null then
      update public.posts
      set score = coalesce((select sum(value) from public.votes where post_id = new.post_id), 0)
      where id = new.post_id;
    end if;
    if new.comment_id is not null then
      update public.comments
      set score = coalesce((select sum(value) from public.votes where comment_id = new.comment_id), 0)
      where id = new.comment_id;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger votes_maintain_score
  after insert or update or delete on public.votes
  for each row execute function public.update_vote_score();

-- ----------------------------------------------------------------------------
-- comment_count maintenance: posts.comment_count = count of non-deleted
-- comments (removed comments still count - they render as "[removed]";
-- only user-deleted comments are excluded).
--
-- SECURITY DEFINER for the same reason as update_vote_score(): the
-- commenting user has RLS permission to write their own comment but not
-- necessarily to UPDATE the parent post directly.
-- ----------------------------------------------------------------------------
create or replace function public.update_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_post_id uuid := coalesce(new.post_id, old.post_id);
begin
  update public.posts
  set comment_count = (
    select count(*) from public.comments
    where post_id = target_post_id and status <> 'deleted'
  )
  where id = target_post_id;

  return coalesce(new, old);
end;
$$;

create trigger comments_maintain_post_comment_count
  after insert or update on public.comments
  for each row execute function public.update_post_comment_count();

-- ----------------------------------------------------------------------------
-- Integrity guards: posts/comments RLS (defined in
-- 20260101000010_rls_policies.sql) lets an owner UPDATE their own row, but
-- RLS's WITH CHECK can't restrict *which columns* changed. score and
-- comment_count must only ever be set by the maintenance triggers above
-- (never directly by a client); is_pinned / removing-or-restoring a post or
-- comment must only be done by a moderator/admin, not the author; and
-- community_id/post_id/parent_comment_id are immutable after creation so an
-- owner's otherwise-legitimate UPDATE can't relocate content or corrupt the
-- comments.path ltree structure.
--
-- pg_trigger_depth() > 1 identifies an UPDATE issued *from inside another
-- trigger* (i.e. the maintenance triggers above, which always nest one
-- level deeper than the client's original statement) and lets it through
-- unconditionally; a direct top-level client UPDATE is always depth = 1 and
-- gets the guard enforced. auth.uid() is null for service_role/direct-SQL
-- contexts, which are already fully trusted.
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

  -- community_id is immutable outside of admin action: an owner's UPDATE
  -- WITH CHECK still passes if they only change community_id (author_id is
  -- unchanged), which would otherwise let them relocate a post into a
  -- community they don't moderate.
  if new.community_id is distinct from old.community_id and not public.is_admin(auth.uid()) then
    raise exception 'Only an admin can move a post to a different community';
  end if;

  if not public.is_moderator_of(old.community_id, auth.uid()) then
    if new.is_pinned is distinct from old.is_pinned then
      raise exception 'Only moderators can pin/unpin a post';
    end if;
    if new.status is distinct from old.status and (new.status = 'removed' or old.status = 'removed') then
      raise exception 'Only moderators can remove or restore a post';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.prevent_unauthorized_post_changes() is
  'BEFORE UPDATE guard on posts: blocks direct client writes to score/comment_count and restricts pin/remove-restore to moderators.';

create trigger posts_prevent_unauthorized_changes
  before update on public.posts
  for each row execute function public.prevent_unauthorized_post_changes();

create or replace function public.prevent_unauthorized_comment_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_community_id uuid;
begin
  if pg_trigger_depth() > 1 or auth.uid() is null then
    return new;
  end if;

  if new.score is distinct from old.score then
    raise exception 'comments.score is maintained automatically via votes and cannot be set directly';
  end if;

  -- post_id/parent_comment_id are immutable after creation for everyone,
  -- admins included: comments_set_path() only computes `path` on INSERT, so
  -- changing which post/parent a comment belongs to after the fact would
  -- leave `path` pointing at a stale/incorrect location in the tree.
  if new.post_id is distinct from old.post_id then
    raise exception 'comments.post_id is immutable after creation';
  end if;

  if new.parent_comment_id is distinct from old.parent_comment_id then
    raise exception 'comments.parent_comment_id is immutable after creation';
  end if;

  if new.status is distinct from old.status and (new.status = 'removed' or old.status = 'removed') then
    select community_id into post_community_id from public.posts where id = old.post_id;
    if not public.is_moderator_of(post_community_id, auth.uid()) then
      raise exception 'Only moderators can remove or restore a comment';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.prevent_unauthorized_comment_changes() is
  'BEFORE UPDATE guard on comments: blocks direct client writes to score and restricts remove/restore to moderators.';

create trigger comments_prevent_unauthorized_changes
  before update on public.comments
  for each row execute function public.prevent_unauthorized_comment_changes();
