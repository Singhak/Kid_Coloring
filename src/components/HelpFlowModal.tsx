import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  Sparkles, 
  Palette, 
  Paintbrush, 
  Printer, 
  Camera, 
  Hash, 
  Smile, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Compass, 
  X,
  Crown,
  Layers,
  Zap,
  LayoutGrid,
  Undo2,
  Redo2,
  Volume2,
  VolumeX,
  Download,
  Shuffle,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  BookOpen
} from 'lucide-react';
import { playClick, playPop, playSwish, playFanfare, playChime } from '../services/soundEffects';

export interface HelpStep {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  description: string;
  parentTip: string;
  icon: React.ElementType;
  illustration: {
    type: 'library' | 'palette' | 'fill' | 'numbers' | 'stickers' | 'print';
  };
  actionLabel?: string;
  onAction?: () => void;
}

export interface ButtonGuideItem {
  id: string;
  name: string;
  category: 'Navigation' | 'Canvas Controls' | 'Palette & Tools';
  whatItDoes: string;
  howToUse: string;
  kidTip: string;
  renderButtonPreview: () => React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

interface HelpFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLiveTour?: () => void;
  onOpenLibrary?: () => void;
  onOpenMagicAI?: () => void;
  onOpenPhotoArt?: () => void;
  onToggleNumbers?: () => void;
  onOpenStickers?: () => void;
  onPrintSheet?: () => void;
  onOpenPricingPage?: () => void;
  onQuickNext?: () => void;
  isPro?: boolean;
}

