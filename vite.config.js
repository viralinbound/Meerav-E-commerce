import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vite's default dependency scanner crawls every *.html file in the
  // project to discover imports for pre-bundling. Without this, it also
  // picks up the legacy static pages that live under public/ (admin.html,
  // design-editor.html, legacy/*.html) — those are plain static HTML with
  // <script src="js/...\"> tags, not part of the React app, and Vite chokes
  // trying to resolve them as ES module imports. Restricting the scan to
  // the real React entry point avoids that entirely; files under public/
  // are still copied to dist/ verbatim regardless of this setting.
  optimizeDeps: {
    entries: ['index.html'],
  },
  // Vite only exposes env vars prefixed VITE_ to import.meta.env by default.
  // Adding SUPABASE_ here means the existing SUPABASE_URL / SUPABASE_ANON_KEY
  // lines already in mira_gemini/.env (used by the legacy pages) work for the
  // React app too, without needing separate VITE_-prefixed duplicates.
  envPrefix: ['VITE_', 'SUPABASE_'],
})
