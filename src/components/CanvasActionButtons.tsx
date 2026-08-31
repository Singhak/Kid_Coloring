import React from 'react';
import { Sparkles, Crown, Trash2, ZoomIn, ZoomOut, Maximize2, LayoutGrid } from 'lucide-react';
import { playClick, playChime } from '../services/soundEffects';

interface CanvasActionButtonsProps {
  isPro: boolean;
  isGenerating: boolean;
  downloadImage?: () => void;
  generateRandomImage: () => void;
  clearCanvas: () => void;
  setShowUpgradeModal: (show: boolean) => void;
  onOpenGallery?: () => void;
  scale?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

const CanvasActionButtons: React.FC<CanvasActionButtonsProps> = ({
  isPro,
  isGenerating,
  generateRandomImage,
  clearCanvas,
  setShowUpgradeModal,
  onOpenGallery,
  scale = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom
}) => {
  const isZoomed = Math.abs(scale - 1) > 0.05;

  return (
    <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 flex items-center justify-between pointer-events-none z-20">
      {/* Left side: Zoom & Navigation Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border-2 border-[#EBE8DC] pointer-events-auto">
        {onOpenGallery && (
          <button
            onClick={() => {
              playClick();
              onOpenGallery();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#F7F5EC] hover:bg-[#EFECE0] text-[#2D3436] font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Pick a different picture"
          >
            <LayoutGrid className="w-4 h-4 text-[#4D96FF]" />
            <span className="hidden sm:inline">Gallery</span>
          </button>
        )}

        {onZoomIn && onZoomOut && (
          <>
            <div className="w-px h-5 bg-[#E2DFD2] mx-0.5 hidden sm:block" />
            <button
              onClick={() => {
                playClick();
                onZoomOut();
              }}
              className="p-1.5 hover:bg-[#F7F5EC] rounded-xl text-[#2D3436] transition-all active:scale-90 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
            <button
              onClick={() => {
                playClick();
                onZoomIn();
              }}
              className="p-1.5 hover:bg-[#F7F5EC] rounded-xl text-[#2D3436] transition-all active:scale-90 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
            {isZoomed && onResetZoom && (
              <button
                onClick={() => {
                  playClick();
                  onResetZoom();
                }}
                className="flex items-center gap-1 px-2 py-1 bg-[#4D96FF] text-white text-[11px] font-bold rounded-xl shadow-xs transition-all active:scale-90 cursor-pointer"
                title="Fit to Screen"
              >
                <Maximize2 className="w-3 h-3" />
                <span>{Math.round(scale * 100)}%</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Right side: AI Magic Prompt & Clear Canvas */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        <button
          onClick={() => {
            if (!isPro) {
              playChime();
              setShowUpgradeModal(true);
              return;
            }
            if (isGenerating) return;
            playChime();
            generateRandomImage();
          }}
          disabled={isGenerating}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl shadow-lg border-2 font-black text-xs sm:text-sm transition-all active:scale-95 cursor-pointer ${
            isPro
              ? 'bg-gradient-to-r from-[#FFD93D] to-[#FFA801] text-[#633900] border-[#F1C40F] hover:brightness-105'
              : 'bg-white/95 text-[#633900] border-[#FFD93D] hover:bg-[#FFFDF0]'
          }`}
          title="Create with AI Magic"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Magic AI</span>
          {!isPro && (
            <span className="flex items-center gap-0.5 bg-[#FFD93D] text-[#7A4B00] text-[10px] px-1.5 py-0.5 rounded-full font-black ml-0.5">
              <Crown className="w-2.5 h-2.5 fill-current" />
              VIP
            </span>
          )}
        </button>

        <button
          onClick={() => {
            playClick();
            clearCanvas();
          }}
          className="p-2 sm:px-3 sm:py-2 bg-white/90 backdrop-blur-md text-[#FF6B6B] hover:text-[#EE5253] border-2 border-[#FFD5D5] hover:border-[#FF6B6B] hover:bg-[#FFF5F5] rounded-2xl shadow-lg flex items-center gap-1.5 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
          title="Clear all colors"
        >
          <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="hidden md:inline">Reset</span>
        </button>
      </div>
    </div>
  );
};

export default CanvasActionButtons;