-- ============================================================================
-- CareCircle: Follower/following counts
-- ----------------------------------------------------------------------------
-- follows.select is authenticated-only (20260101000011_security_hardening.sql
-- narrowed it from public, matching community_members), so a profile page
-- can't just query the follows table directly to show counts - anonymous
-- visitors would silently see "0 followers" for everyone. Same fix as
-- communities.member_count in 20260101000002_communities.sql: cache the
-- counts on profiles, trigger-maintained, visible to anyone regardless of
-- follows' own RLS.
-- ============================================================================

set search_path = public, extensions;

alter table public.profiles
  add column follower_count integer not null default 0,
  add column following_count integer not null default 0;

create or replace function public.update_follow_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    update public.profiles set follower_count = follower_count + 1 where id = new.followee_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    update public.profiles set follower_count = greatest(follower_count - 1, 0) where id = old.followee_id;
    return old;
  end if;
  return null;
end;
$$;

comment on function public.update_follow_counts() is
  'Keeps profiles.follower_count/following_count in sync with follows rows.';

create trigger follows_maintain_counts
  after insert or delete on public.follows
  for each row execute function public.update_follow_counts();
