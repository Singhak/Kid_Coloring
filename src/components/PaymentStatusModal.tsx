import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChime, playPop, playClick } from '../services/soundEffects';

export type PaymentModalStatus = 'idle' | 'verifying' | 'pending' | 'success' | 'failed';

export interface PaymentStatusModalProps {
  isOpen: boolean;
  status: PaymentModalStatus;
  planName?: string;
  orderId?: string;
  errorMessage?: string;
  onClose: () => void;
  onRetry?: () => void;
  onCheckStatus?: () => void;
}

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  status,
  planName = 'VIP Magic Pass',
  orderId,
  errorMessage,
  onClose,
  onRetry,
  onCheckStatus,
}) => {
  useEffect(() => {
    if (status === 'success') {
      playChime();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#FFD93D', '#4D96FF', '#6BCB77', '#FF6B6B', '#A55EEA'],
      });
    } else if (status === 'failed') {
      playPop(180);
    }
  }, [status]);

  if (!isOpen || status === 'idle') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={status === 'verifying' ? undefined : onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-[#FFF2B2] p-6 sm:p-8 z-10 text-center"
        >
          {/* Close button (allowed only if not in verifying state) */}
          {status !== 'verifying' && (
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[#888] cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* State 1: VERIFYING */}
          {status === 'verifying' && (
            <div className="py-4 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFF8D6] flex items-center justify-center text-[#F59E0B] shadow-inner relative">
                <RefreshCw className="w-10 h-10 animate-spin text-[#F59E0B]" />
                <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-[#FFD93D] fill-current animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2D3436] font-display">
                Verifying Payment...
              </h3>
              <p className="text-xs sm:text-sm text-[#636E72] font-semibold">
                Connecting securely with Cashfree & your bank. Please do not close or refresh this window.
              </p>
              {orderId && (
                <span className="inline-block text-[11px] font-mono text-[#888] bg-[#F7F5EC] px-3 py-1 rounded-full border border-[#EBE8DC]">
                  Order: {orderId}
                </span>
              )}
            </div>
          )}

          {/* State 2: PENDING (Waiting for UPI App) */}
          {status === 'pending' && (
            <div className="py-3 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shadow-inner relative">
                <Clock className="w-10 h-10 animate-pulse text-[#D97706]" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#F59E0B] rounded-full border-2 border-white animate-ping" />
              </div>

              <div>
                <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#B45309] bg-[#FDE68A] px-3 py-0.5 rounded-full mb-1">
                  Awaiting Approval
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#2D3436] font-display">
                  Complete on Your Phone
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#636E72] font-semibold leading-relaxed">
                We sent a payment request to your UPI app (Google Pay, PhonePe, or Paytm). Please approve the payment to unlock VIP superpowers.
              </p>

              <div className="bg-[#FFFBF0] border border-[#FDE68A] p-3 rounded-2xl text-xs text-[#854D0E] font-medium flex items-center gap-2 text-left">
                <ShieldCheck className="w-5 h-5 shrink-0 text-[#10B981]" />
                <span>We are auto-checking with the bank. You can also tap below to check right now.</span>
              </div>

              {onCheckStatus && (
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    onCheckStatus();
                  }}
                  className="btn-bubbly w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Check Status Now</span>
                </button>
              )}
            </div>
          )}

          {/* State 3: SUCCESS */}
          {status === 'success' && (
            <div className="py-3 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.15, 1] }}
                transition={{ duration: 0.4 }}
                className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#FFD93D] to-[#FF9F43] flex items-center justify-center text-white shadow-lg relative"
              >
                <Crown className="w-11 h-11 fill-current drop-shadow-md" />
                <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-[#FFF] fill-current animate-spin-slow" />
              </motion.div>

              <div>
                <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#15803D] bg-[#DCFCE7] px-3 py-0.5 rounded-full mb-1">
                  VIP Activated!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#2D3436] font-display">
                  Welcome to Coloro VIP! 🌟
                </h3>
              </div>

              <div className="bg-[#F0FDF4] border border-[#86EFAC] p-3 rounded-2xl text-xs sm:text-sm text-[#166534] font-bold space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#15803D]">Plan:</span>
                  <span className="text-[#14532D] font-black">{planName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#15803D]/80">
                  <span>Status:</span>
                  <span className="font-bold">Superpowers Unlocked ✨</span>
                </div>
              </div>

              <p className="text-xs text-[#636E72] font-semibold">
                Photo-to-Art, Magic AI Prompts, Glitter Fills, and HD Printable sheets are now all unlocked for you!
              </p>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  onClose();
                }}
                className="btn-bubbly w-full py-3.5 bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-black text-base rounded-2xl shadow-xl hover:brightness-105 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start Creating Magic! 🎨</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* State 4: FAILED */}
          {status === 'failed' && (
            <div className="py-3 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] shadow-inner">
                <AlertCircle className="w-11 h-11" />
              </div>

              <div>
                <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#B91C1C] bg-[#FEE2E2] px-3 py-0.5 rounded-full mb-1">
                  Payment Incomplete
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#2D3436] font-display">
                  Payment Not Completed
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#636E72] font-semibold">
                {errorMessage || 'The payment was cancelled or could not be processed by your bank.'}
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    onClose();
                  }}
                  className="flex-1 py-3 bg-[#F7F5EC] hover:bg-[#EBE8DC] text-[#636E72] font-bold rounded-2xl text-xs sm:text-sm cursor-pointer transition-all"
                >
                  Close
                </button>
                {onRetry && (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      onRetry();
                    }}
                    className="flex-2 py-3 bg-[#FF6B6B] hover:bg-[#EE5253] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentStatusModal;
