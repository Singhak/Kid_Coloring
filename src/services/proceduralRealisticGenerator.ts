/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SvgPath } from '../types';

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Procedural Realistic Vector Scene Generator
 * Generates realistic, highly detailed multi-part coloring drawings 100% offline without requiring AI APIs.
 */
export function generateProceduralRealisticScene(category: string): { paths: SvgPath[]; viewBox: string; name: string } {
  let cat = category.toLowerCase();
  if (cat === 'random') {
    cat = pick(['animal', 'vehicles', 'nature', 'plant', 'space']);
  }

  switch (cat) {
    case 'vehicles':
      return generateRealisticVehicleScene();
    case 'nature':
      return generateRealisticNatureScene();
    case 'plant':
      return generateRealisticBotanicalScene();
    case 'space':
      return generateRealisticSpaceScene();
    case 'animal':
    default:
      return generateRealisticAnimalScene();
  }
}

// ----------------------------------------------------------------------
// 1. REALISTIC ANIMAL GENERATOR (Safari Lion / Golden Puppy / Wild Eagle)
// ----------------------------------------------------------------------
function generateRealisticAnimalScene(): { paths: SvgPath[]; viewBox: string; name: string } {
  const paths: SvgPath[] = [];
  const variant = rnd(1, 3);

  if (variant === 1) {
    // Dynamic Safari Lion with randomized mane style & backdrop
    const maneLayers = rnd(12, 18);
    const maneSpread = rnd(380, 440);
    const eyeTilt = rnd(-5, 5);

    // Background Savannah Sun & Horizon
    paths.push({
      id: 'sun-bg',
      d: `M 500,${rnd(180, 240)} A ${rnd(100, 140)},${rnd(100, 140)} 0 1 0 500,${rnd(180, 240) + 1} Z`,
      stroke: '#2D3436',
      strokeWidth: 4,
      fill: '#FFFFFF'
    });

    // Outer Mane Clusters
    let manePath = 'M 500,60 ';
    for (let i = 0; i < maneLayers; i++) {
      const angle = (i / maneLayers) * Math.PI * 2;
      const nextAngle = ((i + 1) / maneLayers) * Math.PI * 2;
      const rOuter = maneSpread + rnd(-30, 40);
      const rInner = maneSpread - rnd(40, 70);

      const midAngle = (angle + nextAngle) / 2;
      const cx1 = 500 + Math.sin(angle) * rInner;
      const cy1 = 500 + Math.cos(angle) * rInner;
      const cx2 = 500 + Math.sin(midAngle) * rOuter;
      const cy2 = 500 + Math.cos(midAngle) * rOuter;
      const ex = 500 + Math.sin(nextAngle) * rInner;
      const ey = 500 + Math.cos(nextAngle) * rInner;

      manePath += `C ${cx1},${cy1} ${cx2},${cy2} ${ex},${ey} `;
    }
    manePath += 'Z';
    paths.push({ id: 'mane-outer', d: manePath, stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });

    // Inner Layered Mane Highlights
    paths.push({
      id: 'mane-inner-l',
      d: 'M 410,240 C 340,320 310,440 340,560 C 320,640 350,740 430,800 C 370,760 330,660 350,540 C 320,440 360,320 410,240 Z',
      stroke: '#2D3436',
      strokeWidth: 4,
      fill: '#FFFFFF'
    });
    paths.push({
      id: 'mane-inner-r',
      d: 'M 590,240 C 660,320 690,440 660,560 C 680,640 650,740 570,800 C 630,760 670,660 650,540 C 680,440 640,320 590,240 Z',
      stroke: '#2D3436',
      strokeWidth: 4,
      fill: '#FFFFFF'
    });

    // Ears
    paths.push({ id: 'ear-l-out', d: 'M 350,260 C 310,230 280,280 310,340 C 330,320 350,290 350,260 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
    paths.push({ id: 'ear-l-in', d: 'M 340,275 C 315,255 295,290 315,325 C 325,310 335,295 340,275 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
    paths.push({ id: 'ear-r-out', d: 'M 650,260 C 690,230 720,280 690,340 C 670,320 650,290 650,260 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
    paths.push({ id: 'ear-r-in', d: 'M 660,275 C 685,255 705,290 685,325 C 675,310 665,295 660,275 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

    // Face & Forehead Contour
    paths.push({ id: 'forehead', d: 'M 390,340 C 440,310 560,310 610,340 C 590,400 570,440 500,440 C 430,440 410,400 390,340 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'brow-l', d: 'M 440,340 C 450,370 450,400 440,420 C 430,400 430,370 440,340 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
    paths.push({ id: 'brow-r', d: 'M 560,340 C 550,370 550,400 560,420 C 570,400 570,370 560,340 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

    // Cheeks
    paths.push({ id: 'cheek-l', d: 'M 390,340 C 360,420 360,520 410,580 C 420,530 430,480 440,450 C 410,420 395,380 390,340 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'cheek-r', d: 'M 610,340 C 640,420 640,520 590,580 C 580,530 570,480 560,450 C 590,420 605,380 610,340 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

    // Eyes
    paths.push({ id: 'eye-l-socket', d: `M 405,${450 + eyeTilt} C 435,${430 + eyeTilt} 465,${440 + eyeTilt} 475,${470 + eyeTilt} C 445,${485 + eyeTilt} 420,${475 + eyeTilt} 405,${450 + eyeTilt} Z`, stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'eye-l-pupil', d: `M 440,${452 + eyeTilt} A 13,13 0 1 0 440,478 A 13,13 0 1 0 440,452 Z`, stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
    paths.push({ id: 'eye-r-socket', d: `M 595,${450 + eyeTilt} C 565,${430 + eyeTilt} 535,${440 + eyeTilt} 525,${470 + eyeTilt} C 555,${485 + eyeTilt} 580,${475 + eyeTilt} 595,${450 + eyeTilt} Z`, stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'eye-r-pupil', d: `M 560,${452 + eyeTilt} A 13,13 0 1 0 560,478 A 13,13 0 1 0 560,452 Z`, stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

    // Nose & Muzzle
    paths.push({ id: 'nose-bridge', d: 'M 470,450 L 530,450 L 540,550 L 460,550 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
    paths.push({ id: 'nose-tip', d: 'M 455,550 C 475,535 525,535 545,550 C 555,580 525,605 500,605 C 475,605 445,580 455,550 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'muzzle-l', d: 'M 500,605 C 460,605 420,620 425,675 C 445,710 485,705 500,680 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'muzzle-r', d: 'M 500,605 C 540,605 580,620 575,675 C 555,710 515,705 500,680 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

    // Chin & Chest Mane
    paths.push({ id: 'chin', d: 'M 460,690 C 475,685 525,685 540,690 C 545,735 525,770 500,770 C 475,770 455,735 460,690 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'chest-c', d: 'M 500,770 C 440,800 430,880 500,940 C 570,880 560,800 500,770 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'chest-l', d: 'M 440,800 C 370,830 360,910 430,960 C 470,930 460,860 440,800 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'chest-r', d: 'M 560,800 C 630,830 640,910 570,960 C 530,930 540,860 560,800 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

    // Savannah Grass Blades Base
    paths.push({ id: 'grass-l1', d: 'M 100,980 C 140,880 180,860 220,980 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'grass-r1', d: 'M 780,980 C 820,880 860,860 900,980 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

    return { paths, viewBox: '0 0 1000 1000', name: 'Majestic Royal Lion' };
  } else {
    // Playful Puppy with dynamic accessories & ears
    const earLength = rnd(400, 500);
    const collarColorStyle = rnd(1, 2);

    paths.push({ id: 'head-dome', d: 'M 350,220 C 420,170 580,170 650,220 C 690,300 690,410 640,480 C 580,490 420,490 360,480 C 310,410 310,300 350,220 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });

    // Ears with dynamic drop
    paths.push({ id: 'ear-left', d: `M 350,220 C 250,220 190,320 210,${earLength} C 230,${earLength + 80} 290,${earLength + 100} 320,${earLength + 30} C 340,360 340,280 350,220 Z`, stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
    paths.push({ id: 'ear-left-in', d: `M 235,${earLength - 20} C 225,360 275,270 325,250 C 315,330 305,420 295,480 C 265,490 245,470 235,${earLength - 20} Z`, stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
    paths.push({ id: 'ear-right', d: `M 650,220 C 750,220 810,320 790,${earLength} C 770,${earLength + 80} 710,${earLength + 100} 680,${earLength + 30} C 660,360 660,280 650,220 Z`, stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
    paths.push({ id: 'ear-right-in', d: `M 765,${earLength - 20} C 775,360 725,270 675,250 C 685,330 695,420 705,480 C 735,490 755,470 765,${earLength - 20} Z`, stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

    // Puppy Eyes & Nose
    paths.push({ id: 'eye-l-socket', d: 'M 400,330 A 28,32 0 1 0 400,394 A 28,32 0 1 0 400,330 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'eye-l-pupil', d: 'M 400,342 A 16,18 0 1 0 400,378 A 16,18 0 1 0 400,342 Z', stroke: '#2D3436', strokeWidth: 2, fill: '#FFFFFF' });
    paths.push({ id: 'eye-r-socket', d: 'M 600,330 A 28,32 0 1 0 600,394 A 28,32 0 1 0 600,330 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'eye-r-pupil', d: 'M 600,342 A 16,18 0 1 0 600,378 A 16,18 0 1 0 600,342 Z', stroke: '#2D3436', strokeWidth: 2, fill: '#FFFFFF' });

    paths.push({ id: 'muzzle-base', d: 'M 440,400 C 470,390 530,390 560,400 C 600,450 590,540 500,550 C 410,540 400,450 440,400 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'nose', d: 'M 470,430 C 485,420 515,420 530,430 C 545,455 525,480 500,480 C 475,480 455,455 470,430 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'tongue', d: 'M 480,500 C 480,550 520,550 520,500 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

    // Collar & Body
    paths.push({ id: 'collar', d: 'M 360,570 C 440,610 560,610 640,570 L 650,620 C 560,660 440,660 350,620 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'bell', d: 'M 500,630 A 25,25 0 1 0 500,680 A 25,25 0 1 0 500,630 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
    paths.push({ id: 'body', d: 'M 370,620 C 340,690 320,800 360,920 L 640,920 C 680,800 660,690 630,620 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
    paths.push({ id: 'paw-l', d: 'M 350,820 C 330,860 330,940 400,940 C 440,940 450,880 440,820 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'paw-r', d: 'M 560,820 C 550,880 560,940 600,940 C 670,940 670,860 650,820 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
    paths.push({ id: 'tail', d: 'M 650,750 C 750,720 820,680 830,620 C 810,640 760,700 660,780 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

    return { paths, viewBox: '0 0 1000 1000', name: 'Playful Golden Puppy' };
  }
}

// ----------------------------------------------------------------------
// 2. REALISTIC VEHICLES GENERATOR (GT Supercar / Turbo Racecar)
// ----------------------------------------------------------------------
function generateRealisticVehicleScene(): { paths: SvgPath[]; viewBox: string; name: string } {
  const paths: SvgPath[] = [];
  const roofHeight = rnd(300, 350);
  const spoilerHeight = rnd(260, 310);
  const rimSpokeCount = rnd(5, 7);

  // Aerodynamic Roof & Windshield
  paths.push({ id: 'roof', d: `M 360,${roofHeight} C 440,${roofHeight - 40} 580,${roofHeight - 40} 660,${roofHeight} L 750,440 L 250,440 Z`, stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'windshield', d: `M 380,${roofHeight + 5} C 440,${roofHeight - 25} 560,${roofHeight - 25} 620,${roofHeight + 5} L 720,430 L 280,430 Z`, stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'win-l', d: `M 290,${roofHeight + 30} L 370,${roofHeight + 10} L 360,420 L 270,420 Z`, stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'win-r', d: `M 710,${roofHeight + 30} L 630,${roofHeight + 10} L 640,420 L 730,420 Z`, stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  // Racing Rear Spoiler
  paths.push({ id: 'spoiler-wing', d: `M 220,${spoilerHeight} L 780,${spoilerHeight} L 770,${spoilerHeight + 30} L 230,${spoilerHeight + 30} Z`, stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'spoiler-strut-l', d: `M 280,${spoilerHeight + 30} L 300,440 L 320,440 L 300,${spoilerHeight + 30} Z`, stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'spoiler-strut-r', d: `M 720,${spoilerHeight + 30} L 700,440 L 680,440 L 700,${spoilerHeight + 30} Z`, stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  // Hood & Racing Stripes
  paths.push({ id: 'hood', d: 'M 250,440 L 750,440 L 820,540 L 180,540 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'hood-vent-l', d: 'M 320,460 L 420,460 L 400,500 L 340,500 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'hood-vent-r', d: 'M 680,460 L 580,460 L 600,500 L 660,500 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'stripe-l', d: 'M 470,310 L 490,310 L 490,540 L 470,540 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'stripe-r', d: 'M 510,310 L 530,310 L 530,540 L 510,540 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  // Headlamps & Aero Grille
  paths.push({ id: 'headlamp-l', d: 'M 200,500 L 300,500 L 280,535 L 185,530 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'headlamp-r', d: 'M 800,500 L 700,500 L 720,535 L 815,530 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'grille-center', d: 'M 350,540 L 650,540 L 680,620 L 320,620 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'front-splitter', d: 'M 140,620 L 860,620 L 890,660 L 110,660 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });

  // Wheels & Rims
  paths.push({ id: 'wheel-l-tire', d: 'M 160,560 C 110,560 80,640 80,740 C 80,840 120,900 200,900 C 260,900 290,840 290,740 C 290,640 240,560 160,560 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'wheel-l-rim', d: 'M 185,670 A 55,55 0 1 0 185,780 A 55,55 0 1 0 185,670 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'wheel-r-tire', d: 'M 840,560 C 890,560 920,640 920,740 C 920,840 880,900 800,900 C 740,900 710,840 710,740 C 710,640 760,560 840,560 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'wheel-r-rim', d: 'M 815,670 A 55,55 0 1 0 815,780 A 55,55 0 1 0 815,670 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

  // Road
  paths.push({ id: 'road-pavement', d: 'M 40,900 L 960,900 L 980,960 L 20,960 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });

  return { paths, viewBox: '0 0 1000 1000', name: 'Supersonic Turbo Racecar' };
}

// ----------------------------------------------------------------------
// 3. REALISTIC NATURE & CASTLE GENERATOR
// ----------------------------------------------------------------------
function generateRealisticNatureScene(): { paths: SvgPath[]; viewBox: string; name: string } {
  const paths: SvgPath[] = [];
  const towerCount = rnd(3, 5);
  const mtnPeakL = rnd(200, 280);
  const mtnPeakR = rnd(720, 800);

  // Distant Mountain Ranges
  paths.push({ id: 'mountain-l', d: `M 40,650 L ${mtnPeakL},${rnd(180, 240)} L 480,650 Z`, stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'mountain-r', d: `M 520,650 L ${mtnPeakR},${rnd(160, 220)} L 960,650 Z`, stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'snowcap-l', d: `M ${mtnPeakL},${rnd(180, 240)} L ${mtnPeakL - 40},320 L ${mtnPeakL - 10},300 L ${mtnPeakL + 20},330 L ${mtnPeakL + 50},310 Z`, stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'snowcap-r', d: `M ${mtnPeakR},${rnd(160, 220)} L ${mtnPeakR - 40},300 L ${mtnPeakR - 10},280 L ${mtnPeakR + 20},310 L ${mtnPeakR + 50},290 Z`, stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  // Central Keep Tower
  paths.push({ id: 'keep-roof', d: 'M 500,70 L 420,250 L 580,250 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'keep-flag', d: 'M 500,70 L 500,10 L 560,40 L 500,60', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'keep-walls', d: 'M 430,250 L 570,250 L 580,500 L 420,500 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'keep-win-1', d: 'M 480,300 C 480,275 520,275 520,300 L 520,360 L 480,360 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'keep-win-2', d: 'M 480,400 C 480,375 520,375 520,400 L 520,460 L 480,460 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  // Left & Right Spires
  paths.push({ id: 'spire-l-roof', d: 'M 250,170 L 190,330 L 310,330 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'spire-l-flag', d: 'M 250,170 L 250,110 L 295,140 L 250,160', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'spire-l-walls', d: 'M 200,330 L 300,330 L 310,650 L 190,650 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'spire-l-win', d: 'M 235,410 C 235,385 265,385 265,410 L 265,470 L 235,470 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  paths.push({ id: 'spire-r-roof', d: 'M 750,170 L 690,330 L 810,330 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'spire-r-flag', d: 'M 750,170 L 750,110 L 795,140 L 750,160', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'spire-r-walls', d: 'M 700,330 L 800,330 L 810,650 L 690,650 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'spire-r-win', d: 'M 735,410 C 735,385 765,385 765,410 L 765,470 L 735,470 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  // Ramparts & Gate
  paths.push({ id: 'ramparts-main', d: 'M 300,500 L 700,500 L 720,750 L 280,750 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'gate-arch', d: 'M 440,750 L 440,620 C 440,560 560,560 560,620 L 560,750 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });

  // Stone Moat & Bridge
  paths.push({ id: 'moat-bridge', d: 'M 400,750 L 600,750 L 640,920 L 360,920 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'moat-water', d: 'M 50,750 L 360,920 L 640,920 L 950,750 L 980,950 L 20,950 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

  return { paths, viewBox: '0 0 1000 1000', name: 'Enchanted Kingdom Castle' };
}

// ----------------------------------------------------------------------
// 4. REALISTIC BOTANICAL & BUTTERFLY GENERATOR
// ----------------------------------------------------------------------
function generateRealisticBotanicalScene(): { paths: SvgPath[]; viewBox: string; name: string } {
  const paths: SvgPath[] = [];

  // Butterfly Body & Antennae
  paths.push({ id: 'bf-head', d: 'M 500,190 A 24,24 0 1 0 500,238 A 24,24 0 1 0 500,190 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'ant-l', d: 'M 485,195 C 440,140 400,110 380,130', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'ant-r', d: 'M 515,195 C 560,140 600,110 620,130', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'bf-thorax', d: 'M 485,238 C 470,290 470,350 485,400 C 500,405 515,400 515,400 C 530,350 530,290 515,238 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'bf-abdomen', d: 'M 485,400 C 475,470 480,550 500,590 C 520,550 525,470 515,400 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

  // Top Left Wing & Multi-cells
  paths.push({ id: 'wing-tl-out', d: 'M 480,250 C 350,140 120,170 80,310 C 50,430 200,510 475,430 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'wing-tl-c1', d: 'M 450,270 C 360,210 220,230 180,300 C 240,350 380,350 450,320 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'wing-tl-c2', d: 'M 180,300 C 130,330 120,390 160,420 C 220,430 320,400 450,340 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'wing-tl-c3', d: 'M 160,420 C 190,460 280,470 380,450 C 440,430 465,420 465,400 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  // Top Right Wing & Multi-cells
  paths.push({ id: 'wing-tr-out', d: 'M 520,250 C 650,140 880,170 920,310 C 950,430 800,510 525,430 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'wing-tr-c1', d: 'M 550,270 C 640,210 780,230 820,300 C 760,350 620,350 550,320 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'wing-tr-c2', d: 'M 820,300 C 870,330 880,390 840,420 C 780,430 680,400 550,340 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'wing-tr-c3', d: 'M 840,420 C 810,460 720,470 620,450 C 560,430 535,420 535,400 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  // Bottom Wings
  paths.push({ id: 'wing-bl-out', d: 'M 480,430 C 350,450 220,540 260,670 C 300,770 440,740 490,550 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'wing-br-out', d: 'M 520,430 C 650,450 780,540 740,670 C 700,770 560,740 510,550 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });

  // Sunflower Center & Petals
  paths.push({ id: 'flower-stem', d: 'M 500,810 L 500,980', stroke: '#2D3436', strokeWidth: 8, fill: '#FFFFFF' });
  paths.push({ id: 'flower-center', d: 'M 500,750 A 48,48 0 1 0 500,846 A 48,48 0 1 0 500,750 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'petal-1', d: 'M 500,750 C 460,680 540,680 500,750 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'petal-2', d: 'M 550,800 C 620,760 620,840 550,800 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'petal-3', d: 'M 500,850 C 540,920 460,920 500,850 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'petal-4', d: 'M 450,800 C 380,840 380,760 450,800 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

  return { paths, viewBox: '0 0 1000 1000', name: 'Monarch Butterfly & Blooms' };
}

// ----------------------------------------------------------------------
// 5. REALISTIC SPACE GENERATOR (Astronaut & Moon Exploration)
// ----------------------------------------------------------------------
function generateRealisticSpaceScene(): { paths: SvgPath[]; viewBox: string; name: string } {
  const paths: SvgPath[] = [];

  // Helmet & Golden Visor
  paths.push({ id: 'helmet-out', d: 'M 500,150 C 380,150 350,250 350,350 C 350,450 390,510 500,510 C 610,510 650,450 650,350 C 650,250 620,150 500,150 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'visor-glass', d: 'M 500,200 C 410,200 390,270 390,350 C 390,430 420,470 500,470 C 580,470 610,430 610,350 C 610,270 590,200 500,200 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'visor-earth-refl', d: 'M 430,250 A 35,35 0 1 0 430,320 A 35,35 0 1 0 430,250 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  // Suit Collar & Chest Pack
  paths.push({ id: 'suit-collar', d: 'M 360,500 L 640,500 L 650,550 L 350,550 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'suit-torso', d: 'M 350,550 C 300,610 280,730 300,840 L 700,840 C 720,730 700,610 650,550 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'chest-pack', d: 'M 420,590 L 580,590 L 580,750 L 420,750 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'chest-dial-1', d: 'M 450,620 A 14,14 0 1 0 450,648 A 14,14 0 1 0 450,620 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'chest-dial-2', d: 'M 550,620 A 14,14 0 1 0 550,648 A 14,14 0 1 0 550,620 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });

  // Arms & Gloves
  paths.push({ id: 'arm-l', d: 'M 320,570 C 220,610 160,690 180,810 L 250,810 C 230,720 280,660 340,630 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'glove-l', d: 'M 180,810 C 150,830 140,890 180,930 C 230,930 250,870 250,810 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'arm-r', d: 'M 680,570 C 780,610 840,690 820,810 L 750,810 C 770,720 720,660 660,630 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'glove-r', d: 'M 820,810 C 850,830 860,890 820,930 C 770,930 750,870 750,810 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

  // Moon Surface & Saturn
  paths.push({ id: 'moon-surface', d: 'M 40,870 C 350,810 650,810 960,870 L 980,980 L 20,980 Z', stroke: '#2D3436', strokeWidth: 5, fill: '#FFFFFF' });
  paths.push({ id: 'crater-1', d: 'M 200,880 A 38,18 0 1 0 200,916 A 38,18 0 1 0 200,880 Z', stroke: '#2D3436', strokeWidth: 3, fill: '#FFFFFF' });
  paths.push({ id: 'saturn-globe', d: 'M 820,140 A 42,42 0 1 0 820,224 A 42,42 0 1 0 820,140 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });
  paths.push({ id: 'saturn-ring', d: 'M 730,182 C 750,150 890,150 910,182 C 890,214 750,214 730,182 Z', stroke: '#2D3436', strokeWidth: 4, fill: '#FFFFFF' });

  return { paths, viewBox: '0 0 1000 1000', name: 'Astronaut in Deep Space' };
}
