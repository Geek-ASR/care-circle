-- ============================================================================
-- CareCircle: conversations.created_by follow-up
-- ----------------------------------------------------------------------------
-- 20260101000011_security_hardening.sql added conversations.created_by and
-- gated self-join in conversation_participants on it (closing an IDOR where
-- any authenticated user could self-insert into an arbitrary conversation_id
-- and read someone else's DMs), but never taught create_conversation() -
-- the documented, recommended way to start a conversation, defined in
-- 20260101000005_messaging.sql - to populate the new column. That's not a
-- security gap on its own (the RPC is SECURITY DEFINER and inserts the
-- caller into conversation_participants directly, bypassing the
-- created_by-gated policy entirely), but it leaves created_by permanently
-- NULL for every conversation created the normal way, undermining the audit
-- trail the hardening migration introduced. This closes that loop.
-- ============================================================================

set search_path = public, extensions;

create or replace function public.create_conversation(
  p_participant_ids uuid[],
  p_is_group boolean default false,
  p_community_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  new_conversation_id uuid;
begin
  if caller_id is null then
    raise exception 'create_conversation requires an authenticated caller';
  end if;

  insert into public.conversations (is_group, community_id, created_by)
  values (p_is_group, p_community_id, caller_id)
  returning id into new_conversation_id;

  insert into public.conversation_participants (conversation_id, user_id)
  select new_conversation_id, participant_id
  from unnest(p_participant_ids || array[caller_id]) as participant_id
  group by participant_id
  on conflict do nothing;

  return new_conversation_id;
end;
$$;
