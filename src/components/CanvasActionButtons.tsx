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
  Hash 
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
}

const CanvasActionButtons: React.FC<CanvasActionButtonsProps> = ({
  isPro,
  isGenerating,
  generateRandomImage,
  clearCanvas,
  setShowUpgradeModal,
  onOpenGallery,
  onPrintSheet,
  onOpenPhotoArt,
  isColorByNumber = false,
  onToggleColorByNumber,
  scale = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom
}) => {
  const isZoomed = Math.abs(scale - 1) > 0.05;

  return (
    <div className="w-full flex items-center justify-between gap-1.5 sm:gap-3 px-1 py-0.5 shrink-0 z-20">
      {/* Left Cluster: Library & Creation Sources */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-2xl border-2 border-[#EBE8DC] shadow-xs">
        {onOpenGallery && (
          <button
            onClick={() => {
              playClick();
              onOpenGallery();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#F7F5EC] hover:bg-[#EFECE0] text-[#2D3436] font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Return to Library Gallery"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#4D96FF]" />
            <span className="hidden sm:inline">Library</span>
          </button>
        )}

        <div className="w-px h-5 bg-[#E2DFD2] mx-0.5 hidden xs:block" />

        {/* Magic AI Button */}
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
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
            isPro
              ? 'bg-[#FFF9E6] hover:bg-[#FFF2B2] text-[#8C5B00] border border-[#FFD93D]'
              : 'bg-white hover:bg-[#FFFDF0] text-[#2D3436] border border-[#EBE8DC]'
          }`}
          title="Create with AI Magic"
        >
          <Sparkles className={`w-3.5 h-3.5 text-[#FF9F43] ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Magic AI</span>
          {!isPro && (
            <span className="flex items-center gap-0.5 bg-[#FFD93D] text-[#7A4B00] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-2xs">
              <Crown className="w-2.5 h-2.5 fill-current" /> VIP
            </span>
          )}
        </button>

        {/* Photo to Art Button */}
        {onOpenPhotoArt && (
          <button
            onClick={() => {
              playClick();
              onOpenPhotoArt();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-[#F0FDF4] text-[#15803D] border border-[#EBE8DC] hover:border-[#86EFAC] font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Convert photo to coloring page"
          >
            <Camera className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="hidden md:inline">Photo Art</span>
            {!isPro && (
              <span className="flex items-center gap-0.5 bg-[#FFD93D] text-[#7A4B00] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-2xs">
                <Crown className="w-2.5 h-2.5 fill-current" /> VIP
              </span>
            )}
          </button>
        )}
      </div>

      {/* Center Cluster: Educational Color by Number Toggle */}
      {onToggleColorByNumber && (
        <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl border-2 border-[#EBE8DC] shadow-xs">
          <button
            onClick={() => {
              playClick();
              onToggleColorByNumber();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer ${
              isColorByNumber
                ? 'bg-[#FFD93D] text-[#7A4B00] shadow-xs border border-[#E6C62C]'
                : 'bg-[#F7F5EC] hover:bg-[#EFECE0] text-[#2D3436]'
            }`}
            title="Toggle Color by Number Learning Mode"
          >
            <Hash className={`w-3.5 h-3.5 ${isColorByNumber ? 'text-[#7A4B00]' : 'text-[#4D96FF]'}`} />
            <span>Numbers {isColorByNumber ? 'ON' : 'Mode'}</span>
          </button>
        </div>
      )}

      {/* Right Cluster: Output & Tools */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-2xl border-2 border-[#EBE8DC] shadow-xs">
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
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-[#F0FDF4] text-[#2D3436] border border-[#EBE8DC] hover:border-[#10B981] font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
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
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-[#FFF5F5] text-[#FF6B6B] hover:text-[#EE5253] border border-[#FFD5D5] rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
          title="Clear all colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Zoom Controls */}
        {onZoomIn && onZoomOut && (
          <>
            <div className="w-px h-5 bg-[#E2DFD2] mx-0.5 hidden xs:block" />
            <button
              onClick={() => {
                playClick();
                onZoomOut();
              }}
              className="p-1.5 hover:bg-[#F7F5EC] rounded-xl text-[#2D3436] transition-all active:scale-90 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => {
                playClick();
                onZoomIn();
              }}
              className="p-1.5 hover:bg-[#F7F5EC] rounded-xl text-[#2D3436] transition-all active:scale-90 cursor-pointer"
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
                className="flex items-center gap-1 px-2 py-1 bg-[#4D96FF] text-white text-[10px] font-bold rounded-lg shadow-2xs transition-all active:scale-90 cursor-pointer"
                title="Fit to Screen"
              >
                <Maximize2 className="w-2.5 h-2.5" />
                <span>{Math.round(scale * 100)}%</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CanvasActionButtons;