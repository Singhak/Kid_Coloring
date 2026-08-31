/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Template } from '../types';

export const REALISTIC_TEMPLATES: Template[] = [
  {
    id: 'realistic-lion',
    name: 'Majestic Safari Lion',
    category: 'animal',
    difficulty: 'Detailed',
    viewBox: '0 0 1000 1000',
    paths: [
      // Outer Mane Clusters
      { id: 'mane-top-1', d: 'M 500,80 C 450,110 400,160 410,220 C 370,180 320,200 330,260 C 280,230 250,280 270,340 C 220,320 200,380 220,440 C 180,430 170,500 200,560 C 170,580 180,660 230,700 C 200,740 230,810 290,830 C 270,870 320,930 390,920 C 390,960 460,980 500,950 C 540,980 610,960 610,920 C 680,930 730,870 710,830 C 770,810 800,740 770,700 C 820,660 830,580 800,560 C 830,500 820,430 780,440 C 800,380 780,320 730,340 C 750,280 720,230 670,260 C 680,200 630,180 590,220 C 600,160 550,110 500,80 Z', strokeWidth: 5 },
      // Inner Mane Layers
      { id: 'mane-inner-l', d: 'M 410,220 C 350,300 320,420 350,540 C 330,620 360,720 440,780 C 380,740 340,640 360,520 C 330,420 370,300 410,220 Z', strokeWidth: 4 },
      { id: 'mane-inner-r', d: 'M 590,220 C 650,300 680,420 650,540 C 670,620 640,720 560,780 C 620,740 660,640 640,520 C 670,420 630,300 590,220 Z', strokeWidth: 4 },
      // Ears
      { id: 'ear-left-outer', d: 'M 350,250 C 310,220 280,270 310,330 C 330,310 350,280 350,250 Z', strokeWidth: 5 },
      { id: 'ear-left-inner', d: 'M 340,265 C 315,245 295,280 315,315 C 325,300 335,285 340,265 Z', strokeWidth: 3 },
      { id: 'ear-right-outer', d: 'M 650,250 C 690,220 720,270 690,330 C 670,310 650,280 650,250 Z', strokeWidth: 5 },
      { id: 'ear-right-inner', d: 'M 660,265 C 685,245 705,280 685,315 C 675,300 665,285 660,265 Z', strokeWidth: 3 },
      // Forehead & Face Contour
      { id: 'forehead', d: 'M 400,320 C 450,290 550,290 600,320 C 580,380 560,420 500,420 C 440,420 420,380 400,320 Z', strokeWidth: 4 },
      { id: 'forehead-mark-l', d: 'M 450,320 C 460,350 460,380 450,400 C 440,380 440,350 450,320 Z', strokeWidth: 3 },
      { id: 'forehead-mark-r', d: 'M 550,320 C 540,350 540,380 550,400 C 560,380 560,350 550,320 Z', strokeWidth: 3 },
      // Cheeks
      { id: 'cheek-left', d: 'M 400,320 C 370,400 370,500 420,560 C 430,510 440,460 450,430 C 420,400 405,360 400,320 Z', strokeWidth: 4 },
      { id: 'cheek-right', d: 'M 600,320 C 630,400 630,500 580,560 C 570,510 560,460 550,430 C 580,400 595,360 600,320 Z', strokeWidth: 4 },
      // Eyes Left
      { id: 'eye-left-socket', d: 'M 410,430 C 440,410 470,420 480,450 C 450,465 425,455 410,430 Z', strokeWidth: 4 },
      { id: 'eye-left-pupil', d: 'M 445,432 A 14,14 0 1 0 445,458 A 14,14 0 1 0 445,432 Z', strokeWidth: 3 },
      { id: 'eye-left-shine', d: 'M 442,437 A 4,4 0 1 0 442,445 A 4,4 0 1 0 442,437 Z', strokeWidth: 1 },
      // Eyes Right
      { id: 'eye-right-socket', d: 'M 590,430 C 560,410 530,420 520,450 C 550,465 575,455 590,430 Z', strokeWidth: 4 },
      { id: 'eye-right-pupil', d: 'M 555,432 A 14,14 0 1 0 555,458 A 14,14 0 1 0 555,432 Z', strokeWidth: 3 },
      { id: 'eye-right-shine', d: 'M 552,437 A 4,4 0 1 0 552,445 A 4,4 0 1 0 552,437 Z', strokeWidth: 1 },
      // Bridge of Nose
      { id: 'nose-bridge', d: 'M 475,430 L 525,430 L 535,530 L 465,530 Z', strokeWidth: 3 },
      // Nose Tip
      { id: 'nose-tip', d: 'M 460,530 C 480,515 520,515 540,530 C 550,560 520,585 500,585 C 480,585 450,560 460,530 Z', strokeWidth: 4 },
      // Muzzle Left & Right
      { id: 'muzzle-left', d: 'M 500,585 C 460,585 420,600 425,655 C 445,690 485,685 500,660 Z', strokeWidth: 4 },
      { id: 'muzzle-right', d: 'M 500,585 C 540,585 580,600 575,655 C 555,690 515,685 500,660 Z', strokeWidth: 4 },
      // Chin / Beard
      { id: 'chin', d: 'M 460,670 C 475,665 525,665 540,670 C 545,715 525,750 500,750 C 475,750 455,715 460,670 Z', strokeWidth: 4 },
      // Lower Chest Mane
      { id: 'chest-center', d: 'M 500,750 C 440,780 430,860 500,920 C 570,860 560,780 500,750 Z', strokeWidth: 4 },
      { id: 'chest-left', d: 'M 440,780 C 370,810 360,890 430,940 C 470,910 460,840 440,780 Z', strokeWidth: 4 },
      { id: 'chest-right', d: 'M 560,780 C 630,810 640,890 570,940 C 530,910 540,840 560,780 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'realistic-puppy',
    name: 'Playful Golden Puppy',
    category: 'animal',
    difficulty: 'Medium',
    viewBox: '0 0 1000 1000',
    paths: [
      // Left Flop Ear
      { id: 'ear-l', d: 'M 350,220 C 260,220 200,320 220,440 C 240,520 300,550 330,480 C 340,420 340,320 350,220 Z', strokeWidth: 5 },
      { id: 'ear-l-shade', d: 'M 240,440 C 230,350 280,270 330,250 C 320,330 310,420 300,480 C 270,490 250,470 240,440 Z', strokeWidth: 3 },
      // Right Flop Ear
      { id: 'ear-r', d: 'M 650,220 C 740,220 800,320 780,440 C 760,520 700,550 670,480 C 660,420 660,320 650,220 Z', strokeWidth: 5 },
      { id: 'ear-r-shade', d: 'M 760,440 C 770,350 720,270 670,250 C 680,330 690,420 700,480 C 730,490 750,470 760,440 Z', strokeWidth: 3 },
      // Head Dome
      { id: 'head-top', d: 'M 350,220 C 420,180 580,180 650,220 C 680,300 680,400 640,470 C 580,480 420,480 360,470 C 320,400 320,300 350,220 Z', strokeWidth: 5 },
      // Eyes
      { id: 'eye-l-socket', d: 'M 400,330 A 28,32 0 1 0 400,394 A 28,32 0 1 0 400,330 Z', strokeWidth: 4 },
      { id: 'eye-l-pupil', d: 'M 400,342 A 16,18 0 1 0 400,378 A 16,18 0 1 0 400,342 Z', strokeWidth: 2 },
      { id: 'eye-l-shine', d: 'M 394,346 A 5,5 0 1 0 394,356 A 5,5 0 1 0 394,346 Z', strokeWidth: 1 },
      { id: 'eye-r-socket', d: 'M 600,330 A 28,32 0 1 0 600,394 A 28,32 0 1 0 600,330 Z', strokeWidth: 4 },
      { id: 'eye-r-pupil', d: 'M 600,342 A 16,18 0 1 0 600,378 A 16,18 0 1 0 600,342 Z', strokeWidth: 2 },
      { id: 'eye-r-shine', d: 'M 594,346 A 5,5 0 1 0 594,356 A 5,5 0 1 0 594,346 Z', strokeWidth: 1 },
      // Puppy Muzzle
      { id: 'muzzle-base', d: 'M 440,400 C 470,390 530,390 560,400 C 600,450 590,540 500,550 C 410,540 400,450 440,400 Z', strokeWidth: 4 },
      // Puppy Nose
      { id: 'nose', d: 'M 470,430 C 485,420 515,420 530,430 C 545,455 525,480 500,480 C 475,480 455,455 470,430 Z', strokeWidth: 4 },
      // Mouth & Tongue
      { id: 'mouth-l', d: 'M 500,480 C 470,510 440,510 430,490', strokeWidth: 3 },
      { id: 'mouth-r', d: 'M 500,480 C 530,510 560,510 570,490', strokeWidth: 3 },
      { id: 'tongue', d: 'M 480,500 C 480,550 520,550 520,500 Z', strokeWidth: 3 },
      // Puppy Collar & Bell
      { id: 'collar', d: 'M 360,570 C 440,610 560,610 640,570 L 650,620 C 560,660 440,660 350,620 Z', strokeWidth: 4 },
      { id: 'collar-bell', d: 'M 500,630 A 25,25 0 1 0 500,680 A 25,25 0 1 0 500,630 Z', strokeWidth: 3 },
      // Puppy Body & Paws
      { id: 'body', d: 'M 370,620 C 340,690 320,800 360,920 L 640,920 C 680,800 660,690 630,620 Z', strokeWidth: 5 },
      { id: 'paw-left', d: 'M 350,820 C 330,860 330,940 400,940 C 440,940 450,880 440,820 Z', strokeWidth: 4 },
      { id: 'paw-right', d: 'M 560,820 C 550,880 560,940 600,940 C 670,940 670,860 650,820 Z', strokeWidth: 4 },
      { id: 'tail', d: 'M 650,750 C 750,720 820,680 830,620 C 810,640 760,700 660,780 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'realistic-supercar',
    name: 'Supersonic GT Racecar',
    category: 'vehicles',
    difficulty: 'Detailed',
    viewBox: '0 0 1000 1000',
    paths: [
      // Aero Roof & Windshield
      { id: 'roof', d: 'M 360,340 C 440,300 580,300 660,340 L 750,440 L 250,440 Z', strokeWidth: 5 },
      { id: 'windshield', d: 'M 380,345 C 440,315 560,315 620,345 L 720,430 L 280,430 Z', strokeWidth: 4 },
      { id: 'window-side-l', d: 'M 290,370 L 370,350 L 360,420 L 270,420 Z', strokeWidth: 3 },
      { id: 'window-side-r', d: 'M 710,370 L 630,350 L 640,420 L 730,420 Z', strokeWidth: 3 },
      // Hood & Front Bodywork
      { id: 'hood', d: 'M 250,440 L 750,440 L 820,540 L 180,540 Z', strokeWidth: 5 },
      { id: 'hood-scoop-l', d: 'M 320,460 L 420,460 L 400,500 L 340,500 Z', strokeWidth: 3 },
      { id: 'hood-scoop-r', d: 'M 680,460 L 580,460 L 600,500 L 660,500 Z', strokeWidth: 3 },
      { id: 'racing-stripe-l', d: 'M 470,310 L 490,310 L 490,540 L 470,540 Z', strokeWidth: 3 },
      { id: 'racing-stripe-r', d: 'M 510,310 L 530,310 L 530,540 L 510,540 Z', strokeWidth: 3 },
      // Front Grille & Headlights
      { id: 'headlight-l', d: 'M 200,500 L 300,500 L 280,535 L 185,530 Z', strokeWidth: 4 },
      { id: 'headlight-r', d: 'M 800,500 L 700,500 L 720,535 L 815,530 Z', strokeWidth: 4 },
      { id: 'grille-center', d: 'M 350,540 L 650,540 L 680,620 L 320,620 Z', strokeWidth: 4 },
      { id: 'bumper-splitter', d: 'M 140,620 L 860,620 L 890,660 L 110,660 Z', strokeWidth: 5 },
      // Chassis Lower Flanks
      { id: 'side-skirt-l', d: 'M 140,540 L 220,540 L 220,670 L 120,670 Z', strokeWidth: 4 },
      { id: 'side-skirt-r', d: 'M 860,540 L 780,540 L 780,670 L 880,670 Z', strokeWidth: 4 },
      // Left Front Wheel & Rim
      { id: 'wheel-l-tire', d: 'M 160,560 C 110,560 80,640 80,740 C 80,840 120,900 200,900 C 260,900 290,840 290,740 C 290,640 240,560 160,560 Z', strokeWidth: 5 },
      { id: 'wheel-l-rim', d: 'M 185,670 A 55,55 0 1 0 185,780 A 55,55 0 1 0 185,670 Z', strokeWidth: 4 },
      { id: 'wheel-l-spokes', d: 'M 185,690 L 185,760 M 150,725 L 220,725', strokeWidth: 4 },
      // Right Front Wheel & Rim
      { id: 'wheel-r-tire', d: 'M 840,560 C 890,560 920,640 920,740 C 920,840 880,900 800,900 C 740,900 710,840 710,740 C 710,640 760,560 840,560 Z', strokeWidth: 5 },
      { id: 'wheel-r-rim', d: 'M 815,670 A 55,55 0 1 0 815,780 A 55,55 0 1 0 815,670 Z', strokeWidth: 4 },
      { id: 'wheel-r-spokes', d: 'M 815,690 L 815,760 M 780,725 L 850,725', strokeWidth: 4 },
      // Road Base
      { id: 'road', d: 'M 50,900 L 950,900 L 980,960 L 20,960 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'realistic-castle',
    name: 'Enchanted Kingdom Castle',
    category: 'nature',
    difficulty: 'Detailed',
    viewBox: '0 0 1000 1000',
    paths: [
      // Mountains in Background
      { id: 'mtn-back-l', d: 'M 50,650 L 240,250 L 450,650 Z', strokeWidth: 4 },
      { id: 'mtn-back-r', d: 'M 550,650 L 780,220 L 950,650 Z', strokeWidth: 4 },
      { id: 'mtn-snow-l', d: 'M 240,250 L 200,330 L 230,310 L 250,340 L 280,320 Z', strokeWidth: 3 },
      { id: 'mtn-snow-r', d: 'M 780,220 L 740,300 L 770,280 L 800,310 L 820,290 Z', strokeWidth: 3 },
      // Central Keep Tower
      { id: 'keep-roof', d: 'M 500,80 L 420,260 L 580,260 Z', strokeWidth: 5 },
      { id: 'keep-flag', d: 'M 500,80 L 500,20 L 560,50 L 500,70', strokeWidth: 3 },
      { id: 'keep-walls', d: 'M 430,260 L 570,260 L 580,500 L 420,500 Z', strokeWidth: 5 },
      { id: 'keep-window-top', d: 'M 480,310 C 480,285 520,285 520,310 L 520,370 L 480,370 Z', strokeWidth: 3 },
      { id: 'keep-window-bot', d: 'M 480,410 C 480,385 520,385 520,410 L 520,470 L 480,470 Z', strokeWidth: 3 },
      // Left Spire Tower
      { id: 'spire-l-roof', d: 'M 250,180 L 190,340 L 310,340 Z', strokeWidth: 5 },
      { id: 'spire-l-flag', d: 'M 250,180 L 250,120 L 295,150 L 250,170', strokeWidth: 3 },
      { id: 'spire-l-walls', d: 'M 200,340 L 300,340 L 310,650 L 190,650 Z', strokeWidth: 5 },
      { id: 'spire-l-window', d: 'M 235,420 C 235,395 265,395 265,420 L 265,480 L 235,480 Z', strokeWidth: 3 },
      // Right Spire Tower
      { id: 'spire-r-roof', d: 'M 750,180 L 690,340 L 810,340 Z', strokeWidth: 5 },
      { id: 'spire-r-flag', d: 'M 750,180 L 750,120 L 795,150 L 750,170', strokeWidth: 3 },
      { id: 'spire-r-walls', d: 'M 700,340 L 800,340 L 810,650 L 690,650 Z', strokeWidth: 5 },
      { id: 'spire-r-window', d: 'M 735,420 C 735,395 765,395 765,420 L 765,480 L 735,480 Z', strokeWidth: 3 },
      // Castle Ramparts & Gatehouse
      { id: 'ramparts-main', d: 'M 300,500 L 700,500 L 720,750 L 280,750 Z', strokeWidth: 5 },
      { id: 'battlement-1', d: 'M 330,470 L 360,470 L 360,500 L 330,500 Z', strokeWidth: 3 },
      { id: 'battlement-2', d: 'M 400,470 L 430,470 L 430,500 L 400,500 Z', strokeWidth: 3 },
      { id: 'battlement-3', d: 'M 570,470 L 600,470 L 600,500 L 570,500 Z', strokeWidth: 3 },
      { id: 'battlement-4', d: 'M 640,470 L 670,470 L 670,500 L 640,500 Z', strokeWidth: 3 },
      // Castle Gate / Portcullis
      { id: 'gate-arch', d: 'M 440,750 L 440,620 C 440,560 560,560 560,620 L 560,750 Z', strokeWidth: 5 },
      { id: 'portcullis-bars', d: 'M 470,580 L 470,750 M 500,570 L 500,750 M 530,580 L 530,750 M 440,640 L 560,640 M 440,690 L 560,690', strokeWidth: 3 },
      // Stone Moat & Bridge
      { id: 'moat-bridge', d: 'M 400,750 L 600,750 L 640,920 L 360,920 Z', strokeWidth: 5 },
      { id: 'moat-water', d: 'M 50,750 L 360,920 L 640,920 L 950,750 L 980,950 L 20,950 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'realistic-butterfly',
    name: 'Monarch Butterfly & Blooms',
    category: 'plant',
    difficulty: 'Detailed',
    viewBox: '0 0 1000 1000',
    paths: [
      // Butterfly Body
      { id: 'bf-head', d: 'M 500,200 A 25,25 0 1 0 500,250 A 25,25 0 1 0 500,200 Z', strokeWidth: 4 },
      { id: 'bf-antenna-l', d: 'M 485,205 C 440,150 400,120 380,140', strokeWidth: 3 },
      { id: 'bf-antenna-r', d: 'M 515,205 C 560,150 600,120 620,140', strokeWidth: 3 },
      { id: 'bf-thorax', d: 'M 485,250 C 470,300 470,360 485,410 C 500,415 515,410 515,410 C 530,360 530,300 515,250 Z', strokeWidth: 4 },
      { id: 'bf-abdomen', d: 'M 485,410 C 475,480 480,560 500,600 C 520,560 525,480 515,410 Z', strokeWidth: 4 },
      // Top Left Wing - Main Outline
      { id: 'wing-tl-outer', d: 'M 480,260 C 350,150 120,180 80,320 C 50,440 200,520 475,440 Z', strokeWidth: 5 },
      // Top Left Wing - Interior Cells
      { id: 'wing-tl-cell-1', d: 'M 450,280 C 360,220 220,240 180,310 C 240,360 380,360 450,330 Z', strokeWidth: 3 },
      { id: 'wing-tl-cell-2', d: 'M 180,310 C 130,340 120,400 160,430 C 220,440 320,410 450,350 Z', strokeWidth: 3 },
      { id: 'wing-tl-cell-3', d: 'M 160,430 C 190,470 280,480 380,460 C 440,440 465,430 465,410 Z', strokeWidth: 3 },
      // Top Right Wing - Main Outline
      { id: 'wing-tr-outer', d: 'M 520,260 C 650,150 880,180 920,320 C 950,440 800,520 525,440 Z', strokeWidth: 5 },
      // Top Right Wing - Interior Cells
      { id: 'wing-tr-cell-1', d: 'M 550,280 C 640,220 780,240 820,310 C 760,360 620,360 550,330 Z', strokeWidth: 3 },
      { id: 'wing-tr-cell-2', d: 'M 820,310 C 870,340 880,400 840,430 C 780,440 680,410 550,350 Z', strokeWidth: 3 },
      { id: 'wing-tr-cell-3', d: 'M 840,430 C 810,470 720,480 620,460 C 560,440 535,430 535,410 Z', strokeWidth: 3 },
      // Bottom Left Wing
      { id: 'wing-bl-outer', d: 'M 480,440 C 350,460 220,550 260,680 C 300,780 440,750 490,560 Z', strokeWidth: 5 },
      { id: 'wing-bl-cell-1', d: 'M 460,470 C 360,500 290,570 310,650 C 370,680 440,640 470,550 Z', strokeWidth: 3 },
      { id: 'wing-bl-cell-2', d: 'M 310,650 C 340,720 400,730 440,700 C 460,670 470,610 470,550 Z', strokeWidth: 3 },
      // Bottom Right Wing
      { id: 'wing-br-outer', d: 'M 520,440 C 650,460 780,550 740,680 C 700,780 560,750 510,560 Z', strokeWidth: 5 },
      { id: 'wing-br-cell-1', d: 'M 540,470 C 640,500 710,570 690,650 C 630,680 560,640 530,550 Z', strokeWidth: 3 },
      { id: 'wing-br-cell-2', d: 'M 690,650 C 660,720 600,730 560,700 C 540,670 530,610 530,550 Z', strokeWidth: 3 },
      // Flowers & Foliage Base
      { id: 'flower-stem', d: 'M 500,820 L 500,980', strokeWidth: 8 },
      { id: 'flower-center', d: 'M 500,760 A 50,50 0 1 0 500,860 A 50,50 0 1 0 500,760 Z', strokeWidth: 4 },
      { id: 'petal-1', d: 'M 500,760 C 460,690 540,690 500,760 Z', strokeWidth: 4 },
      { id: 'petal-2', d: 'M 550,810 C 620,770 620,850 550,810 Z', strokeWidth: 4 },
      { id: 'petal-3', d: 'M 500,860 C 540,930 460,930 500,860 Z', strokeWidth: 4 },
      { id: 'petal-4', d: 'M 450,810 C 380,850 380,770 450,810 Z', strokeWidth: 4 },
      { id: 'leaf-l', d: 'M 500,900 C 380,880 320,950 380,970 C 440,990 480,940 500,900 Z', strokeWidth: 4 },
      { id: 'leaf-r', d: 'M 500,920 C 620,900 680,970 620,990 C 560,1010 520,960 500,920 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'realistic-dino',
    name: 'Majestic Jungle T-Rex',
    category: 'animal',
    difficulty: 'Detailed',
    viewBox: '0 0 1000 1000',
    paths: [
      // Giant Head & Snout
      { id: 'trex-head-top', d: 'M 420,150 C 560,120 720,150 780,240 C 740,280 620,290 550,290 L 460,330 C 400,280 380,200 420,150 Z', strokeWidth: 5 },
      { id: 'trex-eye-ridge', d: 'M 520,190 C 560,165 600,175 610,210 C 570,225 530,220 520,190 Z', strokeWidth: 4 },
      { id: 'trex-eye', d: 'M 560,185 A 12,12 0 1 0 560,209 A 12,12 0 1 0 560,185 Z', strokeWidth: 2 },
      { id: 'trex-nostril', d: 'M 720,210 A 8,10 0 1 0 720,230 A 8,10 0 1 0 720,210 Z', strokeWidth: 2 },
      // Upper Teeth
      { id: 'trex-teeth-top', d: 'M 760,250 L 745,280 L 730,255 L 715,285 L 700,260 L 685,290 L 670,265 L 655,290 L 640,265', strokeWidth: 3 },
      // Lower Jaw
      { id: 'trex-jaw-lower', d: 'M 550,330 L 760,320 C 760,370 700,410 600,410 C 520,410 470,370 460,330 Z', strokeWidth: 5 },
      { id: 'trex-teeth-bot', d: 'M 740,320 L 730,295 L 715,320 L 700,295 L 685,320 L 670,295 L 655,320', strokeWidth: 3 },
      // Powerful Neck
      { id: 'trex-neck-top', d: 'M 420,150 C 320,180 240,260 220,380 L 360,440 C 370,350 400,280 460,330 Z', strokeWidth: 5 },
      { id: 'trex-neck-throat', d: 'M 460,330 C 420,440 380,500 350,560 L 460,580 C 480,500 500,430 550,330 Z', strokeWidth: 4 },
      // Muscular Torso & Flank
      { id: 'trex-torso', d: 'M 220,380 C 180,480 180,620 250,720 C 350,740 450,680 460,580 C 380,520 350,440 360,440 Z', strokeWidth: 5 },
      // Tiny Arms
      { id: 'trex-arm', d: 'M 420,530 C 460,530 480,570 470,600 L 490,610 L 460,620 L 440,580 Z', strokeWidth: 4 },
      // Massive Leg & Thigh
      { id: 'trex-thigh', d: 'M 250,600 C 320,580 400,640 410,750 C 380,840 280,850 230,760 C 210,700 220,640 250,600 Z', strokeWidth: 5 },
      { id: 'trex-shin', d: 'M 320,800 L 350,910 L 300,910 L 280,820 Z', strokeWidth: 4 },
      { id: 'trex-foot-claws', d: 'M 280,910 L 260,950 L 310,950 L 350,960 L 390,950 L 350,910 Z', strokeWidth: 5 },
      // Long Powerful Tail
      { id: 'trex-tail', d: 'M 180,480 C 100,500 50,560 30,640 C 60,660 140,680 230,720 Z', strokeWidth: 5 },
      // Jungle Ferns & Ground
      { id: 'jungle-ground', d: 'M 50,950 L 950,950 L 980,990 L 20,990 Z', strokeWidth: 5 },
      { id: 'jungle-fern-l', d: 'M 100,950 C 80,850 160,820 220,880 C 180,920 140,940 100,950 Z', strokeWidth: 4 },
      { id: 'jungle-fern-r', d: 'M 850,950 C 800,820 680,800 620,880 C 700,920 780,940 850,950 Z', strokeWidth: 4 },
      { id: 'volcano-back', d: 'M 650,950 L 800,600 L 840,600 L 950,950 Z', strokeWidth: 4 },
      { id: 'volcano-smoke', d: 'M 820,600 C 800,520 860,450 830,360 C 870,400 900,500 840,600 Z', strokeWidth: 3 }
    ]
  },
  {
    id: 'realistic-astronaut',
    name: 'Astronaut in Deep Space',
    category: 'space',
    difficulty: 'Detailed',
    viewBox: '0 0 1000 1000',
    paths: [
      // Helmet Bubble Outer
      { id: 'helmet-outer', d: 'M 500,160 C 380,160 350,260 350,360 C 350,460 390,520 500,520 C 610,520 650,460 650,360 C 650,260 620,160 500,160 Z', strokeWidth: 5 },
      // Golden Visor & Reflection
      { id: 'visor-glass', d: 'M 500,210 C 410,210 390,280 390,360 C 390,440 420,480 500,480 C 580,480 610,440 610,360 C 610,280 590,210 500,210 Z', strokeWidth: 4 },
      { id: 'visor-reflection-earth', d: 'M 430,260 A 35,35 0 1 0 430,330 A 35,35 0 1 0 430,260 Z', strokeWidth: 3 },
      { id: 'visor-reflection-streak', d: 'M 480,240 C 550,250 580,300 580,360', strokeWidth: 3 },
      // Helmet Neck Collar Ring
      { id: 'helmet-collar', d: 'M 360,510 L 640,510 L 650,560 L 350,560 Z', strokeWidth: 4 },
      // Spacesuit Torso & Chest Pack
      { id: 'suit-torso', d: 'M 350,560 C 300,620 280,740 300,850 L 700,850 C 720,740 700,620 650,560 Z', strokeWidth: 5 },
      { id: 'chest-pack', d: 'M 420,600 L 580,600 L 580,760 L 420,760 Z', strokeWidth: 4 },
      { id: 'chest-control-1', d: 'M 450,630 A 15,15 0 1 0 450,660 A 15,15 0 1 0 450,630 Z', strokeWidth: 3 },
      { id: 'chest-control-2', d: 'M 550,630 A 15,15 0 1 0 550,660 A 15,15 0 1 0 550,630 Z', strokeWidth: 3 },
      { id: 'chest-display', d: 'M 450,690 L 550,690 L 550,740 L 450,740 Z', strokeWidth: 3 },
      // Left Arm & Glove
      { id: 'arm-l', d: 'M 320,580 C 220,620 160,700 180,820 L 250,820 C 230,730 280,670 340,640 Z', strokeWidth: 4 },
      { id: 'glove-l', d: 'M 180,820 C 150,840 140,900 180,940 C 230,940 250,880 250,820 Z', strokeWidth: 4 },
      // Right Arm & Glove
      { id: 'arm-r', d: 'M 680,580 C 780,620 840,700 820,820 L 750,820 C 770,730 720,670 660,640 Z', strokeWidth: 4 },
      { id: 'glove-r', d: 'M 820,820 C 850,840 860,900 820,940 C 770,940 750,880 750,820 Z', strokeWidth: 4 },
      // Life Support Backpack
      { id: 'backpack-l', d: 'M 270,540 L 350,540 L 330,800 L 250,800 Z', strokeWidth: 4 },
      { id: 'backpack-r', d: 'M 730,540 L 650,540 L 670,800 L 750,800 Z', strokeWidth: 4 },
      // Celestial Background (Moon & Saturn)
      { id: 'moon-surface', d: 'M 50,880 C 350,820 650,820 950,880 L 980,990 L 20,990 Z', strokeWidth: 5 },
      { id: 'moon-crater-1', d: 'M 200,890 A 40,20 0 1 0 200,930 A 40,20 0 1 0 200,890 Z', strokeWidth: 3 },
      { id: 'moon-crater-2', d: 'M 780,890 A 50,25 0 1 0 780,940 A 50,25 0 1 0 780,890 Z', strokeWidth: 3 },
      { id: 'saturn-body', d: 'M 820,150 A 45,45 0 1 0 820,240 A 45,45 0 1 0 820,150 Z', strokeWidth: 4 },
      { id: 'saturn-rings', d: 'M 730,195 C 750,160 890,160 910,195 C 890,230 750,230 730,195 Z', strokeWidth: 4 },
      { id: 'star-1', d: 'M 150,180 L 155,200 L 175,205 L 155,210 L 150,230 L 145,210 L 125,205 L 145,200 Z', strokeWidth: 3 },
      { id: 'star-2', d: 'M 250,320 L 253,335 L 268,338 L 253,342 L 250,355 L 247,342 L 232,338 L 247,335 Z', strokeWidth: 2 }
    ]
  }
];
