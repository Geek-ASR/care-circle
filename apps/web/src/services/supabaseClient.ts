import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy apps/web/.env.example to ' +
      '.env.local and fill in your Supabase project credentials (see docs/environment-variables.md).',
  )
}

/**
 * Framework-agnostic Supabase client. This is the only place the SDK is instantiated —
 * every feature's `api/` module goes through this, never `createClient` directly, so a
 * future backend migration only has to change this file's internals.
 *
 * The anon key is safe to ship to the client by design: Row Level Security policies in
 * `supabase/migrations/` are the actual security boundary, not secrecy of this key.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
