-- ============================================================================
-- CareCircle: Extensions & generic helper functions
-- ----------------------------------------------------------------------------
-- Enables the Postgres extensions the rest of the schema depends on and
-- defines small, reusable trigger functions shared across many tables
-- (e.g. the generic `updated_at` bookkeeping trigger). Domain migrations
-- that follow assume these are already in place.
-- ============================================================================

-- gen_random_uuid() for uuid primary keys, plus general crypto helpers.
create extension if not exists pgcrypto with schema extensions;

-- ltree: hierarchical materialized paths, used for nested comment threads.
create extension if not exists ltree with schema extensions;

-- pg_trgm: trigram indexes for fuzzy / ILIKE search on names, titles, usernames.
create extension if not exists pg_trgm with schema extensions;

-- Extensions live in the `extensions` schema (Supabase best practice, avoids
-- the "extension in public" security-advisor warning). Every migration in
-- this project sets its own search_path to `public, extensions` up front so
-- unqualified references to ltree/pg_trgm operators, operator classes, and
-- gen_random_uuid() resolve correctly regardless of session defaults.
set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- set_updated_at(): generic BEFORE UPDATE trigger that stamps updated_at=now().
-- Attached to every table that has an `updated_at` column.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Generic BEFORE UPDATE trigger: sets updated_at to now() on every row update.';
