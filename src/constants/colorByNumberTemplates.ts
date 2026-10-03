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

const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx},${cy} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 ${-rx * 2},0 Z`;
const rect = (x: number, y: number, w: number, h: number) => `M ${x},${y} L ${x + w},${y} L ${x + w},${y + h} L ${x},${y + h} Z`;
const poly = (...pts: number[]) => pts.reduce((d, v, i) => d + (i % 2 === 0 ? `${i === 0 ? 'M' : ' L'} ${v}` : `,${v}`), '') + ' Z';
const P = (id: string, d: string) => ({ id, d, strokeWidth: S });
const BG = rect(40, 40, 920, 920);

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
  ...[
    // ---------- FREE ----------
    {
      id: 'cbn-butterfly',
      name: 'Pretty Butterfly',
      isVip: false,
      paths: [
        P('sky', BG),
        P('wing-ul', 'M 480,480 C 380,200 150,230 170,400 C 180,500 380,520 480,480 Z'),
        P('wing-ur', 'M 520,480 C 620,200 850,230 830,400 C 820,500 620,520 520,480 Z'),
        P('wing-ll', 'M 480,520 C 330,520 200,600 250,730 C 330,800 450,700 480,520 Z'),
        P('wing-lr', 'M 520,520 C 670,520 800,600 750,730 C 670,800 550,700 520,520 Z'),
        P('body', ell(500, 540, 30, 170)),
        P('head', circle(500, 340, 42)),
        P('spot-ul', circle(300, 360, 42)),
        P('spot-ur', circle(700, 360, 42)),
        P('spot-ll', circle(350, 660, 34)),
        P('spot-lr', circle(650, 660, 34)),
      ],
      slots: { sky: 'sky', 'wing-ul': 'wing', 'wing-ur': 'wing', 'wing-ll': 'wing2', 'wing-lr': 'wing2', body: 'body', head: 'head', 'spot-ul': 'spot', 'spot-ur': 'spot', 'spot-ll': 'spot2', 'spot-lr': 'spot2' },
    },
    {
      id: 'cbn-ice-cream',
      name: 'Yummy Ice Cream',
      isVip: false,
      paths: [
        P('bg', BG),
        P('table', rect(40, 820, 920, 140)),
        P('cone', poly(350, 520, 650, 520, 500, 900)),
        P('scoop-top', circle(500, 340, 125)),
        P('scoop-bottom', ell(500, 480, 175, 100)),
        P('cherry', circle(500, 190, 34)),
      ],
      slots: { bg: 'bg', table: 'table', cone: 'cone', 'scoop-top': 'scoop1', 'scoop-bottom': 'scoop2', cherry: 'cherry' },
    },
    // ---------- PAID ----------
    {
      id: 'cbn-rocket',
      name: 'Zoom Rocket',
      isVip: true,
      paths: [
        P('sky', BG),
        P('planet', circle(810, 200, 80)),
        P('flame', poly(430, 730, 500, 910, 570, 730)),
        P('fin-l', 'M 380,540 L 270,740 L 385,700 Z'),
        P('fin-r', 'M 620,540 L 730,740 L 615,700 Z'),
        P('body', 'M 500,150 C 640,260 640,520 620,740 L 380,740 C 360,520 360,260 500,150 Z'),
        P('nose', 'M 500,150 C 560,200 600,250 615,300 L 385,300 C 400,250 440,200 500,150 Z'),
        P('band', rect(375, 600, 250, 60)),
        P('window', circle(500, 450, 62)),
      ],
      slots: { sky: 'bg', planet: 'planet', flame: 'flame', 'fin-l': 'fin', 'fin-r': 'fin', body: 'body', nose: 'fin', band: 'band', window: 'glass' },
    },
    {
      id: 'cbn-cat',
      name: 'Cute Cat',
      isVip: true,
      paths: [
        P('bg', BG),
        P('body', ell(500, 780, 200, 170)),
        P('ear-l', poly(300, 320, 320, 130, 450, 240)),
        P('ear-r', poly(700, 320, 680, 130, 550, 240)),
        P('head', ell(500, 430, 230, 200)),
        P('muzzle', ell(500, 520, 95, 62)),
        P('nose', poly(468, 485, 532, 485, 500, 520)),
        P('eye-l', circle(415, 395, 36)),
        P('eye-r', circle(585, 395, 36)),
      ],
      slots: { bg: 'bg', body: 'fur2', 'ear-l': 'fur', 'ear-r': 'fur', head: 'fur', muzzle: 'muzzle', nose: 'nose', 'eye-l': 'eye', 'eye-r': 'eye' },
    },
    {
      id: 'cbn-turtle',
      name: 'Friendly Turtle',
      isVip: true,
      paths: [
        P('water', BG),
        P('sand', rect(40, 740, 920, 220)),
        P('tail', poly(240, 640, 150, 690, 250, 700)),
        P('leg-l', rect(300, 650, 90, 120)),
        P('leg-r', rect(610, 650, 90, 120)),
        P('head', circle(840, 590, 72)),
        P('belly', rect(210, 630, 590, 70)),
        P('shell', 'M 220,640 C 220,300 780,300 780,640 Z'),
        P('plate-c', circle(500, 480, 62)),
        P('plate-l', circle(350, 560, 46)),
        P('plate-r', circle(650, 560, 46)),
        P('eye', circle(865, 570, 22)),
      ],
      slots: { water: 'water', sand: 'sand', tail: 'skin', 'leg-l': 'skin', 'leg-r': 'skin', head: 'skin', belly: 'belly', shell: 'shell', 'plate-c': 'plate', 'plate-l': 'plate', 'plate-r': 'plate', eye: 'eye' },
    },
    {
      id: 'cbn-car',
      name: 'Speedy Car',
      isVip: true,
      paths: [
        P('sky', BG),
        P('sun', circle(800, 160, 80)),
        P('road', rect(40, 720, 920, 240)),
        P('car', 'M 140,560 L 140,640 L 860,640 L 860,560 L 760,540 L 660,420 L 380,420 L 280,540 Z'),
        P('win-l', 'M 320,540 L 395,455 L 490,455 L 490,540 Z'),
        P('win-r', 'M 520,540 L 520,455 L 625,455 L 700,540 Z'),
        P('wheel-l', circle(300, 650, 78)),
        P('hub-l', circle(300, 650, 32)),
        P('wheel-r', circle(700, 650, 78)),
        P('hub-r', circle(700, 650, 32)),
        P('light', circle(830, 585, 26)),
      ],
      slots: { sky: 'sky', sun: 'sun', road: 'road', car: 'car', 'win-l': 'glass', 'win-r': 'glass', 'wheel-l': 'wheel', 'hub-l': 'hub', 'wheel-r': 'wheel', 'hub-r': 'hub', light: 'light' },
    },
    {
      id: 'cbn-apple-tree',
      name: 'Apple Tree',
      isVip: true,
      paths: [
        P('sky', BG),
        P('sun', circle(130, 130, 60)),
        P('grass', rect(40, 780, 920, 180)),
        P('trunk', rect(440, 560, 120, 240)),
        P('leaves', 'M 250,420 C 150,420 120,260 270,240 C 290,110 480,80 540,170 C 660,100 840,170 780,300 C 880,380 820,500 700,490 C 640,560 380,570 330,490 C 290,480 250,460 250,420 Z'),
        P('apple-l', circle(380, 320, 38)),
        P('apple-r', circle(640, 300, 38)),
        P('apple-c', circle(500, 440, 38)),
        P('apple-ground', circle(720, 860, 38)),
      ],
      slots: { sky: 'sky', sun: 'sun', grass: 'grass', trunk: 'trunk', leaves: 'green', 'apple-l': 'apple', 'apple-r': 'apple', 'apple-c': 'apple', 'apple-ground': 'apple' },
    },
    {
      id: 'cbn-sailboat',
      name: 'Little Sailboat',
      isVip: true,
      paths: [
        P('sky', BG),
        P('sun', circle(820, 170, 70)),
        P('sea', rect(40, 640, 920, 320)),
        P('sail-big', poly(500, 220, 500, 640, 280, 640)),
        P('sail-small', poly(545, 320, 545, 640, 740, 640)),
        P('flag', poly(500, 220, 500, 150, 600, 185)),
        P('hull', poly(220, 640, 780, 640, 700, 790, 300, 790)),
      ],
      slots: { sky: 'sky', sun: 'sun', sea: 'water', 'sail-big': 'sail', 'sail-small': 'sail2', flag: 'flag', hull: 'hull' },
    },
    {
      id: 'cbn-owl',
      name: 'Wise Owl',
      isVip: true,
      paths: [
        P('bg', BG),
        P('branch', rect(40, 800, 920, 60)),
        P('wing-l', 'M 300,500 C 230,600 250,720 320,760 C 350,680 340,580 300,500 Z'),
        P('wing-r', 'M 700,500 C 770,600 750,720 680,760 C 650,680 660,580 700,500 Z'),
        P('body', ell(500, 560, 210, 260)),
        P('ear-l', poly(320, 340, 330, 190, 440, 290)),
        P('ear-r', poly(680, 340, 670, 190, 560, 290)),
        P('belly', ell(500, 640, 130, 150)),
        P('eyewhite-l', circle(410, 410, 70)),
        P('eyewhite-r', circle(590, 410, 70)),
        P('pupil-l', circle(410, 410, 30)),
        P('pupil-r', circle(590, 410, 30)),
        P('beak', poly(470, 460, 530, 460, 500, 530)),
      ],
      slots: { bg: 'bg', branch: 'branch', 'wing-l': 'wing', 'wing-r': 'wing', body: 'body', 'ear-l': 'feathers', 'ear-r': 'feathers', belly: 'belly', 'eyewhite-l': 'eyewhite', 'eyewhite-r': 'eyewhite', 'pupil-l': 'eye', 'pupil-r': 'eye', beak: 'beak' },
    },
    {
      id: 'cbn-robot',
      name: 'Robo Buddy',
      isVip: true,
      paths: [
        P('bg', BG),
        P('ball', circle(500, 125, 34)),
        P('stem', rect(488, 155, 24, 50)),
        P('neck', rect(465, 420, 70, 60)),
        P('arm-l', rect(190, 490, 90, 250)),
        P('arm-r', rect(720, 490, 90, 250)),
        P('leg-l', rect(360, 770, 90, 160)),
        P('leg-r', rect(550, 770, 90, 160)),
        P('body', rect(300, 460, 400, 320)),
        P('head', rect(330, 190, 340, 240)),
        P('eye-l', circle(430, 300, 42)),
        P('eye-r', circle(570, 300, 42)),
        P('mouth', rect(430, 370, 140, 40)),
        P('panel', rect(400, 520, 200, 120)),
        P('button-l', circle(450, 710, 24)),
        P('button-r', circle(550, 710, 24)),
      ],
      slots: { bg: 'bg', ball: 'light', stem: 'metal', neck: 'metal', 'arm-l': 'metal', 'arm-r': 'metal', 'leg-l': 'metal', 'leg-r': 'metal', body: 'body', head: 'head', 'eye-l': 'eye', 'eye-r': 'eye', mouth: 'mouth', panel: 'panel', 'button-l': 'button', 'button-r': 'button' },
    },
    {
      id: 'cbn-rainbow',
      name: 'Rainbow Sky',
      isVip: true,
      paths: [
        P('bg', BG),
        P('sun', circle(500, 170, 62)),
        P('band-1', 'M 100,700 A 400,400 0 0,1 900,700 Z'),
        P('band-2', 'M 170,700 A 330,330 0 0,1 830,700 Z'),
        P('band-3', 'M 240,700 A 260,260 0 0,1 760,700 Z'),
        P('band-4', 'M 310,700 A 190,190 0 0,1 690,700 Z'),
        P('inner', 'M 380,700 A 120,120 0 0,1 620,700 Z'),
        P('grass', rect(40, 700, 920, 260)),
        P('cloud-l', 'M 70,790 C 20,790 20,720 80,720 C 80,650 190,630 220,700 C 270,650 350,690 340,750 C 390,760 390,790 340,790 Z'),
        P('cloud-r', 'M 930,790 C 980,790 980,720 920,720 C 920,650 810,630 780,700 C 730,650 650,690 660,750 C 610,760 610,790 660,790 Z'),
      ],
      slots: { bg: 'bg', sun: 'sun', 'band-1': 'band1', 'band-2': 'band2', 'band-3': 'band3', 'band-4': 'band4', inner: 'inner', grass: 'grass', 'cloud-l': 'cloud', 'cloud-r': 'cloud' },
    },
    {
      id: 'cbn-ladybug',
      name: 'Lucky Ladybug',
      isVip: true,
      paths: [
        P('bg', BG),
        P('leaf', ell(500, 520, 420, 330)),
        P('leg-l1', ell(260, 470, 50, 24)),
        P('leg-l2', ell(250, 580, 50, 24)),
        P('leg-l3', ell(270, 690, 50, 24)),
        P('leg-r1', ell(740, 470, 50, 24)),
        P('leg-r2', ell(750, 580, 50, 24)),
        P('leg-r3', ell(730, 690, 50, 24)),
        P('head', ell(500, 340, 95, 80)),
        P('shell-l', 'M 500,335 A 225,225 0 0,0 500,785 Z'),
        P('shell-r', 'M 500,335 A 225,225 0 0,1 500,785 Z'),
        P('spot-l1', circle(400, 480, 35)),
        P('spot-l2', circle(420, 650, 40)),
        P('spot-r1', circle(600, 480, 35)),
        P('spot-r2', circle(580, 650, 40)),
        P('eye-l', circle(465, 320, 18)),
        P('eye-r', circle(535, 320, 18)),
      ],
      slots: { bg: 'bg', leaf: 'green', 'leg-l1': 'legs', 'leg-l2': 'legs', 'leg-l3': 'legs', 'leg-r1': 'legs', 'leg-r2': 'legs', 'leg-r3': 'legs', head: 'head', 'shell-l': 'shell', 'shell-r': 'shell', 'spot-l1': 'spot', 'spot-l2': 'spot', 'spot-r1': 'spot', 'spot-r2': 'spot', 'eye-l': 'eye', 'eye-r': 'eye' },
    },
  ].map(({ id, name, isVip, paths, slots }) => ({
    id,
    name,
    category: 'colorbynumber',
    difficulty: 'Easy' as const,
    isVip,
    viewBox: '0 0 1000 1000',
    paths,
    numberMode: { slots, schemes: [] },
  })),
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

const BACKGROUND_SLOTS = new Set(['sky', 'water', 'bg', 'background', 'inner', 'cloud']);
const DARK_SLOTS = new Set(['eye', 'eyes', 'pupil']);
const NATURAL_SLOTS: Record<string, string[]> = {
  grass: ['Green', 'Light Green'],
  green: ['Green', 'Teal'],
  sun: ['Yellow', 'Orange'],
  eyewhite: ['White', 'Light Yellow'],
  sand: ['Light Yellow', 'Orange'],
  trunk: ['Brown', 'Dark Brown'],
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
