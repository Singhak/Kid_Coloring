/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Sparkles, 
  Image as ImageIcon, 
  MousePointer2 
} from 'lucide-react';
import { Category, Template } from './types';

export const COLORS = [
  '#FF6B6B', '#FF9248', '#FFD93D', '#6BCB77', '#4D96FF', '#9B72AA', 
  '#F76E11', '#FF9F29', '#FAF4B7', '#829460', '#3E54AC', '#635985',
  '#000000', '#FFFFFF', '#808080', '#D3D3D3', '#A52A2A', '#FFC0CB',
  '#800080', '#008080'
];

export const COLORS_LEFT = COLORS.slice(0, 9);
export const COLORS_RIGHT = COLORS.slice(9);

export const PRO_COLORS = [
  '#FFD1DC', '#FFB7CE', '#FF91AF', '#FF69B4', '#FF1493', // Pinks
  '#E6E6FA', '#D8BFD8', '#DDA0DD', '#EE82EE', '#DA70D6', // Purples
  '#AFEEEE', '#7FFFD4', '#40E0D0', '#48D1CC', '#00CED1', // Teals/Cyans
  '#F0E68C', '#BDB76B', '#DAA520', '#B8860B', '#8B4513', // Golds/Browns
  '#98FB98', '#90EE90', '#00FA9A', '#00FF7F', '#3CB371', // Greens
  '#FFA07A', '#FA8072', '#E9967A', '#F08080', '#CD5C5C', // Salmons/Reds
  '#F5DEB3', '#DEB887', '#D2B48C', '#BC8F8F', '#A0522D', // Skin tones/Earth
  '#B0C4DE', '#ADD8E6', '#87CEEB', '#87CEFA', '#00BFFF', // Light blues
  '#D3D3D3', '#A9A9A9', '#696969', '#808080', '#000000', '#FFFFFF', // Grays/Black/White
];

export const CATEGORIES: Category[] = [
  { id: 'random', label: 'Random', icon: Sparkles, color: '#FFD93D' },
  { id: 'animal', label: 'Animals', icon: ImageIcon, color: '#FF6B6B' },
  { id: 'nature', label: 'Nature', icon: ImageIcon, color: '#6BCB77' },
  { id: 'plant', label: 'Plants', icon: ImageIcon, color: '#829460' },
  { id: 'human', label: 'People', icon: MousePointer2, color: '#4D96FF' },
  { id: 'space', label: 'Space', icon: Sparkles, color: '#9B72AA' },
  { id: 'vehicles', label: 'Vehicles', icon: ImageIcon, color: '#F76E11' },
];

export const SUBJECTS_BY_CATEGORY: Record<string, string[]> = {
  animal: ['cat', 'dog', 'dinosaur', 'butterfly', 'fish', 'lion', 'elephant', 'bird', 'turtle', 'rabbit', 'monkey', 'giraffe', 'zebra', 'panda', 'koala', 'owl', 'penguin', 'shark', 'whale', 'octopus'],
  nature: ['mountain', 'river', 'forest', 'beach', 'volcano', 'rainbow', 'cloud', 'sun', 'moon', 'stars', 'desert', 'waterfall', 'island', 'cave', 'glacier', 'lightning', 'tornado'],
  plant: ['flower', 'tree', 'cactus', 'mushroom', 'leaf', 'sunflower', 'palm tree', 'rose', 'tulip', 'daisy', 'pine tree', 'bamboo', 'fern', 'clover'],
  human: ['astronaut', 'superhero', 'chef', 'doctor', 'teacher', 'pilot', 'artist', 'dancer', 'firefighter', 'police officer', 'farmer', 'scientist', 'athlete', 'musician'],
  space: ['rocket', 'planet', 'alien', 'ufo', 'satellite', 'galaxy', 'telescope', 'comet', 'asteroid', 'black hole', 'space station'],
  vehicles: ['car', 'truck', 'airplane', 'boat', 'bicycle', 'submarine', 'helicopter', 'train', 'motorcycle', 'bus', 'rocket ship', 'scooter', 'hot air balloon'],
};

