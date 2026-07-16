-- ============================================================================
-- CareCircle: RLS helper functions
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER, STABLE helper functions used throughout the RLS policies
-- defined in 20260101000010_rls_policies.sql. Defined here (right after
-- communities) rather than alongside the policies themselves because:
--   1. is_moderator_of()/is_community_member() need community_members, which
--      exists as of the previous migration.
--   2. The `prevent_unauthorized_approval` trigger on communities.is_approved
--      needs is_admin() and is attached to the communities table here, right
--      where that table lives, rather than being deferred to the RLS file.
--
-- These are SECURITY DEFINER so they can read across tables (user_roles,
-- community_members) regardless of the calling user's own RLS visibility,
-- which avoids recursive-RLS problems when policies call them. They are
-- STABLE (not VOLATILE) so the planner can use them efficiently within a
-- single statement, and each pins search_path=public to avoid search_path
-- hijacking.
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- is_admin(): true if the given user (default: current JWT user) holds the
-- site-wide 'admin' role via user_roles/roles.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = uid
      and r.name = 'admin'
  );
$$;

comment on function public.is_admin(uuid) is 'True if uid holds the site-wide admin role.';

-- ----------------------------------------------------------------------------
-- is_moderator_of(): true if the given user moderates (or admins) a specific
-- community, OR is a site admin.
-- ----------------------------------------------------------------------------
create or replace function public.is_moderator_of(cid uuid, uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.community_members cm
      where cm.community_id = cid
        and cm.user_id = uid
        and cm.role in ('moderator', 'admin')
    )
    or public.is_admin(uid);
$$;

comment on function public.is_moderator_of(uuid, uuid) is 'True if uid moderates/admins community cid, or is a site admin.';

-- ----------------------------------------------------------------------------
-- is_community_member(): true if the given user has joined a specific
-- community (any role).
-- ----------------------------------------------------------------------------
create or replace function public.is_community_member(cid uuid, uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_members cm
    where cm.community_id = cid
      and cm.user_id = uid
  );
$$;

comment on function public.is_community_member(uuid, uuid) is 'True if uid is a member of community cid.';

-- ----------------------------------------------------------------------------
-- prevent_unauthorized_approval(): communities.is_approved can only be
-- flipped by a site admin. RLS UPDATE policies can't cleanly diff OLD vs NEW
-- on a single column, so we enforce it with a trigger instead of fighting
-- RLS for column-level granularity. Community moderators can still UPDATE
-- their community's other fields (name, description, banner, rules, etc.)
-- via the regular RLS UPDATE policy.
--
-- auth.uid() is null for service_role/direct-SQL contexts (migrations,
-- seed scripts, trusted backend jobs) which are already fully trusted and
-- bypass RLS entirely, so we let those through unconditionally.
-- ----------------------------------------------------------------------------
create or replace function public.prevent_unauthorized_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.is_approved is distinct from old.is_approved and not public.is_admin(auth.uid()) then
    raise exception 'Only site admins may change community approval status';
  end if;

  return new;
end;
$$;

comment on function public.prevent_unauthorized_approval() is
  'BEFORE UPDATE guard on communities: blocks non-admins from changing is_approved.';

create trigger communities_prevent_unauthorized_approval
  before update on public.communities
  for each row execute function public.prevent_unauthorized_approval();

-- ----------------------------------------------------------------------------
-- prevent_unauthorized_profile_changes(): same column-diff problem as
-- communities.is_approved, applied to profiles. The RLS UPDATE policy
-- (owner-only) can't stop an owner from also overwriting reputation_score
-- (which must only move via reputation_events) or self-verifying their own
-- diagnosis. pg_trigger_depth() > 1 lets apply_reputation_event()'s nested
-- UPDATE through; auth.uid() is null lets service_role/direct-SQL through.
-- ----------------------------------------------------------------------------
create or replace function public.prevent_unauthorized_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 or auth.uid() is null then
    return new;
  end if;

  if new.reputation_score is distinct from old.reputation_score then
    raise exception 'reputation_score is maintained automatically via reputation_events and cannot be set directly';
  end if;

  if new.verified_diagnosis is distinct from old.verified_diagnosis and not public.is_admin(auth.uid()) then
    raise exception 'Only an admin can change verified_diagnosis';
  end if;

  return new;
end;
$$;

comment on function public.prevent_unauthorized_profile_changes() is
  'BEFORE UPDATE guard on profiles: blocks direct client writes to reputation_score and restricts verified_diagnosis to admins.';

create trigger profiles_prevent_unauthorized_changes
  before update on public.profiles
  for each row execute function public.prevent_unauthorized_profile_changes();
