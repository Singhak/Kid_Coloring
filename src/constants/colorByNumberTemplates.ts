/**
 * Color-by-Number library.
 * Each picture is geometry (paths) + slots (what a region IS) + schemes (which colors the slots get).
 * The numbered palette is derived from the active scheme, so only the colors a picture needs are shown,
 * and picking a different scheme recolors the same picture.
 */

import { Template, ColorScheme, NumberPaletteEntry } from '../types';

const S = 6; // stroke width
const circle = (cx: number, cy: number, r: number) =>
  `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0 Z`;

export const COLOR_BY_NUMBER_TEMPLATES: Template[] = [
  {
    id: 'cbn-happy-fish',
    name: 'Happy Fish',
    category: 'colorbynumber',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'bg', d: 'M 40,40 L 960,40 L 960,960 L 40,960 Z', strokeWidth: S },
      { id: 'tail', d: 'M 640,500 L 900,340 L 900,660 Z', strokeWidth: S },
      { id: 'fin', d: 'M 380,350 C 410,210 540,210 560,340 Z Z', strokeWidth: S },
      { id: 'body', d: 'M 120,500 C 220,280 560,260 720,500 C 560,740 220,720 120,500 Z', strokeWidth: S },
      { id: 'eye', d: circle(260, 450, 38), strokeWidth: S },
      { id: 'cheek', d: circle(330, 560, 30), strokeWidth: S },
    ],
    numberMode: {
      slots: { bg: 'water', tail: 'accent', body: 'main', fin: 'accent', eye: 'eye', cheek: 'blush' },
      schemes: [
        { id: 'goldfish', name: 'Goldfish', colors: { water: '#74C0FC', main: '#FF922B', accent: '#FFD43B', eye: '#212529', blush: '#FF8787' } },
        { id: 'bluefish', name: 'Blue Fish', colors: { water: '#B2F2BB', main: '#339AF0', accent: '#845EF3', eye: '#212529', blush: '#FFA8A8' } },
        { id: 'candy', name: 'Candy Fish', colors: { water: '#FFF3BF', main: '#F783AC', accent: '#69DB7C', eye: '#212529', blush: '#FF8787' } },
      ],
    },
  },
  {
    id: 'cbn-cozy-house',
    name: 'Cozy House',
    category: 'colorbynumber',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'sky', d: 'M 40,40 L 960,40 L 960,700 L 40,700 Z', strokeWidth: S },
      { id: 'ground', d: 'M 40,700 L 960,700 L 960,960 L 40,960 Z', strokeWidth: S },
      { id: 'sun', d: circle(820, 190, 80), strokeWidth: S },
      { id: 'walls', d: 'M 230,450 L 230,750 L 770,750 L 770,450 Z', strokeWidth: S },
      { id: 'roof', d: 'M 180,450 L 500,200 L 820,450 Z', strokeWidth: S },
      { id: 'door', d: 'M 450,750 L 450,570 L 550,570 L 550,750 Z', strokeWidth: S },
      { id: 'window-l', d: 'M 290,520 L 290,620 L 390,620 L 390,520 Z', strokeWidth: S },
      { id: 'window-r', d: 'M 610,520 L 610,620 L 710,620 L 710,520 Z', strokeWidth: S },
    ],
    numberMode: {
      slots: { sky: 'sky', ground: 'grass', sun: 'sun', walls: 'walls', roof: 'roof', door: 'door', 'window-l': 'glass', 'window-r': 'glass' },
      schemes: [
        { id: 'sunny', name: 'Sunny Day', colors: { sky: '#A5D8FF', grass: '#69DB7C', sun: '#FFD43B', walls: '#FFE8CC', roof: '#E03131', door: '#8D5524', glass: '#74C0FC' } },
        { id: 'sunset', name: 'Sunset', colors: { sky: '#FFC9A3', grass: '#8CE99A', sun: '#FF6B6B', walls: '#FFF3BF', roof: '#7048E8', door: '#5C3A21', glass: '#FFD43B' } },
        { id: 'candy', name: 'Candy House', colors: { sky: '#E5DBFF', grass: '#B2F2BB', sun: '#FFA94D', walls: '#FFDEEB', roof: '#339AF0', door: '#F06595', glass: '#FFF3BF' } },
      ],
    },
  },
  {
    id: 'cbn-smiling-flower',
    name: 'Smiling Flower',
    category: 'colorbynumber',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'sky', d: 'M 40,40 L 960,40 L 960,960 L 40,960 Z', strokeWidth: S },
      { id: 'stem', d: 'M 480,600 L 480,930 L 520,930 L 520,600 Z', strokeWidth: S },
      { id: 'leaf-l', d: 'M 480,800 C 360,740 300,790 300,850 C 390,880 450,860 480,800 Z', strokeWidth: S },
      { id: 'leaf-r', d: 'M 520,760 C 640,700 700,750 700,810 C 610,840 550,820 520,760 Z', strokeWidth: S },
      { id: 'petal-t', d: circle(500, 230, 100), strokeWidth: S },
      { id: 'petal-b', d: circle(500, 570, 100), strokeWidth: S },
      { id: 'petal-l', d: circle(330, 400, 100), strokeWidth: S },
      { id: 'petal-r', d: circle(670, 400, 100), strokeWidth: S },
      { id: 'center', d: circle(500, 400, 130), strokeWidth: S },
    ],
    numberMode: {
      slots: { sky: 'sky', stem: 'green', 'leaf-l': 'green', 'leaf-r': 'green', 'petal-t': 'petal', 'petal-b': 'petal', 'petal-l': 'petal', 'petal-r': 'petal', center: 'center' },
      schemes: [
        { id: 'pink', name: 'Pink Flower', colors: { sky: '#D0EBFF', green: '#51CF66', petal: '#F783AC', center: '#FFD43B' } },
        { id: 'purple', name: 'Purple Flower', colors: { sky: '#FFF3BF', green: '#38D9A9', petal: '#9775FA', center: '#FF922B' } },
        { id: 'sunflower', name: 'Sunflower', colors: { sky: '#C5F6FA', green: '#2F9E44', petal: '#FFD43B', center: '#8D5524' } },
      ],
    },
  },
];

