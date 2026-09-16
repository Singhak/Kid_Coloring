/**
 * Pinterest Batch Pin Generator & Color Harmony Engine for Coloro.in
 *
 * Generates high-contrast 1000x1500 (2:3 Pinterest standard) pin graphics
 * showcasing the blank printable sheet side-by-side with the vibrant colored version.
 * Supports direct links to categories (e.g., https://coloro.in/?category=animals, https://coloro.in/#category=animals).
 */

import { Template } from '../types';

export interface PinGenerationOptions {
  urlFormat?: 'query' | 'hash' | 'path'; // '?category=animals', '#category=animals', or '/category/animals'
  baseUrl?: string;                      // defaults to 'https://coloro.in'
  includeSchedule?: boolean;
}

export interface GeneratedPinData {
  id: string;
  templateId: string;
  templateName: string;
  category: string;
  categoryLabel: string;
  categoryEmoji: string;
  destinationUrl: string;
  title: string;
  description: string;
  boardName: string;
  keywords: string[];
  scheduledDate: string;  // YYYY-MM-DD
  scheduledTime: string;  // e.g. "09:00"
  svgContent: string;
}

// Category mappings for clean links & display
export const CATEGORY_MAP: Record<string, { id: string; label: string; emoji: string; board: string; querySlug: string }> = {
  animal: { id: 'animal', label: 'Animals', emoji: '🦁', board: 'Kids Coloring Pages - Animals & Pets', querySlug: 'animals' },
  animals: { id: 'animal', label: 'Animals', emoji: '🦁', board: 'Kids Coloring Pages - Animals & Pets', querySlug: 'animals' },
  alphabet: { id: 'alphabet', label: 'Alphabets', emoji: '🔤', board: 'Preschool Alphabet Activities & Printables', querySlug: 'alphabet' },
  alphabets: { id: 'alphabet', label: 'Alphabets', emoji: '🔤', board: 'Preschool Alphabet Activities & Printables', querySlug: 'alphabet' },
  numbers: { id: 'numbers', label: 'Numbers', emoji: '🔢', board: 'Preschool Math & Number Coloring Sheets', querySlug: 'numbers' },
  fruits: { id: 'fruits', label: 'Fruits', emoji: '🍎', board: 'Healthy Fruits Coloring Pages for Kids', querySlug: 'fruits' },
  vegetables: { id: 'vegetables', label: 'Vegetables', emoji: '🥕', board: 'Fun Veggie Coloring Pages for Kids', querySlug: 'vegetables' },
  nature: { id: 'nature', label: 'Nature', emoji: '🌲', board: 'Nature & Landscape Coloring Sheets', querySlug: 'nature' },
  space: { id: 'space', label: 'Space', emoji: '🚀', board: 'Outer Space & Astronaut Coloring Pages', querySlug: 'space' },
  vehicles: { id: 'vehicles', label: 'Vehicles', emoji: '🚗', board: 'Cars, Trucks & Transportation Coloring Sheets', querySlug: 'vehicles' },
  festivals: { id: 'festivals', label: 'Festivals', emoji: '🎉', board: 'Holiday & Festival Coloring Activities', querySlug: 'festivals' },
  weekly: { id: 'weekly', label: 'Weekly Drops', emoji: '🔥', board: 'Coloro Weekly Free Coloring Printables', querySlug: 'weekly' },
  object: { id: 'object', label: 'Objects', emoji: '🧸', board: 'Toys & Everyday Objects Coloring Sheets', querySlug: 'objects' },
};

/**
 * Normalizes category string to standard category metadata
 */
export function getCategoryMeta(catKey: string) {
  const normalized = (catKey || 'animal').toLowerCase();
  return CATEGORY_MAP[normalized] || {
    id: normalized,
    label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    emoji: '🎨',
    board: 'Kids Free Coloring Pages',
    querySlug: normalized
  };
}

/**
 * Builds destination URL for Pinterest pin based on user's preferred format
 */
