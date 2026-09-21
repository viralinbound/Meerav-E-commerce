import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Ban, RotateCcw, Trash2, ShieldCheck, X, KeyRound, Megaphone } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { useAdminAuth } from '../useAdminAuth';
import { Card, LoadingState, ErrorState, EmptyState, TableScroller } from '../ui';

interface AdminRow {
  id: string;
  email: string;
  name: string;
  role: string;
  banned: boolean;
  created_at: string;
}

interface AdminAccountsProps {
  onViewActivity?: (id: string, name: string) => void;
}

export function AdminAccounts({ onViewActivity }: AdminAccountsProps) {
  const { admin: me } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    MiraDB.fetchAdmins()
      .then((data: AdminRow[]) => setAdmins(data))
      .catch((e: any) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAction = async (action: 'ban' | 'unban' | 'remove' | 'reset' | 'warn', adminId: string) => {
    if (action === 'remove' && !confirm('Remove this admin permanently? They will lose all access.')) return;
    let warnMessage = '';
    if (action === 'warn') {
      const input = prompt('Warning message for this admin:');
      if (!input?.trim()) return;
      warnMessage = input.trim();
    }
    setBusyId(adminId);
    let result;
    if (action === 'ban') result = await MiraDB.banAdmin(adminId);
    else if (action === 'unban') result = await MiraDB.unbanAdmin(adminId);
    else if (action === 'remove') result = await MiraDB.removeAdmin(adminId);
    else if (action === 'warn') result = await MiraDB.warnAdmin(adminId, warnMessage);
    else result = await MiraDB.resetAdminPassword(adminId);
    setBusyId(null);

    if (result?.error) {
      alert(result.error.message || 'Action failed.');
      return;
    }
    if (action === 'reset') {
      alert('Password reset. Check the admin activity log / registered email for next steps.');
    }
    load();
  };

  if (loading) return <LoadingState label="Loading admin accounts…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <Card>
        <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-maroon-900">Admin Accounts</h3>
            <p className="text-sm text-charcoal-400">Real Supabase Auth accounts — not a shared password.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg bg-maroon-700 text-cream-50 text-sm font-semibold hover:bg-maroon-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register Admin
          </button>
        </div>

        {admins.length === 0 ? (
          <EmptyState label="No admin accounts found" />
        ) : (
          <TableScroller>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide border-b border-cream-200">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {onViewActivity ? (
                          <button
                            onClick={() => onViewActivity(a.id, a.name)}
                            className="font-medium text-maroon-700 hover:underline text-left"
                            title="View full activity"
                          >
                            {a.name}
                          </button>
                        ) : (
                          <p className="font-medium text-charcoal-800">{a.name}</p>
                        )}
                        {a.id === me?.id && <span className="text-[10px] px-1.5 py-0.5 bg-saffron-100 text-saffron-800 rounded-full font-semibold">YOU</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-charcoal-600">{a.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-maroon-50 text-maroon-700 capitalize">
                        <ShieldCheck className="w-3 h-3" /> {a.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {a.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleAction('reset', a.id)}
                          disabled={busyId === a.id}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-maroon-700 hover:bg-maroon-50 transition-colors disabled:opacity-50"
                          aria-label={`Reset password for ${a.name}`}
                          title="Reset password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        {a.role !== 'root' && (
                          <>
                            <button
                              onClick={() => handleAction('warn', a.id)}
                              disabled={busyId === a.id}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-saffron-700 hover:bg-saffron-50 transition-colors disabled:opacity-50"
                              aria-label={`Warn ${a.name}`}
                              title="Send warning"
                            >
                              <Megaphone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(a.banned ? 'unban' : 'ban', a.id)}
                              disabled={busyId === a.id}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-mustard-700 hover:bg-mustard-50 transition-colors disabled:opacity-50"
                              aria-label={a.banned ? `Unban ${a.name}` : `Ban ${a.name}`}
                              title={a.banned ? 'Unban' : 'Ban'}
                            >
                              {a.banned ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleAction('remove', a.id)}
                              disabled={busyId === a.id}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                              aria-label={`Remove ${a.name}`}
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroller>
        )}
      </Card>

      {showForm && (
        <RegisterAdminModal
          onClose={() => setShowForm(false)}
          onRegistered={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </>
  );
}

function RegisterAdminModal({ onClose, onRegistered }: { onClose: () => void; onRegistered: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) return setError('Name and email are required.');

    setSaving(true);
    const result = await MiraDB.registerAdmin({ email: email.trim(), name: name.trim() });
    setSaving(false);
    if (result?.error) return setError(result.error.message || 'Could not register this admin.');
    onRegistered();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-cream-50 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-maroon-800 text-cream-50 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-serif text-lg font-bold">Register New Admin</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Full Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Email *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@meerav.com"
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
          <p className="text-xs text-charcoal-400">A temporary password will be generated. The new admin can reset it after signing in.</p>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium text-charcoal-600 hover:bg-cream-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold bg-maroon-700 text-cream-50 hover:bg-maroon-800 transition-colors disabled:opacity-60">
              {saving ? 'Registering…' : 'Register Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
