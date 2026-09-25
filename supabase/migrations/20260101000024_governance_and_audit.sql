-- ============================================================================
-- CareCircle: Moderator governance rules and audit logging
-- ----------------------------------------------------------------------------
-- 1. Governance. community_members_update_moderator and
--    community_members_delete_self_or_moderator let ANY moderator of a
--    community change or remove ANY member row, including other moderators
--    and the 'admin' community role. That invites "mod wars" and silent
--    takeovers. Row policies can't compare OLD and NEW, so these rules are
--    enforced with triggers:
--      * any moderator may promote a member to moderator;
--      * demoting or removing a moderator/admin requires being the
--        community's creator, a community admin, or a site admin - except
--        that anyone may step down or leave themselves;
--      * only site admins may grant or remove the 'admin' community role.
--
-- 2. Audit trail. audit_logs has existed since the trust & safety migration
--    but nothing wrote to it. These triggers now record site role grants and
--    revocations, community approvals, and community role changes.
--
-- 3. Lockout guard. The last remaining site admin can't be revoked.
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- can_manage_moderators(): creator, community admin, or site admin.
-- ----------------------------------------------------------------------------
create or replace function public.can_manage_moderators(cid uuid, uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin(uid)
    or exists (select 1 from public.communities c where c.id = cid and c.created_by = uid)
    or exists (
      select 1 from public.community_members cm
      where cm.community_id = cid and cm.user_id = uid and cm.role = 'admin'
    );
$$;

comment on function public.can_manage_moderators(uuid, uuid) is
  'True if uid may demote/remove moderators of community cid: its creator, a community admin, or a site admin.';

-- ----------------------------------------------------------------------------
-- Governance guard for community_members role changes and removals.
-- Skipped when there is no end user (auth.uid() is null): seeds, the
-- community-creation bootstrap trigger and the ban trigger run that way.
-- ----------------------------------------------------------------------------
create or replace function public.guard_community_member_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'UPDATE' then
    if new.user_id <> old.user_id or new.community_id <> old.community_id then
      raise exception 'membership rows cannot be moved' using errcode = '42501';
    end if;

    if new.role is distinct from old.role then
      if (new.role = 'admin' or old.role = 'admin') and not public.is_admin(v_actor) then
        raise exception 'only site admins can change the community admin role'
          using errcode = '42501';
      end if;

      if old.role in ('moderator', 'admin')
        and new.role = 'member'
        and old.user_id <> v_actor
        and not public.can_manage_moderators(old.community_id, v_actor) then
        raise exception 'only the community creator or an admin can demote a moderator'
          using errcode = '42501';
      end if;
    end if;

    return new;
  end if;

  -- DELETE: removing someone else who is a moderator/admin.
  if old.role in ('moderator', 'admin')
    and old.user_id <> v_actor
    and not public.can_manage_moderators(old.community_id, v_actor) then
    raise exception 'only the community creator or an admin can remove a moderator'
      using errcode = '42501';
  end if;

  return old;
end;
$$;

create trigger community_members_governance
  before update or delete on public.community_members
  for each row execute function public.guard_community_member_changes();

-- ----------------------------------------------------------------------------
-- Audit: community role changes.
-- ----------------------------------------------------------------------------
create or replace function public.audit_community_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (
      auth.uid(),
      'community_role_changed',
      'user',
      new.user_id,
      jsonb_build_object('community_id', new.community_id, 'from', old.role, 'to', new.role)
    );
  end if;
  return new;
end;
$$;

create trigger community_members_audit_role
  after update of role on public.community_members
  for each row execute function public.audit_community_role_change();

-- ----------------------------------------------------------------------------
-- Audit: community approval decisions.
-- ----------------------------------------------------------------------------
create or replace function public.audit_community_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_approved is distinct from old.is_approved then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (
      auth.uid(),
      case when new.is_approved then 'community_approved' else 'community_unapproved' end,
      'community',
      new.id,
      jsonb_build_object('slug', new.slug, 'name', new.name)
    );
  end if;
  return new;
end;
$$;

create trigger communities_audit_approval
  after update of is_approved on public.communities
  for each row execute function public.audit_community_approval();

-- ----------------------------------------------------------------------------
-- Site roles: lockout guard + audit.
-- ----------------------------------------------------------------------------
create or replace function public.guard_last_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_role uuid;
begin
  select id into v_admin_role from public.roles where name = 'admin';
  if old.role_id = v_admin_role
    and (select count(*) from public.user_roles where role_id = v_admin_role) <= 1 then
    raise exception 'cannot remove the last site admin' using errcode = '42501';
  end if;
  return old;
end;
$$;

create trigger user_roles_guard_last_admin
  before delete on public.user_roles
  for each row execute function public.guard_last_admin();

create or replace function public.audit_site_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.user_roles;
  v_role_name text;
begin
  v_row := coalesce(new, old);
  select name into v_role_name from public.roles where id = v_row.role_id;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    case when tg_op = 'INSERT' then 'site_role_granted' else 'site_role_revoked' end,
    'user',
    v_row.user_id,
    jsonb_build_object('role', v_role_name)
  );
  return v_row;
end;
$$;

create trigger user_roles_audit
  after insert or delete on public.user_roles
  for each row execute function public.audit_site_role_change();

-- These are trigger-only; keep them out of the RPC surface.
revoke execute on function public.guard_community_member_changes() from public, anon, authenticated;
revoke execute on function public.audit_community_role_change() from public, anon, authenticated;
revoke execute on function public.audit_community_approval() from public, anon, authenticated;
revoke execute on function public.guard_last_admin() from public, anon, authenticated;
revoke execute on function public.audit_site_role_change() from public, anon, authenticated;
