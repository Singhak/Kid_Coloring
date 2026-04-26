import React from 'react';
import { Palette, Eraser, Crown } from 'lucide-react';
import { COLORS } from '../constants';

interface MobileColorPaletteProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  isPro: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  showProColors: boolean;
  setShowProColors: (show: boolean) => void;
}

const MobileColorPalette: React.FC<MobileColorPaletteProps> = ({
  selectedColor,
  setSelectedColor,
  isPro,
  setShowUpgradeModal,
  showProColors,
  setShowProColors,
}) => {
  return (
    <div className="lg:hidden flex gap-3 p-4 bg-white rounded-3xl border-2 border-[#E6E6E6] shadow-sm overflow-x-auto no-scrollbar shrink-0">
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => setSelectedColor(color)}
          className={`
            w-10 h-10 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm
            ${selectedColor === color ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border border-black/5'}
          `}
          style={{ backgroundColor: color }}
        />
      ))}
      <button
        onClick={() => setSelectedColor('#FFFFFF')}
        className={`
          w-10 h-10 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm flex items-center justify-center bg-white border-2
          ${selectedColor === '#FFFFFF' ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border-[#E6E6E6]'}
        `}
      >
        <Eraser className="w-6 h-6 text-[#A0A0A0]" />
      </button>

      {/* Pro Colors Mobile */}
      <div className="relative">
        <button
          onClick={() => {
            if (!isPro) {
              setShowUpgradeModal(true);
              return;
            }
            setShowProColors(true);
          }}
          className={`
            w-12 h-12 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm flex items-center justify-center bg-gradient-to-br from-[#FF6B6B] via-[#4D96FF] to-[#6BCB77] text-white relative
            ${showProColors ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : ''}
          `}
        >
          <Palette className="w-6 h-6" />
          {!isPro && (
            <div className="absolute -top-1 -right-1 bg-[#FFD93D] text-white p-0.5 rounded-md shadow-sm border border-white">
              <Crown className="w-2.5 h-2.5" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileColorPalette;