import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, X, Sparkles } from 'lucide-react';
import { PRO_COLORS } from '../constants';
import { playPop, playClick } from '../services/soundEffects';

interface MagicPaletteModalProps {
  showProColors: boolean;
  setShowProColors: (show: boolean) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

const MagicPaletteModal: React.FC<MagicPaletteModalProps> = ({
  showProColors,
  setShowProColors,
  selectedColor,
  setSelectedColor,
}) => {
  return (
    <AnimatePresence>
      {showProColors && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playClick();
              setShowProColors(false);
            }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-6 sm:p-8 border-3 border-[#EBE8DC]"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B6B] via-[#FFD93D] to-[#4D96FF] rounded-2xl flex items-center justify-center shadow-md">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#2D3436] font-display flex items-center gap-1.5">
                    <span>✨ Magic Palette</span>
                  </h2>
                  <span className="text-xs text-[#888] font-bold">50+ special shades</span>
                </div>
              </div>
              <button
                onClick={() => {
                  playClick();
                  setShowProColors(false);
                }}
                className="p-2 rounded-full hover:bg-[#F5F5F5] transition-all cursor-pointer"
              >
                <X className="w-6 h-6 text-[#A0A0A0]" />
              </button>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-7 gap-2.5 max-h-[50vh] overflow-y-auto p-1 no-scrollbar">
              {PRO_COLORS.map((color, idx) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      playPop(400 + (idx % 14) * 30);
                      setSelectedColor(color);
                      setShowProColors(false);
                    }}
                    className={`
                      aspect-square rounded-2xl transition-all transform hover:scale-115 active:scale-90 shadow-sm cursor-pointer relative flex items-center justify-center
                      ${isSelected ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110 shadow-md' : 'border border-black/10'}
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 p-3.5 bg-[#FFFDF0] rounded-2xl border-2 border-[#FFD93D]/40 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD93D]" />
              <p className="text-xs font-bold text-[#633900]">
                Tap any color shade to paint on your canvas!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MagicPaletteModal;