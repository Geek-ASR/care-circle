-- ============================================================================
-- CareCircle: Reputation (badges, achievements, reputation events)
-- ----------------------------------------------------------------------------
-- Gamification: awarded badges, progress-tracked achievements, and an
-- append-only reputation_events ledger. profiles.reputation_score is a
-- cached running total maintained by a trigger on reputation_events insert
-- (the ledger is the source of truth; the cached column is for fast reads).
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- badges / user_badges
-- ----------------------------------------------------------------------------
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  criteria text,
  created_at timestamptz not null default now()
);

create table public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index user_badges_badge_id_idx on public.user_badges (badge_id);

-- ----------------------------------------------------------------------------
-- achievements / user_achievements
-- ----------------------------------------------------------------------------
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  target_value integer,
  created_at timestamptz not null default now()
);

create table public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  progress integer not null default 0,
  completed_at timestamptz,
  primary key (user_id, achievement_id)
);

create index user_achievements_achievement_id_idx on public.user_achievements (achievement_id);

-- ----------------------------------------------------------------------------
-- reputation_events: append-only ledger. profiles.reputation_score is a
-- cached sum, kept in sync by apply_reputation_event() below.
-- ----------------------------------------------------------------------------
create table public.reputation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta integer not null,
  reason text not null,
  source_type text,
  source_id uuid,
  created_at timestamptz not null default now()
);

comment on table public.reputation_events is 'Append-only reputation ledger; source of truth for profiles.reputation_score, which is a cached running sum.';

create index reputation_events_user_id_created_at_idx on public.reputation_events (user_id, created_at desc);

-- SECURITY DEFINER: the inserting caller (typically an admin, per the RLS
-- policy on reputation_events) has RLS permission to write the ledger row
-- but not necessarily to UPDATE an arbitrary profiles row; this bypasses
-- that gap for the sole purpose of applying the delta to reputation_score.
create or replace function public.apply_reputation_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set reputation_score = reputation_score + new.delta
  where id = new.user_id;
  return new;
end;
$$;

comment on function public.apply_reputation_event() is
  'AFTER INSERT trigger on reputation_events: applies delta to profiles.reputation_score.';

create trigger reputation_events_after_insert
  after insert on public.reputation_events
  for each row execute function public.apply_reputation_event();
