# Environment Variables

## Security note — read this first

Vite bundles any variable prefixed `VITE_` directly into the client-side
JavaScript that ships to every visitor's browser. **`VITE_`-prefixed
values are public**, full stop — anyone can open devtools, view the
bundle, and read them. This is why only the Supabase **publishable key** is used
client-side, never a service-role key or any other secret.

This is not a weakness particular to this project — it's how every static
SPA works, and it's fine, because the publishable key is *meant* to be public.
Supabase's security model does not rely on the publishable key being secret; it
relies on **Row Level Security (RLS) policies** in Postgres to decide what
each request is allowed to read or write, based on the caller's
authenticated identity (or lack of one). See
[`docs/database-schema.md`](./database-schema.md#row-level-security-rls-strategy)
for how RLS is structured in this project. If RLS on a table is wrong, no
amount of hiding the publishable key would fix it — and if RLS is right,
the publishable key being public doesn't matter.

The CI-only secrets below are the opposite: they must **never** be
prefixed `VITE_`, never referenced from `apps/web/src`, and never appear
in a client bundle. They're used exclusively by the
`supabase-migrations.yml` workflow to authenticate the Supabase CLI
against the live project from GitHub's runners.

## Client / build-time variables

These are read by Vite at build time (`import.meta.env.*`) and end up in
the shipped JS bundle. Set locally in `apps/web/.env.local` (see
`apps/web/.env.example`); set in CI as repo secrets consumed by
`.github/workflows/deploy.yml`.

| Name | Used in | Example value | Notes |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Client build; injected in CI from repo secret `VITE_SUPABASE_URL` | `https://abcdefghijklmnop.supabase.co` | Your Supabase project's API URL. Found in Supabase Studio: Project Settings → API → Project URL. Public — safe to expose. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client build; injected in CI from repo secret `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Supabase's current name for the public client-side API key (previously called the "anon" key — same role). Found in Supabase Studio: Project Settings → API Keys → Publishable key. Public by design — RLS is the real gate, not this key. Never confuse with the **secret key** on the same page, which bypasses RLS and must never be used client-side. |
| `VITE_BASE_PATH` | Build-time only (`vite.config.ts` reads `process.env.VITE_BASE_PATH` for Vite's `base` option); **not** read via `import.meta.env` in app code | `/care-circle/` | Set to `/care-circle/` in `deploy.yml` for the GitHub Pages project-site path. Not set locally — `vite.config.ts` falls back to `/` for local dev, which is what you want when running `npm run dev`. |

## CI-only secrets (never in client code)

These live only in **Settings → Secrets and variables → Actions** on the
GitHub repo, and are consumed only by
`.github/workflows/supabase-migrations.yml` to run `supabase link` /
`supabase db push` against the live project from CI.

| Name | Used in | Example value | Notes |
|---|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | `supabase-migrations.yml` (Supabase CLI auth) | `sbp_1a2b3c4d...` | Personal access token from your Supabase account: [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) → Access Tokens → Generate new token. Treat like a password — it can act on any project you have access to. |
| `SUPABASE_PROJECT_ID` | `supabase-migrations.yml` (`supabase link --project-ref`) | `abcdefghijklmnop` | The project ref, i.e. the subdomain segment of your project URL (`https://<this>.supabase.co`). Found in Project Settings → General → Reference ID. Not itself secret, but kept as a secret for convenience/consistency — treat as config, low sensitivity. |
| `SUPABASE_DB_PASSWORD` | `supabase-migrations.yml` (`supabase link` / `supabase db push` DB auth) | *(the password you set when creating the project)* | The Postgres database password, set at project creation (or reset in Project Settings → Database → Reset database password). This is a real secret — treat it with the same care as a root DB password, because it is one. |

## Local development setup

```
apps/web/.env.example   ->  copy to  ->  apps/web/.env.local
```

`apps/web/.env.local` is gitignored (see the repo's `.gitignore`) and
should never be committed. Fill in your own Supabase project's URL and
publishable key — either your own free Supabase project for local hacking, or
values from `supabase start` if developing fully offline against the local
Supabase stack (`supabase/config.toml` defines that local stack).
