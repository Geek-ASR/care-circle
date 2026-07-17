-- ============================================================================
-- CareCircle: Realtime for poll votes
-- ----------------------------------------------------------------------------
-- 20260101000013_realtime_publication.sql enabled Realtime for the tables the
-- app was subscribing to at the time, but missed poll_votes - added in this
-- same feature pass (rich post types), the client already subscribes to it
-- (features/polls/hooks/usePolls.ts) so poll results update live as votes
-- come in, but without this the subscription silently never fires, same
-- root cause as the original comments bug.
-- ============================================================================

alter publication supabase_realtime add table public.poll_votes;
