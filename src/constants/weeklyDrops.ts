/**
 * Priority Weekly Drops System
 * Fulfills: "New Weekly Pages & Updates: Free: Monthly | VIP: Priority Weekly Drops"
 */

import { Template } from '../types';

export interface WeeklyDropInfo {
  weekNumber: number; // 1 to 52
  theme: string;
  tagline: string;
  description: string;
  template: Template;
}

export const WEEKLY_DROPS: WeeklyDropInfo[] = [
  {
    weekNumber: 1,
    theme: 'Galactic Space Quest',
    tagline: 'Rocket Ship & Alien Planets',
    description: 'Blast off into outer space! Color a shiny retro cosmic rocket cruising past smiling alien moons and sparkling starfields.',
    template: {
      id: 'drop-wk1-rocket-space',
      name: 'Galactic Rocket & Planets',
      category: 'space',
      difficulty: 'Medium',
      isVip: true,
      viewBox: '0 0 1000 1000',
      paths: [
        // Rocket Main Fuselage
        { id: 'rkt-hull', d: 'M 500,120 C 600,260 620,540 600,740 L 400,740 C 380,540 400,260 500,120 Z', strokeWidth: 7 },
        // Rocket Nose Cone
        { id: 'rkt-nose', d: 'M 500,120 C 560,200 580,260 580,260 L 420,260 C 420,260 440,200 500,120 Z', strokeWidth: 6 },
        // Porthole Window Outer & Inner
        { id: 'rkt-port-out', d: 'M 500,420 m -70,0 a 70,70 0 1,0 140,0 a 70,70 0 1,0 -140,0 Z', strokeWidth: 6 },
        { id: 'rkt-port-in', d: 'M 500,420 m -45,0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0 Z', strokeWidth: 5 },
        // Wings / Fins Left & Right
        { id: 'rkt-fin-l', d: 'M 400,560 L 260,740 L 260,820 L 400,740 Z', strokeWidth: 7 },
        { id: 'rkt-fin-r', d: 'M 600,560 L 740,740 L 740,820 L 600,740 Z', strokeWidth: 7 },
        // Exhaust Nozzle & Blast Flame
        { id: 'rkt-nozzle', d: 'M 440,740 L 560,740 L 580,780 L 420,780 Z', strokeWidth: 6 },
        { id: 'rkt-flame-out', d: 'M 450,780 Q 500,940 550,780', strokeWidth: 6 },
        { id: 'rkt-flame-mid', d: 'M 470,780 Q 500,890 530,780', strokeWidth: 5 },
        // Distant Ringed Planet
        { id: 'plt-body', d: 'M 800,240 m -65,0 a 65,65 0 1,0 130,0 a 65,65 0 1,0 -130,0 Z', strokeWidth: 5 },
        { id: 'plt-ring', d: 'M 690,260 Q 800,320 910,220', strokeWidth: 5 },
        // Crescent Moon (Bottom Left)
        { id: 'cosmic-moon', d: 'M 180,260 C 140,320 160,400 220,420 C 170,410 140,340 180,260 Z', strokeWidth: 5 },
        // Shining Stars
        { id: 'cosmic-star1', d: 'M 780,560 L 790,580 L 810,580 L 795,595 L 800,615 L 780,600 L 760,615 L 765,595 L 750,580 L 770,580 Z', strokeWidth: 4 },
        { id: 'cosmic-star2', d: 'M 220,580 L 230,600 L 250,600 L 235,615 L 240,635 L 220,620 L 200,635 L 205,615 L 190,600 L 210,600 Z', strokeWidth: 4 }
      ]
    }
  },
  {
    weekNumber: 2,
    theme: 'Enchanted Fairy Woodland',
    tagline: 'Magical Treehouse & Forest Friends',
    description: 'Step into a glowing secret fairy forest! Color an adorable cozy treehouse with arched windows, flower chimneys, and singing songbirds.',
    template: {
      id: 'drop-wk2-fairy-treehouse',
      name: 'Enchanted Fairy Treehouse',
      category: 'nature',
      difficulty: 'Medium',
      isVip: true,
      viewBox: '0 0 1000 1000',
      paths: [
        // Massive Ancient Trunk
        { id: 'th-trunk', d: 'M 360,940 L 420,520 C 350,500 280,420 320,340 C 380,240 540,240 600,340 C 640,420 570,500 500,520 L 560,940 Z', strokeWidth: 8 },
        // Doorway in Trunk
        { id: 'th-door-frame', d: 'M 430,940 L 430,760 C 430,720 490,720 490,760 L 490,940 Z', strokeWidth: 6 },
        { id: 'th-door-knob', d: 'M 475,840 m -6,0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0 Z', strokeWidth: 3 },
        // Wooden Balcony
        { id: 'th-balcony', d: 'M 350,520 L 570,520 L 550,570 L 370,570 Z', strokeWidth: 6 },
        { id: 'th-railing-1', d: 'M 390,520 L 390,570 M 440,520 L 440,570 M 490,520 L 490,570 M 530,520 L 530,570', strokeWidth: 4 },
        // Mushroom Chimney Top
        { id: 'th-mush-cap', d: 'M 520,240 C 520,150 720,150 720,240 Z', strokeWidth: 6 },
        { id: 'th-mush-stem', d: 'M 580,240 L 580,320 L 660,320 L 660,240 Z', strokeWidth: 6 },
        // Foliage Clouds
        { id: 'th-leaves-l', d: 'M 320,340 C 220,340 180,220 280,180 C 340,140 440,180 440,260 Z', strokeWidth: 6 },
        { id: 'th-leaves-r', d: 'M 600,340 C 700,340 760,220 680,160 C 600,120 540,180 540,260 Z', strokeWidth: 6 },
        // Ground Mushrooms
        { id: 'gr-mush-1', d: 'M 220,940 C 220,860 320,860 320,940 Z', strokeWidth: 5 },
        { id: 'gr-mush-2', d: 'M 640,940 C 640,880 720,880 720,940 Z', strokeWidth: 5 }
      ]
    }
  },
  {
    weekNumber: 3,
    theme: 'Deep Coral Odyssey',
    tagline: 'Ancient Sea Turtle & Coral Reef',
    description: 'Dive under the blue ocean waves! Color a wise, gentle giant sea turtle gliding over bubbly sea anemones and swirling fish schools.',
    template: {
      id: 'drop-wk3-sea-turtle',
      name: 'Deep Sea Turtle & Coral Reef',
      category: 'animal',
      difficulty: 'Medium',
      isVip: true,
      viewBox: '0 0 1000 1000',
      paths: [
        // Turtle Shell
        { id: 'st-shell', d: 'M 500,280 C 680,280 740,480 660,660 C 560,760 400,760 320,640 C 260,480 320,280 500,280 Z', strokeWidth: 7 },
        // Shell Scutes
        { id: 'st-scute-c', d: 'M 500,420 L 560,480 L 540,560 L 460,560 L 440,480 Z', strokeWidth: 5 },
        { id: 'st-scute-t', d: 'M 500,320 L 550,380 L 450,380 Z', strokeWidth: 5 },
        { id: 'st-scute-l', d: 'M 370,480 L 430,480 L 450,560 L 380,580 Z', strokeWidth: 5 },
        { id: 'st-scute-r', d: 'M 630,480 L 570,480 L 550,560 L 620,580 Z', strokeWidth: 5 },
        // Turtle Head & Neck
        { id: 'st-head', d: 'M 460,280 C 460,180 540,180 540,280 Z', strokeWidth: 6 },
        { id: 'st-eye-l', d: 'M 475,220 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z', strokeWidth: 3 },
        { id: 'st-eye-r', d: 'M 525,220 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z', strokeWidth: 3 },
        // Flippers Front
        { id: 'st-flip-fl', d: 'M 350,360 C 180,320 120,440 280,500 Z', strokeWidth: 6 },
        { id: 'st-flip-fr', d: 'M 650,360 C 820,320 880,440 720,500 Z', strokeWidth: 6 },
        // Flippers Back
        { id: 'st-flip-bl', d: 'M 360,650 C 280,720 320,800 400,740 Z', strokeWidth: 5 },
        { id: 'st-flip-br', d: 'M 640,650 C 720,720 680,800 600,740 Z', strokeWidth: 5 },
        // Coral at Bottom
        { id: 'coral-branch-1', d: 'M 180,940 C 180,820 280,820 280,940 Z', strokeWidth: 6 },
        { id: 'coral-branch-2', d: 'M 720,940 C 720,800 840,800 840,940 Z', strokeWidth: 6 }
      ]
    }
  },
  {
    weekNumber: 4,
    theme: 'Jurassic Volcano Safari',
    tagline: 'Baby T-Rex & Volcano Valley',
    description: 'Travel back millions of years! Color a happy, friendly baby Tyrannosaurus exploring ancient giant ferns near a smoking friendly volcano.',
    template: {
      id: 'drop-wk4-baby-trex',
      name: 'Baby T-Rex Volcano Valley',
      category: 'animal',
      difficulty: 'Medium',
      isVip: true,
      viewBox: '0 0 1000 1000',
      paths: [
        // T-Rex Head
        { id: 'rex-head', d: 'M 360,340 C 360,220 540,220 580,300 C 620,380 560,420 500,420 L 420,420 C 360,420 360,340 360,340 Z', strokeWidth: 7 },
        { id: 'rex-eye', d: 'M 480,280 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0 Z', strokeWidth: 4 },
        { id: 'rex-smile', d: 'M 480,380 Q 540,400 560,340', strokeWidth: 5 },
        // T-Rex Body & Big Tail
        { id: 'rex-body', d: 'M 400,420 C 340,500 320,680 440,780 C 520,780 560,660 520,500 Z', strokeWidth: 7 },
        { id: 'rex-tail', d: 'M 400,660 C 260,640 180,740 140,800 C 240,820 340,780 420,760 Z', strokeWidth: 6 },
        // Big Feet
        { id: 'rex-foot-l', d: 'M 420,760 L 380,880 L 460,880 Z', strokeWidth: 6 },
        { id: 'rex-foot-r', d: 'M 500,740 L 480,880 L 560,880 Z', strokeWidth: 6 },
        // Tiny Cute Arms
        { id: 'rex-arm', d: 'M 490,480 L 550,510 L 530,540', strokeWidth: 5 },
        // Background Smoking Volcano
        { id: 'bg-volcano', d: 'M 620,860 L 760,480 L 840,480 L 960,860 Z', strokeWidth: 6 },
        { id: 'volc-puff-1', d: 'M 780,460 C 760,400 820,380 800,340', strokeWidth: 5 }
      ]
    }
  },
  {
    weekNumber: 5,
    theme: 'Mythical Rainbow Sky',
    tagline: 'Pegasus Unicorn on Cloud Castle',
    description: 'Fly high above the sparkling rainbows! Color an exquisite winged unicorn soaring majestically past fluffy cloud pillars.',
    template: {
      id: 'drop-wk5-pegasus-unicorn',
      name: 'Magical Flying Unicorn',
      category: 'animal',
      difficulty: 'Medium',
      isVip: true,
      viewBox: '0 0 1000 1000',
      paths: [
        // Unicorn Head & Muzzle
        { id: 'uni-head', d: 'M 380,320 C 380,220 500,200 540,280 C 580,360 520,400 460,400 C 400,400 380,320 380,320 Z', strokeWidth: 7 },
        // Golden Twisted Horn
        { id: 'uni-horn', d: 'M 460,220 L 540,80 L 490,200 Z', strokeWidth: 6 },
        { id: 'uni-eye', d: 'M 450,280 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', strokeWidth: 4 },
        // Graceful Arching Neck & Body
        { id: 'uni-body', d: 'M 420,390 C 340,460 320,620 420,720 C 560,720 620,600 540,450 Z', strokeWidth: 7 },
        // Majestic Feathery Wings
        { id: 'uni-wing-main', d: 'M 460,460 C 520,280 780,260 840,360 C 760,460 620,520 480,520 Z', strokeWidth: 7 },
        { id: 'uni-feather-1', d: 'M 600,420 Q 720,360 800,400', strokeWidth: 5 },
        { id: 'uni-feather-2', d: 'M 560,470 Q 680,420 740,470', strokeWidth: 5 },
        // Mane Tufts
        { id: 'uni-mane-1', d: 'M 410,240 Q 320,280 360,340', strokeWidth: 5 },
        { id: 'uni-mane-2', d: 'M 390,320 Q 300,360 350,420', strokeWidth: 5 }
      ]
    }
  },
  {
    weekNumber: 6,
    theme: 'Speed Champions Speedway',
    tagline: 'Supercharged Cyber Hypercar',
    description: 'Rev your creative engines! Color a lightning-fast futuristic race car zooming through checkered victory flags.',
    template: {
      id: 'drop-wk6-cyber-racer',
      name: 'Supercharged Cyber Racer',
      category: 'vehicles',
      difficulty: 'Medium',
      isVip: true,
      viewBox: '0 0 1000 1000',
      paths: [
        // Sleek Car Body Profile
        { id: 'car-body', d: 'M 140,640 L 220,540 C 340,540 420,440 560,440 L 720,480 L 880,580 L 920,660 L 860,660 C 840,580 720,580 700,660 L 360,660 C 340,580 220,580 200,660 L 140,660 Z', strokeWidth: 8 },
        // Cockpit Windshield
        { id: 'car-glass', d: 'M 440,520 L 550,460 L 680,500 L 650,540 L 440,540 Z', strokeWidth: 6 },
        // Front Wheel Outer & Rim
        { id: 'wh-front-out', d: 'M 280,660 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 7 },
        { id: 'wh-front-in', d: 'M 280,660 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 },
        // Rear Wheel Outer & Rim
        { id: 'wh-rear-out', d: 'M 780,660 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', strokeWidth: 7 },
        { id: 'wh-rear-in', d: 'M 780,660 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', strokeWidth: 5 },
        // Rear Spoiler Wing
        { id: 'car-spoiler', d: 'M 120,520 L 220,520 L 200,560 L 140,560 Z', strokeWidth: 6 },
        // Racing Stripe
        { id: 'car-stripe', d: 'M 300,580 L 760,580', strokeWidth: 5 }
      ]
    }
  }
];

/**
 * Calculates current calendar week of the year (1..52)
 */
export function getCalendarWeekNumber(d: Date = new Date()): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Returns active weekly drop details and days until free release
 */
export function getCurrentWeeklyDrop(date: Date = new Date()): {
  drop: WeeklyDropInfo;
  weekIndex: number;
  daysUntilFree: number;
} {
  const currentWeek = getCalendarWeekNumber(date);
  // Cycle through available drops seamlessly
  const dropIndex = (currentWeek - 1) % WEEKLY_DROPS.length;
  const drop = WEEKLY_DROPS[dropIndex];

  // Days until free release (30 days delay from Monday of active week)
  const currentDayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ...
  const daysSinceMonday = (currentDayOfWeek + 6) % 7;
  const daysUntilFree = Math.max(1, 30 - daysSinceMonday);

  return {
    drop,
    weekIndex: currentWeek,
    daysUntilFree
  };
}

/**
 * Returns all weekly drop templates ready for library insertion
 */
export function getAllWeeklyDropTemplates(): Template[] {
  return WEEKLY_DROPS.map((w) => ({
    ...w.template,
    category: 'weekly',
    difficulty: 'Medium'
  }));
}
