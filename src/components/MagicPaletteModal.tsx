import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  X, 
  Sparkles, 
  Search, 
  Heart, 
  Wand2, 
  Check, 
  Sliders,
  Clock,
  Paintbrush
} from 'lucide-react';
import { 
  MAGIC_COLORS, 
  MAGIC_PALETTE_CATEGORIES, 
  COLOR_METADATA, 
  MagicColorItem, 
  MagicColorCategory 
} from '../constants';
import { SPECIAL_PATTERNS } from './ColorPaletteDock';
import { playPop, playClick, playChime } from '../services/soundEffects';

interface MagicPaletteModalProps {
  showProColors: boolean;
  setShowProColors: (show: boolean) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

const FAVORITES_STORAGE_KEY = 'kidcolor_favorite_palette';
const RECENTS_STORAGE_KEY = 'kidcolor_recent_palette';

const MagicPaletteModal: React.FC<MagicPaletteModalProps> = ({
  showProColors,
  setShowProColors,
  selectedColor,
  setSelectedColor,
}) => {
  const [activeCategory, setActiveCategory] = useState<MagicColorCategory | 'favorites' | 'recents'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState('#FF6B8B');
  const [showMixer, setShowMixer] = useState(false);
  
  // Favorites persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['#FF007F', '#00F0FF', '#FFD700', '#A8E6CF'];
    } catch {
      return ['#FF007F', '#00F0FF', '#FFD700', '#A8E6CF'];
    }
  });

  // Recent colors persistence
  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const customColorInputRef = useRef<HTMLInputElement>(null);

  // Play chime on open
  useEffect(() => {
    if (showProColors) {
      playChime();
    }
  }, [showProColors]);

  const toggleFavorite = (colorHex: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playPop(620);
    setFavorites((prev) => {
      const exists = prev.includes(colorHex);
      const next = exists ? prev.filter((c) => c !== colorHex) : [...prev, colorHex];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSelectColor = (color: string, pitchIndex = 0) => {
    playPop(420 + (pitchIndex % 15) * 32);
    setSelectedColor(color);

    // Save to recents
    setRecents((prev) => {
      const filtered = prev.filter((c) => c !== color);
      const updated = [color, ...filtered].slice(0, 16);
      try {
        localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setShowProColors(false);
  };

  // Inspect currently focused color (either hovered, or active selected)
  const activeInspectionColor = hoveredColor || selectedColor;

  // Metadata for active inspector
  const inspectorMeta = useMemo(() => {
    if (!activeInspectionColor) return null;

    if (activeInspectionColor.startsWith('pattern:')) {
      const pattern = SPECIAL_PATTERNS.find((p) => p.id === activeInspectionColor);
      return {
        name: pattern?.label || 'Magic Pattern',
        emoji: pattern?.icon || '✨',
        hex: activeInspectionColor,
        isPattern: true,
        bg: pattern?.bg,
        categoryName: 'Magic Pattern',
      };
    }

    const magicItem = MAGIC_COLORS.find(
      (m) => m.hex.toLowerCase() === activeInspectionColor.toLowerCase()
    );
    const meta = COLOR_METADATA[activeInspectionColor];

    return {
      name: magicItem?.name || meta?.name || 'Custom Color',
      emoji: magicItem?.emoji || meta?.emoji || '🎨',
      hex: activeInspectionColor.toUpperCase(),
      isPattern: false,
      bg: activeInspectionColor,
      categoryName: magicItem
        ? MAGIC_PALETTE_CATEGORIES.find((c) => c.id === magicItem.category)?.label
        : 'Custom Blend',
    };
  }, [activeInspectionColor]);

  // Filtered colors based on category and search query
  const filteredColors = useMemo(() => {
    let list = MAGIC_COLORS;

    if (activeCategory === 'favorites') {
      list = MAGIC_COLORS.filter((c) => favorites.includes(c.hex));
    } else if (activeCategory === 'recents') {
      // Map recents to known colors or custom hex
      const recentsSet = new Set(recents);
      const fromMagic = MAGIC_COLORS.filter((c) => recentsSet.has(c.hex));
      // Also include any custom hexes not in MAGIC_COLORS
      const customOnes: MagicColorItem[] = recents
        .filter((hex) => !hex.startsWith('pattern:') && !MAGIC_COLORS.some((m) => m.hex === hex))
        .map((hex) => ({
          hex,
          name: 'Custom Mix',
          emoji: '🎨',
          category: 'all' as const,
        }));
      list = [...customOnes, ...fromMagic];
    } else if (activeCategory !== 'all' && activeCategory !== 'patterns') {
      list = MAGIC_COLORS.filter((c) => c.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.hex.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, searchQuery, favorites, recents]);

  const showPatternsSection = activeCategory === 'all' || activeCategory === 'patterns';

  return (
    <AnimatePresence>
      {showProColors && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playClick();
              setShowProColors(false);
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[92dvh] p-3.5 sm:p-6 border-3 sm:border-4 border-[#FFD93D] my-auto flex flex-col select-none"
          >
            {/* Header Section */}
            <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-[#FF6B6B] via-[#FFD93D] to-[#4D96FF] rounded-2xl flex items-center justify-center shadow-md rotate-3 text-white shrink-0">
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-[#2D3436] tracking-tight font-display flex items-center gap-2">
                    <span>Magic Color Palette</span>
                    <span className="text-[10px] sm:text-xs bg-[#FFF3CD] text-[#856404] font-black px-2.5 py-0.5 rounded-full border border-[#FFEBAA] flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-[#FF9248]" />
                      {MAGIC_COLORS.length}+ Shades
                    </span>
                  </h2>
                  <p className="text-[11px] sm:text-xs font-bold text-[#777]">
                    Explore sweet pastels, vibrant neons, rich skin tones & magic patterns!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* DIY Custom Mixer Toggle */}
                <button
                  onClick={() => {
                    playClick();
                    setShowMixer(!showMixer);
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                    showMixer
                      ? 'bg-[#4D96FF] text-white border-[#4D96FF] shadow-sm'
                      : 'bg-[#F4F1EA] text-[#444] border-black/5 hover:bg-[#EAE5D8]'
                  }`}
                  title="Mix Custom Color"
                >
                  <Wand2 className="w-3.5 h-3.5 text-[#FF9248]" />
                  <span className="hidden sm:inline">DIY Mixer</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    playClick();
                    setShowProColors(false);
                  }}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-[#F5F5F5] transition-all cursor-pointer text-[#888] hover:text-[#222]"
                  title="Close Modal"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* DIY Custom Color Mixer Drawer (Expandable) */}
            <AnimatePresence>
              {showMixer && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-3 shrink-0"
                >
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-[#FFF9E6] to-[#F0F7FF] rounded-2xl border-2 border-[#FFD93D]/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative">
                        <input
                          ref={customColorInputRef}
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl cursor-pointer border-3 border-white shadow-md p-0.5 bg-transparent"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-xs pointer-events-none">
                          <Sliders className="w-3 h-3 text-[#555]" />
                        </div>
                      </div>

                      <div>
                        <div className="text-xs sm:text-sm font-black text-[#2D3436] font-display flex items-center gap-1.5">
                          <span>Custom Magic Blend</span>
                          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-black/10 font-bold text-[#555]">
                            {customColor.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#777] font-medium">
                          Tap the square to choose any color from the full rainbow!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleSelectColor(customColor, 5)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#4D96FF] to-[#6BCB77] hover:from-[#3D86EF] hover:to-[#5BBA67] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Paintbrush className="w-4 h-4" />
                        <span>Paint with this Shade!</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Color Inspector Card */}
            {inspectorMeta && (
              <div className="mb-3 p-2.5 sm:p-3 bg-gradient-to-r from-[#FAF8F5] via-white to-[#F6F9FF] rounded-2xl border-2 border-[#EAE6D9] shadow-xs flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Big Glossy Swatch Preview */}
                  <div
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl shadow-md border-2 border-white relative overflow-hidden shrink-0 flex items-center justify-center"
                    style={{
                      background: inspectorMeta.bg || inspectorMeta.hex,
                      backgroundSize: '16px 16px',
                    }}
                  >
                    {/* Top gloss highlight */}
                    <div className="absolute inset-x-1 top-1 h-1/3 rounded-t-xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                    {inspectorMeta.isPattern && (
                      <span className="text-lg drop-shadow-sm">{inspectorMeta.emoji}</span>
                    )}
                  </div>

                  {/* Name & Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base sm:text-lg">{inspectorMeta.emoji}</span>
                      <h3 className="text-sm sm:text-base font-black text-[#2D3436] truncate font-display">
                        {inspectorMeta.name}
                      </h3>
                      {!inspectorMeta.isPattern && (
                        <span className="text-[10px] sm:text-[11px] font-mono font-bold bg-[#EFECE3] text-[#555] px-1.5 py-0.5 rounded-md">
                          {inspectorMeta.hex}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#777] font-semibold truncate">
                      {inspectorMeta.categoryName} • Tap swatch below to paint
                    </p>
                  </div>
                </div>

                {/* Right actions: Favorite toggle & Paint Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!inspectorMeta.isPattern && (
                    <button
                      onClick={(e) => toggleFavorite(inspectorMeta.hex, e)}
                      className={`p-2 rounded-xl transition-all cursor-pointer border ${
                        favorites.includes(inspectorMeta.hex)
                          ? 'bg-[#FFF0F0] border-[#FF6B6B]/40 text-[#FF4757]'
                          : 'bg-white border-black/10 text-[#A0A0A0] hover:text-[#FF6B6B]'
                      }`}
                      title={
                        favorites.includes(inspectorMeta.hex)
                          ? 'Remove from Favorites'
                          : 'Add to Favorites'
                      }
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={favorites.includes(inspectorMeta.hex) ? 'currentColor' : 'none'}
                      />
                    </button>
                  )}

                  <button
                    onClick={() => handleSelectColor(inspectorMeta.hex, 8)}
                    className="px-3 sm:px-4 py-2 rounded-xl bg-[#2D3436] hover:bg-[#111] text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Paint</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD93D]" />
                  </button>
                </div>
              </div>
            )}

            {/* Search Bar & Category Filter Pills */}
            <div className="space-y-2 mb-2 shrink-0">
              {/* Search Bar */}
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shades... (e.g. pink, blue, gold, mint, mocha)"
                  className="w-full bg-[#F5F3EB] hover:bg-[#EFEBDD] focus:bg-white text-xs sm:text-sm font-bold text-[#2D3436] pl-9 pr-8 py-2 rounded-xl border border-black/5 focus:border-[#4D96FF] focus:ring-2 focus:ring-[#4D96FF]/20 transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      playClick();
                      setSearchQuery('');
                    }}
                    className="absolute right-2.5 p-1 rounded-full text-[#888] hover:text-[#222] hover:bg-black/5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {/* Favorites tab */}
                {favorites.length > 0 && (
                  <button
                    onClick={() => {
                      playClick();
                      setActiveCategory('favorites');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer transform active:scale-95 shrink-0 ${
                      activeCategory === 'favorites'
                        ? 'bg-[#FF4757] text-white shadow-sm scale-102'
                        : 'bg-[#FFF0F0] text-[#E03131] hover:bg-[#FFE3E3]'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Favorites ({favorites.length})</span>
                  </button>
                )}

                {/* Recents tab */}
                {recents.length > 0 && (
                  <button
                    onClick={() => {
                      playClick();
                      setActiveCategory('recents');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer transform active:scale-95 shrink-0 ${
                      activeCategory === 'recents'
                        ? 'bg-[#3E54AC] text-white shadow-sm scale-102'
                        : 'bg-[#F0F2FA] text-[#3E54AC] hover:bg-[#E4E8F7]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recent ({recents.length})</span>
                  </button>
                )}

                {MAGIC_PALETTE_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        playClick();
                        setActiveCategory(cat.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer transform active:scale-95 shrink-0 ${
                        isActive
                          ? 'bg-[#2D3436] text-white shadow-sm scale-102'
                          : 'bg-[#F5F3EB] text-[#555] hover:bg-[#EFEBDD] hover:text-[#222]'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Swatches Gallery Container */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 no-scrollbar space-y-4 my-1">
              {/* Special Magic Patterns Row (if in 'all' or 'patterns') */}
              {showPatternsSection && !searchQuery && (
                <div className="p-2.5 bg-[#FFFDF5] rounded-2xl border-2 border-[#FFD93D]/40">
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <Sparkles className="w-4 h-4 text-[#FF9248]" />
                    <span className="text-xs font-black text-[#633900] uppercase tracking-wider font-display">
                      Special Magic Patterns & Textures
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {SPECIAL_PATTERNS.map((pattern, pIdx) => {
                      const isSelected = selectedColor === pattern.id;
                      return (
                        <button
                          key={pattern.id}
                          onClick={() => handleSelectColor(pattern.id, pIdx + 3)}
                          onMouseEnter={() => setHoveredColor(pattern.id)}
                          onMouseLeave={() => setHoveredColor(null)}
                          className={`
                            h-12 rounded-xl flex items-center justify-center gap-1.5 font-black text-xs text-white shadow-xs cursor-pointer relative overflow-hidden transition-all transform hover:scale-105 active:scale-95 border-2
                            ${isSelected ? 'border-[#4D96FF] ring-3 ring-[#4D96FF]/30 scale-102' : 'border-white/60'}
                          `}
                          style={{
                            background: pattern.bg,
                            backgroundSize: pattern.bgSize || 'auto',
                          }}
                        >
                          <div className="absolute inset-0 bg-black/20" />
                          <span className="relative z-10 text-sm">{pattern.icon}</span>
                          <span className="relative z-10 font-display drop-shadow-md">
                            {pattern.label.replace(/[^a-zA-Z]/g, '')}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 z-10 w-4 h-4 rounded-full bg-white text-[#4D96FF] flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Solid Color Shades Grid */}
              {activeCategory !== 'patterns' && (
                <div>
                  {activeCategory === 'all' && !searchQuery && (
                    <div className="flex items-center justify-between px-1 mb-2">
                      <span className="text-xs font-black text-[#2D3436] uppercase tracking-wider font-display">
                        All Magic Shades ({filteredColors.length})
                      </span>
                      <span className="text-[11px] text-[#888] font-bold">
                        Tap any shade to select
                      </span>
                    </div>
                  )}

                  {filteredColors.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-[#FAF8F5] rounded-2xl border-2 border-dashed border-[#E0DCCE]">
                      <span className="text-3xl mb-2 block">🎨</span>
                      <h4 className="text-sm font-black text-[#2D3436] mb-1 font-display">
                        No shades found
                      </h4>
                      <p className="text-xs text-[#777] max-w-xs mx-auto">
                        {searchQuery
                          ? `We couldn't find any shade matching "${searchQuery}". Try searching for 'pink', 'lime', or 'ocean'!`
                          : activeCategory === 'favorites'
                          ? 'No favorite colors saved yet! Tap the heart icon on any color to save it here.'
                          : 'No recent colors yet. Start coloring to see your history!'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-2 sm:gap-2.5 p-1">
                      {filteredColors.map((item, idx) => {
                        const isSelected = selectedColor.toLowerCase() === item.hex.toLowerCase();
                        const isFavorited = favorites.includes(item.hex);

                        return (
                          <button
                            key={item.hex}
                            onClick={() => handleSelectColor(item.hex, idx)}
                            onMouseEnter={() => setHoveredColor(item.hex)}
                            onMouseLeave={() => setHoveredColor(null)}
                            className={`
                              aspect-square rounded-2xl transition-all duration-150 transform hover:scale-115 active:scale-90 shadow-xs hover:shadow-md cursor-pointer relative flex items-center justify-center group overflow-hidden
                              ${
                                isSelected
                                  ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-105 z-10 shadow-md'
                                  : 'border border-black/10 hover:border-black/25'
                              }
                            `}
                            style={{ backgroundColor: item.hex }}
                            title={`${item.emoji} ${item.name} (${item.hex})`}
                          >
                            {/* Top gloss 3D light reflection */}
                            <div className="absolute inset-x-1.5 top-1.5 h-1/3 rounded-t-xl bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />

                            {/* Bottom subtle rim depth */}
                            <div className="absolute inset-x-1.5 bottom-1 h-1 rounded-b-xl bg-black/10 pointer-events-none" />

                            {/* Selected Checkmark Badge */}
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-white/95 text-[#4D96FF] shadow-md flex items-center justify-center z-10 animate-scale-in">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}

                            {/* Mini Favorite indicator dot if favorited */}
                            {isFavorited && !isSelected && (
                              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF4757] ring-1 ring-white shadow-2xs pointer-events-none" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Tip / Quick Encouragement Banner */}
            <div className="mt-2.5 pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-center shrink-0">
              <div className="flex items-center gap-2 text-left">
                <Sparkles className="w-4 h-4 text-[#FF9248] shrink-0" />
                <p className="text-[11px] sm:text-xs font-bold text-[#633900]">
                  Tap any shade or pattern to instantly paint on your coloring page!
                </p>
              </div>

              <div className="text-[11px] font-bold text-[#888] hidden sm:block">
                Press Esc or tap outside to close
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MagicPaletteModal;