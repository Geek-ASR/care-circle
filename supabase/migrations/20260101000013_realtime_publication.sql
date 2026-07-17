-- ============================================================================
-- CareCircle: Realtime publication
-- ----------------------------------------------------------------------------
-- Supabase Realtime only emits "postgres_changes" events for tables that are
-- explicitly added to the `supabase_realtime` publication - on a fresh hosted
-- project this publication exists but starts EMPTY. The client already
-- subscribes to these tables (see apps/web/src/services/realtime.ts and the
-- various useXRealtimeSync hooks), but without this migration those
-- subscriptions never receive any events, so new comments/votes/reactions/
-- notifications/messages silently require a manual page refresh to appear.
-- ============================================================================

alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.reactions;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversation_participants;

-- Full row data on UPDATE/DELETE (not just the primary key) so clients can
-- react to changes (e.g. a message edit/delete) without an extra fetch.
alter table public.messages replica identity full;
alter table public.notifications replica identity full;
