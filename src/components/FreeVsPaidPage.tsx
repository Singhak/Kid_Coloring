import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Crown, 
  Sparkles, 
  Printer, 
  Camera, 
  Check, 
  Minus, 
  Star, 
  ShieldCheck, 
  HeartHandshake, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle, 
  Palette, 
  Smile, 
  Hash, 
  Download, 
  Zap,
  ChevronDown
} from 'lucide-react';
import { playClick, playPop, playChime } from '../services/soundEffects';

interface FreeVsPaidPageProps {
  onBack: () => void;
  isPro: boolean;
  user: any;
  handleLogin: () => void;
  onOpenUpgradeModal: () => void;
}

const COMPARISON_ROWS = [
  {
    category: 'Creativity & Creation Tools',
    items: [
      { feature: '📸 Photo to Coloring Page (Turn real photos into coloring art)', free: '❌ Locked', vip: '✅ Unlimited Photos' },
      { feature: '🪄 AI Magic Line Art Generator (Type anything, AI draws it)', free: '1 preview/day', vip: '✅ Unlimited Prompts' },
      { feature: '✨ Special Glitter, Rainbow, & Pattern Fills', free: '❌ Locked', vip: '✅ 5 Special Fills' },
      { feature: '🌟 Collectible Sticker Stamps (Crowns, Dino, Bows)', free: '3 Basic Stamps', vip: '✅ All 20+ Stamps' },
      { feature: '🎨 Color Palette Selection', free: '12 Standard Colors', vip: '✅ 50+ Pro Pastels & Neons' },
    ]
  },
  {
    category: 'Learning & Educational Modes',
    items: [
      { feature: '🔢 Color by Number Guided Learning Mode', free: '❌ Locked', vip: '✅ Full 1-10 Phonics Access' },
      { feature: '🔤 Alphabet & Numbers A-Z Library', free: 'Sample 3 Pages', vip: '✅ Full Educational Library' },
      { feature: '🏆 Reward Fanfare & Progress Badges', free: 'Standard', vip: '✅ Full VIP Audio & Confetti' },
    ]
  },
  {
    category: 'Printing & Offline Real-Crayon Activities',
    items: [
      { feature: '🖨️ 1-Click Printable A4 Sheets (For home crayons)', free: 'Watermarked Low-Res', vip: '✅ Ultra-HD Crisp No Watermark' },
      { feature: '💾 High-Resolution Image Downloads', free: 'Standard Quality', vip: '✅ Studio Quality PNG' },
    ]
  },
  {
    category: 'Safety, Experience & Peace of Mind',
    items: [
      { feature: '🛡️ 100% Ad-Free Child Safe Environment', free: 'Banner Notices', vip: '✅ Guaranteed 100% Ad-Free' },
      { feature: '🔒 Parental Security Math Gate (No accidental clicks)', free: '✅ Included', vip: '✅ Included' },
      { feature: '🔄 New Weekly Pages & Updates', free: 'Monthly', vip: '✅ Priority Weekly Drops' }
    ]
  }
];

const FAQS = [
  {
    q: 'How does the 7-Day Free Trial work?',
    a: 'You get full, unlimited access to all VIP Superpowers (Photo to Art, AI generator, Glitter, unlimited PDF printing) for 7 days. You will not be charged if you cancel before the trial ends.'
  },
  {
    q: 'Can I print these sheets on my home printer for real crayons?',
    a: 'Yes! That is one of the favorite features for parents. You can print unlimited high-resolution A4 coloring sheets with crisp vector outlines for physical coloring at home.'
  },
  {
    q: 'How does "Photo to Coloring Page" work?',
    a: 'You upload or take a photo of your child, pet (dog, cat), favorite toy, or family vacation. Our client-side algorithm instantly turns it into a black-and-white coloring outline ready to color digitally or print.'
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. You can cancel with 1 click from your profile menu anytime with zero hassle or cancellation fees.'
  },
  {
    q: 'Is it completely safe and ad-free for young children?',
    a: 'Yes! KidColor is designed with strict child-safety standards. There are zero third-party ads, no external tracking, and purchases are protected behind a parental math challenge gate.'
  }
];

