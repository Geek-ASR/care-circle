# Remaining features

A working checklist of what is **not built yet**, based on an audit of the
schema in `supabase/migrations/`, the frontend in `apps/web/src/`, and the
milestone roadmap in [`architecture.md`](./architecture.md#milestone-roadmap).
Items are grouped by milestone and ordered roughly by impact within each group.

Legend: 🗄️ = the database side already exists, only UI/API wiring is missing.

## What's already done

For context, these ship today: email/OAuth auth + onboarding, communities
(browse, join/leave, create with admin approval, rules, resources, wiki
reading), posts (text, image, link, poll, question, reviews with star
ratings, tags), nested comments with sorting, voting, reactions, bookmarks,
follows + following feed, global search, realtime DMs with unread counts,
notifications + preferences, reporting, moderator report queue, pin/lock,
blocking, privacy settings, reputation, badges, achievements, health
tracker with trends, condition resources directory, symptom checker, PWA
install, and the redesigned UI (design tokens, brand identity, landing page,
app shell, feed, community/post/profile pages, light + dark themes).

Recently completed (moved off this list):

- Community settings for moderators — edit description, logo, banner, rules
  (with reordering), resources and wiki pages at `/r/:slug/settings`.
- Wiki editing (create / edit / delete, version counter) with an "Edit page"
  shortcut on each wiki page for moderators.
- Draft autosave for the post composer, with a "restore your draft" prompt.
- Post edit history viewer (author and moderators).
- Private reputation history on your own profile.
- Chat typing indicators and online presence.

## M3 — Trust & safety

- [ ] **Community bans, mutes and warnings** 🗄️ — `moderation_actions`
      already allows `warn_user`, `mute_user`, `temp_ban` and `ban_user`, but
      the UI only issues `remove_*`, `pin_post` and `lock_post`. Needs a
      member-management screen for moderators and enforcement in RLS
      (banned/muted users can't post or comment in that community).
- [ ] **Rate limiting** — nothing throttles post, comment, message, report or
      vote creation. Add per-user limits (e.g. a Postgres function checked in
      insert policies, or Supabase Edge Functions in front of writes).
- [ ] **Mute users** (softer than block) — hide someone's content without
      the hard block semantics.
- [ ] **Keyword / link filters** — automatic hold-for-review of posts that
      contain flagged terms or spam links.
- [ ] **Crisis-language detection** — surface crisis resources when a post
      or message contains self-harm language (important for a health
      community).

## M4 — Admin & governance

- [ ] **Audit log viewer** 🗄️ — `audit_logs` and `activity_logs` are
      written to but no screen reads them.
- [ ] **Moderation log per community** 🗄️ — a public or mod-only history of
      `moderation_actions` for transparency.
- [ ] **Role management UI** 🗄️ — `roles`, `permissions`, `role_permissions`
      and `user_roles` exist (used by RLS to detect site admins), but there's
      no way to grant or revoke roles from the app.
- [ ] **Appoint / remove moderators** from the community page.
- [ ] **Admin analytics dashboard** — growth, activity and report-volume
      charts beyond the current overview counts.

## M5 — Reputation

- [ ] **Trusted-contributor signals** — surface high-reputation or
      long-standing members (e.g. a flair on posts and comments).
- [ ] **Leaderboards** per community.

## M6 — Polish

- [ ] **Comment draft autosave** — post drafts autosave; comment and reply
      boxes don't yet.
- [ ] **Chat upgrades** — image attachments, message edit/delete, read
      receipts in the thread, and community group chats
      (`conversations.is_group` / `community_id` exist 🗄️ but only 1:1 DMs
      have UI).
- [ ] **Rich text editor** — optional upgrade from Markdown textarea to a
      WYSIWYG editor (e.g. Tiptap), as noted in the architecture doc.
- [ ] **Accessibility audit** — full keyboard and screen-reader pass with
      axe/Lighthouse, focus management in dialogs and the mobile drawer,
      colour-contrast verification of every token pair.
- [ ] **Performance pass** — bundle analysis, image resizing/thumbnails for
      uploads, list virtualization for long feeds and comment threads.
- [ ] **Empty/error states everywhere** — the redesign added them to the main
      screens; secondary screens (moderation queues, followers lists, search
      tabs) still use plain text.
- [ ] **End-to-end tests** — only unit tests exist today; add Playwright
      flows for sign-up → onboarding → join → post → comment.
- [ ] **Email notifications / digests** and **web push notifications**.
- [ ] **Internationalisation (i18n)** — all strings are hard-coded English.

## SEO / infrastructure

- [ ] **SSR or prerendering** for public pages (communities, posts) so they
      get proper link previews and indexing — see
      [SEO and social-preview limitations](./architecture.md#seo-and-social-preview-limitations).
- [ ] **Dynamic Open Graph images** for shared posts.
- [ ] **Error monitoring** (e.g. Sentry) and basic product analytics.

## M7+ — Future (design-doc only)

- [ ] AI health assistant (summarisation and triage, never diagnosis)
- [ ] Verified doctor / clinician accounts
- [ ] Richer structured symptom tracking (charts per condition, export to
      share with a doctor)
- [ ] Native mobile apps
