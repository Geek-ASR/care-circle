# Deployment Guide

Zero-to-live-app walkthrough. Follow in order — later steps depend on
secrets/URLs produced by earlier ones.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), sign in, and create a new
   project on the free tier. Pick a strong database password when
   prompted — write it down, you'll need it later as `SUPABASE_DB_PASSWORD`
   and it's not retrievable after the fact (only resettable).
2. Once the project is provisioned, go to **Project Settings → API** and
   note two values:
   - **Project URL** (e.g. `https://abcdefghijklmnop.supabase.co`) → this
     becomes `VITE_SUPABASE_URL`.
   - **Project API keys → `anon` `public`** → this becomes
     `VITE_SUPABASE_ANON_KEY`.
   
   See [`docs/environment-variables.md`](./environment-variables.md) for
   why the anon key is safe to treat as public.

## 2. Apply the database schema

Install the Supabase CLI locally (`npm install -g supabase` or see the
[CLI docs](https://supabase.com/docs/guides/local-development/cli/getting-started)
for other install methods), then from the repo root:

```sh
supabase login
supabase link --project-ref <your-project-ref>   # the subdomain segment of your Project URL
supabase db push                                  # applies everything in supabase/migrations/
```

`supabase link` will prompt for your database password (the one from step
1). Once linked, `supabase db push` applies all migrations in
`supabase/migrations/` in filename order.

You don't have to run this manually every time — once the repo is on
GitHub with the right secrets configured (step 5), pushing a new migration
file to `main` triggers `.github/workflows/supabase-migrations.yml`, which
runs `supabase db push` for you. Use the manual CLI flow for the initial
setup and for local iteration; let CI handle it for `main`.

## 3. Configure Supabase Auth

In Supabase Studio, **Authentication → Providers**:

- **Email** — enable it, and enable "Confirm email" so new signups must
  verify their address before their account is usable.
- **Google** — enable, and supply an OAuth Client ID/Secret from the
  [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  (create an OAuth 2.0 Client ID of type "Web application"). Set its
  **Authorized redirect URI** to:
  ```
  https://<your-project-ref>.supabase.co/auth/v1/callback
  ```
- **GitHub** — enable, and supply a Client ID/Secret from a
  [GitHub OAuth App](https://github.com/settings/developers) (register
  a new OAuth App). Its **Authorization callback URL** is the same format:
  ```
  https://<your-project-ref>.supabase.co/auth/v1/callback
  ```
- **Anonymous** — enable under Providers → Anonymous. This lets people
  browse/post with a throwaway session before creating a full account,
  which matters for a health-support community where some people
  understandably don't want to sign up with an identifiable account just
  to ask a question.

Then, **Authentication → URL Configuration**:

- **Site URL** → `https://<your-github-username>.github.io/care-circle/`
- **Redirect URLs** → add the same URL (and `http://localhost:5173/` /
  whatever `npm run dev` prints, for local OAuth testing).

## 4. Verify Storage buckets

Storage buckets (avatars, post images) are created by a migration in
`supabase/migrations/`, not manually — but they need to actually exist
before the first image upload will work, so verify them once after
running `supabase db push`:

Supabase Studio → **Storage** → confirm the expected buckets are listed
(check `supabase/migrations/` for the bucket names the migrations create,
since those are the source of truth). If a bucket is missing, re-run
`supabase db push` and check the migration output for errors.

## 5. Create the GitHub repo and configure secrets

1. Create a new GitHub repository (e.g. `care-circle`) and push this code
   to it.
2. Go to **Settings → Secrets and variables → Actions** and add these
   repository secrets:

   | Secret | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | from step 1 |
   | `VITE_SUPABASE_ANON_KEY` | from step 1 |
   | `SUPABASE_ACCESS_TOKEN` | Supabase account → [Access Tokens](https://supabase.com/dashboard/account/tokens) → generate a new token |
   | `SUPABASE_PROJECT_ID` | your project ref (same value used in `supabase link --project-ref`) |
   | `SUPABASE_DB_PASSWORD` | the database password from step 1 |

   Full details on each of these are in
   [`docs/environment-variables.md`](./environment-variables.md).

## 6. Enable GitHub Pages via Actions

**Settings → Pages → Source → "GitHub Actions"**. This must be set
explicitly — it defaults to the legacy branch-based deploy, which will not
work with `deploy.yml` (that workflow deploys via the Pages deployment
API, not by pushing a `gh-pages` branch).

## 7. Deploy

Push to `main`. `.github/workflows/deploy.yml` runs automatically: it
builds `apps/web` with the Supabase env vars injected, applies the SPA
deep-link fallback (`404.html`), and publishes to Pages. When it finishes,
the site is live at:

```
https://<your-github-username>.github.io/care-circle/
```

You can also trigger a redeploy manually from the **Actions** tab
(`Deploy to GitHub Pages` → `Run workflow`) without pushing new code — e.g.
after rotating a secret.

## 8. Local development

```sh
npm install                                            # from repo root — installs both workspaces
cp apps/web/.env.example apps/web/.env.local            # then fill in your Supabase URL + anon key
npm run dev                                             # starts the Vite dev server
```

`npm run dev` (and the other root scripts — `build`, `typecheck`, `lint`,
`format`, `test`) proxy into the `apps/web` workspace; see
[`docs/contributing.md`](./contributing.md) for the full local dev/PR
workflow.
