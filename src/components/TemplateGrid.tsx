import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Crown } from 'lucide-react';
import { STATIC_TEMPLATES } from '../constants';

interface TemplateGridProps {
  isPro: boolean;
  isGenerating: boolean;
  selectedCategory: string;
  generateRandomImage: () => void;
  selectTemplate: (template: typeof STATIC_TEMPLATES[0]) => void;
  setShowUpgradeModal: (show: boolean) => void;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({
  isPro,
  isGenerating,
  selectedCategory,
  generateRandomImage,
  selectTemplate,
  setShowUpgradeModal,
}) => {
  return (
    <motion.div
      key="template-grid"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full p-6 overflow-y-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Magic Generate Button for this category */}
        <button
          onClick={() => {
            if (!isPro) {
              setShowUpgradeModal(true);
              return;
            }
            if (isGenerating) return;
            generateRandomImage();
          }}
          disabled={isGenerating}
          className={`flex flex-col items-center justify-center gap-3 p-4 rounded-3xl border-4 border-dashed transition-all group/gen relative overflow-hidden ${isGenerating ? 'opacity-50 cursor-not-allowed' : isPro ? 'border-[#FFD93D] bg-[#FFFDF0] hover:bg-[#FFF9E0]' : 'border-[#E6E6E6] bg-[#F5F5F5] hover:bg-[#EEEEEE]'}`}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-10 pointer-events-none"
          >
            <Sparkles className="w-full h-full text-[#FFD93D]" />
          </motion.div>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg group-hover/gen:scale-110 transition-transform relative z-10 ${isPro ? 'bg-[#FFD93D]' : 'bg-[#A0A0A0]'}`}>
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="text-center relative z-10">
            <span className="block font-black text-[#2D3436] text-lg">Magic Generate</span>
            <span className="text-xs font-bold text-[#A0A0A0]">
              {isPro ? 'AI or Code Magic!' : 'Upgrade to Unlock'}
            </span>
          </div>
          {!isPro && (
            <div className="absolute top-3 right-3 bg-[#FFD93D] text-white p-1 rounded-lg shadow-sm">
              <Crown className="w-4 h-4" />
            </div>
          )}
        </button>

        {STATIC_TEMPLATES
          .filter(t => selectedCategory === 'random' || t.category === selectedCategory)
          .map((template) => (
            <button
              key={template.name}
              onClick={() => selectTemplate(template)}
              className="flex flex-col items-center gap-3 p-4 rounded-3xl border-2 border-[#E6E6E6] hover:border-[#FFD93D] hover:bg-[#FFFDF0] transition-all group/card"
            >
              <div className="w-full aspect-square bg-white rounded-2xl border border-[#F0F0F0] p-2 flex items-center justify-center overflow-hidden">
                <svg viewBox={template.viewBox} className="w-full h-full">
                  {template.paths.map((p) => (
                    <path
                      key={p.id}
                      d={p.d}
                      fill="none"
                      stroke="#4A4A4A"
                      strokeWidth={8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>
              </div>
              <span className="font-black text-[#4A4A4A] group-hover/card:text-[#FF6B6B]">{template.name}</span>
            </button>
          ))}
      </div>
    </motion.div>
  );
};

export default TemplateGrid;