import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, Download, X, Palette, CheckCircle2 } from 'lucide-react';
import { playChime, playClick } from '../services/soundEffects';

interface UpgradeModalProps {
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  user: any;
  isPro: boolean;
  trialEndDate: Date | null;
  isSubscribed: boolean;
  handleLogin: () => void;
  handleSubscribe: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  showUpgradeModal,
  setShowUpgradeModal,
  user,
  trialEndDate,
  isSubscribed,
  handleLogin,
  handleSubscribe,
}) => {
  const now = new Date();
  const isTrialActive = trialEndDate && trialEndDate.getTime() > now.getTime();
  const daysRemaining = trialEndDate ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  useEffect(() => {
    if (showUpgradeModal) {
      playChime();
    }
  }, [showUpgradeModal]);

  let title = "Unlock Magic Studio!";
  let description = "Get unlimited AI magic drawings, 50+ vibrant pro colors, and high-res art saving!";
  let actionButtonText = "Sign In & Start 15-Day Free Trial";
  let actionButtonOnClick: () => void = handleLogin;
  let showFeatures = true;
  let showFreeForLoggedIn = true;

  if (user) {
    showFreeForLoggedIn = false;
    if (isSubscribed) {
      title = "You're a Magic VIP Explorer! 🌟";
      description = "All magical features and unlimited drawing tools are completely unlocked.";
      actionButtonText = "Continue Coloring";
      actionButtonOnClick = () => {
        playClick();
        setShowUpgradeModal(false);
      };
      showFeatures = false;
    } else if (isTrialActive) {
      title = `Trial Active! ${daysRemaining} Days Left ✨`;
      description = "Enjoy all VIP features during your free trial. Subscribe to keep the magic forever!";
      actionButtonText = "Subscribe to Magic VIP Pass";
      actionButtonOnClick = () => {
        playClick();
        handleSubscribe();
      };
    } else {
      title = "Free Trial Ended";
      description = "Your 15-day free trial has completed. Subscribe to continue using Magic Studio features!";
      actionButtonText = "Subscribe Now";
      actionButtonOnClick = () => {
        playClick();
        handleSubscribe();
      };
    }
  }

  return (
    <AnimatePresence>
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playClick();
              setShowUpgradeModal(false);
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-[#FFF3C4]"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                playClick();
                setShowUpgradeModal(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F5F5F5] transition-all z-10 cursor-pointer"
            >
              <X className="w-6 h-6 text-[#A0A0A0]" />
            </button>

            {/* Glowing top banner background */}
            <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[#FFF8D6] to-white pointer-events-none" />

            <div className="p-7 pt-10 flex flex-col items-center text-center relative z-10">
              {/* Crown Emblem */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFD93D] to-[#FFA801] rounded-3xl flex items-center justify-center shadow-xl mb-4 transform -rotate-6 border-4 border-white">
                <Crown className="w-10 h-10 text-white fill-current" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#2D3436] font-display mb-1.5">
                {title}
              </h2>
              <p className="text-[#636E72] font-medium text-xs sm:text-sm mb-6 max-w-xs">
                {description}
              </p>

              {showFeatures && (
                <div className="w-full space-y-2.5 mb-6 text-left">
                  <div className="flex items-center gap-3.5 p-3.5 bg-[#FFFDF0] rounded-2xl border-2 border-[#FFD93D]/40 shadow-xs">
                    <div className="w-10 h-10 bg-[#FFD93D] rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block font-black text-xs sm:text-sm text-[#2D3436]">Unlimited AI Magic Drawings</span>
                      <span className="text-[11px] text-[#7F8C8D]">Ask AI to draw any character, animal, or scene</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-[#6BCB77] shrink-0" />
                  </div>

                  <div className="flex items-center gap-3.5 p-3.5 bg-[#F8FFF9] rounded-2xl border-2 border-[#6BCB77]/30 shadow-xs">
                    <div className="w-10 h-10 bg-[#6BCB77] rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white">
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block font-black text-xs sm:text-sm text-[#2D3436]">HD Masterpiece Downloads</span>
                      <span className="text-[11px] text-[#7F8C8D]">Export & print vibrant coloring sheets</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-[#6BCB77] shrink-0" />
                  </div>

                  <div className="flex items-center gap-3.5 p-3.5 bg-[#F0F8FF] rounded-2xl border-2 border-[#4D96FF]/30 shadow-xs">
                    <div className="w-10 h-10 bg-[#4D96FF] rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block font-black text-xs sm:text-sm text-[#2D3436]">50+ Magic Pro Palette Colors</span>
                      <span className="text-[11px] text-[#7F8C8D]">Pastels, skin tones, neons, and earth shades</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-[#6BCB77] shrink-0" />
                  </div>
                </div>
              )}

              <button
                onClick={actionButtonOnClick}
                className="btn-bubbly w-full py-4 bg-gradient-to-r from-[#FF6B6B] via-[#FA8231] to-[#FFD93D] text-white font-black text-base sm:text-lg rounded-2xl shadow-xl hover:brightness-105 transition-all active:scale-95 mb-3 cursor-pointer"
              >
                {actionButtonText}
              </button>

              {showFreeForLoggedIn && (
                <p className="text-[11px] text-[#95A5A6] font-bold">
                  🔒 Parent friendly • 15 days completely free trial
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;