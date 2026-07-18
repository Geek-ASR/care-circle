-- ============================================================================
-- CareCircle: Symptom checker (community matcher, not a diagnostic tool)
-- ----------------------------------------------------------------------------
-- Three tables:
--
-- 1. symptoms: a taxonomy of common symptoms grouped by body area, same
--    shape/RLS as conditions (public-read, admin-write).
-- 2. condition_symptoms: a weighted many-to-many join between conditions and
--    symptoms (weight 1-3, "sometimes" to "hallmark"), curated from general
--    medical knowledge. This is intentionally NOT a diagnostic mapping -
--    it powers a transparent "these communities discuss similar symptoms"
--    match, never a claim of likelihood or diagnosis. Public-read/admin-write
--    like conditions.
-- 3. symptom_checks: a private, per-user record of each check-in (symptoms
--    selected + follow-up answers + a snapshot of the computed results at
--    the time), same "for all, owner-only" pattern as health_logs. Storing
--    a results snapshot means a user's history keeps showing exactly what
--    they saw even if the taxonomy/algorithm changes later.
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- symptoms
-- ----------------------------------------------------------------------------
create table public.symptoms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  category text not null,
  created_at timestamptz not null default now()
);

comment on table public.symptoms is 'Taxonomy of common symptoms grouped by body area, used by the symptom checker.';

create index symptoms_category_idx on public.symptoms (category);

alter table public.symptoms enable row level security;

create policy "symptoms_select_public"
  on public.symptoms for select
  to public
  using (true);

create policy "symptoms_admin_write"
  on public.symptoms for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- condition_symptoms
-- ----------------------------------------------------------------------------
create table public.condition_symptoms (
  condition_id uuid not null references public.conditions (id) on delete cascade,
  symptom_id uuid not null references public.symptoms (id) on delete cascade,
  weight smallint not null default 1 check (weight between 1 and 3),
  primary key (condition_id, symptom_id)
);

comment on table public.condition_symptoms is 'Weighted symptom associations per condition (1=sometimes, 2=common, 3=hallmark). Powers symptom-checker matching, not a diagnostic claim.';

create index condition_symptoms_symptom_id_idx on public.condition_symptoms (symptom_id);

alter table public.condition_symptoms enable row level security;

create policy "condition_symptoms_select_public"
  on public.condition_symptoms for select
  to public
  using (true);

create policy "condition_symptoms_admin_write"
  on public.condition_symptoms for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- symptom_checks
-- ----------------------------------------------------------------------------
create table public.symptom_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  symptom_ids jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint symptom_checks_symptom_ids_is_array check (jsonb_typeof(symptom_ids) = 'array'),
  constraint symptom_checks_results_is_array check (jsonb_typeof(results) = 'array')
);

comment on table public.symptom_checks is 'Private per-user symptom-checker history. Never visible to anyone but its owner - health data, not RLS-relaxed for moderators/admins.';
comment on column public.symptom_checks.symptom_ids is 'jsonb array of symptoms.id (uuid strings) the user selected.';
comment on column public.symptom_checks.answers is 'jsonb object of follow-up answers: {duration, severity, pattern, notes}.';
comment on column public.symptom_checks.results is 'jsonb array snapshot of computed matches at check time: [{conditionId, conditionName, conditionSlug, communitySlug, score, matchedSymptomNames}].';

create index symptom_checks_user_id_created_at_idx on public.symptom_checks (user_id, created_at desc);

alter table public.symptom_checks enable row level security;

create policy "symptom_checks_owner_all"
  on public.symptom_checks for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
