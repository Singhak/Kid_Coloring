import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Crown, Award, Wand2, Camera, Flame, Clock, ArrowRight } from 'lucide-react';
import { STATIC_TEMPLATES, CATEGORIES } from '../constants';
import { Template } from '../types';
import { getCurrentWeeklyDrop } from '../constants/weeklyDrops';
import { playPop, playChime } from '../services/soundEffects';

interface TemplateGridProps {
  isPro: boolean;
  isGenerating: boolean;
  selectedCategory: string;
  generateRandomImage: () => void;
  selectTemplate: (template: Template) => void;
  setShowUpgradeModal: (show: boolean) => void;
  onOpenPhotoArt?: () => void;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({
  isPro,
  isGenerating,
  selectedCategory,
  generateRandomImage,
  selectTemplate,
  setShowUpgradeModal,
  onOpenPhotoArt
}) => {
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);
  const filteredTemplates = STATIC_TEMPLATES.filter(
    t => selectedCategory === 'random' || t.category === selectedCategory
  );
  const weeklyDropData = getCurrentWeeklyDrop();

  return (
    <motion.div
      key="template-grid"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full h-full p-2.5 sm:p-6 overflow-y-auto"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3 sm:mb-5 px-1">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-[#2D3436] font-display flex items-center gap-1.5 sm:gap-2">
            <span>{currentCategory?.emoji || '🎨'}</span>
            <span>{currentCategory?.label || 'Drawings'} Collection</span>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-black/5 text-[#636E72] rounded-full">
              {filteredTemplates.length} pages
            </span>
          </h2>
          <p className="text-[11px] sm:text-sm text-[#888] font-medium">
            Pick any magical picture, upload real photos, or explore this week's fresh VIP drops!
          </p>
        </div>
      </div>

      {/* Featured Weekly Drop Spotlight Banner (Shown in 'random' & 'weekly') */}
      {(selectedCategory === 'random' || selectedCategory === 'weekly') && (
        <div className="mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl border-2 border-[#FFD93D] bg-gradient-to-r from-[#FFFDF0] via-[#FFF9DE] to-[#FFF0C2] p-3.5 sm:p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#FFD93D]/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 sm:gap-5 flex-1 min-w-0">
            {/* SVG Thumbnail */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-[#FFEAA7] p-2 shrink-0 flex items-center justify-center shadow-xs">
              <svg viewBox={weeklyDropData.drop.template.viewBox} className="w-full h-full">
                {weeklyDropData.drop.template.paths.map((p) => (
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

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-[#FF4757] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>WEEKLY VIP DROP</span>
                </span>
                {isPro ? (
                  <span className="inline-flex items-center gap-1 bg-[#2ED573] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                    <Sparkles className="w-3 h-3" />
                    <span>UNLOCKED FOR YOU</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-[#FFA502] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                    <Clock className="w-3 h-3" />
                    <span>FREE IN {weeklyDropData.daysUntilFree} DAYS</span>
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-xl font-black text-[#2D3436] font-display truncate">
                {weeklyDropData.drop.template.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#636E72] font-medium line-clamp-2">
                {weeklyDropData.drop.description}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 w-full md:w-auto">
            {isPro ? (
              <button
                onClick={() => {
                  playPop();
                  selectTemplate(weeklyDropData.drop.template);
                }}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#2ED573] to-[#10B981] text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md hover:brightness-105 active:scale-95 cursor-pointer transition-all"
              >
                <span>Color This Drawing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  playChime();
                  setShowUpgradeModal(true);
                }}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF6B6B] via-[#FA8231] to-[#FFD93D] text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md hover:brightness-105 active:scale-95 cursor-pointer transition-all"
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>Get VIP Priority Access</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5 pb-8">
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
          className={`col-span-2 sm:col-span-1 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 sm:border-3 transition-all group/gen relative overflow-hidden cursor-pointer active:scale-95 min-h-[90px] sm:min-h-[220px] ${
            isGenerating 
              ? 'opacity-50 cursor-not-allowed border-amber-300 bg-amber-50' 
              : isPro 
                ? 'border-[#FFD93D] bg-gradient-to-r sm:bg-gradient-to-b from-[#FFFDF0] to-[#FFF9DE] hover:shadow-xl hover:-translate-y-1' 
                : 'border-[#F1C40F] bg-gradient-to-r sm:bg-gradient-to-b from-[#FFF9E6] to-[#FFF0C2] hover:shadow-lg'
          }`}
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FFD93D]/30 rounded-full blur-2xl pointer-events-none" />
          
          <div className={`w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg group-hover/gen:scale-110 group-hover/gen:rotate-6 transition-transform relative z-10 shrink-0 ${
            isPro 
              ? 'bg-gradient-to-tr from-[#FF9F43] to-[#FFD93D] text-white' 
              : 'bg-gradient-to-tr from-[#F39C12] to-[#F1C40F] text-white'
          }`}>
            <Wand2 className="w-5 h-5 sm:w-8 sm:h-8 drop-shadow-sm" />
          </div>

          <div className="text-left sm:text-center relative z-10 flex-1 min-w-0">
            <span className="block font-black text-[#2D3436] text-sm sm:text-lg font-display truncate">
              ✨ Magic AI Artist
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-[#9C7A14] mt-0.5 block truncate">
              {isPro ? 'Generate custom drawing' : 'Unlimited AI Art'}
            </span>
          </div>

          {!isPro && (
            <div className="flex items-center gap-1 bg-[#FFD93D] text-[#7A4B00] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black shadow-sm shrink-0">
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              VIP Magic
            </div>
          )}
        </button>

        {/* Photo to Line Art Card */}
        {onOpenPhotoArt && (
          <button
            onClick={() => {
              playPop();
              onOpenPhotoArt();
            }}
            className="col-span-2 sm:col-span-1 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-[#86EFAC] bg-gradient-to-r sm:bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7] hover:shadow-xl hover:-translate-y-1 transition-all group/photo relative overflow-hidden cursor-pointer active:scale-95 min-h-[90px] sm:min-h-[220px]"
          >
            <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#16A34A] to-[#4ADE80] text-white flex items-center justify-center shadow-md sm:shadow-lg group-hover/photo:scale-110 group-hover/photo:rotate-6 transition-transform relative z-10 shrink-0">
              <Camera className="w-5 h-5 sm:w-8 sm:h-8 drop-shadow-sm" />
            </div>

            <div className="text-left sm:text-center relative z-10 flex-1 min-w-0">
              <span className="block font-black text-[#2D3436] text-sm sm:text-lg font-display truncate">
                📸 Photo to Coloring
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#15803D] mt-0.5 block truncate">
                Turn pets & photos into art
              </span>
            </div>

            {!isPro && (
              <div className="flex items-center gap-1 bg-[#FFD93D] text-[#7A4B00] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black shadow-sm shrink-0">
                <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                VIP
              </div>
            )}
          </button>
        )}

        {/* Static Coloring Page Cards */}
        {filteredTemplates.map((template) => {
          const isLocked = Boolean(template.isVip && !isPro);
          return (
            <button
              key={template.id || template.name}
              onClick={() => {
                if (isLocked) {
                  playChime();
                  setShowUpgradeModal(true);
                  return;
                }
                playPop();
                selectTemplate(template);
              }}
              className={`flex flex-col items-center gap-2 sm:gap-2.5 p-2 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border-2 transition-all group/card relative text-left cursor-pointer active:scale-95 ${
                isLocked
                  ? 'border-[#FFEAA7] hover:border-[#F1C40F] hover:bg-[#FFFDF7]'
                  : 'border-[#EBE8DC] hover:border-[#4D96FF] hover:bg-[#F9FCFF] hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {template.difficulty && !isLocked && (
                <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm border border-[#EBE8DC] px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-[#4D96FF] shadow-sm flex items-center gap-1 z-10">
                  <Award className="w-3 h-3" />
                  {template.difficulty}
                </div>
              )}

              {isLocked && (
                <div className="absolute top-2.5 left-2.5 bg-[#FFD93D] text-[#7A4B00] px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1 z-10">
                  <Crown className="w-2.5 h-2.5 fill-current" />
                  <span>VIP</span>
                </div>
              )}

              <div className="w-full aspect-square bg-[#FAF9F5] rounded-2xl border border-[#EDEAE0] p-3 flex items-center justify-center overflow-hidden group-hover/card:scale-[1.03] transition-transform relative">
                <svg viewBox={template.viewBox} className={`w-full h-full drop-shadow-xs ${isLocked ? 'opacity-85' : ''}`}>
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
          );
        })}
      </div>

      {/* Educational & Legal Footer */}
      <footer className="mt-8 pt-6 pb-8 border-t border-[#EBE8DC] text-center text-xs text-[#888] space-y-2">
        <p className="font-bold text-[#666]">
          Coloro by Storywalla — AI-Powered Educational Coloring Studio for Kids
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap text-xs font-bold text-[#555]">
          <a href="#contact" className="hover:text-[#4D96FF]">Contact Us</a>
          <span>•</span>
          <a href="#terms" className="hover:text-[#4D96FF]">Terms & Conditions</a>
          <span>•</span>
          <a href="#refund" className="hover:text-[#4D96FF]">Refunds & Cancellations</a>
          <span>•</span>
          <a href="#privacy" className="hover:text-[#4D96FF]">Privacy Policy</a>
          <span>•</span>
          <a href="#pricing" className="hover:text-[#4D96FF]">Pricing (INR)</a>
          <span>•</span>
          <a href="mailto:support@coloro.in" className="hover:text-[#4D96FF]">support@coloro.in</a>
        </div>
        <p className="text-[11px] text-[#A0A0A0]">
          100% Ad-Free • Kid-Safe • Non-Recurring One-Time Passes
        </p>
      </footer>
    </motion.div>
  );
};

export default TemplateGrid;