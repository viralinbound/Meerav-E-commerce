import { useState, type FormEvent } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAdminAuth } from './useAdminAuth';

export function AdminLogin() {
  const { signIn, error } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      // error already surfaced via context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-royal-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-cream-50 rounded-2xl shadow-2xl border border-saffron-400/30 overflow-hidden">
        <div className="bg-maroon-900 px-8 py-8 text-center border-b-4 border-saffron-500">
          <img src="/images/meerav_logo.png" alt="Meerav" className="h-16 w-auto object-contain mx-auto mb-3" />
          <h1 className="font-serif text-2xl font-bold text-cream-50">Meerav Admin</h1>
          <p className="text-cream-300 text-sm mt-1">Bikaner Kitchen Dispatch Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@meerav.com"
                className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors bg-white"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-maroon-700 text-cream-50 font-semibold rounded-lg hover:bg-maroon-800 transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Authorizing…' : 'Sign In to Admin Panel'}
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>

          <a href="/" className="block text-center text-sm text-charcoal-500 hover:text-maroon-700 transition-colors">
            ← Return to Storefront
          </a>
        </form>
      </div>
    </div>
  );
}
