/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Festivals & Holiday Packs System
 * Supports Holi, Christmas, Diwali, Eid, Summer Vacations and more with automatic seasonal detection.
 */

import { Template } from '../types';

export type FestivalId = 'diwali' | 'holi' | 'christmas' | 'eid' | 'summer';

export interface FestivalDateWindow {
  year: number;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;   // 1-12
  endDay: number;
}

export interface FestivalPack {
  id: FestivalId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  emoji: string;
  themeColor: string;
  gradient: string;
  accentBg: string;
  badge: string;
  // Year-specific exact festival windows (including ~10 days pre-festival prep)
  calendarWindows: FestivalDateWindow[];
  // Fallback seasonal months (1-12) if year not specifically matched
  seasonalMonths: number[];
  templates: Template[];
}

export interface ActiveFestivalStatus {
  pack: FestivalPack;
  isLive: boolean; // true if within active date window, false if upcoming
  daysRemainingOrUntil: number;
  message: string;
}

export const FESTIVAL_PACKS: FestivalPack[] = [
  // ==========================================
  // 1. DIWALI (Festival of Lights)
  // ==========================================
  {
    id: 'diwali',
    name: 'Diwali: Festival of Lights',
    shortName: 'Diwali',
    tagline: 'Diyas, Rangolis & Golden Sparklers',
    description: 'Celebrate the victory of light over darkness! Color glowing clay diyas, swirling petal rangolis, and festive sweets.',
    emoji: '🪔',
    themeColor: '#FF9900',
    gradient: 'from-[#FFF7ED] via-[#FFEDD5] to-[#FDBA74]',
    accentBg: '#FF9900',
    badge: 'Festival of Lights',
    seasonalMonths: [10, 11], // October & November
    calendarWindows: [
      { year: 2025, startMonth: 10, startDay: 10, endMonth: 10, endDay: 26 },
      { year: 2026, startMonth: 10, startDay: 28, endMonth: 11, endDay: 14 },
      { year: 2027, startMonth: 10, startDay: 20, endMonth: 11, endDay: 4 },
      { year: 2028, startMonth: 10, startDay: 8, endMonth: 10, endDay: 24 }
    ],
    templates: [
      {
        id: 'fest-diwali-diya-rangoli',
        name: 'Ornate Diya & Floral Rangoli',
        category: 'festivals',
        difficulty: 'Easy',
        isVip: false,
        viewBox: '0 0 1000 1000',
        paths: [
          // Outer Rangoli Petals Circle
          { id: 'rng-petal-top', d: 'M 500,200 C 530,120 570,120 500,60 C 430,120 470,120 500,200 Z', strokeWidth: 6 },
          { id: 'rng-petal-tr', d: 'M 680,320 C 760,280 780,320 780,220 C 700,260 720,300 680,320 Z', strokeWidth: 6 },
          { id: 'rng-petal-r', d: 'M 760,500 C 840,470 840,530 900,500 C 840,470 840,430 760,500 Z', strokeWidth: 6 },
          { id: 'rng-petal-br', d: 'M 680,680 C 760,720 780,680 780,780 C 700,740 720,700 680,680 Z', strokeWidth: 6 },
          { id: 'rng-petal-bot', d: 'M 500,800 C 530,880 570,880 500,940 C 430,880 470,880 500,800 Z', strokeWidth: 6 },
          { id: 'rng-petal-bl', d: 'M 320,680 C 240,720 220,680 220,780 C 300,740 280,700 320,680 Z', strokeWidth: 6 },
          { id: 'rng-petal-l', d: 'M 240,500 C 160,470 160,530 100,500 C 160,470 160,430 240,500 Z', strokeWidth: 6 },
          { id: 'rng-petal-tl', d: 'M 320,320 C 240,280 220,320 220,220 C 300,260 280,300 320,320 Z', strokeWidth: 6 },
          // Rangoli Ring
          { id: 'rng-outer-ring', d: 'M 500,220 C 654,220 780,346 780,500 C 780,654 654,780 500,780 C 346,780 220,654 220,500 C 220,346 346,220 500,220 Z', strokeWidth: 7 },
          { id: 'rng-inner-ring', d: 'M 500,300 C 610,300 700,390 700,500 C 700,610 610,700 500,700 C 390,700 300,610 300,500 C 300,390 390,300 500,300 Z', strokeWidth: 6 },
          // Center Diya Bowl
          { id: 'diya-base', d: 'M 340,500 C 340,660 660,660 660,500 C 660,480 340,480 340,500 Z', strokeWidth: 7 },
          { id: 'diya-rim', d: 'M 320,480 C 320,450 680,450 680,480 C 680,510 320,510 320,480 Z', strokeWidth: 6 },
          { id: 'diya-pattern-1', d: 'M 400,560 Q 500,600 600,560', strokeWidth: 5 },
          { id: 'diya-pattern-2', d: 'M 440,600 Q 500,630 560,600', strokeWidth: 5 },
          // Diya Flame
          { id: 'diya-flame-outer', d: 'M 500,220 C 420,340 450,450 500,450 C 550,450 580,340 500,220 Z', strokeWidth: 6 },
          { id: 'diya-flame-inner', d: 'M 500,280 C 460,350 480,430 500,430 C 520,430 540,350 500,280 Z', strokeWidth: 5 },
          // Diya Flame Aura Sparks
          { id: 'diya-spark-top', d: 'M 500,160 L 500,190', strokeWidth: 5 },
          { id: 'diya-spark-l', d: 'M 430,230 L 460,250', strokeWidth: 5 },
          { id: 'diya-spark-r', d: 'M 570,230 L 540,250', strokeWidth: 5 }
        ]
      },
      {
        id: 'fest-diwali-kandil-lantern',
        name: 'Festive Kandil Sky Lantern',
        category: 'festivals',
        difficulty: 'Medium',
        isVip: true,
        viewBox: '0 0 1000 1000',
        paths: [
          // Hanging Thread & Ring
          { id: 'knd-cord', d: 'M 500,60 L 500,150', strokeWidth: 6 },
          { id: 'knd-ring', d: 'M 500,150 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z', strokeWidth: 5 },
          // Kandil Top Crown & Dome
          { id: 'knd-dome-cap', d: 'M 420,220 C 420,160 580,160 580,220 Z', strokeWidth: 6 },
          // Main Rhombus Body / Central Frame
          { id: 'knd-diamond-center', d: 'M 500,220 L 720,440 L 500,660 L 280,440 Z', strokeWidth: 8 },
          { id: 'knd-inner-square', d: 'M 500,280 L 660,440 L 500,600 L 340,440 Z', strokeWidth: 6 },
          // Star Motif in Center
          { id: 'knd-star', d: 'M 500,380 L 520,420 L 560,420 L 530,450 L 545,490 L 500,465 L 455,490 L 470,450 L 440,420 L 480,420 Z', strokeWidth: 5 },
          // Left & Right Lantern Wings
          { id: 'knd-wing-left', d: 'M 280,440 L 160,340 L 160,540 Z', strokeWidth: 6 },
          { id: 'knd-wing-right', d: 'M 720,440 L 840,340 L 840,540 Z', strokeWidth: 6 },
          // Hanging Festive Ribbons / Frills
          { id: 'knd-frill-1', d: 'M 350,660 L 330,940 L 370,940 L 390,660 Z', strokeWidth: 5 },
          { id: 'knd-frill-2', d: 'M 420,660 L 410,960 L 450,960 L 460,660 Z', strokeWidth: 5 },
          { id: 'knd-frill-3', d: 'M 480,660 L 480,980 L 520,980 L 520,660 Z', strokeWidth: 5 },
          { id: 'knd-frill-4', d: 'M 540,660 L 550,960 L 590,960 L 580,660 Z', strokeWidth: 5 },
          { id: 'knd-frill-5', d: 'M 610,660 L 630,940 L 670,940 L 650,660 Z', strokeWidth: 5 },
          // Sparkler stars in background
          { id: 'knd-spark-1', d: 'M 200,200 L 210,220 L 230,220 L 215,235 L 220,255 L 200,240 L 180,255 L 185,235 L 170,220 L 190,220 Z', strokeWidth: 4 },
          { id: 'knd-spark-2', d: 'M 800,200 L 810,220 L 830,220 L 815,235 L 820,255 L 800,240 L 780,255 L 785,235 L 770,220 L 790,220 Z', strokeWidth: 4 }
        ]
      },
      {
        id: 'fest-diwali-sweets-platter',
        name: 'Celebration Sweets & Thali',
        category: 'festivals',
        difficulty: 'Detailed',
        isVip: true,
        viewBox: '0 0 1000 1000',
        paths: [
          // Brass Thali Plate (Circular Tray)
          { id: 'thali-outer', d: 'M 500,160 C 700,160 860,320 860,520 C 860,720 700,880 500,880 C 300,880 140,720 140,520 C 140,320 300,160 500,160 Z', strokeWidth: 8 },
          { id: 'thali-inner', d: 'M 500,220 C 665,220 800,355 800,520 C 800,685 665,820 500,820 C 335,820 200,685 200,520 C 200,355 335,220 500,220 Z', strokeWidth: 6 },
          // Center Diya
          { id: 'thali-diya-bowl', d: 'M 440,540 C 440,610 560,610 560,540 Z', strokeWidth: 5 },
          { id: 'thali-diya-flame', d: 'M 500,450 C 470,490 485,540 500,540 C 515,540 530,490 500,450 Z', strokeWidth: 5 },
          // Laddoo Sweets Group Top
          { id: 'ldo-1', d: 'M 400,340 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', strokeWidth: 5 },
          { id: 'ldo-2', d: 'M 500,320 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', strokeWidth: 5 },
          { id: 'ldo-3', d: 'M 600,340 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', strokeWidth: 5 },
          // Jalebi Sweets Group Right
          { id: 'jlb-1', d: 'M 680,480 C 720,440 760,480 740,530 C 720,570 660,550 670,500 C 680,470 710,480 700,510', strokeWidth: 6 },
          { id: 'jlb-2', d: 'M 660,600 C 700,560 740,600 720,650 C 700,690 640,670 650,620 C 660,590 690,600 680,630', strokeWidth: 6 },
          // Kaju Katri Diamond Sweets Left
          { id: 'katri-1', d: 'M 300,460 L 350,420 L 400,460 L 350,500 Z', strokeWidth: 5 },
          { id: 'katri-2', d: 'M 280,560 L 330,520 L 380,560 L 330,600 Z', strokeWidth: 5 },
          { id: 'katri-3', d: 'M 320,660 L 370,620 L 420,660 L 370,700 Z', strokeWidth: 5 },
          // Mini Diyas on Border
          { id: 'mini-diya-1', d: 'M 500,760 C 470,760 460,730 500,730 C 540,730 530,760 500,760 Z', strokeWidth: 4 },
          { id: 'mini-diya-flame-1', d: 'M 500,700 C 490,715 495,730 500,730 C 505,730 510,715 500,700 Z', strokeWidth: 4 }
        ]
      }
    ]
  },

  // ==========================================
  // 2. HOLI (Festival of Colors)
  // ==========================================
  {
    id: 'holi',
    name: 'Holi: Festival of Colors',
    shortName: 'Holi',
    tagline: 'Pichkaris, Gulal & Joyful Splashes',
    description: 'Splash into the most colorful festival! Color cheerful water guns, bowls of bright gulal powder, and joyful spring celebrations.',
    emoji: '🎨',
    themeColor: '#EC4899',
    gradient: 'from-[#FDF2F8] via-[#FCE7F3] to-[#F472B6]',
    accentBg: '#EC4899',
    badge: 'Festival of Colors',
    seasonalMonths: [2, 3, 4], // Feb, March, April
    calendarWindows: [
      { year: 2025, startMonth: 3, startDay: 4, endMonth: 3, endDay: 20 },
      { year: 2026, startMonth: 2, startDay: 24, endMonth: 3, endDay: 12 },
      { year: 2027, startMonth: 3, startDay: 12, endMonth: 3, endDay: 28 },
      { year: 2028, startMonth: 3, startDay: 1, endMonth: 3, endDay: 16 }
    ],
    templates: [
      {
        id: 'fest-holi-pichkari-gulal',
        name: 'Playful Pichkari & Gulal Bowls',
        category: 'festivals',
        difficulty: 'Easy',
        isVip: false,
        viewBox: '0 0 1000 1000',
        paths: [
          // Pichkari (Water Gun) Barrel & Body
          { id: 'pich-barrel', d: 'M 220,540 L 640,240 L 680,290 L 260,590 Z', strokeWidth: 7 },
          { id: 'pich-nozzle', d: 'M 640,240 L 740,170 L 770,210 L 680,290 Z', strokeWidth: 7 },
          { id: 'pich-tip-ring', d: 'M 740,170 L 770,210', strokeWidth: 6 },
          // Pichkari Plunger / Handle
          { id: 'pich-rod', d: 'M 240,565 L 140,640', strokeWidth: 8 },
          { id: 'pich-handle', d: 'M 100,600 L 160,680 L 130,700 L 70,620 Z', strokeWidth: 7 },
          // Decorative Rings on Barrel
          { id: 'pich-band-1', d: 'M 350,445 L 390,495', strokeWidth: 6 },
          { id: 'pich-band-2', d: 'M 500,340 L 540,390', strokeWidth: 6 },
          // Color Splash Stream from Nozzle
          { id: 'pich-stream', d: 'M 760,190 Q 860,140 920,80', strokeWidth: 6 },
          { id: 'pich-splash-1', d: 'M 880,70 C 850,40 930,20 950,50 C 970,80 920,110 880,70 Z', strokeWidth: 5 },
          { id: 'pich-splash-2', d: 'M 800,90 m -16,0 a 16,16 0 1,0 32,0 a 16,16 0 1,0 -32,0 Z', strokeWidth: 4 },
          { id: 'pich-splash-3', d: 'M 920,160 m -14,0 a 14,14 0 1,0 28,0 a 14,14 0 1,0 -28,0 Z', strokeWidth: 4 },
          // Bowl 1: Pink Gulal Powder
          { id: 'bowl-1-body', d: 'M 200,820 C 200,940 380,940 380,820 Z', strokeWidth: 7 },
          { id: 'bowl-1-powder', d: 'M 200,820 C 220,740 360,740 380,820 Z', strokeWidth: 6 },
          // Bowl 2: Yellow Gulal Powder
          { id: 'bowl-2-body', d: 'M 420,820 C 420,940 600,940 600,820 Z', strokeWidth: 7 },
          { id: 'bowl-2-powder', d: 'M 420,820 C 440,730 580,730 600,820 Z', strokeWidth: 6 },
          // Bowl 3: Green Gulal Powder
          { id: 'bowl-3-body', d: 'M 640,820 C 640,940 820,940 820,820 Z', strokeWidth: 7 },
          { id: 'bowl-3-powder', d: 'M 640,820 C 660,740 800,740 820,820 Z', strokeWidth: 6 }
        ]
      },
      {
        id: 'fest-holi-dancing-peacock',
        name: 'Holi Dancing Peacock & Colors',
        category: 'festivals',
        difficulty: 'Medium',
        isVip: true,
        viewBox: '0 0 1000 1000',
        paths: [
          // Peacock Crest / Feathers on Crown
          { id: 'pc-crest-1', d: 'M 500,220 L 480,150 M 480,150 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 5 },
          { id: 'pc-crest-2', d: 'M 500,220 L 500,140 M 500,140 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 5 },
          { id: 'pc-crest-3', d: 'M 500,220 L 520,150 M 520,150 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 5 },
          // Head & Beak
          { id: 'pc-head', d: 'M 460,260 C 460,210 540,210 540,260 C 540,300 460,300 460,260 Z', strokeWidth: 6 },
          { id: 'pc-eye', d: 'M 485,250 m -7,0 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0 Z', strokeWidth: 4 },
          { id: 'pc-beak', d: 'M 460,260 L 410,275 L 460,290 Z', strokeWidth: 5 },
          // Graceful Neck & Body
          { id: 'pc-neck', d: 'M 470,290 C 470,380 440,440 450,540 C 460,650 560,650 560,540 C 560,440 530,380 530,290', strokeWidth: 7 },
          { id: 'pc-wing', d: 'M 450,520 C 400,580 430,700 520,700 C 540,650 530,550 450,520 Z', strokeWidth: 6 },
          // Legs
          { id: 'pc-leg-l', d: 'M 480,680 L 470,820 L 440,840', strokeWidth: 6 },
          { id: 'pc-leg-r', d: 'M 530,680 L 540,820 L 570,840', strokeWidth: 6 },
          // Magnificent Tail Feathers Fan
          { id: 'pc-fan-1', d: 'M 450,480 C 260,380 180,500 240,660 C 300,740 440,640 450,480 Z', strokeWidth: 6 },
          { id: 'pc-fan-2', d: 'M 550,480 C 740,380 820,500 760,660 C 700,740 560,640 550,480 Z', strokeWidth: 6 },
          { id: 'pc-fan-top-l', d: 'M 470,380 C 320,260 260,360 380,440 Z', strokeWidth: 6 },
          { id: 'pc-fan-top-r', d: 'M 530,380 C 680,260 740,360 620,440 Z', strokeWidth: 6 },
          // Feather "Eyes"
          { id: 'pc-eye-1', d: 'M 250,540 m -24,0 a 24,24 0 1,0 48,0 a 24,24 0 1,0 -48,0 Z', strokeWidth: 5 },
          { id: 'pc-eye-2', d: 'M 750,540 m -24,0 a 24,24 0 1,0 48,0 a 24,24 0 1,0 -48,0 Z', strokeWidth: 5 },
          { id: 'pc-eye-3', d: 'M 350,340 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', strokeWidth: 5 },
          { id: 'pc-eye-4', d: 'M 650,340 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', strokeWidth: 5 },
          // Color Clouds
          { id: 'pc-cloud-1', d: 'M 140,840 C 100,800 120,720 180,720 C 200,680 260,680 280,720 C 320,720 340,800 300,840 Z', strokeWidth: 5 },
          { id: 'pc-cloud-2', d: 'M 700,840 C 660,800 680,720 740,720 C 760,680 820,680 840,720 C 880,720 900,800 860,840 Z', strokeWidth: 5 }
        ]
      },
      {
        id: 'fest-holi-sweets-celebration',
        name: 'Festive Gujiya Sweets & Color Splashes',
        category: 'festivals',
        difficulty: 'Detailed',
        isVip: true,
        viewBox: '0 0 1000 1000',
        paths: [
          // Thali Serving Plate
          { id: 'h-thali', d: 'M 500,280 C 740,280 900,420 900,600 C 900,780 740,920 500,920 C 260,920 100,780 100,600 C 100,420 260,280 500,280 Z', strokeWidth: 8 },
          { id: 'h-thali-rim', d: 'M 500,320 C 710,320 860,440 860,600 C 860,750 710,880 500,880 C 290,880 140,750 140,600 C 140,440 290,320 500,320 Z', strokeWidth: 6 },
          // Gujiya Sweet 1 (Crescent Dumpling with Crimped Edge)
          { id: 'guj-1-body', d: 'M 280,580 C 280,480 440,480 500,580 Z', strokeWidth: 6 },
          { id: 'guj-1-crimp', d: 'M 280,580 Q 330,600 380,590 Q 440,600 500,580', strokeWidth: 6 },
          // Gujiya Sweet 2
          { id: 'guj-2-body', d: 'M 480,520 C 480,420 640,420 700,520 Z', strokeWidth: 6 },
          { id: 'guj-2-crimp', d: 'M 480,520 Q 530,540 590,530 Q 640,540 700,520', strokeWidth: 6 },
          // Gujiya Sweet 3
          { id: 'guj-3-body', d: 'M 360,700 C 360,600 520,600 580,700 Z', strokeWidth: 6 },
          { id: 'guj-3-crimp', d: 'M 360,700 Q 410,720 470,710 Q 520,720 580,700', strokeWidth: 6 },
          // Thandai Glass Top Right
          { id: 'thn-cup', d: 'M 640,640 L 760,640 L 730,800 L 670,800 Z', strokeWidth: 6 },
          { id: 'thn-rim', d: 'M 640,640 C 640,625 760,625 760,640 C 760,655 640,655 640,640 Z', strokeWidth: 5 },
          { id: 'thn-straw', d: 'M 720,630 L 780,500 L 810,510', strokeWidth: 5 },
          // Splashes Floating Above
          { id: 'h-splash-1', d: 'M 300,160 C 260,120 340,80 380,120 C 420,160 340,200 300,160 Z', strokeWidth: 5 },
          { id: 'h-splash-2', d: 'M 660,180 C 620,130 710,100 750,140 C 780,180 700,220 660,180 Z', strokeWidth: 5 }
        ]
      }
    ]
  },

  // ==========================================
  // 3. CHRISTMAS & WINTER HOLIDAYS
  // ==========================================
  {
    id: 'christmas',
    name: 'Christmas & Winter Holidays',
    shortName: 'Christmas',
    tagline: 'Santa Claus, Christmas Trees & Snowmen',
    description: 'Ring in winter wonder and holiday cheer! Color jolly Santa Claus, sparkling Christmas trees with wrapped gifts, and cute snowmen.',
    emoji: '🎄',
    themeColor: '#EF4444',
    gradient: 'from-[#FEF2F2] via-[#FEE2E2] to-[#FCA5A5]',
    accentBg: '#EF4444',
    badge: 'Winter Holidays',
    seasonalMonths: [12, 1], // December & January
    calendarWindows: [
      { year: 2025, startMonth: 12, startDay: 1, endMonth: 1, endDay: 10 },
      { year: 2026, startMonth: 12, startDay: 1, endMonth: 1, endDay: 10 },
      { year: 2027, startMonth: 12, startDay: 1, endMonth: 1, endDay: 10 },
      { year: 2028, startMonth: 12, startDay: 1, endMonth: 1, endDay: 10 }
    ],
    templates: [
      {
        id: 'fest-xmas-santa-claus',
        name: 'Jolly Santa Claus & Gift Bag',
        category: 'festivals',
        difficulty: 'Easy',
        isVip: false,
        viewBox: '0 0 1000 1000',
        paths: [
          // Santa Hat Pom-Pom
          { id: 'st-pom', d: 'M 680,160 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 6 },
          // Santa Hat Cone
          { id: 'st-hat-cone', d: 'M 350,220 C 360,100 640,80 680,160 L 580,220 Z', strokeWidth: 7 },
          // Hat Trim Fluff
          { id: 'st-hat-trim', d: 'M 320,220 C 320,180 680,180 680,220 C 680,260 320,260 320,220 Z', strokeWidth: 7 },
          // Santa Face
          { id: 'st-face', d: 'M 380,250 C 380,360 620,360 620,250 Z', strokeWidth: 6 },
          // Eyes & Rosy Cheeks
          { id: 'st-eye-l', d: 'M 440,280 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z', strokeWidth: 4 },
          { id: 'st-eye-r', d: 'M 560,280 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z', strokeWidth: 4 },
          { id: 'st-nose', d: 'M 500,310 m -16,0 a 16,16 0 1,0 32,0 a 16,16 0 1,0 -32,0 Z', strokeWidth: 5 },
          // Big Fluffy Moustache
          { id: 'st-moust-l', d: 'M 500,320 C 440,310 380,360 420,380 C 470,400 490,350 500,340 Z', strokeWidth: 6 },
          { id: 'st-moust-r', d: 'M 500,320 C 560,310 620,360 580,380 C 530,400 510,350 500,340 Z', strokeWidth: 6 },
          // Massive Curly White Beard
          { id: 'st-beard', d: 'M 350,260 C 260,380 280,580 500,600 C 720,580 740,380 650,260 C 630,350 590,440 500,440 C 410,440 370,350 350,260 Z', strokeWidth: 7 },
          // Santa Suit Body & Belt
          { id: 'st-body', d: 'M 320,560 C 280,680 260,880 260,940 L 740,940 C 740,880 720,680 680,560 Z', strokeWidth: 8 },
          { id: 'st-belt', d: 'M 270,760 L 730,760 L 730,830 L 270,830 Z', strokeWidth: 7 },
          { id: 'st-buckle', d: 'M 450,740 L 550,740 L 550,850 L 450,850 Z', strokeWidth: 6 },
          { id: 'st-buckle-inner', d: 'M 475,765 L 525,765 L 525,825 L 475,825 Z', strokeWidth: 5 },
          // Gift Sack (Santa's Toy Bag) Right
          { id: 'st-sack', d: 'M 680,600 C 820,600 880,750 860,940 L 680,940 Z', strokeWidth: 7 },
          { id: 'st-sack-tie', d: 'M 700,580 C 680,550 740,550 720,580 Z', strokeWidth: 6 }
        ]
      },
      {
        id: 'fest-xmas-tree-gifts',
        name: 'Decorated Christmas Tree & Gifts',
        category: 'festivals',
        difficulty: 'Medium',
        isVip: true,
        viewBox: '0 0 1000 1000',
        paths: [
          // Golden Star Topper
          { id: 'xt-star', d: 'M 500,80 L 525,140 L 590,145 L 540,190 L 555,250 L 500,215 L 445,250 L 460,190 L 410,145 L 475,140 Z', strokeWidth: 6 },
          // Tree Tier 1 (Top)
          { id: 'xt-tier-1', d: 'M 500,210 L 360,370 L 420,380 L 320,520 L 390,530 L 260,700 L 740,700 L 610,530 L 680,520 L 580,380 L 640,370 Z', strokeWidth: 8 },
          // Tree Trunk & Pot
          { id: 'xt-trunk', d: 'M 460,700 L 460,790 L 540,790 L 540,700 Z', strokeWidth: 7 },
          { id: 'xt-pot', d: 'M 420,790 L 580,790 L 560,920 L 440,920 Z', strokeWidth: 7 },
          // Garland Streamers
          { id: 'xt-garland-1', d: 'M 400,360 Q 500,420 600,360', strokeWidth: 5 },
          { id: 'xt-garland-2', d: 'M 340,500 Q 500,580 660,500', strokeWidth: 5 },
          { id: 'xt-garland-3', d: 'M 280,670 Q 500,760 720,670', strokeWidth: 5 },
          // Tree Baubles / Ornaments
          { id: 'xt-orn-1', d: 'M 480,320 m -18,0 a 18,18 0 1,0 36,0 a 18,18 0 1,0 -36,0 Z', strokeWidth: 5 },
          { id: 'xt-orn-2', d: 'M 420,440 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', strokeWidth: 5 },
          { id: 'xt-orn-3', d: 'M 570,450 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', strokeWidth: 5 },
          { id: 'xt-orn-4', d: 'M 360,600 m -22,0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0 Z', strokeWidth: 5 },
          { id: 'xt-orn-5', d: 'M 500,620 m -22,0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0 Z', strokeWidth: 5 },
          { id: 'xt-orn-6', d: 'M 640,600 m -22,0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0 Z', strokeWidth: 5 },
          // Gift Box Left
          { id: 'xt-gift-1', d: 'M 180,800 L 340,800 L 340,940 L 180,940 Z', strokeWidth: 6 },
          { id: 'xt-ribbon-1', d: 'M 260,800 L 260,940 M 180,870 L 340,870', strokeWidth: 5 },
          { id: 'xt-bow-1', d: 'M 260,800 C 230,760 230,740 260,770 C 290,740 290,760 260,800 Z', strokeWidth: 5 },
          // Gift Box Right
          { id: 'xt-gift-2', d: 'M 660,820 L 820,820 L 820,940 L 660,940 Z', strokeWidth: 6 },
          { id: 'xt-ribbon-2', d: 'M 740,820 L 740,940 M 660,880 L 820,880', strokeWidth: 5 }
        ]
      },
      {
        id: 'fest-xmas-frosty-snowman',
        name: 'Smiling Frosty Snowman in Snow',
        category: 'festivals',
        difficulty: 'Detailed',
        isVip: true,
        viewBox: '0 0 1000 1000',
        paths: [
          // Top Hat Brim & Crown
          { id: 'snw-hat-brim', d: 'M 340,240 L 660,240 L 660,280 L 340,280 Z', strokeWidth: 7 },
          { id: 'snw-hat-crown', d: 'M 400,100 L 600,100 L 600,240 L 400,240 Z', strokeWidth: 7 },
          { id: 'snw-hat-ribbon', d: 'M 400,200 L 600,200 L 600,240 L 400,240 Z', strokeWidth: 5 },
          // Snowman Head
          { id: 'snw-head', d: 'M 500,280 m -120,0 a 120,120 0 1,0 240,0 a 120,120 0 1,0 -240,0 Z', strokeWidth: 7 },
          // Coal Eyes & Carrot Nose
          { id: 'snw-eye-l', d: 'M 450,260 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
          { id: 'snw-eye-r', d: 'M 550,260 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
          { id: 'snw-nose', d: 'M 500,290 L 610,310 L 500,325 Z', strokeWidth: 5 },
          { id: 'snw-smile', d: 'M 450,340 Q 500,380 550,340', strokeWidth: 5 },
          // Cozy Winter Scarf
          { id: 'snw-scarf-neck', d: 'M 370,390 C 370,360 630,360 630,390 C 630,430 370,430 370,390 Z', strokeWidth: 7 },
          { id: 'snw-scarf-tail', d: 'M 540,420 L 570,620 L 510,620 L 490,420 Z', strokeWidth: 6 },
          // Middle Snowball Body
          { id: 'snw-body-mid', d: 'M 500,560 m -170,0 a 170,170 0 1,0 340,0 a 170,170 0 1,0 -340,0 Z', strokeWidth: 8 },
          // Coal Buttons
          { id: 'snw-btn-1', d: 'M 500,480 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
          { id: 'snw-btn-2', d: 'M 500,550 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
          { id: 'snw-btn-3', d: 'M 500,620 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
          // Wooden Stick Arms
          { id: 'snw-arm-l', d: 'M 340,520 L 180,440 M 230,465 L 210,410', strokeWidth: 7 },
          { id: 'snw-arm-r', d: 'M 660,520 L 820,440 M 770,465 L 790,410', strokeWidth: 7 },
          // Bottom Snowball Base
          { id: 'snw-body-base', d: 'M 500,780 m -220,0 a 220,220 0 1,0 440,0 a 220,220 0 1,0 -440,0 Z', strokeWidth: 8 },
          // Falling Snowflakes
          { id: 'snw-flake-1', d: 'M 180,180 L 180,240 M 150,210 L 210,210', strokeWidth: 5 },
          { id: 'snw-flake-2', d: 'M 820,180 L 820,240 M 790,210 L 850,210', strokeWidth: 5 }
        ]
      }
    ]
  },

  // ==========================================
  // 4. EID (Festival of Joy & Peace)
  // ==========================================
  {
    id: 'eid',
    name: 'Eid Mubarak Celebrations',
    shortName: 'Eid',
    tagline: 'Crescent Moon, Fanous Lanterns & Sweets',
    description: 'Celebrate togetherness, peace, and joyous festivities! Color glowing crescent moons, ornate Islamic fanous lanterns, and grand mosque domes.',
    emoji: '🌙',
    themeColor: '#059669',
    gradient: 'from-[#ECFDF5] via-[#D1FAE5] to-[#6EE7B7]',
    accentBg: '#059669',
    badge: 'Eid Celebrations',
    seasonalMonths: [3, 4, 5, 6], // Spring / Summer lunar periods
    calendarWindows: [
      { year: 2025, startMonth: 3, startDay: 20, endMonth: 4, endDay: 5 },
      { year: 2026, startMonth: 3, startDay: 10, endMonth: 3, endDay: 26 },
      { year: 2027, startMonth: 2, startDay: 28, endMonth: 3, endDay: 16 },
      { year: 2028, startMonth: 2, startDay: 18, endMonth: 3, endDay: 6 }
    ],
    templates: [
      {
        id: 'fest-eid-crescent-lantern',
        name: 'Golden Crescent Moon & Fanous Lantern',
        category: 'festivals',
        difficulty: 'Easy',
        isVip: false,
        viewBox: '0 0 1000 1000',
        paths: [
          // Majestic Crescent Moon
          { id: 'eid-moon', d: 'M 440,100 C 660,160 760,400 680,620 C 620,780 440,880 240,840 C 440,820 560,660 540,440 C 520,260 400,160 440,100 Z', strokeWidth: 8 },
          // Hanging Chain for Lantern
          { id: 'eid-chain', d: 'M 360,240 L 360,380', strokeWidth: 6 },
          // Fanous Lantern Cap & Ring
          { id: 'eid-lan-ring', d: 'M 360,380 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', strokeWidth: 5 },
          { id: 'eid-lan-cap', d: 'M 280,450 C 280,400 440,400 440,450 Z', strokeWidth: 6 },
          // Lantern Glass Body (Hexagonal)
          { id: 'eid-lan-body', d: 'M 280,450 L 240,580 L 310,720 L 410,720 L 480,580 L 440,450 Z', strokeWidth: 7 },
          { id: 'eid-lan-glass-mid', d: 'M 360,450 L 360,720', strokeWidth: 5 },
          // Lantern Base & Bottom Finial
          { id: 'eid-lan-base', d: 'M 300,720 L 420,720 L 390,770 L 330,770 Z', strokeWidth: 6 },
          { id: 'eid-lan-tip', d: 'M 360,770 L 360,820 M 360,820 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z', strokeWidth: 4 },
          // Glowing Candle Inside Lantern
          { id: 'eid-candle', d: 'M 345,620 L 375,620 L 375,670 L 345,670 Z', strokeWidth: 4 },
          { id: 'eid-flame', d: 'M 360,570 C 350,590 355,620 360,620 C 365,620 370,590 360,570 Z', strokeWidth: 4 },
          // Five-Pointed Star Floating Next to Moon
          { id: 'eid-star-big', d: 'M 640,320 L 655,360 L 695,365 L 665,395 L 675,435 L 640,415 L 605,435 L 615,395 L 585,365 L 625,360 Z', strokeWidth: 6 },
          // Distant Twinkling Stars
          { id: 'eid-star-2', d: 'M 780,200 L 788,220 L 808,220 L 792,235 L 798,255 L 780,240 L 762,255 L 768,235 L 752,220 L 772,220 Z', strokeWidth: 4 },
          { id: 'eid-star-3', d: 'M 200,340 L 208,360 L 228,360 L 212,375 L 218,395 L 200,380 L 182,395 L 188,375 L 172,360 L 192,360 Z', strokeWidth: 4 }
        ]
      },
      {
        id: 'fest-eid-grand-mosque',
        name: 'Grand Celebration Mosque & Stars',
        category: 'festivals',
        difficulty: 'Medium',
        isVip: true,
        viewBox: '0 0 1000 1000',
        paths: [
          // Main Center Onion Dome
          { id: 'mq-dome-main', d: 'M 360,460 C 360,320 460,220 500,160 C 540,220 640,320 640,460 Z', strokeWidth: 8 },
          { id: 'mq-finial-main', d: 'M 500,160 L 500,100 M 500,100 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 6 },
          // Center Mosque Wall & Grand Archway
          { id: 'mq-main-hall', d: 'M 340,460 L 660,460 L 660,860 L 340,860 Z', strokeWidth: 8 },
          { id: 'mq-arch-outer', d: 'M 400,860 L 400,600 C 400,520 460,480 500,480 C 540,480 600,520 600,600 L 600,860 Z', strokeWidth: 7 },
          { id: 'mq-arch-inner', d: 'M 430,860 L 430,620 C 430,560 470,530 500,530 C 530,530 570,560 570,620 L 570,860 Z', strokeWidth: 6 },
          // Left Minaret Tower
          { id: 'mq-min-l-dome', d: 'M 160,280 C 160,200 200,150 200,150 C 200,150 240,200 240,280 Z', strokeWidth: 6 },
          { id: 'mq-min-l-balcony', d: 'M 140,280 L 260,280 L 250,310 L 150,310 Z', strokeWidth: 6 },
          { id: 'mq-min-l-shaft', d: 'M 160,310 L 160,860 L 240,860 L 240,310 Z', strokeWidth: 7 },
          // Right Minaret Tower
          { id: 'mq-min-r-dome', d: 'M 760,280 C 760,200 800,150 800,150 C 800,150 840,200 840,280 Z', strokeWidth: 6 },
          { id: 'mq-min-r-balcony', d: 'M 740,280 L 860,280 L 850,310 L 750,310 Z', strokeWidth: 6 },
          { id: 'mq-min-r-shaft', d: 'M 760,310 L 760,860 L 840,860 L 840,310 Z', strokeWidth: 7 },
          // Base Steps
          { id: 'mq-steps-1', d: 'M 100,860 L 900,860 L 900,900 L 100,900 Z', strokeWidth: 7 },
          { id: 'mq-steps-2', d: 'M 60,900 L 940,900 L 940,940 L 60,940 Z', strokeWidth: 7 },
          // Crescent Moon in Sky
          { id: 'mq-sky-moon', d: 'M 820,80 C 860,100 880,140 860,180 C 880,170 890,140 880,110 C 870,80 840,70 820,80 Z', strokeWidth: 4 }
        ]
      },
      {
        id: 'fest-eid-sweets-dates',
        name: 'Festive Sheer Khurma & Dates',
        category: 'festivals',
        difficulty: 'Detailed',
        isVip: true,
        viewBox: '0 0 1000 1000',
        paths: [
          // Ornate Dessert Bowl
          { id: 'bowl-rim', d: 'M 220,520 C 220,470 780,470 780,520 C 780,570 220,570 220,520 Z', strokeWidth: 8 },
          { id: 'bowl-body', d: 'M 240,530 C 260,780 740,780 760,530 Z', strokeWidth: 8 },
          { id: 'bowl-stand', d: 'M 400,770 L 600,770 L 640,860 L 360,860 Z', strokeWidth: 7 },
          // Bowl Floral Engraving
          { id: 'bowl-engrave', d: 'M 320,620 Q 500,700 680,620', strokeWidth: 5 },
          // Vermicelli & Milk Surface
          { id: 'sk-swirl-1', d: 'M 320,520 Q 420,490 500,520 Q 580,550 680,520', strokeWidth: 5 },
          { id: 'sk-swirl-2', d: 'M 360,540 Q 500,510 640,540', strokeWidth: 5 },
          // Pistachios & Almonds Topping
          { id: 'nut-1', d: 'M 420,500 C 400,485 450,480 440,510 Z', strokeWidth: 4 },
          { id: 'nut-2', d: 'M 520,510 C 500,495 550,490 540,520 Z', strokeWidth: 4 },
          { id: 'nut-3', d: 'M 470,530 C 450,515 500,510 490,540 Z', strokeWidth: 4 },
          // Date Palm Plate (Left)
          { id: 'dt-plate', d: 'M 120,780 C 120,740 340,740 340,780 C 340,820 120,820 120,780 Z', strokeWidth: 6 },
          // Sweet Dates (Khajoor)
          { id: 'dt-1', d: 'M 180,760 C 160,730 220,710 240,740 C 250,770 190,780 180,760 Z', strokeWidth: 5 },
          { id: 'dt-2', d: 'M 220,760 C 200,730 260,710 280,740 C 290,770 230,780 220,760 Z', strokeWidth: 5 },
          // Ornate Teaspoon Right
          { id: 'spn-handle', d: 'M 720,540 L 860,340 C 880,310 910,330 890,360 L 760,560', strokeWidth: 6 },
          { id: 'spn-bowl', d: 'M 700,540 C 680,520 740,500 750,540 C 760,570 710,570 700,540 Z', strokeWidth: 5 }
        ]
      }
    ]
  },

  // ==========================================
  // 5. SUMMER VACATIONS (Sunny Holidays)
  // ==========================================
  {
    id: 'summer',
    name: 'Summer Vacations Fun Pack',
    shortName: 'Summer Vacations',
    tagline: 'Beaches, Sandcastles & Yummy Ice Creams',
    description: 'School is out and the sunny adventures begin! Color giant beach sandcastles with sea shells, towering triple-scoop ice creams, and cool poolside fun.',
    emoji: '🏖️',
    themeColor: '#0EA5E9',
    gradient: 'from-[#F0F9FF] via-[#E0F2FE] to-[#7DD3FC]',
    accentBg: '#0EA5E9',
    badge: 'Holiday Special',
    seasonalMonths: [5, 6, 7], // May, June, July
    calendarWindows: [
      { year: 2025, startMonth: 5, startDay: 1, endMonth: 7, endDay: 20 },
      { year: 2026, startMonth: 5, startDay: 1, endMonth: 7, endDay: 20 },
      { year: 2027, startMonth: 5, startDay: 1, endMonth: 7, endDay: 20 },
      { year: 2028, startMonth: 5, startDay: 1, endMonth: 7, endDay: 20 }
    ],
    templates: [
      {
        id: 'fest-summer-beach-sandcastle',
        name: 'Beach Sandcastle & Sun Umbrella',
        category: 'festivals',
        difficulty: 'Easy',
        isVip: false,
        viewBox: '0 0 1000 1000',
        paths: [
          // Sandcastle Central Tower
          { id: 'sc-mid-tower', d: 'M 420,440 L 580,440 L 590,740 L 410,740 Z', strokeWidth: 7 },
          // Battlements / Crenels on Mid Tower
          { id: 'sc-mid-crenels', d: 'M 410,440 L 410,400 L 440,400 L 440,440 L 470,440 L 470,400 L 500,400 L 500,440 L 530,440 L 530,400 L 560,400 L 560,440 L 590,440 L 590,400', strokeWidth: 6 },
          // Flag on Center Tower
          { id: 'sc-mid-flag-pole', d: 'M 500,400 L 500,320', strokeWidth: 5 },
          { id: 'sc-mid-flag', d: 'M 500,320 L 560,340 L 500,360 Z', strokeWidth: 5 },
          // Left Tower
          { id: 'sc-l-tower', d: 'M 260,540 L 380,540 L 390,780 L 250,780 Z', strokeWidth: 7 },
          { id: 'sc-l-roof', d: 'M 240,540 L 320,420 L 400,540 Z', strokeWidth: 6 },
          // Right Tower
          { id: 'sc-r-tower', d: 'M 620,540 L 740,540 L 750,780 L 610,780 Z', strokeWidth: 7 },
          { id: 'sc-r-roof', d: 'M 600,540 L 680,420 L 760,540 Z', strokeWidth: 6 },
          // Arched Gate Doorway
          { id: 'sc-door', d: 'M 460,740 L 460,620 C 460,580 540,580 540,620 L 540,740 Z', strokeWidth: 6 },
          // Sand Base Mound
          { id: 'sc-mound', d: 'M 140,860 C 140,760 860,760 860,860 L 860,940 L 140,940 Z', strokeWidth: 8 },
          // Beach Sun Umbrella (Top Left)
          { id: 'sc-umb-pole', d: 'M 200,440 L 140,720', strokeWidth: 6 },
          { id: 'sc-umb-canopy', d: 'M 80,440 C 80,320 320,320 320,440 Z', strokeWidth: 7 },
          { id: 'sc-umb-stripes', d: 'M 140,440 C 160,360 200,320 200,320 M 260,440 C 240,360 200,320 200,320', strokeWidth: 5 },
          // Starfish & Seashell
          { id: 'sc-starfish', d: 'M 720,820 L 730,840 L 750,840 L 735,855 L 740,875 L 720,860 L 700,875 L 705,855 L 690,840 L 710,840 Z', strokeWidth: 5 },
          { id: 'sc-shell', d: 'M 300,830 C 300,800 360,800 360,830 Z', strokeWidth: 5 },
          // Ocean Wave in Background
          { id: 'sc-wave', d: 'M 100,740 Q 300,710 500,740 Q 700,710 900,740', strokeWidth: 5 }
        ]
      },
      {
        id: 'fest-summer-ice-cream-cone',
        name: 'Triple Scoop Ice Cream Waffle Cone',
        category: 'festivals',
        difficulty: 'Medium',
        isVip: true,
        viewBox: '0 0 1000 1000',
        paths: [
          // Cherry on Top
          { id: 'ic-cherry', d: 'M 500,160 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 6 },
          { id: 'ic-stem', d: 'M 500,125 C 500,80 560,60 580,70', strokeWidth: 5 },
          // Scoop 1 (Top Scoop - Strawberry)
          { id: 'ic-scoop-1', d: 'M 380,290 C 380,180 620,180 620,290 C 620,330 380,330 380,290 Z', strokeWidth: 7 },
          { id: 'ic-drip-1', d: 'M 380,290 Q 420,340 460,300 Q 500,340 540,300 Q 580,340 620,290', strokeWidth: 6 },
          // Scoop 2 (Middle Scoop - Mint Chocolate)
          { id: 'ic-scoop-2', d: 'M 340,430 C 340,320 660,320 660,430 C 660,480 340,480 340,430 Z', strokeWidth: 7 },
          { id: 'ic-drip-2', d: 'M 340,430 Q 390,490 440,440 Q 500,500 560,440 Q 610,490 660,430', strokeWidth: 6 },
          // Scoop 3 (Bottom Scoop - Mango)
          { id: 'ic-scoop-3', d: 'M 310,580 C 310,460 690,460 690,580 C 690,640 310,640 310,580 Z', strokeWidth: 8 },
          { id: 'ic-drip-3', d: 'M 310,580 Q 370,650 430,590 Q 500,660 570,590 Q 630,650 690,580', strokeWidth: 6 },
          // Sprinkles on Scoops
          { id: 'ic-spr-1', d: 'M 440,240 L 460,255', strokeWidth: 5 },
          { id: 'ic-spr-2', d: 'M 540,230 L 560,245', strokeWidth: 5 },
          { id: 'ic-spr-3', d: 'M 400,380 L 420,395', strokeWidth: 5 },
          { id: 'ic-spr-4', d: 'M 580,370 L 600,390', strokeWidth: 5 },
          // Crispy Waffle Cone
          { id: 'ic-cone', d: 'M 320,620 L 680,620 L 500,960 Z', strokeWidth: 8 },
          // Waffle Crosshatch Pattern
          { id: 'ic-grid-1', d: 'M 360,620 L 540,900', strokeWidth: 5 },
          { id: 'ic-grid-2', d: 'M 420,620 L 520,940', strokeWidth: 5 },
          { id: 'ic-grid-3', d: 'M 480,620 L 500,960', strokeWidth: 5 },
          { id: 'ic-grid-4', d: 'M 640,620 L 460,900', strokeWidth: 5 },
          { id: 'ic-grid-5', d: 'M 580,620 L 480,940', strokeWidth: 5 }
        ]
      },
      {
        id: 'fest-summer-pool-sun',
        name: 'Cool Sun & Flamingo Floatie',
        category: 'festivals',
        difficulty: 'Detailed',
        isVip: true,
        viewBox: '0 0 1000 1000',
        paths: [
          // Sun Face Disc
          { id: 'sun-face', d: 'M 500,280 m -110,0 a 110,110 0 1,0 220,0 a 110,110 0 1,0 -220,0 Z', strokeWidth: 7 },
          // Cool Sunglasses
          { id: 'sun-glass-l', d: 'M 420,250 L 470,250 C 470,290 420,290 420,250 Z', strokeWidth: 6 },
          { id: 'sun-glass-r', d: 'M 530,250 L 580,250 C 580,290 530,290 530,250 Z', strokeWidth: 6 },
          { id: 'sun-bridge', d: 'M 470,260 L 530,260', strokeWidth: 6 },
          // Smile
          { id: 'sun-smile', d: 'M 460,320 Q 500,350 540,320', strokeWidth: 5 },
          // Sun Rays
          { id: 'sun-ray-1', d: 'M 500,140 L 500,90', strokeWidth: 6 },
          { id: 'sun-ray-2', d: 'M 600,180 L 640,140', strokeWidth: 6 },
          { id: 'sun-ray-3', d: 'M 640,280 L 690,280', strokeWidth: 6 },
          { id: 'sun-ray-4', d: 'M 360,280 L 310,280', strokeWidth: 6 },
          { id: 'sun-ray-5', d: 'M 400,180 L 360,140', strokeWidth: 6 },
          // Inflatable Flamingo Swimming Ring
          { id: 'flam-head', d: 'M 280,480 C 260,420 320,400 340,460 C 350,520 330,580 300,640 Z', strokeWidth: 6 },
          { id: 'flam-beak', d: 'M 260,450 L 220,470 L 250,490 Z', strokeWidth: 5 },
          // Inflatable Ring Body
          { id: 'flam-ring-out', d: 'M 500,560 C 680,560 780,640 780,740 C 780,840 680,900 500,900 C 320,900 220,840 220,740 C 220,640 320,560 500,560 Z', strokeWidth: 8 },
          { id: 'flam-ring-in', d: 'M 500,640 C 600,640 660,690 660,740 C 660,790 600,820 500,820 C 400,820 340,790 340,740 C 340,690 400,640 500,640 Z', strokeWidth: 6 },
          // Swimming Pool Water Ripples
          { id: 'pool-wave-1', d: 'M 120,780 Q 240,740 360,780 Q 480,820 600,780 Q 720,740 880,780', strokeWidth: 6 },
          { id: 'pool-wave-2', d: 'M 160,860 Q 300,830 440,860 Q 580,890 720,860 Q 820,830 920,860', strokeWidth: 5 }
        ]
      }
    ]
  }
];

/**
 * Returns all festival packs
 */
export function getAllFestivalPacks(): FestivalPack[] {
  return FESTIVAL_PACKS;
}

/**
 * Returns a specific festival pack by ID
 */
export function getFestivalPackById(id: FestivalId | string): FestivalPack | undefined {
  return FESTIVAL_PACKS.find(pack => pack.id === id);
}

/**
 * Returns all template objects across all festival packs
 */
export function getAllFestivalTemplates(): Template[] {
  return FESTIVAL_PACKS.flatMap(pack => pack.templates);
}

/**
 * Automatic Festival Detection Engine:
 * Evaluates the current date against year-specific festival dates and seasonal windows.
 * 
 * Behavior:
 * 1. Checks if current date falls within any festival's active celebration window.
 * 2. If active, returns that festival with `isLive: true` and remaining days.
 * 3. If no festival is strictly active today, finds the nearest upcoming festival,
 *    returning `isLive: false` with countdown days so kids & parents get excited early!
 */
export function getActiveFestivalStatus(today: Date = new Date()): ActiveFestivalStatus {
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1 to 12
  const currentDay = today.getDate();

  // Helper to convert date to day of year or timestamp
  const nowTs = new Date(currentYear, currentMonth - 1, currentDay).getTime();

  // 1. Check exact calendar windows for the current year
  for (const pack of FESTIVAL_PACKS) {
    const window = pack.calendarWindows.find(w => w.year === currentYear);
    if (window) {
      // Create start & end dates
      const start = new Date(window.year, window.startMonth - 1, window.startDay).getTime();
      const end = new Date(
        window.endMonth < window.startMonth ? window.year + 1 : window.year,
        window.endMonth - 1,
        window.endDay,
        23, 59, 59
      ).getTime();

      if (nowTs >= start && nowTs <= end) {
        const daysRemaining = Math.max(1, Math.ceil((end - nowTs) / (1000 * 60 * 60 * 24)));
        return {
          pack,
          isLive: true,
          daysRemainingOrUntil: daysRemaining,
          message: `🎉 Active Festival Season! ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} of celebration left!`
        };
      }
    }
  }

  // 2. Fallback check seasonal months (e.g. if outside exact window or future year)
  const seasonalMatch = FESTIVAL_PACKS.find(p => p.seasonalMonths.includes(currentMonth));
  if (seasonalMatch) {
    return {
      pack: seasonalMatch,
      isLive: true,
      daysRemainingOrUntil: 15,
      message: `🎉 ${seasonalMatch.name} season is here! Enjoy festive coloring pages!`
    };
  }

  // 3. If no festival is active today, find the nearest upcoming festival
  let closestPack = FESTIVAL_PACKS[0];
  let minDaysUntil = 999;

  for (const pack of FESTIVAL_PACKS) {
    const window = pack.calendarWindows.find(w => w.year === currentYear);
    if (window) {
      const start = new Date(window.year, window.startMonth - 1, window.startDay).getTime();
      if (start > nowTs) {
        const daysUntil = Math.ceil((start - nowTs) / (1000 * 60 * 60 * 24));
        if (daysUntil < minDaysUntil) {
          minDaysUntil = daysUntil;
          closestPack = pack;
        }
      }
    }
  }

  // If all windows for the current year have passed, take the first festival of next year
  if (minDaysUntil === 999) {
    closestPack = FESTIVAL_PACKS.find(p => p.id === 'christmas') || FESTIVAL_PACKS[0];
    minDaysUntil = 30;
  }

  return {
    pack: closestPack,
    isLive: false,
    daysRemainingOrUntil: minDaysUntil,
    message: `🌟 Upcoming Festival: ${closestPack.name}! Starts in ${minDaysUntil} day${minDaysUntil === 1 ? '' : 's'}!`
  };
}
