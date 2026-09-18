import { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'signin' | 'signup';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { customer, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', pincode: '', password: '' });

  if (!isOpen) return null;

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = mode === 'signin' ? await signIn(form.email, form.password) : await signUp(form);
    setBusy(false);
    if (res.error) {
      setError(res.error.message || 'Something went wrong. Please try again.');
    } else if (res.needsConfirmation) {
      setError('Check your email to confirm your account, then sign in.');
      setMode('signin');
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-charcoal-900/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-cream-50 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-maroon-800 text-cream-50 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-serif text-xl font-bold">{customer ? 'Your Account' : mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
          <button onClick={onClose} className="w-9 h-9 hover:bg-maroon-700 rounded-full flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {customer ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-royal-gradient flex items-center justify-center">
                <span className="font-serif text-cream-50 text-xl font-bold">{customer.name?.slice(0, 2).toUpperCase()}</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">{customer.name}</h3>
              <p className="text-sm text-charcoal-500 mb-6">{customer.email}</p>
              <button
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="btn-primary w-full justify-center"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                        <User className="w-4 h-4" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-4 h-4" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> Delivery Address
                      </label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => update('address', e.target.value)}
                        placeholder="House no, street, area"
                        className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-charcoal-700 mb-1.5 block">Pincode</label>
                      <input
                        type="text"
                        value={form.pincode}
                        onChange={(e) => update('pincode', e.target.value)}
                        placeholder="400001"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
                  {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="text-center mt-4 text-sm text-charcoal-500">
                {mode === 'signin' ? (
                  <>
                    New to Meerav?{' '}
                    <button
                      onClick={() => {
                        setMode('signup');
                        setError('');
                      }}
                      className="text-maroon-700 font-medium hover:underline"
                    >
                      Create an Account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => {
                        setMode('signin');
                        setError('');
                      }}
                      className="text-maroon-700 font-medium hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
