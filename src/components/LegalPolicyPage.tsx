import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  Printer, 
  Mail, 
  ExternalLink,
  Sparkles,
  Lock,
  AlertCircle
} from 'lucide-react';
import { LEGAL_DOCUMENTS, LegalDocument } from '../constants/legalPolicies';
import { playClick } from '../services/soundEffects';

export type LegalTabType = 'contact' | 'terms' | 'refund' | 'privacy';

interface LegalPolicyPageProps {
  initialTab?: LegalTabType;
  onBack: () => void;
  onOpenPricing?: () => void;
}

const TAB_CONFIG: { id: LegalTabType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'contact', label: 'Contact Us', icon: <Mail className="w-4 h-4" />, color: '#EC4899' },
  { id: 'terms', label: 'Terms & Conditions', icon: <FileText className="w-4 h-4" />, color: '#3B82F6' },
  { id: 'refund', label: 'Refund & Cancellation', icon: <CreditCard className="w-4 h-4" />, color: '#F59E0B' },
  { id: 'privacy', label: 'Privacy Policy', icon: <ShieldCheck className="w-4 h-4" />, color: '#10B981' },
];

const LegalPolicyPage: React.FC<LegalPolicyPageProps> = ({
  initialTab = 'privacy',
  onBack,
  onOpenPricing
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const doc: LegalDocument = LEGAL_DOCUMENTS[activeTab];

  const handleTabChange = (tab: LegalTabType) => {
    playClick();
    setActiveTab(tab);
    window.location.hash = tab === 'refund' ? 'refund-policy' : (tab === 'contact' ? 'contact-us' : tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FBF9F1] text-[#2D3436] font-sans flex flex-col selection:bg-[#FFD93D]/30">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#EBE8DC] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button & Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                playClick();
                onBack();
              }}
              className="btn-bubbly flex items-center gap-1.5 px-3.5 py-2 bg-[#F6F4EB] hover:bg-[#EFECE0] text-[#2D3436] font-black text-xs sm:text-sm rounded-2xl border border-[#E0DBCB] cursor-pointer transition-all active:scale-95"
              title="Return to Coloring Studio"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF6B6B]" />
              <span>Back to Studio</span>
            </button>

            <div className="h-6 w-px bg-[#E2DFD2] hidden sm:block" />

            <div className="flex items-center gap-2">
              <img
                src="/coloro-web-logo.png"
                alt="Coloro Logo"
                className="h-8 sm:h-9 w-auto object-contain drop-shadow-2xs"
              />
              <span className="hidden md:inline font-display font-black text-base text-[#2D3436]">
                Legal & Compliance Hub
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF9F5] text-[#555] font-bold text-xs rounded-xl border border-[#EBE8DC] cursor-pointer transition-all shadow-2xs"
              title="Print this policy document"
            >
              <Printer className="w-3.5 h-3.5 text-[#666]" />
              <span>Print Document</span>
            </button>

            {onOpenPricing && (
              <button
                onClick={() => {
                  playClick();
                  onOpenPricing();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFF9E6] hover:bg-[#FFF2B2] text-[#8C5B00] border border-[#FFD93D] font-black text-xs rounded-xl cursor-pointer transition-all shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF9F43]" />
                <span>View Plans & Pricing</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">
        {/* Policy Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-[#EFECE0]/70 rounded-2xl border border-[#E0DBCB] overflow-x-auto no-scrollbar self-start sm:self-center shadow-2xs">
          {TAB_CONFIG.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#2D3436] shadow-md scale-102 ring-1 ring-black/5'
                    : 'text-[#666] hover:text-[#2D3436] hover:bg-white/50'
                }`}
              >
                <span style={{ color: t.color }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Document Header Hero Card */}
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#EBE8DC] shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#FFF0F0] text-[#FF6B6B] border border-[#FF6B6B]/20">
                  <Lock className="w-3 h-3" />
                  {doc.badge}
                </span>
                <span className="text-xs font-bold text-[#888]">
                  Last Updated: {doc.lastUpdated}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2D3436] tracking-tight font-display">
                {doc.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#636E72] font-semibold max-w-3xl leading-relaxed">
                {doc.subtitle}
              </p>
            </div>

            {/* Quick Summary Pill based on Tab */}
            <div className="shrink-0 bg-[#FCFAF6] border border-[#EBE8DC] rounded-2xl p-4 sm:max-w-xs space-y-1.5">
              <span className="text-[11px] font-black uppercase text-[#888] tracking-wider block">
                Policy Highlights
              </span>
              {activeTab === 'privacy' && (
                <ul className="text-xs text-[#555] font-semibold space-y-1">
                  <li className="flex items-center gap-1.5 text-[#10B981]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Zero Third-Party Ads
                  </li>
                  <li className="flex items-center gap-1.5 text-[#10B981]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> COPPA & GDPR-K Compliant
                  </li>
                  <li className="flex items-center gap-1.5 text-[#10B981]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Photos Processed in Browser
                  </li>
                </ul>
              )}
              {activeTab === 'terms' && (
                <ul className="text-xs text-[#555] font-semibold space-y-1">
                  <li className="flex items-center gap-1.5 text-[#3B82F6]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Free Classroom & Home Printing
                  </li>
                  <li className="flex items-center gap-1.5 text-[#3B82F6]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Safe AI Guardrails & Filters
                  </li>
                  <li className="flex items-center gap-1.5 text-[#3B82F6]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Non-Recurring One-Time Purchases
                  </li>
                </ul>
              )}
              {activeTab === 'refund' && (
                <ul className="text-xs text-[#555] font-semibold space-y-1">
                  <li className="flex items-center gap-1.5 text-[#F59E0B]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> One-Time Pass (No Auto-Debits)
                  </li>
                  <li className="flex items-center gap-1.5 text-[#F59E0B]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Instant Digital Goods Fulfillment
                  </li>
                  <li className="flex items-center gap-1.5 text-[#10B981]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> 100% Refund for Failed Debits
                  </li>
                </ul>
              )}
            </div>
          </div>
        </motion.div>

        {/* Special Banner for Refund Tab highlighting non-recurring purchase */}
        {activeTab === 'refund' && (
          <div className="bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-[#92400E]">
            <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-black block text-[#B45309]">
                Important Information Regarding Purchases on Coloro:
              </strong>
              <p className="leading-relaxed font-semibold">
                All Coloro VIP Passes are strictly <strong>one-time, non-recurring purchases</strong>. You are never enrolled into an automatic recurring subscription or card auto-debit. Because access to digital assets, AI generation tokens, and vector templates is delivered immediately upon payment, <strong>purchases are non-refundable and all sales are final</strong>. We encourage you to enjoy our generous Free Forever tier before choosing to purchase.
              </p>
            </div>
          </div>
        )}

        {/* Policy Document Sections Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#EBE8DC] shadow-sm space-y-8 divide-y divide-[#F0ECE1]">
          {doc.sections.map((section, idx) => (
            <div key={section.id} className={idx > 0 ? 'pt-8 space-y-4' : 'space-y-4'}>
              <h2 className="text-lg sm:text-xl font-black text-[#2D3436] tracking-tight font-display flex items-center gap-2">
                <span>{section.title}</span>
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-[#555] font-medium leading-relaxed">
                {section.content.map((p, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {/* Subsections if any */}
              {section.subsections && section.subsections.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {section.subsections.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-[#FCFAF6] p-4 sm:p-5 rounded-2xl border border-[#EBE8DC] space-y-2"
                    >
                      <h3 className="text-xs sm:text-sm font-black text-[#2D3436]">
                        {sub.subtitle}
                      </h3>
                      <ul className="space-y-1.5 text-xs text-[#636E72] font-semibold leading-relaxed">
                        {sub.details.map((d, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-1.5">
                            <span className="text-[#4D96FF] font-black">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help & Support Contact Footer Card */}
        <div className="bg-gradient-to-r from-[#FFFDF7] to-[#FAF8EF] border-2 border-[#EBE8DC] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-base font-black text-[#2D3436] block">
              Have Questions or Need Assistance with an Order?
            </span>
            <p className="text-xs text-[#777] font-semibold">
              Our parent & educator support team is here to assist with any billing or privacy requests.
            </p>
          </div>

          <a
            href="mailto:support@coloro.in"
            className="btn-bubbly inline-flex items-center gap-2 px-6 py-3 bg-[#4D96FF] hover:bg-[#3B82F6] text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95"
          >
            <Mail className="w-4 h-4" />
            <span>support@coloro.in</span>
          </a>
        </div>
      </main>

      {/* Global Bottom Footer */}
      <footer className="bg-white border-t-2 border-[#EBE8DC] py-6 px-4 sm:px-8 mt-12 text-center text-xs text-[#888] font-semibold">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Coloro (Storywalla). All rights reserved. Kid-safe digital art studio.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#666]">
            <button onClick={() => handleTabChange('contact')} className="hover:text-[#EC4899] cursor-pointer">
              Contact Us
            </button>
            <span>•</span>
            <button onClick={() => handleTabChange('terms')} className="hover:text-[#4D96FF] cursor-pointer">
              Terms & Conditions
            </button>
            <span>•</span>
            <button onClick={() => handleTabChange('refund')} className="hover:text-[#F59E0B] cursor-pointer">
              Refund & Cancellation
            </button>
            <span>•</span>
            <button onClick={() => handleTabChange('privacy')} className="hover:text-[#10B981] cursor-pointer">
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalPolicyPage;
