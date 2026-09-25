# CareCircle

**A community for every chronic illness, not just one.**

CareCircle is a community platform for people living with chronic illness
— Reddit's community structure, Discord's real-time chat, Quora's Q&A
format, and PatientsLikeMe's condition-tracking focus, in one product.
Join a community for your specific condition (or several — comorbidity is
the norm), post and comment, ask questions, chat in real time, and find
people who actually understand what you're dealing with.

## Tech stack

Vite · React 19 · TypeScript · React Router · Tailwind CSS v4 · Radix UI ·
Framer Motion · TanStack Query · Zustand · React Hook Form + Zod ·
react-markdown · Supabase (Auth, Postgres/RLS, Realtime, Storage)

Deployed free: static frontend on **GitHub Pages**, backend entirely on
**Supabase**. See [`docs/architecture.md`](./docs/architecture.md) for why
and how.

## Quickstart

```sh
npm install                                    # installs both workspaces
cp apps/web/.env.example apps/web/.env.local   # then fill in your Supabase URL + publishable key
npm run dev
```

Full setup (Supabase project, migrations, OAuth providers, GitHub Pages)
is in [`docs/deployment-guide.md`](./docs/deployment-guide.md).

## Documentation

| Doc | Covers |
|---|---|
| [`docs/architecture.md`](./docs/architecture.md) | System design, tech stack rationale, known SEO tradeoffs, milestone roadmap |
| [`docs/database-schema.md`](./docs/database-schema.md) | Schema by domain, entity relationships, RLS strategy, soft-delete convention |
| [`docs/deployment-guide.md`](./docs/deployment-guide.md) | Zero-to-live-app setup walkthrough |
| [`docs/environment-variables.md`](./docs/environment-variables.md) | Every env var/secret: where it's used, where to find it, security notes |
| [`docs/contributing.md`](./docs/contributing.md) | Branch/commit conventions, pre-PR checks, migration workflow, feature-folder layout |
| [`docs/remaining-features.md`](./docs/remaining-features.md) | Checklist of what's not built yet, grouped by milestone |

## Project status

Actively developed, milestone by milestone — see the
[roadmap in `docs/architecture.md`](./docs/architecture.md#milestone-roadmap)
for the milestone plan, and
[`docs/remaining-features.md`](./docs/remaining-features.md) for a concrete
checklist of what's still left to build.

## CI/CD

- `.github/workflows/ci.yml` — format/lint/typecheck/test/build on every PR
  to `main` and every push to `main`.
- `.github/workflows/deploy.yml` — builds and publishes `apps/web` to
  GitHub Pages on push to `main`.
- `.github/workflows/supabase-migrations.yml` — applies
  `supabase/migrations/**` to the live Supabase project on push to `main`.