/** Numbered palette for a scheme: one entry per distinct color, numbered in first-use order. */
export function buildNumberPalette(template: Template, scheme: ColorScheme): NumberPaletteEntry[] {
  const slots = template.numberMode?.slots ?? {};
  const byColor = new Map<string, NumberPaletteEntry>();
  for (const p of template.paths) {
    const color = scheme.colors[slots[p.id]];
    if (!color) continue;
    const key = color.toLowerCase();
    const entry = byColor.get(key);
    if (entry) entry.pathIds.push(p.id);
    else byColor.set(key, { number: byColor.size + 1, color, pathIds: [p.id] });
  }
  return [...byColor.values()];
}

/** Simple, kid-friendly color names. Used for random schemes and for the printed color key. */
export interface BasicColor {
  name: string;
  hex: string;
  emoji: string;
  group: 'bright' | 'light' | 'dark' | 'neutral';
}

export const BASIC_COLORS: BasicColor[] = [
  { name: 'Red', hex: '#E63946', emoji: '🍎', group: 'bright' },
  { name: 'Orange', hex: '#FF922B', emoji: '🍊', group: 'bright' },
  { name: 'Yellow', hex: '#FFD43B', emoji: '🌞', group: 'bright' },
  { name: 'Green', hex: '#40C057', emoji: '🍏', group: 'bright' },
  { name: 'Blue', hex: '#339AF0', emoji: '🔵', group: 'bright' },
  { name: 'Purple', hex: '#9775FA', emoji: '🍇', group: 'bright' },
  { name: 'Pink', hex: '#F783AC', emoji: '🌸', group: 'bright' },
  { name: 'Brown', hex: '#8D5524', emoji: '🟤', group: 'bright' },
  { name: 'Teal', hex: '#20C997', emoji: '🐢', group: 'bright' },
  { name: 'Light Blue', hex: '#A5D8FF', emoji: '☁️', group: 'light' },
  { name: 'Light Green', hex: '#B2F2BB', emoji: '🍃', group: 'light' },
  { name: 'Light Yellow', hex: '#FFF3BF', emoji: '🍋', group: 'light' },
  { name: 'Light Pink', hex: '#FFDEEB', emoji: '🎀', group: 'light' },
  { name: 'Lavender', hex: '#E5DBFF', emoji: '💜', group: 'light' },
  { name: 'Black', hex: '#212529', emoji: '⚫', group: 'dark' },
  { name: 'Dark Brown', hex: '#5C3A21', emoji: '🌰', group: 'dark' },
  { name: 'Gray', hex: '#ADB5BD', emoji: '🐘', group: 'neutral' },
  { name: 'White', hex: '#FFFFFF', emoji: '🤍', group: 'neutral' },
];

