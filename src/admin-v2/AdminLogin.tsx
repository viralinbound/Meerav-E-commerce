import { useState, type FormEvent } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from './useAdminAuth';

function friendlyLoginError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return "That email and password don't match our records. Double-check for typos, or ask the root admin to reset your password.";
  }
  if (msg.includes('not registered as an admin')) {
    return "This email isn't set up as an admin account. Ask the root admin to register you first.";
  }
  if (msg.includes('banned')) {
    return 'This admin account has been banned. Contact the root admin to be reinstated.';
  }
  if (msg.includes('email not confirmed')) {
    return 'This account still needs email confirmation. Contact the root admin for help.';
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Too many attempts in a row. Wait a minute and try again.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return "Couldn't reach the server. Check your internet connection and try again.";
  }
  return raw || 'Could not sign in. Please try again.';
}

export function AdminLogin() {
  const { signIn, error } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full pl-10 pr-11 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-maroon-700 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {friendlyLoginError(error)}
            </p>
          )}

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
