import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy apps/web/.env.example ' +
      'to .env.local and fill in your Supabase project credentials (see docs/environment-variables.md).',
  )
}

/**
 * Framework-agnostic Supabase client. This is the only place the SDK is instantiated —
 * every feature's `api/` module goes through this, never `createClient` directly, so a
 * future backend migration only has to change this file's internals.
 *
 * The publishable key (Supabase's current name for the old "anon" key) is safe to ship
 * to the client by design: Row Level Security policies in `supabase/migrations/` are the
 * actual security boundary, not secrecy of this key. Never use the *secret* key here —
 * that one bypasses RLS entirely and belongs only in trusted server-side contexts.
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
