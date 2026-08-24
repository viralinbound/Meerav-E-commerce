/**
 * Browser bootstrap for the MEERAV Supabase backend.
 * Loads after the Supabase CDN script and js/env-config.js.
 */
import { createMiraDB } from '../backend/mira-db.js';

const SUPABASE_URL = window.__ENV__ && window.__ENV__.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Supabase config. js/env-config.js did not load (or is empty) before js/supabase-client.js. ' +
    'Run `npm run build` after creating .env from .env.example, or set SUPABASE_URL / SUPABASE_ANON_KEY ' +
    'as Environment Variables in your Vercel project settings.'
  );
}

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const adminSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storageKey: 'sb-meerav-admin-auth' }
});

const MiraDB = createMiraDB({ supabaseClient, adminSupabaseClient });

window.MiraDB = MiraDB;
window.fetchCategories = MiraDB.fetchCategories;
window.fetchProducts = MiraDB.fetchProducts;
window.fetchOrders = MiraDB.fetchOrders;
window.fetchCustomers = MiraDB.fetchCustomers;
window.fetchNotifications = MiraDB.fetchNotifications;
window.fetchSiteSettings = MiraDB.fetchSiteSettings;
window.fetchPageContent = MiraDB.fetchPageContent;

