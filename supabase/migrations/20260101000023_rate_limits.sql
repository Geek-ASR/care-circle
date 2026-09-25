-- ============================================================================
-- CareCircle: Per-user rate limits on user-generated content
-- ----------------------------------------------------------------------------
-- Nothing previously stopped a single account (or a script holding one
-- session) from flooding posts, comments, DMs, reports or community
-- requests. This adds a small, generic BEFORE INSERT trigger that counts the
-- caller's own recent rows and rejects the insert past a threshold.
--
-- Limits are deliberately generous for real people and only bite on
-- automated or abusive bursts:
--
--   posts            5 per 10 minutes
--   comments        20 per 5 minutes
--   messages        30 per minute
--   reports         10 per hour
--   communities      3 per day   (creation requests awaiting approval)
--
-- The error is raised with SQLSTATE 'P0001' and a message starting with
-- 'rate_limit_exceeded' so the app can show a friendly "slow down" message.
--
-- Only end-user requests are limited: inserts with no auth.uid() (seed
-- scripts, SECURITY DEFINER jobs running as the service role) and site
-- admins are exempt.
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- enforce_rate_limit(owner_column, max_rows, window)
--   TG_ARGV[0] - column on NEW holding the acting user's id
--   TG_ARGV[1] - max rows allowed inside the window (inclusive of this one)
--   TG_ARGV[2] - window as an interval literal, e.g. '10 minutes'
-- SECURITY DEFINER so the count sees all of the caller's rows even where
-- their own RLS visibility is narrower (e.g. removed posts).
-- ----------------------------------------------------------------------------
create or replace function public.enforce_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_column text := tg_argv[0];
  v_max integer := tg_argv[1]::integer;
  v_window interval := tg_argv[2]::interval;
  v_owner uuid;
  v_recent integer;
begin
  if auth.uid() is null or public.is_admin(auth.uid()) then
    return new;
  end if;

  execute format('select ($1).%I', v_owner_column) into v_owner using new;
  if v_owner is null then
    return new;
  end if;

  execute format(
    'select count(*) from %I.%I where %I = $1 and created_at > now() - $2',
    tg_table_schema, tg_table_name, v_owner_column
  )
  into v_recent
  using v_owner, v_window;

  if v_recent >= v_max then
    raise exception 'rate_limit_exceeded: at most % % per %', v_max, tg_table_name, v_window
      using errcode = 'P0001',
            hint = 'Please wait a little before trying again.';
  end if;

  return new;
end;
$$;

comment on function public.enforce_rate_limit() is
  'Generic BEFORE INSERT trigger: rejects the insert when the acting user already has >= max rows in the window. Args: owner column, max, interval.';

revoke execute on function public.enforce_rate_limit() from public, anon, authenticated;

-- Composite indexes so each check is a short index range scan.
create index if not exists posts_author_id_created_at_idx
  on public.posts (author_id, created_at desc);
create index if not exists comments_author_id_created_at_idx
  on public.comments (author_id, created_at desc);
create index if not exists messages_sender_id_created_at_idx
  on public.messages (sender_id, created_at desc);
create index if not exists reports_reporter_id_created_at_idx
  on public.reports (reporter_id, created_at desc);
create index if not exists communities_created_by_created_at_idx
  on public.communities (created_by, created_at desc);

create trigger posts_rate_limit
  before insert on public.posts
  for each row execute function public.enforce_rate_limit('author_id', '5', '10 minutes');

create trigger comments_rate_limit
  before insert on public.comments
  for each row execute function public.enforce_rate_limit('author_id', '20', '5 minutes');

create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function public.enforce_rate_limit('sender_id', '30', '1 minute');

create trigger reports_rate_limit
  before insert on public.reports
  for each row execute function public.enforce_rate_limit('reporter_id', '10', '1 hour');

create trigger communities_rate_limit
  before insert on public.communities
  for each row execute function public.enforce_rate_limit('created_by', '3', '1 day');
