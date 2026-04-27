import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, Download, X } from 'lucide-react';

interface UpgradeModalProps {
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  user: any; // Add user prop
  isPro: boolean; // Add isPro prop
  trialEndDate: Date | null; // Add trialEndDate prop
  isSubscribed: boolean; // Add isSubscribed prop
  handleLogin: () => void; // Pass handleLogin directly
  handleSubscribe: () => void; // New prop for subscription action
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  showUpgradeModal,
  setShowUpgradeModal,
  user,
  isPro,
  trialEndDate,
  isSubscribed,
  handleLogin,
  handleSubscribe,
}) => {
  const now = new Date();
  const isTrialActive = trialEndDate && trialEndDate.getTime() > now.getTime();
  const daysRemaining = trialEndDate ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  let title = "Unlock Magic!";
  let description = "Login to unlock AI magic, extra colors, and save your masterpieces!";
  let actionButtonText = "Login with Google";
  let actionButtonOnClick: () => void = handleLogin; // Explicitly type to avoid TS error with conditional assignment
  let showFeatures = true;
  let showFreeForLoggedIn = true;

  if (user) {
    showFreeForLoggedIn = false; // Already logged in
    if (isSubscribed) {
      title = "You're a Magic Explorer!";
      description = "All features are unlocked. Thank you for your support!";
      actionButtonText = "Continue Coloring";
      actionButtonOnClick = () => setShowUpgradeModal(false);
      showFeatures = false;
    } else if (isTrialActive) {
      title = `Trial Active! ${daysRemaining} Days Left`;
      description = "Enjoy all Pro features during your trial. Subscribe to keep the magic going!";
      actionButtonText = "Subscribe Now";
      actionButtonOnClick = handleSubscribe;
    } else {
      title = "Trial Expired!";
      description = "Your 15-day trial has ended. Subscribe to continue using Pro features!";
      actionButtonText = "Subscribe Now";
      actionButtonOnClick = handleSubscribe;
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
            onClick={() => setShowUpgradeModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F5F5F5] transition-all"
            >
              <X className="w-6 h-6 text-[#A0A0A0]" />
            </button>

            <div className="p-8 pt-12 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FFD93D] to-[#FF9248] rounded-3xl flex items-center justify-center shadow-xl mb-6 transform -rotate-6">
                <Crown className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-3xl font-black text-[#2D3436] mb-2">
                {title}
              </h2>
              <p className="text-[#5A5A5A] font-medium mb-8">
                {description}
              </p>

              {showFeatures && (
                <div className="w-full space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-[#FDFCF0] rounded-2xl border-2 border-[#FFD93D]/30">
                  <div className="w-10 h-10 bg-[#FFD93D] rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-sm text-[#2D3436]">Unlimited Magic</span>
                    <span className="text-xs text-[#A0A0A0]">AI creates unique drawings for you</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-[#FDFCF0] rounded-2xl border-2 border-[#6BCB77]/30">
                  <div className="w-10 h-10 bg-[#6BCB77] rounded-xl flex items-center justify-center shrink-0">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-sm text-[#2D3436]">Save Masterpieces</span>
                    <span className="text-xs text-[#A0A0A0]">Download your art as high-quality PNG</span>
                  </div>
                </div>
              </div>
              )}

              <button
                onClick={actionButtonOnClick}
                className="w-full py-5 bg-[#FF6B6B] text-white font-black text-xl rounded-2xl shadow-lg hover:bg-[#FF5252] transition-all active:scale-95 mb-4"
              >
                {actionButtonText}
              </button>
              {showFreeForLoggedIn && (
                <p className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-widest">
                Login with Google to start your 15-day free trial!
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