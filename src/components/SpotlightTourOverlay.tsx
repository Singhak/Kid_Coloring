import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Check, 
  Compass,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { playClick, playSwish, playFanfare } from '../services/soundEffects';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionHint?: string;
}

interface SpotlightTourOverlayProps {
  isActive: boolean;
  onClose: () => void;
  onStepChange?: (stepIndex: number) => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-nav-brand',
    title: 'Welcome to Coloro! 🎨',
    content: 'Switch between our 100+ Drawing Library and your interactive Coloring Canvas anytime with one tap.',
    position: 'bottom',
    actionHint: 'Tap "Library" or "Coloring Canvas" to switch modes.'
  },
  {
    targetId: 'tour-creative-tools',
    title: 'Creative Superpowers ✨',
    content: 'Use Magic AI to draw anything you imagine, or Photo Art to turn real family photos into coloring book pages!',
    position: 'bottom',
    actionHint: 'Try typing: "A cute dragon eating cupcakes"!'
  },
  {
    targetId: 'tour-canvas-paper',
    title: 'Tap-to-Color Canvas 🖌️',
    content: 'Simply tap or click any section. Smart flood-fill colors strictly within black outlines so you never spill!',
    position: 'right',
    actionHint: 'Use the zoom buttons (+) to color tiny intricate details.'
  },
  {
    targetId: 'tour-palette-dock',
    title: '3D Crayons & Magic Fills 🌈',
    content: 'Choose vibrant crayons, pastel & neon tones, or try magical glitter, rainbow gradients, and sticker stamps!',
    position: 'top',
    actionHint: 'Click on any crayon or the Rainbow icon to color.'
  },
  {
    targetId: 'tour-save-actions',
    title: 'Save & Print for Real Crayons 🖨️',
    content: 'Save your digital artwork in high resolution, or print crisp A4 coloring sheets for real crayons at home!',
    position: 'bottom',
    actionHint: 'Hang your printed sheets on the fridge or share with friends!'
  }
];

