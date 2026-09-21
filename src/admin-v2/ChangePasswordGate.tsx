import { useState, type FormEvent } from 'react';
import { KeyRound, ArrowRight } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { useAdminAuth } from './useAdminAuth';

export function ChangePasswordGate() {
  const { admin, refreshAdmin, signOut } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setSaving(true);
    const result = await MiraDB.changeOwnPassword(password);
    setSaving(false);
    if (result?.error) return setError(result.error.message || 'Could not update your password.');
    await refreshAdmin();
  };

  return (
    <div className="min-h-screen bg-royal-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-cream-50 rounded-2xl shadow-2xl border border-saffron-400/30 overflow-hidden">
        <div className="bg-maroon-900 px-8 py-8 text-center border-b-4 border-saffron-500">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-7 h-7 text-saffron-300" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-cream-50">Set a New Password</h1>
          <p className="text-cream-300 text-sm mt-1">
            Welcome, {admin?.name}. Your account needs a new password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors bg-white"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-maroon-700 text-cream-50 font-semibold rounded-lg hover:bg-maroon-800 transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-60"
          >
            {saving ? 'Updating…' : 'Update Password & Continue'}
            {!saving && <ArrowRight className="w-4 h-4" />}
          </button>

          <button type="button" onClick={() => signOut()} className="block mx-auto text-sm text-charcoal-500 hover:text-maroon-700 transition-colors">
            Sign out instead
          </button>
        </form>
      </div>
    </div>
  );
}
