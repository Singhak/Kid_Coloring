import React from 'react';
import { Palette, Eraser, Crown, Sparkles, Smile, Shapes } from 'lucide-react';
import { COLORS } from '../constants';
import { playPop, playChime } from '../services/soundEffects';
import { StickerItem } from './StickerStampsModal';

export const SPECIAL_PATTERNS = [
  { id: 'pattern:glitter', label: 'Glitter ✨', icon: '✨', bg: 'linear-gradient(135deg, #FFD700, #FFF8DC, #FFA500)' },
  { id: 'pattern:rainbow', label: 'Rainbow 🌈', icon: '🌈', bg: 'linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9B72AA)' },
  { id: 'pattern:polka_dots', label: 'Dots 🟡', icon: '🟡', bg: 'radial-gradient(#FF6B6B 25%, #FFD93D 25%)', bgSize: '12px 12px' },
  { id: 'pattern:hearts', label: 'Hearts 💖', icon: '💖', bg: 'linear-gradient(135deg, #FF94B8, #FF4D6D)' },
  { id: 'pattern:stars', label: 'Stars ⭐', icon: '⭐', bg: 'linear-gradient(135deg, #2B2D42, #1E1B4B)' },
];

interface ColorPaletteDockProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  isPro: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  showProColors: boolean;
  setShowProColors: (show: boolean) => void;
  selectedSticker?: StickerItem | null;
  onOpenStickers?: () => void;
  isColorByNumber?: boolean;
}

