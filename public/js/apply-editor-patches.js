/**
 * Re-applies design edits from the Design Editor (design-editor.html) to
 * this real storefront page.
 *
 * Two layers:
 *  1. Instant local render — reads this browser's own localStorage draft,
 *     0ms delay, so an admin previewing their own unpublished changes sees
 *     them immediately.
 *  2. Cloud sync — once an admin clicks "Publish Live" in the editor, the
 *     published version lives in Supabase (`page_design_patches`) and is
 *     what every OTHER visitor sees. This fetches it, then stays subscribed
 *     via Realtime so a live visitor's page updates in place the moment an
 *     admin publishes again — no reload needed.
 *
 * Only ever touches elements OUTSIDE the dynamic, data-driven containers
 * (product grid, cart, reviews…) — those stay fully owned by store.js / the
 * Admin CRM pages.
 */
(function () {
  const STORAGE_KEY = 'mira_editor_patches_v1';

  function currentPageKey() {
    const file = (location.pathname.split('/').pop() || 'index.html');
    if (location.pathname === '/' || file === '' || file === 'index.html') return 'home';
    if (file === 'category.html') return 'category';
    if (file === 'product.html') return 'product';
    return null;
  }

  function readLocalPatches(pageKey) {
    try { return (JSON.parse(localStorage.getItem(STORAGE_KEY)) || {})[pageKey] || {}; } catch (e) { return {}; }
  }
  function writeLocalPatches(pageKey, patches) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      all[pageKey] = patches;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  // Safe to call more than once with the same (or updated) data — existing
  // elements just get their style/attrs/text re-set (harmless), and an
  // already-inserted block is recognized by its data-ed-id and skipped
  // rather than duplicated.
  //
  // Returns true once every non-insert key resolved to a real element, so
  // callers on pages that render asynchronously (e.g. the React homepage,
  // which paints its sections only after its own Supabase fetch resolves)
  // know whether to keep retrying.
  function applyForPage(pagePatches) {
    if (!pagePatches || !Object.keys(pagePatches).length) return true;

    let allResolved = true;

    Object.keys(pagePatches).forEach((key) => {
      if (key.indexOf('__insert_') === 0) return;
      const p = pagePatches[key];
      let el;
      try { el = document.querySelector(key); } catch (e) { return; }
      if (!el) { allResolved = false; return; }
      if (p.deleted) { el.remove(); return; }
      if (p.style) Object.assign(el.style, p.style);
      if (p.attrs) Object.entries(p.attrs).forEach(([k, v]) => el.setAttribute(k, v));
      if (p.text != null && el.children.length === 0) el.textContent = p.text;
    });

    Object.keys(pagePatches).forEach((key) => {
      if (key.indexOf('__insert_') !== 0) return;
      if (document.querySelector('[data-ed-id="' + key + '"]')) return;
      const p = pagePatches[key];
      let parent;
      try { parent = document.querySelector(p.parentPath); } catch (e) { return; }
      if (!parent) { allResolved = false; return; }
      const wrap = document.createElement('div');
      wrap.innerHTML = p.html;
      const node = wrap.firstElementChild;
      if (node) parent.appendChild(node);
    });

    return allResolved;
  }

  // Pages whose content renders asynchronously (the React SPA fetches its
  // catalog from Supabase before painting) may not have the target elements
  // in the DOM yet the moment this script runs. Retry briefly instead of
  // silently dropping those patches — a no-op on pages where everything is
  // already present, since applyForPage returns true on the first try there.
  function applyWithRetry(pagePatches, attemptsLeft) {
    if (attemptsLeft === undefined) attemptsLeft = 20;
    const resolved = applyForPage(pagePatches);
    if (resolved || attemptsLeft <= 0) return;
    setTimeout(() => applyWithRetry(pagePatches, attemptsLeft - 1), 150);
  }

  async function syncFromCloud(pageKey) {
    if (!window.MiraDB || typeof MiraDB.fetchPageDesignPatches !== 'function') return;

    try {
      const cloud = await MiraDB.fetchPageDesignPatches(pageKey);
      if (cloud && Object.keys(cloud).length) {
        writeLocalPatches(pageKey, cloud);
        applyWithRetry(cloud);
      }
    } catch (e) {
      console.warn('Design Editor cloud sync note:', e);
    }

    if (typeof MiraDB.subscribeTable === 'function') {
      MiraDB.subscribeTable('page_design_patches', (payload) => {
        const row = payload.new;
        if (!row || row.page_key !== pageKey) return;
        const patches = row.patches || {};
        writeLocalPatches(pageKey, patches);
        applyWithRetry(patches);
      });
    }
  }

  function run() {
    const pageKey = currentPageKey();
    if (!pageKey) return;
    window.__miraPatchesApplied = true;

    applyWithRetry(readLocalPatches(pageKey));
    syncFromCloud(pageKey);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
