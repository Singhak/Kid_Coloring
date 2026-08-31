import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Crown, Award, Wand2 } from 'lucide-react';
import { STATIC_TEMPLATES, CATEGORIES } from '../constants';
import { Template } from '../types';
import { playPop, playChime } from '../services/soundEffects';

interface TemplateGridProps {
  isPro: boolean;
  isGenerating: boolean;
  selectedCategory: string;
  generateRandomImage: () => void;
  selectTemplate: (template: Template) => void;
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
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);
  const filteredTemplates = STATIC_TEMPLATES.filter(
    t => selectedCategory === 'random' || t.category === selectedCategory
  );

  return (
    <motion.div
      key="template-grid"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full h-full p-4 sm:p-6 overflow-y-auto"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2D3436] font-display flex items-center gap-2">
            <span>{currentCategory?.emoji || '🎨'}</span>
            <span>{currentCategory?.label || 'Drawings'} Collection</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-black/5 text-[#636E72] rounded-full">
              {filteredTemplates.length} pages
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#888] font-medium">
            Pick any magical picture or ask AI to draw something new!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 pb-8">
        {/* Magic AI Generator Card */}
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
          className={`col-span-2 sm:col-span-1 md:col-span-1 flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-3xl border-3 transition-all group/gen relative overflow-hidden cursor-pointer active:scale-95 min-h-[220px] ${
            isGenerating 
              ? 'opacity-50 cursor-not-allowed border-amber-300 bg-amber-50' 
              : isPro 
                ? 'border-[#FFD93D] bg-gradient-to-b from-[#FFFDF0] to-[#FFF9DE] hover:shadow-xl hover:-translate-y-1' 
                : 'border-[#F1C40F] bg-gradient-to-b from-[#FFF9E6] to-[#FFF0C2] hover:shadow-lg'
          }`}
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FFD93D]/30 rounded-full blur-2xl pointer-events-none" />
          
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover/gen:scale-110 group-hover/gen:rotate-6 transition-transform relative z-10 ${
            isPro 
              ? 'bg-gradient-to-tr from-[#FF9F43] to-[#FFD93D] text-white' 
              : 'bg-gradient-to-tr from-[#F39C12] to-[#F1C40F] text-white'
          }`}>
            <Wand2 className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" />
          </div>

          <div className="text-center relative z-10">
            <span className="block font-black text-[#2D3436] text-base sm:text-lg font-display">
              ✨ Magic AI Artist
            </span>
            <span className="text-xs font-bold text-[#9C7A14] mt-0.5 block">
              {isPro ? 'Generate any custom drawing' : 'Unlock Unlimited AI Art'}
            </span>
          </div>

          {!isPro && (
            <div className="flex items-center gap-1 bg-[#FFD93D] text-[#7A4B00] px-2.5 py-1 rounded-full text-[11px] font-black shadow-sm mt-1">
              <Crown className="w-3 h-3 fill-current" />
              VIP Magic
            </div>
          )}
        </button>

        {/* Static Coloring Page Cards */}
        {filteredTemplates.map((template) => (
          <button
            key={template.id || template.name}
            onClick={() => {
              playPop();
              selectTemplate(template);
            }}
            className="flex flex-col items-center gap-2.5 p-3 sm:p-4 rounded-3xl bg-white border-2 border-[#EBE8DC] hover:border-[#4D96FF] hover:bg-[#F9FCFF] hover:shadow-xl hover:-translate-y-1 transition-all group/card relative text-left cursor-pointer active:scale-95"
          >
            {template.difficulty && (
              <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm border border-[#EBE8DC] px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-[#4D96FF] shadow-sm flex items-center gap-1 z-10">
                <Award className="w-3 h-3" />
                {template.difficulty}
              </div>
            )}

            <div className="w-full aspect-square bg-[#FAF9F5] rounded-2xl border border-[#EDEAE0] p-3 flex items-center justify-center overflow-hidden group-hover/card:scale-[1.03] transition-transform">
              <svg viewBox={template.viewBox} className="w-full h-full drop-shadow-xs">
                {template.paths.map((p) => (
                  <path
                    key={p.id}
                    d={p.d}
                    fill="none"
                    stroke="#2D3436"
                    strokeWidth={p.strokeWidth || 4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </svg>
            </div>
            
            <span className="w-full text-center font-black text-xs sm:text-sm text-[#2D3436] group-hover/card:text-[#4D96FF] transition-colors truncate px-1">
              {template.name}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default TemplateGrid;