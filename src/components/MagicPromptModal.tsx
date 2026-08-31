import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Wand2, Shuffle, Flame, Zap } from 'lucide-react';
import { playChime, playClick, playPop } from '../services/soundEffects';

interface MagicPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePrompt: (prompt: string) => void;
  onInstantRealistic?: () => void;
  isGenerating: boolean;
}

const SAMPLE_PROMPTS = [
  '🦄 Rainbow Unicorn with Butterfly Wings',
  '🏎️ Super Turbo Racecar with Flames',
  '🐶 Cute Golden Puppy Eating Ice Cream',
  '🦖 Friendly T-Rex Playing Guitar',
  '🚀 Space Rocket Flying by Saturn',
  '🏰 Magic Princess Castle in the Clouds',
  '🐬 Playful Dolphin Swimming Near Treasure',
  '🐱 Superhero Cat with a Flying Cape',
  '🐼 Baby Panda Eating Bamboo in Jungle'
];

const MagicPromptModal: React.FC<MagicPromptModalProps> = ({
  isOpen,
  onClose,
  onGeneratePrompt,
  onInstantRealistic,
  isGenerating
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    if (isOpen) {
      playChime();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim().length > 0) {
      playPop();
      onGeneratePrompt(customPrompt.trim());
      onClose();
    }
  };

  const handleChipClick = (promptText: string) => {
    playPop();
    const cleanPrompt = promptText.replace(/^[^\w]+/, '');
    onGeneratePrompt(cleanPrompt);
    onClose();
  };

  const handleSurpriseMe = () => {
    playPop();
    const randomChip = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    const cleanPrompt = randomChip.replace(/^[^\w]+/, '');
    onGeneratePrompt(cleanPrompt);
    onClose();
  };

  const handleInstantClick = () => {
    if (onInstantRealistic) {
      playPop();
      onInstantRealistic();
      onClose();
    }
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-6 sm:p-8 border-4 border-[#FFD93D]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B6B] via-[#FFD93D] to-[#4D96FF] rounded-2xl flex items-center justify-center shadow-md rotate-3 text-white">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#2D3436] tracking-tight font-display">
                    Magic AI Artist
                  </h2>
                  <p className="text-xs font-bold text-[#888]">
                    Draw anything your imagination can dream of!
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

            {/* Instant Offline Generator Option */}
            {onInstantRealistic && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleInstantClick}
                  className="w-full p-3.5 sm:p-4 bg-gradient-to-r from-[#FFF9E6] via-[#FFF3D1] to-[#FFF9E6] border-2 border-[#E6C62C] hover:shadow-md rounded-2xl flex items-center justify-between transition-all transform hover:scale-[1.01] active:scale-95 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#2D3436] group-hover:rotate-12 transition-transform">
                      <Zap className="w-5 h-5 text-[#FF9248]" />
                    </div>
                    <div>
                      <span className="block font-black text-xs sm:text-sm text-[#2D3436]">
                        ⚡ Instant Realistic Page (0ms)
                      </span>
                      <span className="text-[11px] font-bold text-[#7A6B32]">
                        Instantly synthesize a detailed coloring page
                      </span>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#D4AC0D] shrink-0 ml-2" />
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#EBE8DC]" />
              <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest">
                OR WRITE YOUR OWN IDEA
              </span>
              <div className="flex-1 h-px bg-[#EBE8DC]" />
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Baby dragon eating birthday cake..."
                  className="w-full pl-4 pr-24 py-3 sm:py-3.5 bg-[#FAF9F5] border-2 border-[#EBE8DC] focus:border-[#4D96FF] rounded-2xl text-xs sm:text-sm font-bold text-[#2D3436] placeholder-[#A0A0A0] outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!customPrompt.trim() || isGenerating}
                  className="btn-bubbly absolute right-1.5 px-3.5 py-2 bg-[#4D96FF] hover:bg-[#3B82F6] disabled:opacity-40 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draw</span>
                </button>
              </div>
            </form>

            {/* Quick Inspiration Chips */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-black text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF6B6B]" /> Fun Ideas to Try
                </span>
                <button
                  type="button"
                  onClick={handleSurpriseMe}
                  className="text-xs font-bold text-[#4D96FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Surprise Me!
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                {SAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleChipClick(prompt)}
                    className="px-2.5 py-1.5 bg-[#FAF9F5] hover:bg-[#FFFDF0] hover:border-[#FFD93D] border border-[#EBE8DC] rounded-xl text-xs font-bold text-[#2D3436] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MagicPromptModal;