const ColorPaletteDock: React.FC<ColorPaletteDockProps> = ({
  selectedColor,
  setSelectedColor,
  isPro,
  setShowUpgradeModal,
  showProColors,
  setShowProColors,
  selectedSticker,
  onOpenStickers,
  isColorByNumber = false
}) => {
  return (
    <aside className="w-full flex items-center justify-start sm:justify-center overflow-hidden shrink-0 pt-1">
      <div className="flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border-2 border-[#EBE8DC] shadow-lg overflow-x-auto no-scrollbar max-w-full">
        {/* Eraser Tool */}
        <button
          onClick={() => {
            playPop(300);
            setSelectedColor('#FFFFFF');
          }}
          className={`
            group relative w-10 h-11 sm:w-11 sm:h-13 rounded-2xl shrink-0 flex flex-col items-center justify-center transition-all duration-150 cursor-pointer
            ${selectedColor === '#FFFFFF' && !selectedSticker
              ? '-translate-y-1.5 shadow-md bg-white border-2 border-[#4D96FF] ring-4 ring-[#4D96FF]/20'
              : 'bg-[#F7F5EC] border-2 border-[#E5E1D0] hover:bg-[#EFECE0] hover:-translate-y-0.5'}
          `}
          title="Eraser (White)"
        >
          <Eraser className={`w-5 h-5 transition-transform group-hover:scale-110 ${selectedColor === '#FFFFFF' ? 'text-[#4D96FF]' : 'text-[#7F8C8D]'}`} />
          <span className="text-[9px] font-black text-[#7F8C8D] mt-0.5">Eraser</span>
        </button>

        <div className="w-px h-8 bg-[#E2DFD2] mx-0.5 shrink-0" />

        {/* Crayon Color Swatches */}
        {COLORS.map((color, index) => {
          const isSelected = selectedColor === color && !selectedSticker;
          return (
            <button
              key={color}
              onClick={() => {
                playPop(350 + (index % 12) * 35);
                setSelectedColor(color);
              }}
              className={`
                relative w-8 h-10 sm:w-10 sm:h-13 rounded-2xl shrink-0 transition-all duration-150 cursor-pointer flex flex-col items-center justify-end p-1
                ${isSelected
                  ? '-translate-y-2 scale-110 shadow-lg ring-4 ring-offset-2'
                  : 'hover:-translate-y-1 hover:scale-105 shadow-xs'}
              `}
              style={{
                backgroundColor: color,
                boxShadow: isSelected ? `0 8px 16px ${color}66` : `0 2px 4px rgba(0,0,0,0.1)`,
                border: color === '#FFFFFF' ? '2px solid #E0E0E0' : '2px solid rgba(255,255,255,0.4)',
              }}
              title={isColorByNumber ? `Color #${index + 1}` : color}
            >
              {/* Crayon Highlight / Shine Strip */}
              <div className="w-full h-1.5 bg-white/40 rounded-full mb-auto" />

              {/* Number Badge for Color-by-Number Mode */}
              {isColorByNumber && index < 8 ? (
                <div className="w-5 h-5 rounded-full bg-white/95 text-[#2D3436] font-black text-[11px] shadow-sm flex items-center justify-center mb-0.5">
                  {index + 1}
                </div>
              ) : (
                /* Selection Dot */
                isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white shadow-xs mb-1" />
                )
              )}
            </button>
          );
        })}

        <div className="w-px h-8 bg-[#E2DFD2] mx-0.5 shrink-0" />

        {/* Special Pattern Swatches (Glitter, Rainbow, Dots, Hearts, Stars) */}
        {SPECIAL_PATTERNS.map((pat) => {
          const isSelected = selectedColor === pat.id && !selectedSticker;
          return (
            <button
              key={pat.id}
              onClick={() => {
                if (!isPro) {
                  playChime();
                  setShowUpgradeModal(true);
                  return;
                }
                playPop(520);
                setSelectedColor(pat.id);
              }}
              className={`
                relative w-9 h-11 sm:w-11 sm:h-13 rounded-2xl shrink-0 transition-all duration-150 cursor-pointer flex flex-col items-center justify-between p-1.5 shadow-sm
                ${isSelected
                  ? '-translate-y-2 scale-110 shadow-lg ring-4 ring-[#FFD93D] ring-offset-2'
                  : 'hover:-translate-y-1 hover:scale-105'}
              `}
              style={{
                background: pat.bg,
                backgroundSize: pat.bgSize || 'auto',
                border: '2px solid rgba(255,255,255,0.7)',
              }}
              title={`Special Pattern: ${pat.label}`}
            >
              <span className="text-xs drop-shadow-xs">{pat.icon}</span>
              {!isPro && (
                <div className="absolute -top-1.5 -right-1.5 bg-[#FFD93D] text-[#7A4B00] p-0.5 rounded-full shadow-xs">
                  <Crown className="w-2.5 h-2.5 fill-current" />
                </div>
              )}
              {isSelected && <div className="w-2 h-2 rounded-full bg-white shadow-xs mb-0.5" />}
            </button>
          );
        })}

        <div className="w-px h-8 bg-[#E2DFD2] mx-0.5 shrink-0" />

        {/* Stamps & Stickers Tray Trigger */}
        {onOpenStickers && (
          <button
            onClick={() => {
              playPop();
              onOpenStickers();
            }}
            className={`
              relative w-10 h-11 sm:w-12 sm:h-13 rounded-2xl shrink-0 transition-all duration-150 flex flex-col items-center justify-center cursor-pointer
              ${selectedSticker
                ? 'bg-[#FFF0F0] border-2 border-[#FF6B6B] -translate-y-1.5 ring-4 ring-[#FF6B6B]/20 shadow-md'
                : 'bg-[#FAF9F5] border-2 border-[#EBE8DC] hover:border-[#FF6B6B] hover:bg-white'}
            `}
            title="Stickers & Stamps"
          >
            {selectedSticker ? (
              <span className="text-xl animate-bounce">{selectedSticker.emoji}</span>
            ) : (
              <>
                <Smile className="w-5 h-5 text-[#FF6B6B]" />
                <span className="text-[8px] font-black text-[#FF6B6B] uppercase tracking-wider mt-0.5">
                  Stamps
                </span>
              </>
            )}
          </button>
        )}

        {/* Magic Pro Palette Launcher Button */}
        <button
          onClick={() => {
            if (!isPro) {
              playChime();
              setShowUpgradeModal(true);
              return;
            }
            playChime();
            setShowProColors(true);
          }}
          className={`
            relative w-10 h-11 sm:w-12 sm:h-13 rounded-2xl shrink-0 transition-all duration-150 flex flex-col items-center justify-center bg-gradient-to-br from-[#FF6B6B] via-[#4D96FF] to-[#6BCB77] text-white shadow-md cursor-pointer
            ${showProColors
              ? '-translate-y-1.5 ring-4 ring-[#FFD93D] ring-offset-2 scale-105'
              : 'hover:-translate-y-1 hover:scale-105'}
          `}
          title="Magic Color Palette (50+ Shades)"
        >
          <Palette className="w-5 h-5 drop-shadow-sm" />
          <span className="text-[8px] font-black tracking-wider uppercase drop-shadow-xs mt-0.5">
            More
          </span>
          {!isPro && (
            <div className="absolute -top-1.5 -right-1.5 bg-[#FFD93D] text-[#7A4B00] p-1 rounded-full shadow-md border-2 border-white">
              <Crown className="w-3 h-3 fill-current" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default ColorPaletteDock;
