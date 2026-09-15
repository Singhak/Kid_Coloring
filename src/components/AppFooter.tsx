import React from 'react';
import { Crown, Mail, ShieldCheck, FileText, CreditCard } from 'lucide-react';
import { playClick } from '../services/soundEffects';

interface AppFooterProps {
  onOpenPricingPage?: () => void;
  onOpenArticles?: () => void;
  onOpenChatBot?: () => void;
  onOpenLegalPage?: (tab: 'contact' | 'terms' | 'refund' | 'privacy') => void;
}

const AppFooter: React.FC<AppFooterProps> = ({ 
  onOpenPricingPage, 
  onOpenArticles,
  onOpenChatBot,
  onOpenLegalPage
}) => {
  return (
    <footer className="py-2 px-3 sm:px-6 text-center text-[11px] sm:text-xs font-bold text-[#666] shrink-0 border-t border-[#EBE8DC]/80 bg-white/70 backdrop-blur-xs flex flex-col items-center gap-1.5 select-none">
      {/* Top Row: App Navigation & Highlights */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
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
              <span>📚 Parent Guide</span>
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
              <span>Plans & Pricing (INR)</span>
            </button>
          </>
        )}
      </div>

      {/* Bottom Row: Mandatory Merchant Compliance Policy Links (Cashfree & Regulatory) */}
      <div className="flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3.5 gap-y-1 text-[10px] sm:text-[11px] text-[#777] font-bold">
        {onOpenLegalPage ? (
          <>
            <button
              onClick={() => {
                playClick();
                onOpenLegalPage('contact');
              }}
              className="hover:text-[#EC4899] font-black text-[#555] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-[#EC4899]" />
              <span>Contact Us</span>
            </button>
            <span className="text-[#CCC]">•</span>
            <button
              onClick={() => {
                playClick();
                onOpenLegalPage('terms');
              }}
              className="hover:text-[#3B82F6] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <FileText className="w-3 h-3 text-[#3B82F6]" />
              <span>Terms & Conditions</span>
            </button>
            <span className="text-[#CCC]">•</span>
            <button
              onClick={() => {
                playClick();
                onOpenLegalPage('refund');
              }}
              className="hover:text-[#F59E0B] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <CreditCard className="w-3 h-3 text-[#F59E0B]" />
              <span>Refunds & Cancellations</span>
            </button>
            <span className="text-[#CCC]">•</span>
            <button
              onClick={() => {
                playClick();
                onOpenLegalPage('privacy');
              }}
              className="hover:text-[#10B981] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-[#10B981]" />
              <span>Privacy Policy</span>
            </button>
            <span className="text-[#CCC]">•</span>
            <a
              href="mailto:support@coloro.in"
              className="hover:text-[#4D96FF] text-[#555] hover:underline font-black inline-flex items-center gap-1"
            >
              <span>support@coloro.in</span>
            </a>
          </>
        ) : (
          <>
            <a href="#contact-us" className="hover:text-[#EC4899] hover:underline">Contact Us</a>
            <span className="text-[#CCC]">•</span>
            <a href="#terms" className="hover:text-[#3B82F6] hover:underline">Terms & Conditions</a>
            <span className="text-[#CCC]">•</span>
            <a href="#refund-policy" className="hover:text-[#F59E0B] hover:underline">Refunds & Cancellations</a>
            <span className="text-[#CCC]">•</span>
            <a href="#privacy" className="hover:text-[#10B981] hover:underline">Privacy Policy</a>
            <span className="text-[#CCC]">•</span>
            <a href="mailto:support@coloro.in" className="hover:underline font-black">support@coloro.in</a>
          </>
        )}
      </div>
    </footer>
  );
};

export default AppFooter;