const BACKGROUND_SLOTS = new Set(['sky', 'water', 'bg', 'background']);
const DARK_SLOTS = new Set(['eye', 'eyes', 'pupil']);
const NATURAL_SLOTS: Record<string, string[]> = {
  grass: ['Green', 'Light Green'],
  green: ['Green', 'Teal'],
  sun: ['Yellow', 'Orange'],
};

const shuffled = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Random scheme from the basic crayon colors: every slot gets its own color (so neighbouring parts
 * never match), backgrounds get a light color and eyes a dark one. Different on every call.
 */
export function randomScheme(template: Template): ColorScheme {
  const slots = [...new Set(Object.values(template.numberMode?.slots ?? {}))];
  const bright = shuffled(BASIC_COLORS.filter(c => c.group === 'bright'));
  const light = shuffled(BASIC_COLORS.filter(c => c.group === 'light'));
  const dark = shuffled(BASIC_COLORS.filter(c => c.group === 'dark'));
  const take = (pool: BasicColor[], fallback: BasicColor[]) => pool.pop() ?? fallback.pop() ?? BASIC_COLORS[0];

  const colors: Record<string, string> = {};
  // Natural parts keep natural colors (grass/stems green, sun warm); everything else is free.
  for (const slot of slots) {
    const options = NATURAL_SLOTS[slot];
    if (!options) continue;
    const pick = shuffled(options)
      .map(n => BASIC_COLORS.find(c => c.name === n)!)
      .find(c => !Object.values(colors).includes(c.hex));
    if (pick) {
      colors[slot] = pick.hex;
      for (const pool of [bright, light]) {
        const i = pool.findIndex(c => c.hex === pick.hex);
        if (i >= 0) pool.splice(i, 1);
      }
    }
  }
  for (const slot of slots) {
    if (colors[slot]) continue;
    const c = BACKGROUND_SLOTS.has(slot)
      ? take(light, bright)
      : DARK_SLOTS.has(slot)
        ? take(dark, bright)
        : take(bright, light);
    colors[slot] = c.hex;
  }
  return { id: `random-${Math.random().toString(36).slice(2, 8)}`, name: 'Surprise Colors', colors };
}

/** Next scheme to play: usually a fresh random one, sometimes a hand-made one; never the same as the last. */
export function pickScheme(template: Template, excludeId?: string): ColorScheme | undefined {
  if (!template.numberMode) return undefined;
  const curated = template.numberMode.schemes.filter(s => s.id !== excludeId);
  if (curated.length > 0 && Math.random() < 0.2) {
    return curated[Math.floor(Math.random() * curated.length)];
  }
  return randomScheme(template);
}

/** Simple name for any hex (nearest basic color), e.g. "Red", "Light Blue". */
export function basicColorName(hex: string): BasicColor {
  const rgb = (h: string) => {
    const n = parseInt(h.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [r, g, b] = rgb(hex);
  let best = BASIC_COLORS[0];
  let bestD = Infinity;
  for (const c of BASIC_COLORS) {
    const [cr, cg, cb] = rgb(c.hex);
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}
