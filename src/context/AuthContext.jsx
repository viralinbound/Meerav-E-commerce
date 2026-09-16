import { createContext, useContext, useEffect, useState } from "react";
import { MiraDB } from "../lib/supabase.js";
import { resolveImagePath } from "../lib/resolveImage.js";

const AuthContext = createContext(null);

function normalizeCustomer(c) {
  if (!c) return c;
  return { ...c, avatar: resolveImagePath(c.avatar) || "/assets/images/default_avatar.jpg" };
}

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    MiraDB.getCurrentSession().then(async (session) => {
      if (session?.user) {
        const profile = await MiraDB.getOrCreateCustomerProfile(session.user);
        if (!cancelled) setCustomer(normalizeCustomer(profile));
      }
      if (!cancelled) setLoading(false);
    });

    const { data: sub } = MiraDB.onAuthChange(async (_event, session) => {
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

  async function signUp(fields) {
    const res = await MiraDB.signUpCustomer(fields);
    if (!res.error && res.profile) setCustomer(normalizeCustomer(res.profile));
    return res;
  }

  async function signIn(email, password) {
    const res = await MiraDB.signInCustomer(email, password);
    if (!res.error && res.profile) setCustomer(normalizeCustomer(res.profile));
    return res;
  }

  async function signOut() {
    await MiraDB.signOutCustomer();
    setCustomer(null);
  }

  return (
    <AuthContext.Provider value={{ customer, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
