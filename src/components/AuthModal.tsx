import { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';

interface PasswordStrength {
  label: string;
  color: string;
  score: number; // 0-4
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', score: 1 };
  if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', score: 2 };
  if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', score: 3 };
  return { label: 'Strong', color: 'bg-green-600', score: 4 };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const strength = getPasswordStrength(password);
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-cream-300'}`}
          />
        ))}
      </div>
      <p className="text-xs text-charcoal-500 mt-1">Password strength: {strength.label}</p>
    </div>
  );
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { customer, signIn, signUp, signOut, resendConfirmationEmail, sendPasswordReset, updatePassword, passwordRecovery, clearPasswordRecovery } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', password: '' });
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const effectiveMode: Mode = passwordRecovery ? 'reset' : mode;

  if (!isOpen && !passwordRecovery) return null;

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await sendPasswordReset(form.email);
    setBusy(false);
    if (res.error) {
      setError(res.error.message || 'Could not send reset email. Please try again.');
    } else {
      setResetSent(true);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('Passwords don’t match.');
      return;
    }
    setBusy(true);
    const res = await updatePassword(newPassword);
    setBusy(false);
    if (res.error) {
      setError(res.error.message || 'Could not update password. Please try again.');
    } else {
      setResetDone(true);
    }
  }

  function handleClose() {
    setMode('signin');
    setError('');
    setResendStatus('');
    setNeedsConfirmation(false);
    setResetSent(false);
    setResetDone(false);
    setNewPassword('');
    setNewPasswordConfirm('');
    setPasswordConfirm('');
    clearPasswordRecovery();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResendStatus('');
    setNeedsConfirmation(false);
    if (mode === 'signup' && form.password !== passwordConfirm) {
      setError('Passwords don’t match.');
      return;
    }
    setBusy(true);
    const res = mode === 'signin' ? await signIn(form.email, form.password) : await signUp(form);
    setBusy(false);
    if (res.error) {
      const message: string = res.error.message || 'Something went wrong. Please try again.';
      if (/email.*not.*confirmed/i.test(message)) {
        setError('Your email address hasn’t been confirmed yet.');
        setNeedsConfirmation(true);
      } else {
        setError(message);
      }
    } else if (res.needsConfirmation) {
      setError('Check your email to confirm your account, then sign in.');
      setMode('signin');
    } else {
      onClose();
    }
  }

  async function handleResend() {
    setResendStatus('');
    setBusy(true);
    const res = await resendConfirmationEmail(form.email);
    setBusy(false);
    setResendStatus(res.error ? res.error.message || 'Could not resend email.' : 'Confirmation email sent — check your inbox.');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-charcoal-900/70 backdrop-blur-sm" onClick={effectiveMode === 'reset' ? undefined : handleClose} />

      <div className="relative bg-cream-50 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-maroon-800 text-cream-50 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-serif text-xl font-bold">
            {customer && effectiveMode !== 'reset'
              ? 'Your Account'
              : effectiveMode === 'signin'
              ? 'Sign In'
              : effectiveMode === 'signup'
              ? 'Create Account'
              : effectiveMode === 'forgot'
              ? 'Reset Password'
              : 'Set New Password'}
          </h2>
          {effectiveMode !== 'reset' && (
            <button onClick={handleClose} className="w-9 h-9 hover:bg-maroon-700 rounded-full flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {effectiveMode === 'reset' ? (
            resetDone ? (
              <div className="text-center">
                <p className="text-charcoal-700 mb-6">Your password has been updated.</p>
                <button onClick={handleClose} className="btn-primary w-full justify-center">
                  Continue
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-sm text-charcoal-500">Choose a new password for your account.</p>
                <div>
                  <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
                  {busy ? 'Please wait…' : 'Update Password'}
                </button>
              </form>
            )
          ) : effectiveMode === 'forgot' ? (
            resetSent ? (
              <div className="text-center">
                <p className="text-charcoal-700 mb-6">
                  If an account exists for <span className="font-medium">{form.email}</span>, a password reset link has been sent.
                </p>
                <button
                  onClick={() => {
                    setMode('signin');
                    setResetSent(false);
                  }}
                  className="btn-primary w-full justify-center"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-sm text-charcoal-500">Enter your account email and we’ll send you a link to reset your password.</p>
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
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
                  {busy ? 'Please wait…' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  className="block mx-auto text-sm text-maroon-700 font-medium hover:underline"
                >
                  Back to Sign In
                </button>
              </form>
            )
          ) : customer ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-royal-gradient flex items-center justify-center">
                <span className="font-serif text-cream-50 text-xl font-bold">{customer.name?.slice(0, 2).toUpperCase()}</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">{customer.name}</h3>
              <p className="text-sm text-charcoal-500 mb-6">{customer.email}</p>
              <button
                onClick={() => {
                  signOut();
                  handleClose();
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-charcoal-700 mb-1.5 block">City</label>
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => update('city', e.target.value)}
                          placeholder="Mumbai"
                          className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-charcoal-700 mb-1.5 block">State</label>
                        <input
                          type="text"
                          value={form.state}
                          onChange={(e) => update('state', e.target.value)}
                          placeholder="Maharashtra"
                          className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                        />
                      </div>
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
                    minLength={8}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                  />
                  {mode === 'signup' && <PasswordStrengthMeter password={form.password} />}
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError('');
                      }}
                      className="mt-1.5 text-xs text-maroon-700 font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" /> Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                    />
                    {passwordConfirm && passwordConfirm !== form.password && (
                      <p className="text-xs text-red-600 mt-1">Passwords don’t match.</p>
                    )}
                  </div>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}
                {needsConfirmation && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={busy}
                    className="text-sm text-maroon-700 font-medium hover:underline"
                  >
                    Resend confirmation email
                  </button>
                )}
                {resendStatus && <p className="text-sm text-charcoal-500">{resendStatus}</p>}

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
