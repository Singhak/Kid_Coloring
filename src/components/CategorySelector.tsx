import React from 'react';
import { CATEGORIES } from '../constants';

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
    <div className="flex gap-2 p-2 bg-white rounded-2xl border-2 border-[#E6E6E6] overflow-x-auto no-scrollbar shrink-0">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => {
            setSelectedCategory(cat.id);
            setShowTemplates(true);
            setIsGenerating(false);
            currentGenerationId.current++;
          }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap active:scale-95
            ${selectedCategory === cat.id
              ? 'text-white shadow-md'
              : 'bg-[#F5F5F5] text-[#A0A0A0] hover:bg-[#EEEEEE]'}
          `}
          style={{ backgroundColor: selectedCategory === cat.id ? cat.color : undefined }}
        >
          <cat.icon className="w-4 h-4" />
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;