export function buildPinDestinationUrl(categoryKey: string, format: 'query' | 'hash' | 'path' = 'query', baseUrl: string = 'https://coloro.in'): string {
  const meta = getCategoryMeta(categoryKey);
  const slug = meta.querySlug;
  if (format === 'query') {
    return `${baseUrl}/?category=${slug}`;
  } else if (format === 'path') {
    return `${baseUrl}/category/${slug}`;
  }
  return `${baseUrl}/#category=${slug}`;
}

/**
 * Semantic Color Assignment Engine:
 * Intelligently inspects the path ID and template context to assign
 * vibrant, beautiful, and realistic colors for the finished colored sheet.
 */
export function getSemanticColorForPath(pathId: string, templateCategory: string, pathIndex: number, totalPaths: number): string {
  const id = pathId.toLowerCase();

  // Specific anatomical & object features
  if (id.includes('leaf') || id.includes('stem') || id.includes('grass') || id.includes('tree') || id.includes('fern')) {
    return '#10B981'; // Emerald Green
  }
  if (id.includes('sun') || id.includes('star') || id.includes('gold') || id.includes('banana') || id.includes('lemon')) {
    return '#FBBF24'; // Sunshine Gold
  }
  if (id.includes('cloud') || id.includes('snow') || id.includes('white')) {
    return '#E0F2FE'; // Cloud soft blue-white
  }
  if (id.includes('water') || id.includes('ocean') || id.includes('sea') || id.includes('river') || id.includes('sky')) {
    return '#38BDF8'; // Sky cyan
  }
  if (id.includes('apple') || id.includes('cherry') || id.includes('berry') || id.includes('heart') || id.includes('flame') || id.includes('fire')) {
    return '#EF4444'; // Cherry Red
  }
  if (id.includes('cheek') || id.includes('blush') || id.includes('nose-pink') || id.includes('ear-in') || id.includes('inner-ear')) {
    return '#F472B6'; // Soft pink
  }
  if (id.includes('eye') || id.includes('pupil')) {
    return '#1E293B'; // Deep slate / black
  }
  if (id.includes('nose') || id.includes('mouth') || id.includes('smile') || id.includes('whisker')) {
    return '#334155';
  }
  if (id.includes('roof') || id.includes('pot') || id.includes('chimney') || id.includes('brick')) {
    return '#EA580C'; // Warm terracotta / burnt orange
  }
  if (id.includes('wall') || id.includes('door') || id.includes('house')) {
    return '#FDE047'; // Warm cottage yellow
  }
  if (id.includes('wheel') || id.includes('tire')) {
    return '#475569'; // Slate tire
  }
  if (id.includes('window') || id.includes('glass') || id.includes('dome')) {
    return '#BAE6FD'; // Glass ice blue
  }
  if (id.includes('wing') || id.includes('butterfly') || id.includes('petal')) {
    const wingPalette = ['#818CF8', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];
    return wingPalette[pathIndex % wingPalette.length];
  }
  if (id.includes('let-') || id.includes('letter')) {
    // Bold educational letter colors
    const letterPalette = ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
    return letterPalette[pathIndex % letterPalette.length];
  }
  if (id.includes('num-') || id.includes('number')) {
    const numPalette = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];
    return numPalette[pathIndex % numPalette.length];
  }

  // Category harmonious fallback palettes
  const categoryHarmonies: Record<string, string[]> = {
    animal: ['#F97316', '#FBBF24', '#FB923C', '#FED7AA', '#E0E7FF', '#A7F3D0', '#FDE68A'],
    animals: ['#F97316', '#FBBF24', '#FB923C', '#FED7AA', '#E0E7FF', '#A7F3D0', '#FDE68A'],
    alphabet: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'],
    numbers: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'],
    fruits: ['#EF4444', '#F97316', '#FBBF24', '#84CC16', '#8B5CF6', '#EC4899'],
    vegetables: ['#F97316', '#10B981', '#84CC16', '#EF4444', '#8B5CF6', '#EAB308'],
    space: ['#6366F1', '#38BDF8', '#F43F5E', '#FBBF24', '#A855F7', '#34D399'],
    vehicles: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#64748B'],
    nature: ['#10B981', '#34D399', '#38BDF8', '#FBBF24', '#F97316', '#A78BFA'],
    festivals: ['#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#F43F5E'],
  };

  const palette = categoryHarmonies[templateCategory.toLowerCase()] || [
    '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'
  ];

  return palette[pathIndex % palette.length];
}

