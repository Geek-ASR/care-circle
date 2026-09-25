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
- Community bans and mutes (`community_bans`, migration 22): temporary or
  permanent, enforced in RLS for posting, commenting and rejoining, logged
  to `moderation_actions`, with an anonymous notification to the member, a
  Members tab for moderators, "Restrict author" on posts, and clear notices
  for restricted users.
- Rate limiting (migration 23): per-user limits on posts, comments,
  messages, reports and community requests, with friendly "slow down"
  messages in the app.
- Governance and audit (migration 24): moderators can appoint moderators;
  only the creator, a community admin or a site admin can demote or remove
  one; the last site admin can't be revoked. Role changes and community
  approvals are written to `audit_logs`. New UI: a per-community mod log,
  Make/Remove moderator and Step down in the Members tab, and Site roles +
  Audit log tabs for site admins.
- Reputation recognition (migration 25): contributor flairs (Helpful
  member / Trusted contributor / Community pillar) next to author names,
  and a "Top contributors" card on each community page.

## M3 — Trust & safety

- [ ] **Formal warnings** — `warn_user` is still unused; bans and mutes are
      done (see below).
- [ ] **Mute users** (softer than block) — hide someone's content without
      the hard block semantics.
- [ ] **Keyword / link filters** — automatic hold-for-review of posts that
      contain flagged terms or spam links.
- [ ] **Crisis-language detection** — surface crisis resources when a post
      or message contains self-harm language (important for a health
      community).

## M4 — Admin & governance

- [ ] **Admin analytics dashboard** — growth, activity and report-volume
      charts beyond the current overview counts.

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
