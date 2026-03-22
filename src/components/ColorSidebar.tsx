/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Eraser, Crown, X } from 'lucide-react';
import { COLORS_LEFT, COLORS_RIGHT, PRO_COLORS } from '../constants';

interface ColorSidebarProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  isPro: boolean;
  showProColors: boolean;
  setShowProColors: (show: boolean) => void;
  setShowUpgradeModal: (show: boolean) => void;
  side: 'left' | 'right';
}

const ColorSidebar: React.FC<ColorSidebarProps> = ({ 
  selectedColor, 
  setSelectedColor, 
  isPro, 
  showProColors, 
  setShowProColors, 
  setShowUpgradeModal,
  side 
}) => {
  const colors = side === 'left' ? COLORS_LEFT : COLORS_RIGHT;

  return (
    <aside className="hidden lg:flex flex-col gap-3 p-4 bg-white rounded-3xl border-2 border-[#E6E6E6] shadow-sm overflow-y-auto no-scrollbar w-24 shrink-0">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => setSelectedColor(color)}
          className={`
            w-12 h-12 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm
            ${selectedColor === color ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border border-black/5'}
          `}
          style={{ backgroundColor: color }}
        />
      ))}

      {side === 'left' && (
        <>
          <button
            onClick={() => setSelectedColor('#FFFFFF')}
            className={`
              w-12 h-12 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm flex items-center justify-center bg-white border-2
              ${selectedColor === '#FFFFFF' ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border-[#E6E6E6]'}
            `}
          >
            <Eraser className="w-6 h-6 text-[#A0A0A0]" />
          </button>

          <div className="relative">
            <button
              onClick={() => {
                if (!isPro) {
                  setShowUpgradeModal(true);
                  return;
                }
                setShowProColors(!showProColors);
              }}
              className={`
                w-12 h-12 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm flex items-center justify-center bg-gradient-to-br from-[#FF6B6B] via-[#4D96FF] to-[#6BCB77] text-white relative
                ${showProColors ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : ''}
              `}
            >
              <Palette className="w-6 h-6" />
              {!isPro && (
                <div className="absolute -top-1 -right-1 bg-[#FFD93D] text-white p-0.5 rounded-md shadow-sm border border-white">
                  <Crown className="w-2.5 h-2.5" />
                </div>
              )}
            </button>

            <AnimatePresence>
              {showProColors && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute left-full ml-4 top-0 bg-white p-4 rounded-3xl border-2 border-[#E6E6E6] shadow-2xl z-50 w-64"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-black text-[#2D3436] uppercase tracking-wider">Magic Palette</span>
                    <button onClick={() => setShowProColors(false)} className="p-1 hover:bg-[#F5F5F5] rounded-lg">
                      <X className="w-4 h-4 text-[#A0A0A0]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {PRO_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setShowProColors(false);
                        }}
                        className={`
                          w-10 h-10 rounded-xl transition-all transform hover:scale-110 active:scale-90 shadow-sm
                          ${selectedColor === color ? 'ring-2 ring-[#4D96FF] ring-offset-1 scale-110' : 'border border-black/5'}
                        `}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </aside>
  );
};

export default ColorSidebar;
