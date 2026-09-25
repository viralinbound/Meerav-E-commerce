import { useState, type ReactNode } from 'react';
import { useAdminAuth, isHostRole } from './useAdminAuth';
import { MiraDB } from '@/lib/supabase.js';
import { WarningsBanner } from './WarningsBanner';

export type AdminPage = 'dashboard' | 'products' | 'heroBanners' | 'heritageBanner' | 'siteImages' | 'content' | 'orders' | 'newsletter' | 'settings' | 'admins' | 'activity';

const NAV_ITEMS: { id: AdminPage; label: string; rootOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'products', label: 'Products' },
  { id: 'heroBanners', label: 'Hero Banners' },
  { id: 'heritageBanner', label: 'Heritage Banner' },
  { id: 'siteImages', label: 'Site Photos' },
  { id: 'content', label: 'Reviews & FAQs' },
  { id: 'orders', label: 'Orders' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'settings', label: 'Store Settings' },
  { id: 'admins', label: 'Admin Accounts', rootOnly: true },
  { id: 'activity', label: 'Activity Log', rootOnly: true },
];

// Dashboard always stays visible so a restricted admin never lands on a
// blank sidebar; root always passes regardless of its (unused) permissions
// array. Empty/missing permissions = full access, for pre-existing admins.
export function hasPermission(admin: { role?: string; permissions?: string[] | null } | null, pageId: AdminPage): boolean {
  if (!admin) return false;
  if (isHostRole(admin.role)) return true;
  if (pageId === 'dashboard') return true;
  if (!admin.permissions || admin.permissions.length === 0) return true;
  return admin.permissions.includes(pageId);
}

// Every admin (host or sub-admin) can correct their own display name here,
// no approval needed — goes straight to update_own_admin_name(), which can
// only ever touch the caller's own row (never role/permissions/anyone else).
function SelfNameEditor() {
  const { admin, refreshAdmin } = useAdminAuth();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(admin?.name || '');
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <button
        onClick={() => { setValue(admin?.name || ''); setEditing(true); }}
        className="group flex items-center gap-1.5 text-left w-full"
        title="Click to rename yourself"
      >
        <p className="text-sm font-semibold text-cream-50 truncate">{admin?.name || 'Admin'}</p>
        <span className="text-[10px] uppercase tracking-wide text-cream-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">Edit</span>
      </button>
    );
  }

  const save = async () => {
    if (!value.trim() || value.trim() === admin?.name) { setEditing(false); return; }
    setSaving(true);
    const result = await MiraDB.updateOwnName(value.trim());
    setSaving(false);
    if (result?.error) {
      alert(result.error.message || "Could not save. Make sure the add_admin_permissions.sql migration has been run.");
      return;
    }
    await refreshAdmin();
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        className="flex-1 min-w-0 px-2 py-1 rounded bg-white/10 text-cream-50 text-sm border border-cream-100/30 focus:outline-none focus:border-saffron-400"
      />
      <button
        onClick={save}
        disabled={saving}
        className="px-2 h-6 shrink-0 flex items-center justify-center rounded bg-saffron-500 text-maroon-900 text-xs font-semibold disabled:opacity-60"
        aria-label="Save name"
      >
        Save
      </button>
    </div>
  );
}

interface AdminShellProps {
  page: AdminPage;
  onNavigate: (page: AdminPage) => void;
  children: ReactNode;
}

export function AdminShell({ page, onNavigate, children }: AdminShellProps) {
  const { admin, signOut } = useAdminAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = (p: AdminPage) => {
    onNavigate(p);
    setDrawerOpen(false);
  };

  const activeLabel = NAV_ITEMS.find((n) => n.id === page)?.label || '';

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-maroon-700/50">
        <img src="/images/meerav_logo.png" alt="Meerav" className="h-11 w-auto object-contain" />
        <div>
          <p className="font-sans text-lg font-bold text-cream-50 leading-none tracking-tight">Meerav Admin</p>
          <p className="text-[11px] text-saffron-300 tracking-wide uppercase mt-1">Dispatch Hub</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter((item) => (!item.rootOnly || isHostRole(admin?.role)) && hasPermission(admin, item.id)).map((item) => {
          const active = item.id === page;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                active
                  ? 'bg-saffron-500 text-maroon-900 shadow-md'
                  : 'text-cream-200 hover:bg-maroon-700/60 hover:text-cream-50'
              }`}
            >
              {item.label}
            </button>
          );
        })}

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] text-cream-200 hover:bg-maroon-700/60 hover:text-cream-50 border border-cream-100/20 mt-2"
        >
          View Storefront
          <span className="ml-auto text-xs opacity-60">Opens in new tab</span>
        </a>

        <a
          href="/design-editor.html"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] text-saffron-200 hover:bg-maroon-700/60 hover:text-saffron-100 border border-saffron-400/30 mt-2"
        >
          Design Editor
          <span className="ml-auto text-xs opacity-60">Opens in new tab</span>
        </a>
      </nav>

      <div className="px-4 py-4 border-t border-maroon-700/50">
        <div className="px-1 mb-3">
          <SelfNameEditor />
          <p className="text-xs text-cream-300 truncate">{admin?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 justify-center px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium text-cream-100 border border-cream-100/20 hover:bg-maroon-700/60 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-royal-gradient">{SidebarContent}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-royal-gradient shadow-2xl animate-slide-in-right">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-5 right-4 px-3 h-9 flex items-center justify-center rounded-full bg-white/10 text-cream-50 text-sm font-medium"
              aria-label="Close menu"
            >
              Close
            </button>
            {SidebarContent}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-cream-50 border-b border-cream-300 shadow-sm">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden px-3 h-11 flex items-center justify-center rounded-lg text-maroon-800 hover:bg-cream-200 transition-colors -ml-1 text-sm font-semibold"
              aria-label="Open menu"
            >
              Menu
            </button>
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-maroon-900 tracking-tight">{activeLabel}</h2>
          </div>
        </header>

        <WarningsBanner />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
