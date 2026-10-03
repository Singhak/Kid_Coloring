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
/** n-pointed star centered on (cx, cy): outer radius R, inner radius r. */
const star = (cx: number, cy: number, R: number, r: number, n = 5) =>
  poly(
    ...Array.from({ length: n * 2 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      const rad = i % 2 === 0 ? R : r;
      return [Math.round(cx + rad * Math.cos(a)), Math.round(cy + rad * Math.sin(a))];
    }).flat()
  );

interface PictureDef {
  id: string;
  name: string;
  isVip: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Detailed';
  paths: { id: string; d: string; strokeWidth: number }[];
  slots: Record<string, string>;
}
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
  ...([
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
    // ---------- MEDIUM (more regions, still big and simple) ----------
    {
      id: 'cbn-birthday-cake',
      name: 'Birthday Cake',
      isVip: false,
      difficulty: 'Medium',
      paths: [
        P('bg', BG),
        P('flag-1', poly(190, 70, 290, 70, 240, 160)),
        P('flag-2', poly(330, 70, 430, 70, 380, 160)),
        P('flag-3', poly(470, 70, 570, 70, 520, 160)),
        P('flag-4', poly(610, 70, 710, 70, 660, 160)),
        P('flag-5', poly(750, 70, 850, 70, 800, 160)),
        P('balloon-l', ell(140, 340, 62, 78)),
        P('balloon-r', ell(860, 340, 62, 78)),
        P('table', rect(40, 800, 920, 160)),
        P('plate', ell(500, 815, 330, 45)),
        P('cake-bottom', rect(250, 640, 500, 175)),
        P('cake-mid', rect(320, 500, 360, 140)),
        P('cake-top', rect(390, 380, 220, 120)),
        P('icing-bottom', rect(250, 640, 500, 40)),
        P('icing-mid', rect(320, 500, 360, 36)),
        P('icing-top', rect(390, 380, 220, 32)),
        P('candle-l', rect(415, 300, 34, 80)),
        P('candle-c', rect(483, 300, 34, 80)),
        P('candle-r', rect(551, 300, 34, 80)),
        P('flame-l', ell(432, 268, 20, 30)),
        P('flame-c', ell(500, 268, 20, 30)),
        P('flame-r', ell(568, 268, 20, 30)),
      ],
      slots: { bg: 'bg', 'flag-1': 'flagA', 'flag-2': 'flagB', 'flag-3': 'flagA', 'flag-4': 'flagB', 'flag-5': 'flagA', 'balloon-l': 'balloon', 'balloon-r': 'balloon', table: 'table', plate: 'plate', 'cake-bottom': 'cakeA', 'cake-mid': 'cakeB', 'cake-top': 'cakeA', 'icing-bottom': 'icing', 'icing-mid': 'icing', 'icing-top': 'icing', 'candle-l': 'candle', 'candle-c': 'candle', 'candle-r': 'candle', 'flame-l': 'flame', 'flame-c': 'flame', 'flame-r': 'flame' },
    },
    {
      id: 'cbn-sea-friends',
      name: 'Sea Friends',
      isVip: true,
      difficulty: 'Medium',
      paths: [
        P('water', BG),
        P('bubble-1', circle(560, 160, 38)),
        P('bubble-2', circle(630, 250, 30)),
        P('bubble-3', circle(180, 300, 32)),
        P('bubble-4', circle(240, 200, 42)),
        P('sand', 'M 40,830 C 250,780 450,880 650,820 C 800,780 900,820 960,810 L 960,960 L 40,960 Z'),
        P('weed-1', 'M 150,850 C 80,740 200,700 130,600 C 220,640 240,740 190,850 Z'),
        P('weed-2', 'M 320,850 C 250,760 350,720 300,650 C 380,690 390,780 350,850 Z'),
        P('weed-3', 'M 850,850 C 780,740 900,700 830,600 C 920,640 940,740 890,850 Z'),
        P('fish1-tail', poly(470, 300, 580, 235, 580, 365)),
        P('fish1-body', ell(380, 300, 115, 68)),
        P('fish1-eye', circle(320, 285, 20)),
        P('fish2-tail', poly(640, 530, 530, 470, 530, 590)),
        P('fish2-body', ell(730, 530, 95, 58)),
        P('fish2-eye', circle(775, 515, 18)),
        P('starfish', star(560, 895, 62, 26)),
        P('shell', 'M 380,935 C 380,860 500,860 500,935 Z'),
      ],
      slots: { water: 'water', 'bubble-1': 'bubble', 'bubble-2': 'bubble', 'bubble-3': 'bubble', 'bubble-4': 'bubble', sand: 'sand', 'weed-1': 'green', 'weed-2': 'green', 'weed-3': 'green', 'fish1-tail': 'finA', 'fish1-body': 'fishA', 'fish1-eye': 'eye', 'fish2-tail': 'finB', 'fish2-body': 'fishB', 'fish2-eye': 'eye', starfish: 'star', shell: 'shell' },
    },
    {
      id: 'cbn-farm-barn',
      name: 'Farm Barn',
      isVip: true,
      difficulty: 'Medium',
      paths: [
        P('sky', BG),
        P('sun', circle(850, 150, 70)),
        P('cloud', 'M 150,230 C 90,230 90,160 150,160 C 160,100 260,100 280,160 C 340,160 340,230 280,230 Z'),
        P('grass', rect(40, 640, 920, 320)),
        P('trunk', rect(130, 520, 50, 200)),
        P('crown', circle(155, 470, 92)),
        P('silo', rect(730, 390, 110, 330)),
        P('silo-roof', 'M 730,390 C 730,300 840,300 840,390 Z'),
        P('wall', rect(280, 420, 420, 300)),
        P('roof', poly(250, 430, 490, 260, 730, 430)),
        P('window', circle(490, 365, 34)),
        P('door-top', poly(400, 560, 580, 560, 490, 640)),
        P('door-left', poly(400, 560, 490, 640, 400, 720)),
        P('door-right', poly(580, 560, 490, 640, 580, 720)),
        P('door-bottom', poly(400, 720, 490, 640, 580, 720)),
        P('flower-1', circle(250, 820, 30)),
        P('flower-2', circle(450, 870, 30)),
        P('flower-3', circle(650, 830, 30)),
        P('flower-4', circle(820, 880, 30)),
      ],
      slots: { sky: 'sky', sun: 'sun', cloud: 'cloud', grass: 'grass', trunk: 'trunk', crown: 'green', silo: 'silo', 'silo-roof': 'roof', wall: 'barn', roof: 'roof', window: 'doorB', 'door-top': 'doorA', 'door-bottom': 'doorA', 'door-left': 'doorB', 'door-right': 'doorB', 'flower-1': 'flower', 'flower-2': 'flower', 'flower-3': 'flower', 'flower-4': 'flower' },
    },
    {
      id: 'cbn-space-adventure',
      name: 'Space Adventure',
      isVip: true,
      difficulty: 'Medium',
      paths: [
        P('bg', BG),
        P('star-1', star(150, 170, 58, 25)),
        P('star-2', star(860, 140, 52, 22)),
        P('star-3', star(120, 520, 46, 20)),
        P('ring', ell(500, 420, 310, 72)),
        P('planet', circle(500, 420, 150)),
        P('crater-1', circle(450, 380, 30)),
        P('crater-2', circle(560, 455, 38)),
        P('moon', circle(180, 790, 95)),
        P('moon-crater-1', circle(150, 765, 26)),
        P('moon-crater-2', circle(210, 825, 22)),
        P('beam', poly(760, 720, 840, 720, 910, 920, 690, 920)),
        P('dome', 'M 740,690 C 740,600 860,600 860,690 Z'),
        P('saucer', ell(800, 700, 125, 40)),
        P('flame', poly(470, 880, 500, 950, 530, 880)),
        P('fin-l', poly(455, 820, 395, 905, 455, 885)),
        P('fin-r', poly(545, 820, 605, 905, 545, 885)),
        P('rocket', 'M 500,640 C 565,690 565,810 555,885 L 445,885 C 435,810 435,690 500,640 Z'),
        P('rocket-window', circle(500, 750, 28)),
      ],
      slots: { bg: 'bg', 'star-1': 'star', 'star-2': 'star', 'star-3': 'star', ring: 'ring', planet: 'planet', 'crater-1': 'crater', 'crater-2': 'crater', moon: 'moon', 'moon-crater-1': 'crater', 'moon-crater-2': 'crater', beam: 'beam', dome: 'dome', saucer: 'saucer', flame: 'flame', 'fin-l': 'fin', 'fin-r': 'fin', rocket: 'rocket', 'rocket-window': 'dome' },
    },
    {
      id: 'cbn-dino-land',
      name: 'Dino Land',
      isVip: true,
      difficulty: 'Medium',
      paths: [
        P('sky', BG),
        P('sun', circle(160, 150, 70)),
        P('cloud', 'M 600,200 C 540,200 540,130 600,130 C 610,70 710,70 730,130 C 790,130 790,200 730,200 Z'),
        P('grass', rect(40, 720, 920, 240)),
        P('volcano', poly(630, 720, 760, 400, 890, 720)),
        P('lava', poly(725, 440, 760, 400, 795, 440, 780, 475, 760, 455, 740, 475)),
        P('leg-1', rect(350, 660, 74, 115)),
        P('leg-2', rect(480, 660, 74, 115)),
        P('tail', poly(580, 545, 730, 665, 570, 655)),
        P('spike-1', poly(375, 495, 410, 425, 445, 490)),
        P('spike-2', poly(450, 482, 485, 412, 520, 482)),
        P('spike-3', poly(525, 492, 558, 430, 590, 510)),
        P('neck', poly(310, 560, 245, 360, 345, 360, 395, 520)),
        P('body', ell(450, 595, 170, 115)),
        P('head', ell(250, 335, 85, 58)),
        P('eye', circle(222, 318, 17)),
        P('egg-1', ell(180, 835, 45, 58)),
        P('egg-2', ell(270, 870, 40, 50)),
      ],
      slots: { sky: 'sky', sun: 'sun', cloud: 'cloud', grass: 'grass', volcano: 'volcano', lava: 'lava', 'leg-1': 'legs', 'leg-2': 'legs', tail: 'dino', 'spike-1': 'spike', 'spike-2': 'spike', 'spike-3': 'spike', neck: 'dino', body: 'dino', head: 'dino', eye: 'eye', 'egg-1': 'egg', 'egg-2': 'egg' },
    },
    {
      id: 'cbn-princess-castle',
      name: 'Princess Castle',
      isVip: true,
      difficulty: 'Medium',
      paths: [
        P('sky', BG),
        P('sun', circle(850, 140, 65)),
        P('cloud', 'M 70,220 C 20,220 20,150 80,150 C 90,90 200,90 220,150 C 280,150 290,220 230,220 Z'),
        P('grass', rect(40, 780, 920, 180)),
        P('wall', rect(300, 460, 400, 320)),
        P('keep', rect(410, 330, 180, 160)),
        P('tower-l', rect(210, 400, 130, 380)),
        P('tower-r', rect(660, 400, 130, 380)),
        P('roof-keep', poly(390, 330, 500, 190, 610, 330)),
        P('roof-l', poly(190, 400, 275, 260, 360, 400)),
        P('roof-r', poly(640, 400, 725, 260, 810, 400)),
        P('flag-keep', poly(500, 190, 500, 115, 570, 152)),
        P('flag-l', poly(275, 260, 275, 195, 335, 228)),
        P('flag-r', poly(725, 260, 725, 195, 785, 228)),
        P('door', 'M 440,780 L 440,650 C 440,570 560,570 560,650 L 560,780 Z'),
        P('window-keep', circle(500, 410, 32)),
        P('window-l', circle(275, 520, 32)),
        P('window-r', circle(725, 520, 32)),
      ],
      slots: { sky: 'sky', sun: 'sun', cloud: 'cloud', grass: 'grass', wall: 'wall', keep: 'wall2', 'tower-l': 'tower', 'tower-r': 'tower', 'roof-keep': 'roof', 'roof-l': 'roof', 'roof-r': 'roof', 'flag-keep': 'flag', 'flag-l': 'flag', 'flag-r': 'flag', door: 'door', 'window-keep': 'glass', 'window-l': 'glass', 'window-r': 'glass' },
    },
  ] as PictureDef[]).map(({ id, name, isVip, difficulty, paths, slots }) => ({
    id,
    name,
    category: 'colorbynumber',
    difficulty: difficulty ?? ('Easy' as const),
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
  star: ['Yellow', 'Orange'],
  flame: ['Orange', 'Yellow', 'Red'],
  lava: ['Orange', 'Red'],
  volcano: ['Brown', 'Dark Brown'],
  bubble: ['Light Blue', 'Lavender', 'Light Pink'],
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
