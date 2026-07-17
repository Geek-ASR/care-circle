-- ============================================================================
-- CareCircle: Personal health tracker and condition resource directory
-- ----------------------------------------------------------------------------
-- Two genuinely new pieces of schema (everything else built this session
-- reused existing tables/RLS):
--
-- 1. health_logs: a private, journal-style symptom/medication tracker - the
--    single most "PatientsLikeMe" feature on the roadmap and the platform's
--    clearest differentiator from a generic discussion forum. Fully private
--    (same "for all, owner-only" pattern as drafts), one row per check-in
--    (not one per day) so a user can log multiple times a day. symptoms/
--    medications are jsonb arrays rather than normalized child tables -
--    there's no cross-user querying need (this is never aggregated across
--    users, only charted for the one owner), so the extra join complexity
--    a normalized schema would add isn't buying anything here.
--
-- 2. condition_resources: curated external resources (hotlines, orgs,
--    research) per condition, same shape and RLS as the existing
--    community_resources table, just scoped to a condition instead of a
--    community - useful independent of whether a condition has an active
--    community yet.
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- health_logs
-- ----------------------------------------------------------------------------
create table public.health_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  logged_at timestamptz not null default now(),
  symptoms jsonb not null default '[]'::jsonb,
  medications jsonb not null default '[]'::jsonb,
  mood smallint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint health_logs_mood_range check (mood is null or mood between 1 and 5),
  constraint health_logs_notes_length check (notes is null or char_length(notes) <= 2000)
);

comment on table public.health_logs is 'Private per-user symptom/medication journal. Never visible to anyone but its owner - not RLS-relaxed for moderators/admins like content tables, this is health data.';
comment on column public.health_logs.symptoms is 'jsonb array of {name: text, severity: 1-5}.';
comment on column public.health_logs.medications is 'jsonb array of {name: text, dosage: text}.';

create index health_logs_user_id_logged_at_idx on public.health_logs (user_id, logged_at desc);

create trigger set_updated_at
  before update on public.health_logs
  for each row execute function public.set_updated_at();

alter table public.health_logs enable row level security;

create policy "health_logs_owner_all"
  on public.health_logs for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- condition_resources
-- ----------------------------------------------------------------------------
create table public.condition_resources (
  id uuid primary key default gen_random_uuid(),
  condition_id uuid not null references public.conditions (id) on delete cascade,
  title text not null,
  url text,
  description text,
  category text check (category in (
    'hotline', 'organization', 'research', 'financial_assistance', 'other'
  )),
  created_at timestamptz not null default now()
);

create index condition_resources_condition_id_idx on public.condition_resources (condition_id);

alter table public.condition_resources enable row level security;

create policy "condition_resources_select_public"
  on public.condition_resources for select
  to public
  using (true);

create policy "condition_resources_admin_write"
  on public.condition_resources for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
