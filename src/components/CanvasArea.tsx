import React from 'react';
import { AnimatePresence } from 'motion/react';
import { SvgPath } from '../types';
import { STATIC_TEMPLATES } from '../constants';
import TemplateGrid from './TemplateGrid';
import LoadingSpinner from './LoadingSpinner';
import SvgCanvas from './SvgCanvas';
import CanvasActionButtons from './CanvasActionButtons';

interface CanvasAreaProps {
  isPro: boolean;
  isGenerating: boolean;
  showTemplates: boolean;
  selectedCategory: string;
  paths: SvgPath[];
  viewBox: string;
  svgRef: React.RefObject<SVGSVGElement>;
  generateRandomImage: () => void;
  selectTemplate: (template: typeof STATIC_TEMPLATES[0]) => void;
  downloadImage: () => void;
  clearCanvas: () => void;
  handleFill: (pathId: string) => void;
  setShowUpgradeModal: (show: boolean) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  isPro,
  isGenerating,
  showTemplates,
  selectedCategory,
  paths,
  viewBox,
  svgRef,
  generateRandomImage,
  selectTemplate,
  downloadImage,
  clearCanvas,
  handleFill,
  setShowUpgradeModal,
}) => {
  return (
    <div className="flex-1 relative bg-white rounded-[2rem] border-4 border-[#E6E6E6] shadow-inner flex items-center justify-center overflow-hidden group">
      <AnimatePresence mode="wait">
        {showTemplates ? (
          <TemplateGrid
            isPro={isPro}
            isGenerating={isGenerating}
            selectedCategory={selectedCategory}
            generateRandomImage={generateRandomImage}
            selectTemplate={selectTemplate}
            setShowUpgradeModal={setShowUpgradeModal}
          />
        ) : isGenerating ? (
          <LoadingSpinner />
        ) : (
          <SvgCanvas
            paths={paths}
            viewBox={viewBox}
            svgRef={svgRef}
            handleFill={handleFill}
          />
        )}
      </AnimatePresence>

      <CanvasActionButtons
        isPro={isPro}
        isGenerating={isGenerating}
        downloadImage={downloadImage}
        generateRandomImage={generateRandomImage}
        clearCanvas={clearCanvas}
        setShowUpgradeModal={setShowUpgradeModal}
      />
    </div>
  );
};

export default CanvasArea;