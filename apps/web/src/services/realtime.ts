import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface TableChangeConfig {
  table: string
  schema?: string
  event?: ChangeEvent
  filter?: string
}

let subscriptionSequence = 0

/**
 * Subscribes to Postgres change events on a single table/filter. Returns an
 * unsubscribe function — always call it in a `useEffect` cleanup.
 *
 * This is the only place `supabase.channel(...)` is called for table changes,
 * so the realtime transport can be swapped without touching feature code.
 *
 * The `channelName` argument is a human-readable topic, but the actual channel
 * topic always gets a unique numeric suffix: supabase-js's `.channel(topic)`
 * returns the SAME channel object whenever the exact topic string repeats, and
 * calling `.on(...)` on a channel that has already `.subscribe()`d throws. Two
 * components subscribing to the same logical topic at once (e.g. a topbar
 * unread badge and the full page it links to, both watching
 * `conversations:<uid>`) would otherwise crash the second subscriber.
 */
export function subscribeToTable<T extends object>(
  channelName: string,
  { table, schema = 'public', event = '*', filter }: TableChangeConfig,
  onChange: (payload: RealtimePostgresChangesPayload<T>) => void,
): () => void {
  const channel = supabase
    .channel(`${channelName}:${++subscriptionSequence}`)
    .on(
      'postgres_changes',
      { event, schema, table, ...(filter ? { filter } : {}) },
      onChange,
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}

interface PresenceConfig {
  channelName: string
  key: string
  state: Record<string, unknown>
}

/**
 * Tracks the current user's presence on a channel (e.g. "online in this community")
 * and reports the full presence set back via `onSync`. Returns an unsubscribe function.
 */
export function trackPresence(
  { channelName, key, state }: PresenceConfig,
  onSync: (presentKeys: string[]) => void,
): () => void {
  const channel = supabase.channel(channelName, { config: { presence: { key } } })

  channel
    .on('presence', { event: 'sync' }, () => {
      onSync(Object.keys(channel.presenceState()))
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        void channel.track(state)
      }
    })

  return () => {
    void supabase.removeChannel(channel)
  }
}

interface RoomHandlers {
  /** Called with the ids of everyone currently connected to the room. */
  onPresence: (userIds: string[]) => void
  /** Called whenever another participant signals they're typing. */
  onTyping: (userId: string) => void
}

export interface RoomConnection {
  sendTyping: () => void
  leave: () => void
}

/**
 * Ephemeral per-conversation room: Realtime presence for "online now" plus a
 * broadcast channel for typing signals. Nothing here touches the database, so
 * it costs no writes and leaves no trace once everyone disconnects.
 *
 * Unlike subscribeToTable, the topic must be identical for every participant
 * (that's what puts them in the same room), so it gets no uniqueness suffix;
 * callers must only hold one connection per conversation at a time.
 */
export function joinRoom(
  roomName: string,
  userId: string,
  { onPresence, onTyping }: RoomHandlers,
): RoomConnection {
  const channel = supabase.channel(`room:${roomName}`, {
    config: { presence: { key: userId }, broadcast: { self: false } },
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      onPresence(Object.keys(channel.presenceState()))
    })
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      const typingUserId = (payload as { userId?: unknown })?.userId
      if (typeof typingUserId === 'string' && typingUserId !== userId)
        onTyping(typingUserId)
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        void channel.track({ online_at: new Date().toISOString() })
      }
    })

  return {
    sendTyping: () => {
      void channel.send({ type: 'broadcast', event: 'typing', payload: { userId } })
    },
    leave: () => {
      void supabase.removeChannel(channel)
    },
  }
}
