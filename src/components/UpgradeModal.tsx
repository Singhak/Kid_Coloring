/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Crown } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  trialDaysLeft: number | null;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, trialDaysLeft }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-md w-full border-4 border-[#FFD93D]"
          >
            <div className="bg-[#FFD93D] p-8 text-center relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-[#2D3436]" />
              </button>
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
                <Crown className="w-12 h-12 text-[#FFD93D]" />
              </div>
              <h2 className="text-3xl font-black text-[#2D3436] mb-2 uppercase tracking-tight">Unlock Magic!</h2>
              <p className="text-[#2D3436]/80 font-bold">Get unlimited AI drawings & more!</p>
            </div>
            
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                {[
                  { icon: Zap, text: "Unlimited AI Magic Drawings", color: "text-[#FFD93D]" },
                  { icon: Crown, text: "Exclusive Pro Templates", color: "text-[#FF6B6B]" },
                  { icon: Crown, text: "Magic Palette (35+ Extra Colors)", color: "text-[#4D96FF]" },
                  { icon: Crown, text: "Save in High Quality", color: "text-[#6BCB77]" }
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-[#2D3436]">
                    <div className={`p-2 rounded-xl bg-gray-50 ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    {feature.text}
                  </li>
                ))}
              </ul>

              {trialDaysLeft !== null && (
                <div className="mb-6 p-4 bg-[#FFFDF0] rounded-2xl border-2 border-dashed border-[#FFD93D] text-center">
                  <p className="text-sm font-black text-[#FFD93D] uppercase">Free Trial Active</p>
                  <p className="text-lg font-bold text-[#2D3436]">{trialDaysLeft} Days Remaining</p>
                </div>
              )}

              <button
                onClick={onUpgrade}
                className="w-full py-4 bg-[#FFD93D] hover:bg-[#F9CA24] text-[#2D3436] font-black text-xl rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="w-6 h-6" />
                UPGRADE NOW
              </button>
              <p className="text-center mt-4 text-xs font-bold text-[#A0A0A0]">Cancel anytime • Secure payment</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
