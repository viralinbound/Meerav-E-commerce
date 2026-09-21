import { useState, type FormEvent } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, HelpCircle, X } from 'lucide-react';
import { useAdminAuth } from './useAdminAuth';

function friendlyLoginError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return "That email and password don't match our records. Double-check for typos, or use \"Forgot password?\" below.";
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
  const [showForgot, setShowForgot] = useState(false);

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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-charcoal-700">Password</label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-xs font-medium text-maroon-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
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

      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForgot(false)} />
          <div className="relative bg-cream-50 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="bg-maroon-800 text-cream-50 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-serif text-lg font-bold">Forgot Password?</h3>
              </div>
              <button
                onClick={() => setShowForgot(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-charcoal-600">
                For security, admin passwords can only be reset by the <span className="font-semibold">root admin</span> —
                there's no self-service reset link.
              </p>
              <p className="text-sm text-charcoal-600">
                Ask your root admin to open <span className="font-semibold">Admin Accounts</span> and use{' '}
                <span className="font-semibold">Reset Password</span> on your account. They'll share a new temporary
                password with you, and you'll be asked to set your own the next time you sign in.
              </p>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full px-6 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold bg-maroon-700 text-cream-50 hover:bg-maroon-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
