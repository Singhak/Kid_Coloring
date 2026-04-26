import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, Download, X } from 'lucide-react';

interface UpgradeModalProps {
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  handleUpgrade: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  showUpgradeModal,
  setShowUpgradeModal,
  handleUpgrade,
}) => {
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
                Unlock Magic!
              </h2>
              <p className="text-[#5A5A5A] font-medium mb-8">
                Login to unlock AI magic, extra colors, and save your masterpieces!
              </p>

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

              <button
                onClick={handleUpgrade}
                className="w-full py-5 bg-[#FF6B6B] text-white font-black text-xl rounded-2xl shadow-lg hover:bg-[#FF5252] transition-all active:scale-95 mb-4"
              >
                Login with Google
              </button>
              <p className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-widest">
                Completely free for logged-in users!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;