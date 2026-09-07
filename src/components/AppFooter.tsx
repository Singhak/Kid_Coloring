import React from 'react';
import { Crown } from 'lucide-react';
import { playClick } from '../services/soundEffects';

interface AppFooterProps {
  onOpenPricingPage?: () => void;
  onOpenArticles?: () => void;
  onOpenChatBot?: () => void;
}

const AppFooter: React.FC<AppFooterProps> = ({ 
  onOpenPricingPage, 
  onOpenArticles,
  onOpenChatBot 
}) => {
  return (
    <footer className="py-2.5 px-4 text-center text-xs font-bold text-[#888] shrink-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t border-[#EBE8DC]/60 bg-white/40">
      <span>Made with <span className="text-[#FF6B6B]">❤️</span> for little artists & creative minds</span>

      {onOpenChatBot && (
        <>
          <span className="hidden sm:inline text-[#CCC]">•</span>
          <button
            onClick={() => {
              playClick();
              onOpenChatBot();
            }}
            className="inline-flex items-center gap-1 text-[#4D96FF] hover:text-[#2563EB] font-black hover:underline cursor-pointer transition-colors"
          >
            <span>🤖 Ask Coloro Bot</span>
          </button>
        </>
      )}

      {onOpenArticles && (
        <>
          <span className="hidden sm:inline text-[#CCC]">•</span>
          <button
            onClick={() => {
              playClick();
              onOpenArticles();
            }}
            className="inline-flex items-center gap-1 text-[#059669] hover:text-[#047857] font-black hover:underline cursor-pointer transition-colors"
          >
            <span>📚 Benefits of Coloring (Parent Guide)</span>
          </button>
        </>
      )}

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
            <span>Compare Free vs VIP</span>
          </button>
        </>
      )}
    </footer>
  );
};

export default AppFooter;