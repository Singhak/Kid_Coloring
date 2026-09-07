import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Smile, Sparkles } from 'lucide-react';
import { playClick, playPop, playChime } from '../services/soundEffects';

export type StickerCategory = 'all' | 'faces' | 'magic' | 'fun' | 'animals' | 'fashion';

export interface StickerItem {
  id: string;
  emoji: string;
  name: string;
  category: 'faces' | 'magic' | 'fashion' | 'fun' | 'animals';
  isVip?: boolean;
}

export const STICKER_CATEGORIES: { id: StickerCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🌟' },
  { id: 'faces', label: 'Faces', icon: '😊' },
  { id: 'magic', label: 'Magic', icon: '✨' },
  { id: 'fun', label: 'Fun', icon: '🎈' },
  { id: 'animals', label: 'Animals', icon: '🐾' },
  { id: 'fashion', label: 'Style', icon: '🎀' },
];

export const STICKERS: StickerItem[] = [
  // ===================== FACES (FREE & PRO) =====================
  // Free Faces
  { id: 'face_smile', emoji: '😊', name: 'Happy Smile', category: 'faces', isVip: false },
  { id: 'face_grin', emoji: '😀', name: 'Big Grin', category: 'faces', isVip: false },
  { id: 'face_laugh_cry', emoji: '😂', name: 'Laugh Cry', category: 'faces', isVip: false },
  { id: 'face_loud_cry', emoji: '😭', name: 'Cry Baby', category: 'faces', isVip: false },
  { id: 'face_sad_tear', emoji: '😢', name: 'Sad Tear', category: 'faces', isVip: false },
  { id: 'face_giggle', emoji: '😆', name: 'Giggle Face', category: 'faces', isVip: false },
  { id: 'face_silly_wink', emoji: '😜', name: 'Crazy Wink', category: 'faces', isVip: false },
  { id: 'face_yummy', emoji: '😋', name: 'Yum Yum', category: 'faces', isVip: false },
  { id: 'face_heart_eyes', emoji: '😍', name: 'Heart Eyes', category: 'faces', isVip: false },
  { id: 'face_cool', emoji: '😎', name: 'Cool Shades', category: 'faces', isVip: false },
  { id: 'face_cheeky_wink', emoji: '😉', name: 'Cheeky Wink', category: 'faces', isVip: false },
  { id: 'face_hug', emoji: '🤗', name: 'Warm Hug', category: 'faces', isVip: false },
  { id: 'face_sleepy', emoji: '😴', name: 'Sleepy Zzz', category: 'faces', isVip: false },
  { id: 'face_surprised', emoji: '😮', name: 'Surprised', category: 'faces', isVip: false },
  { id: 'face_cat_smile', emoji: '😸', name: 'Happy Kitty', category: 'faces', isVip: false },

  // Pro Faces
  { id: 'face_rofl', emoji: '🤣', name: 'ROFL Laugh', category: 'faces', isVip: true },
  { id: 'face_puppy_eyes', emoji: '🥺', name: 'Puppy Eyes', category: 'faces', isVip: true },
  { id: 'face_touched', emoji: '🥹', name: 'Touched Tears', category: 'faces', isVip: true },
  { id: 'face_goofy', emoji: '🤪', name: 'Goofy Silly', category: 'faces', isVip: true },
  { id: 'face_sweet_hearts', emoji: '🥰', name: 'Love Hug', category: 'faces', isVip: true },
  { id: 'face_party', emoji: '🥳', name: 'Party Time', category: 'faces', isVip: true },
  { id: 'face_star_eyes', emoji: '🤩', name: 'Star Eyes', category: 'faces', isVip: true },
  { id: 'face_angel', emoji: '😇', name: 'Sweet Angel', category: 'faces', isVip: true },
  { id: 'face_blow_kiss', emoji: '😘', name: 'Blow Kiss', category: 'faces', isVip: true },
  { id: 'face_mind_blown', emoji: '🤯', name: 'Mind Blown', category: 'faces', isVip: true },
  { id: 'face_cowboy', emoji: '🤠', name: 'Happy Cowboy', category: 'faces', isVip: true },
  { id: 'face_scream', emoji: '😱', name: 'Scream Ooh', category: 'faces', isVip: true },
  { id: 'face_cat_laugh', emoji: '😹', name: 'Laughing Kitty', category: 'faces', isVip: true },
  { id: 'face_clown', emoji: '🤡', name: 'Funny Clown', category: 'faces', isVip: true },
  { id: 'face_devil', emoji: '😈', name: 'Playful Devil', category: 'faces', isVip: true },
  { id: 'face_robot', emoji: '🤖', name: 'Friendly Bot', category: 'faces', isVip: true },

  // ===================== MAGIC =====================
  // Free Magic
  { id: 'star', emoji: '⭐', name: 'Glowing Star', category: 'magic', isVip: false },
  { id: 'sparkles', emoji: '✨', name: 'Magic Sparkles', category: 'magic', isVip: false },
  { id: 'heart', emoji: '💖', name: 'Sparkle Heart', category: 'magic', isVip: false },
  { id: 'magic_wand', emoji: '🪄', name: 'Magic Wand', category: 'magic', isVip: false },

  // Pro Magic
  { id: 'crown', emoji: '👑', name: 'Golden Crown', category: 'magic', isVip: true },
  { id: 'unicorn_horn', emoji: '🦄', name: 'Unicorn Horn', category: 'magic', isVip: true },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow Cloud', category: 'magic', isVip: true },
  { id: 'diamond', emoji: '💎', name: 'Shining Gem', category: 'magic', isVip: true },
  { id: 'crystal_ball', emoji: '🔮', name: 'Crystal Ball', category: 'magic', isVip: true },

  // ===================== FUN & TREATS =====================
  // Free Fun
  { id: 'balloon', emoji: '🎈', name: 'Party Balloon', category: 'fun', isVip: false },
  { id: 'flower', emoji: '🌸', name: 'Cherry Blossom', category: 'fun', isVip: false },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream Cone', category: 'fun', isVip: false },
  { id: 'lollipop', emoji: '🍭', name: 'Sweet Lollipop', category: 'fun', isVip: false },
  { id: 'sun', emoji: '☀️', name: 'Golden Sun', category: 'fun', isVip: false },

  // Pro Fun
  { id: 'rocket', emoji: '🚀', name: 'Space Rocket', category: 'fun', isVip: true },
  { id: 'cupcake', emoji: '🧁', name: 'Sweet Cupcake', category: 'fun', isVip: true },
  { id: 'music_notes', emoji: '🎵', name: 'Music Note', category: 'fun', isVip: true },
  { id: 'pizza', emoji: '🍕', name: 'Cheesy Pizza', category: 'fun', isVip: true },
  { id: 'donut', emoji: '🍩', name: 'Glazed Donut', category: 'fun', isVip: true },

  // ===================== ANIMALS =====================
  // Free Animals
  { id: 'puppy', emoji: '🐶', name: 'Cute Puppy', category: 'animals', isVip: false },
  { id: 'kitten', emoji: '🐱', name: 'Little Kitten', category: 'animals', isVip: false },
  { id: 'bunny', emoji: '🐰', name: 'Fluffy Bunny', category: 'animals', isVip: false },

  // Pro Animals
  { id: 'dino_paw', emoji: '🦖', name: 'Dino Friend', category: 'animals', isVip: true },
  { id: 'butterfly', emoji: '🦋', name: 'Magic Butterfly', category: 'animals', isVip: true },
  { id: 'panda', emoji: '🐼', name: 'Panda Bear', category: 'animals', isVip: true },
  { id: 'lion', emoji: '🦁', name: 'Brave Lion', category: 'animals', isVip: true },
  { id: 'dolphin', emoji: '🐬', name: 'Playful Dolphin', category: 'animals', isVip: true },

  // ===================== STYLE & FASHION =====================
  // Free Fashion
  { id: 'bow', emoji: '🎀', name: 'Pink Bow', category: 'fashion', isVip: false },
  { id: 'sneaker', emoji: '👟', name: 'Cool Sneaker', category: 'fashion', isVip: false },

  // Pro Fashion
  { id: 'sunglasses', emoji: '🕶️', name: 'Cool Sunglasses', category: 'fashion', isVip: true },
  { id: 'party_hat', emoji: '🎩', name: 'Magic Top Hat', category: 'fashion', isVip: true },
  { id: 'backpack', emoji: '🎒', name: 'Adventure Bag', category: 'fashion', isVip: true },
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
  const [activeCategory, setActiveCategory] = useState<StickerCategory>('faces');

  useEffect(() => {
    if (isOpen) {
      playChime();
    }
  }, [isOpen]);

  const filteredStickers = useMemo(() => {
    if (activeCategory === 'all') return STICKERS;
    return STICKERS.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const handlePick = (sticker: StickerItem) => {
    if (sticker.isVip && !isPro) {
      setShowUpgradeModal(true);
      return;
    }
    playPop(550);
    onSelectSticker(sticker);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
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

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg sm:max-w-xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[92dvh] p-4 sm:p-6 border-3 sm:border-4 border-[#FF6B6B] my-auto flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-[#FF6B6B] to-[#FFA801] rounded-2xl flex items-center justify-center shadow-md rotate-3 text-white">
                  <Smile className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#2D3436] tracking-tight font-display flex items-center gap-2">
                    <span>Magical Sticker Stamps</span>
                    <span className="text-xs bg-[#FFF0F0] text-[#FF6B6B] font-bold px-2 py-0.5 rounded-full border border-[#FF6B6B]/20">
                      {STICKERS.length} stamps
                    </span>
                  </h2>
                  <p className="text-[11px] sm:text-xs font-bold text-[#777]">
                    Tap a stamp, then tap anywhere on your coloring page!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="p-2 rounded-full hover:bg-[#F5F5F5] transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-6 h-6 text-[#A0A0A0]" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar shrink-0">
              {STICKER_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                const count = cat.id === 'all'
                  ? STICKERS.length
                  : STICKERS.filter((s) => s.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playClick();
                      setActiveCategory(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer transform active:scale-95 ${
                      isActive
                        ? 'bg-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/30 scale-102'
                        : 'bg-[#F6F4EB] text-[#555] hover:bg-[#EFEBDD] hover:text-[#222]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-black/6 text-[#777]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sticker Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-2.5 max-h-[50vh] sm:max-h-[54vh] overflow-y-auto p-2 rounded-2xl bg-[#FCFAF6] border border-[#EFECE0] no-scrollbar">
              {filteredStickers.map((sticker) => {
                const isSelected = selectedSticker?.id === sticker.id;
                const isLocked = sticker.isVip && !isPro;

                return (
                  <button
                    key={sticker.id}
                    onClick={() => handlePick(sticker)}
                    className={`group relative p-2 sm:p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-[#FF6B6B] bg-[#FFF0F0] shadow-md ring-2 ring-[#FF6B6B]/40'
                        : 'border-[#EBE8DC] bg-white hover:border-[#FFD93D] hover:shadow-xs'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl filter drop-shadow-sm select-none transition-transform group-hover:scale-110">
                      {sticker.emoji}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#555] truncate max-w-full text-center leading-tight">
                      {sticker.name}
                    </span>

                    {/* Pro/VIP Badge */}
                    {sticker.isVip && (
                      <div
                        className={`absolute top-1 right-1 px-1 py-0.5 rounded-md flex items-center gap-0.5 shadow-2xs ${
                          isPro
                            ? 'bg-[#10B981] text-white'
                            : 'bg-gradient-to-r from-[#FFD93D] to-[#FFA801] text-[#6B4000]'
                        }`}
                        title={isPro ? 'Pro Member Feature' : 'Pro VIP Stamp'}
                      >
                        <Crown className="w-2.5 h-2.5 fill-current" />
                        <span className="text-[7.5px] font-black uppercase tracking-tight">
                          {isPro ? 'PRO' : 'VIP'}
                        </span>
                      </div>
                    )}

                    {/* Free Badge Indicator for un-locked */}
                    {!sticker.isVip && (
                      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#F0FFF4] text-[#2F855A] text-[7.5px] font-bold px-1 rounded">
                        FREE
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions & Active Stamp Mode */}
            <div className="mt-3 pt-3 border-t border-[#EBE8DC] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-[#777]">
                <Sparkles className="w-4 h-4 text-[#FFA801]" />
                <span>
                  {isPro
                    ? 'All 50+ stamps are unlocked for you!'
                    : 'Free stamps available anytime! Tap VIP for Pro access.'}
                </span>
              </div>

              {selectedSticker && (
                <button
                  onClick={() => {
                    playPop();
                    onSelectSticker(null);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#FF6B6B] border border-[#FF6B6B]/30 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Clear Active Stamp ({selectedSticker.emoji})</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StickerStampsModal;
