import React from 'react';
import { 
  Sparkles, 
  Crown, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  LayoutGrid, 
  Printer, 
  Camera, 
  Hash,
  Shuffle
} from 'lucide-react';
import { playClick, playChime } from '../services/soundEffects';

interface CanvasActionButtonsProps {
  isPro: boolean;
  isGenerating: boolean;
  downloadImage?: () => void;
  generateRandomImage: () => void;
  clearCanvas: () => void;
  setShowUpgradeModal: (show: boolean) => void;
  onOpenGallery?: () => void;
  onPrintSheet?: () => void;
  onOpenPhotoArt?: () => void;
  isColorByNumber?: boolean;
  onToggleColorByNumber?: () => void;
  onOpenStickers?: () => void;
  scale?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onQuickNext?: () => void;
}

const CanvasActionButtons: React.FC<CanvasActionButtonsProps> = ({
  isPro,
  clearCanvas,
  setShowUpgradeModal,
  onPrintSheet,
  scale = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onQuickNext
}) => {
  const isZoomed = Math.abs(scale - 1) > 0.05;

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/90 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border-2 border-[#EBE8DC] shadow-md select-none">
      {/* Quick Next Drawing Button */}
      {onQuickNext && (
        <button
          onClick={() => {
            playClick();
            onQuickNext();
          }}
          className="flex items-center gap-1 px-2.5 py-1 sm:py-1.5 bg-gradient-to-r from-[#FFD93D] to-[#FF9F43] text-white font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs hover:brightness-105"
          title="Instant Next Drawing"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Next</span>
        </button>
      )}
      {/* Printable PDF Button */}
      {onPrintSheet && (
        <button
          onClick={() => {
            if (!isPro) {
              playChime();
              setShowUpgradeModal(true);
              return;
            }
            playClick();
            onPrintSheet();
          }}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white hover:bg-[#F0FDF4] text-[#2D3436] border border-[#EBE8DC] hover:border-[#10B981] font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Print A4 Coloring Sheet for real crayons at home"
        >
          <Printer className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="hidden sm:inline">Print</span>
          {!isPro && (
            <span className="flex items-center gap-0.5 bg-[#FFD93D] text-[#7A4B00] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-2xs">
              <Crown className="w-2.5 h-2.5 fill-current" /> VIP
            </span>
          )}
        </button>
      )}

      {/* Clear/Reset Canvas Button */}
      <button
        onClick={() => {
          playClick();
          clearCanvas();
        }}
        className="p-1 sm:px-2 sm:py-1.5 bg-white hover:bg-[#FFF5F5] text-[#FF6B6B] hover:text-[#EE5253] border border-[#FFD5D5] rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
        title="Clear all colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Reset</span>
      </button>

      {/* Zoom Controls */}
      {onZoomIn && onZoomOut && (
        <>
          <div className="w-px h-5 bg-[#E2DFD2] mx-0.5" />
          <button
            onClick={() => {
              playClick();
              onZoomOut();
            }}
            className="p-1 sm:p-1.5 hover:bg-[#F7F5EC] rounded-xl text-[#2D3436] transition-all active:scale-90 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => {
              playClick();
              onZoomIn();
            }}
            className="p-1 sm:p-1.5 hover:bg-[#F7F5EC] rounded-xl text-[#2D3436] transition-all active:scale-90 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          {isZoomed && onResetZoom && (
            <button
              onClick={() => {
                playClick();
                onResetZoom();
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-[#4D96FF] text-white text-[10px] font-bold rounded-lg shadow-2xs transition-all active:scale-90 cursor-pointer"
              title="Reset Zoom to 100%"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>{Math.round(scale * 100)}%</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CanvasActionButtons;