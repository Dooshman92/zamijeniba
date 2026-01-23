import { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type ViewMode = 'login' | 'register' | 'forgot-password';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export function AuthModal({ onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  useEffect(() => {
    if (mode === 'register' && recaptchaRef.current && window.grecaptcha) {
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

      if (siteKey && siteKey !== 'your_recaptcha_site_key_here') {
        const renderRecaptcha = () => {
          if (recaptchaWidgetId.current === null) {
            recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
              sitekey: siteKey,
              callback: (token: string) => setRecaptchaToken(token),
              'expired-callback': () => setRecaptchaToken('')
            });
          }
        };

        if (window.grecaptcha.ready) {
          window.grecaptcha.ready(renderRecaptcha);
        } else {
          setTimeout(renderRecaptcha, 100);
        }
      }
    }

    return () => {
      if (recaptchaWidgetId.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(recaptchaWidgetId.current);
        } catch (e) {
          // Ignore error
        }
        recaptchaWidgetId.current = null;
      }
    };
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'forgot-password') {
      setLoading(true);
      const { error } = await resetPassword(email);
      setLoading(false);

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Link za resetovanje lozinke je poslat na vaš email.');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 3000);
      }
      return;
    }

    if (mode === 'register') {
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
      if (siteKey && siteKey !== 'your_recaptcha_site_key_here' && !recaptchaToken) {
        setError('Molimo potvrdite da niste robot');
        return;
      }
    }

    setLoading(true);

    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (mode === 'register') {
        setSuccess('Registracija uspješna! Provjerite email za potvrdu naloga.');
        setLoading(false);
      } else {
        onClose();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Prijava' : mode === 'register' ? 'Registracija' : 'Resetuj lozinku'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-100 text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg text-sm bg-green-100 text-green-800">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {mode === 'login' ? 'Email ili nadimak' : 'Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mode === 'login' ? 'text' : 'email'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={mode === 'login' ? 'vas@email.com ili nadimak' : 'vas@email.com'}
              />
            </div>
          </div>

          {mode !== 'forgot-password' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lozinka
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              {mode === 'register' && (
                <p className="mt-1 text-xs text-gray-500">Minimalno 6 karaktera</p>
              )}
            </div>
          )}

          {mode === 'register' && import.meta.env.VITE_RECAPTCHA_SITE_KEY !== 'your_recaptcha_site_key_here' && (
            <div className="flex justify-center">
              <div ref={recaptchaRef}></div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Učitavanje...' : mode === 'login' ? 'Prijavi se' : mode === 'register' ? 'Registruj se' : 'Pošalji link'}
          </button>

          {mode === 'login' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot-password');
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Zaboravili ste lozinku?
              </button>
            </div>
          )}

          {mode !== 'forgot-password' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ili</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {mode === 'login' ? 'Prijavi se' : 'Registruj se'} sa Google
              </button>
            </>
          )}

          <div className="text-center">
            {mode === 'forgot-password' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Nazad na prijavu
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === 'login'
                  ? 'Nemate nalog? Registrujte se'
                  : 'Vec imate nalog? Prijavite se'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
