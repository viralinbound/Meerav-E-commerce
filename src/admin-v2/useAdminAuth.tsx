import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MiraDB } from '@/lib/supabase.js';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  must_change_password?: boolean;
}

interface AdminAuthValue {
  admin: AdminProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFromSession() {
      const session = await MiraDB.getAdminSession();
      if (!session?.user) {
        if (!cancelled) setLoading(false);
        return;
      }
      const profile = await MiraDB.getCurrentAdminProfile();
      if (!cancelled) {
        setAdmin(profile);
        setLoading(false);
      }
    }
    loadFromSession();

    const { data: sub } = MiraDB.onAdminAuthChange(async (event: string) => {
      if (event === 'SIGNED_OUT') {
        if (!cancelled) setAdmin(null);
        return;
      }
      const profile = await MiraDB.getCurrentAdminProfile();
      if (!cancelled) setAdmin(profile);
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const result = await MiraDB.signInAdmin(email, password);
    if (result.error) {
      setError(result.error.message || 'Could not sign in.');
      throw result.error;
    }
    setAdmin(result.profile);
  };

  const signOut = async () => {
    await MiraDB.signOutAdmin();
    setAdmin(null);
  };

  const refreshAdmin = async () => {
    const profile = await MiraDB.getCurrentAdminProfile();
    setAdmin(profile);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, error, signIn, signOut, refreshAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
