import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, X } from 'lucide-react';
import { PRO_COLORS } from '../constants';

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
            onClick={() => setShowProColors(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B6B] to-[#4D96FF] rounded-xl flex items-center justify-center shadow-md">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-black text-[#2D3436]">Magic Palette</h2>
              </div>
              <button
                onClick={() => setShowProColors(false)}
                className="p-2 rounded-full hover:bg-[#F5F5F5] transition-all"
              >
                <X className="w-6 h-6 text-[#A0A0A0]" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {PRO_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setShowProColors(false);
                  }}
                  className={`
                    aspect-square rounded-2xl transition-all transform hover:scale-110 active:scale-90 shadow-sm
                    ${selectedColor === color ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border border-black/5'}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="mt-8 p-4 bg-[#FDFCF0] rounded-2xl border-2 border-[#FFD93D]/30 text-center">
              <p className="text-xs font-bold text-[#5A5A5A]">
                Pick a magic color to start your masterpiece!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MagicPaletteModal;