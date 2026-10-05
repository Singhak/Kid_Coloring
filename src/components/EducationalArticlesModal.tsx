import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  X, 
  Sparkles, 
  Brain, 
  Palette, 
  Heart, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Printer,
  Wand2
} from 'lucide-react';
import { EDUCATIONAL_ARTICLES, Article } from '../constants/articles';
import { playClick, playPop } from '../services/soundEffects';

interface EducationalArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMagicAI?: () => void;
  onPrintSheet?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Development: <Brain className="w-4 h-4 text-[#4D96FF]" />,
  'Color Psychology': <Palette className="w-4 h-4 text-[#FF6B6B]" />,
  'Creative Learning': <Sparkles className="w-4 h-4 text-[#FFD93D]" />,
  Mindfulness: <Heart className="w-4 h-4 text-[#6BCB77]" />
};

const EducationalArticlesModal: React.FC<EducationalArticlesModalProps> = ({
  isOpen,
  onClose,
  onOpenMagicAI,
  onPrintSheet
}) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(EDUCATIONAL_ARTICLES[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Development', 'Color Psychology', 'Creative Learning', 'Mindfulness'];

  const filteredArticles = activeCategory === 'All'
    ? EDUCATIONAL_ARTICLES
    : EDUCATIONAL_ARTICLES.filter(a => a.category === activeCategory);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playClick();
            onClose();
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-5xl bg-[#FFFDF9] rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-3 sm:border-4 border-[#FFD93D] my-auto flex flex-col max-h-[92vh] z-10"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-[#EBE8DC] bg-white/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-[#4D96FF] via-[#6BCB77] to-[#FFD93D] rounded-2xl flex items-center justify-center text-white shadow-md rotate-2">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#2D3748]">Parent & Educator Guide</h2>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs font-black rounded-full uppercase tracking-wider">
                    Research Backed
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#718096]">
                  The developmental science of colors, motor skills, and calm screen time
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-[#F7FAFC] hover:bg-[#EDF2F7] text-[#4A5568] flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-sm"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar: Article List */}
            <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-[#EBE8DC] bg-[#FAF8F5] flex flex-col shrink-0">
              {/* Category Pills */}
              <div className="p-3 sm:p-4 border-b border-[#EBE8DC] overflow-x-auto flex gap-1.5 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      playPop();
                      setActiveCategory(cat);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#2D3748] text-white shadow-sm'
                        : 'bg-white text-[#718096] hover:bg-[#EDF2F7] border border-[#E2E8F0]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Articles Scrollable List */}
              <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 max-h-56 md:max-h-none">
                {filteredArticles.map(article => {
                  const isSelected = selectedArticle?.id === article.id;
                  return (
                    <button
                      key={article.id}
                      onClick={() => {
                        playClick();
                        setSelectedArticle(article);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer border flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-white border-[#4D96FF] shadow-md ring-2 ring-[#4D96FF]/20'
                          : 'bg-white/60 hover:bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A5568]">
                          {CATEGORY_ICONS[article.category]}
                          {article.category}
                        </span>
                        <span className="text-[11px] font-medium text-[#A0AEC0] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                      </div>
                      <h4 className={`text-sm font-black leading-snug ${isSelected ? 'text-[#1E40AF]' : 'text-[#2D3748]'}`}>
                        {article.title}
                      </h4>
                      <p className="text-xs text-[#718096] line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Panel: Selected Article Reader */}
            {selectedArticle && (
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white space-y-6">
                {/* Article Header */}
                <div className="space-y-3 pb-5 border-b border-[#E2E8F0]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#EFF6FF] text-[#1D4ED8]">
                      {CATEGORY_ICONS[selectedArticle.category]}
                      {selectedArticle.category}
                    </span>
                    <span className="text-xs font-bold text-[#718096] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedArticle.readTime}
                    </span>
                    <span className="text-xs font-semibold text-[#A0AEC0]">• Updated {selectedArticle.datePublished}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] leading-tight">
                    {selectedArticle.title}
                  </h1>
                  <p className="text-base sm:text-lg font-medium text-[#4A5568] leading-relaxed">
                    {selectedArticle.subtitle}
                  </p>
                </div>

                {/* Key Takeaways Callout */}
                <div className="bg-[#FEFCE8] border-2 border-[#FEF08A] rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-black text-[#854D0E]">
                    <Sparkles className="w-4 h-4 text-[#EAB308]" />
                    <span>Key Takeaways for Parents & Educators</span>
                  </div>
                  <ul className="space-y-2">
                    {selectedArticle.takeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-[#713F12]">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Article Body Content */}
                <div className="space-y-6 text-[#2D3748]">
                  {selectedArticle.content.map((section, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <h3 className="text-lg sm:text-xl font-black text-[#1F2937]">
                        {section.heading}
                      </h3>
                      {section.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="text-sm sm:text-base leading-relaxed text-[#4B5563]">
                          {p}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Interactive Action Footer */}
                <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-black text-[#1E293B]">Ready to put theory into practice?</h4>
                    <p className="text-xs font-medium text-[#64748B]">
                      Try coloring an AI-generated scene or print physical sheets for your child.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {onOpenMagicAI && (
                      <button
                        onClick={() => {
                          playClick();
                          onClose();
                          onOpenMagicAI();
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF6B6B] to-[#FFD93D] text-white font-black text-xs sm:text-sm rounded-xl hover:shadow-md transition-transform hover:scale-102 cursor-pointer"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>Generate AI Page</span>
                      </button>
                    )}
                    {onPrintSheet && (
                      <button
                        onClick={() => {
                          playClick();
                          onClose();
                          onPrintSheet();
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-[#CBD5E1] text-[#334155] font-black text-xs sm:text-sm rounded-xl hover:bg-[#F1F5F9] transition-transform hover:scale-102 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Sheet</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EducationalArticlesModal;
