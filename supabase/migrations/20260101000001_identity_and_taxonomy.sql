-- ============================================================================
-- CareCircle: Identity & taxonomy
-- ----------------------------------------------------------------------------
-- User profiles (1:1 with auth.users), the condition taxonomy used to tag
-- users/communities, the site-wide RBAC tables (roles/permissions), and the
-- follow graph. Also wires up the standard Supabase "new auth user gets a
-- profile row" trigger. RLS is enabled and policies are added later in
-- 20260101000010_rls_policies.sql, once all helper functions exist.
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- conditions: taxonomy of chronic illnesses / diagnoses used across the app.
-- ----------------------------------------------------------------------------
create table public.conditions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  category text,
  created_at timestamptz not null default now()
);

comment on table public.conditions is 'Taxonomy of chronic illnesses/diagnoses (e.g. Lupus, Fibromyalgia).';

create index conditions_category_idx on public.conditions (category);

-- ----------------------------------------------------------------------------
-- profiles: 1:1 extension of auth.users with public-facing profile data.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  banner_url text,
  country text,
  age smallint,
  gender text,
  diagnosis_condition_id uuid references public.conditions (id) on delete set null,
  diagnosis_year smallint,
  verified_diagnosis boolean not null default false,
  website text,
  social_links jsonb not null default '{}'::jsonb,
  reputation_score integer not null default 0,
  privacy_settings jsonb not null default '{"show_age": false, "show_diagnosis": true, "profile_visibility": "public"}'::jsonb,
  notification_settings jsonb not null default '{}'::jsonb,
  theme_preference text not null default 'dark' check (theme_preference in ('dark', 'light', 'system')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 3 and 30),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]+$'),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 2000),
  constraint profiles_age_range check (age is null or age between 13 and 120),
  constraint profiles_diagnosis_year_range check (diagnosis_year is null or diagnosis_year between 1900 and 2100)
);

comment on table public.profiles is 'Public profile data, 1:1 with auth.users. Row is created automatically by handle_new_user().';
comment on column public.profiles.privacy_settings is 'App-layer privacy prefs (e.g. show_age/show_diagnosis/profile_visibility). RLS allows reading the row; field-level redaction happens in the application layer.';

create index profiles_diagnosis_condition_id_idx on public.profiles (diagnosis_condition_id);
create index profiles_reputation_score_idx on public.profiles (reputation_score desc);
create index profiles_username_trgm_idx on public.profiles using gin (username gin_trgm_ops);
create index profiles_display_name_trgm_idx on public.profiles using gin (display_name gin_trgm_ops);

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- handle_new_user(): standard Supabase pattern - auto-provision a profiles
-- row (with a placeholder username) whenever a new auth.users row appears.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, onboarding_completed)
  values (
    new.id,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 12),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'AFTER INSERT trigger on auth.users: provisions a placeholder profiles row. Username is finalized by the user during onboarding.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- roles / permissions: site-wide RBAC (separate from per-community roles,
-- which live on community_members.role).
-- ----------------------------------------------------------------------------
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create index role_permissions_permission_id_idx on public.role_permissions (permission_id);

create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  granted_by uuid references public.profiles (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

comment on table public.user_roles is 'Site-wide role assignments (admin/moderator/member), distinct from per-community roles in community_members.';

create index user_roles_role_id_idx on public.user_roles (role_id);
create index user_roles_granted_by_idx on public.user_roles (granted_by);

-- ----------------------------------------------------------------------------
-- follows: directed user follow graph.
-- ----------------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint follows_no_self_follow check (follower_id <> followee_id)
);

create index follows_followee_id_idx on public.follows (followee_id);
