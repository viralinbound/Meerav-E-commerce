import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Package, ClipboardList, Menu, X, LogOut, Settings, Users, History, Paintbrush, ExternalLink, Images,
} from 'lucide-react';
import { useAdminAuth } from './useAdminAuth';
import { WarningsBanner } from './WarningsBanner';

export type AdminPage = 'dashboard' | 'products' | 'heroBanners' | 'orders' | 'settings' | 'admins' | 'activity';

const NAV_ITEMS: { id: AdminPage; label: string; icon: typeof LayoutDashboard; rootOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'heroBanners', label: 'Hero Banners', icon: Images },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'settings', label: 'Store Settings', icon: Settings },
  { id: 'admins', label: 'Admin Accounts', icon: Users, rootOnly: true },
  { id: 'activity', label: 'Activity Log', icon: History, rootOnly: true },
];

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
          <p className="font-serif text-lg font-bold text-cream-50 leading-none">Meerav Admin</p>
          <p className="text-[11px] text-saffron-300 tracking-wide uppercase mt-1">Dispatch Hub</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter((item) => !item.rootOnly || admin?.role === 'root').map((item) => {
          const Icon = item.icon;
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
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </button>
          );
        })}

        <a
          href="/design-editor.html"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] text-saffron-200 hover:bg-maroon-700/60 hover:text-saffron-100 border border-saffron-400/30 mt-2"
        >
          <Paintbrush className="w-5 h-5 shrink-0" />
          Design Editor
          <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
        </a>
      </nav>

      <div className="px-4 py-4 border-t border-maroon-700/50">
        <div className="px-1 mb-3">
          <p className="text-sm font-semibold text-cream-50 truncate">{admin?.name || 'Admin'}</p>
          <p className="text-xs text-cream-300 truncate">{admin?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 justify-center px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium text-cream-100 border border-cream-100/20 hover:bg-maroon-700/60 transition-colors"
        >
          <LogOut className="w-4 h-4" />
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
              className="absolute top-5 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-cream-50"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
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
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg text-maroon-800 hover:bg-cream-200 transition-colors -ml-1"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-maroon-900">{activeLabel}</h2>
          </div>
        </header>

        <WarningsBanner />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
