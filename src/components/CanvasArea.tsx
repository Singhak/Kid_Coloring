import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { SvgPath, Template } from '../types';
import TemplateGrid from './TemplateGrid';
import LoadingSpinner from './LoadingSpinner';
import DualLayerCanvas from './DualLayerCanvas';
import CanvasActionButtons from './CanvasActionButtons';
import { StickerItem } from './StickerStampsModal';

interface CanvasAreaProps {
  isPro: boolean;
  isGenerating: boolean;
  showTemplates: boolean;
  setShowTemplates: (show: boolean) => void;
  selectedCategory: string;
  paths: SvgPath[];
  viewBox: string;
  imageUrl?: string | null;
  selectedColor: string;
  paintCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  lineArtCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onHistoryPush: (dataUrl: string) => void;
  restoredDataUrl: string | null;
  generateRandomImage: () => void;
  selectTemplate: (template: Template) => void;
  downloadImage: () => void;
  clearCanvas: () => void;
  setShowUpgradeModal: (show: boolean) => void;
  onPrintSheet?: () => void;
  onOpenPhotoArt?: () => void;
  selectedSticker?: StickerItem | null;
  onClearSticker?: () => void;
  isColorByNumber?: boolean;
  onToggleColorByNumber?: () => void;
  onOpenStickers?: () => void;
  onQuickNext?: () => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  isPro,
  isGenerating,
  showTemplates,
  setShowTemplates,
  selectedCategory,
  paths,
  viewBox,
  imageUrl,
  selectedColor,
  paintCanvasRef,
  lineArtCanvasRef,
  onHistoryPush,
  restoredDataUrl,
  generateRandomImage,
  selectTemplate,
  downloadImage,
  clearCanvas,
  setShowUpgradeModal,
  onPrintSheet,
  onOpenPhotoArt,
  selectedSticker,
  onClearSticker,
  isColorByNumber = false,
  onToggleColorByNumber,
  onOpenStickers,
  onQuickNext
}) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setScale((prev) => Math.min(5.0, prev + 0.3));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(1.0, prev - 0.3);
      if (next <= 1.05) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleSelectTemplate = (template: Template) => {
    handleResetZoom();
    selectTemplate(template);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden min-h-0 relative">
      {/* Main Drawing Canvas / Library Container */}
      <div className={`flex-1 relative rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-[#EBE8DC] shadow-inner flex items-center justify-center overflow-hidden group min-h-0 min-w-0 p-1 sm:p-2.5 ${showTemplates ? 'bg-[#F7F5EC]' : 'art-studio-bg'}`}>
        {/* Floating Utility Controls (Print, Reset, Zoom, Next) - Non-intrusive corner dock */}
        {!showTemplates && !isGenerating && (
          <div className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-30">
            <CanvasActionButtons
              isPro={isPro}
              isGenerating={isGenerating}
              downloadImage={downloadImage}
              generateRandomImage={generateRandomImage}
              clearCanvas={clearCanvas}
              setShowUpgradeModal={setShowUpgradeModal}
              onOpenGallery={() => setShowTemplates(true)}
              onPrintSheet={onPrintSheet}
              onOpenPhotoArt={onOpenPhotoArt}
              isColorByNumber={isColorByNumber}
              onToggleColorByNumber={onToggleColorByNumber}
              onOpenStickers={onOpenStickers}
              scale={scale}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
              onQuickNext={onQuickNext}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {showTemplates ? (
            <TemplateGrid
              key="template-grid-view"
              isPro={isPro}
              isGenerating={isGenerating}
              selectedCategory={selectedCategory}
              generateRandomImage={generateRandomImage}
              selectTemplate={handleSelectTemplate}
              setShowUpgradeModal={setShowUpgradeModal}
              onOpenPhotoArt={onOpenPhotoArt}
            />
          ) : isGenerating ? (
            <LoadingSpinner key="loading-view" />
          ) : (
            <div key="canvas-drawing-view" className="w-full h-full flex items-center justify-center min-h-0 min-w-0 py-0.5 sm:py-1">
              <DualLayerCanvas
                paths={paths}
                viewBox={viewBox}
                imageUrl={imageUrl}
                selectedColor={selectedColor}
                paintCanvasRef={paintCanvasRef}
                lineArtCanvasRef={lineArtCanvasRef}
                onHistoryPush={onHistoryPush}
                restoredDataUrl={restoredDataUrl}
                scale={scale}
                setScale={setScale}
                pan={pan}
                setPan={setPan}
                selectedSticker={selectedSticker}
                onClearSticker={onClearSticker}
                isColorByNumber={isColorByNumber}
                onToggleColorByNumber={onToggleColorByNumber}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CanvasArea;