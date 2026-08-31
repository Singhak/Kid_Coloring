import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Sparkles, 
  Printer, 
  X, 
  Palette, 
  CheckCircle2, 
  ShieldCheck, 
  HeartHandshake, 
  Lock, 
  ArrowRight,
  Star
} from 'lucide-react';
import { playChime, playClick, playPop } from '../services/soundEffects';

interface UpgradeModalProps {
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  user: any;
  isPro: boolean;
  trialEndDate: Date | null;
  isSubscribed: boolean;
  handleLogin: () => void;
  handleSubscribe: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  showUpgradeModal,
  setShowUpgradeModal,
  user,
  trialEndDate,
  isSubscribed,
  handleLogin,
  handleSubscribe,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [showParentGate, setShowParentGate] = useState(false);
  const [gateNum1, setGateNum1] = useState(3);
  const [gateNum2, setGateNum2] = useState(5);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);

  const now = new Date();
  const isTrialActive = trialEndDate && trialEndDate.getTime() > now.getTime();
  const daysRemaining = trialEndDate ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  useEffect(() => {
    if (showUpgradeModal) {
      playChime();
      setShowParentGate(false);
      setGateAnswer('');
      setGateError(false);
      // Generate random parent gate math challenge
      const n1 = Math.floor(Math.random() * 6) + 3;
      const n2 = Math.floor(Math.random() * 6) + 2;
      setGateNum1(n1);
      setGateNum2(n2);
    }
  }, [showUpgradeModal]);

  const handleStartCheckout = () => {
    playClick();
    if (!user) {
      handleLogin();
      return;
    }
    // Open parental gate before final payment
    setShowParentGate(true);
  };

  const handleVerifyParentGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateAnswer.trim(), 10) === gateNum1 + gateNum2) {
      playPop();
      setShowParentGate(false);
      handleSubscribe();
    } else {
      setGateError(true);
      playPop(200);
    }
  };

  return (
    <AnimatePresence>
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playClick();
              setShowUpgradeModal(false);
            }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-[#FFF2B2] my-auto z-10 max-h-[95vh] flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                playClick();
                setShowUpgradeModal(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-all z-20 cursor-pointer text-[#888]"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Top Header Background */}
            <div className="bg-gradient-to-b from-[#FFF8D6] via-[#FFFDF5] to-white p-6 pb-3 pt-7 text-center relative shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFD93D]/30 border border-[#FFD93D] rounded-full text-[#8C5B00] text-xs font-black mb-3">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>KIDCOLOR MAGIC VIP PASS</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#2D3436] font-display">
                {isSubscribed ? "You're a VIP Explorer! 🌟" : "Unlock Unlimited Creative Magic"}
              </h2>
              <p className="text-xs sm:text-sm text-[#636E72] font-semibold mt-1">
                {isTrialActive 
                  ? `✨ Trial Active (${daysRemaining} days left). Subscribe to keep the magic!` 
                  : "Empower your child's imagination with AI line art & home printing"}
              </p>
            </div>

            {/* Scrollable Content Body */}
            <div className="px-6 py-2 overflow-y-auto space-y-4">
              {/* Pricing Plan Selector */}
              {!isSubscribed && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Annual Plan (Best Value) */}
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setSelectedPlan('annual');
                    }}
                    className={`relative p-3.5 rounded-3xl border-3 text-left transition-all cursor-pointer ${
                      selectedPlan === 'annual'
                        ? 'border-[#FF9F43] bg-[#FFFBF0] shadow-md -translate-y-0.5'
                        : 'border-[#EBE8DC] bg-white hover:border-[#FFD93D]'
                    }`}
                  >
                    <div className="absolute -top-3 right-3 bg-gradient-to-r from-[#FF6B6B] to-[#FA8231] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase">
                      Save 60% • Most Popular
                    </div>
                    <span className="block font-black text-sm text-[#2D3436]">Annual Pass</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl sm:text-2xl font-black text-[#2D3436]">₹499</span>
                      <span className="text-xs font-bold text-[#888]">/ year</span>
                    </div>
                    <span className="block text-[11px] font-black text-[#10B981] mt-1">
                      ✨ 7-Day Free Trial Included
                    </span>
                  </button>

                  {/* Monthly Plan */}
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setSelectedPlan('monthly');
                    }}
                    className={`relative p-3.5 rounded-3xl border-3 text-left transition-all cursor-pointer ${
                      selectedPlan === 'monthly'
                        ? 'border-[#4D96FF] bg-[#F4F9FF] shadow-md -translate-y-0.5'
                        : 'border-[#EBE8DC] bg-white hover:border-[#4D96FF]'
                    }`}
                  >
                    <span className="block font-black text-sm text-[#2D3436]">Monthly Pass</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl sm:text-2xl font-black text-[#2D3436]">₹99</span>
                      <span className="text-xs font-bold text-[#888]">/ mo</span>
                    </div>
                    <span className="block text-[11px] font-semibold text-[#888] mt-1">
                      Billed monthly • Cancel anytime
                    </span>
                  </button>
                </div>
              )}

              {/* Core VIP Value Highlights */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 bg-[#FFFDF0] rounded-2xl border border-[#FFD93D]/40">
                  <div className="w-8 h-8 rounded-xl bg-[#FFD93D] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-black text-xs text-[#2D3436]">1-Click Printable PDF Coloring Sheets</span>
                    <span className="text-[10px] text-[#7F8C8D]">Print unlimited A4 coloring sheets for real crayons at home</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-[#F0F8FF] rounded-2xl border border-[#4D96FF]/30">
                  <div className="w-8 h-8 rounded-xl bg-[#4D96FF] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-black text-xs text-[#2D3436]">Unlimited AI Magic Line Art Generator</span>
                    <span className="text-[10px] text-[#7F8C8D]">Type any prompt (e.g. "Dinosaur eating pizza") & AI draws it</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-[#FAF5FF] rounded-2xl border border-[#9B72AA]/30">
                  <div className="w-8 h-8 rounded-xl bg-[#9B72AA] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-black text-xs text-[#2D3436]">50+ Magic Pro Color Palettes</span>
                    <span className="text-[10px] text-[#7F8C8D]">Pastels, skin tones, vibrant neons, and earth shades</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                </div>
              </div>

              {/* Parent Testimonial Quote */}
              <div className="p-3 bg-[#FBF9F1] rounded-2xl border border-[#EBE8DC] text-center">
                <div className="flex items-center justify-center gap-1 text-[#FFB800] mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className="text-[11px] font-bold text-[#555] italic">
                  "My 5-year-old creates custom coloring books every weekend. Huge money saver on physical books!"
                </p>
                <span className="block text-[10px] font-black text-[#888] mt-0.5">— Priya S., Parent</span>
              </div>
            </div>

            {/* Footer Action Area */}
            <div className="p-6 pt-3 bg-white border-t border-[#EBE8DC] shrink-0">
              {/* Parental Gate Modal Screen */}
              {showParentGate ? (
                <form onSubmit={handleVerifyParentGate} className="space-y-3">
                  <div className="p-3 bg-[#FFFDF0] rounded-2xl border-2 border-[#FFD93D] text-center">
                    <span className="flex items-center justify-center gap-1.5 text-xs font-black text-[#7A4B00] mb-1">
                      <Lock className="w-3.5 h-3.5" /> Parental Security Check
                    </span>
                    <p className="text-xs font-bold text-[#444]">
                      Please solve: <span className="text-base font-black text-[#2D3436] px-2 py-0.5 bg-white rounded-lg shadow-xs">{gateNum1} + {gateNum2} = ?</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={gateAnswer}
                      onChange={(e) => {
                        setGateAnswer(e.target.value);
                        setGateError(false);
                      }}
                      placeholder="Answer..."
                      className="flex-1 px-4 py-3 bg-[#F7F5EC] border-2 border-[#EBE8DC] focus:border-[#4D96FF] rounded-xl text-center font-black text-lg outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="btn-bubbly px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-black rounded-xl shadow-md cursor-pointer"
                    >
                      Verify & Pay
                    </button>
                  </div>

                  {gateError && (
                    <p className="text-[11px] font-bold text-[#FF6B6B] text-center">
                      Incorrect answer. Please try again.
                    </p>
                  )}
                </form>
              ) : (
                <>
                  <button
                    onClick={handleStartCheckout}
                    className="btn-bubbly w-full py-4 bg-gradient-to-r from-[#FF6B6B] via-[#FA8231] to-[#FFD93D] text-white font-black text-base sm:text-lg rounded-2xl shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {user 
                        ? (selectedPlan === 'annual' ? 'Start 7-Day Free Trial' : 'Subscribe to Monthly Pass')
                        : 'Sign In & Start Free Trial'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="flex items-center justify-center gap-4 mt-3 text-[11px] font-bold text-[#888]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> 100% Ad-Free & Child-Safe
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-[#4D96FF]" /> Cancel Anytime
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;