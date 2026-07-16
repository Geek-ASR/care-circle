-- ============================================================================
-- CareCircle: Communities
-- ----------------------------------------------------------------------------
-- Condition-focused communities (subreddit/server equivalents), their
-- membership/moderator roster, rules, curated resource links, and wiki
-- pages. Also maintains communities.member_count via trigger. The
-- "prevent unauthorized approval" trigger lives in
-- 20260101000003_rls_helper_functions.sql because it depends on is_admin().
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- communities
-- ----------------------------------------------------------------------------
create table public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  banner_url text,
  logo_url text,
  condition_id uuid references public.conditions (id) on delete set null,
  member_count integer not null default 0,
  is_approved boolean not null default false,
  is_nsfw boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint communities_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

comment on table public.communities is 'Condition-focused communities. New communities start unapproved (is_approved=false) pending admin review.';

create index communities_condition_id_idx on public.communities (condition_id);
create index communities_created_by_idx on public.communities (created_by);
create index communities_approved_idx on public.communities (is_approved) where is_approved = true;
create index communities_name_trgm_idx on public.communities using gin (name gin_trgm_ops);

create trigger set_updated_at
  before update on public.communities
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- community_members: membership roster AND per-community moderator list
-- (role = 'moderator' / 'admin').
-- ----------------------------------------------------------------------------
create table public.community_members (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator', 'admin')),
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

comment on table public.community_members is 'Membership roster. role=moderator/admin makes a member a moderator of that community.';

create index community_members_user_id_idx on public.community_members (user_id);
create index community_members_moderators_idx on public.community_members (community_id) where role in ('moderator', 'admin');

-- ----------------------------------------------------------------------------
-- community_rules
-- ----------------------------------------------------------------------------
create table public.community_rules (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index community_rules_community_id_idx on public.community_rules (community_id);

-- ----------------------------------------------------------------------------
-- community_resources: curated links (crisis lines, external resources, etc.)
-- ----------------------------------------------------------------------------
create table public.community_resources (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  title text not null,
  url text,
  description text,
  category text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index community_resources_community_id_idx on public.community_resources (community_id);

-- ----------------------------------------------------------------------------
-- wiki_pages
-- ----------------------------------------------------------------------------
create table public.wiki_pages (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  slug text not null,
  title text not null,
  content text,
  created_by uuid references public.profiles (id) on delete set null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (community_id, slug)
);

create index wiki_pages_created_by_idx on public.wiki_pages (created_by);

create trigger set_updated_at
  before update on public.wiki_pages
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- communities.member_count maintenance
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER: a member joining/leaving a community only has RLS
-- permission to write their own community_members row, not to UPDATE the
-- communities row's member_count. This trigger needs to bypass that RLS gap
-- to perform the derived update; it only ever touches member_count.
create or replace function public.update_community_member_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.communities set member_count = member_count + 1 where id = new.community_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.communities set member_count = greatest(member_count - 1, 0) where id = old.community_id;
    return old;
  end if;
  return null;
end;
$$;

comment on function public.update_community_member_count() is
  'Keeps communities.member_count in sync with community_members rows.';

create trigger community_members_maintain_count
  after insert or delete on public.community_members
  for each row execute function public.update_community_member_count();
