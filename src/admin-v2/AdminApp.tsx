import { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './useAdminAuth';
import { AdminLogin } from './AdminLogin';
import { AdminShell, type AdminPage } from './AdminShell';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { HeroBanners } from './pages/HeroBanners';
import { HeritageBanner } from './pages/HeritageBanner';
import { SiteImages } from './pages/SiteImages';
import { ContentSections } from './pages/ContentSections';
import { Orders } from './pages/Orders';
import { StoreSettings } from './pages/StoreSettings';
import { AdminAccounts } from './pages/AdminAccounts';
import { ActivityLog } from './pages/ActivityLog';
import { ChangePasswordGate } from './ChangePasswordGate';
import { LoadingState } from './ui';

function AdminRoot() {
  const { admin, loading } = useAdminAuth();
  const [page, setPage] = useState<AdminPage>('dashboard');
  const [activityFilter, setActivityFilter] = useState<{ id: string; name: string } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <LoadingState label="Checking session…" />
      </div>
    );
  }

  if (!admin) return <AdminLogin />;
  if (admin.must_change_password) return <ChangePasswordGate />;

  const isRoot = admin.role === 'root';
  const rootOnlyPageRequested = (page === 'admins' || page === 'activity') && !isRoot;

  return (
    <AdminShell
      page={page}
      onNavigate={(p) => {
        if (p !== 'activity') setActivityFilter(null);
        setPage(p);
      }}
    >
      {rootOnlyPageRequested ? (
        <div className="bg-white rounded-2xl shadow-md border border-cream-200 p-10 text-center">
          <p className="font-serif text-lg font-bold text-maroon-900 mb-1">Root admins only</p>
          <p className="text-sm text-charcoal-500">Ask the root admin if you need access to this section.</p>
        </div>
      ) : (
        <>
          {page === 'dashboard' && <Dashboard />}
          {page === 'products' && <Products />}
          {page === 'heroBanners' && <HeroBanners />}
          {page === 'heritageBanner' && <HeritageBanner />}
          {page === 'siteImages' && <SiteImages />}
          {page === 'content' && <ContentSections />}
          {page === 'orders' && <Orders />}
          {page === 'settings' && <StoreSettings />}
          {page === 'admins' && (
            <AdminAccounts
              onViewActivity={(id, name) => {
                setActivityFilter({ id, name });
                setPage('activity');
              }}
            />
          )}
          {page === 'activity' && (
            <ActivityLog initialFilter={activityFilter} onFilterChange={setActivityFilter} />
          )}
        </>
      )}
    </AdminShell>
  );
}

export function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminRoot />
    </AdminAuthProvider>
  );
}
