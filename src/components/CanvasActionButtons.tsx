import React from 'react';
import { Download, Sparkles, Crown, Trash2 } from 'lucide-react';

interface CanvasActionButtonsProps {
  isPro: boolean;
  isGenerating: boolean;
  downloadImage: () => void;
  generateRandomImage: () => void;
  clearCanvas: () => void;
  setShowUpgradeModal: (show: boolean) => void;
}

const CanvasActionButtons: React.FC<CanvasActionButtonsProps> = ({
  isPro,
  isGenerating,
  downloadImage,
  generateRandomImage,
  clearCanvas,
  setShowUpgradeModal,
}) => {
  return (
    <>
      {/* Floating Action Buttons - Top Right */}
      <div className="absolute top-6 right-6 flex flex-col gap-3">
        <button
          onClick={downloadImage}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-90 group/save relative ${isPro ? 'bg-[#6BCB77] text-white hover:bg-[#5BB366]' : 'bg-[#A0A0A0] text-white hover:bg-[#808080]'}`}
          title="Save Masterpiece"
        >
          <Download className="w-6 h-6 sm:w-7 sm:h-7 group-hover/save:scale-110 transition-transform" />
          {!isPro && (
            <div className="absolute -top-1 -right-1 bg-[#FFD93D] text-white p-1 rounded-lg shadow-md border-2 border-white">
              <Crown className="w-3 h-3" />
            </div>
          )}
        </button>
      </div>

      {/* Floating Action Buttons - Bottom Right */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={generateRandomImage}
          disabled={isGenerating}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 group/btn relative ${isPro ? 'bg-[#FFD93D] text-[#2D3436] hover:bg-[#F9CA24]' : 'bg-[#A0A0A0] text-white hover:bg-[#808080]'}`}
          title="New Magic Picture"
        >
          <Sparkles className={`w-6 h-6 sm:w-7 sm:h-7 ${isGenerating ? 'animate-spin' : 'group-hover/btn:rotate-12'}`} />
          {!isPro && (
            <div className="absolute -top-1 -right-1 bg-[#FFD93D] text-white p-1 rounded-lg shadow-md border-2 border-white">
              <Crown className="w-3 h-3" />
            </div>
          )}
        </button>
        <button
          onClick={clearCanvas}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white text-[#FF6B6B] border-2 border-[#FF6B6B] rounded-2xl shadow-lg flex items-center justify-center hover:bg-[#FFF5F5] transition-all active:scale-90"
          title="Clear All"
        >
          <Trash2 className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>
    </>
  );
};

export default CanvasActionButtons;