/**
 * Escapes XML strings for safe SVG embedding
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a complete, high-contrast 1000x1500 Pinterest Graphic (SVG format)
 * featuring the Blank Coloring Sheet on the left alongside the Colored Version on the right.
 */
export function generatePinterestPinSvg(template: Template, options: PinGenerationOptions = {}): string {
  const urlFormat = options.urlFormat || 'query';
  const baseUrl = options.baseUrl || 'https://coloro.in';
  const catMeta = getCategoryMeta(template.category);
  const destUrl = buildPinDestinationUrl(template.category, urlFormat, baseUrl);

  // Template paths
  const paths = template.paths || [];
  const viewBox = template.viewBox || '0 0 1000 1000';
  const templateName = template.name || 'Coloring Sheet';

  // Build Blank Sheet Paths (Clean, crisp black line-art on white)
  const blankPathsSvg = paths.map(p => {
    const sw = Math.max((p.strokeWidth || 5) * 1.1, 4);
    return `<path d="${escapeXml(p.d)}" fill="#FFFFFF" stroke="#1E293B" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join('\n        ');

  // Build Colored Sheet Paths (Vibrant fills + crisp dark outlines)
  const coloredPathsSvg = paths.map((p, idx) => {
    const fillColor = p.fill && p.fill !== 'none' && p.fill !== '#ffffff' 
      ? p.fill 
      : getSemanticColorForPath(p.id || `path-${idx}`, template.category, idx, paths.length);
    const sw = Math.max((p.strokeWidth || 5) * 0.95, 3.5);
    return `<path d="${escapeXml(p.d)}" fill="${fillColor}" stroke="#1E293B" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join('\n        ');

  // Aesthetic theme accents based on category
  const themeGradients: Record<string, { start: string; end: string; accent: string; badgeBg: string }> = {
    animal: { start: '#FFF7ED', end: '#FFEDD5', accent: '#EA580C', badgeBg: '#FFEDD5' },
    alphabet: { start: '#EFF6FF', end: '#DBEAFE', accent: '#2563EB', badgeBg: '#DBEAFE' },
    numbers: { start: '#F0FDF4', end: '#DCFCE7', accent: '#16A34A', badgeBg: '#DCFCE7' },
    fruits: { start: '#FEF2F2', end: '#FEE2E2', accent: '#DC2626', badgeBg: '#FEE2E2' },
    vegetables: { start: '#F0FDF4', end: '#BBF7D0', accent: '#059669', badgeBg: '#DCFCE7' },
    space: { start: '#FAF5FF', end: '#F3E8FF', accent: '#7C3AED', badgeBg: '#F3E8FF' },
    vehicles: { start: '#FFFBEB', end: '#FEF3C7', accent: '#D97706', badgeBg: '#FEF3C7' },
    festivals: { start: '#FFF1F2', end: '#FFE4E6', accent: '#E11D48', badgeBg: '#FFE4E6' },
  };

  const theme = themeGradients[template.category.toLowerCase()] || {
    start: '#FFFBEB', end: '#FEF3C7', accent: '#EA580C', badgeBg: '#FEF3C7'
  };

  // High contrast 1000x1500 Pinterest 2:3 vertical graphic
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="1500" viewBox="0 0 1000 1500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1000" y2="1500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="40%" stop-color="${theme.start}" />
      <stop offset="100%" stop-color="${theme.end}" />
    </linearGradient>

    <!-- Header Gradient Banner -->
    <linearGradient id="headerGrad" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF5252" />
      <stop offset="50%" stop-color="#FF7675" />
      <stop offset="100%" stop-color="#FFAA00" />
    </linearGradient>

    <!-- CTA Footer Gradient -->
    <linearGradient id="ctaGrad" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>

    <!-- Card Soft Shadow -->
    <filter id="cardShadow" x="-10%" y="-10%" width="125%" height="125%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0F172A" flood-opacity="0.12" />
    </filter>
    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.15" />
    </filter>
  </defs>

  <style>
    .font-title { font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 900; }
    .font-bold { font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 800; }
    .font-medium { font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; }
    .font-mono { font-family: 'SF Mono', Monaco, Consolas, monospace; }
  </style>

  <!-- Canvas Background -->
  <rect width="1000" height="1500" fill="url(#bgGrad)" />

  <!-- Playful Polka Dot Pattern Overlay in Header -->
  <g opacity="0.08">
    <circle cx="50" cy="50" r="15" fill="#000" />
    <circle cx="150" cy="90" r="10" fill="#000" />
    <circle cx="280" cy="40" r="18" fill="#000" />
    <circle cx="850" cy="60" r="16" fill="#000" />
    <circle cx="950" cy="110" r="12" fill="#000" />
    <circle cx="70" cy="1400" r="20" fill="#000" />
    <circle cx="920" cy="1420" r="18" fill="#000" />
  </g>

  <!-- ==================== TOP BRAND & CATEGORY HEADER ==================== -->
  
  <!-- Category Pill Badge -->
  <g transform="translate(50, 48)">
    <rect x="0" y="0" width="260" height="46" rx="23" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#badgeShadow)" />
    <text x="24" y="29" font-size="20" class="font-bold" fill="${theme.accent}">${catMeta.emoji} ${escapeXml(catMeta.label.toUpperCase())}</text>
  </g>

  <!-- Brand Callout -->
  <g transform="translate(680, 48)">
    <rect x="0" y="0" width="270" height="46" rx="23" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#badgeShadow)" />
    <text x="24" y="29" font-size="18" class="font-title" fill="#FF5252">✨ COLORO.IN</text>
  </g>

  <!-- Main Pin Headline (High-Contrast & Hook) -->
  <text x="500" y="160" text-anchor="middle" font-size="44" class="font-title" fill="#0F172A" letter-spacing="-0.5">
    FREE PRINTABLE COLORING PAGE
  </text>
  <text x="500" y="215" text-anchor="middle" font-size="34" class="font-title" fill="${theme.accent}">
    ${escapeXml(templateName)}
  </text>
  <text x="500" y="255" text-anchor="middle" font-size="20" class="font-medium" fill="#64748B">
    Print Clean Line-Art Sheet or Color Online With Magic Brushes!
  </text>

  <!-- ==================== SIDE-BY-SIDE CARDS ==================== -->

  <!-- Card 1: Blank Sheet (Left Side) -->
  <g transform="translate(50, 300)" filter="url(#cardShadow)">
    <!-- White Card Background -->
    <rect x="0" y="0" width="430" height="580" rx="28" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3" />
    
    <!-- Top Card Ribbon -->
    <rect x="0" y="0" width="430" height="66" rx="28" fill="#F8FAFC" />
    <path d="M 0,40 L 0,66 L 430,66 L 430,40 Z" fill="#F8FAFC" />
    <line x1="0" y1="66" x2="430" y2="66" stroke="#E2E8F0" stroke-width="2" />
    <text x="215" y="43" text-anchor="middle" font-size="20" class="font-title" fill="#1E293B">
      🖨️ 1. BLANK PRINTABLE
    </text>

    <!-- SVG Blank Canvas Window -->
    <g transform="translate(25, 90)">
      <rect x="0" y="0" width="380" height="420" rx="16" fill="#FAFAFA" stroke="#F1F5F9" stroke-width="2" />
      <svg x="10" y="10" width="360" height="400" viewBox="${escapeXml(viewBox)}">
        ${blankPathsSvg}
      </svg>
    </g>

    <!-- Subtext Hook under Sheet -->
    <text x="215" y="546" text-anchor="middle" font-size="16" class="font-bold" fill="#64748B">
      High-Resolution • Easy For Toddlers
    </text>
  </g>

  <!-- Card 2: Colored Version (Right Side) -->
  <g transform="translate(520, 300)" filter="url(#cardShadow)">
    <!-- White Card Background -->
    <rect x="0" y="0" width="430" height="580" rx="28" fill="#FFFFFF" stroke="${theme.accent}" stroke-width="3" />
    
    <!-- Top Card Ribbon with Vibrant Fill -->
    <rect x="0" y="0" width="430" height="66" rx="28" fill="${theme.accent}" />
    <path d="M 0,40 L 0,66 L 430,66 L 430,40 Z" fill="${theme.accent}" />
    <text x="215" y="43" text-anchor="middle" font-size="20" class="font-title" fill="#FFFFFF">
      🎨 2. COLORED GUIDE
    </text>

    <!-- SVG Colored Canvas Window -->
    <g transform="translate(25, 90)">
      <rect x="0" y="0" width="380" height="420" rx="16" fill="#FAFAFA" stroke="#F1F5F9" stroke-width="2" />
      <svg x="10" y="10" width="360" height="400" viewBox="${escapeXml(viewBox)}">
        ${coloredPathsSvg}
      </svg>
    </g>

    <!-- Sparkle Badge -->
    <text x="215" y="546" text-anchor="middle" font-size="16" class="font-bold" fill="${theme.accent}">
      ✨ Vibrant In-App Digital Magic
    </text>
  </g>

  <!-- Central "VS / Before ➔ After" Connector Badge -->
  <g transform="translate(500, 580)">
    <circle cx="0" cy="0" r="38" fill="#FFFFFF" stroke="#0F172A" stroke-width="4" filter="url(#badgeShadow)" />
    <text x="0" y="8" text-anchor="middle" font-size="24" class="font-title" fill="#FF5252">➔</text>
  </g>

  <!-- ==================== FEATURE HIGHLIGHTS PILLS ==================== -->
  <g transform="translate(50, 930)">
    <!-- Pill 1 -->
    <g transform="translate(0, 0)">
      <rect width="280" height="64" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#badgeShadow)" />
      <text x="35" y="38" font-size="19" class="font-bold" fill="#0F172A">📄 Instant 1-Click Print</text>
    </g>
    <!-- Pill 2 -->
    <g transform="translate(310, 0)">
      <rect width="280" height="64" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#badgeShadow)" />
      <text x="28" y="38" font-size="19" class="font-bold" fill="#0F172A">📱 Color On Tablet / Phone</text>
    </g>
    <!-- Pill 3 -->
    <g transform="translate(620, 0)">
      <rect width="280" height="64" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#badgeShadow)" />
      <text x="40" y="38" font-size="19" class="font-bold" fill="#0F172A">🆓 100% Free Access</text>
    </g>
  </g>

  <!-- ==================== HIGH-CONVERTING BOTTOM CTA BANNER ==================== -->
  <g transform="translate(50, 1040)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="900" height="390" rx="36" fill="url(#ctaGrad)" />

    <!-- Playful Border Accent -->
    <rect x="8" y="8" width="884" height="374" rx="28" fill="none" stroke="#334155" stroke-width="2" />

    <!-- Big Attention Callout -->
    <g transform="translate(60, 50)">
      <rect x="0" y="0" width="190" height="36" rx="18" fill="#FFD93D" />
      <text x="95" y="24" text-anchor="middle" font-size="15" class="font-title" fill="#0F172A">
        ⭐ NO SIGNUP NEEDED
      </text>
    </g>

    <!-- Bold Call to Action -->
    <text x="60" y="140" font-size="42" class="font-title" fill="#FFFFFF" letter-spacing="-0.5">
      Download &amp; Color Online Now!
    </text>
    <text x="60" y="180" font-size="22" class="font-medium" fill="#94A3B8">
      Explore 100+ free educational sheets in ${escapeXml(catMeta.label)}.
    </text>

    <!-- Direct URL Pill Button -->
    <g transform="translate(60, 220)">
      <rect x="0" y="0" width="780" height="84" rx="42" fill="#FF5252" filter="url(#badgeShadow)" />
      <text x="390" y="52" text-anchor="middle" font-size="28" class="font-title" fill="#FFFFFF">
        👉 Tap To Open: ${escapeXml(destUrl.replace('https://', ''))}
      </text>
    </g>

    <text x="450" y="348" text-anchor="middle" font-size="17" class="font-medium" fill="#CBD5E1">
      Direct Link: <tspan class="font-mono" fill="#38BDF8">${escapeXml(destUrl)}</tspan>
    </text>
  </g>
</svg>`;
}

/**
 * Generates SEO-rich Pinterest Title & Description
 */
export function generatePinMetadata(template: Template, options: PinGenerationOptions = {}): {
  title: string;
  description: string;
  boardName: string;
  destinationUrl: string;
  keywords: string[];
} {
  const urlFormat = options.urlFormat || 'query';
  const baseUrl = options.baseUrl || 'https://coloro.in';
  const catMeta = getCategoryMeta(template.category);
  const destUrl = buildPinDestinationUrl(template.category, urlFormat, baseUrl);
  const name = template.name || 'Coloring Sheet';

  const title = `Free Printable ${catMeta.label} Coloring Sheet - ${name} | Coloro`;

  const keywords = [
    `${catMeta.label.toLowerCase()} coloring pages`,
    'free coloring sheets',
    'printable coloring pages for kids',
    'preschool coloring activities',
    'toddler coloring printables',
    'homeschool art printables',
    name.toLowerCase(),
    'coloro printables'
  ];

  const description = `Download this free printable ${name} coloring page! Perfect for toddlers, preschoolers, and early learners. Features crisp high-contrast outlines for easy crayon coloring alongside a digital magic color preview. Print the PDF directly or color online with interactive sound effects and glitter brushes at Coloro.in. Discover our full ${catMeta.label} collection at ${destUrl}. #kidsactivities #coloringpages #freecoloringpages #toddleractivities #preschoolprintables #homeschooling`;

  return {
    title,
    description,
    boardName: catMeta.board,
    destinationUrl: destUrl,
    keywords
  };
}

/**
 * Batch generates 50–100 pins scheduled across 7 days (5–8 pins/day)
 */
export function batchGeneratePins(templates: Template[], options: PinGenerationOptions = {}): GeneratedPinData[] {
  const urlFormat = options.urlFormat || 'query';
  const baseUrl = options.baseUrl || 'https://coloro.in';

  // Target: 50 to 100 pins
  // Schedule: 5 to 8 pins daily over the next 7 to 14 days
  const now = new Date();
  const generated: GeneratedPinData[] = [];

  // Sort or pick diverse templates across categories
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.category === b.category) return (a.name || '').localeCompare(b.name || '');
    return a.category.localeCompare(b.category);
  });

  const dailyPostingHours = ['08:30', '10:15', '12:00', '14:30', '16:45', '18:30', '20:00', '21:15'];

  sortedTemplates.forEach((template, index) => {
    // Determine posting day & slot: 6-7 pins per day
    const dayOffset = Math.floor(index / 7);
    const timeIndex = index % dailyPostingHours.length;

    const postDate = new Date(now);
    postDate.setDate(now.getDate() + dayOffset);
    const scheduledDate = postDate.toISOString().split('T')[0];
    const scheduledTime = dailyPostingHours[timeIndex];

    const catMeta = getCategoryMeta(template.category);
    const destUrl = buildPinDestinationUrl(template.category, urlFormat, baseUrl);
    const meta = generatePinMetadata(template, options);
    const svgContent = generatePinterestPinSvg(template, options);

    generated.push({
      id: `pin-${index + 1}-${template.id || template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      templateId: template.id || `template-${index + 1}`,
      templateName: template.name,
      category: template.category,
      categoryLabel: catMeta.label,
      categoryEmoji: catMeta.emoji,
      destinationUrl: destUrl,
      title: meta.title,
      description: meta.description,
      boardName: meta.boardName,
      keywords: meta.keywords,
      scheduledDate,
      scheduledTime,
      svgContent
    });
  });

  return generated;
}

/**
 * Exports generated pins metadata strictly following Pinterest's Official Bulk Create CSV standard:
 * Headers: Title, Media URL, Pinterest board, Thumbnail, Description, Link, Publish date, Keywords
 */
export function exportPinsToPinterestCsv(pins: GeneratedPinData[], baseUrl: string = 'https://coloro.in'): string {
  const headers = ['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords'];
  
  const rows = pins.map(pin => {
    // Pinterest constraints:
    // Title <= 100 chars
    const rawTitle = pin.title.length > 95 ? pin.title.substring(0, 95) + '...' : pin.title;
    const cleanTitle = `"${rawTitle.replace(/"/g, '""')}"`;

    // Media URL: Pinterest requires a public image URL ending in .png or .jpg
    const mediaUrl = `"${baseUrl}/pinterest-pins/${pin.id}.png"`;

    // Board: Exact column name "Pinterest board"
    const cleanBoard = `"${pin.boardName.replace(/"/g, '""')}"`;

    // Thumbnail: Empty for images
    const thumbnail = '""';

    // Description <= 500 chars
    const rawDesc = pin.description.length > 480 ? pin.description.substring(0, 480) + '...' : pin.description;
    const cleanDesc = `"${rawDesc.replace(/"/g, '""')}"`;

    // Link: Destination category URL
    const cleanLink = `"${pin.destinationUrl}"`;

    // Publish date: ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
    const publishDate = `"${pin.scheduledDate}T${pin.scheduledTime}:00Z"`;

    // Keywords
    const cleanKeywords = `"${(pin.keywords || []).join(', ').replace(/"/g, '""')}"`;

    return [
      cleanTitle,
      mediaUrl,
      cleanBoard,
      thumbnail,
      cleanDesc,
      cleanLink,
      publishDate,
      cleanKeywords
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Exports generated pins to Pinterest-compliant RSS 2.0 XML Feed with Media Enclosures
 * for zero-touch Auto-Publishing (https://coloro.in/pinterest-feed.xml)
 */
export function exportPinsToRssFeed(pins: GeneratedPinData[], baseUrl: string = 'https://coloro.in'): string {
  const itemsXml = pins.map(pin => {
    const cleanTitle = escapeXml(pin.title.length > 95 ? pin.title.substring(0, 95) + '...' : pin.title);
    const mediaUrl = `${baseUrl}/pinterest-pins/${pin.id}.png`;
    const cleanDesc = escapeXml(pin.description.length > 480 ? pin.description.substring(0, 480) + '...' : pin.description);
    const pubDate = new Date(`${pin.scheduledDate}T${pin.scheduledTime}:00Z`).toUTCString();

    return `    <item>
      <title>${cleanTitle}</title>
      <link>${escapeXml(pin.destinationUrl)}</link>
      <guid isPermaLink="false">coloro-${pin.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${pin.description}]]></description>
      <enclosure url="${mediaUrl}" length="15000" type="image/png" />
      <media:content url="${mediaUrl}" medium="image" type="image/png" width="1000" height="1500" />
      <category>${escapeXml(pin.categoryLabel)}</category>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Coloro: Free Kids Coloring Sheets &amp; Printable Art</title>
    <link>${baseUrl}</link>
    <description>Daily free printable high-contrast coloring sheets, alphabet activities, and online magic drawing for kids.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/pinterest-feed.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
}
