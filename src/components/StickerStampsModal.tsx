import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Crown, Smile } from 'lucide-react';
import { playClick, playPop, playChime } from '../services/soundEffects';

export interface StickerItem {
  id: string;
  emoji: string;
  name: string;
  category: 'magic' | 'fashion' | 'fun' | 'animals';
  isVip?: boolean;
}

export const STICKERS: StickerItem[] = [
  { id: 'crown', emoji: '👑', name: 'Golden Crown', category: 'magic', isVip: false },
  { id: 'star', emoji: '⭐', name: 'Glowing Star', category: 'magic', isVip: false },
  { id: 'sparkles', emoji: '✨', name: 'Magic Sparkles', category: 'magic', isVip: false },
  { id: 'heart', emoji: '💖', name: 'Sparkle Heart', category: 'magic', isVip: false },
  { id: 'sunglasses', emoji: '🕶️', name: 'Cool Sunglasses', category: 'fashion', isVip: true },
  { id: 'bow', emoji: '🎀', name: 'Pink Bow', category: 'fashion', isVip: false },
  { id: 'unicorn_horn', emoji: '🦄', name: 'Unicorn Horn', category: 'magic', isVip: true },
  { id: 'balloon', emoji: '🎈', name: 'Party Balloon', category: 'fun', isVip: false },
  { id: 'flower', emoji: '🌸', name: 'Cherry Blossom', category: 'fun', isVip: false },
  { id: 'dino_paw', emoji: '🦖', name: 'Dino Friend', category: 'animals', isVip: true },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream Cone', category: 'fun', isVip: false },
  { id: 'rocket', emoji: '🚀', name: 'Space Rocket', category: 'fun', isVip: true },
  { id: 'butterfly', emoji: '🦋', name: 'Magic Butterfly', category: 'animals', isVip: true },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow Cloud', category: 'magic', isVip: true },
  { id: 'diamond', emoji: '💎', name: 'Shining Gem', category: 'magic', isVip: true },
  { id: 'lollipop', emoji: '🍭', name: 'Sweet Lollipop', category: 'fun', isVip: false },
];

interface StickerStampsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  selectedSticker: StickerItem | null;
  onSelectSticker: (sticker: StickerItem | null) => void;
  setShowUpgradeModal: (show: boolean) => void;
}

const StickerStampsModal: React.FC<StickerStampsModalProps> = ({
  isOpen,
  onClose,
  isPro,
  selectedSticker,
  onSelectSticker,
  setShowUpgradeModal,
}) => {
  useEffect(() => {
    if (isOpen) {
      playChime();
    }
  }, [isOpen]);

  const handlePick = (sticker: StickerItem) => {
    if (sticker.isVip && !isPro) {
      setShowUpgradeModal(true);
      return;
    }
    playPop();
    onSelectSticker(sticker);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playClick();
              onClose();
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-6 border-4 border-[#FF6B6B]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-[#FF6B6B] to-[#FFA801] rounded-2xl flex items-center justify-center shadow-md rotate-3 text-white text-2xl">
                  <Smile className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#2D3436] tracking-tight font-display">
                    Magical Sticker Stamps
                  </h2>
                  <p className="text-xs font-bold text-[#888]">
                    Tap a sticker, then tap anywhere on your drawing!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="p-2 rounded-full hover:bg-[#F5F5F5] transition-all cursor-pointer"
              >
                <X className="w-6 h-6 text-[#A0A0A0]" />
              </button>
            </div>

            {/* Sticker Grid */}
            <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 no-scrollbar">
              {STICKERS.map((sticker) => {
                const isSelected = selectedSticker?.id === sticker.id;
                return (
                  <button
                    key={sticker.id}
                    onClick={() => handlePick(sticker)}
                    className={`relative p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-[#FF6B6B] bg-[#FFF0F0] shadow-md ring-2 ring-[#FF6B6B]/30'
                        : 'border-[#EBE8DC] bg-[#FAF9F5] hover:border-[#FFD93D] hover:bg-white'
                    }`}
                  >
                    <span className="text-3xl filter drop-shadow-sm select-none">
                      {sticker.emoji}
                    </span>
                    <span className="text-[10px] font-bold text-[#555] truncate max-w-full text-center">
                      {sticker.name}
                    </span>

                    {sticker.isVip && !isPro && (
                      <div className="absolute top-1 right-1 bg-[#FFD93D] text-[#7A4B00] p-0.5 rounded-full shadow-xs">
                        <Crown className="w-2.5 h-2.5 fill-current" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clear Stamp Mode */}
            {selectedSticker && (
              <div className="mt-4 pt-3 border-t border-[#EBE8DC] flex justify-center">
                <button
                  onClick={() => {
                    playPop();
                    onSelectSticker(null);
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#F7F5EC] hover:bg-[#EFECE0] text-[#FF6B6B] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Clear Active Stamp (Back to Fill)
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StickerStampsModal;
