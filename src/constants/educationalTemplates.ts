/**
 * Educational & Thematic Templates for Coloro
 * Categories: Alphabets (A-Z), Numbers (1-10), Fruits, Vegetables, Animals, Objects
 */

import { Template } from '../types';

export const EDUCATIONAL_TEMPLATES: Template[] = [
  // ==========================================
  // 1. ALPHABETS (Full A to Z Learning Pages)
  // Free sample: A, B, C | VIP: D through Z
  // ==========================================
  {
    id: 'alpha-a-apple',
    name: 'Letter A - Apple',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-a-outer', d: 'M 220,150 L 320,550 L 250,550 L 225,440 L 135,440 L 110,550 L 40,550 L 140,150 Z', strokeWidth: 8 },
      { id: 'let-a-inner', d: 'M 180,260 L 150,380 L 210,380 Z', strokeWidth: 6 },
      { id: 'apple-body', d: 'M 650,280 C 580,280 540,320 500,320 C 460,320 420,280 350,280 C 260,280 200,380 200,520 C 200,720 380,900 500,900 C 620,900 800,720 800,520 C 800,380 740,280 650,280 Z', strokeWidth: 7 },
      { id: 'apple-stem', d: 'M 500,320 C 500,240 530,180 560,150 L 530,150 C 490,190 470,250 480,320 Z', strokeWidth: 6 },
      { id: 'apple-leaf', d: 'M 530,220 C 620,180 680,220 700,280 C 640,300 560,280 530,220 Z', strokeWidth: 6 },
      { id: 'apple-eye-l', d: 'M 400,500 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'apple-eye-r', d: 'M 600,500 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'apple-smile', d: 'M 450,560 Q 500,620 550,560', strokeWidth: 5 },
      { id: 'apple-cheek-l', d: 'M 360,540 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', strokeWidth: 3 },
      { id: 'apple-cheek-r', d: 'M 640,540 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', strokeWidth: 3 }
    ]
  },
  {
    id: 'alpha-b-butterfly',
    name: 'Letter B - Butterfly',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-b-outer', d: 'M 80,150 L 240,150 C 310,150 360,190 360,270 C 360,330 320,370 270,390 C 330,410 380,460 380,550 C 380,640 310,680 230,680 L 80,680 Z', strokeWidth: 8 },
      { id: 'let-b-top-hole', d: 'M 160,230 L 230,230 C 260,230 280,245 280,275 C 280,305 260,320 230,320 L 160,320 Z', strokeWidth: 6 },
      { id: 'let-b-bot-hole', d: 'M 160,400 L 240,400 C 275,400 300,420 300,460 C 300,500 275,520 240,520 L 160,520 Z', strokeWidth: 6 },
      { id: 'bf-head', d: 'M 650,220 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 6 },
      { id: 'bf-body', d: 'M 625,260 C 625,260 610,500 650,650 C 690,500 675,260 675,260 Z', strokeWidth: 6 },
      { id: 'bf-ant-l', d: 'M 630,195 Q 580,120 540,140', strokeWidth: 5 },
      { id: 'bf-ant-r', d: 'M 670,195 Q 720,120 760,140', strokeWidth: 5 },
      { id: 'bf-wing-tl', d: 'M 630,300 C 450,150 380,400 625,450 Z', strokeWidth: 6 },
      { id: 'bf-wing-tr', d: 'M 670,300 C 850,150 920,400 675,450 Z', strokeWidth: 6 },
      { id: 'bf-wing-bl', d: 'M 630,470 C 480,500 450,700 640,620 Z', strokeWidth: 6 },
      { id: 'bf-wing-br', d: 'M 670,470 C 820,500 850,700 660,620 Z', strokeWidth: 6 },
      { id: 'bf-dot-tl', d: 'M 520,300 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z', strokeWidth: 4 },
      { id: 'bf-dot-tr', d: 'M 780,300 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-c-cat',
    name: 'Letter C - Cat',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-c', d: 'M 350,220 C 220,220 120,330 120,480 C 120,630 220,740 350,740 C 400,740 440,720 470,690 L 410,610 C 390,630 365,640 340,640 C 260,640 210,570 210,480 C 210,390 260,320 340,320 C 370,320 395,335 415,355 L 475,275 C 440,240 395,220 350,220 Z', strokeWidth: 8 },
      { id: 'cat-head', d: 'M 700,420 m -160,0 a 160,160 0 1,0 320,0 a 160,160 0 1,0 -320,0 Z', strokeWidth: 7 },
      { id: 'cat-ear-l', d: 'M 570,320 L 530,160 L 670,270 Z', strokeWidth: 6 },
      { id: 'cat-ear-r', d: 'M 830,320 L 870,160 L 730,270 Z', strokeWidth: 6 },
      { id: 'cat-eye-l', d: 'M 630,400 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', strokeWidth: 4 },
      { id: 'cat-eye-r', d: 'M 770,400 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', strokeWidth: 4 },
      { id: 'cat-nose', d: 'M 685,440 L 715,440 L 700,460 Z', strokeWidth: 5 },
      { id: 'cat-mouth', d: 'M 670,480 Q 700,510 700,460 Q 700,510 730,480', strokeWidth: 5 },
      { id: 'cat-whisk-l1', d: 'M 620,440 L 520,420', strokeWidth: 4 },
      { id: 'cat-whisk-l2', d: 'M 620,460 L 510,470', strokeWidth: 4 },
      { id: 'cat-whisk-r1', d: 'M 780,440 L 880,420', strokeWidth: 4 },
      { id: 'cat-whisk-r2', d: 'M 780,460 L 890,470', strokeWidth: 4 },
      { id: 'cat-body', d: 'M 580,540 C 540,650 540,820 620,880 L 780,880 C 860,820 860,650 820,540 Z', strokeWidth: 6 }
    ]
  },
  {
    id: 'alpha-d-dinosaur',
    name: 'Letter D - Dinosaur',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-d-spine', d: 'M 80,180 L 220,180 C 340,180 400,260 400,460 C 400,660 340,740 220,740 L 80,740 Z', strokeWidth: 8 },
      { id: 'let-d-inner', d: 'M 160,260 L 220,260 C 290,260 320,320 320,460 C 320,600 290,660 220,660 L 160,660 Z', strokeWidth: 6 },
      { id: 'dino-body', d: 'M 560,780 C 500,600 540,380 680,280 C 760,220 860,240 880,320 C 890,380 840,420 780,420 C 720,420 660,540 680,780 Z', strokeWidth: 7 },
      { id: 'dino-tail', d: 'M 560,740 C 460,720 420,820 380,860 C 440,880 520,860 580,820 Z', strokeWidth: 6 },
      { id: 'dino-eye', d: 'M 800,300 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'dino-smile', d: 'M 820,350 Q 860,370 880,340', strokeWidth: 4 },
      { id: 'dino-spikes', d: 'M 640,300 L 610,250 L 660,280 L 640,220 L 690,260', strokeWidth: 5 }
    ]
  },
  {
    id: 'alpha-e-elephant',
    name: 'Letter E - Elephant',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-e', d: 'M 100,180 L 360,180 L 360,260 L 180,260 L 180,420 L 320,420 L 320,500 L 180,500 L 180,660 L 360,660 L 360,740 L 100,740 Z', strokeWidth: 8 },
      { id: 'ele-head', d: 'M 650,450 m -140,0 a 140,140 0 1,0 280,0 a 140,140 0 1,0 -280,0 Z', strokeWidth: 7 },
      { id: 'ele-ear', d: 'M 550,380 C 440,350 440,560 550,540 Z', strokeWidth: 6 },
      { id: 'ele-trunk', d: 'M 750,480 C 820,480 880,540 850,650 C 830,720 780,720 770,660 C 760,600 720,550 710,540 Z', strokeWidth: 6 },
      { id: 'ele-eye', d: 'M 670,420 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-f-fish',
    name: 'Letter F - Fish',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-f', d: 'M 100,180 L 360,180 L 360,260 L 180,260 L 180,430 L 320,430 L 320,510 L 180,510 L 180,740 L 100,740 Z', strokeWidth: 8 },
      { id: 'fish-body', d: 'M 500,460 C 600,320 850,360 880,460 C 850,560 600,600 500,460 Z', strokeWidth: 7 },
      { id: 'fish-tail', d: 'M 520,460 L 420,350 L 440,460 L 420,570 Z', strokeWidth: 6 },
      { id: 'fish-eye', d: 'M 800,430 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'fish-smile', d: 'M 850,470 Q 820,500 790,480', strokeWidth: 4 },
      { id: 'fish-fin', d: 'M 660,370 C 680,310 740,320 730,380 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'alpha-g-giraffe',
    name: 'Letter G - Giraffe',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-g', d: 'M 360,260 C 220,220 100,340 100,480 C 100,640 220,740 360,740 C 440,740 480,680 480,540 L 280,540 L 280,460 L 560,460 L 560,600 C 540,740 440,820 340,820 C 160,820 20,680 20,480 C 20,280 160,140 360,180 Z', strokeWidth: 8 },
      { id: 'gir-head', d: 'M 720,280 C 680,200 820,200 800,280 C 820,340 760,380 700,340 Z', strokeWidth: 6 },
      { id: 'gir-neck', d: 'M 720,340 L 700,820 L 800,820 L 780,340 Z', strokeWidth: 6 },
      { id: 'gir-horn', d: 'M 730,220 L 730,160 M 770,220 L 770,160', strokeWidth: 5 },
      { id: 'gir-spot-1', d: 'M 730,460 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', strokeWidth: 4 },
      { id: 'gir-spot-2', d: 'M 750,620 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-h-house',
    name: 'Letter H - House',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-h', d: 'M 100,180 L 180,180 L 180,420 L 320,420 L 320,180 L 400,180 L 400,740 L 320,740 L 320,500 L 180,500 L 180,740 L 100,740 Z', strokeWidth: 8 },
      { id: 'house-roof', d: 'M 520,450 L 730,240 L 940,450 Z', strokeWidth: 7 },
      { id: 'house-wall', d: 'M 560,450 L 560,780 L 900,780 L 900,450 Z', strokeWidth: 7 },
      { id: 'house-door', d: 'M 680,780 L 680,620 L 780,620 L 780,780 Z', strokeWidth: 5 },
      { id: 'house-window', d: 'M 600,520 L 660,520 L 660,580 L 600,580 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-i-icecream',
    name: 'Letter I - Ice Cream',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-i', d: 'M 120,180 L 340,180 L 340,260 L 260,260 L 260,660 L 340,660 L 340,740 L 120,740 L 120,660 L 200,660 L 200,260 L 120,260 Z', strokeWidth: 8 },
      { id: 'cone', d: 'M 560,520 L 800,520 L 680,880 Z', strokeWidth: 7 },
      { id: 'scoop-1', d: 'M 540,520 C 520,380 840,380 820,520 Z', strokeWidth: 6 },
      { id: 'scoop-top', d: 'M 580,400 C 600,280 760,280 780,400 Z', strokeWidth: 6 },
      { id: 'cherry', d: 'M 680,260 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'alpha-j-jellyfish',
    name: 'Letter J - Jellyfish',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-j', d: 'M 260,180 L 420,180 L 420,600 C 420,700 360,760 240,760 C 140,760 80,700 80,600 L 160,600 C 160,660 190,690 250,690 C 310,690 340,660 340,580 L 340,260 L 260,260 Z', strokeWidth: 8 },
      { id: 'jelly-bell', d: 'M 550,420 C 550,220 900,220 900,420 C 850,450 600,450 550,420 Z', strokeWidth: 7 },
      { id: 'jelly-eye-l', d: 'M 660,360 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
      { id: 'jelly-eye-r', d: 'M 790,360 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
      { id: 'tentacle-1', d: 'M 600,440 Q 580,580 620,720', strokeWidth: 5 },
      { id: 'tentacle-2', d: 'M 680,440 Q 720,600 680,750', strokeWidth: 5 },
      { id: 'tentacle-3', d: 'M 760,440 Q 740,600 780,750', strokeWidth: 5 },
      { id: 'tentacle-4', d: 'M 850,440 Q 890,580 850,720', strokeWidth: 5 }
    ]
  },
  {
    id: 'alpha-k-kite',
    name: 'Letter K - Kite',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-k', d: 'M 100,180 L 180,180 L 180,420 L 320,180 L 420,180 L 240,460 L 440,740 L 330,740 L 180,510 L 180,740 L 100,740 Z', strokeWidth: 8 },
      { id: 'kite-body', d: 'M 700,200 L 880,400 L 700,640 L 520,400 Z', strokeWidth: 7 },
      { id: 'kite-lines', d: 'M 700,200 L 700,640 M 520,400 L 880,400', strokeWidth: 5 },
      { id: 'kite-tail', d: 'M 700,640 Q 780,750 720,860', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-l-lion',
    name: 'Letter L - Lion',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-l', d: 'M 100,180 L 190,180 L 190,660 L 400,660 L 400,740 L 100,740 Z', strokeWidth: 8 },
      { id: 'lion-mane', d: 'M 720,460 m -180,0 a 180,180 0 1,0 360,0 a 180,180 0 1,0 -360,0 Z', strokeWidth: 7 },
      { id: 'lion-face', d: 'M 720,460 m -110,0 a 110,110 0 1,0 220,0 a 110,110 0 1,0 -220,0 Z', strokeWidth: 6 },
      { id: 'lion-nose', d: 'M 700,480 L 740,480 L 720,510 Z', strokeWidth: 5 },
      { id: 'lion-eye-l', d: 'M 670,430 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
      { id: 'lion-eye-r', d: 'M 770,430 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-m-moon',
    name: 'Letter M - Moon',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-m', d: 'M 80,180 L 180,180 L 260,520 L 340,180 L 440,180 L 440,740 L 360,740 L 360,340 L 280,680 L 240,680 L 160,340 L 160,740 L 80,740 Z', strokeWidth: 8 },
      { id: 'crescent-moon', d: 'M 760,200 C 620,240 540,420 580,580 C 620,720 760,820 900,780 C 720,800 640,540 760,200 Z', strokeWidth: 7 },
      { id: 'moon-eye', d: 'M 680,440 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'moon-smile', d: 'M 670,520 Q 720,560 750,520', strokeWidth: 4 },
      { id: 'star-mini', d: 'M 860,320 L 880,360 L 920,360 L 890,390 L 900,430 L 860,400 L 820,430 L 830,390 L 800,360 L 840,360 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-n-nest',
    name: 'Letter N - Nest',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-n', d: 'M 100,180 L 190,180 L 330,560 L 330,180 L 410,180 L 410,740 L 320,740 L 180,360 L 180,740 L 100,740 Z', strokeWidth: 8 },
      { id: 'nest-bowl', d: 'M 540,540 C 560,760 900,760 920,540 C 820,580 640,580 540,540 Z', strokeWidth: 7 },
      { id: 'egg-1', d: 'M 640,540 C 640,440 720,440 720,540 Z', strokeWidth: 5 },
      { id: 'egg-2', d: 'M 740,540 C 740,440 820,440 820,540 Z', strokeWidth: 5 },
      { id: 'nest-twigs', d: 'M 520,600 L 940,600 M 550,660 L 910,660', strokeWidth: 5 }
    ]
  },
  {
    id: 'alpha-o-octopus',
    name: 'Letter O - Octopus',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-o-outer', d: 'M 250,180 C 130,180 50,290 50,460 C 50,630 130,740 250,740 C 370,740 450,630 450,460 C 450,290 370,180 250,180 Z', strokeWidth: 8 },
      { id: 'let-o-inner', d: 'M 250,260 C 190,260 140,340 140,460 C 140,580 190,660 250,660 C 310,660 360,580 360,460 C 360,340 310,260 250,260 Z', strokeWidth: 6 },
      { id: 'octo-head', d: 'M 720,380 m -130,0 a 130,130 0 1,0 260,0 a 130,130 0 1,0 -260,0 Z', strokeWidth: 7 },
      { id: 'octo-eye-l', d: 'M 660,360 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'octo-eye-r', d: 'M 780,360 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'octo-leg-1', d: 'M 610,480 Q 560,650 630,780', strokeWidth: 6 },
      { id: 'octo-leg-2', d: 'M 670,490 Q 660,670 710,790', strokeWidth: 6 },
      { id: 'octo-leg-3', d: 'M 770,490 Q 780,670 750,790', strokeWidth: 6 },
      { id: 'octo-leg-4', d: 'M 830,480 Q 880,650 810,780', strokeWidth: 6 }
    ]
  },
  {
    id: 'alpha-p-penguin',
    name: 'Letter P - Penguin',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-p-outer', d: 'M 100,180 L 300,180 C 400,180 440,240 440,360 C 440,480 380,530 280,530 L 180,530 L 180,740 L 100,740 Z', strokeWidth: 8 },
      { id: 'let-p-inner', d: 'M 180,260 L 290,260 C 330,260 360,280 360,360 C 360,430 330,450 290,450 L 180,450 Z', strokeWidth: 6 },
      { id: 'peng-body', d: 'M 700,480 C 600,480 580,780 700,800 C 820,780 800,480 700,480 Z', strokeWidth: 7 },
      { id: 'peng-belly', d: 'M 700,530 C 640,530 630,750 700,760 C 770,750 760,530 700,530 Z', strokeWidth: 5 },
      { id: 'peng-beak', d: 'M 670,440 L 730,440 L 700,470 Z', strokeWidth: 5 },
      { id: 'peng-eye-l', d: 'M 670,410 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z', strokeWidth: 4 },
      { id: 'peng-eye-r', d: 'M 730,410 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-q-queen',
    name: 'Letter Q - Queen Crown',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-q-outer', d: 'M 250,180 C 130,180 50,290 50,460 C 50,630 130,740 250,740 C 310,740 370,710 400,660 L 450,740 L 510,700 L 440,600 C 460,550 470,500 470,460 C 470,290 370,180 250,180 Z', strokeWidth: 8 },
      { id: 'let-q-inner', d: 'M 250,260 C 190,260 140,340 140,460 C 140,580 190,660 250,660 C 310,660 360,580 360,460 C 360,340 310,260 250,260 Z', strokeWidth: 6 },
      { id: 'crown-base', d: 'M 560,620 L 920,620 L 900,400 L 810,490 L 740,340 L 670,490 L 580,400 Z', strokeWidth: 7 },
      { id: 'crown-jewel-1', d: 'M 580,380 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', strokeWidth: 4 },
      { id: 'crown-jewel-2', d: 'M 740,320 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', strokeWidth: 4 },
      { id: 'crown-jewel-3', d: 'M 900,380 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-r-rainbow',
    name: 'Letter R - Rainbow',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-r', d: 'M 100,180 L 300,180 C 400,180 440,240 440,360 C 440,460 380,510 300,520 L 440,740 L 330,740 L 220,530 L 180,530 L 180,740 L 100,740 Z', strokeWidth: 8 },
      { id: 'let-r-inner', d: 'M 180,260 L 280,260 C 330,260 360,290 360,360 C 360,430 330,450 280,450 L 180,450 Z', strokeWidth: 6 },
      { id: 'rb-arc-1', d: 'M 520,720 C 520,380 940,380 940,720', strokeWidth: 8 },
      { id: 'rb-arc-2', d: 'M 570,720 C 570,440 890,440 890,720', strokeWidth: 8 },
      { id: 'rb-arc-3', d: 'M 620,720 C 620,500 840,500 840,720', strokeWidth: 8 },
      { id: 'rb-cloud', d: 'M 520,720 C 480,720 460,650 510,630 C 520,580 600,580 610,640 C 650,650 650,720 600,720 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'alpha-s-star',
    name: 'Letter S - Star',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-s', d: 'M 380,260 C 350,220 280,180 200,180 C 90,180 40,260 40,350 C 40,470 160,500 240,530 C 320,560 360,610 360,670 C 360,760 280,800 190,800 C 100,800 30,730 10,660 L 90,620 C 110,660 150,720 210,720 C 270,720 290,670 290,630 C 290,560 230,520 140,480 C 70,450 10,400 10,300 C 10,210 90,140 210,140 C 290,140 350,180 390,230 Z', strokeWidth: 8 },
      { id: 'star-body', d: 'M 720,240 L 760,370 L 890,370 L 780,460 L 820,590 L 720,500 L 620,590 L 660,460 L 550,370 L 680,370 Z', strokeWidth: 7 },
      { id: 'star-eye-l', d: 'M 690,420 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z', strokeWidth: 4 },
      { id: 'star-eye-r', d: 'M 750,420 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z', strokeWidth: 4 },
      { id: 'star-smile', d: 'M 700,460 Q 720,480 740,460', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-t-tree',
    name: 'Letter T - Tree',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-t', d: 'M 60,180 L 400,180 L 400,260 L 270,260 L 270,740 L 190,740 L 190,260 L 60,260 Z', strokeWidth: 8 },
      { id: 'tree-trunk', d: 'M 690,540 L 680,820 L 760,820 L 750,540 Z', strokeWidth: 7 },
      { id: 'tree-crown', d: 'M 720,220 C 580,220 540,400 580,540 C 640,600 800,600 860,540 C 900,400 860,220 720,220 Z', strokeWidth: 7 },
      { id: 'tree-apple-1', d: 'M 650,340 m -16,0 a 16,16 0 1,0 32,0 a 16,16 0 1,0 -32,0 Z', strokeWidth: 4 },
      { id: 'tree-apple-2', d: 'M 780,380 m -16,0 a 16,16 0 1,0 32,0 a 16,16 0 1,0 -32,0 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-u-umbrella',
    name: 'Letter U - Umbrella',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-u', d: 'M 100,180 L 180,180 L 180,560 C 180,660 230,700 290,700 C 350,700 400,660 400,560 L 400,180 L 480,180 L 480,560 C 480,720 380,780 290,780 C 200,780 100,720 100,560 Z', strokeWidth: 8 },
      { id: 'umb-canopy', d: 'M 540,500 C 540,300 920,300 920,500 C 860,470 780,470 730,500 C 680,470 600,470 540,500 Z', strokeWidth: 7 },
      { id: 'umb-stick', d: 'M 730,300 L 730,720 C 730,780 670,780 670,720', strokeWidth: 6 },
      { id: 'rain-1', d: 'M 580,620 L 560,670', strokeWidth: 5 },
      { id: 'rain-2', d: 'M 880,620 L 860,670', strokeWidth: 5 }
    ]
  },
  {
    id: 'alpha-v-volcano',
    name: 'Letter V - Volcano',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-v', d: 'M 60,180 L 160,180 L 260,600 L 360,180 L 460,180 L 310,740 L 210,740 Z', strokeWidth: 8 },
      { id: 'volc-mountain', d: 'M 520,780 L 660,380 L 800,380 L 940,780 Z', strokeWidth: 7 },
      { id: 'volc-crater', d: 'M 660,380 Q 730,420 800,380', strokeWidth: 6 },
      { id: 'volc-lava-1', d: 'M 700,380 Q 660,200 620,240', strokeWidth: 6 },
      { id: 'volc-lava-2', d: 'M 750,380 Q 780,180 840,220', strokeWidth: 6 }
    ]
  },
  {
    id: 'alpha-w-whale',
    name: 'Letter W - Whale',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-w', d: 'M 40,180 L 120,180 L 190,560 L 260,180 L 340,180 L 410,560 L 480,180 L 560,180 L 460,740 L 360,740 L 300,380 L 240,740 L 140,740 Z', strokeWidth: 8 },
      { id: 'whale-body', d: 'M 600,600 C 600,420 860,420 940,540 C 940,680 720,740 600,600 Z', strokeWidth: 7 },
      { id: 'whale-tail', d: 'M 600,600 L 540,540 L 560,640 L 520,680 Z', strokeWidth: 6 },
      { id: 'whale-eye', d: 'M 880,520 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
      { id: 'whale-spout', d: 'M 780,430 Q 760,320 740,300 M 790,430 Q 820,320 840,300', strokeWidth: 5 }
    ]
  },
  {
    id: 'alpha-x-xylophone',
    name: 'Letter X - Xylophone',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-x', d: 'M 80,180 L 180,180 L 270,440 L 360,180 L 460,180 L 320,470 L 470,740 L 370,740 L 270,490 L 170,740 L 70,740 L 220,470 Z', strokeWidth: 8 },
      { id: 'xylo-bar-1', d: 'M 540,300 L 920,300 L 920,380 L 540,380 Z', strokeWidth: 6 },
      { id: 'xylo-bar-2', d: 'M 570,420 L 890,420 L 890,500 L 570,500 Z', strokeWidth: 6 },
      { id: 'xylo-bar-3', d: 'M 600,540 L 860,540 L 860,620 L 600,620 Z', strokeWidth: 6 },
      { id: 'xylo-bar-4', d: 'M 630,660 L 830,660 L 830,740 L 630,740 Z', strokeWidth: 6 }
    ]
  },
  {
    id: 'alpha-y-yacht',
    name: 'Letter Y - Yacht',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-y', d: 'M 80,180 L 180,180 L 270,400 L 360,180 L 460,180 L 320,480 L 320,740 L 220,740 L 220,480 Z', strokeWidth: 8 },
      { id: 'yacht-hull', d: 'M 540,640 L 920,640 L 860,760 L 600,760 Z', strokeWidth: 7 },
      { id: 'yacht-mast', d: 'M 720,260 L 720,640', strokeWidth: 6 },
      { id: 'yacht-sail-l', d: 'M 710,280 L 710,610 L 560,610 Z', strokeWidth: 6 },
      { id: 'yacht-sail-r', d: 'M 730,340 L 730,610 L 880,610 Z', strokeWidth: 6 }
    ]
  },
  {
    id: 'alpha-z-zebra',
    name: 'Letter Z - Zebra',
    category: 'alphabet',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'let-z', d: 'M 80,180 L 420,180 L 420,260 L 180,660 L 420,660 L 420,740 L 80,740 L 80,660 L 320,260 L 80,260 Z', strokeWidth: 8 },
      { id: 'zeb-head', d: 'M 620,460 C 620,320 860,320 860,460 C 860,600 620,600 620,460 Z', strokeWidth: 7 },
      { id: 'zeb-ear-l', d: 'M 660,340 L 640,240 L 700,310 Z', strokeWidth: 5 },
      { id: 'zeb-ear-r', d: 'M 820,340 L 840,240 L 780,310 Z', strokeWidth: 5 },
      { id: 'zeb-eye-l', d: 'M 690,430 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
      { id: 'zeb-eye-r', d: 'M 790,430 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
      { id: 'zeb-stripe-1', d: 'M 640,460 L 700,460 M 780,460 L 840,460', strokeWidth: 6 },
      { id: 'zeb-stripe-2', d: 'M 660,520 L 710,520 M 770,520 L 820,520', strokeWidth: 6 }
    ]
  },

  // ==========================================
  // 2. NUMBERS (Full 1 to 10 Counting Pages)
  // Free sample: 1, 2, 3 | VIP: 4 through 10
  // ==========================================
  {
    id: 'num-1-sun',
    name: 'Number 1 - One Sun',
    category: 'numbers',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'num-1', d: 'M 220,300 L 290,200 L 370,200 L 370,820 L 260,820 L 260,880 L 480,880 L 480,820 L 370,820 L 370,200 L 190,320 Z', strokeWidth: 8 },
      { id: 'sun-center', d: 'M 700,450 m -140,0 a 140,140 0 1,0 280,0 a 140,140 0 1,0 -280,0 Z', strokeWidth: 7 },
      { id: 'ray-1', d: 'M 700,240 L 700,160', strokeWidth: 7 },
      { id: 'ray-2', d: 'M 700,660 L 700,740', strokeWidth: 7 },
      { id: 'ray-3', d: 'M 490,450 L 410,450', strokeWidth: 7 },
      { id: 'ray-4', d: 'M 910,450 L 990,450', strokeWidth: 7 },
      { id: 'ray-5', d: 'M 550,300 L 490,240', strokeWidth: 7 },
      { id: 'ray-6', d: 'M 850,300 L 910,240', strokeWidth: 7 },
      { id: 'ray-7', d: 'M 550,600 L 490,660', strokeWidth: 7 },
      { id: 'ray-8', d: 'M 850,600 L 910,660', strokeWidth: 7 },
      { id: 'sun-eye-l', d: 'M 650,420 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'sun-eye-r', d: 'M 750,420 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'sun-smile', d: 'M 650,480 Q 700,540 750,480', strokeWidth: 5 }
    ]
  },
  {
    id: 'num-2-ducks',
    name: 'Number 2 - Two Ducks',
    category: 'numbers',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'num-2', d: 'M 80,300 C 80,180 200,120 320,120 C 440,120 520,200 520,300 C 520,400 440,480 320,600 L 160,760 L 520,760 L 520,860 L 60,860 L 60,760 L 260,540 C 360,440 400,380 400,300 C 400,240 360,200 300,200 C 240,200 180,240 180,300 Z', strokeWidth: 8 },
      { id: 'duck1-head', d: 'M 720,250 m -45,0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0 Z', strokeWidth: 5 },
      { id: 'duck1-beak', d: 'M 675,250 L 610,260 L 675,275 Z', strokeWidth: 5 },
      { id: 'duck1-eye', d: 'M 700,240 m -6,0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0 Z', strokeWidth: 3 },
      { id: 'duck1-body', d: 'M 720,295 C 640,320 600,420 700,470 C 820,470 880,380 820,340 C 800,320 760,295 720,295 Z', strokeWidth: 6 },
      { id: 'duck1-wing', d: 'M 730,370 C 680,380 670,430 750,440 C 780,440 800,410 780,380 Z', strokeWidth: 4 },
      { id: 'duck2-head', d: 'M 720,650 m -45,0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0 Z', strokeWidth: 5 },
      { id: 'duck2-beak', d: 'M 675,650 L 610,660 L 675,675 Z', strokeWidth: 5 },
      { id: 'duck2-eye', d: 'M 700,640 m -6,0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0 Z', strokeWidth: 3 },
      { id: 'duck2-body', d: 'M 720,695 C 640,720 600,820 700,870 C 820,870 880,780 820,740 C 800,720 760,695 720,695 Z', strokeWidth: 6 },
      { id: 'duck2-wing', d: 'M 730,770 C 680,780 670,830 750,840 C 780,840 800,810 780,780 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'num-3-balloons',
    name: 'Number 3 - Three Balloons',
    category: 'numbers',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'num-3', d: 'M 100,160 L 420,160 L 260,380 C 360,380 460,450 460,600 C 460,760 330,860 160,860 C 80,860 20,820 0,770 L 60,680 C 80,720 120,750 170,750 C 260,750 330,680 330,600 C 330,500 240,450 140,450 L 140,360 L 280,180 L 100,180 Z', strokeWidth: 8 },
      { id: 'b1-body', d: 'M 600,220 C 530,220 500,320 500,400 C 500,480 570,520 600,540 C 630,520 700,480 700,400 C 700,320 670,220 600,220 Z', strokeWidth: 6 },
      { id: 'b1-string', d: 'M 600,560 Q 640,680 680,800', strokeWidth: 4 },
      { id: 'b2-body', d: 'M 800,120 C 730,120 700,220 700,300 C 700,380 770,420 800,440 C 830,420 900,380 900,300 C 900,220 870,120 800,120 Z', strokeWidth: 6 },
      { id: 'b2-string', d: 'M 800,460 Q 740,630 690,800', strokeWidth: 4 },
      { id: 'b3-body', d: 'M 750,420 C 680,420 650,520 650,600 C 650,680 720,720 750,740 C 780,720 850,680 850,600 C 850,520 820,420 750,420 Z', strokeWidth: 6 },
      { id: 'b3-string', d: 'M 750,760 Q 720,830 700,900', strokeWidth: 4 }
    ]
  },
  {
    id: 'num-4-stars',
    name: 'Number 4 - Four Stars',
    category: 'numbers',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'num-4', d: 'M 320,160 L 80,560 L 80,620 L 320,620 L 320,840 L 400,840 L 400,620 L 480,620 L 480,540 L 400,540 L 400,160 Z M 320,280 L 320,540 L 160,540 Z', strokeWidth: 8 },
      { id: 'star-1', d: 'M 650,180 L 670,230 L 720,230 L 680,260 L 700,310 L 650,280 L 600,310 L 620,260 L 580,230 L 630,230 Z', strokeWidth: 5 },
      { id: 'star-2', d: 'M 850,280 L 870,330 L 920,330 L 880,360 L 900,410 L 850,380 L 800,410 L 820,360 L 780,330 L 830,330 Z', strokeWidth: 5 },
      { id: 'star-3', d: 'M 620,480 L 640,530 L 690,530 L 650,560 L 670,610 L 620,580 L 570,610 L 590,560 L 550,530 L 600,530 Z', strokeWidth: 5 },
      { id: 'star-4', d: 'M 820,580 L 840,630 L 890,630 L 850,660 L 870,710 L 820,680 L 770,710 L 790,660 L 750,630 L 800,630 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'num-5-apples',
    name: 'Number 5 - Five Apples',
    category: 'numbers',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'num-5', d: 'M 140,160 L 420,160 L 420,240 L 220,240 L 180,440 C 220,400 300,380 360,400 C 440,430 480,510 480,620 C 480,740 380,840 240,840 C 140,840 60,780 40,690 L 120,640 C 140,680 180,750 240,750 C 320,750 380,690 380,620 C 380,540 320,480 240,480 C 180,480 140,510 110,540 Z', strokeWidth: 8 },
      { id: 'ap-1', d: 'M 640,240 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', strokeWidth: 5 },
      { id: 'ap-2', d: 'M 820,280 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', strokeWidth: 5 },
      { id: 'ap-3', d: 'M 600,440 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', strokeWidth: 5 },
      { id: 'ap-4', d: 'M 780,480 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', strokeWidth: 5 },
      { id: 'ap-5', d: 'M 690,680 m -55,0 a 55,55 0 1,0 110,0 a 55,55 0 1,0 -110,0 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'num-6-flowers',
    name: 'Number 6 - Six Flowers',
    category: 'numbers',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'num-6', d: 'M 360,180 C 220,240 100,380 80,560 C 120,480 200,440 280,440 C 400,440 480,520 480,640 C 480,760 380,840 260,840 C 120,840 20,720 20,520 C 20,320 160,140 360,140 Z M 260,530 C 180,530 140,580 140,640 C 140,710 180,760 260,760 C 320,760 370,710 370,640 C 370,570 320,530 260,530 Z', strokeWidth: 8 },
      { id: 'fl-1', d: 'M 620,220 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', strokeWidth: 5 },
      { id: 'fl-2', d: 'M 820,220 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', strokeWidth: 5 },
      { id: 'fl-3', d: 'M 620,440 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', strokeWidth: 5 },
      { id: 'fl-4', d: 'M 820,440 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', strokeWidth: 5 },
      { id: 'fl-5', d: 'M 620,660 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', strokeWidth: 5 },
      { id: 'fl-6', d: 'M 820,660 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'num-7-candies',
    name: 'Number 7 - Seven Candies',
    category: 'numbers',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'num-7', d: 'M 60,160 L 460,160 L 460,240 L 220,840 L 120,840 L 350,250 L 60,250 Z', strokeWidth: 8 },
      { id: 'cd-1', d: 'M 600,200 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 5 },
      { id: 'cd-2', d: 'M 760,200 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 5 },
      { id: 'cd-3', d: 'M 900,240 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 5 },
      { id: 'cd-4', d: 'M 640,420 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 5 },
      { id: 'cd-5', d: 'M 820,420 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 5 },
      { id: 'cd-6', d: 'M 680,640 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 5 },
      { id: 'cd-7', d: 'M 840,640 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'num-8-cherries',
    name: 'Number 8 - Eight Cherries',
    category: 'numbers',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'num-8', d: 'M 260,140 C 360,140 430,210 430,320 C 430,400 380,460 310,490 C 400,530 460,600 460,700 C 460,820 370,880 260,880 C 150,880 60,820 60,700 C 60,600 120,530 210,490 C 140,460 90,400 90,320 C 90,210 160,140 260,140 Z M 260,230 C 200,230 170,270 170,320 C 170,380 210,420 260,420 C 310,420 350,380 350,320 C 350,270 320,230 260,230 Z M 260,540 C 190,540 150,600 150,690 C 150,770 200,810 260,810 C 320,810 370,770 370,690 C 370,600 330,540 260,540 Z', strokeWidth: 8 },
      { id: 'ch-1', d: 'M 580,220 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 4 },
      { id: 'ch-2', d: 'M 680,240 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 4 },
      { id: 'ch-3', d: 'M 800,220 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 4 },
      { id: 'ch-4', d: 'M 900,240 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 4 },
      { id: 'ch-5', d: 'M 580,520 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 4 },
      { id: 'ch-6', d: 'M 680,540 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 4 },
      { id: 'ch-7', d: 'M 800,520 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 4 },
      { id: 'ch-8', d: 'M 900,540 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'num-9-leaves',
    name: 'Number 9 - Nine Leaves',
    category: 'numbers',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'num-9', d: 'M 160,820 C 300,760 420,620 440,440 C 400,520 320,560 240,560 C 120,560 40,480 40,360 C 40,240 140,160 260,160 C 400,160 500,280 500,480 C 500,680 360,860 160,860 Z M 260,240 C 190,240 140,290 140,360 C 140,430 190,480 260,480 C 330,480 370,430 370,360 C 370,290 330,240 260,240 Z', strokeWidth: 8 },
      { id: 'lf-1', d: 'M 620,180 C 660,150 720,170 700,230 C 660,230 620,200 620,180 Z', strokeWidth: 4 },
      { id: 'lf-2', d: 'M 780,180 C 820,150 880,170 860,230 C 820,230 780,200 780,180 Z', strokeWidth: 4 },
      { id: 'lf-3', d: 'M 920,240 C 950,210 990,240 980,290 C 940,290 910,260 920,240 Z', strokeWidth: 4 },
      { id: 'lf-4', d: 'M 600,380 C 640,350 700,370 680,430 C 640,430 600,400 600,380 Z', strokeWidth: 4 },
      { id: 'lf-5', d: 'M 760,380 C 800,350 860,370 840,430 C 800,430 760,400 760,380 Z', strokeWidth: 4 },
      { id: 'lf-6', d: 'M 900,420 C 930,390 980,410 970,470 C 930,470 900,440 900,420 Z', strokeWidth: 4 },
      { id: 'lf-7', d: 'M 620,580 C 660,550 720,570 700,630 C 660,630 620,600 620,580 Z', strokeWidth: 4 },
      { id: 'lf-8', d: 'M 780,580 C 820,550 880,570 860,630 C 820,630 780,600 780,580 Z', strokeWidth: 4 },
      { id: 'lf-9', d: 'M 700,740 C 740,710 800,730 780,790 C 740,790 700,760 700,740 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'num-10-drops',
    name: 'Number 10 - Ten Rainbow Drops',
    category: 'numbers',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'num-10-1', d: 'M 100,280 L 160,200 L 220,200 L 220,800 L 120,800 L 120,860 L 320,860 L 320,800 L 220,800 L 220,200 L 80,300 Z', strokeWidth: 8 },
      { id: 'num-10-0-out', d: 'M 400,200 C 320,200 270,300 270,520 C 270,740 320,860 400,860 C 480,860 530,740 530,520 C 530,300 480,200 400,200 Z', strokeWidth: 8 },
      { id: 'num-10-0-in', d: 'M 400,290 C 370,290 350,370 350,520 C 350,670 370,770 400,770 C 430,770 450,670 450,520 C 450,370 430,290 400,290 Z', strokeWidth: 6 },
      { id: 'dr-1', d: 'M 650,200 C 620,250 620,280 650,280 C 680,280 680,250 650,200 Z', strokeWidth: 4 },
      { id: 'dr-2', d: 'M 770,200 C 740,250 740,280 770,280 C 800,280 800,250 770,200 Z', strokeWidth: 4 },
      { id: 'dr-3', d: 'M 890,200 C 860,250 860,280 890,280 C 920,280 920,250 890,200 Z', strokeWidth: 4 },
      { id: 'dr-4', d: 'M 650,380 C 620,430 620,460 650,460 C 680,460 680,430 650,380 Z', strokeWidth: 4 },
      { id: 'dr-5', d: 'M 770,380 C 740,430 740,460 770,460 C 800,460 800,430 770,380 Z', strokeWidth: 4 },
      { id: 'dr-6', d: 'M 890,380 C 860,430 860,460 890,460 C 920,460 920,430 890,380 Z', strokeWidth: 4 },
      { id: 'dr-7', d: 'M 650,560 C 620,610 620,640 650,640 C 680,640 680,610 650,560 Z', strokeWidth: 4 },
      { id: 'dr-8', d: 'M 770,560 C 740,610 740,640 770,640 C 800,640 800,610 770,560 Z', strokeWidth: 4 },
      { id: 'dr-9', d: 'M 890,560 C 860,610 860,640 890,640 C 920,640 920,610 890,560 Z', strokeWidth: 4 },
      { id: 'dr-10', d: 'M 770,720 C 740,770 740,800 770,800 C 800,800 800,770 770,720 Z', strokeWidth: 4 }
    ]
  },

  // ==========================================
  // 3. FRUITS
  // ==========================================
  {
    id: 'fruit-watermelon',
    name: 'Juicy Watermelon',
    category: 'fruits',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'wm-rind-outer', d: 'M 100,600 C 200,880 800,880 900,600 L 840,560 C 750,800 250,800 160,560 Z', strokeWidth: 6 },
      { id: 'wm-rind-inner', d: 'M 160,560 C 250,800 750,800 840,560 L 800,530 C 720,740 280,740 200,530 Z', strokeWidth: 5 },
      { id: 'wm-flesh', d: 'M 200,530 C 280,740 720,740 800,530 L 500,120 Z', strokeWidth: 7 },
      { id: 'seed-1', d: 'M 400,540 C 400,500 420,500 420,540 C 420,560 400,560 400,540 Z', strokeWidth: 4 },
      { id: 'seed-2', d: 'M 600,540 C 600,500 580,500 580,540 C 580,560 600,560 600,540 Z', strokeWidth: 4 },
      { id: 'seed-3', d: 'M 500,420 C 500,380 520,380 520,420 C 520,440 500,440 500,420 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'fruit-strawberry',
    name: 'Sweet Strawberry',
    category: 'fruits',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'sb-body', d: 'M 500,900 C 300,750 180,550 220,380 C 250,260 400,260 500,300 C 600,260 750,260 780,380 C 820,550 700,750 500,900 Z', strokeWidth: 7 },
      { id: 'sb-leaf-mid', d: 'M 500,300 C 480,180 520,180 500,300 Z', strokeWidth: 6 },
      { id: 'sb-stem', d: 'M 480,200 C 470,100 520,100 520,200 Z', strokeWidth: 5 },
      { id: 'sb-seed-1', d: 'M 420,440 m -8,0 a 8,14 0 1,0 16,0 a 8,14 0 1,0 -16,0 Z', strokeWidth: 3 },
      { id: 'sb-seed-2', d: 'M 580,440 m -8,0 a 8,14 0 1,0 16,0 a 8,14 0 1,0 -16,0 Z', strokeWidth: 3 },
      { id: 'sb-seed-3', d: 'M 500,560 m -8,0 a 8,14 0 1,0 16,0 a 8,14 0 1,0 -16,0 Z', strokeWidth: 3 }
    ]
  },
  {
    id: 'fruit-banana',
    name: 'Sunny Banana',
    category: 'fruits',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'ban-body', d: 'M 250,220 C 450,240 750,400 800,750 C 650,750 350,550 250,220 Z', strokeWidth: 7 },
      { id: 'ban-stem', d: 'M 250,220 L 220,150 L 280,160 L 270,225 Z', strokeWidth: 6 },
      { id: 'ban-tip', d: 'M 790,730 L 840,780 L 800,800 Z', strokeWidth: 5 }
    ]
  },

  // ==========================================
  // 4. VEGETABLES
  // ==========================================
  {
    id: 'veg-carrot',
    name: 'Crunchy Carrot',
    category: 'vegetables',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'car-body', d: 'M 350,320 C 450,300 550,300 650,320 C 620,550 540,780 500,920 C 460,780 380,550 350,320 Z', strokeWidth: 7 },
      { id: 'car-leaf-c', d: 'M 500,310 C 450,150 550,150 500,310 Z', strokeWidth: 6 },
      { id: 'car-leaf-l', d: 'M 420,315 C 280,180 380,120 460,270 Z', strokeWidth: 6 },
      { id: 'car-leaf-r', d: 'M 580,315 C 720,180 620,120 540,270 Z', strokeWidth: 6 }
    ]
  },
  {
    id: 'veg-pumpkin',
    name: 'Magic Pumpkin',
    category: 'vegetables',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'pump-mid', d: 'M 500,350 C 420,350 400,550 400,650 C 400,750 420,850 500,850 C 580,850 600,750 600,650 C 600,550 580,350 500,350 Z', strokeWidth: 6 },
      { id: 'pump-l1', d: 'M 420,360 C 340,380 300,520 300,650 C 300,780 340,830 420,840 Z', strokeWidth: 6 },
      { id: 'pump-r1', d: 'M 580,360 C 660,380 700,520 700,650 C 700,780 660,830 580,840 Z', strokeWidth: 6 },
      { id: 'pump-stem', d: 'M 480,360 L 460,200 C 520,200 560,240 530,360 Z', strokeWidth: 6 }
    ]
  },
  {
    id: 'veg-tomato',
    name: 'Juicy Tomato',
    category: 'vegetables',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'tom-body', d: 'M 500,320 C 300,320 180,450 180,620 C 180,800 320,880 500,880 C 680,880 820,800 820,620 C 820,450 700,320 500,320 Z', strokeWidth: 7 },
      { id: 'tom-stem', d: 'M 490,330 L 480,200 L 520,200 L 510,330 Z', strokeWidth: 5 }
    ]
  },

  // ==========================================
  // 5. ANIMALS
  // ==========================================
  {
    id: 'anim-panda',
    name: 'Happy Baby Panda',
    category: 'animal',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'pan-ear-l', d: 'M 350,220 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 6 },
      { id: 'pan-ear-r', d: 'M 650,220 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 6 },
      { id: 'pan-head', d: 'M 500,420 m -220,0 a 220,200 0 1,0 440,0 a 220,200 0 1,0 -440,0 Z', strokeWidth: 7 },
      { id: 'pan-body', d: 'M 320,580 C 250,700 250,880 500,880 C 750,880 750,700 680,580 Z', strokeWidth: 7 }
    ]
  },
  {
    id: 'anim-giraffe',
    name: 'Playful Giraffe',
    category: 'animal',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'gir-head', d: 'M 450,220 C 420,150 580,150 550,220 C 580,280 550,350 450,350 C 380,350 400,280 450,220 Z', strokeWidth: 6 },
      { id: 'gir-neck', d: 'M 460,340 L 420,850 L 580,850 L 540,340 Z', strokeWidth: 7 }
    ]
  },

  // ==========================================
  // 6. OBJECTS & TOYS
  // ==========================================
  {
    id: 'obj-teddy-bear',
    name: 'Cuddly Teddy Bear',
    category: 'object',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'ted-head', d: 'M 500,380 m -180,0 a 180,180 0 1,0 360,0 a 180,180 0 1,0 -360,0 Z', strokeWidth: 7 },
      { id: 'ted-body', d: 'M 350,560 C 280,680 280,880 500,880 C 720,880 720,680 650,560 Z', strokeWidth: 7 },
      { id: 'ted-tummy', d: 'M 500,720 m -90,0 a 90,90 0 1,0 180,0 a 90,90 0 1,0 -180,0 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'obj-flying-kite',
    name: 'Flying Kite',
    category: 'object',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'kite-body', d: 'M 500,100 L 800,450 L 500,800 L 200,450 Z', strokeWidth: 7 },
      { id: 'kite-spine', d: 'M 500,100 L 500,800', strokeWidth: 6 }
    ]
  },
  {
    id: 'obj-gift-box',
    name: 'Gift Box Surprise',
    category: 'object',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      { id: 'gift-box-base', d: 'M 250,420 L 750,420 L 710,880 L 290,880 Z', strokeWidth: 7 },
      { id: 'gift-box-lid', d: 'M 200,320 L 800,320 L 800,420 L 200,420 Z', strokeWidth: 7 },
      { id: 'ribbon-vert', d: 'M 460,320 L 540,320 L 540,880 L 460,880 Z', strokeWidth: 6 }
    ]
  }
];
