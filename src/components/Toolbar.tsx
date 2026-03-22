/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Undo2, Redo2, Trash2, Sparkles, Wand2, Crown } from 'lucide-react';

interface ToolbarProps {
  brushSize: number;
  setBrushSize: (size: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isPro: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  brushSize, 
  setBrushSize, 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo, 
  onClear, 
  onGenerate, 
  isGenerating,
  isPro
}) => {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6 bg-white border-t border-[#E6E6E6] shadow-lg rounded-t-[2.5rem] sm:rounded-t-[3.5rem] sticky bottom-0 z-50">
      <div className="flex items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-1 sm:gap-2 bg-[#F5F5F5] p-1.5 sm:p-2 rounded-2xl border border-[#E6E6E6]">
          <button 
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 sm:p-3 rounded-xl transition-all active:scale-90 ${canUndo ? 'hover:bg-white text-[#2D3436] shadow-sm' : 'text-[#A0A0A0] cursor-not-allowed opacity-50'}`}
            title="Undo"
          >
            <Undo2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button 
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 sm:p-3 rounded-xl transition-all active:scale-90 ${canRedo ? 'hover:bg-white text-[#2D3436] shadow-sm' : 'text-[#A0A0A0] cursor-not-allowed opacity-50'}`}
            title="Redo"
          >
            <Redo2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <button 
          onClick={onClear}
          className="p-3 sm:p-4 hover:bg-[#FFF0F0] text-[#A0A0A0] hover:text-[#FF6B6B] rounded-2xl transition-all active:scale-90 border border-transparent hover:border-[#FFD6D6]"
          title="Clear All"
        >
          <Trash2 className="w-5 h-5 sm:w-7 sm:h-7" />
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-8 flex-1 justify-center max-w-md px-4">
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] sm:text-xs font-black text-[#2D3436] uppercase tracking-widest">Brush Size</span>
            <span className="text-[10px] sm:text-xs font-bold text-[#A0A0A0]">{brushSize}px</span>
          </div>
          <input
            type="range"
            min="2"
            max="40"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full h-2 sm:h-3 bg-[#F5F5F5] rounded-full appearance-none cursor-pointer accent-[#4D96FF] border border-[#E6E6E6]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className={`
            group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-3xl font-black text-sm sm:text-xl transition-all active:scale-95 shadow-xl overflow-hidden
            ${isGenerating ? 'bg-[#A0A0A0] cursor-not-allowed' : 'bg-gradient-to-r from-[#FFD93D] via-[#FFD93D] to-[#FFC048] hover:shadow-[#FFD93D]/30 text-[#2D3436]'}
          `}
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
          {isGenerating ? (
            <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 animate-spin" />
          ) : (
            <Wand2 className="w-5 h-5 sm:w-7 sm:h-7 group-hover:rotate-12 transition-transform" />
          )}
          <span className="uppercase tracking-tight">{isGenerating ? 'Magic...' : 'Magic'}</span>
          {!isPro && <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-[#2D3436]/40" />}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
