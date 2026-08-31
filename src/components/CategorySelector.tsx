import React from 'react';
import { CATEGORIES } from '../constants';
import { playPop } from '../services/soundEffects';

interface CategorySelectorProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  setShowTemplates: (show: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  currentGenerationId: React.MutableRefObject<number>;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  setSelectedCategory,
  setShowTemplates,
  setIsGenerating,
  currentGenerationId,
}) => {
  return (
    <div className="w-full flex items-center justify-start sm:justify-center overflow-hidden shrink-0">
      <div className="flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border-2 border-[#EBE8DC] shadow-sm overflow-x-auto no-scrollbar max-w-full">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                playPop();
                setSelectedCategory(cat.id);
                setShowTemplates(true);
                setIsGenerating(false);
                currentGenerationId.current++;
              }}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer
                ${isSelected
                  ? 'text-white shadow-md transform -translate-y-0.5 scale-105'
                  : 'bg-[#F7F5EC] text-[#636E72] hover:bg-[#EFECE0] hover:text-[#2D3436]'}
              `}
              style={{
                backgroundColor: isSelected ? cat.color : undefined,
                boxShadow: isSelected ? `0 4px 14px ${cat.color}66` : undefined
              }}
            >
              <span className="text-base sm:text-lg select-none">{cat.emoji || '🎨'}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;