import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MiraDB } from '@/lib/supabase.js';
import { resolveImagePath } from '@/lib/resolveImage.js';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  pincode?: string;
  avatar?: string;
}

interface SignUpFields {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  pincode?: string;
}

interface AuthContextValue {
  customer: Customer | null;
  loading: boolean;
  signUp: (fields: SignUpFields) => Promise<{ error?: any; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeCustomer(c: any): Customer | null {
  if (!c) return null;
  return { ...c, avatar: resolveImagePath(c.avatar) || undefined };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    MiraDB.getCurrentSession().then(async (session: any) => {
      if (session?.user) {
        const profile = await MiraDB.getOrCreateCustomerProfile(session.user);
        if (!cancelled) setCustomer(normalizeCustomer(profile));
      }
      if (!cancelled) setLoading(false);
    });

    const { data: sub } = MiraDB.onAuthChange(async (_event: string, session: any) => {
      if (session?.user) {
        const profile = await MiraDB.getOrCreateCustomerProfile(session.user);
        if (!cancelled) setCustomer(normalizeCustomer(profile));
      } else {
        if (!cancelled) setCustomer(null);
      }
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  async function signUp(fields: SignUpFields) {
    const res = await MiraDB.signUpCustomer(fields);
    if (!res.error && res.profile) setCustomer(normalizeCustomer(res.profile));
    return res;
  }

  async function signIn(email: string, password: string) {
    const res = await MiraDB.signInCustomer(email, password);
    if (!res.error && res.profile) setCustomer(normalizeCustomer(res.profile));
    return res;
  }

  async function signOut() {
    await MiraDB.signOutCustomer();
    setCustomer(null);
  }

  async function resendConfirmationEmail(email: string) {
    return MiraDB.resendConfirmationEmail(email);
  }

  return (
    <AuthContext.Provider value={{ customer, loading, signUp, signIn, signOut, resendConfirmationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
