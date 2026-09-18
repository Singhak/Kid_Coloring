import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Palette,
  Printer,
  Camera,
  Hash,
  ShieldCheck,
  Star,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Play,
  Layers,
  Heart,
  Smile,
  Volume2,
  Crown,
  BookOpen,
  Rocket,
  Compass,
  Download,
  HelpCircle,
  Clock,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { playClick, playChime, playFanfare, playSwish } from '../services/soundEffects';
import LegalPolicyPage, { LegalTabType } from './LegalPolicyPage';

interface LandingPageProps {
  onLaunchApp: (category?: string) => void;
  onOpenPricing?: () => void;
}

// 6 Fun Interactive Crayons for the Live Demo Easel
interface CrayonColor {
  name: string;
  hex: string;
  bgTailwind: string;
}

const DEMO_CRAYONS: CrayonColor[] = [
  { name: 'Cherry Red', hex: '#FF4D4D', bgTailwind: 'bg-[#FF4D4D]' },
  { name: 'Sunny Lemon', hex: '#FFD166', bgTailwind: 'bg-[#FFD166]' },
  { name: 'Jungle Lime', hex: '#06D6A0', bgTailwind: 'bg-[#06D6A0]' },
  { name: 'Sky Cyan', hex: '#118AB2', bgTailwind: 'bg-[#118AB2]' },
  { name: 'Berry Violet', hex: '#7B2CBF', bgTailwind: 'bg-[#7B2CBF]' },
  { name: 'Bubblegum Pink', hex: '#FF70A6', bgTailwind: 'bg-[#FF70A6]' },
];

