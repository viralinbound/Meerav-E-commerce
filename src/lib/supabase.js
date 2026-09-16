import { createClient } from '@supabase/supabase-js'
import { createMiraDB } from '../backend/mira-db.js'

// Accepts either the Vite-prefixed names (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
// or the plain legacy names already sitting in mira_gemini/.env (SUPABASE_URL /
// SUPABASE_ANON_KEY) — vite.config.js's envPrefix opts both prefixes into
// import.meta.env, so the existing .env file works with no edits required.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase config. Make sure mira_gemini/.env has SUPABASE_URL and ' +
      'SUPABASE_ANON_KEY set, then restart `npm run dev`.'
  )
}

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// A second client instance mirrors mira_gemini's own setup (separate auth storage
// key for admin sessions) even though this storefront phase doesn't use it yet.
const adminSupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storageKey: 'sb-meerav-admin-auth-react' },
})

// The exact same data-access layer your live site runs on — fetchProducts,
// fetchCategories, dbInsertOrder, subscribeTable, etc. Nothing here was
// rewritten; it's the real mira_gemini/backend/mira-db.js, just injected
// with these two client instances instead of the ones supabase-client.js builds.
export const MiraDB = createMiraDB({ supabaseClient, adminSupabaseClient })