export const HelpFlowModal: React.FC<HelpFlowModalProps> = ({
  isOpen,
  onClose,
  onStartLiveTour,
  onOpenLibrary,
  onOpenMagicAI,
  onOpenPhotoArt,
  onToggleNumbers,
  onOpenStickers,
  onPrintSheet,
  onOpenPricingPage,
  onQuickNext,
  isPro = false
}) => {
  // Tabs: 'buttons' (Individual Button Guide) or 'tour' (Step-by-Step Flow)
  const [activeTab, setActiveTab] = useState<'buttons' | 'tour'>('buttons');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [buttonFilter, setButtonFilter] = useState<'all' | 'Navigation' | 'Canvas Controls' | 'Palette & Tools'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Comprehensive list of each individual button with its actual live UI appearance & purpose
  const buttonItems: ButtonGuideItem[] = [
    {
      id: 'btn-library',
      name: 'Library',
      category: 'Navigation',
      whatItDoes: 'Opens the Drawing Book Library containing 100+ themed templates.',
      howToUse: 'Tap anytime to browse categories like Animals, Dinosaurs, Cartoons, Vehicles, Fantasy, and Alphabet/Numbers.',
      kidTip: 'Finished a drawing? Tap Library to pick your next exciting picture!',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-white text-[#2D3436] shadow-xs border border-[#E6E2D3]">
          <LayoutGrid className="w-3.5 h-3.5 text-[#4D96FF]" />
          <span>Library</span>
        </div>
      ),
      actionLabel: 'Open Library',
      onAction: () => {
        if (onOpenLibrary) onOpenLibrary();
        onClose();
      }
    },
    {
      id: 'btn-canvas',
      name: 'Coloring Canvas',
      category: 'Navigation',
      whatItDoes: 'Switches view directly to your active coloring drawing and easel board.',
      howToUse: 'Tap whenever you are browsing the library and want to return to the active drawing in progress.',
      kidTip: 'Returns to where you left off with all your colors preserved.',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-[#2D3436] bg-white border border-[#E6E2D3] shadow-xs">
          <Paintbrush className="w-3.5 h-3.5 text-[#FF6B6B]" />
          <span>Coloring Canvas</span>
        </div>
      ),
      actionLabel: 'Go to Canvas',
      onAction: () => {
        if (onOpenLibrary) onOpenLibrary(); // toggles or switches
        onClose();
      }
    },
    {
      id: 'btn-magic-ai',
      name: 'Magic AI',
      category: 'Navigation',
      whatItDoes: 'AI-powered coloring book generator that sketches anything your child types.',
      howToUse: 'Tap to open the prompt modal. Enter any creative prompt (e.g. "Dinosaur eating pizza on Mars") and AI generates clean line art in seconds.',
      kidTip: 'Helps kids turn their bedtime stories and wildest imaginations into real coloring pages.',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9E6] text-[#8C5B00] border border-[#FFD93D] rounded-xl font-bold text-xs shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9F43]" />
          <span>Magic AI</span>
          <span className="bg-[#FFD93D] text-[#7A4B00] text-[9px] font-black px-1.5 py-0.2 rounded-full">VIP</span>
        </div>
      ),
      actionLabel: 'Try Magic AI',
      onAction: () => {
        if (onOpenMagicAI) onOpenMagicAI();
        onClose();
      }
    },
    {
      id: 'btn-photo-art',
      name: 'Photo Art',
      category: 'Navigation',
      whatItDoes: 'Converts real camera photos into black-and-white coloring pages.',
      howToUse: 'Take or upload a photo of your child, pet dog/cat, toy, or family vacation. Our smart algorithm creates clean outlines ready for coloring.',
      kidTip: 'Kids love coloring pictures of themselves, family members, and their pets!',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC] rounded-xl text-xs font-bold shadow-2xs">
          <Camera className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Photo Art</span>
          <span className="bg-[#FFD93D] text-[#7A4B00] text-[9px] font-black px-1.5 py-0.2 rounded-full">VIP</span>
        </div>
      ),
      actionLabel: 'Try Photo Art',
      onAction: () => {
        if (onOpenPhotoArt) onOpenPhotoArt();
        onClose();
      }
    },
    {
      id: 'btn-numbers',
      name: 'Numbers Mode [ON / OFF]',
      category: 'Navigation',
      whatItDoes: 'Educational Color-by-Number learning mode with number matching.',
      howToUse: 'Tap to turn ON. Number badges appear on each section of the drawing matching the numbers on your crayons.',
      kidTip: 'Great for preschool & kindergarten kids (ages 3–8) to master numbers 1–10.',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD93D] text-[#7A4B00] border border-[#E6C62C] rounded-xl font-black text-xs shadow-2xs">
          <Hash className="w-3.5 h-3.5 text-[#7A4B00]" />
          <span>Numbers</span>
          <span className="text-[10px] font-black px-1 rounded bg-black/10">ON</span>
        </div>
      ),
      actionLabel: 'Toggle Numbers',
      onAction: () => {
        if (onToggleNumbers) onToggleNumbers();
        onClose();
      }
    },
    {
      id: 'btn-why-vip',
      name: 'Why VIP?',
      category: 'Navigation',
      whatItDoes: 'Opens the Free vs VIP comparison guide and superpower breakdown.',
      howToUse: 'Tap to see all unlocked features (Photo Art, Magic AI, unlimited home PDF printing, glitter fills, and 100% ad-free promise).',
      kidTip: 'Discover all the magical tools included with the 15-day free trial.',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9E6] text-[#8C5B00] border border-[#FFD93D] rounded-xl font-black text-xs shadow-2xs">
          <Crown className="w-3.5 h-3.5 text-[#FF9F43] fill-current" />
          <span>Why VIP?</span>
        </div>
      ),
      actionLabel: 'Compare Free vs VIP',
      onAction: () => {
        if (onOpenPricingPage) onOpenPricingPage();
        onClose();
      }
    },
    {
      id: 'btn-undo-redo',
      name: 'Undo & Redo',
      category: 'Navigation',
      whatItDoes: 'Reverts accidental fills or restores previous coloring actions.',
      howToUse: 'Tap Undo (↶) to erase your last fill or sticker. Tap Redo (↷) if you want it back.',
      kidTip: 'Zero frustration! Kids never have to worry about making coloring mistakes.',
      renderButtonPreview: () => (
        <div className="flex items-center bg-[#F7F5EC] px-2 py-1.5 rounded-xl border border-[#E9E5D6] text-[#2D3436] shadow-inner gap-1">
          <Undo2 className="w-3.5 h-3.5" />
          <div className="w-px h-3.5 bg-[#E0DCBC] mx-0.5" />
          <Redo2 className="w-3.5 h-3.5" />
        </div>
      )
    },
    {
      id: 'btn-sound-fx',
      name: 'Sound FX Toggle',
      category: 'Navigation',
      whatItDoes: 'Toggles playful audio sound effects ON or MUTED.',
      howToUse: 'Tap to turn sound ON or OFF. Plays pops on crayon clicks, swooshes on actions, and fanfare on completion.',
      kidTip: 'Delivers fun sensory feedback for children, with 1-click silence for parents.',
      renderButtonPreview: () => (
        <div className="h-8 w-8 rounded-xl bg-[#EBF7FF] border border-[#B9E0FF] text-[#0984E3] flex items-center justify-center">
          <Volume2 className="w-4 h-4" />
        </div>
      )
    },
    {
      id: 'btn-help-flow',
      name: 'Help Guide (?)',
      category: 'Navigation',
      whatItDoes: 'Opens this Interactive Help Guide & On-Screen Studio Tour.',
      howToUse: 'Tap anytime you or your child want to understand how a tool works or view the step-by-step tour.',
      kidTip: 'Your personal coloring assistant is always one tap away!',
      renderButtonPreview: () => (
        <div className="h-8 w-8 bg-[#FFF9E6] border border-[#FFD93D] rounded-xl text-[#8C5B00] font-black flex items-center justify-center shadow-2xs font-display text-sm text-[#E67E22]">
          ?
        </div>
      )
    },
    {
      id: 'btn-save-art',
      name: 'Save Art',
      category: 'Navigation',
      whatItDoes: 'Downloads your child’s finished masterpiece in high-resolution (PNG).',
      howToUse: 'Tap when finished. Plays a victory fanfare and saves the art directly to your device or photo gallery.',
      kidTip: 'Save your creations to share with grandparents, friends, or set as computer wallpaper!',
      renderButtonPreview: () => (
        <div className="h-8 px-3 bg-gradient-to-r from-[#6BCB77] to-[#4EBA5C] text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs">
          <Download className="w-3.5 h-3.5" />
          <span>Save Art</span>
        </div>
      ),
      actionLabel: 'Save Finished Art',
      onAction: () => {
        onClose();
      }
    },
    {
      id: 'btn-profile-trial',
      name: 'Profile & 15-Day Free Trial',
      category: 'Navigation',
      whatItDoes: 'Shows user account, 15-day VIP trial countdown, and subscription settings.',
      howToUse: 'Tap avatar to view remaining trial days, upgrade to VIP, compare features, or sign out.',
      kidTip: 'Every new artist gets 15 days of full VIP access with zero locks.',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8EF] border border-[#FFD93D] rounded-xl text-xs font-bold">
          <Crown className="w-3.5 h-3.5 text-[#FF9F43] fill-current" />
          <span>Profile & Trial</span>
        </div>
      )
    },
    {
      id: 'btn-canvas-next',
      name: 'Next Drawing',
      category: 'Canvas Controls',
      whatItDoes: 'Immediately loads another random drawing to color.',
      howToUse: 'Located at top-left of the canvas. Tap whenever you want to quickly jump to another picture without opening the library.',
      kidTip: 'Instant surprise drawing at the tap of a button!',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-[#FFD93D] to-[#FF9F43] text-white font-black text-xs rounded-xl shadow-xs">
          <Shuffle className="w-3.5 h-3.5" />
          <span>Next</span>
        </div>
      ),
      actionLabel: 'Random Next Art',
      onAction: () => {
        if (onQuickNext) onQuickNext();
        onClose();
      }
    },
    {
      id: 'btn-canvas-print',
      name: 'Print A4 Sheet',
      category: 'Canvas Controls',
      whatItDoes: 'Generates a crisp black-and-white A4 printable coloring sheet for real crayons.',
      howToUse: 'Tap to print the current drawing on your home printer for offline coloring fun.',
      kidTip: 'Saves money on physical paper coloring books and makes wonderful fridge art!',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1 px-2.5 py-1 bg-white text-[#2D3436] border border-[#EBE8DC] font-bold text-xs rounded-xl shadow-2xs">
          <Printer className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Print</span>
        </div>
      ),
      actionLabel: 'Print Sheet',
      onAction: () => {
        if (onPrintSheet) onPrintSheet();
        onClose();
      }
    },
    {
      id: 'btn-canvas-reset',
      name: 'Reset Canvas',
      category: 'Canvas Controls',
      whatItDoes: 'Wipes all applied paint colors from the current drawing.',
      howToUse: 'Tap to clean the sheet back to blank black-and-white lines so you can start coloring over again.',
      kidTip: 'Great if you want to experiment with a completely different color scheme!',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1 px-2 py-1 bg-white text-[#FF6B6B] border border-[#FFD5D5] font-bold text-xs rounded-xl shadow-2xs">
          <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
          <span>Reset</span>
        </div>
      )
    },
    {
      id: 'btn-canvas-zoom',
      name: 'Zoom In / Out / Reset',
      category: 'Canvas Controls',
      whatItDoes: 'Zooms into the canvas up to 500% to color small intricate details.',
      howToUse: 'Tap (+) to zoom in, (-) to zoom out, or the percentage badge to reset back to 100% fit.',
      kidTip: 'Zoom in to easily color tiny eyes, teeth, stars, and petals!',
      renderButtonPreview: () => (
        <div className="flex items-center gap-1 px-2 py-1 bg-white border border-[#EBE8DC] rounded-xl text-xs font-bold text-[#2D3436] shadow-2xs">
          <ZoomOut className="w-3.5 h-3.5" />
          <ZoomIn className="w-3.5 h-3.5" />
          <span className="text-[10px] text-[#4D96FF]">100%</span>
        </div>
      )
    },
    {
      id: 'btn-tool-fill',
      name: 'Smart Tap-to-Fill',
      category: 'Palette & Tools',
      whatItDoes: 'Flood-fill tool that colors strictly within vector line boundaries.',
      howToUse: 'Select any color and tap or click on any section of the drawing to fill it instantly.',
      kidTip: 'Guaranteed neat coloring that never bleeds or goes outside the lines.',
      renderButtonPreview: () => (
        <div className="p-1.5 px-2.5 rounded-xl bg-[#FFF9E6] border border-[#FFD93D] text-[#D97706] text-xs font-black flex items-center gap-1">
          <Paintbrush className="w-3.5 h-3.5" />
          <span>Smart Fill</span>
        </div>
      )
    },
    {
      id: 'btn-tool-eraser',
      name: 'Clean Eraser Brush',
      category: 'Palette & Tools',
      whatItDoes: 'Turns your pointer into an eraser to restore colored sections back to white.',
      howToUse: 'Tap the white Eraser tool in the bottom dock, then tap any section you wish to uncolor.',
      kidTip: 'Quickly remove any color you don’t want anymore.',
      renderButtonPreview: () => (
        <div className="p-1.5 px-2.5 rounded-xl bg-[#FFF5F5] border border-[#FFD5D5] text-[#FF6B6B] text-xs font-black flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Eraser</span>
        </div>
      )
    },
    {
      id: 'btn-tool-stamps',
      name: 'Sticker Stamps',
      category: 'Palette & Tools',
      whatItDoes: 'Opens 20+ collectible stamps (crowns, stars, hearts, dinosaur badges).',
      howToUse: 'Tap the Stamp icon in the palette dock, pick a sticker, and tap anywhere on the canvas to stamp it.',
      kidTip: 'Add crowns to animals, bows to dinosaurs, or sparkles to stars!',
      renderButtonPreview: () => (
        <div className="p-1.5 px-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-[#7E22CE] text-xs font-black flex items-center gap-1">
          <Smile className="w-3.5 h-3.5 text-[#A855F7]" />
          <span>Stamps</span>
        </div>
      ),
      actionLabel: 'Open Stickers',
      onAction: () => {
        if (onOpenStickers) onOpenStickers();
        onClose();
      }
    },
    {
      id: 'btn-tool-magic-fills',
      name: 'Magic Rainbow & Glitter Fills',
      category: 'Palette & Tools',
      whatItDoes: 'Special dynamic texture fills including rainbow gradients, glitter, and polka dots.',
      howToUse: 'Select the Rainbow or Glitter pills in the palette dock, then tap any section to apply dynamic textures.',
      kidTip: 'Make magical unicorn horns, shiny stars, and dazzling rainbow skies!',
      renderButtonPreview: () => (
        <div className="p-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4D96FF] text-white text-xs font-black flex items-center gap-1 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Magic Fills</span>
        </div>
      )
    },
    {
      id: 'btn-tool-pro-palette',
      name: 'Pro Palette',
      category: 'Palette & Tools',
      whatItDoes: 'Expands your palette with 50+ pastel, neon, and rich earth tones.',
      howToUse: 'Tap the Pro Palette button in the bottom dock to open the full artist color wheel.',
      kidTip: 'Explore soft baby pastels, fiery neons, and nature greens.',
      renderButtonPreview: () => (
        <div className="p-1.5 px-2.5 rounded-xl bg-[#FAF8EF] border border-[#FFD93D] text-[#8C5B00] text-xs font-black flex items-center gap-1 shadow-2xs">
          <Palette className="w-3.5 h-3.5 text-[#FF9F43]" />
          <span>Pro Palette</span>
        </div>
      )
    }
  ];

  // 2. Interactive 6-step guided walkthrough steps
  const steps: HelpStep[] = [
    {
      id: 'explore-art',
      title: 'Choose or Create Art',
      subtitle: 'Pick from 100+ drawings or let AI create one!',
      badge: 'Step 1 of 6',
      badgeColor: 'bg-[#EBF4FF] text-[#0984E3] border-[#B9E0FF]',
      accentColor: '#4D96FF',
      description: 'Explore the Library with cute Animals, Dinosaurs, Cartoons & Vehicles. Want something unique? Tap "Magic AI" to describe anything, or "Photo Art" to turn real photos into coloring outlines!',
      parentTip: 'Parents love Photo Art: snap a picture of your pet, toy, or child to turn it into a custom coloring sheet!',
      icon: Palette,
      illustration: { type: 'library' },
      actionLabel: 'Browse Library',
      onAction: () => {
        if (onOpenLibrary) onOpenLibrary();
        onClose();
      }
    },
    {
      id: 'crayons-patterns',
      title: 'Pick Crayons & Magic Fills',
      subtitle: 'Vibrant colors, glitter swirls, & rainbow fills!',
      badge: 'Step 2 of 6',
      badgeColor: 'bg-[#FFF9E6] text-[#D97706] border-[#FDE68A]',
      accentColor: '#FFD93D',
      description: 'Select from our row of 3D crayons at the bottom. Experiment with Magic Fills like Rainbow Gradient, Shimmer Glitter, and Polka Dot textures that bring drawings to life!',
      parentTip: 'Tap the Pro palette pill to explore 50+ pastel, neon, and rich earth tones.',
      icon: Paintbrush,
      illustration: { type: 'palette' }
    },
    {
      id: 'smart-fill',
      title: 'Tap-to-Color & Clean Lines',
      subtitle: 'Clean coloring without ever spilling over!',
      badge: 'Step 3 of 6',
      badgeColor: 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]',
      accentColor: '#6BCB77',
      description: 'Simply tap or click any section of the drawing. Our Smart Flood-Fill system neatly fills within the black outlines! Made an oopsie? Use the Undo button or tap Eraser to clear.',
      parentTip: 'Zoom in using the (+) button to easily color intricate details and tiny shapes.',
      icon: Layers,
      illustration: { type: 'fill' }
    },
    {
      id: 'educational-numbers',
      title: 'Color by Numbers Mode',
      subtitle: 'Educational phonics & number matching game!',
      badge: 'Step 4 of 6',
      badgeColor: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
      accentColor: '#FF6B6B',
      description: 'Switch on "Numbers" in the top bar. Each section shows a friendly number matching a specific crayon! Great for early number recognition, focus, and hand-eye coordination.',
      parentTip: 'Perfect for ages 3–8 to reinforce numbers 1–10 and pattern matching.',
      icon: Hash,
      illustration: { type: 'numbers' },
      actionLabel: 'Try Numbers Mode',
      onAction: () => {
        if (onToggleNumbers) onToggleNumbers();
        onClose();
      }
    },
    {
      id: 'sticker-stamps',
      title: 'Fun Sticker Stamps',
      subtitle: 'Add crowns, stars, bows & cute animals!',
      badge: 'Step 5 of 6',
      badgeColor: 'bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF]',
      accentColor: '#A855F7',
      description: 'Tap the Stamp icon in the palette dock to open 20+ collectible stickers! Pick a sticker and stamp it anywhere on the canvas to personalize your masterpiece.',
      parentTip: 'Kids can combine multiple stickers to craft their own imaginative stories!',
      icon: Smile,
      illustration: { type: 'stickers' },
      actionLabel: 'Open Stickers',
      onAction: () => {
        if (onOpenStickers) onOpenStickers();
        onClose();
      }
    },
    {
      id: 'save-print',
      title: 'Save Art & Print for Real Crayons',
      subtitle: 'Download PNG or print crisp A4 sheets for home!',
      badge: 'Step 6 of 6',
      badgeColor: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
      accentColor: '#FF9F43',
      description: 'Click "Save Art" to download a crisp, vibrant PNG image of your finished drawing. Want screen-free fun? Tap "Print" to print a clean black-and-white A4 sheet for real crayons at home!',
      parentTip: 'Printable sheets save money on physical coloring books and make wonderful fridge art.',
      icon: Printer,
      illustration: { type: 'print' },
      actionLabel: 'Print Current Sheet',
      onAction: () => {
        if (onPrintSheet) onPrintSheet();
        onClose();
      }
    }
  ];

  const currentStep = steps[activeStepIndex];

  // Filtered button list based on category & search query
  const filteredButtons = buttonItems.filter(btn => {
    const matchesCat = buttonFilter === 'all' || btn.category === buttonFilter;
    const matchesSearch = searchQuery === '' || 
      btn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      btn.whatItDoes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      btn.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Handle keyboard arrow navigation when on tour tab
  useEffect(() => {
    if (!isOpen || activeTab !== 'tour') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, activeStepIndex]);

  const goToNext = () => {
    if (activeStepIndex < steps.length - 1) {
      playSwish();
      setActiveStepIndex(prev => prev + 1);
    } else {
      playFanfare();
      onClose();
    }
  };

  const goToPrev = () => {
    if (activeStepIndex > 0) {
      playSwish();
      setActiveStepIndex(prev => prev - 1);
    }
  };

  const jumpToStep = (idx: number) => {
    playClick();
    setActiveStepIndex(idx);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#2D3436]/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-[#FFD93D] overflow-hidden flex flex-col max-h-[92vh] z-10 select-none"
        >
          {/* Header Banner */}
          <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-[#FFF9E6] via-[#FFF3C4] to-[#FFEAA7] border-b-2 border-[#F0E6B8] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B6B] via-[#FFD93D] to-[#4D96FF] flex items-center justify-center text-white shadow-md transform -rotate-3 shrink-0">
                <Compass className="w-5 h-5 drop-shadow-xs" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#2D3436] font-display flex items-center gap-1.5">
                  Coloro <span className="text-[#FF6B6B]">Help Flow</span>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-[#FF6B6B]/15 text-[#D63031] rounded-full">
                    Studio Guide
                  </span>
                </h2>
                <p className="text-xs font-bold text-[#8C5B00]">
                  Every button & tool explained for kids and parents
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Live Spotlight Tour trigger shortcut */}
              {onStartLiveTour && (
                <button
                  onClick={() => {
                    playChime();
                    onClose();
                    onStartLiveTour();
                  }}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#4D96FF] to-[#6BCB77] text-white rounded-xl text-xs font-black shadow-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                  title="Start live interactive on-screen tour"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live Tour</span>
                </button>
              )}

              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="w-9 h-9 rounded-2xl bg-white/90 hover:bg-white text-[#636E72] hover:text-[#2D3436] border border-[#E8E2CF] flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer shrink-0"
                title="Close Guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs: Button Guide vs Step-by-Step Tour */}
          <div className="px-4 py-2 bg-[#FAF8EF] border-b border-[#EFEAD6] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center p-0.5 bg-white/80 rounded-2xl border border-[#E6E1D0] shadow-xs">
              <button
                onClick={() => {
                  playClick();
                  setActiveTab('buttons');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  activeTab === 'buttons'
                    ? 'bg-gradient-to-r from-[#FFD93D] to-[#FF9F43] text-white shadow-xs'
                    : 'text-[#636E72] hover:text-[#2D3436]'
                }`}
              >
                <span>🔘 Button Guide</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'buttons' ? 'bg-black/15 text-white' : 'bg-[#EFEAD6] text-[#636E72]'
                }`}>
                  {buttonItems.length}
                </span>
              </button>

              <button
                onClick={() => {
                  playClick();
                  setActiveTab('tour');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  activeTab === 'tour'
                    ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FFD93D] text-white shadow-xs'
                    : 'text-[#636E72] hover:text-[#2D3436]'
                }`}
              >
                <span>✨ Studio Steps</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'tour' ? 'bg-black/15 text-white' : 'bg-[#EFEAD6] text-[#636E72]'
                }`}>
                  6 Steps
                </span>
              </button>
            </div>

            {/* Quick Live Tour button on mobile */}
            {onStartLiveTour && (
              <button
                onClick={() => {
                  playChime();
                  onClose();
                  onStartLiveTour();
                }}
                className="sm:hidden flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-[#4D96FF] to-[#6BCB77] text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Tour</span>
              </button>
            )}
          </div>

          {/* TAB 1: INDIVIDUAL BUTTON GUIDE */}
          {activeTab === 'buttons' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Filter Pills & Search Bar */}
              <div className="px-4 sm:px-6 py-2.5 bg-[#FAF8EF]/70 border-b border-[#EFEAD6] flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All Buttons' },
                    { id: 'Navigation', label: '🔝 Navigation' },
                    { id: 'Canvas Controls', label: '🎨 Canvas' },
                    { id: 'Palette & Tools', label: '🖍️ Palette' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        playClick();
                        setButtonFilter(cat.id as any);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                        buttonFilter === cat.id
                          ? 'bg-white text-[#2D3436] shadow-xs border border-[#FFD93D]'
                          : 'text-[#636E72] hover:bg-white/60'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Quick Search */}
                <div className="relative flex items-center w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-[#888] absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search button..."
                    className="w-full pl-8 pr-3 py-1 bg-white border border-[#E5E1D0] rounded-xl text-xs font-bold text-[#2D3436] focus:outline-none focus:border-[#4D96FF]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-[#888] hover:text-[#2D3436] text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Button Cards Grid */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
                {filteredButtons.length === 0 ? (
                  <div className="text-center py-10 text-[#888]">
                    <p className="text-sm font-bold">No button found matching "{searchQuery}".</p>
                  </div>
                ) : (
                  filteredButtons.map(btn => (
                    <div
                      key={btn.id}
                      className="p-3.5 sm:p-4 bg-white rounded-2xl border-2 border-[#EBE8DC] hover:border-[#FFD93D] shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      {/* Left: Button Visual Preview + Title + Category */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* Live Replica of the Button */}
                          <div className="shrink-0 transform group-hover:scale-105 transition-transform">
                            {btn.renderButtonPreview()}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-black text-[#2D3436]">
                              {btn.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FAF8EF] text-[#8C5B00] border border-[#EAE5D4] rounded-md">
                              {btn.category}
                            </span>
                          </div>
                        </div>

                        {/* What It Does Description */}
                        <p className="text-xs text-[#4A4A4A] font-semibold leading-relaxed">
                          <strong className="text-[#2D3436]">Use:</strong> {btn.whatItDoes}
                        </p>

                        {/* Practical Kid & Parent Tip */}
                        <p className="text-[11px] text-[#7A4B00] font-medium bg-[#FFFDF0] px-2 py-1 rounded-lg border border-[#FFEAA7]/60 inline-block">
                          💡 <strong>Tip:</strong> {btn.kidTip}
                        </p>
                      </div>

                      {/* Right: Direct Action Shortcut Button (if applicable) */}
                      {btn.actionLabel && btn.onAction && (
                        <button
                          onClick={() => {
                            playPop();
                            btn.onAction!();
                          }}
                          className="self-start sm:self-center btn-bubbly flex items-center gap-1 px-3 py-1.5 bg-[#4D96FF] hover:bg-[#3B82F6] text-white text-xs font-black rounded-xl shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{btn.actionLabel}</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP STUDIO WALKTHROUGH */}
          {activeTab === 'tour' && (
            <div className="flex-1 flex flex-col justify-between min-h-0 overflow-hidden">
              {/* Step Quick Navigation Bar (Pills & Progress) */}
              <div className="px-4 py-2 bg-[#FAF8EF] border-b border-[#EFEAD6] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
                <div className="flex items-center gap-1.5 min-w-max">
                  {steps.map((step, idx) => {
                    const isActive = idx === activeStepIndex;
                    const isPast = idx < activeStepIndex;
                    return (
                      <button
                        key={step.id}
                        onClick={() => jumpToStep(idx)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white text-[#2D3436] shadow-xs ring-2 ring-[#FFD93D]'
                            : isPast
                            ? 'bg-[#EBF7EE] text-[#15803D] hover:bg-[#DCFCE7]'
                            : 'bg-white/50 text-[#888] hover:bg-white hover:text-[#555]'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isActive ? 'bg-[#FFD93D] text-[#7A4B00]' : isPast ? 'bg-[#10B981] text-white' : 'bg-[#E0DCBC] text-white'
                        }`}>
                          {isPast ? '✓' : idx + 1}
                        </span>
                        <span className="hidden md:inline">{step.title.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Content Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Step Badge & Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${currentStep.badgeColor}`}>
                          <currentStep.icon className="w-3.5 h-3.5" />
                          {currentStep.badge}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-[#2D3436] font-display">
                          {currentStep.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-[#E67E22]">
                          {currentStep.subtitle}
                        </p>
                      </div>

                      {currentStep.actionLabel && currentStep.onAction && (
                        <button
                          onClick={() => {
                            playPop();
                            currentStep.onAction!();
                          }}
                          className="self-start sm:self-auto btn-bubbly flex items-center gap-1.5 px-3 py-1.5 bg-[#4D96FF] hover:bg-[#3B82F6] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{currentStep.actionLabel}</span>
                        </button>
                      )}
                    </div>

                    {/* Interactive Visual Demonstration Box */}
                    <div className="p-4 bg-gradient-to-b from-[#FDFBF7] to-[#F7F4EA] rounded-2xl border-2 border-[#EBE5D3] shadow-inner flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden">
                      {currentStep.illustration.type === 'library' && (
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center py-2">
                          <div className="p-3 bg-white rounded-2xl border-2 border-[#EBE8DC] shadow-sm flex flex-col items-center gap-1.5 w-24 transform -rotate-2 hover:rotate-0 transition-transform">
                            <span className="text-3xl">🦁</span>
                            <span className="text-[10px] font-black text-[#636E72]">100+ Art</span>
                          </div>
                          <div className="p-3 bg-gradient-to-tr from-[#FFF9E6] to-[#FFEAA7] rounded-2xl border-2 border-[#FFD93D] shadow-sm flex flex-col items-center gap-1.5 w-24 transform rotate-2 hover:rotate-0 transition-transform">
                            <Sparkles className="w-8 h-8 text-[#D97706]" />
                            <span className="text-[10px] font-black text-[#8C5B00]">Magic AI</span>
                          </div>
                          <div className="p-3 bg-gradient-to-tr from-[#F0FDF4] to-[#DCFCE7] rounded-2xl border-2 border-[#86EFAC] shadow-sm flex flex-col items-center gap-1.5 w-24 transform -rotate-1 hover:rotate-0 transition-transform">
                            <Camera className="w-8 h-8 text-[#16A34A]" />
                            <span className="text-[10px] font-black text-[#15803D]">Photo Art</span>
                          </div>
                        </div>
                      )}

                      {currentStep.illustration.type === 'palette' && (
                        <div className="flex items-center gap-2 sm:gap-3 justify-center py-2">
                          {['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D'].map((color) => (
                            <div
                              key={color}
                              className="w-8 h-16 sm:w-10 sm:h-20 rounded-t-full shadow-md flex flex-col justify-end p-1 transform transition-transform hover:-translate-y-2 cursor-pointer"
                              style={{ backgroundColor: color }}
                            >
                              <div className="w-full h-3 bg-white/30 rounded-sm" />
                            </div>
                          ))}
                          <div className="w-8 h-16 sm:w-10 sm:h-20 rounded-t-full shadow-md flex flex-col justify-end p-1 bg-gradient-to-b from-[#FF6B6B] via-[#FFD93D] to-[#4D96FF] transform hover:-translate-y-2 transition-transform cursor-pointer">
                            <div className="w-full text-center text-[9px] font-black text-white">✨</div>
                          </div>
                        </div>
                      )}

                      {currentStep.illustration.type === 'fill' && (
                        <div className="flex items-center gap-4 py-2">
                          <div className="relative w-28 h-24 bg-white rounded-2xl border-3 border-[#2D3436] p-2 flex items-center justify-center shadow-md">
                            <svg viewBox="0 0 100 100" className="w-16 h-16">
                              <polygon
                                points="50,10 63,38 93,38 68,57 77,87 50,70 23,87 32,57 7,38 37,38"
                                fill="#FFD93D"
                                stroke="#2D3436"
                                strokeWidth="5"
                              />
                            </svg>
                            <div className="absolute -top-2 -right-2 bg-[#10B981] text-white p-1 rounded-full shadow-sm">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="text-left space-y-1">
                            <p className="text-xs font-black text-[#2D3436]">One-Tap Flood Fill</p>
                            <p className="text-[11px] font-bold text-[#636E72]">
                              Colors stay strictly inside vector lines!
                            </p>
                          </div>
                        </div>
                      )}

                      {currentStep.illustration.type === 'numbers' && (
                        <div className="flex items-center gap-3 py-2">
                          <div className="flex items-center gap-2">
                            {[
                              { n: 1, c: '#FF6B6B' },
                              { n: 2, c: '#4D96FF' },
                              { n: 3, c: '#6BCB77' }
                            ].map(item => (
                              <div
                                key={item.n}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md border-2 border-white"
                                style={{ backgroundColor: item.c }}
                              >
                                {item.n}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-black text-[#636E72]">= Match Crayons & Learn!</span>
                        </div>
                      )}

                      {currentStep.illustration.type === 'stickers' && (
                        <div className="flex items-center gap-3 py-2">
                          {['👑', '⭐', '🦖', '🎀', '🎈', '💖'].map((emoji, i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-2xl bg-white border-2 border-[#EAE5D4] shadow-sm flex items-center justify-center text-xl transform hover:scale-110 transition-transform cursor-pointer"
                            >
                              {emoji}
                            </div>
                          ))}
                        </div>
                      )}

                      {currentStep.illustration.type === 'print' && (
                        <div className="flex items-center gap-4 py-2">
                          <div className="w-18 h-24 bg-white rounded-lg border-2 border-[#CBD5E1] shadow-md p-1.5 flex flex-col justify-between items-center transform -rotate-2">
                            <div className="w-12 h-12 border-2 border-dashed border-[#94A3B8] rounded flex items-center justify-center text-xl">
                              🎨
                            </div>
                            <div className="w-full flex flex-col gap-0.5">
                              <div className="w-full h-1 bg-[#E2E8F0] rounded" />
                              <div className="w-3/4 h-1 bg-[#E2E8F0] rounded" />
                            </div>
                          </div>
                          <div className="text-left space-y-1">
                            <p className="text-xs font-black text-[#2D3436]">A4 Printable Home Sheets</p>
                            <p className="text-[11px] font-bold text-[#636E72]">
                              Crisp lines designed for real crayons, pencils & markers!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step Description */}
                    <p className="text-xs sm:text-sm text-[#4A4A4A] font-medium leading-relaxed">
                      {currentStep.description}
                    </p>

                    {/* Parent's Pro-Tip Box */}
                    <div className="p-3 bg-[#FFFDF0] rounded-2xl border border-[#FFEAA7] flex items-start gap-2.5">
                      <span className="text-base shrink-0">💡</span>
                      <div>
                        <span className="text-[11px] font-black text-[#8C5B00] uppercase tracking-wider block">
                          Parent & Teacher Tip
                        </span>
                        <p className="text-xs text-[#7A4B00] font-semibold">
                          {currentStep.parentTip}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Bottom Flow Navigation Controls */}
                <div className="pt-4 mt-3 border-t border-[#EFEAD6] flex items-center justify-between gap-3">
                  <button
                    onClick={goToPrev}
                    disabled={activeStepIndex === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-2xl font-black text-xs text-[#636E72] hover:bg-[#F5F2E6] disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {/* Center Dot Indicators */}
                  <div className="flex items-center gap-1.5">
                    {steps.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => jumpToStep(idx)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === activeStepIndex
                            ? 'w-6 bg-[#FFD93D]'
                            : 'w-2 bg-[#E2DFD2] hover:bg-[#CBD5E1]'
                        }`}
                        title={`Go to step ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={goToNext}
                    className="btn-bubbly flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-[#FF6B6B] to-[#FFD93D] text-white font-black text-xs rounded-2xl shadow-md cursor-pointer active:scale-95 hover:brightness-105"
                  >
                    <span>{activeStepIndex === steps.length - 1 ? "Let's Color!" : "Next Step"}</span>
                    {activeStepIndex === steps.length - 1 ? <Sparkles className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HelpFlowModal;