export default function LandingPage({ onLaunchApp, onOpenPricing }: LandingPageProps) {
  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Legal modal tab state
  const [legalModalTab, setLegalModalTab] = useState<LegalTabType | null>(null);

  // Live Interactive Easel Demo State
  const [activeColor, setActiveColor] = useState<string>(DEMO_CRAYONS[0].hex);
  const [demoPaths, setDemoPaths] = useState<{ [key: string]: string }>({
    sky: '#E0F2FE',
    sun: '#FFEAA7',
    body: '#FFFFFF',
    belly: '#FFFFFF',
    crest: '#FFFFFF',
    tail: '#FFFFFF',
    branch: '#FFFFFF',
    leaf1: '#FFFFFF',
    leaf2: '#FFFFFF',
    spot1: '#FFFFFF',
    spot2: '#FFFFFF',
  });
  const [coloredCount, setColoredCount] = useState(0);
  const [showDemoFeedback, setShowDemoFeedback] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Color a region in the live demo
  const handleColorRegion = (regionKey: string) => {
    playClick();
    setDemoPaths((prev) => {
      const updated = { ...prev, [regionKey]: activeColor };
      return updated;
    });

    const newCount = coloredCount + 1;
    setColoredCount(newCount);

    if (newCount === 3 || newCount === 7) {
      playChime();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFD166', '#7B2CBF'],
      });
      setShowDemoFeedback(true);
    }
  };

  const handleResetDemo = () => {
    playSwish();
    setDemoPaths({
      sky: '#E0F2FE',
      sun: '#FFEAA7',
      body: '#FFFFFF',
      belly: '#FFFFFF',
      crest: '#FFFFFF',
      tail: '#FFFFFF',
      branch: '#FFFFFF',
      leaf1: '#FFFFFF',
      leaf2: '#FFFFFF',
      spot1: '#FFFFFF',
      spot2: '#FFFFFF',
    });
    setColoredCount(0);
    setShowDemoFeedback(false);
  };

  const popularCategories = [
    {
      id: 'animal',
      title: 'Animals & Pets',
      subtitle: 'Lions, Puppies, Kittens & Elephants',
      emoji: '🦁',
      sheetsCount: '30+ Sheets',
      bgGradient: 'from-amber-50 to-orange-100/70',
      borderColor: 'border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'space',
      title: 'Cosmic & Space',
      subtitle: 'Rockets, Astronauts & Friendly Aliens',
      emoji: '🚀',
      sheetsCount: '18+ Sheets',
      bgGradient: 'from-indigo-50 to-blue-100/70',
      borderColor: 'border-indigo-200',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'vehicles',
      title: 'Speed & Vehicles',
      subtitle: 'Fire Trucks, Airplanes & Trains',
      emoji: '🚒',
      sheetsCount: '24+ Sheets',
      bgGradient: 'from-rose-50 to-red-100/70',
      borderColor: 'border-rose-200',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'alphabet',
      title: 'Early Alphabets',
      subtitle: 'Phonics Letter Cards & Word Prompts',
      emoji: '🔤',
      sheetsCount: '26+ Sheets',
      bgGradient: 'from-emerald-50 to-teal-100/70',
      borderColor: 'border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'festivals',
      title: 'Festivals & Holidays',
      subtitle: 'Diwali, Christmas, Holi & Seasons',
      emoji: '🪔',
      sheetsCount: '15+ Sheets',
      bgGradient: 'from-purple-50 to-pink-100/70',
      borderColor: 'border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'fruits',
      title: 'Fruits & Nature',
      subtitle: 'Sweet Apples, Berries & Flowers',
      emoji: '🍓',
      sheetsCount: '20+ Sheets',
      bgGradient: 'from-lime-50 to-green-100/70',
      borderColor: 'border-lime-200',
      badgeColor: 'bg-lime-100 text-lime-800',
    },
  ];

  const superpowers = [
    {
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      title: 'Gemini AI Coloring Sheet Generator',
      description:
        'Type any idea your child imagines — from "a kitten flying a spaceship" to "a smiling dinosaur with balloons" — and generate high-contrast vector line art in under 3 seconds.',
      badge: 'AI Superpower',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      icon: <Camera className="w-6 h-6 text-emerald-500" />,
      title: 'Photo to Line Art Converter',
      description:
        'Upload personal family photos, pet pictures, or pencil sketches. Coloro extracts clean outlines so your child can color their real-world heroes and memories.',
      badge: 'Interactive',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      icon: <Hash className="w-6 h-6 text-blue-500" />,
      title: 'Educational Color By Number',
      description:
        'Interactive guided learning mode designed by early childhood educators. Strengthens number recognition, hand-eye coordination, and confidence.',
      badge: 'Learning Mode',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      icon: <Printer className="w-6 h-6 text-rose-500" />,
      title: 'Instant 300 DPI Printable PDFs',
      description:
        'Prefer physical crayons on the kitchen table? One click generates crisp, high-resolution PDF printouts formatted for standard A4 and Letter paper.',
      badge: 'Free Printables',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      icon: <Layers className="w-6 h-6 text-purple-500" />,
      title: 'Glitter Brushes, Stickers & Audio',
      description:
        'Dual-layer smart canvas prevents kids from accidentally painting over black line art. Includes tactile sound effects, fun stickers, and cheer fanfare.',
      badge: 'Tactile Canvas',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-teal-500" />,
      title: '100% Ad-Free & Child-Safe Haven',
      description:
        'Safe, mindful screen time. Zero third-party advertisements, zero tracking pixels, no popups or algorithmic rabbit holes. Certified kid-safe environment.',
      badge: 'COPPA Friendly',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
  ];

  const faqs = [
    {
      q: 'Is Coloro free to use?',
      a: 'Yes! Coloro is 100% free to start. Kids can color dozens of printable coloring sheets, use smart bucket and crayon brushes, and print unlimited PDF sheets without spending a rupee. Optional VIP memberships unlock unlimited Gemini AI generations and ultra-HD 4K exports.',
    },
    {
      q: 'Do I need to download or install an application?',
      a: 'Not at all! Coloro runs smoothly right inside your modern web browser on iPads, Android tablets, iPhones, Chromebooks, Macs, and Windows PCs. You can also add it to your home screen as a Progressive Web App (PWA) for full-screen offline fun.',
    },
    {
      q: 'Can I print these coloring pages on regular home paper?',
      a: 'Yes! Every single template and AI-generated artwork can be exported or printed as a clean, high-contrast black-and-white PDF sheet with a single tap. It is designed to save printer ink while delivering crisp outlines for standard crayons and markers.',
    },
    {
      q: 'How does the Magic AI Coloring Generator work?',
      a: 'Our AI generator uses Google Gemini 2.5 Flash with custom prompt guardrails strictly tuned for child-friendly line art. Simply type what you want to draw, and it constructs clean SVG outlines ready to paint in seconds.',
    },
    {
      q: 'Is Coloro safe for toddlers and young children?',
      a: 'Absolutely. Coloro was designed from the ground up to provide mindful, constructive screen time. There are zero third-party banners, no tracking cookies, and no chat interactions with strangers.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2D3436] font-sans antialiased overflow-x-hidden selection:bg-[#FFD93D] selection:text-[#7A4B00]">
      {/* ------------------------------------------------------------- */}
      {/* 1. STICKY TOP NAVIGATION BAR                                   */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EFEAD6] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            >
              <img
                src="/coloro-web-logo.png"
                alt="Coloro - Magic AI Coloring Book"
                className="h-9 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-[#636E72]">
            <a href="#features" className="hover:text-[#FF5252] transition-colors">
              Features
            </a>
            <a href="#interactive-demo" className="hover:text-[#FF5252] transition-colors">
              Live Demo
            </a>
            <a href="#categories" className="hover:text-[#FF5252] transition-colors">
              Coloring Pages
            </a>
            <a href="#benefits" className="hover:text-[#FF5252] transition-colors">
              For Parents &amp; Teachers
            </a>
            <a href="#pricing" className="hover:text-[#FF5252] transition-colors">
              VIP Superpowers
            </a>
            <a href="#faq" className="hover:text-[#FF5252] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Header Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                playFanfare();
                onLaunchApp();
              }}
              className="btn-bubbly flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FA5252] hover:to-[#FF763B] text-white rounded-2xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch App</span>
              <span className="hidden sm:inline bg-white/25 px-1.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide">
                Free
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#2D3436] hover:bg-[#F4F1DE] transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-[#EFEAD6] px-4 py-4 space-y-3"
            >
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-[#2D3436] py-1.5 px-2 rounded-lg hover:bg-[#FFF9E6]"
              >
                Features
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-[#2D3436] py-1.5 px-2 rounded-lg hover:bg-[#FFF9E6]"
              >
                Live Interactive Demo
              </a>
              <a
                href="#categories"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-[#2D3436] py-1.5 px-2 rounded-lg hover:bg-[#FFF9E6]"
              >
                Coloring Categories
              </a>
              <a
                href="#benefits"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-[#2D3436] py-1.5 px-2 rounded-lg hover:bg-[#FFF9E6]"
              >
                Educational Benefits
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-[#2D3436] py-1.5 px-2 rounded-lg hover:bg-[#FFF9E6]"
              >
                VIP Pricing
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-[#2D3436] py-1.5 px-2 rounded-lg hover:bg-[#FFF9E6]"
              >
                Frequently Asked Questions
              </a>
              <div className="pt-2 border-t border-[#EFEAD6]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLaunchApp();
                  }}
                  className="w-full py-3 bg-[#FF6B6B] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Coloring Free at coloro.in/app</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION WITH VIBRANT CALLOUTS                          */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-8 sm:pt-14 pb-14 sm:pb-20 overflow-hidden art-studio-bg border-b border-[#EFEAD6]">
        {/* Soft Decorative Circles */}
        <div className="absolute top-10 left-[-60px] w-64 h-64 bg-[#FFE8D6]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-[-60px] w-72 h-72 bg-[#D8F3DC]/60 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headlines, Trust Badges, and Launch CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Shimmering Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF9E6] border border-[#FFE082] rounded-full text-xs sm:text-sm font-black text-[#8C5B00] shadow-xs">
                <Sparkles className="w-4 h-4 text-[#FF9F43] animate-spin" style={{ animationDuration: '4s' }} />
                <span>#1 AI-Powered Creative Studio for Kids &amp; Families</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-[#2D3436] leading-[1.12]">
                Where <span className="text-[#FF595E]">Imaginations</span> Come Alive in{' '}
                <span className="bg-gradient-to-r from-[#FF6B6B] via-[#FFA900] to-[#4ECDC4] bg-clip-text text-transparent">
                  Pure Color
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-[#555E68] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The magical digital coloring book loved by toddlers, preschoolers, and parents.
                Generate personalized coloring sheets with Gemini AI, paint with glitter brushes,
                learn with Color-by-Number, and download 100+ free printable PDF sheets.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => {
                    playFanfare();
                    onLaunchApp();
                  }}
                  className="btn-bubbly w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-[#FF595E] to-[#FF9248] hover:from-[#E63946] hover:to-[#FF7B25] text-white rounded-2xl font-black text-base shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-3 transition-all"
                >
                  <Palette className="w-5 h-5" />
                  <span>Start Coloring Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#interactive-demo"
                  onClick={(e) => {
                    e.preventDefault();
                    playClick();
                    document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-[#FDFBF7] text-[#2D3436] border-2 border-[#E2DDD0] hover:border-[#FFCA3A] rounded-2xl font-bold text-sm shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 text-[#FF595E] fill-current" />
                  <span>Try Interactive Demo</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-bold text-[#636E72]">
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Kid Safe</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>No Login Needed</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <Printer className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Printable 300 DPI</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Zero Ads Ever</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Art Easel Graphic Card */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-[#FFF5EB] ring-1 ring-[#000000]/5"
              >
                {/* Ribbon Tag */}
                <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Digital Art Studio</span>
                </div>

                {/* Studio App Preview Illustration */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#FFFDF9] to-[#F7F2E7] p-3 border border-[#EBE5D8] flex flex-col items-center">
                  <img
                    src="/coloro-web-chameleon.jpg"
                    alt="Coloro Chameleon Mascot Drawing"
                    className="w-full h-auto max-h-[340px] object-contain rounded-xl shadow-xs"
                  />

                  {/* Live Interactive CTA Chip */}
                  <div className="mt-3 w-full bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-[#EAE4D5] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-[#2D3436]">Chameleon in the Jungle 🌴</p>
                      <p className="text-[11px] text-[#636E72]">128+ More Coloring Pages Online</p>
                    </div>
                    <button
                      onClick={() => onLaunchApp('animal')}
                      className="px-3 py-1.5 bg-[#FFD93D] hover:bg-[#FFCE1F] text-[#7A4B00] rounded-xl font-black text-xs shadow-xs cursor-pointer transition-all"
                    >
                      Color Now
                    </button>
                  </div>
                </div>

                {/* Floating Micro-Badge */}
                <div className="absolute -bottom-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#EAE4D5] shadow-lg flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-black text-[#8C5B00]">Free Instant Access</p>
                    <p className="text-xs font-bold text-[#2D3436]">coloro.in/app</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. LIVE INTERACTIVE MINI-DEMO (Try Coloring Right Here!)       */}
      {/* ------------------------------------------------------------- */}
      <section id="interactive-demo" className="py-14 sm:py-20 bg-white border-b border-[#EFEAD6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full text-xs font-black text-[#15803D]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Playground</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-[#2D3436]">
              Try It Live: Pick a Crayon &amp; Color Our Dino Mascot! 🦖
            </h2>
            <p className="text-sm sm:text-base text-[#636E72] max-w-xl mx-auto">
              Tap any crayon color below, then click on different parts of the dinosaur sheet to fill with color.
              Experience how easy and satisfying Coloro feels!
            </p>
          </div>

          {/* Interactive Easel Card */}
          <div className="relative max-w-2xl mx-auto bg-[#FBF9F1] rounded-3xl p-5 sm:p-8 border-2 border-[#EBE5D8] shadow-xl">
            {/* Color Crayon Dock */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pb-6 border-b border-[#E6DFD1]">
              <span className="text-xs font-bold text-[#636E72] mr-1 hidden sm:inline">Crayons:</span>
              {DEMO_CRAYONS.map((crayon) => {
                const isSelected = activeColor === crayon.hex;
                return (
                  <button
                    key={crayon.hex}
                    onClick={() => {
                      playClick();
                      setActiveColor(crayon.hex);
                    }}
                    className={`btn-bubbly group relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'ring-4 ring-[#FFD93D] scale-105 shadow-md text-white'
                        : 'hover:scale-102 text-[#2D3436] bg-white border border-[#E2DDD0]'
                    }`}
                    style={isSelected ? { backgroundColor: crayon.hex } : {}}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: crayon.hex }}
                    />
                    <span className={isSelected ? 'text-white drop-shadow-2xs' : 'text-[#2D3436]'}>
                      {crayon.name}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={handleResetDemo}
                className="text-xs font-bold text-[#888] hover:text-[#2D3436] underline ml-2 cursor-pointer"
                title="Reset coloring easel"
              >
                Reset
              </button>
            </div>

            {/* Interactive SVG Canvas */}
            <div className="relative mt-6 flex justify-center items-center">
              <svg
                viewBox="0 0 600 450"
                className="w-full max-w-[500px] h-auto drop-shadow-md rounded-2xl bg-white border-2 border-[#E2DDD0] cursor-pointer"
              >
                {/* Background Sky */}
                <rect
                  x="0"
                  y="0"
                  width="600"
                  height="450"
                  fill={demoPaths.sky}
                  onClick={() => handleColorRegion('sky')}
                  className="transition-colors duration-200 hover:opacity-90"
                />

                {/* Friendly Sun */}
                <circle
                  cx="500"
                  cy="90"
                  r="50"
                  fill={demoPaths.sun}
                  stroke="#1A1A1A"
                  strokeWidth="5"
                  onClick={() => handleColorRegion('sun')}
                  className="transition-colors duration-200 hover:opacity-90"
                />

                {/* Ground / Hill */}
                <path
                  d="M -10 420 Q 200 360 610 410 L 610 460 L -10 460 Z"
                  fill="#A7F3D0"
                  stroke="#1A1A1A"
                  strokeWidth="5"
                />

                {/* Tree Branch */}
                <path
                  d="M 20 280 Q 90 290 140 320"
                  stroke="#8D5B4C"
                  strokeWidth="14"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 120 310 Q 150 280 180 300 Q 150 330 120 310 Z"
                  fill={demoPaths.leaf1}
                  stroke="#1A1A1A"
                  strokeWidth="4"
                  onClick={() => handleColorRegion('leaf1')}
                  className="transition-colors duration-200"
                />
                <path
                  d="M 90 285 Q 110 255 140 270 Q 120 295 90 285 Z"
                  fill={demoPaths.leaf2}
                  stroke="#1A1A1A"
                  strokeWidth="4"
                  onClick={() => handleColorRegion('leaf2')}
                  className="transition-colors duration-200"
                />

                {/* Dinosaur Tail */}
                <path
                  d="M 220 320 Q 150 330 100 290 Q 150 380 250 360 Z"
                  fill={demoPaths.tail}
                  stroke="#1A1A1A"
                  strokeWidth="6"
                  strokeLinejoin="round"
                  onClick={() => handleColorRegion('tail')}
                  className="transition-colors duration-200 hover:opacity-90"
                />

                {/* Dinosaur Back Crests */}
                <polygon
                  points="250,220 270,180 290,220"
                  fill={demoPaths.crest}
                  stroke="#1A1A1A"
                  strokeWidth="5"
                  onClick={() => handleColorRegion('crest')}
                />
                <polygon
                  points="295,225 315,190 335,230"
                  fill={demoPaths.crest}
                  stroke="#1A1A1A"
                  strokeWidth="5"
                  onClick={() => handleColorRegion('crest')}
                />
                <polygon
                  points="340,240 360,205 375,250"
                  fill={demoPaths.crest}
                  stroke="#1A1A1A"
                  strokeWidth="5"
                  onClick={() => handleColorRegion('crest')}
                />

                {/* Dinosaur Body */}
                <path
                  d="M 230 350 C 200 300 230 200 330 210 C 400 220 460 210 470 140 C 480 80 430 80 390 100 C 350 120 330 170 310 190 C 270 210 220 260 230 350 Z"
                  fill={demoPaths.body}
                  stroke="#1A1A1A"
                  strokeWidth="7"
                  strokeLinejoin="round"
                  onClick={() => handleColorRegion('body')}
                  className="transition-colors duration-200 hover:opacity-90"
                />

                {/* Dinosaur Belly Patch */}
                <path
                  d="M 250 330 C 240 270 280 230 330 230 C 350 250 330 330 250 330 Z"
                  fill={demoPaths.belly}
                  stroke="#1A1A1A"
                  strokeWidth="5"
                  onClick={() => handleColorRegion('belly')}
                  className="transition-colors duration-200 hover:opacity-90"
                />

                {/* Cute Spots */}
                <circle
                  cx="280"
                  cy="290"
                  r="12"
                  fill={demoPaths.spot1}
                  stroke="#1A1A1A"
                  strokeWidth="4"
                  onClick={() => handleColorRegion('spot1')}
                />
                <circle
                  cx="310"
                  cy="320"
                  r="9"
                  fill={demoPaths.spot2}
                  stroke="#1A1A1A"
                  strokeWidth="4"
                  onClick={() => handleColorRegion('spot2')}
                />

                {/* Dinosaur Eye & Happy Smile */}
                <circle cx="430" cy="115" r="9" fill="#1A1A1A" />
                <circle cx="433" cy="112" r="3" fill="#FFFFFF" />
                <path d="M 440 135 Q 455 145 465 130" stroke="#1A1A1A" strokeWidth="4" fill="none" strokeLinecap="round" />
                <ellipse cx="450" cy="130" rx="6" ry="4" fill="#FFAAA6" opacity="0.7" />

                {/* Dinosaur Legs */}
                <path
                  d="M 260 340 L 260 395 L 290 395 L 290 350"
                  fill={demoPaths.body}
                  stroke="#1A1A1A"
                  strokeWidth="6"
                  onClick={() => handleColorRegion('body')}
                />
                <path
                  d="M 330 330 L 330 395 L 360 395 L 360 330"
                  fill={demoPaths.body}
                  stroke="#1A1A1A"
                  strokeWidth="6"
                  onClick={() => handleColorRegion('body')}
                />
              </svg>
            </div>

            {/* Congratulatory Encouragement Banner */}
            {coloredCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gradient-to-r from-[#FFF9E6] to-[#FFF3D6] border-2 border-[#FFE082] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  <div>
                    <h3 className="text-sm font-black text-[#7A4B00]">You are an awesome artist!</h3>
                    <p className="text-xs text-[#8C5B00]">
                      Ready for glitter pens, sound effects, AI generation and 100+ sheets?
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playFanfare();
                    onLaunchApp();
                  }}
                  className="btn-bubbly px-5 py-2.5 bg-[#FF595E] hover:bg-[#E63946] text-white rounded-xl font-black text-xs shadow-md whitespace-nowrap cursor-pointer transition-all"
                >
                  Open Full App at /app 🚀
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. SIX SUPERPOWERS & FEATURES SHOWCASE                         */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="py-16 sm:py-24 bg-[#FFFDF9] border-b border-[#EFEAD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF9E6] border border-[#FFD93D] rounded-full text-xs font-black text-[#8C5B00]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Packed with Creative Magic</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-display text-[#2D3436]">
              Designed for Tiny Hands &amp; Huge Imaginations
            </h2>
            <p className="text-base text-[#636E72] leading-relaxed">
              Every tool in Coloro was built specifically for children aged 2 to 10. From intuitive tap-to-fill
              paint buckets to smart AI prompts that spark curiosity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {superpowers.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE4D5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFFDF9] border border-[#EAE4D5] flex items-center justify-center shadow-2xs">
                      {feature.icon}
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#2D3436] font-display">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#555E68] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-[#F5F2EA] flex items-center justify-between text-xs font-bold text-[#FF595E]">
                  <span>Explore in app</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. POPULAR COLORING CATEGORIES CAROUSEL / EXPLORER             */}
      {/* ------------------------------------------------------------- */}
      <section id="categories" className="py-16 sm:py-24 bg-[#FBF9F1] border-b border-[#EFEAD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF2FF] border border-[#C7D2FE] rounded-full text-xs font-black text-[#4338CA]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>100+ Free Handcrafted Templates</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-display text-[#2D3436]">
                Explore Popular Coloring Themes
              </h2>
              <p className="text-sm sm:text-base text-[#636E72]">
                Pick your favorite theme and jump straight into the coloring canvas at <span className="font-bold text-[#FF595E]">coloro.in/app</span>.
              </p>
            </div>

            <button
              onClick={() => onLaunchApp()}
              className="btn-bubbly self-start md:self-auto px-5 py-2.5 bg-white hover:bg-[#FAF8F0] text-[#2D3436] border border-[#E0DBD0] rounded-xl font-bold text-xs sm:text-sm shadow-xs cursor-pointer flex items-center gap-2"
            >
              <span>View All 100+ Sheets</span>
              <ArrowRight className="w-4 h-4 text-[#FF595E]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularCategories.map((cat) => (
              <div
                key={cat.id}
                className={`rounded-3xl p-6 bg-gradient-to-br ${cat.bgGradient} border ${cat.borderColor} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl filter drop-shadow-xs">{cat.emoji}</span>
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${cat.badgeColor}`}>
                      {cat.sheetsCount}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#2D3436] font-display mb-1">{cat.title}</h3>
                  <p className="text-xs text-[#555E68] leading-relaxed mb-6">{cat.subtitle}</p>
                </div>

                <button
                  onClick={() => {
                    playSwish();
                    onLaunchApp(cat.id);
                  }}
                  className="btn-bubbly w-full py-2.5 bg-white hover:bg-[#FFFDF9] text-[#2D3436] border border-black/10 rounded-2xl font-black text-xs shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-transform"
                >
                  <span>Color {cat.title.split(' ')[0]} Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF595E]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. EDUCATIONAL VALUE & WHY PARENTS LOVE COLORO                 */}
      {/* ------------------------------------------------------------- */}
      <section id="benefits" className="py-16 sm:py-24 bg-white border-b border-[#EFEAD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Mascot & Evidence Graphic */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl p-6 border-2 border-[#EAE4D5] shadow-lg">
                <img
                  src="/coloro-web-artist-friend.jpg"
                  alt="Happy Kid Artist with Coloro"
                  className="w-full h-auto rounded-2xl object-contain shadow-xs"
                />
                <div className="mt-4 p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl text-center">
                  <p className="text-xs font-black text-[#15803D]">
                    ⭐ Backed by Early Childhood Development Principles
                  </p>
                  <p className="text-[11px] text-[#166534] mt-0.5">
                    Encouraging hand-eye dexterity and emotional calm since day one.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits Copy */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] border border-[#FECACA] rounded-full text-xs font-black text-[#991B1B]">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                <span>Loved by 10,000+ Families</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black font-display text-[#2D3436] leading-tight">
                Turn Screen Time into Mindful Creative Growth
              </h2>

              <p className="text-base text-[#555E68] leading-relaxed font-medium">
                Unlike algorithmic video feeds and frantic gaming apps that overstimulate young brains,
                Coloro fosters focus, patience, and visual motor development.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#2D3436]">Fine Motor Precision &amp; Grip Training</h3>
                    <p className="text-xs text-[#636E72] leading-relaxed">
                      Tap-to-fill and smooth freehand brush modes refine precision coordination before children begin writing in school.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#2D3436]">Calming Emotional Regulation &amp; Bedtime Routine</h3>
                    <p className="text-xs text-[#636E72] leading-relaxed">
                      Repetitive coloring and relaxing acoustic tones calm restless toddlers during transitions or evening wind-downs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#2D3436]">Cognitive Confidence &amp; Storytelling</h3>
                    <p className="text-xs text-[#636E72] leading-relaxed">
                      Generating an idea from text with Gemini AI shows children that their imagination can create real tangible art.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onLaunchApp()}
                  className="btn-bubbly px-6 py-3 bg-[#2D3436] hover:bg-[#1E272E] text-white rounded-2xl font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD93D]" />
                  <span>Explore Coloring Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. PARENT & TEACHER TESTIMONIALS                               */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 sm:py-24 bg-[#FBF9F1] border-b border-[#EFEAD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF3C7] border border-[#FDE68A] rounded-full text-xs font-black text-[#92400E]">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>Real Parent Reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#2D3436]">
              Stories from Happy Little Artists
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE4D5] shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-lg">{s}</span>
                  ))}
                </div>
                <p className="text-sm text-[#4A5568] italic leading-relaxed">
                  "My 4-year-old daughter asks to generate a new animal every morning! She printed out a 'space puppy' and colored it with real crayons for kindergarten show-and-tell."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F5F2EA] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-600 text-sm">
                  P
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#2D3436]">Priya S.</h3>
                  <p className="text-[11px] text-[#888]">Mom of 2, Bengaluru</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE4D5] shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-lg">{s}</span>
                  ))}
                </div>
                <p className="text-sm text-[#4A5568] italic leading-relaxed">
                  "As a Montessori preschool educator, the printable 300 DPI PDF export is an absolute gamechanger. Crisp lines, zero ads, and instant classroom printouts."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F5F2EA] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                  A
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#2D3436]">Ananya M.</h3>
                  <p className="text-[11px] text-[#888]">Early Childhood Educator</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE4D5] shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-lg">{s}</span>
                  ))}
                </div>
                <p className="text-sm text-[#4A5568] italic leading-relaxed">
                  "The sound effects and glitter stamps keep my son engaged during doctor visits or road trips without any popups or annoying subscription walls. Best kid app!"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F5F2EA] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-sm">
                  R
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#2D3436]">Rohan K.</h3>
                  <p className="text-[11px] text-[#888]">Dad of a 5-year-old</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. FREE VS VIP SUPERPOWERS TIERS                               */}
      {/* ------------------------------------------------------------- */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-b border-[#EFEAD6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF9E6] border border-[#FFD93D] rounded-full text-xs font-black text-[#8C5B00]">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>Simple, Transparent Value</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-display text-[#2D3436]">
              Start Free Forever or Unlock VIP Magic
            </h2>
            <p className="text-base text-[#636E72]">
              Enjoy dozens of free sheets and tools forever. Upgrade anytime for unlimited AI generation superpowers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Free Tier Card */}
            <div className="rounded-3xl p-7 bg-[#FFFDF9] border-2 border-[#EAE4D5] shadow-xs flex flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-black text-[#2D3436] font-display">Free Starter</h3>
                  <p className="text-xs text-[#636E72] mt-1">Perfect for casual home coloring &amp; printouts</p>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-[#2D3436]">₹0</span>
                    <span className="text-xs font-bold text-[#888] ml-1.5">Free Forever</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-bold text-[#4A5568]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100+ Handcrafted Coloring Templates</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dual-Layer Smart Bucket &amp; Crayon Brushes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>1-Click 300 DPI High-Res PDF Printouts</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tactile Audio Effects &amp; Soundscapes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100% Ad-Free Safe Screen Time</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onLaunchApp()}
                className="btn-bubbly mt-8 w-full py-3.5 bg-white hover:bg-[#F9F7EF] text-[#2D3436] border-2 border-[#E2DDD0] rounded-2xl font-black text-sm shadow-xs cursor-pointer transition-all"
              >
                Launch Free Coloring Studio
              </button>
            </div>

            {/* VIP Superpowers Card */}
            <div className="relative rounded-3xl p-7 bg-gradient-to-b from-[#FFF9E6] to-[#FFF1BF] border-2 border-[#FFD93D] shadow-xl flex flex-col justify-between">
              {/* Most Popular Badge */}
              <div className="absolute -top-3.5 right-6 bg-[#FF6B6B] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Crown className="w-3 h-3 fill-current" />
                <span>VIP Superpower</span>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-black text-[#8C5B00] font-display flex items-center gap-2">
                    <span>VIP Lifetime Pass</span>
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </h3>
                  <p className="text-xs text-[#9B6E00] mt-1">Unlimited AI creative superpowers for the whole family</p>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-[#7A4B00]">₹199</span>
                    <span className="text-xs font-bold text-[#8C5B00] ml-1.5 line-through">₹499</span>
                    <span className="text-[11px] font-black bg-[#FFD93D] text-[#7A4B00] px-2 py-0.5 rounded-full ml-2">
                      One-Time Deal
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-bold text-[#6D4900]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#8C5B00]" />
                    <span>Unlimited Gemini AI Coloring Prompt Generation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#8C5B00]" />
                    <span>Photo-to-Line-Art Conversion</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#8C5B00]" />
                    <span>Educational Color-by-Number Guided Mode</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#8C5B00]" />
                    <span>4K Ultra-Resolution PDF Sheet Exporter</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#8C5B00]" />
                    <span>VIP Golden Brush, Stamp Sets &amp; Color Palettes</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  playFanfare();
                  if (onOpenPricing) {
                    onOpenPricing();
                  } else {
                    onLaunchApp();
                  }
                }}
                className="btn-bubbly mt-8 w-full py-3.5 bg-gradient-to-r from-[#FF9F43] to-[#FF5252] hover:from-[#FA8231] hover:to-[#EB3B5A] text-white rounded-2xl font-black text-sm shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>Get VIP Lifetime Superpower</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (Accordion)                     */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-16 sm:py-24 bg-[#FBF9F1] border-b border-[#EFEAD6]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E0DBD0] rounded-full text-xs font-black text-[#2D3436]">
              <HelpCircle className="w-3.5 h-3.5 text-[#FF595E]" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#2D3436]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white border border-[#EAE4D5] shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => {
                      playClick();
                      setOpenFaqIndex(isOpen ? null : index);
                    }}
                    className="w-full px-5 py-4 text-left font-bold text-sm sm:text-base text-[#2D3436] flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#888] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#FF595E]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-4 text-xs sm:text-sm text-[#555E68] leading-relaxed border-t border-[#F5F2EA] pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 10. FINAL BOTTOM CALL-TO-ACTION BANNER                         */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-[#FF595E] via-[#FF70A6] to-[#FFA900] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <span className="text-4xl animate-bounce inline-block">🎨</span>
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Ready to Unleash Your Child's Creativity?
          </h2>
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto font-medium">
            No signup required to start. Open the coloring canvas right now and let their imagination run free.
          </p>

          <div className="pt-3 flex justify-center">
            <button
              onClick={() => {
                playFanfare();
                onLaunchApp();
              }}
              className="btn-bubbly px-8 py-4 bg-white hover:bg-[#FFFDF9] text-[#FF595E] rounded-2xl font-black text-base shadow-xl cursor-pointer flex items-center gap-3 transition-transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-[#FFA900]" />
              <span>Launch Coloro Studio Now (Free)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 11. COMPREHENSIVE FOOTER & LEGAL LINKS                         */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-[#2D3436] text-[#DFE6E9] py-14 border-t border-[#1E272E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="space-y-4 md:col-span-1">
              <img
                src="/coloro-web-logo-solid.png"
                alt="Coloro Logo"
                className="h-10 w-auto object-contain brightness-110"
              />
              <p className="text-xs text-[#B2BEC3] leading-relaxed">
                Coloro is the #1 kid-safe digital coloring book and Gemini AI printable art generator. Mindful, creative screen time for young artists.
              </p>
              <p className="text-[11px] text-[#A4B0BE]">
                Host: <span className="text-white font-bold">https://coloro.in</span>
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Coloring Themes</h4>
              <ul className="space-y-2 text-xs text-[#B2BEC3]">
                <li>
                  <button onClick={() => onLaunchApp('animal')} className="hover:text-white cursor-pointer">
                    🦁 Animals &amp; Pets
                  </button>
                </li>
                <li>
                  <button onClick={() => onLaunchApp('space')} className="hover:text-white cursor-pointer">
                    🚀 Space &amp; Galaxy
                  </button>
                </li>
                <li>
                  <button onClick={() => onLaunchApp('vehicles')} className="hover:text-white cursor-pointer">
                    🚒 Trucks &amp; Vehicles
                  </button>
                </li>
                <li>
                  <button onClick={() => onLaunchApp('alphabet')} className="hover:text-white cursor-pointer">
                    🔤 Alphabet &amp; Phonics
                  </button>
                </li>
                <li>
                  <button onClick={() => onLaunchApp('festivals')} className="hover:text-white cursor-pointer">
                    🪔 Festivals &amp; Holidays
                  </button>
                </li>
              </ul>
            </div>

            {/* Studio Tools */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Studio Tools</h4>
              <ul className="space-y-2 text-xs text-[#B2BEC3]">
                <li>
                  <button onClick={() => onLaunchApp()} className="hover:text-white cursor-pointer">
                    🎨 Coloro Web Studio (/app)
                  </button>
                </li>
                <li>
                  <button onClick={() => onLaunchApp()} className="hover:text-white cursor-pointer">
                    🪄 Gemini AI Line Art
                  </button>
                </li>
                <li>
                  <button onClick={() => onLaunchApp()} className="hover:text-white cursor-pointer">
                    📸 Photo to Sketch
                  </button>
                </li>
                <li>
                  <button onClick={() => onLaunchApp()} className="hover:text-white cursor-pointer">
                    🔢 Color By Number Mode
                  </button>
                </li>
                <li>
                  <a href="/pinterest-feed.xml" target="_blank" rel="noreferrer" className="hover:text-white">
                    📌 Pinterest RSS Feed
                  </a>
                </li>
              </ul>
            </div>

            {/* Trust & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Legal &amp; Trust</h4>
              <ul className="space-y-2 text-xs text-[#B2BEC3]">
                <li>
                  <button
                    onClick={() => {
                      playClick();
                      setLegalModalTab('privacy');
                    }}
                    className="hover:text-white cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      playClick();
                      setLegalModalTab('terms');
                    }}
                    className="hover:text-white cursor-pointer text-left"
                  >
                    Terms &amp; Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      playClick();
                      setLegalModalTab('refund');
                    }}
                    className="hover:text-white cursor-pointer text-left"
                  >
                    Refund &amp; Cancellation
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      playClick();
                      setLegalModalTab('contact');
                    }}
                    className="hover:text-white cursor-pointer text-left"
                  >
                    Contact Support
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#3D484D] flex flex-col sm:flex-row items-center justify-between text-xs text-[#A4B0BE] gap-4">
            <p>© {new Date().getFullYear()} Coloro (coloro.in). All rights reserved. Crafted with ❤️ for curious kids.</p>
            <div className="flex items-center gap-4">
              <span>COPPA Compliant</span>
              <span>•</span>
              <span>100% Kid Safe</span>
              <span>•</span>
              <span>Ad-Free</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* LEGAL POLICY MODAL (When triggered from footer)               */}
      {/* ------------------------------------------------------------- */}
      {legalModalTab && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <LegalPolicyPage
            initialTab={legalModalTab}
            onBack={() => setLegalModalTab(null)}
            onOpenPricing={() => {
              setLegalModalTab(null);
              onOpenPricing ? onOpenPricing() : onLaunchApp();
            }}
          />
        </div>
      )}
    </div>
  );
}
