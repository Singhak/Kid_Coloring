/**
 * Educational & Thematic Templates for KidColor
 * Categories: Alphabets, Numbers, Fruits, Vegetables, Animals, Objects
 */

import { Template } from '../types';

export const EDUCATIONAL_TEMPLATES: Template[] = [
  // ==========================================
  // 1. ALPHABETS (A to Z Learning Pages)
  // ==========================================
  {
    id: 'alpha-a-apple',
    name: 'Letter A - Apple',
    category: 'alphabet',
    difficulty: 'Easy',
    viewBox: '0 0 1000 1000',
    paths: [
      // Big Letter A (Left side)
      { id: 'let-a-outer', d: 'M 220,150 L 320,550 L 250,550 L 225,440 L 135,440 L 110,550 L 40,550 L 140,150 Z', strokeWidth: 8 },
      { id: 'let-a-inner', d: 'M 180,260 L 150,380 L 210,380 Z', strokeWidth: 6 },
      // Apple Body (Right side)
      { id: 'apple-body', d: 'M 650,280 C 580,280 540,320 500,320 C 460,320 420,280 350,280 C 260,280 200,380 200,520 C 200,720 380,900 500,900 C 620,900 800,720 800,520 C 800,380 740,280 650,280 Z', strokeWidth: 7 },
      // Apple Stem & Leaf
      { id: 'apple-stem', d: 'M 500,320 C 500,240 530,180 560,150 L 530,150 C 490,190 470,250 480,320 Z', strokeWidth: 6 },
      { id: 'apple-leaf', d: 'M 530,220 C 620,180 680,220 700,280 C 640,300 560,280 530,220 Z', strokeWidth: 6 },
      // Apple Cute Smile
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
    viewBox: '0 0 1000 1000',
    paths: [
      // Big Letter B
      { id: 'let-b-outer', d: 'M 80,150 L 240,150 C 310,150 360,190 360,270 C 360,330 320,370 270,390 C 330,410 380,460 380,550 C 380,640 310,680 230,680 L 80,680 Z', strokeWidth: 8 },
      { id: 'let-b-top-hole', d: 'M 160,230 L 230,230 C 260,230 280,245 280,275 C 280,305 260,320 230,320 L 160,320 Z', strokeWidth: 6 },
      { id: 'let-b-bot-hole', d: 'M 160,400 L 240,400 C 275,400 300,420 300,460 C 300,500 275,520 240,520 L 160,520 Z', strokeWidth: 6 },
      // Butterfly Body
      { id: 'bf-head', d: 'M 650,220 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 6 },
      { id: 'bf-body', d: 'M 625,260 C 625,260 610,500 650,650 C 690,500 675,260 675,260 Z', strokeWidth: 6 },
      // Antennae
      { id: 'bf-ant-l', d: 'M 630,195 Q 580,120 540,140', strokeWidth: 5 },
      { id: 'bf-ant-r', d: 'M 670,195 Q 720,120 760,140', strokeWidth: 5 },
      // Wings Top Left & Right
      { id: 'bf-wing-tl', d: 'M 630,300 C 450,150 380,400 625,450 Z', strokeWidth: 6 },
      { id: 'bf-wing-tr', d: 'M 670,300 C 850,150 920,400 675,450 Z', strokeWidth: 6 },
      // Wings Bottom Left & Right
      { id: 'bf-wing-bl', d: 'M 630,470 C 480,500 450,700 640,620 Z', strokeWidth: 6 },
      { id: 'bf-wing-br', d: 'M 670,470 C 820,500 850,700 660,620 Z', strokeWidth: 6 },
      // Wing Circles
      { id: 'bf-dot-tl', d: 'M 520,300 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z', strokeWidth: 4 },
      { id: 'bf-dot-tr', d: 'M 780,300 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'alpha-c-cat',
    name: 'Letter C - Cat',
    category: 'alphabet',
    difficulty: 'Easy',
    viewBox: '0 0 1000 1000',
    paths: [
      // Big Letter C
      { id: 'let-c', d: 'M 350,220 C 220,220 120,330 120,480 C 120,630 220,740 350,740 C 400,740 440,720 470,690 L 410,610 C 390,630 365,640 340,640 C 260,640 210,570 210,480 C 210,390 260,320 340,320 C 370,320 395,335 415,355 L 475,275 C 440,240 395,220 350,220 Z', strokeWidth: 8 },
      // Cat Head
      { id: 'cat-head', d: 'M 700,420 m -160,0 a 160,160 0 1,0 320,0 a 160,160 0 1,0 -320,0 Z', strokeWidth: 7 },
      // Ears
      { id: 'cat-ear-l', d: 'M 570,320 L 530,160 L 670,270 Z', strokeWidth: 6 },
      { id: 'cat-ear-r', d: 'M 830,320 L 870,160 L 730,270 Z', strokeWidth: 6 },
      // Eyes
      { id: 'cat-eye-l', d: 'M 630,400 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', strokeWidth: 4 },
      { id: 'cat-eye-r', d: 'M 770,400 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', strokeWidth: 4 },
      // Nose & Whiskers
      { id: 'cat-nose', d: 'M 685,440 L 715,440 L 700,460 Z', strokeWidth: 5 },
      { id: 'cat-mouth', d: 'M 670,480 Q 700,510 700,460 Q 700,510 730,480', strokeWidth: 5 },
      { id: 'cat-whisk-l1', d: 'M 620,440 L 520,420', strokeWidth: 4 },
      { id: 'cat-whisk-l2', d: 'M 620,460 L 510,470', strokeWidth: 4 },
      { id: 'cat-whisk-r1', d: 'M 780,440 L 880,420', strokeWidth: 4 },
      { id: 'cat-whisk-r2', d: 'M 780,460 L 890,470', strokeWidth: 4 },
      // Body & Paws
      { id: 'cat-body', d: 'M 580,540 C 540,650 540,820 620,880 L 780,880 C 860,820 860,650 820,540 Z', strokeWidth: 6 }
    ]
  },

  // ==========================================
  // 2. NUMBERS (1 to 10 Counting)
  // ==========================================
  {
    id: 'num-1-sun',
    name: 'Number 1 - One Sun',
    category: 'numbers',
    difficulty: 'Easy',
    viewBox: '0 0 1000 1000',
    paths: [
      // Big Number 1
      { id: 'num-1', d: 'M 220,300 L 290,200 L 370,200 L 370,820 L 260,820 L 260,880 L 480,880 L 480,820 L 370,820 L 370,200 L 190,320 Z', strokeWidth: 8 },
      // Sun Center
      { id: 'sun-center', d: 'M 700,450 m -140,0 a 140,140 0 1,0 280,0 a 140,140 0 1,0 -280,0 Z', strokeWidth: 7 },
      // Sun Rays
      { id: 'ray-1', d: 'M 700,240 L 700,160', strokeWidth: 7 },
      { id: 'ray-2', d: 'M 700,660 L 700,740', strokeWidth: 7 },
      { id: 'ray-3', d: 'M 490,450 L 410,450', strokeWidth: 7 },
      { id: 'ray-4', d: 'M 910,450 L 990,450', strokeWidth: 7 },
      { id: 'ray-5', d: 'M 550,300 L 490,240', strokeWidth: 7 },
      { id: 'ray-6', d: 'M 850,300 L 910,240', strokeWidth: 7 },
      { id: 'ray-7', d: 'M 550,600 L 490,660', strokeWidth: 7 },
      { id: 'ray-8', d: 'M 850,600 L 910,660', strokeWidth: 7 },
      // Sun Face
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
    viewBox: '0 0 1000 1000',
    paths: [
      // Big Number 2
      { id: 'num-2', d: 'M 80,300 C 80,180 200,120 320,120 C 440,120 520,200 520,300 C 520,400 440,480 320,600 L 160,760 L 520,760 L 520,860 L 60,860 L 60,760 L 260,540 C 360,440 400,380 400,300 C 400,240 360,200 300,200 C 240,200 180,240 180,300 Z', strokeWidth: 8 },
      // Duck 1 (Top Right)
      { id: 'duck1-head', d: 'M 720,250 m -45,0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0 Z', strokeWidth: 5 },
      { id: 'duck1-beak', d: 'M 675,250 L 610,260 L 675,275 Z', strokeWidth: 5 },
      { id: 'duck1-eye', d: 'M 700,240 m -6,0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0 Z', strokeWidth: 3 },
      { id: 'duck1-body', d: 'M 720,295 C 640,320 600,420 700,470 C 820,470 880,380 820,340 C 800,320 760,295 720,295 Z', strokeWidth: 6 },
      { id: 'duck1-wing', d: 'M 730,370 C 680,380 670,430 750,440 C 780,440 800,410 780,380 Z', strokeWidth: 4 },
      // Duck 2 (Bottom Right)
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
    viewBox: '0 0 1000 1000',
    paths: [
      // Big Number 3
      { id: 'num-3', d: 'M 100,160 L 420,160 L 260,380 C 360,380 460,450 460,600 C 460,760 330,860 160,860 C 80,860 20,820 0,770 L 60,680 C 80,720 120,750 170,750 C 260,750 330,680 330,600 C 330,500 240,450 140,450 L 140,360 L 280,180 L 100,180 Z', strokeWidth: 8 },
      // Balloon 1
      { id: 'b1-body', d: 'M 600,220 C 530,220 500,320 500,400 C 500,480 570,520 600,540 C 630,520 700,480 700,400 C 700,320 670,220 600,220 Z', strokeWidth: 6 },
      { id: 'b1-tie', d: 'M 590,540 L 610,540 L 620,560 L 580,560 Z', strokeWidth: 4 },
      { id: 'b1-string', d: 'M 600,560 Q 640,680 680,800', strokeWidth: 4 },
      // Balloon 2
      { id: 'b2-body', d: 'M 800,120 C 730,120 700,220 700,300 C 700,380 770,420 800,440 C 830,420 900,380 900,300 C 900,220 870,120 800,120 Z', strokeWidth: 6 },
      { id: 'b2-tie', d: 'M 790,440 L 810,440 L 820,460 L 780,460 Z', strokeWidth: 4 },
      { id: 'b2-string', d: 'M 800,460 Q 740,630 690,800', strokeWidth: 4 },
      // Balloon 3
      { id: 'b3-body', d: 'M 750,420 C 680,420 650,520 650,600 C 650,680 720,720 750,740 C 780,720 850,680 850,600 C 850,520 820,420 750,420 Z', strokeWidth: 6 },
      { id: 'b3-tie', d: 'M 740,740 L 760,740 L 770,760 L 730,760 Z', strokeWidth: 4 },
      { id: 'b3-string', d: 'M 750,760 Q 720,830 700,900', strokeWidth: 4 }
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
    viewBox: '0 0 1000 1000',
    paths: [
      // Outer Green Rind
      { id: 'wm-rind-outer', d: 'M 100,600 C 200,880 800,880 900,600 L 840,560 C 750,800 250,800 160,560 Z', strokeWidth: 6 },
      // Inner White Rind
      { id: 'wm-rind-inner', d: 'M 160,560 C 250,800 750,800 840,560 L 800,530 C 720,740 280,740 200,530 Z', strokeWidth: 5 },
      // Red Flesh
      { id: 'wm-flesh', d: 'M 200,530 C 280,740 720,740 800,530 L 500,120 Z', strokeWidth: 7 },
      // Seeds
      { id: 'seed-1', d: 'M 400,540 C 400,500 420,500 420,540 C 420,560 400,560 400,540 Z', strokeWidth: 4 },
      { id: 'seed-2', d: 'M 600,540 C 600,500 580,500 580,540 C 580,560 600,560 600,540 Z', strokeWidth: 4 },
      { id: 'seed-3', d: 'M 500,420 C 500,380 520,380 520,420 C 520,440 500,440 500,420 Z', strokeWidth: 4 },
      { id: 'seed-4', d: 'M 350,620 C 350,590 370,590 370,620 C 370,640 350,640 350,620 Z', strokeWidth: 4 },
      { id: 'seed-5', d: 'M 650,620 C 650,590 630,590 630,620 C 630,640 650,640 650,620 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'fruit-strawberry',
    name: 'Sweet Strawberry',
    category: 'fruits',
    difficulty: 'Easy',
    viewBox: '0 0 1000 1000',
    paths: [
      // Berry Body
      { id: 'sb-body', d: 'M 500,900 C 300,750 180,550 220,380 C 250,260 400,260 500,300 C 600,260 750,260 780,380 C 820,550 700,750 500,900 Z', strokeWidth: 7 },
      // Leafy Top Cap
      { id: 'sb-leaf-mid', d: 'M 500,300 C 480,180 520,180 500,300 Z', strokeWidth: 6 },
      { id: 'sb-leaf-l1', d: 'M 440,310 C 320,220 380,160 480,260 Z', strokeWidth: 6 },
      { id: 'sb-leaf-r1', d: 'M 560,310 C 680,220 620,160 520,260 Z', strokeWidth: 6 },
      { id: 'sb-leaf-l2', d: 'M 380,340 C 220,300 240,220 380,280 Z', strokeWidth: 6 },
      { id: 'sb-leaf-r2', d: 'M 620,340 C 780,300 760,220 620,280 Z', strokeWidth: 6 },
      // Stem
      { id: 'sb-stem', d: 'M 480,200 C 470,100 520,100 520,200 Z', strokeWidth: 5 },
      // Little Seeds
      { id: 'sb-seed-1', d: 'M 420,440 m -8,0 a 8,14 0 1,0 16,0 a 8,14 0 1,0 -16,0 Z', strokeWidth: 3 },
      { id: 'sb-seed-2', d: 'M 580,440 m -8,0 a 8,14 0 1,0 16,0 a 8,14 0 1,0 -16,0 Z', strokeWidth: 3 },
      { id: 'sb-seed-3', d: 'M 500,560 m -8,0 a 8,14 0 1,0 16,0 a 8,14 0 1,0 -16,0 Z', strokeWidth: 3 },
      { id: 'sb-seed-4', d: 'M 360,600 m -8,0 a 8,14 0 1,0 16,0 a 8,14 0 1,0 -16,0 Z', strokeWidth: 3 },
      { id: 'sb-seed-5', d: 'M 640,600 m -8,0 a 8,14 0 1,0 16,0 a 8,14 0 1,0 -16,0 Z', strokeWidth: 3 },
      { id: 'sb-seed-6', d: 'M 500,740 m -8,0 a 8,14 0 1,0 16,0 a 8,14 0 1,0 -16,0 Z', strokeWidth: 3 }
    ]
  },
  {
    id: 'fruit-banana',
    name: 'Sunny Banana',
    category: 'fruits',
    difficulty: 'Easy',
    viewBox: '0 0 1000 1000',
    paths: [
      // Banana Body
      { id: 'ban-body', d: 'M 250,220 C 450,240 750,400 800,750 C 650,750 350,550 250,220 Z', strokeWidth: 7 },
      // Stem Cap
      { id: 'ban-stem', d: 'M 250,220 L 220,150 L 280,160 L 270,225 Z', strokeWidth: 6 },
      // Bottom Tip
      { id: 'ban-tip', d: 'M 790,730 L 840,780 L 800,800 Z', strokeWidth: 5 },
      // Ridge Line
      { id: 'ban-ridge', d: 'M 260,220 C 450,330 650,480 800,750', strokeWidth: 5 }
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
    viewBox: '0 0 1000 1000',
    paths: [
      // Carrot Body
      { id: 'car-body', d: 'M 350,320 C 450,300 550,300 650,320 C 620,550 540,780 500,920 C 460,780 380,550 350,320 Z', strokeWidth: 7 },
      // Texture lines
      { id: 'car-line-1', d: 'M 400,450 Q 480,470 440,490', strokeWidth: 5 },
      { id: 'car-line-2', d: 'M 600,560 Q 520,580 560,600', strokeWidth: 5 },
      { id: 'car-line-3', d: 'M 430,680 Q 490,700 460,720', strokeWidth: 5 },
      // Leafy Greens Top
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
    viewBox: '0 0 1000 1000',
    paths: [
      // Pumpkin Middle Section
      { id: 'pump-mid', d: 'M 500,350 C 420,350 400,550 400,650 C 400,750 420,850 500,850 C 580,850 600,750 600,650 C 600,550 580,350 500,350 Z', strokeWidth: 6 },
      // Left Inner Lobe
      { id: 'pump-l1', d: 'M 420,360 C 340,380 300,520 300,650 C 300,780 340,830 420,840 Z', strokeWidth: 6 },
      // Right Inner Lobe
      { id: 'pump-r1', d: 'M 580,360 C 660,380 700,520 700,650 C 700,780 660,830 580,840 Z', strokeWidth: 6 },
      // Left Outer Lobe
      { id: 'pump-l2', d: 'M 330,410 C 220,450 180,560 180,650 C 180,740 220,800 330,820 Z', strokeWidth: 6 },
      // Right Outer Lobe
      { id: 'pump-r2', d: 'M 670,410 C 780,450 820,560 820,650 C 820,740 780,800 670,820 Z', strokeWidth: 6 },
      // Stem
      { id: 'pump-stem', d: 'M 480,360 L 460,200 C 520,200 560,240 530,360 Z', strokeWidth: 6 }
    ]
  },
  {
    id: 'veg-tomato',
    name: 'Juicy Tomato',
    category: 'vegetables',
    difficulty: 'Easy',
    viewBox: '0 0 1000 1000',
    paths: [
      // Tomato Round Body
      { id: 'tom-body', d: 'M 500,320 C 300,320 180,450 180,620 C 180,800 320,880 500,880 C 680,880 820,800 820,620 C 820,450 700,320 500,320 Z', strokeWidth: 7 },
      // Star Stem Leaves
      { id: 'tom-stem', d: 'M 490,330 L 480,200 L 520,200 L 510,330 Z', strokeWidth: 5 },
      { id: 'tom-star-1', d: 'M 500,330 L 380,280 L 440,350 Z', strokeWidth: 5 },
      { id: 'tom-star-2', d: 'M 500,330 L 620,280 L 560,350 Z', strokeWidth: 5 },
      { id: 'tom-star-3', d: 'M 500,330 L 350,380 L 430,400 Z', strokeWidth: 5 },
      { id: 'tom-star-4', d: 'M 500,330 L 650,380 L 570,400 Z', strokeWidth: 5 }
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
    viewBox: '0 0 1000 1000',
    paths: [
      // Panda Ears
      { id: 'pan-ear-l', d: 'M 350,220 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 6 },
      { id: 'pan-ear-r', d: 'M 650,220 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 6 },
      // Head
      { id: 'pan-head', d: 'M 500,420 m -220,0 a 220,200 0 1,0 440,0 a 220,200 0 1,0 -440,0 Z', strokeWidth: 7 },
      // Eye Patches
      { id: 'pan-eye-patch-l', d: 'M 380,400 m -40,0 a 40,55 0 1,0 80,0 a 40,55 0 1,0 -80,0 Z', strokeWidth: 5 },
      { id: 'pan-eye-patch-r', d: 'M 620,400 m -40,0 a 40,55 0 1,0 80,0 a 40,55 0 1,0 -80,0 Z', strokeWidth: 5 },
      { id: 'pan-pupil-l', d: 'M 390,390 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 3 },
      { id: 'pan-pupil-r', d: 'M 610,390 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 3 },
      // Nose & Mouth
      { id: 'pan-nose', d: 'M 470,480 C 470,460 530,460 530,480 C 530,510 470,510 470,480 Z', strokeWidth: 5 },
      { id: 'pan-mouth', d: 'M 440,530 Q 500,580 560,530', strokeWidth: 5 },
      // Body & Paws
      { id: 'pan-body', d: 'M 320,580 C 250,700 250,880 500,880 C 750,880 750,700 680,580 Z', strokeWidth: 7 },
      { id: 'pan-paw-l', d: 'M 300,750 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 6 },
      { id: 'pan-paw-r', d: 'M 700,750 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 6 }
    ]
  },
  {
    id: 'anim-giraffe',
    name: 'Playful Giraffe',
    category: 'animal',
    difficulty: 'Easy',
    viewBox: '0 0 1000 1000',
    paths: [
      // Giraffe Head
      { id: 'gir-head', d: 'M 450,220 C 420,150 580,150 550,220 C 580,280 550,350 450,350 C 380,350 400,280 450,220 Z', strokeWidth: 6 },
      // Horns (Ossicones)
      { id: 'gir-horn-l', d: 'M 460,160 L 440,90 L 470,80 L 480,150 Z', strokeWidth: 5 },
      { id: 'gir-horn-r', d: 'M 540,160 L 560,90 L 530,80 L 520,150 Z', strokeWidth: 5 },
      // Ears
      { id: 'gir-ear-l', d: 'M 420,180 C 350,160 360,240 430,220 Z', strokeWidth: 5 },
      { id: 'gir-ear-r', d: 'M 580,180 C 650,160 640,240 570,220 Z', strokeWidth: 5 },
      // Eyes & Muzzle
      { id: 'gir-eye-l', d: 'M 460,220 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
      { id: 'gir-eye-r', d: 'M 540,220 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
      { id: 'gir-muzzle', d: 'M 440,280 C 440,260 560,260 560,280 C 560,340 440,340 440,280 Z', strokeWidth: 5 },
      // Long Neck
      { id: 'gir-neck', d: 'M 460,340 L 420,850 L 580,850 L 540,340 Z', strokeWidth: 7 },
      // Spots on Neck
      { id: 'gir-spot-1', d: 'M 470,440 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z', strokeWidth: 4 },
      { id: 'gir-spot-2', d: 'M 530,560 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 4 },
      { id: 'gir-spot-3', d: 'M 460,680 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 4 }
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
    viewBox: '0 0 1000 1000',
    paths: [
      // Ears
      { id: 'ted-ear-l', d: 'M 350,220 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 6 },
      { id: 'ted-ear-r', d: 'M 650,220 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 6 },
      // Head
      { id: 'ted-head', d: 'M 500,380 m -180,0 a 180,180 0 1,0 360,0 a 180,180 0 1,0 -360,0 Z', strokeWidth: 7 },
      // Eyes & Muzzle
      { id: 'ted-eye-l', d: 'M 430,340 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'ted-eye-r', d: 'M 570,340 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'ted-muzzle', d: 'M 500,420 m -60,0 a 60,45 0 1,0 120,0 a 60,45 0 1,0 -120,0 Z', strokeWidth: 5 },
      { id: 'ted-nose', d: 'M 480,400 L 520,400 L 500,420 Z', strokeWidth: 4 },
      { id: 'ted-mouth', d: 'M 475,435 Q 500,460 525,435', strokeWidth: 4 },
      // Bow Tie
      { id: 'ted-bow-l', d: 'M 500,550 L 400,490 L 400,610 Z', strokeWidth: 5 },
      { id: 'ted-bow-r', d: 'M 500,550 L 600,490 L 600,610 Z', strokeWidth: 5 },
      { id: 'ted-bow-c', d: 'M 500,550 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', strokeWidth: 5 },
      // Body & Tummy Patch
      { id: 'ted-body', d: 'M 350,560 C 280,680 280,880 500,880 C 720,880 720,680 650,560 Z', strokeWidth: 7 },
      { id: 'ted-tummy', d: 'M 500,720 m -90,0 a 90,90 0 1,0 180,0 a 90,90 0 1,0 -180,0 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'obj-flying-kite',
    name: 'Flying Kite',
    category: 'object',
    difficulty: 'Easy',
    viewBox: '0 0 1000 1000',
    paths: [
      // Diamond Kite Body
      { id: 'kite-body', d: 'M 500,100 L 800,450 L 500,800 L 200,450 Z', strokeWidth: 7 },
      // Crossbars
      { id: 'kite-spine', d: 'M 500,100 L 500,800', strokeWidth: 6 },
      { id: 'kite-cross', d: 'M 200,450 Q 500,380 800,450', strokeWidth: 6 },
      // Tail Ribbon
      { id: 'kite-tail', d: 'M 500,800 Q 600,880 550,960', strokeWidth: 5 },
      // Bows on Tail
      { id: 'tail-bow-1', d: 'M 550,860 L 520,840 L 520,880 Z M 550,860 L 580,840 L 580,880 Z', strokeWidth: 4 },
      { id: 'tail-bow-2', d: 'M 570,920 L 540,900 L 540,940 Z M 570,920 L 600,900 L 600,940 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'obj-gift-box',
    name: 'Gift Box Surprise',
    category: 'object',
    difficulty: 'Easy',
    viewBox: '0 0 1000 1000',
    paths: [
      // Box Bottom
      { id: 'gift-box-base', d: 'M 250,420 L 750,420 L 710,880 L 290,880 Z', strokeWidth: 7 },
      // Box Lid
      { id: 'gift-box-lid', d: 'M 200,320 L 800,320 L 800,420 L 200,420 Z', strokeWidth: 7 },
      // Vertical Ribbon
      { id: 'ribbon-vert', d: 'M 460,320 L 540,320 L 540,880 L 460,880 Z', strokeWidth: 6 },
      // Big Top Bow
      { id: 'bow-l', d: 'M 480,320 C 350,150 280,240 480,300 Z', strokeWidth: 6 },
      { id: 'bow-r', d: 'M 520,320 C 650,150 720,240 520,300 Z', strokeWidth: 6 },
      { id: 'bow-knot', d: 'M 500,310 m -30,0 a 30,20 0 1,0 60,0 a 30,20 0 1,0 -60,0 Z', strokeWidth: 5 }
    ]
  }
];
