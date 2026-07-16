-- ============================================================================
-- CareCircle: Messaging
-- ----------------------------------------------------------------------------
-- Direct/group conversations (including one conversation per community-wide
-- chat) and their messages. Access is restricted to conversation
-- participants; enforced later in 20260101000010_rls_policies.sql via EXISTS
-- subqueries against conversation_participants.
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- conversations
-- ----------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean not null default false,
  community_id uuid references public.communities (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.conversations is 'community_id is set for community-wide chat conversations; null for DMs/group chats.';

create index conversations_community_id_idx on public.conversations (community_id);

-- ----------------------------------------------------------------------------
-- conversation_participants
-- ----------------------------------------------------------------------------
create table public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index conversation_participants_user_id_idx on public.conversation_participants (user_id);

-- ----------------------------------------------------------------------------
-- messages
-- ----------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  body text,
  attachment_url text,
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.messages is 'sender_id is nullable (ON DELETE SET NULL) so message history survives account deletion.';

create index messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);
create index messages_sender_id_idx on public.messages (sender_id);

-- ----------------------------------------------------------------------------
-- create_conversation(): RPC helper that solves a bootstrapping problem
-- inherent to the "participants only" RLS strategy (see
-- 20260101000010_rls_policies.sql): conversations has no owner/creator
-- column, so its SELECT policy is purely "are you a participant?". Postgres
-- RLS requires a RETURNING clause on INSERT to also satisfy the table's
-- SELECT policy for the row being returned - but a brand-new conversation
-- has no participants yet, so a plain client-side
-- `INSERT INTO conversations ... RETURNING id` would always fail RLS before
-- the caller ever gets a chance to add themselves as a participant.
--
-- This function does both inserts atomically as SECURITY DEFINER (bypassing
-- RLS for its own writes) and hands back the new id directly, sidestepping
-- the RETURNING/SELECT-policy interaction entirely. It's the intended entry
-- point for starting a new conversation; the raw table INSERT policies
-- remain in place for subsequent operations (e.g. an existing participant
-- inviting someone else, per conversation_participants_insert_self_or_participant).
-- ----------------------------------------------------------------------------
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

  insert into public.conversations (is_group, community_id)
  values (p_is_group, p_community_id)
  returning id into new_conversation_id;

  insert into public.conversation_participants (conversation_id, user_id)
  select new_conversation_id, participant_id
  from unnest(p_participant_ids || array[caller_id]) as participant_id
  group by participant_id
  on conflict do nothing;

  return new_conversation_id;
end;
$$;

comment on function public.create_conversation(uuid[], boolean, uuid) is
  'Atomically creates a conversation and its initial participants (always including the caller). Use this instead of a raw INSERT INTO conversations from the client - see comment above for why.';

grant execute on function public.create_conversation(uuid[], boolean, uuid) to authenticated;
