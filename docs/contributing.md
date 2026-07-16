# Contributing

## Branch naming

Use `<type>/<short-description>`, e.g. `feat/comment-threading`,
`fix/vote-count-race`, `chore/ci-cache-tuning`. Keep the description short
and kebab-case; the type prefix should match the Conventional Commits type
of the work (see below).

## Commit style

This project has no established convention yet. In the absence of one, use
[Conventional Commits](https://www.conventionalcommits.org/) as the
default: `<type>(<optional scope>): <summary>`, e.g.

```
feat(posts): add nested comment collapsing
fix(auth): handle expired anonymous session on reconnect
chore(ci): bump setup-node to v4
```

Common types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`.
This isn't enforced by tooling (no commitlint/husky configured yet) — it's
a convention to follow by hand until/unless the project adopts tooling for
it.

## Before opening a PR

Run the full local check suite from the repo root — this is the same
sequence `.github/workflows/ci.yml` runs, so passing locally means CI
should pass too:

```sh
npm run format && npm run lint && npm run typecheck && npm run test && npm run build
```

All of these proxy into the `apps/web` workspace via the root
`package.json` scripts. Fix everything `format`/`lint` can't auto-fix, and
don't open the PR with a red `typecheck`/`test`/`build` locally — CI will
just fail with the same error.

`ci.yml` runs on every PR targeting `main` and on every push to `main`.
`deploy.yml` and `supabase-migrations.yml` only run on `main` — merging a
PR is what actually ships a frontend deploy and/or applies migrations, so
review accordingly (see the next section for migrations specifically).

## Adding a database migration

Never hand-edit a migration file that's already been applied to any shared
environment (production, or anyone else's local db) — Supabase tracks
applied migrations by filename/checksum, so editing one after the fact
causes drift between environments instead of fixing it. If a previous
migration was wrong, add a new migration that corrects it.

To add a new migration:

```sh
supabase migration new <name>
```

This creates a new timestamped file in `supabase/migrations/`
(`YYYYMMDDHHMMSS_<name>.sql`) — the timestamp determines apply order, so
migrations always run in the order they were created. Write the schema
change as plain SQL. Test it locally against the Supabase local dev stack
before opening a PR (`supabase start`, `supabase db reset` to replay all
migrations from scratch, or `supabase db push` against a personal
Supabase project).

Because `supabase-migrations.yml` applies anything under
`supabase/migrations/**` to the **live production database** the moment
it lands on `main`, treat migration PRs with extra scrutiny in review —
see the header comment in that workflow file, and
[`docs/database-schema.md`](./database-schema.md) for the conventions
(soft-delete, RLS helper functions, naming) new migrations are expected to
follow.

## Feature-folder convention

New feature work lives under `src/features/<name>/`, structured as:

```
src/features/<name>/
├── components/     # feature-specific UI components (not shared elsewhere)
├── hooks/          # feature-specific hooks (often wrapping TanStack Query)
├── api/            # Supabase calls for this feature — the only place
│                   # that imports the Supabase client for this domain
└── types.ts        # types/interfaces for this feature's domain
```

Components should call hooks from `hooks/` (or directly from `api/` for
simple cases), not call the Supabase client inline. This keeps all
Supabase-touching code inside `api/` layers across the codebase — see
[`docs/architecture.md`](./architecture.md#why-vite-spa--supabase) for why
that isolation matters beyond just tidiness (it's what keeps a future
backend migration cheap). Code shared across multiple features (generic UI
primitives, cross-cutting hooks/utils) belongs in the top-level
`src/components/`, `src/hooks/`, `src/utils/`, etc., not inside a feature
folder.
