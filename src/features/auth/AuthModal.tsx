import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, CheckCircle2, Cloud, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '@/core/firebase/firebaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function AuthModal({ isOpen, onClose, reason }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Invalid email or password.');
      } else if (msg.includes('email-already-in-use')) {
        setError('An account with this email already exists. Please log in.');
        setIsRegister(false);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white dark:bg-[#131b2e] rounded-2xl p-6 sm:p-8 shadow-2xl border border-(--color-gold)/20 text-(--color-ink) dark:text-(--color-paper)"
        >
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-(--color-slate) hover:text-(--color-ink) dark:hover:text-(--color-paper) p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-(--color-gold)/10 text-(--color-gold) mb-3 border border-(--color-gold)/30">
              <Cloud className="w-6 h-6" />
            </div>
            <h2 className="font-display text-2xl font-bold">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs sm:text-sm text-(--color-slate) mt-1">
              {reason || 'Sync your SM-2 review intervals and study streaks across all your devices.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-(--color-rust)/10 border border-(--color-rust)/30 flex items-start gap-2 text-xs text-(--color-rust)">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-(--color-verdigris)/10 border border-(--color-verdigris)/30 flex items-center gap-2 text-xs text-(--color-verdigris)">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Signed in! Synchronizing your vocabulary ledger...</span>
            </div>
          )}

          {/* Social Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium text-sm disabled:opacity-50 mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white dark:bg-[#131b2e] px-2 text-(--color-slate)">Or email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-(--color-slate) mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-(--color-slate) absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-(--color-slate) mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-(--color-slate) absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account & Sync' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-(--color-slate)">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className="text-(--color-gold) font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            ) : (
              <p>
                New student?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className="text-(--color-gold) font-semibold hover:underline"
                >
                  Create free account
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
