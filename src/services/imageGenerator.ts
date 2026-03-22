/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { SvgPath } from "../types";
import { SUBJECTS_BY_CATEGORY } from "../constants";

const ALL_SUBJECTS = Object.values(SUBJECTS_BY_CATEGORY).flat();

export const generateProceduralPaths = (category: string): { paths: SvgPath[], viewBox: string } => {
  const paths: SvgPath[] = [];
  const centerX = 250;
  const centerY = 250;
  const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  let targetCategory = category;
  if (category === 'random') {
    const categories = ['animal', 'nature', 'plant', 'human', 'space', 'vehicles'];
    targetCategory = categories[Math.floor(Math.random() * categories.length)];
  }

  const variant = rnd(1, 5);

  // Helper for circle paths
  const makeCircle = (id: string, cx: number, cy: number, r: number, fill = '#FFFFFF', strokeWidth = 5) => ({
    id,
    d: `M ${cx},${cy} m -${r},0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0 Z`,
    fill,
    stroke: '#000',
    strokeWidth
  });

  // Helper for rectangle paths
  const makeRect = (id: string, x: number, y: number, w: number, h: number, fill = '#FFFFFF', strokeWidth = 5) => ({
    id,
    d: `M ${x},${y} h ${w} v ${h} h -${w} Z`,
    fill,
    stroke: '#000',
    strokeWidth
  });

  if (targetCategory === 'animal') {
    if (variant === 1) { // Bear/Cat Face
      const r = rnd(80, 110);
      const isCat = rnd(0, 1) === 1;
      paths.push(makeCircle('face', centerX, centerY - 20, r));
      
      const earR = rnd(25, 40);
      if (isCat) {
        paths.push({ id: 'ear-l', d: `M ${centerX - r + 10},${centerY - 20 - r + 20} l -20,-60 l 60,30 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
        paths.push({ id: 'ear-r', d: `M ${centerX + r - 10},${centerY - 20 - r + 20} l 20,-60 l -60,30 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      } else {
        paths.push(makeCircle('ear-l', centerX - r + 10, centerY - r, earR));
        paths.push(makeCircle('ear-r', centerX + r - 10, centerY - r, earR));
      }

      paths.push(makeCircle('eye-l', centerX - 30, centerY - 40, rnd(8, 15), '#FFFFFF', 3));
      paths.push(makeCircle('eye-r', centerX + 30, centerY - 40, rnd(8, 15), '#FFFFFF', 3));
      
      paths.push({ id: 'nose', d: `M ${centerX},${centerY} m -15,0 a 15,10 0 1,0 30,0 a 15,10 0 1,0 -30,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'mouth', d: `M ${centerX - 30},${centerY + 30} q 30,${rnd(20, 40)} 60,0`, fill: 'none', stroke: '#000', strokeWidth: 3 });
      
      if (isCat) {
        paths.push({ id: 'whiskers-l', d: `M ${centerX - 40},${centerY + 10} l -40,-10 M ${centerX - 40},${centerY + 20} l -40,10 M ${centerX - 40},${centerY + 30} l -40,30`, fill: 'none', stroke: '#000', strokeWidth: 3 });
        paths.push({ id: 'whiskers-r', d: `M ${centerX + 40},${centerY + 10} l 40,-10 M ${centerX + 40},${centerY + 20} l 40,10 M ${centerX + 40},${centerY + 30} l 40,30`, fill: 'none', stroke: '#000', strokeWidth: 3 });
      }
    } else if (variant === 2) { // Bird
      const bodyW = rnd(70, 90);
      const bodyH = rnd(50, 70);
      paths.push({ id: 'body', d: `M ${centerX},${centerY} m -${bodyW},0 a ${bodyW},${bodyH} 0 1,0 ${bodyW * 2},0 a ${bodyW},${bodyH} 0 1,0 -${bodyW * 2},0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      const headR = rnd(30, 45);
      paths.push(makeCircle('head', centerX + bodyW - 10, centerY - bodyH + 20, headR));
      paths.push({ id: 'beak', d: `M ${centerX + bodyW - 10 + headR},${centerY - bodyH + 20} l ${rnd(20, 40)},10 l -${rnd(20, 40)},10 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'wing', d: `M ${centerX - 20},${centerY} q -40,-40 -80,0 q 40,40 80,0`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push(makeCircle('eye', centerX + bodyW, centerY - bodyH + 10, rnd(4, 8), '#FFFFFF', 2));
      paths.push({ id: 'legs', d: `M ${centerX-20},${centerY+bodyH} v 40 M ${centerX+20},${centerY+bodyH} v 40`, fill: 'none', stroke: '#000', strokeWidth: 3 });
    } else if (variant === 3) { // Fish
      const fW = rnd(80, 120);
      const fH = rnd(60, 90);
      paths.push({ id: 'body', d: `M ${centerX - fW},${centerY} q ${fW},-${fH * 1.5} ${fW*2},0 q -${fW},${fH * 1.5} -${fW*2},0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'tail', d: `M ${centerX - fW},${centerY} l -${rnd(40, 60)},-${rnd(30, 50)} v ${rnd(60, 100)} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('eye', centerX + fW - 30, centerY - 15, rnd(6, 12), '#FFFFFF', 3));
      paths.push({ id: 'fin', d: `M ${centerX},${centerY - 30} l 20,-30 l 20,30 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'bubbles', d: `M ${centerX + fW + 20},${centerY - 40} a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 M ${centerX + fW + 40},${centerY - 80} a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
    } else if (variant === 4) { // Butterfly
      const wWidth = rnd(60, 110);
      const wHeight = rnd(80, 130);
      paths.push(makeRect('body', centerX - 10, centerY - 60, 20, 120));
      paths.push({ id: 'wing-tl', d: `M ${centerX-10},${centerY-30} C ${centerX-wWidth-50},${centerY-wHeight-50} ${centerX-wWidth-50},${centerY+10} ${centerX-10},${centerY+10}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'wing-tr', d: `M ${centerX+10},${centerY-30} C ${centerX+wWidth+50},${centerY-wHeight-50} ${centerX+wWidth+50},${centerY+10} ${centerX+10},${centerY+10}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'wing-bl', d: `M ${centerX-10},${centerY+10} C ${centerX-wWidth},${centerY+wHeight} ${centerX-wWidth/2},${centerY+wHeight} ${centerX-10},${centerY+50}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'wing-br', d: `M ${centerX+10},${centerY+10} C ${centerX+wWidth},${centerY+wHeight} ${centerX+wWidth/2},${centerY+wHeight} ${centerX+10},${centerY+50}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'ant-l', d: `M ${centerX-5},${centerY-60} Q ${centerX-20},${centerY-100} ${centerX-40},${centerY-80}`, fill: 'none', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'ant-r', d: `M ${centerX+5},${centerY-60} Q ${centerX+20},${centerY-100} ${centerX+40},${centerY-80}`, fill: 'none', stroke: '#000', strokeWidth: 3 });
    } else { // Turtle
      paths.push({ id: 'shell', d: `M ${centerX - 90},${centerY + 40} A 90,60 0 0,1 ${centerX + 90},${centerY + 40} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'shell-inner', d: `M ${centerX - 60},${centerY + 40} A 60,30 0 0,1 ${centerX + 60},${centerY + 40} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'head', d: `M ${centerX + 90},${centerY + 40} a 30,25 0 0,0 50,-15 a 30,25 0 0,0 -60,-15`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'leg-f', d: `M ${centerX + 30},${centerY + 40} a 20,30 0 0,1 40,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'leg-b', d: `M ${centerX - 70},${centerY + 40} a 20,30 0 0,1 40,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'tail', d: `M ${centerX - 90},${centerY + 40} l -30,10 l 30,15 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('eye', centerX + 115, centerY + 15, 5, '#FFFFFF', 2));
    }

  } else if (targetCategory === 'nature') {
    if (variant === 1) { // House
      const hW = rnd(120, 180);
      const hH = rnd(100, 140);
      paths.push(makeRect('house-body', centerX - hW/2, centerY + 100 - hH, hW, hH));
      paths.push({ id: 'roof', d: `M ${centerX - hW/2 - 20},${centerY + 100 - hH} L ${centerX},${centerY + 100 - hH - rnd(60, 100)} L ${centerX + hW/2 + 20},${centerY + 100 - hH} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeRect('door', centerX - 20, centerY + 100 - 50, 40, 50, '#FFFFFF', 3));
      paths.push(makeRect('window-l', centerX - hW/2 + 20, centerY + 100 - hH + 20, 30, 30, '#FFFFFF', 3));
      paths.push(makeRect('window-r', centerX + hW/2 - 50, centerY + 100 - hH + 20, 30, 30, '#FFFFFF', 3));
      paths.push(makeCircle('sun', rnd(350, 450), rnd(50, 100), rnd(30, 40)));
    } else if (variant === 2) { // Mountains
      paths.push({ id: 'mtn-1', d: `M 50,400 L 200,${rnd(100, 200)} L 350,400 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'mtn-2', d: `M 250,400 L 400,${rnd(150, 250)} L 500,400 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'cloud', d: `M 150,100 q 20,-30 40,0 q 40,-10 40,20 q 0,30 -40,20 q -40,10 -40,-20 q -20,-10 0,-20 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'sun', d: `M 350,80 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
    } else if (variant === 3) { // Tree Scene
      paths.push(makeRect('trunk', centerX - 20, centerY + 50, 40, 100));
      paths.push(makeCircle('leaves', centerX, centerY - 50, rnd(80, 120)));
      paths.push(makeCircle('apple-1', centerX - 40, centerY - 20, rnd(10, 15), '#FFFFFF', 3));
      paths.push(makeCircle('apple-2', centerX + 40, centerY - 60, rnd(10, 15), '#FFFFFF', 3));
      paths.push(makeCircle('apple-3', centerX, centerY + 10, rnd(10, 15), '#FFFFFF', 3));
      paths.push({ id: 'ground', d: `M 100,250 Q 250,300 400,250`, fill: 'none', stroke: '#000', strokeWidth: 3 });
    } else if (variant === 4) { // Rainbow & Sun
      const rY = centerY + 100;
      paths.push({ id: 'r1', d: `M ${centerX-150},${rY} A 150,150 0 0,1 ${centerX+150},${rY}`, fill: 'none', stroke: '#000', strokeWidth: 15 });
      paths.push({ id: 'r2', d: `M ${centerX-120},${rY} A 120,120 0 0,1 ${centerX+120},${rY}`, fill: 'none', stroke: '#000', strokeWidth: 15 });
      paths.push({ id: 'r3', d: `M ${centerX-90},${rY} A 90,90 0 0,1 ${centerX+90},${rY}`, fill: 'none', stroke: '#000', strokeWidth: 15 });
      paths.push(makeCircle('cloud-l-1', centerX - 150, rY, 30));
      paths.push(makeCircle('cloud-l-2', centerX - 120, rY + 10, 25));
      paths.push(makeCircle('cloud-r-1', centerX + 150, rY, 30));
      paths.push(makeCircle('cloud-r-2', centerX + 120, rY + 10, 25));
      paths.push(makeCircle('sun', centerX, centerY - 150, 40));
    } else { // Volcano
      paths.push({ id: 'volcano', d: `M ${centerX-150},${centerY+150} L ${centerX-60},${centerY-50} L ${centerX+60},${centerY-50} L ${centerX+150},${centerY+150} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'crater', d: `M ${centerX-60},${centerY-50} Q ${centerX},${centerY-20} ${centerX+60},${centerY-50}`, fill: 'none', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'lava-1', d: `M ${centerX-40},${centerY-50} V ${centerY} Q ${centerX-20},${centerY+20} ${centerX},${centerY} V ${centerY-50}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
      paths.push({ id: 'lava-2', d: `M ${centerX},${centerY-50} V ${centerY+30} Q ${centerX+20},${centerY+50} ${centerX+40},${centerY+30} V ${centerY-50}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
      paths.push({ id: 'smoke-1', d: `M ${centerX-20},${centerY-60} Q ${centerX-50},${centerY-100} ${centerX-10},${centerY-150}`, fill: 'none', stroke: '#000', strokeWidth: 6 });
      paths.push({ id: 'smoke-2', d: `M ${centerX+20},${centerY-60} Q ${centerX+50},${centerY-120} ${centerX},${centerY-180}`, fill: 'none', stroke: '#000', strokeWidth: 6 });
    }

  } else if (targetCategory === 'plant') {
    if (variant === 1) { // Flower
      paths.push({ id: 'stem', d: `M ${centerX},${centerY + 180} v -150`, fill: 'none', stroke: '#000', strokeWidth: 8 });
      paths.push({ id: 'leaf-1', d: `M ${centerX},${centerY+100} Q ${centerX-60},${centerY+50} ${centerX-80},${centerY+80} Q ${centerX-40},${centerY+120} ${centerX},${centerY+100}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'leaf-2', d: `M ${centerX},${centerY+60} Q ${centerX+60},${centerY+10} ${centerX+80},${centerY+40} Q ${centerX+40},${centerY+80} ${centerX},${centerY+60}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push(makeCircle('center', centerX, centerY, rnd(25, 40)));
      const petals = rnd(5, 10);
      const petalL = rnd(50, 80);
      for (let i = 0; i < petals; i++) {
        const angle = (i * (360 / petals)) * (Math.PI / 180);
        const px = centerX + Math.cos(angle) * petalL;
        const py = centerY + Math.sin(angle) * petalL;
        paths.push(makeCircle(`petal-${i}`, px, py, rnd(20, 35), '#FFFFFF', 3));
      }
    } else if (variant === 2) { // Cactus
      paths.push({ id: 'pot', d: `M ${centerX - 50},${centerY + 150} l 10,50 h 80 l 10,-50 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'main', d: `M ${centerX - 40},${centerY + 150} v -150 q 40,-50 80,0 v 150 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'arm-l', d: `M ${centerX - 40},${centerY + 50} h -30 v -40 q 15,-30 30,0`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
      paths.push({ id: 'arm-r', d: `M ${centerX + 40},${centerY} h 30 v -40 q -15,-30 -30,0`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
      // Add some spikes
      for(let i=0; i<5; i++) {
        paths.push({ id: `spike-${i}`, d: `M ${centerX - 40},${centerY - 50 + i*30} l -10,-5`, fill: 'none', stroke: '#000', strokeWidth: 2 });
        paths.push({ id: `spike-r-${i}`, d: `M ${centerX + 40},${centerY - 30 + i*30} l 10,-5`, fill: 'none', stroke: '#000', strokeWidth: 2 });
      }
    } else if (variant === 3) { // Mushroom
      paths.push({ id: 'stem', d: `M ${centerX - 30},${centerY + 150} q 30,20 60,0 v -80 h -60 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'cap', d: `M ${centerX - 120},${centerY + 70} q 120,-180 240,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('dot-1', centerX - 40, centerY + 10, rnd(10, 20), '#FFFFFF', 3));
      paths.push(makeCircle('dot-2', centerX + 50, centerY + 30, rnd(10, 20), '#FFFFFF', 3));
      paths.push(makeCircle('dot-3', centerX, centerY - 20, rnd(15, 25), '#FFFFFF', 3));
    } else if (variant === 4) { // Pine Tree
      paths.push(makeRect('trunk', centerX - 20, centerY + 150, 40, 50));
      paths.push({ id: 'tier-1', d: `M ${centerX-100},${centerY+150} L ${centerX},${centerY+50} L ${centerX+100},${centerY+150} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'tier-2', d: `M ${centerX-80},${centerY+80} L ${centerX},${centerY-20} L ${centerX+80},${centerY+80} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'tier-3', d: `M ${centerX-60},${centerY+10} L ${centerX},${centerY-90} L ${centerX+60},${centerY+10} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
    } else { // Potted Plant
      paths.push(makeRect('pot-top', centerX - 60, centerY + 120, 120, 30));
      paths.push({ id: 'pot-bottom', d: `M ${centerX-50},${centerY+150} l 20,60 h 60 l 20,-60 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'stem', d: `M ${centerX},${centerY+120} v -150`, fill: 'none', stroke: '#000', strokeWidth: 6 });
      paths.push({ id: 'leaf-1', d: `M ${centerX},${centerY+70} Q ${centerX-80},${centerY+50} ${centerX},${centerY+10}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
      paths.push({ id: 'leaf-2', d: `M ${centerX},${centerY+30} Q ${centerX+80},${centerY+10} ${centerX},${centerY-30}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
      paths.push({ id: 'leaf-3', d: `M ${centerX},${centerY-10} Q ${centerX-60},${centerY-50} ${centerX},${centerY-90}`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
    }

  } else if (targetCategory === 'human') {
    if (variant === 1) { // Stick Person
      paths.push(makeCircle('head', centerX, centerY - 120, 40));
      paths.push({ id: 'body', d: `M ${centerX},${centerY - 80} v 150`, fill: 'none', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'arms', d: `M ${centerX - 70},${centerY - 20} l 140,0`, fill: 'none', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'leg-l', d: `M ${centerX},${centerY + 70} l -50,80`, fill: 'none', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'leg-r', d: `M ${centerX},${centerY + 70} l 50,80`, fill: 'none', stroke: '#000', strokeWidth: 5 });
    } else if (variant === 2) { // Robot
      paths.push(makeRect('head', centerX - 50, centerY - 150, 100, 80));
      paths.push(makeRect('body', centerX - 70, centerY - 60, 140, 160));
      paths.push(makeRect('eye-l', centerX - 30, centerY - 120, 20, 20, '#FFFFFF', 3));
      paths.push(makeRect('eye-r', centerX + 10, centerY - 120, 20, 20, '#FFFFFF', 3));
      paths.push(makeRect('mouth', centerX - 20, centerY - 90, 40, 10, '#FFFFFF', 3));
      paths.push({ id: 'antenna', d: `M ${centerX},${centerY - 150} v -30`, fill: 'none', stroke: '#000', strokeWidth: 4 });
      paths.push(makeCircle('bulb', centerX, centerY - 180, 10));
    } else if (variant === 3) { // Face
      paths.push({ id: 'face', d: `M ${centerX - 100},${centerY - 50} q 0,150 100,150 q 100,0 100,-150 q 0,-100 -100,-100 q -100,0 -100,100`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('eye-l', centerX - 40, centerY - 50, rnd(10, 20), '#FFFFFF', 3));
      paths.push(makeCircle('eye-r', centerX + 40, centerY - 50, rnd(10, 20), '#FFFFFF', 3));
      paths.push({ id: 'smile', d: `M ${centerX - 40},${centerY + 30} q 40,${rnd(20, 50)} 80,0`, fill: 'none', stroke: '#000', strokeWidth: 4 });
      if (rnd(0, 1) === 1) paths.push({ id: 'nose', d: `M ${centerX},${centerY-10} l -10,20 h 20 Z`, fill: 'none', stroke: '#000', strokeWidth: 3 });
    } else if (variant === 4) { // Snowman
      paths.push(makeCircle('base', centerX, centerY + 100, 80));
      paths.push(makeCircle('mid', centerX, centerY - 20, 60));
      paths.push(makeCircle('head', centerX, centerY - 120, 40));
      paths.push({ id: 'hat', d: `M ${centerX-40},${centerY-150} h 80 v -10 h -20 v -40 h -40 v 40 h -20 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'nose', d: `M ${centerX},${centerY-120} l 30,10 l -30,10 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'arm-l', d: `M ${centerX-60},${centerY-20} l -50,-30`, fill: 'none', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'arm-r', d: `M ${centerX+60},${centerY-20} l 50,-30`, fill: 'none', stroke: '#000', strokeWidth: 5 });
    } else { // Crowned Face
      paths.push({ id: 'face', d: `M ${centerX},${centerY} m -70,0 a 70,80 0 1,0 140,0 a 70,80 0 1,0 -140,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'crown', d: `M ${centerX-60},${centerY-60} l -20,-80 l 40,40 l 40,-60 l 40,40 l 40,-60 l -20,80 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('eye-l', centerX - 25, centerY - 10, rnd(8, 12), '#FFFFFF', 3));
      paths.push(makeCircle('eye-r', centerX + 25, centerY - 10, rnd(8, 12), '#FFFFFF', 3));
      paths.push({ id: 'mouth', d: `M ${centerX-20},${centerY+30} q 20,20 40,0`, fill: 'none', stroke: '#000', strokeWidth: 4 });
    }

  } else if (targetCategory === 'space') {
    if (variant === 1) { // Rocket
      const rW = rnd(30, 50);
      paths.push({ id: 'body', d: `M ${centerX - rW},${centerY + 100} v -150 q ${rW},-${rnd(70, 100)} ${rW*2},0 v 150 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('window', centerX, centerY - 20, rnd(15, 25), '#FFFFFF', 3));
      paths.push({ id: 'fin-l', d: `M ${centerX - rW},${centerY + 40} l -40,60 h 40 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'fin-r', d: `M ${centerX + rW},${centerY + 40} l 40,60 h -40 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'flame', d: `M ${centerX - 20},${centerY + 100} l 20,50 l 20,-50 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
    } else if (variant === 2) { // Planet
      const pR = rnd(70, 100);
      paths.push(makeCircle('planet', centerX, centerY, pR));
      paths.push({ id: 'ring', d: `M ${centerX - pR - 40},${centerY} q ${pR+40},${rnd(40, 80)} ${(pR+40)*2},0 q -${pR+40},-${rnd(40, 80)} -${(pR+40)*2},0`, fill: 'none', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('crater-1', centerX - 20, centerY - 20, rnd(10, 20), '#FFFFFF', 3));
      paths.push(makeCircle('crater-2', centerX + 30, centerY + 20, rnd(10, 20), '#FFFFFF', 3));
    } else if (variant === 3) { // UFO
      const uW = rnd(120, 160);
      paths.push({ id: 'dome', d: `M ${centerX - 60},${centerY} q 60,-${rnd(70, 100)} 120,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'base', d: `M ${centerX - uW},${centerY} q ${uW},${rnd(50, 80)} ${uW*2},0 q -${uW},-${rnd(40, 60)} -${uW*2},0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('light-1', centerX - 80, centerY + 15, 8, '#FFFFFF', 2));
      paths.push(makeCircle('light-2', centerX, centerY + 25, 8, '#FFFFFF', 2));
      paths.push(makeCircle('light-3', centerX + 80, centerY + 15, 8, '#FFFFFF', 2));
    } else if (variant === 4) { // Star & Moon
      paths.push({ id: 'moon', d: `M ${centerX-50},${centerY-50} A 100,100 0 1,1 ${centerX-50},${centerY+100} A 80,80 0 1,0 ${centerX-50},${centerY-50} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'star-1', d: `M ${centerX+100},${centerY-50} l 10,30 l 30,10 l -30,10 l -10,30 l -10,-30 l -30,-10 l 30,-10 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
      paths.push({ id: 'star-2', d: `M ${centerX+50},${centerY+100} l 5,15 l 15,5 l -15,5 l -5,15 l -5,-15 l -15,-5 l 15,-5 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
    } else { // Satellite
      paths.push(makeRect('body', centerX - 30, centerY - 30, 60, 60));
      paths.push(makeRect('panel-l', centerX - 150, centerY - 20, 120, 40));
      paths.push(makeRect('panel-r', centerX + 30, centerY - 20, 120, 40));
      paths.push({ id: 'dish-stem', d: `M ${centerX},${centerY-30} v -40`, fill: 'none', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'dish', d: `M ${centerX-40},${centerY-70} q 40,-40 80,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('light', centerX, centerY, 10, '#FFFFFF', 3));
    }

  } else if (targetCategory === 'vehicles') {
    if (variant === 1) { // Car
      const cW = rnd(120, 160);
      paths.push({ id: 'body', d: `M ${centerX - cW},${centerY + 50} h ${cW*2} v -60 h -60 l -40,-60 h -${cW-20} l -40,60 h -${cW-80} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('wheel-l', centerX - cW + 50, centerY + 50, rnd(25, 35)));
      paths.push(makeCircle('wheel-r', centerX + cW - 50, centerY + 50, rnd(25, 35)));
      paths.push(makeRect('window-l', centerX - 50, centerY - 50, 40, 40, '#FFFFFF', 3));
      paths.push(makeRect('window-r', centerX + 10, centerY - 50, 40, 40, '#FFFFFF', 3));
    } else if (variant === 2) { // Truck
      const tW = rnd(180, 240);
      paths.push(makeRect('cab', centerX - tW/2, centerY + 50 - 100, 80, 100));
      paths.push(makeRect('trailer', centerX - tW/2 + 80 + 10, centerY + 50 - 140, tW - 90, 140));
      paths.push(makeCircle('wheel-1', centerX - tW/2 + 40, centerY + 50, 25));
      paths.push(makeCircle('wheel-2', centerX + tW/2 - 80, centerY + 50, 25));
      paths.push(makeCircle('wheel-3', centerX + tW/2 - 20, centerY + 50, 25));
    } else if (variant === 3) { // Boat
      const bW = rnd(150, 200);
      paths.push({ id: 'hull', d: `M ${centerX - bW},${centerY + 50} l 40,80 h ${bW*2 - 80} l 40,-80 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'mast', d: `M ${centerX},${centerY + 50} v -${rnd(120, 180)}`, fill: 'none', stroke: '#000', strokeWidth: 6 });
      paths.push({ id: 'sail', d: `M ${centerX},${centerY - 100} l 100,75 l -100,75 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
    } else if (variant === 4) { // Submarine
      const sW = rnd(100, 140);
      paths.push({ id: 'body', d: `M ${centerX-sW},${centerY} C ${centerX-sW},${centerY-50} ${centerX+sW},${centerY-50} ${centerX+sW},${centerY} C ${centerX+sW},${centerY+50} ${centerX-sW},${centerY+50} ${centerX-sW},${centerY} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeRect('tower', centerX - 20, centerY - 45 - 40, 40, 40));
      paths.push({ id: 'periscope', d: `M ${centerX+10},${centerY-85} v -30 h 20 v 10 h -10 v 20 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 4 });
      paths.push({ id: 'propeller', d: `M ${centerX-sW},${centerY} l -30,-20 v 40 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push(makeCircle('window-1', centerX - 40, centerY, 15, '#FFFFFF', 4));
      paths.push(makeCircle('window-2', centerX + 40, centerY, 15, '#FFFFFF', 4));
    } else { // Train
      paths.push(makeRect('cab', centerX + 20, centerY - 50, 80, 100));
      paths.push(makeRect('boiler', centerX - 80, centerY - 10, 100, 60));
      paths.push(makeRect('chimney', centerX - 60, centerY - 50, 20, 40));
      paths.push(makeRect('roof', centerX + 10, centerY - 70, 100, 20));
      paths.push(makeRect('window', centerX + 40, centerY - 30, 40, 40, '#FFFFFF', 4));
      paths.push(makeCircle('wheel-1', centerX - 40, centerY + 50, 25));
      paths.push(makeCircle('wheel-2', centerX + 20, centerY + 50, 25));
      paths.push(makeCircle('wheel-3', centerX + 80, centerY + 50, 25));
      paths.push({ id: 'cowcatcher', d: `M ${centerX-80},${centerY+50} l -30,25 h 30 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
    }
  }

  return { paths, viewBox: "0 0 500 500" };
};

export const generateAiPaths = async (subject: string): Promise<{ paths: SvgPath[], viewBox: string }> => {
  const API_KEY = process.env.GEMINI_API_KEY || ""
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a simple, bold line art SVG of a ${subject} for a kids' coloring book. 
    The SVG should consist of multiple closed paths so they can be filled with color.
    The drawing should be clear and easy for a child to color.
    Return ONLY a JSON object with the following structure:
    {
      "viewBox": "0 0 500 500",
      "paths": [
        { "id": "part-name", "d": "SVG_PATH_DATA" }
      ]
    }
    Ensure all paths are closed (end with Z). Do not include any fill colors in the paths.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          viewBox: { type: Type.STRING },
          paths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                d: { type: Type.STRING },
                stroke: { type: Type.STRING },
                strokeWidth: { type: Type.NUMBER }
              },
              required: ["id", "d"]
            }
          }
        },
        required: ["viewBox", "paths"]
      }
    }
  });

  const data = JSON.parse(response.text);
  const newPaths: SvgPath[] = data.paths.map((p: any) => ({
    ...p,
    fill: '#FFFFFF',
    stroke: p.stroke || '#000000',
    strokeWidth: p.strokeWidth || 3
  }));

  return { paths: newPaths, viewBox: data.viewBox || "0 0 500 500" };
};

export const getImageUsingAPI = async (subject: string, category: string): Promise<{ paths: SvgPath[], viewBox: string }> => {
  if (subject === 'random') {
    subject = ALL_SUBJECTS[Math.floor(Math.random() * ALL_SUBJECTS.length)];
  }

  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 1500): Promise<Response> => {
    // Start the fetch request WITHOUT an AbortController so it continues in the background
    const fetchPromise = fetch(url, options);
    
    // Prevent unhandled promise rejections if the fetch fails silently in the background later
    fetchPromise.catch(() => {}); 

    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), timeoutMs);
    });

    // Race the fetch against the timer. If the timer wins, we reject and fallback instantly.
    return Promise.race([fetchPromise, timeoutPromise]);
  };

  // Fallback to OpenRouter via Backend Proxy
  try {
    let response: Response | undefined;
    try {
      response = await fetchWithTimeout("https://kidcolor.storywalla.com/api/generate-paths.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category })
      }, 15000); // 5 seconds timeout for first API
    } catch (e) {
      console.warn("First API attempt failed or timed out, trying fallback...");
    }

    if (!response || !response.ok) {
      // Try with Google GenAI API directly if proxy fails (e.g., due to CORS or network issues)
      response = await fetchWithTimeout("https://kidcolor.storywalla.com/api/generate-paths-gemini.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category })
      }, 10000); // 5 seconds timeout for fallback API
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Backend generation failed");
      }
    }

    const data = await response.json();
    const newPaths: SvgPath[] = data.paths.map((p: any) => ({
      ...p,
      fill: '#FFFFFF',
      stroke: p.stroke || '#000000',
      strokeWidth: p.strokeWidth || 3
    }));

    return { paths: newPaths, viewBox: data.viewBox || "0 0 500 500" };
  } catch (error) {
    console.error("All AI generation methods failed:", error);
    throw error;
  }
}