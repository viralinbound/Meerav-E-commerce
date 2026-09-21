import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Vite's default dependency scanner crawls every *.html file in the
  // project to discover imports for pre-bundling. Without this, it also
  // picks up the legacy static pages that live under public/ (admin.html,
  // design-editor.html) — those are plain static HTML with <script src="js/...">
  // tags, not part of the React app, and Vite chokes trying to resolve them
  // as ES module imports. Restricting the scan to the real React entry point
  // avoids that entirely; files under public/ are still copied to dist/
  // verbatim regardless of this setting.
  optimizeDeps: {
    entries: ['index.html'],
    exclude: ['lucide-react'],
  },
  // The production build only bundles the entries listed here — without
  // admin-v2.html, Vercel's dist/ never contains it and the deployed admin
  // panel 404s even though it works fine against Vite's dev server (which
  // serves every root-level .html file regardless of this list).
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        adminV2: fileURLToPath(new URL('./admin-v2.html', import.meta.url)),
      },
    },
  },
  // Vite only exposes env vars prefixed VITE_ to import.meta.env by default.
  // Adding SUPABASE_ here means the existing SUPABASE_URL / SUPABASE_ANON_KEY
  // lines in .env (used by the legacy admin pages) work for the React app
  // too, without needing separate VITE_-prefixed duplicates.
  envPrefix: ['VITE_', 'SUPABASE_'],
});