export const SpotlightTourOverlay: React.FC<SpotlightTourOverlayProps> = ({
  isActive,
  onClose,
  onStepChange
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Update target rect based on current target element with graceful fallbacks
  const updateTargetRect = useCallback(() => {
    if (!isActive || !currentStep) return;

    let el = document.getElementById(currentStep.targetId);
    if (!el && currentStep.targetId === 'tour-canvas-paper') {
      el = document.getElementById('tour-canvas-area');
    }
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      // Fallback to center screen if element is not in DOM
      setTargetRect(null);
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    if (!isActive) {
      setCurrentStepIndex(0);
      setTargetRect(null);
      return;
    }

    updateTargetRect();
    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isActive, currentStepIndex, updateTargetRect]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      playSwish();
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (onStepChange) onStepChange(nextIdx);
    } else {
      playFanfare();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      playSwish();
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (onStepChange) onStepChange(prevIdx);
    }
  };

  if (!isActive) return null;

  // Calculate tooltip coordinates safely clamped within viewport
  const getTooltipStyle = (): React.CSSProperties => {
    const defaultStyle: React.CSSProperties = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 65,
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto'
    };

    if (!targetRect) return defaultStyle;

    const pad = 16;
    const tooltipWidth = Math.min(340, window.innerWidth - 32);
    const estimatedHeight = 230;

    let top = 0;
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

    const spaceAbove = targetRect.top - pad;
    const spaceBelow = window.innerHeight - targetRect.bottom - pad;
    const spaceLeft = targetRect.left - pad;
    const spaceRight = window.innerWidth - targetRect.right - pad;

    const preferredPos = currentStep.position || 'bottom';

    if (preferredPos === 'right') {
      if (spaceRight >= tooltipWidth + pad) {
        left = targetRect.right + pad;
        top = targetRect.top + targetRect.height / 2 - estimatedHeight / 2;
      } else if (spaceLeft >= tooltipWidth + pad) {
        left = targetRect.left - tooltipWidth - pad;
        top = targetRect.top + targetRect.height / 2 - estimatedHeight / 2;
      } else if (spaceBelow >= estimatedHeight) {
        top = targetRect.bottom + pad;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      } else {
        top = targetRect.top - estimatedHeight - pad;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      }
    } else if (preferredPos === 'top') {
      if (spaceAbove >= estimatedHeight) {
        top = targetRect.top - estimatedHeight - pad;
      } else if (spaceBelow >= estimatedHeight) {
        top = targetRect.bottom + pad;
      } else if (spaceRight >= tooltipWidth + pad) {
        left = targetRect.right + pad;
        top = targetRect.top + targetRect.height / 2 - estimatedHeight / 2;
      } else if (spaceLeft >= tooltipWidth + pad) {
        left = targetRect.left - tooltipWidth - pad;
        top = targetRect.top + targetRect.height / 2 - estimatedHeight / 2;
      } else {
        top = window.innerHeight - estimatedHeight - pad;
      }
    } else { // 'bottom'
      if (spaceBelow >= estimatedHeight) {
        top = targetRect.bottom + pad;
      } else if (spaceAbove >= estimatedHeight) {
        top = targetRect.top - estimatedHeight - pad;
      } else if (spaceRight >= tooltipWidth + pad) {
        left = targetRect.right + pad;
        top = targetRect.top + targetRect.height / 2 - estimatedHeight / 2;
      } else if (spaceLeft >= tooltipWidth + pad) {
        left = targetRect.left - tooltipWidth - pad;
        top = targetRect.top + targetRect.height / 2 - estimatedHeight / 2;
      } else {
        top = pad;
      }
    }

    // STRICT CLAMPING: Ensure the card can never bleed outside screen bounds
    left = Math.max(pad, Math.min(window.innerWidth - tooltipWidth - pad, left));
    top = Math.max(pad, Math.min(window.innerHeight - estimatedHeight - pad, top));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto',
      zIndex: 65
    };
  };

  return (
    <div className="fixed inset-0 z-60 pointer-events-auto select-none">
      {/* Semi-transparent Backdrop */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-2xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Target Element Spotlight Highlight Box */}
      {targetRect && (
        <motion.div
          initial={false}
          animate={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12
          }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="fixed rounded-2xl pointer-events-none ring-4 ring-[#FFD93D] shadow-[0_0_0_9999px_rgba(0,0,0,0.45),0_0_25px_rgba(255,217,61,0.8)] z-60"
        />
      )}

      {/* Tooltip Card */}
      <motion.div
        key={currentStep.targetId}
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={getTooltipStyle()}
        className="bg-white rounded-3xl shadow-2xl border-3 border-[#FFD93D] p-4 sm:p-5 flex flex-col gap-3 max-h-[calc(100vh-32px)] overflow-y-auto"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF6B6B] to-[#FFD93D] text-white text-xs font-black flex items-center justify-center shadow-xs">
              {currentStepIndex + 1}
            </span>
            <span className="text-xs font-black text-[#8C5B00] uppercase tracking-wider">
              Tour • Step {currentStepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1 rounded-xl text-[#888] hover:text-[#2D3436] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            title="Exit Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Title & Content */}
        <div className="space-y-1">
          <h4 className="text-base sm:text-lg font-black text-[#2D3436] font-display">
            {currentStep.title}
          </h4>
          <p className="text-xs sm:text-sm text-[#555] font-medium leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        {/* Action Hint */}
        {currentStep.actionHint && (
          <div className="px-3 py-1.5 bg-[#FFF9E6] border border-[#FFD93D]/50 rounded-xl text-[11px] font-bold text-[#8C5B00] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9F43] shrink-0" />
            <span>{currentStep.actionHint}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EFEAD6]">
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="text-xs font-bold text-[#888] hover:text-[#2D3436] cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-xl text-xs font-black text-[#636E72] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-bubbly flex items-center gap-1 px-3.5 py-1.5 bg-gradient-to-r from-[#FF6B6B] to-[#FFD93D] text-white font-black text-xs rounded-xl shadow-xs cursor-pointer hover:brightness-105"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish!' : 'Next'}</span>
              {currentStepIndex === TOUR_STEPS.length - 1 ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SpotlightTourOverlay;