const FreeVsPaidPage: React.FC<FreeVsPaidPageProps> = ({
  onBack,
  isPro,
  user,
  handleLogin,
  onOpenUpgradeModal
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCtaClick = () => {
    playPop();
    if (!user) {
      handleLogin();
    } else {
      onOpenUpgradeModal();
    }
  };

  const toggleFaq = (index: number) => {
    playClick();
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full h-full bg-[#FDFCF7] overflow-y-auto font-sans text-[#2D3436] flex flex-col">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-[#EBE8DC] px-4 py-3 sm:px-8 flex items-center justify-between shadow-xs">
        <button
          onClick={() => {
            playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F5EC] hover:bg-[#EFECE0] text-[#2D3436] rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-black hidden sm:inline text-[#2D3436]">
            Kid<span className="text-[#FF6B6B]">Color</span> VIP Pass
          </span>
          <button
            onClick={handleCtaClick}
            className="btn-bubbly flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FF6B6B] via-[#FA8231] to-[#FFD93D] text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer hover:brightness-105"
          >
            <Crown className="w-4 h-4 fill-current" />
            <span>{isPro ? 'Manage VIP Pass' : 'Start 7-Day Free Trial'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-12">
        {/* 1. Hero Section */}
        <section className="text-center space-y-3.5 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFD93D]/30 border border-[#FFD93D] rounded-full text-[#8C5B00] text-xs font-black">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>THE ULTIMATE CREATIVE PASS FOR LITTLE ARTISTS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#2D3436] tracking-tight font-display">
            Why Thousands of Parents <br />
            <span className="bg-gradient-to-r from-[#FF6B6B] via-[#FA8231] to-[#FFD93D] bg-clip-text text-transparent">
              Upgrade to KidColor VIP
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#636E72] font-semibold max-w-2xl mx-auto leading-relaxed">
            Replace boring repetitive coloring apps and expensive paper books with AI drawing magic, photo-to-coloring outlines, and unlimited printable home activity packs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black text-[#555] pt-2">
            <span className="flex items-center gap-1 text-[#10B981]">
              <ShieldCheck className="w-4 h-4" /> 100% Ad-Free & Child-Safe
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#4D96FF]">
              <Printer className="w-4 h-4" /> Unlimited Home Printing
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#F59E0B]">
              <HeartHandshake className="w-4 h-4" /> Cancel Anytime
            </span>
          </div>
        </section>

        {/* 2. Key Superpowers Showcase Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-3xl border-2 border-[#EBE8DC] shadow-sm hover:border-[#4D96FF] transition-all space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[#EBF4FF] text-[#4D96FF] flex items-center justify-center font-black">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2D3436]">Photo to Coloring Page</h3>
            <p className="text-xs text-[#636E72] font-medium leading-relaxed">
              Upload photos of your child, pet, or family vacation and turn them into clean, printable coloring outlines instantly.
            </p>
          </div>

          <div className="p-5 bg-white rounded-3xl border-2 border-[#EBE8DC] shadow-sm hover:border-[#FFD93D] transition-all space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF9E6] text-[#D97706] flex items-center justify-center font-black">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2D3436]">Unlimited Magic AI Artist</h3>
            <p className="text-xs text-[#636E72] font-medium leading-relaxed">
              Type any prompt (e.g. *"Dinosaur eating pizza on Mars"*) and our AI sketches a tailored coloring book page in seconds.
            </p>
          </div>

          <div className="p-5 bg-white rounded-3xl border-2 border-[#EBE8DC] shadow-sm hover:border-[#10B981] transition-all space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center font-black">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2D3436]">1-Click Printable PDF Packs</h3>
            <p className="text-xs text-[#636E72] font-medium leading-relaxed">
              Print crisp, high-resolution A4 sheets with zero watermarks for physical screen-free coloring with real crayons.
            </p>
          </div>

          <div className="p-5 bg-white rounded-3xl border-2 border-[#EBE8DC] shadow-sm hover:border-[#9B72AA] transition-all space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center font-black">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2D3436]">Glitter, Rainbow & Patterns</h3>
            <p className="text-xs text-[#636E72] font-medium leading-relaxed">
              Magical shimmering glitter, diagonal rainbow ribbons, polka dots, stars, and heart texture flood fills.
            </p>
          </div>

          <div className="p-5 bg-white rounded-3xl border-2 border-[#EBE8DC] shadow-sm hover:border-[#FF6B6B] transition-all space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF0F0] text-[#FF6B6B] flex items-center justify-center font-black">
              <Smile className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2D3436]">20+ Kid Sticker Stamps</h3>
            <p className="text-xs text-[#636E72] font-medium leading-relaxed">
              Stamp cute golden crowns, sunglasses, dinosaurs, balloons, and stars directly onto artwork with pop sounds.
            </p>
          </div>

          <div className="p-5 bg-white rounded-3xl border-2 border-[#EBE8DC] shadow-sm hover:border-[#4D96FF] transition-all space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[#F0F8FF] text-[#0284C7] flex items-center justify-center font-black">
              <Hash className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2D3436]">Color by Number Mode</h3>
            <p className="text-xs text-[#636E72] font-medium leading-relaxed">
              Boost fine motor skills, number recognition (1-10), and alphabet phonics with guided educational coloring.
            </p>
          </div>
        </section>

        {/* 3. Side-by-Side Comparison Matrix Table */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#2D3436] font-display">
              Feature Comparison: Free vs. VIP Pass
            </h2>
            <p className="text-xs sm:text-sm text-[#888] font-bold">
              Clear, transparent comparison with no hidden catches.
            </p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-[#EBE8DC] shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-[#FBF9F1] p-3.5 sm:p-4 border-b-2 border-[#EBE8DC] text-xs font-black text-[#444]">
              <span className="col-span-6 sm:col-span-7 text-sm font-display">Features</span>
              <span className="col-span-3 sm:col-span-2 text-center text-[#888] font-bold">Free Plan</span>
              <span className="col-span-3 text-center text-[#FF9F43] font-black flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-current" /> VIP Pass
              </span>
            </div>

            <div className="divide-y divide-[#F0ECE1]">
              {COMPARISON_ROWS.map((group, gIdx) => (
                <div key={gIdx} className="bg-white">
                  <div className="bg-[#FAF9F5] px-4 py-2 text-[11px] font-black text-[#888] uppercase tracking-wider">
                    {group.category}
                  </div>
                  {group.items.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-12 p-3 sm:p-4 items-center text-xs hover:bg-[#FFFDF7] transition-colors">
                      <span className="col-span-6 sm:col-span-7 font-bold text-[#2D3436] pr-2">
                        {row.feature}
                      </span>
                      <span className="col-span-3 sm:col-span-2 text-center text-[11px] text-[#777] font-semibold">
                        {row.free}
                      </span>
                      <span className="col-span-3 text-center text-xs font-black text-[#10B981]">
                        {row.vip}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Pricing Cards (Annual vs Monthly) */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#2D3436] font-display">
              Simple, Affordable Family Pricing
            </h2>
            <p className="text-xs sm:text-sm text-[#888] font-bold">
              Less than the price of a single physical coloring book per month!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Annual Card */}
            <div className="p-6 rounded-3xl border-3 border-[#FF9F43] bg-gradient-to-b from-[#FFFDF5] to-[#FFF8E6] shadow-lg relative flex flex-col justify-between space-y-4">
              <div className="absolute -top-3.5 right-4 bg-gradient-to-r from-[#FF6B6B] to-[#FA8231] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-xs uppercase">
                Save 60% • Most Popular
              </div>

              <div>
                <span className="block font-black text-lg text-[#2D3436]">Annual VIP Explorer</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#2D3436]">₹499</span>
                  <span className="text-xs font-bold text-[#888]">/ year (just ~₹41/mo)</span>
                </div>
                <p className="text-xs font-black text-[#10B981] mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 7-Day Free Trial Included
                </p>
                <p className="text-xs text-[#636E72] font-semibold mt-2">
                  Includes all superpowers, unlimited AI generation, photo conversion, and printable packs.
                </p>
              </div>

              <button
                onClick={handleCtaClick}
                className="btn-bubbly w-full py-3.5 bg-gradient-to-r from-[#FF6B6B] via-[#FA8231] to-[#FFD93D] text-white font-black rounded-2xl shadow-md text-sm cursor-pointer hover:brightness-105 flex items-center justify-center gap-2"
              >
                <span>Start 7-Day Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Monthly Card */}
            <div className="p-6 rounded-3xl border-2 border-[#EBE8DC] bg-white shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="block font-black text-lg text-[#2D3436]">Monthly VIP Pass</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#2D3436]">₹99</span>
                  <span className="text-xs font-bold text-[#888]">/ month</span>
                </div>
                <p className="text-xs font-semibold text-[#888] mt-1.5">
                  Billed monthly • Cancel anytime
                </p>
                <p className="text-xs text-[#636E72] font-semibold mt-2">
                  Full VIP access with flexible month-to-month billing.
                </p>
              </div>

              <button
                onClick={handleCtaClick}
                className="btn-bubbly w-full py-3.5 bg-[#4D96FF] hover:bg-[#3B82F6] text-white font-black rounded-2xl shadow-md text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Subscribe Monthly</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* 5. Parent Reviews & Testimonials */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#EBE8DC] shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-[#FFB800]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <h3 className="text-xl font-black text-[#2D3436]">Loved by Over 10,000+ Happy Families</h3>
            <p className="text-xs font-bold text-[#888]">Rated 4.9/5 by parents, grandparents, and educators</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDEAE0] space-y-2">
              <p className="text-xs text-[#555] font-semibold italic">
                "Turning photos of our puppy into coloring sheets kept my 5-year-old busy for hours every weekend. Unbelievable money saver on store coloring books!"
              </p>
              <span className="block text-[11px] font-black text-[#2D3436]">— Priya S., Mom of 2</span>
            </div>

            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDEAE0] space-y-2">
              <p className="text-xs text-[#555] font-semibold italic">
                "The 1-click home PDF printing is a gamechanger. We print 10 sheets on Sunday morning and color with physical crayons without screen fatigue."
              </p>
              <span className="block text-[11px] font-black text-[#2D3436]">— Rahul M., Father</span>
            </div>

            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDEAE0] space-y-2">
              <p className="text-xs text-[#555] font-semibold italic">
                "Zero ads and strict parental controls give me total peace of mind when my daughter uses the tablet on her own."
              </p>
              <span className="block text-[11px] font-black text-[#2D3436]">— Sneha D., Preschool Teacher</span>
            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section className="space-y-4 pb-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#2D3436] font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#888] font-bold">
              Everything you need to know about KidColor VIP Pass
            </p>
          </div>

          <div className="space-y-2.5 max-w-2xl mx-auto">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border-2 border-[#EBE8DC] overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex items-center justify-between font-black text-xs sm:text-sm text-[#2D3436] cursor-pointer hover:bg-[#FAF9F5]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#888] transition-transform ${isOpen ? 'rotate-180 text-[#4D96FF]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-[#636E72] font-semibold leading-relaxed border-t border-[#F0ECE1] bg-[#FFFDF7]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bottom Sticky Footer CTA Banner */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-[#EBE8DC] p-3.5 sm:p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="block font-black text-sm text-[#2D3436]">
              Unlock All VIP Superpowers with a 7-Day Free Trial
            </span>
            <span className="text-xs text-[#888] font-bold">
              Just ₹499/year (~₹41/mo) • Cancel anytime with 1 click
            </span>
          </div>

          <button
            onClick={handleCtaClick}
            className="btn-bubbly w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#FF6B6B] via-[#FA8231] to-[#FFD93D] text-white font-black text-sm rounded-xl shadow-md cursor-pointer hover:brightness-105 flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4 fill-current" />
            <span>{isPro ? 'Manage Subscription' : 'Start 7-Day Free Trial'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default FreeVsPaidPage;
