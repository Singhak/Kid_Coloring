import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, Loader2, ArrowLeft } from 'lucide-react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../firebase';
import { requestEmailOtp, verifyEmailOtp, ApiError } from '../services/authService';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onGoogleLogin }) => {
  const [step, setStep] = useState<'choose' | 'email' | 'code'>('choose');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('choose');
      setCode('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!isOpen) return null;

  const sendCode = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await requestEmailOtp(email.trim());
      setCooldown(res.cooldown || 45);
      setStep('code');
    } catch (e) {
      const err = e as ApiError;
      if (err.retryAfter) setCooldown(err.retryAfter);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await verifyEmailOtp(email.trim(), code);
      await signInWithCustomToken(auth, res.token);
      onClose();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-2xl border-2 border-[#E8E4FF] focus:border-[#4D96FF] outline-none font-bold text-[#2D3436] text-center';
  const primaryBtn =
    'w-full py-3 rounded-2xl bg-[#4D96FF] text-white font-black disabled:opacity-50 flex items-center justify-center gap-2';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6"
        >
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-black text-[#2D3436] text-center">Sign in to Coloro</h2>
          <p className="text-xs font-bold text-gray-500 text-center mt-1 mb-5">Your 15-day free trial starts on your first sign in</p>

          {step === 'choose' && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  onClose();
                  onGoogleLogin();
                }}
                className="w-full py-3 rounded-2xl border-2 border-[#E8E4FF] font-black text-[#2D3436] flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
                </svg>
                Continue with Google
              </button>
              <button onClick={() => setStep('email')} className={primaryBtn}>
                <Mail className="w-5 h-5" /> Continue with Email code
              </button>
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-3">
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && email && !busy && sendCode()}
                placeholder="you@example.com"
                className={inputClass}
              />
              <button onClick={sendCode} disabled={busy || !email.includes('@')} className={primaryBtn}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Send code
              </button>
              <button onClick={() => setStep('choose')} className="w-full text-xs font-bold text-gray-500 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Other options
              </button>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-600 text-center">
                We sent a 6-digit code to <span className="text-[#2D3436]">{email}</span>
              </p>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && !busy && verify()}
                placeholder="------"
                className={`${inputClass} tracking-[0.5em] text-xl`}
              />
              <button onClick={verify} disabled={busy || code.length !== 6} className={primaryBtn}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Verify & sign in
              </button>
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <button onClick={() => setStep('email')} className="flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Change email
                </button>
                <button onClick={sendCode} disabled={busy || cooldown > 0} className="disabled:opacity-50">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-xs font-bold text-[#FF6B6B] text-center">{error}</p>}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
