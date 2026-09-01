import React from 'react';
import { Crown } from 'lucide-react';
import { playClick } from '../services/soundEffects';

interface AppFooterProps {
  onOpenPricingPage?: () => void;
}

const AppFooter: React.FC<AppFooterProps> = ({ onOpenPricingPage }) => {
  return (
    <footer className="py-2.5 px-4 text-center text-xs font-bold text-[#888] shrink-0 flex flex-col sm:flex-row items-center justify-center gap-2 border-t border-[#EBE8DC]/60 bg-white/40">
      <span>Made with <span className="text-[#FF6B6B]">❤️</span> for little artists & creative minds</span>
      {onOpenPricingPage && (
        <>
          <span className="hidden sm:inline text-[#CCC]">•</span>
          <button
            onClick={() => {
              playClick();
              onOpenPricingPage();
            }}
            className="inline-flex items-center gap-1 text-[#D97706] hover:text-[#B45309] font-black hover:underline cursor-pointer transition-colors"
          >
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>Compare Free vs VIP Features</span>
          </button>
        </>
      )}
    </footer>
  );
};

export default AppFooter;