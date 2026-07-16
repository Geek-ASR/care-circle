import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface TableChangeConfig {
  table: string
  schema?: string
  event?: ChangeEvent
  filter?: string
}

/**
 * Subscribes to Postgres change events on a single table/filter. Returns an
 * unsubscribe function — always call it in a `useEffect` cleanup.
 *
 * This is the only place `supabase.channel(...)` is called for table changes,
 * so the realtime transport can be swapped without touching feature code.
 */
export function subscribeToTable<T extends object>(
  channelName: string,
  { table, schema = 'public', event = '*', filter }: TableChangeConfig,
  onChange: (payload: RealtimePostgresChangesPayload<T>) => void,
): () => void {
  const channel = supabase
    .channel(channelName)
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
