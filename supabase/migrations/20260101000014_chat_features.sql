-- ============================================================================
-- CareCircle: Direct messaging support functions
-- ----------------------------------------------------------------------------
-- The conversations/conversation_participants/messages tables and RLS
-- policies already exist (20260101000005_messaging.sql,
-- 20260101000010_rls_policies.sql). This migration adds what the chat UI
-- needs on top: a denormalized last-message preview on conversations (same
-- trigger-maintained-cache convention as posts.score/comment_count in
-- 20260101000004_content.sql, so the conversation list is a single cheap
-- query instead of a last-message-per-conversation subquery), an unread
-- count helper, and a race-free "find or start a DM" helper.
-- ============================================================================

set search_path = public, extensions;

alter table public.conversations
  add column last_message_at timestamptz,
  add column last_message_preview text;

-- ----------------------------------------------------------------------------
-- messages_update_conversation_preview(): keeps conversations.last_message_at/
-- last_message_preview in sync so the conversation list never has to join
-- messages. SECURITY DEFINER because the caller only has UPDATE rights on
-- conversations they're a participant of via RLS, but every participant
-- (including ones who didn't send this message) needs the preview to update.
-- ----------------------------------------------------------------------------
create or replace function public.messages_update_conversation_preview()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set last_message_at = new.created_at,
      last_message_preview = left(
        coalesce(new.body, case when new.attachment_url is not null then '📎 Attachment' else '' end),
        200
      )
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_after_insert_update_conversation
  after insert on public.messages
  for each row execute function public.messages_update_conversation_preview();

-- ----------------------------------------------------------------------------
-- get_unread_message_counts(): per-conversation unread count for the calling
-- user only (always auth.uid() - never accepts a target uid - so this stays
-- safe to grant broadly despite running as SECURITY DEFINER).
-- ----------------------------------------------------------------------------
create or replace function public.get_unread_message_counts()
returns table (conversation_id uuid, unread_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select m.conversation_id, count(*)::bigint
  from public.messages m
  join public.conversation_participants cp
    on cp.conversation_id = m.conversation_id and cp.user_id = auth.uid()
  where m.sender_id is distinct from auth.uid()
    and (cp.last_read_at is null or m.created_at > cp.last_read_at)
  group by m.conversation_id;
$$;

comment on function public.get_unread_message_counts() is
  'Unread message count per conversation for the calling user. Always scoped to auth.uid(), never a parameter, so it is safe to grant to authenticated despite being SECURITY DEFINER.';

grant execute on function public.get_unread_message_counts() to authenticated;

-- ----------------------------------------------------------------------------
-- get_or_create_direct_conversation(): the "message this user" entry point.
-- Finds an existing 1:1 (non-group, non-community) conversation between the
-- caller and the target, or atomically creates one via create_conversation()
-- (20260101000005_messaging.sql) if none exists. Doing the lookup+create as
-- one SECURITY DEFINER function avoids a client-side check-then-create race
-- that could otherwise spawn duplicate DM threads between the same pair.
-- ----------------------------------------------------------------------------
create or replace function public.get_or_create_direct_conversation(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  existing_id uuid;
begin
  if caller_id is null then
    raise exception 'get_or_create_direct_conversation requires an authenticated caller';
  end if;
  if p_other_user_id = caller_id then
    raise exception 'cannot start a conversation with yourself';
  end if;

  select cp1.conversation_id into existing_id
  from public.conversation_participants cp1
  join public.conversation_participants cp2
    on cp2.conversation_id = cp1.conversation_id and cp2.user_id = p_other_user_id
  join public.conversations c on c.id = cp1.conversation_id
  where cp1.user_id = caller_id
    and c.is_group = false
    and c.community_id is null
  limit 1;

  if existing_id is not null then
    return existing_id;
  end if;

  return public.create_conversation(array[p_other_user_id], false, null);
end;
$$;

comment on function public.get_or_create_direct_conversation(uuid) is
  'Returns the caller''s existing 1:1 conversation with p_other_user_id, or creates one. Prevents duplicate DM threads.';

grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;
