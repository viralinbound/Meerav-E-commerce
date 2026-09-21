import { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './useAdminAuth';
import { AdminLogin } from './AdminLogin';
import { AdminShell, type AdminPage } from './AdminShell';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Categories } from './pages/Categories';
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

  return (
    <AdminShell
      page={page}
      onNavigate={(p) => {
        if (p !== 'activity') setActivityFilter(null);
        setPage(p);
      }}
    >
      {page === 'dashboard' && <Dashboard />}
      {page === 'products' && <Products />}
      {page === 'orders' && <Orders />}
      {page === 'categories' && <Categories />}
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
