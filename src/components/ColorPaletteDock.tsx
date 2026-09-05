import React, { useRef, useState } from 'react';
import { 
  Palette, 
  Eraser, 
  Crown, 
  Smile, 
  PaintBucket, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { COLORS, COLOR_METADATA } from '../constants';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activeColorMeta = COLOR_METADATA[selectedColor];
  const hoveredColorMeta = hoveredColor ? COLOR_METADATA[hoveredColor] : null;
  const displayedMeta = hoveredColorMeta || (!selectedSticker && selectedColor !== '#FFFFFF' ? activeColorMeta : null);

  return (
    <aside className="w-full flex flex-col items-center justify-center shrink-0 pt-1 select-none z-20">
      {/* Floating Active Color Name Pill (Educational & Delightful) */}
      <div className="h-6 mb-1 flex items-center justify-center">
        {displayedMeta && !selectedSticker && selectedColor !== '#FFFFFF' && (
          <div 
            className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/95 border-2 shadow-xs text-xs font-black tracking-wide animate-float"
            style={{ borderColor: selectedColor }}
          >
            <span className="text-sm">{displayedMeta.emoji}</span>
            <span className="text-[#2D3436] font-display">{displayedMeta.name}</span>
          </div>
        )}
        {selectedSticker && (
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF0F0] border-2 border-[#FF6B6B] shadow-xs text-xs font-black tracking-wide text-[#E03131]">
            <span className="text-sm">{selectedSticker.emoji}</span>
            <span className="font-display">Stamp Active: Tap canvas to stamp!</span>
          </div>
        )}
        {selectedColor === '#FFFFFF' && !selectedSticker && (
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border-2 border-[#4D96FF] shadow-xs text-xs font-black tracking-wide text-[#2B8A3E]">
            <span className="text-sm">🧽</span>
            <span className="font-display">Chunky Eraser Active</span>
          </div>
        )}
      </div>

      {/* Main Crayon Tray Box */}
      <div className="relative flex items-center max-w-full px-2">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#636E72] shadow-sm border border-[#EBE8DC] mr-1 active:scale-90 cursor-pointer shrink-0 z-10 transition-transform"
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 crayon-tray rounded-3xl border-2 border-[#EBE8DC] shadow-lg max-w-full overflow-hidden">
          {/* Tool Switcher Section (Fill, Eraser, Stamps) */}
          <div className="flex items-center gap-1.5 bg-[#F5F2E9]/80 p-1 rounded-2xl border border-[#E6E1D2] shrink-0">
            {/* Fill Mode Indicator / Reset to crayon */}
            <button
              onClick={() => {
                playPop(420);
                if (selectedSticker || selectedColor === '#FFFFFF') {
                  setSelectedColor(COLORS[0]);
                }
              }}
              className={`flex flex-col items-center justify-center w-9 h-12 sm:w-10 sm:h-14 rounded-xl transition-all cursor-pointer ${
                !selectedSticker && selectedColor !== '#FFFFFF'
                  ? 'bg-white text-[#FF6B6B] shadow-sm border border-[#FFD5D5] -translate-y-0.5'
                  : 'text-[#888] hover:text-[#2D3436] hover:bg-white/60'
              }`}
              title="Magic Paint Fill"
            >
              <PaintBucket className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] font-black uppercase mt-0.5">Fill</span>
            </button>

            {/* Chunky Kid Eraser */}
            <button
              onClick={() => {
                playPop(300);
                setSelectedColor('#FFFFFF');
              }}
              className={`group relative flex flex-col items-center justify-center w-9 h-12 sm:w-10 sm:h-14 rounded-xl transition-all cursor-pointer ${
                selectedColor === '#FFFFFF' && !selectedSticker
                  ? 'bg-white border-2 border-[#4D96FF] shadow-sm -translate-y-1 ring-2 ring-[#4D96FF]/30'
                  : 'bg-white/60 hover:bg-white border border-[#E5E1D0]'
              }`}
              title="Chunky Eraser"
            >
              {/* Eraser 3D Shape */}
              <div className="w-5 h-6 rounded-md overflow-hidden flex flex-col shadow-2xs border border-black/10">
                <div className="h-2.5 bg-[#FF8787] w-full" />
                <div className="flex-1 bg-white w-full" />
              </div>
              <span className="text-[8px] font-black text-[#636E72] mt-0.5">Eraser</span>
            </button>

            {/* Stamps & Stickers Button */}
            {onOpenStickers && (
              <button
                onClick={() => {
                  playPop(550);
                  onOpenStickers();
                }}
                className={`relative flex flex-col items-center justify-center w-9 h-12 sm:w-10 sm:h-14 rounded-xl transition-all cursor-pointer ${
                  selectedSticker
                    ? 'bg-[#FFF0F0] border-2 border-[#FF6B6B] shadow-sm -translate-y-1 ring-2 ring-[#FF6B6B]/30'
                    : 'bg-white/60 hover:bg-white border border-[#E5E1D0]'
                }`}
                title="Sticker Stamps"
              >
                {selectedSticker ? (
                  <span className="text-lg leading-none animate-bounce">{selectedSticker.emoji}</span>
                ) : (
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF9F43]" />
                )}
                <span className="text-[8px] font-black text-[#FF9F43] uppercase mt-0.5">Stamps</span>
              </button>
            )}
          </div>

          <div className="w-px h-10 bg-[#E2DFD2] mx-0.5 shrink-0" />

          {/* 3D Crayon Swatches Box */}
          <div 
            ref={scrollRef}
            className="flex items-end gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 px-1 max-w-[50vw] sm:max-w-[58vw] md:max-w-[62vw]"
          >
            {COLORS.map((color, index) => {
              const isSelected = selectedColor === color && !selectedSticker;
              const isWhite = color === '#FFFFFF';
              const meta = COLOR_METADATA[color];

              return (
                <button
                  key={color}
                  onClick={() => {
                    playPop(350 + (index % 12) * 35);
                    setSelectedColor(color);
                  }}
                  onMouseEnter={() => setHoveredColor(color)}
                  onMouseLeave={() => setHoveredColor(null)}
                  className={`
                    group relative shrink-0 transition-all duration-200 cursor-pointer flex flex-col items-center
                    ${isSelected 
                      ? '-translate-y-3.5 sm:-translate-y-4 scale-105 z-10' 
                      : 'hover:-translate-y-1.5 hover:scale-102'}
                  `}
                  title={meta ? `${meta.emoji} ${meta.name}` : color}
                >
                  {/* Pointed Crayon Wax Tip */}
                  <div 
                    className="relative w-4 h-3 sm:w-5 sm:h-3.5 rounded-t-sm transition-all"
                    style={{
                      backgroundColor: color,
                      clipPath: 'polygon(50% 0%, 90% 100%, 10% 100%)',
                      filter: isSelected ? 'drop-shadow(0 -2px 4px rgba(0,0,0,0.2))' : undefined,
                    }}
                  >
                    {/* Tip Highlight */}
                    <div className="absolute inset-0 crayon-highlight opacity-60" />
                  </div>

                  {/* Wax Collar */}
                  <div 
                    className="w-5 h-1 sm:w-6 sm:h-1.5 rounded-xs"
                    style={{ backgroundColor: color }}
                  />

                  {/* Crayon Cylindrical Body & Wrapper */}
                  <div 
                    className={`
                      relative w-7 h-10 sm:w-8 sm:h-12 rounded-b-lg overflow-hidden flex flex-col items-center justify-between p-0.5 shadow-sm transition-all border
                      ${isWhite ? 'border-gray-300' : 'border-black/10'}
                    `}
                    style={{
                      backgroundColor: color,
                      boxShadow: isSelected 
                        ? `0 10px 20px -2px ${color}88, 0 4px 8px rgba(0,0,0,0.15)` 
                        : '0 2px 5px rgba(0,0,0,0.12)',
                    }}
                  >
                    {/* Wax Cylinder 3D Shading */}
                    <div className="absolute inset-0 crayon-highlight pointer-events-none" />

                    {/* Paper Wrapper Band */}
                    <div className="relative z-10 w-full my-auto py-1 sm:py-1.5 bg-white/85 rounded-xs border-y border-black/15 flex flex-col items-center justify-center">
                      <div className="absolute inset-0 crayon-wrapper-band opacity-40 pointer-events-none" />
                      
                      {/* Number badge for educational Color by Number mode */}
                      {isColorByNumber && index < 8 ? (
                        <span className="relative z-10 w-4 h-4 rounded-full bg-[#2D3436] text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                          {index + 1}
                        </span>
                      ) : (
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      )}
                    </div>

                    {/* Selected Active Glow Ring */}
                    {isSelected && (
                      <div className="absolute bottom-1 w-2 h-2 rounded-full bg-white shadow-xs z-10" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="w-px h-10 bg-[#E2DFD2] mx-0.5 shrink-0" />

          {/* Magic Patterns & More Colors */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Special Pattern Swatches */}
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
                    relative w-8 h-12 sm:w-9 sm:h-14 rounded-2xl shrink-0 transition-all duration-150 cursor-pointer flex flex-col items-center justify-between p-1 shadow-xs
                    ${isSelected
                      ? '-translate-y-2 scale-105 shadow-md ring-3 ring-[#FFD93D] ring-offset-1'
                      : 'hover:-translate-y-1 hover:scale-102'}
                  `}
                  style={{
                    background: pat.bg,
                    backgroundSize: pat.bgSize || 'auto',
                    border: '2px solid rgba(255,255,255,0.85)',
                  }}
                  title={`Special Pattern: ${pat.label}`}
                >
                  <span className="text-xs drop-shadow-xs">{pat.icon}</span>
                  {!isPro && (
                    <div className="absolute -top-1 -right-1 bg-[#FFD93D] text-[#7A4B00] p-0.5 rounded-full shadow-xs">
                      <Crown className="w-2.5 h-2.5 fill-current" />
                    </div>
                  )}
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs mb-0.5" />}
                </button>
              );
            })}

            {/* Magic Pro Palette Launcher */}
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
                relative w-9 h-12 sm:w-10 sm:h-14 rounded-2xl shrink-0 transition-all duration-150 flex flex-col items-center justify-center bg-gradient-to-br from-[#FF6B6B] via-[#4D96FF] to-[#6BCB77] text-white shadow-sm cursor-pointer
                ${showProColors
                  ? '-translate-y-1.5 ring-3 ring-[#FFD93D] ring-offset-1 scale-105'
                  : 'hover:-translate-y-1 hover:scale-102'}
              `}
              title="Magic Color Palette (50+ Shades)"
            >
              <Palette className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
              <span className="text-[7px] sm:text-[8px] font-black tracking-wider uppercase mt-0.5">
                More
              </span>
              {!isPro && (
                <div className="absolute -top-1.5 -right-1.5 bg-[#FFD93D] text-[#7A4B00] p-0.5 rounded-full shadow-xs border border-white">
                  <Crown className="w-2.5 h-2.5 fill-current" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#636E72] shadow-sm border border-[#EBE8DC] ml-1 active:scale-90 cursor-pointer shrink-0 z-10 transition-transform"
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

export default ColorPaletteDock;

