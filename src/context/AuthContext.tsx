import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MiraDB } from '@/lib/supabase.js';
import { resolveImagePath } from '@/lib/resolveImage.js';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar?: string;
}

interface SignUpFields {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AuthContextValue {
  customer: Customer | null;
  loading: boolean;
  signUp: (fields: SignUpFields) => Promise<{ error?: any; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ error?: any }>;
  sendPasswordReset: (email: string) => Promise<{ error?: any }>;
  updatePassword: (newPassword: string) => Promise<{ error?: any }>;
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeCustomer(c: any): Customer | null {
  if (!c) return null;
  return { ...c, avatar: resolveImagePath(c.avatar) || undefined };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    let cancelled = false;

    MiraDB.getCurrentSession().then(async (session: any) => {
      if (session?.user) {
        const profile = await MiraDB.getOrCreateCustomerProfile(session.user);
        if (!cancelled) setCustomer(normalizeCustomer(profile));
      }
      if (!cancelled) setLoading(false);
    });

    // Clicking the "reset your password" link in the email lands back here
    // already signed in to a recovery session — PASSWORD_RECOVERY tells us
    // to show a "set new password" form instead of treating this as a
    // normal sign-in.
    const { data: sub } = MiraDB.onAuthChange(async (event: string, session: any) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (!cancelled) setPasswordRecovery(true);
      }
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

  async function sendPasswordReset(email: string) {
    return MiraDB.sendPasswordReset(email);
  }

  async function updatePassword(newPassword: string) {
    const res = await MiraDB.updatePassword(newPassword);
    if (!res.error) setPasswordRecovery(false);
    return res;
  }

  function clearPasswordRecovery() {
    setPasswordRecovery(false);
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        signUp,
        signIn,
        signOut,
        resendConfirmationEmail,
        sendPasswordReset,
        updatePassword,
        passwordRecovery,
        clearPasswordRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
