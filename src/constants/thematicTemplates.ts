/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Thematic Templates for Coloro (Nature, Space, Vehicles)
 */

import { Template } from '../types';

export const THEMATIC_TEMPLATES: Template[] = [
  // ==========================================
  // 1. SPACE TEMPLATES
  // ==========================================
  {
    id: 'space-alien-saucer',
    name: 'Friendly Alien in UFO',
    category: 'space',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      // Glass Dome
      { id: 'ufo-dome', d: 'M 320,440 C 320,240 680,240 680,440 Z', strokeWidth: 7 },
      // Alien Head & Eyes
      { id: 'al-head', d: 'M 420,380 C 420,280 580,280 580,380 C 580,430 420,430 420,380 Z', strokeWidth: 5 },
      { id: 'al-eye-1', d: 'M 450,340 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'al-eye-2', d: 'M 500,320 m -14,0 a 14,14 0 1,0 28,0 a 14,14 0 1,0 -28,0 Z', strokeWidth: 4 },
      { id: 'al-eye-3', d: 'M 550,340 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'al-antenna', d: 'M 500,280 L 500,220 M 500,220 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
      { id: 'al-smile', d: 'M 470,390 Q 500,415 530,390', strokeWidth: 4 },
      // Saucer Body Outer
      { id: 'ufo-saucer', d: 'M 140,520 C 140,420 860,420 860,520 C 860,620 140,620 140,520 Z', strokeWidth: 8 },
      // Saucer Rim Lights
      { id: 'ufo-light-1', d: 'M 240,520 m -22,0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0 Z', strokeWidth: 5 },
      { id: 'ufo-light-2', d: 'M 370,540 m -22,0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0 Z', strokeWidth: 5 },
      { id: 'ufo-light-3', d: 'M 500,550 m -22,0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0 Z', strokeWidth: 5 },
      { id: 'ufo-light-4', d: 'M 630,540 m -22,0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0 Z', strokeWidth: 5 },
      { id: 'ufo-light-5', d: 'M 760,520 m -22,0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0 Z', strokeWidth: 5 },
      // Beam Down
      { id: 'ufo-beam-l', d: 'M 360,620 L 220,880', strokeWidth: 6 },
      { id: 'ufo-beam-r', d: 'M 640,620 L 780,880', strokeWidth: 6 },
      { id: 'ufo-beam-base', d: 'M 220,880 C 340,940 660,940 780,880 Z', strokeWidth: 6 }
    ]
  },
  {
    id: 'space-satellite',
    name: 'Cosmic Orbital Satellite',
    category: 'space',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      // Central Satellite Core
      { id: 'sat-body', d: 'M 420,380 L 580,380 L 580,620 L 420,620 Z', strokeWidth: 7 },
      { id: 'sat-core-window', d: 'M 500,500 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z', strokeWidth: 5 },
      // Top Dish
      { id: 'sat-dish-arm', d: 'M 500,380 L 500,240', strokeWidth: 6 },
      { id: 'sat-dish', d: 'M 380,240 C 380,140 620,140 620,240 Z', strokeWidth: 7 },
      { id: 'sat-dish-tip', d: 'M 500,190 L 500,120 M 500,120 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z', strokeWidth: 5 },
      // Left Solar Wing
      { id: 'sat-arm-l', d: 'M 420,500 L 320,500', strokeWidth: 6 },
      { id: 'sat-wing-l', d: 'M 100,420 L 320,420 L 320,580 L 100,580 Z', strokeWidth: 6 },
      { id: 'sat-grid-l1', d: 'M 170,420 L 170,580 M 245,420 L 245,580 M 100,500 L 320,500', strokeWidth: 4 },
      // Right Solar Wing
      { id: 'sat-arm-r', d: 'M 580,500 L 680,500', strokeWidth: 6 },
      { id: 'sat-wing-r', d: 'M 680,420 L 900,420 L 900,580 L 680,580 Z', strokeWidth: 6 },
      { id: 'sat-grid-r1', d: 'M 755,420 L 755,580 M 830,420 L 830,580 M 680,500 L 900,500', strokeWidth: 4 },
      // Earth Arc & Stars
      { id: 'sat-earth-arc', d: 'M 100,900 C 400,760 700,760 900,900', strokeWidth: 6 },
      { id: 'sat-star-1', d: 'M 220,240 L 230,260 L 250,260 L 235,275 L 240,295 L 220,280 L 200,295 L 205,275 L 190,260 L 210,260 Z', strokeWidth: 3 },
      { id: 'sat-star-2', d: 'M 780,240 L 790,260 L 810,260 L 795,275 L 800,295 L 780,280 L 760,295 L 765,275 L 750,260 L 770,260 Z', strokeWidth: 3 }
    ]
  },
  {
    id: 'space-solar-system',
    name: 'Solar System & Planets',
    category: 'space',
    difficulty: 'Medium',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      // Central Smiling Sun
      { id: 'sol-sun', d: 'M 500,500 m -120,0 a 120,120 0 1,0 240,0 a 120,120 0 1,0 -240,0 Z', strokeWidth: 7 },
      { id: 'sol-ray-1', d: 'M 500,350 L 500,300 M 500,650 L 500,700 M 350,500 L 300,500 M 650,500 L 700,500', strokeWidth: 6 },
      { id: 'sol-ray-2', d: 'M 390,390 L 350,350 M 610,610 L 650,650 M 390,610 L 350,650 M 610,390 L 650,350', strokeWidth: 6 },
      { id: 'sol-eye-l', d: 'M 450,470 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'sol-eye-r', d: 'M 550,470 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
      { id: 'sol-smile', d: 'M 460,530 Q 500,570 540,530', strokeWidth: 5 },
      // Inner Orbit & Planet (Earth with Moon)
      { id: 'sol-orbit-1', d: 'M 200,500 A 300,300 0 1 0 800,500 A 300,300 0 1 0 200,500', strokeWidth: 3 },
      { id: 'sol-earth', d: 'M 240,400 m -45,0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0 Z', strokeWidth: 5 },
      { id: 'sol-earth-cont', d: 'M 220,390 C 230,370 260,380 250,410 C 230,430 210,410 220,390 Z', strokeWidth: 3 },
      // Outer Orbit & Saturn with Rings
      { id: 'sol-orbit-2', d: 'M 100,500 A 420,420 0 1 0 900,500 A 420,420 0 1 0 100,500', strokeWidth: 3 },
      { id: 'sol-saturn-body', d: 'M 760,680 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 6 },
      { id: 'sol-saturn-ring', d: 'M 640,680 C 660,620 860,620 880,680 C 860,740 660,740 640,680 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'space-blazing-comet',
    name: 'Blazing Shooting Comet',
    category: 'space',
    difficulty: 'Easy',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      // Comet Glowing Head
      { id: 'cmt-head', d: 'M 720,280 m -110,0 a 110,110 0 1,0 220,0 a 110,110 0 1,0 -220,0 Z', strokeWidth: 7 },
      { id: 'cmt-crater-1', d: 'M 670,240 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z', strokeWidth: 4 },
      { id: 'cmt-crater-2', d: 'M 760,320 m -18,0 a 18,18 0 1,0 36,0 a 18,18 0 1,0 -36,0 Z', strokeWidth: 4 },
      // Blazing Tail Ribbons
      { id: 'cmt-tail-top', d: 'M 640,210 C 480,180 280,240 100,200 C 260,280 440,270 590,260 Z', strokeWidth: 6 },
      { id: 'cmt-tail-mid', d: 'M 620,280 C 440,320 220,440 60,420 C 220,480 420,410 590,340 Z', strokeWidth: 6 },
      { id: 'cmt-tail-bot', d: 'M 640,360 C 480,450 320,640 120,680 C 300,680 460,540 600,420 Z', strokeWidth: 6 },
      // Background Star Constellations
      { id: 'cmt-star-1', d: 'M 240,780 L 250,810 L 280,810 L 255,830 L 265,860 L 240,840 L 215,860 L 225,830 L 200,810 L 230,810 Z', strokeWidth: 4 },
      { id: 'cmt-star-2', d: 'M 780,720 L 790,750 L 820,750 L 795,770 L 805,800 L 780,780 L 755,800 L 765,770 L 740,750 L 770,750 Z', strokeWidth: 4 }
    ]
  },
  {
    id: 'space-moon-rover',
    name: 'Lunar Moon Rover',
    category: 'space',
    difficulty: 'Medium',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      // Chassis & Cabin
      { id: 'rvr-cabin', d: 'M 320,480 L 680,480 L 660,640 L 280,640 Z', strokeWidth: 7 },
      { id: 'rvr-window', d: 'M 360,500 L 620,500 L 600,580 L 380,580 Z', strokeWidth: 5 },
      // Antenna & Camera Mast
      { id: 'rvr-mast', d: 'M 380,480 L 380,320', strokeWidth: 6 },
      { id: 'rvr-dish', d: 'M 330,320 C 330,260 430,260 430,320 Z', strokeWidth: 6 },
      { id: 'rvr-cam', d: 'M 560,480 L 560,360 L 620,360 L 620,400 L 560,400', strokeWidth: 5 },
      // Big Moon Wheels
      { id: 'rvr-wh-1-out', d: 'M 260,720 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 7 },
      { id: 'rvr-wh-1-in', d: 'M 260,720 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 },
      { id: 'rvr-wh-2-out', d: 'M 480,720 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 7 },
      { id: 'rvr-wh-2-in', d: 'M 480,720 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 },
      { id: 'rvr-wh-3-out', d: 'M 700,720 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 7 },
      { id: 'rvr-wh-3-in', d: 'M 700,720 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 },
      // Moon Ground with Craters
      { id: 'rvr-ground', d: 'M 50,780 C 250,750 450,770 650,740 C 850,720 950,760 950,760 L 950,960 L 50,960 Z', strokeWidth: 6 },
      { id: 'rvr-crater', d: 'M 780,840 m -50,0 a 50,20 0 1,0 100,0 a 50,20 0 1,0 -100,0 Z', strokeWidth: 4 }
    ]
  },

  // ==========================================
  // 2. VEHICLE TEMPLATES
  // ==========================================
  {
    id: 'veh-school-bus',
    name: 'Classic Yellow School Bus',
    category: 'vehicles',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      // Bus Main Body
      { id: 'bus-body', d: 'M 150,380 L 720,380 L 860,490 L 860,680 L 760,680 C 750,600 650,600 640,680 L 360,680 C 350,600 250,600 240,680 L 150,680 Z', strokeWidth: 8 },
      // Front Hood & Grille
      { id: 'bus-hood', d: 'M 720,490 L 860,490 L 860,540 L 720,540 Z', strokeWidth: 6 },
      { id: 'bus-grille', d: 'M 820,560 L 860,560 L 860,640 L 820,640 Z', strokeWidth: 5 },
      // Windows
      { id: 'bus-win-1', d: 'M 200,420 L 320,420 L 320,520 L 200,520 Z', strokeWidth: 5 },
      { id: 'bus-win-2', d: 'M 360,420 L 480,420 L 480,520 L 360,520 Z', strokeWidth: 5 },
      { id: 'bus-win-3', d: 'M 520,420 L 640,420 L 640,520 L 520,520 Z', strokeWidth: 5 },
      { id: 'bus-windshield', d: 'M 680,420 L 760,420 L 780,520 L 680,520 Z', strokeWidth: 5 },
      // Bus Side Stripe
      { id: 'bus-stripe', d: 'M 150,560 L 820,560', strokeWidth: 6 },
      // Wheels
      { id: 'bus-wh-f-out', d: 'M 700,680 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 7 },
      { id: 'bus-wh-f-in', d: 'M 700,680 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 },
      { id: 'bus-wh-r-out', d: 'M 300,680 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 7 },
      { id: 'bus-wh-r-in', d: 'M 300,680 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 }
    ]
  },
  {
    id: 'veh-helicopter',
    name: 'Sky Rescue Helicopter',
    category: 'vehicles',
    difficulty: 'Easy',
    isVip: false,
    viewBox: '0 0 1000 1000',
    paths: [
      // Cabin Body
      { id: 'cop-cabin', d: 'M 300,440 C 300,320 620,320 660,440 C 700,560 580,660 440,660 C 340,660 300,560 300,440 Z', strokeWidth: 8 },
      // Cockpit Windshield
      { id: 'cop-glass', d: 'M 480,360 C 580,360 620,440 620,520 L 480,520 Z', strokeWidth: 6 },
      // Tail Boom & Tail Rotor
      { id: 'cop-tail', d: 'M 320,480 L 140,440 L 140,500 L 320,540 Z', strokeWidth: 7 },
      { id: 'cop-tail-fin', d: 'M 140,380 L 140,560', strokeWidth: 6 },
      { id: 'cop-tail-blade', d: 'M 120,420 L 160,520', strokeWidth: 5 },
      // Main Rotor Mast & Blades
      { id: 'cop-mast', d: 'M 480,320 L 480,240', strokeWidth: 7 },
      { id: 'cop-blade-main', d: 'M 180,240 L 780,240', strokeWidth: 8 },
      // Landing Skids
      { id: 'cop-strut-1', d: 'M 380,660 L 360,760', strokeWidth: 6 },
      { id: 'cop-strut-2', d: 'M 540,660 L 520,760', strokeWidth: 6 },
      { id: 'cop-skid', d: 'M 280,760 L 640,760 C 680,760 700,720 700,720', strokeWidth: 8 }
    ]
  },
  {
    id: 'veh-pirate-ship',
    name: 'Grand Sailing Galleon',
    category: 'vehicles',
    difficulty: 'Medium',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      // Ship Hull
      { id: 'sh-hull', d: 'M 160,560 L 840,560 C 820,740 680,820 500,820 C 320,820 200,740 160,560 Z', strokeWidth: 8 },
      { id: 'sh-deck', d: 'M 140,560 L 860,560 L 840,610 L 160,610 Z', strokeWidth: 6 },
      { id: 'sh-porthole-1', d: 'M 320,680 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', strokeWidth: 5 },
      { id: 'sh-porthole-2', d: 'M 500,680 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', strokeWidth: 5 },
      { id: 'sh-porthole-3', d: 'M 680,680 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', strokeWidth: 5 },
      // Main Center Mast & Big Sail
      { id: 'sh-mast-c', d: 'M 500,560 L 500,160', strokeWidth: 8 },
      { id: 'sh-sail-main', d: 'M 380,240 C 440,220 560,220 620,240 C 600,380 400,380 380,240 Z', strokeWidth: 7 },
      { id: 'sh-flag', d: 'M 500,160 L 500,100 L 560,130 L 500,150', strokeWidth: 5 },
      // Front Mast & Sail
      { id: 'sh-mast-f', d: 'M 300,560 L 300,280', strokeWidth: 7 },
      { id: 'sh-sail-front', d: 'M 220,320 C 260,300 340,300 380,320 C 370,440 230,440 220,320 Z', strokeWidth: 6 },
      // Ocean Waves
      { id: 'sh-wave-1', d: 'M 80,820 C 240,780 380,860 520,820 C 660,780 800,860 920,820', strokeWidth: 7 },
      { id: 'sh-wave-2', d: 'M 140,880 C 280,840 420,920 560,880 C 700,840 840,920 960,880', strokeWidth: 6 }
    ]
  },
  {
    id: 'veh-fire-engine',
    name: 'Heroic Fire Engine Truck',
    category: 'vehicles',
    difficulty: 'Medium',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      // Truck Cab & Body
      { id: 'fe-cab', d: 'M 150,420 L 460,420 L 460,680 L 150,680 Z', strokeWidth: 8 },
      { id: 'fe-body', d: 'M 460,460 L 860,460 L 860,680 L 460,680 Z', strokeWidth: 8 },
      // Windshield & Side Window
      { id: 'fe-win-front', d: 'M 180,450 L 320,450 L 320,540 L 180,540 Z', strokeWidth: 5 },
      { id: 'fe-win-side', d: 'M 350,450 L 440,450 L 440,540 L 350,540 Z', strokeWidth: 5 },
      // Emergency Beacon Lights
      { id: 'fe-light-1', d: 'M 220,420 L 220,370 C 220,350 260,350 260,370 L 260,420 Z', strokeWidth: 5 },
      { id: 'fe-light-2', d: 'M 340,420 L 340,370 C 340,350 380,350 380,370 L 380,420 Z', strokeWidth: 5 },
      // Rescue Ladder on Top
      { id: 'fe-ladder-rail-t', d: 'M 440,360 L 840,360', strokeWidth: 6 },
      { id: 'fe-ladder-rail-b', d: 'M 440,410 L 840,410', strokeWidth: 6 },
      { id: 'fe-ladder-rungs', d: 'M 500,360 L 500,410 M 580,360 L 580,410 M 660,360 L 660,410 M 740,360 L 740,410 M 820,360 L 820,410', strokeWidth: 5 },
      // Wheels
      { id: 'fe-wh-f-out', d: 'M 300,680 m -65,0 a 65,65 0 1,0 130,0 a 65,65 0 1,0 -130,0 Z', strokeWidth: 8 },
      { id: 'fe-wh-f-in', d: 'M 300,680 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 },
      { id: 'fe-wh-r1-out', d: 'M 620,680 m -65,0 a 65,65 0 1,0 130,0 a 65,65 0 1,0 -130,0 Z', strokeWidth: 8 },
      { id: 'fe-wh-r1-in', d: 'M 620,680 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 },
      { id: 'fe-wh-r2-out', d: 'M 760,680 m -65,0 a 65,65 0 1,0 130,0 a 65,65 0 1,0 -130,0 Z', strokeWidth: 8 },
      { id: 'fe-wh-r2-in', d: 'M 760,680 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 }
    ]
  },

  // ==========================================
  // 3. NATURE TEMPLATES
  // ==========================================
  {
    id: 'nature-ocean-island',
    name: 'Tropical Island & Ocean Waves',
    category: 'nature',
    difficulty: 'Medium',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      // Sandy Island Mound
      { id: 'isl-sand', d: 'M 200,740 C 350,650 650,650 800,740 C 650,800 350,800 200,740 Z', strokeWidth: 7 },
      // Twin Palm Tree Trunks
      { id: 'isl-trunk-1', d: 'M 440,700 C 430,550 480,420 540,360 L 560,370 C 500,430 460,550 470,700 Z', strokeWidth: 6 },
      // Palm Fronds Left Tree
      { id: 'isl-frond-1', d: 'M 540,360 C 440,300 340,350 320,400 C 400,390 480,380 540,360 Z', strokeWidth: 6 },
      { id: 'isl-frond-2', d: 'M 540,360 C 500,240 400,220 360,250 C 420,280 480,310 540,360 Z', strokeWidth: 6 },
      { id: 'isl-frond-3', d: 'M 540,360 C 600,240 700,240 740,280 C 680,310 600,330 540,360 Z', strokeWidth: 6 },
      { id: 'isl-frond-4', d: 'M 540,360 C 640,320 740,380 760,440 C 680,410 600,390 540,360 Z', strokeWidth: 6 },
      // Sunny Sky & Clouds
      { id: 'isl-sun', d: 'M 200,220 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 6 },
      { id: 'isl-cloud', d: 'M 680,180 C 680,130 760,130 790,160 C 830,130 890,150 890,190 C 930,200 930,250 880,260 L 680,260 Z', strokeWidth: 5 },
      // Ocean Waves
      { id: 'isl-wave-1', d: 'M 80,780 C 240,740 400,820 560,780 C 720,740 860,820 960,780', strokeWidth: 6 },
      { id: 'isl-wave-2', d: 'M 120,860 C 280,820 440,900 600,860 C 760,820 880,900 980,860', strokeWidth: 6 }
    ]
  },
  {
    id: 'nature-mountain-waterfall',
    name: 'Sparkling Mountain Waterfall',
    category: 'nature',
    difficulty: 'Detailed',
    isVip: true,
    viewBox: '0 0 1000 1000',
    paths: [
      // Left Cliff Rock
      { id: 'wf-cliff-l', d: 'M 80,860 L 140,280 L 400,380 L 420,860 Z', strokeWidth: 7 },
      // Right Cliff Rock
      { id: 'wf-cliff-r', d: 'M 580,860 L 600,380 L 860,280 L 920,860 Z', strokeWidth: 7 },
      // Distant Snowy Peak
      { id: 'wf-peak', d: 'M 280,380 L 500,100 L 720,380 Z', strokeWidth: 6 },
      { id: 'wf-snow', d: 'M 500,100 L 440,200 L 480,180 L 510,210 L 560,190 Z', strokeWidth: 4 },
      // Waterfall Streams
      { id: 'wf-fall-center', d: 'M 410,380 L 410,780 L 590,780 L 590,380 Z', strokeWidth: 6 },
      { id: 'wf-line-1', d: 'M 450,400 L 450,760', strokeWidth: 4 },
      { id: 'wf-line-2', d: 'M 500,390 L 500,770', strokeWidth: 4 },
      { id: 'wf-line-3', d: 'M 550,400 L 550,760', strokeWidth: 4 },
      // Splash Pool Base
      { id: 'wf-pool', d: 'M 150,860 C 300,780 700,780 850,860 C 700,940 300,940 150,860 Z', strokeWidth: 7 },
      { id: 'wf-ripple-1', d: 'M 320,850 C 420,820 580,820 680,850', strokeWidth: 5 },
      // Pine Trees on Cliffs
      { id: 'wf-tree-l', d: 'M 180,300 L 220,180 L 260,300 Z M 220,300 L 220,340', strokeWidth: 5 },
      { id: 'wf-tree-r', d: 'M 740,300 L 780,180 L 820,300 Z M 780,300 L 780,340', strokeWidth: 5 }
    ]
  }
];