export const STATIC_TEMPLATES: Template[] = [
  {
    name: 'Happy House',
    category: 'nature',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'roof', d: 'M 100,200 L 250,100 L 400,200 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'walls', d: 'M 100,200 L 100,400 L 400,400 L 400,200 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'door', d: 'M 220,400 L 220,320 L 280,320 L 280,400 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window-1', d: 'M 140,250 L 140,300 L 190,300 L 190,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window-2', d: 'M 310,250 L 310,300 L 360,300 L 360,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'sun', d: 'M 450,50 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Magic Flower',
    category: 'plant',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'stem', d: 'M 245,350 L 245,480 L 255,480 L 255,350 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leaf-1', d: 'M 255,420 C 300,400 320,440 255,460 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leaf-2', d: 'M 245,400 C 200,380 180,420 245,440 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'center', d: 'M 250,250 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'petal-1', d: 'M 250,210 C 280,150 320,150 350,210 C 320,270 280,270 250,210 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'petal-2', d: 'M 290,250 C 350,280 350,320 290,350 C 230,320 230,280 290,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'petal-3', d: 'M 250,290 C 220,350 180,350 150,290 C 180,230 220,230 250,290 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'petal-4', d: 'M 210,250 C 150,220 150,180 210,150 C 270,180 270,220 210,250 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Space Rocket',
    category: 'space',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 250,50 C 200,150 200,350 250,400 C 300,350 300,150 250,50 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'fin-l', d: 'M 210,300 L 150,400 L 210,380 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'fin-r', d: 'M 290,300 L 350,400 L 290,380 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window', d: 'M 250,150 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'flame', d: 'M 230,400 L 250,480 L 270,400 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Cute Cat',
    category: 'animal',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'head', d: 'M 250,150 m -80,0 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'ear-l', d: 'M 180,100 L 150,30 L 220,80 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'ear-r', d: 'M 320,100 L 350,30 L 280,80 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'body', d: 'M 250,230 C 150,230 150,450 250,450 C 350,450 350,230 250,230 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye-l', d: 'M 220,140 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye-r', d: 'M 280,140 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'nose', d: 'M 250,160 L 245,170 L 255,170 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Little Fish',
    category: 'animal',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 100,250 C 150,150 350,150 400,250 C 350,350 150,350 100,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'tail', d: 'M 400,250 L 480,180 L 480,320 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye', d: 'M 180,230 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'fin', d: 'M 250,200 L 280,150 L 310,200 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Sun & Cloud',
    category: 'nature',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'sun', d: 'M 100,100 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'cloud', d: 'M 250,350 C 200,350 180,300 230,280 C 230,230 320,230 340,280 C 400,280 400,350 340,350 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Cactus',
    category: 'plant',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'pot', d: 'M 200,400 L 300,400 L 320,480 L 180,480 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'body', d: 'M 250,100 C 210,100 210,400 250,400 C 290,400 290,100 250,100 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'arm-l', d: 'M 210,250 C 150,250 150,150 210,180 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'arm-r', d: 'M 290,220 C 350,220 350,320 290,290 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Super Hero',
    category: 'human',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'head', d: 'M 250,100 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'cape', d: 'M 210,150 L 100,400 L 400,400 L 290,150 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'body', d: 'M 210,140 L 290,140 L 310,300 L 190,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'mask', d: 'M 220,90 L 280,90 L 280,110 L 220,110 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Planet',
    category: 'space',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'planet', d: 'M 250,250 m -100,0 a 100,100 0 1,0 200,0 a 100,100 0 1,0 -200,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'ring', d: 'M 100,250 Q 250,350 400,250 Q 250,150 100,250', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Toy Car',
    category: 'vehicles',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 100,350 L 100,250 L 200,250 L 250,150 L 400,150 L 450,250 L 450,350 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wheel-l', d: 'M 180,350 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wheel-r', d: 'M 370,350 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window', d: 'M 230,250 L 260,180 L 380,180 L 410,250 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Dinosaur',
    category: 'animal',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 100,400 C 100,200 300,200 400,300 L 450,400 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'neck', d: 'M 150,300 L 120,150 L 180,150 L 200,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'head', d: 'M 120,150 L 80,120 L 120,80 L 180,120 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leg-1', d: 'M 150,400 L 150,480 L 180,480 L 180,400 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leg-2', d: 'M 300,400 L 300,480 L 330,480 L 330,400 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Butterfly',
    category: 'animal',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 245,150 L 245,350 L 255,350 L 255,150 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wing-tl', d: 'M 245,200 C 150,100 100,250 245,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wing-tr', d: 'M 255,200 C 350,100 400,250 255,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wing-bl', d: 'M 245,250 C 150,400 100,300 245,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wing-br', d: 'M 255,250 C 350,400 400,300 255,300 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Mountain',
    category: 'nature',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'mt-1', d: 'M 50,450 L 200,150 L 350,450 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'mt-2', d: 'M 200,450 L 350,200 L 450,450 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'snow-1', d: 'M 175,200 L 200,150 L 225,200 L 200,220 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'river', d: 'M 250,450 Q 200,400 250,350 Q 300,300 250,250', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Rainbow',
    category: 'nature',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'r-1', d: 'M 100,400 A 150,150 0 0,1 400,400', stroke: '#000', strokeWidth: 10 },
      { id: 'r-2', d: 'M 120,400 A 130,130 0 0,1 380,400', stroke: '#000', strokeWidth: 10 },
      { id: 'r-3', d: 'M 140,400 A 110,110 0 0,1 360,400', stroke: '#000', strokeWidth: 10 },
      { id: 'cloud-l', d: 'M 50,400 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'cloud-r', d: 'M 450,400 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Sunflower',
    category: 'plant',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'stem', d: 'M 245,300 L 245,480 L 255,480 L 255,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'center', d: 'M 250,200 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'p-1', d: 'M 250,150 L 270,100 L 230,100 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'p-2', d: 'M 300,200 L 350,220 L 350,180 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'p-3', d: 'M 250,250 L 270,300 L 230,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'p-4', d: 'M 200,200 L 150,220 L 150,180 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Tree',
    category: 'plant',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'trunk', d: 'M 230,480 L 270,480 L 260,300 L 240,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leaves', d: 'M 250,100 C 150,100 100,350 250,350 C 400,350 350,100 250,100 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Chef',
    category: 'human',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'hat', d: 'M 210,80 L 290,80 L 310,30 C 250,10 190,30 210,80 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'head', d: 'M 250,120 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'body', d: 'M 200,150 L 300,150 L 320,400 L 180,400 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'spoon', d: 'M 350,200 L 350,350 M 350,200 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Rocket Ship',
    category: 'space',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 250,50 L 200,150 L 200,350 L 300,350 L 300,150 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'fin-l', d: 'M 200,300 L 150,400 L 200,400 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'fin-r', d: 'M 300,300 L 350,400 L 300,400 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window', d: 'M 250,200 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Airplane',
    category: 'vehicles',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 50,250 L 400,250 L 450,200 L 450,300 L 400,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wing-t', d: 'M 200,250 L 150,100 L 250,100 L 300,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wing-b', d: 'M 200,250 L 150,400 L 250,400 L 300,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'tail', d: 'M 100,250 L 50,150 L 100,150 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Elephant',
    category: 'animal',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 150,200 L 350,200 L 350,400 L 150,400 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'head', d: 'M 100,150 L 180,150 L 180,250 L 100,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'trunk', d: 'M 100,200 L 50,200 L 50,300 L 80,300', stroke: '#000', strokeWidth: 5 },
      { id: 'ear', d: 'M 180,150 C 220,100 220,300 180,250 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Volcano',
    category: 'nature',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'mt', d: 'M 100,450 L 250,150 L 400,450 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'lava', d: 'M 220,180 Q 250,250 280,180', stroke: '#000', strokeWidth: 5 },
      { id: 'smoke', d: 'M 250,150 Q 200,100 250,50 Q 300,100 250,150', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Mushroom',
    category: 'plant',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'stem', d: 'M 220,300 L 280,300 L 270,450 L 230,450 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'cap', d: 'M 100,300 C 100,150 400,150 400,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'dot-1', d: 'M 180,220 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'dot-2', d: 'M 320,220 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Doctor',
    category: 'human',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'head', d: 'M 250,100 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'coat', d: 'M 200,150 L 300,150 L 320,450 L 180,450 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'steth', d: 'M 230,150 L 230,250 Q 250,280 270,250 L 270,150', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Artist',
    category: 'human',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'head', d: 'M 250,100 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'palette', d: 'M 150,300 C 100,300 100,400 150,400 C 200,400 200,300 150,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'brush', d: 'M 350,200 L 350,350 L 370,350 L 370,200 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Alien',
    category: 'space',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'head', d: 'M 250,200 C 150,200 150,100 250,100 C 350,100 350,200 250,200 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye-1', d: 'M 220,150 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye-2', d: 'M 280,150 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'antenna', d: 'M 250,100 L 250,50 L 270,30', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'UFO',
    category: 'space',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'dome', d: 'M 200,200 C 200,100 300,100 300,200 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'body', d: 'M 100,250 C 100,200 400,200 400,250 C 400,300 100,300 100,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'light-1', d: 'M 150,250 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'light-2', d: 'M 250,250 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'light-3', d: 'M 350,250 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Bicycle',
    category: 'vehicles',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'wheel-l', d: 'M 150,400 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wheel-r', d: 'M 350,400 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'frame', d: 'M 150,400 L 250,400 L 350,400 L 300,300 L 200,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'handle', d: 'M 200,300 L 180,250 L 220,250', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Boat',
    category: 'vehicles',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'hull', d: 'M 100,350 L 400,350 L 350,450 L 150,450 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'mast', d: 'M 250,350 L 250,100', stroke: '#000', strokeWidth: 5 },
      { id: 'sail', d: 'M 250,100 L 350,300 L 250,300 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Pilot',
    category: 'human',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'head', d: 'M 250,100 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'cap', d: 'M 210,80 L 290,80 L 300,60 L 200,60 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'body', d: 'M 200,150 L 300,150 L 320,450 L 180,450 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wings', d: 'M 230,180 L 270,180 L 270,200 L 230,200 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Truck',
    category: 'vehicles',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'cab', d: 'M 100,350 L 100,200 L 200,200 L 200,350 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'trailer', d: 'M 200,350 L 200,150 L 450,150 L 450,350 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wheel-1', d: 'M 150,350 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -25,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wheel-2', d: 'M 300,350 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -25,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wheel-3', d: 'M 400,350 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -25,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Lion',
    category: 'animal',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'mane', d: 'M 250,200 m -120,0 a 120,120 0 1,0 240,0 a 120,120 0 1,0 -240,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'face', d: 'M 250,200 m -80,0 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'nose', d: 'M 250,220 L 240,235 L 260,235 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye-l', d: 'M 220,180 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye-r', d: 'M 280,180 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Forest',
    category: 'nature',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'tree-1', d: 'M 100,450 L 150,450 L 125,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'tree-2', d: 'M 200,450 L 250,450 L 225,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'tree-3', d: 'M 300,450 L 350,450 L 325,320 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'ground', d: 'M 50,450 L 450,450', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Rose',
    category: 'plant',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'stem', d: 'M 250,250 L 250,480', stroke: '#000', strokeWidth: 5 },
      { id: 'leaf', d: 'M 250,350 C 300,330 320,370 250,390 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'flower', d: 'M 250,200 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'inner', d: 'M 250,200 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Astronaut',
    category: 'human',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'helmet', d: 'M 250,150 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'visor', d: 'M 210,130 L 290,130 L 290,170 L 210,170 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'body', d: 'M 180,210 L 320,210 L 330,400 L 170,400 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'pack', d: 'M 150,220 L 180,220 L 180,380 L 150,380 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Telescope',
    category: 'space',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'tube', d: 'M 150,200 L 400,100 L 410,130 L 160,230 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'stand-1', d: 'M 250,200 L 200,400', stroke: '#000', strokeWidth: 5 },
      { id: 'stand-2', d: 'M 250,200 L 300,400', stroke: '#000', strokeWidth: 5 },
      { id: 'lens', d: 'M 400,100 L 410,130', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Train',
    category: 'vehicles',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'engine', d: 'M 100,350 L 100,200 L 250,200 L 250,350 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'chimney', d: 'M 120,200 L 120,150 L 160,150 L 160,200 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'cabin', d: 'M 250,350 L 250,150 L 350,150 L 350,350 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wheel-1', d: 'M 150,350 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -25,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wheel-2', d: 'M 300,350 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -25,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Cute Owl',
    category: 'animal',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 250,300 m -100,0 a 100,120 0 1,0 200,0 a 100,120 0 1,0 -200,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye-l', d: 'M 200,250 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -30,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye-r', d: 'M 300,250 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -30,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'beak', d: 'M 250,280 L 240,300 L 260,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wing-l', d: 'M 150,300 Q 100,350 150,400', stroke: '#000', strokeWidth: 5 },
      { id: 'wing-r', d: 'M 350,300 Q 400,350 350,400', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Palm Tree',
    category: 'plant',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'trunk', d: 'M 240,480 Q 230,350 250,250 L 260,250 Q 270,350 260,480 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leaf-1', d: 'M 250,250 Q 350,200 450,250 Q 350,280 250,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leaf-2', d: 'M 250,250 Q 150,200 50,250 Q 150,280 250,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leaf-3', d: 'M 250,250 Q 300,150 350,50 Q 250,150 250,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leaf-4', d: 'M 250,250 Q 200,150 150,50 Q 250,150 250,250 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Submarine',
    category: 'vehicles',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 100,250 C 100,150 400,150 400,250 C 400,350 100,350 100,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'tower', d: 'M 220,180 L 220,130 L 280,130 L 280,180 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'scope', d: 'M 260,130 L 260,100 L 290,100', stroke: '#000', strokeWidth: 5 },
      { id: 'window-1', d: 'M 160,250 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window-2', d: 'M 250,250 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window-3', d: 'M 340,250 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'propeller', d: 'M 100,250 L 70,220 L 70,280 Z', stroke: '#000', strokeWidth: 5 }
    ]
  }
];

export const ALL_SUBJECTS = Object.values(SUBJECTS_BY_CATEGORY).flat();

