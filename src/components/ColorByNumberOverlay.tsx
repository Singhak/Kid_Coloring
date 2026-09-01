import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, X, Check } from 'lucide-react';
import { COLORS } from '../constants';

export interface NumberTarget {
  id: string;
  number: number;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  isCompleted: boolean;
  expectedColor: string;
}

interface ColorByNumberOverlayProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  targets: NumberTarget[];
  onTargetClick: (target: NumberTarget) => void;
  selectedColor: string;
}

const ColorByNumberOverlay: React.FC<ColorByNumberOverlayProps> = ({
  isActive,
  onToggle,
  targets,
  onTargetClick,
  selectedColor,
}) => {
  if (!isActive || targets.length === 0) return null;

  const completedCount = targets.filter(t => t.isCompleted).length;
  const progressPercent = Math.round((completedCount / targets.length) * 100);
  const isAllDone = completedCount === targets.length && targets.length > 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top Banner Guide */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-[#FFD93D] shadow-lg flex items-center gap-2.5 max-w-[95%]">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-[#FFD93D] text-[#7A4B00] font-black text-xs flex items-center justify-center shadow-xs">
            🔢
          </div>
          <span className="text-xs font-black text-[#2D3436] hidden sm:inline">
            Color by Numbers:
          </span>
        </div>

        {/* Mini Palette Legend (1..8) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {targets.slice(0, 6).map((t) => {
            const isCurrentColor = selectedColor === t.expectedColor;
            return (
              <div
                key={t.number}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[10px] font-black transition-all ${
                  isCurrentColor
                    ? 'bg-black text-white border-black scale-110 shadow-xs'
                    : t.isCompleted
                      ? 'bg-[#EBF7EE] border-[#86EFAC] text-[#15803D] opacity-60'
                      : 'bg-[#FAF9F5] border-[#EBE8DC] text-[#2D3436]'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: t.expectedColor }}
                />
                <span>#{t.number}</span>
                {t.isCompleted && <Check className="w-2.5 h-2.5" />}
              </div>
            );
          })}
        </div>

        {/* Progress percent badge */}
        <span className="text-[11px] font-black text-[#4D96FF] bg-[#F0F8FF] px-2 py-0.5 rounded-full shrink-0">
          {progressPercent}%
        </span>

        {/* Close Mode */}
        <button
          onClick={() => onToggle(false)}
          className="p-1 hover:bg-black/5 rounded-full text-[#888] cursor-pointer"
          title="Exit Color by Number"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Number Badge Markers on Canvas */}
      {targets.map((target) => {
        if (target.isCompleted) return null;
        const isSelectedColorMatching = selectedColor === target.expectedColor;

        return (
          <motion.button
            key={target.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => onTargetClick(target)}
            className={`absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 shadow-md flex items-center justify-center font-black text-xs sm:text-sm cursor-pointer transition-all active:scale-90 ${
              isSelectedColorMatching
                ? 'bg-[#FFD93D] text-[#7A4B00] border-[#E6C62C] ring-4 ring-[#FFD93D]/40 animate-pulse'
                : 'bg-white/95 text-[#2D3436] border-[#2D3436] hover:scale-110'
            }`}
            style={{
              left: `${target.xPercent}%`,
              top: `${target.yPercent}%`,
            }}
            title={`Region #${target.number} (Select Color #${target.number} to fill)`}
          >
            {target.number}
          </motion.button>
        );
      })}

      {/* Completion Trophy Modal Banner */}
      <AnimatePresence>
        {isAllDone && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto bg-gradient-to-r from-[#FFD93D] via-[#FFA801] to-[#FF6B6B] text-white p-4 rounded-3xl shadow-2xl border-2 border-white flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center text-xl">
              🏆
            </div>
            <div>
              <span className="block font-black text-sm sm:text-base">
                Challenge Complete! 🌟
              </span>
              <span className="text-[11px] font-bold text-white/90">
                You matched every number perfectly!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ColorByNumberOverlay;
