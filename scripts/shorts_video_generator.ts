/**
 * YouTube Shorts & Instagram Reels 9:16 Video Generator for Coloro.in
 *
 * Renders high-impact 1080x1920 30FPS vertical videos showcasing the authentic
 * Coloro web app in action as if a user is coloring on their tablet.
 *
 * Visual Highlights:
 * - Real Coloro branding: High-res Coloro rainbow logo in top navbar
 * - Authentic Coloro UI: Studio navigation, Undo/Print/Save buttons, and template badge
 * - Warm creamy studio canvas (#FBF9F1) with textured paper sheet border
 * - Authentic Coloro Crayon Dock: Fill, Eraser & Stamps tools with 3D crayons
 * - Realistic interaction: Cursor selects color from tray, then colors the canvas section
 * - Sparkling tap burst & smooth color reveal
 * - Real app confetti celebration with "Masterpiece Complete!" outro
 * - Built-in synthesized audio with pops and victory chimes
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import { Resvg, renderAsync } from '@resvg/resvg-js';
import { Template } from '../src/types.js';
import { COLORS, COLOR_METADATA } from '../src/constants.js';
import { getSemanticColorForPath, getCategoryMeta } from '../src/services/pinterestPinGenerator.js';

// Load the official Coloro web logo as base64 (using web-optimized logo for maximum speed)
let LOGO_BASE64 = '';
const optLogoPath = path.resolve(process.cwd(), 'public', 'coloro-logo-opt.png');
const rawLogoPath = path.resolve(process.cwd(), 'public', 'coloro-web-logo.png');
const logoFile = fs.existsSync(optLogoPath) ? optLogoPath : rawLogoPath;
if (fs.existsSync(logoFile)) {
  LOGO_BASE64 = fs.readFileSync(logoFile).toString('base64');
}

export interface VideoGeneratorOptions {
  fps?: number;              // default 30
  durationSeconds?: number;  // default 15 for 9:16, 60 for 16:9
  aspectRatio?: '9:16' | '16:9'; // default '9:16'
  outputDir?: string;        // default 'D:\\Hostiger_Deployment\\Insta_video' or 'output/videos'
  fileName?: string;         // optional custom filename
  includeAudio?: boolean;    // default true
}

interface PathInfo {
  id: string;
  d: string;
  stroke: string;
  strokeWidth: number;
  color: string;
  centroid: { x: number; y: number };
  colorMeta: { name: string; emoji: string };
  crayonIndex: number;
}

/**
 * Parses SVG path d string to approximate its bounding box centroid (cx, cy)
 */
function extractPathCentroid(d: string, viewBoxWidth: number, viewBoxHeight: number): { x: number; y: number } {
  const matches = d.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g);
  if (!matches || matches.length < 2) {
    return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < matches.length; i += 2) {
    const x = parseFloat(matches[i]);
    const y = i + 1 < matches.length ? parseFloat(matches[i + 1]) : 0;
    if (!isNaN(x)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
    if (!isNaN(y)) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (minX === Infinity || maxX === -Infinity || minY === Infinity || maxY === -Infinity) {
    return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
  }

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}

/**
 * Escapes XML strings for SVG
 */
function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Deterministic pseudo-random generator for reproducible confetti
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Fast, optimized 16-bit PCM WAV audio synthesizer
 */
function generateAudioWavBuffer(
  totalSeconds: number,
  tapTimestamps: number[],
  sampleRate: number = 44100
): Buffer {
  const numSamples = Math.floor(totalSeconds * sampleRate);
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' Sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);

  // 'data' Sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const samples = new Float32Array(numSamples);

  // Warm background rhythm pulse
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    samples[i] = Math.sin(2 * Math.PI * 130.81 * t) * 0.02 * (1 + 0.3 * Math.sin(2 * Math.PI * 2 * t));
  }

  // Pop sound at each tap timestamp
  for (let j = 0; j < tapTimestamps.length; j++) {
    const startIdx = Math.floor(tapTimestamps[j] * sampleRate);
    const popDuration = 0.10;
    const popSamples = Math.floor(popDuration * sampleRate);
    const baseFreq = 650 + (j % 5) * 70;

    for (let s = 0; s < popSamples; s++) {
      const idx = startIdx + s;
      if (idx >= numSamples) break;
      const deltaT = s / sampleRate;
      const popFreq = baseFreq - deltaT * 2500;
      const env = Math.exp(-deltaT * 40);
      samples[idx] += Math.sin(2 * Math.PI * popFreq * deltaT) * 0.45 * env;
    }
  }

  // Victory celebration chime chords at the finale
  const finaleStartTime = Math.max(0, totalSeconds - 2.5);
  const finStartIdx = Math.floor(finaleStartTime * sampleRate);
  const chimeNotes = [523.25, 659.25, 783.99, 1046.50];

  for (let c = 0; c < chimeNotes.length; c++) {
    const noteStartIdx = finStartIdx + Math.floor(c * 0.12 * sampleRate);
    const noteDuration = 1.8;
    const noteSamples = Math.floor(noteDuration * sampleRate);

    for (let s = 0; s < noteSamples; s++) {
      const idx = noteStartIdx + s;
      if (idx >= numSamples) break;
      const deltaT = s / sampleRate;
      const env = Math.exp(-deltaT * 2.5);
      samples[idx] += Math.sin(2 * Math.PI * chimeNotes[c] * deltaT) * 0.25 * env;
    }
  }

  // Write stereo 16-bit PCM
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const intSample = Math.floor(clamped * 32767);
    buffer.writeInt16LE(intSample, offset);
    buffer.writeInt16LE(intSample, offset + 2);
    offset += 4;
  }

  return buffer;
}

/**
 * Builds the complete 1080x1920 SVG for a single vertical video frame (9:16 Tablet View)
 */
function buildFrameSvg9x16(
  template: Template,
  pathsInfo: PathInfo[],
  frameIndex: number,
  totalFrames: number,
  fps: number,
  viewBox: { x: number; y: number; w: number; h: number }
): string {
  const width = 1080;
  const height = 1920;
  const currentTime = frameIndex / fps;
  const totalDuration = totalFrames / fps;

  // Timeline phases
  const introDuration = 0.8;
  const finaleDuration = Math.min(3.5, Math.max(2.4, totalDuration * 0.15));
  const coloringDuration = Math.max(1, totalDuration - introDuration - finaleDuration);

  // Time per path
  const numPaths = pathsInfo.length;
  const timePerPath = coloringDuration / numPaths;

  let coloredCount = 0;
  let activePathIdx = -1;
  let activeProgress = 0;

  if (currentTime < introDuration) {
    coloredCount = 0;
    activePathIdx = 0;
    activeProgress = 0;
  } else if (currentTime >= introDuration + coloringDuration) {
    coloredCount = numPaths;
    activePathIdx = numPaths - 1;
    activeProgress = 1;
  } else {
    const elapsedColoring = currentTime - introDuration;
    activePathIdx = Math.min(numPaths - 1, Math.floor(elapsedColoring / timePerPath));
    activeProgress = (elapsedColoring % timePerPath) / timePerPath;
    // Path fills when tap occurs at 40%
    coloredCount = activeProgress >= 0.40 ? activePathIdx + 1 : activePathIdx;
  }

  const isFinale = currentTime >= totalDuration - finaleDuration;
  const overallPercent = Math.min(100, Math.round((coloredCount / numPaths) * 100));

  // Canvas positioning on 1080x1920 screen
  const canvasX = 80;
  const canvasY = 320;
  const canvasW = 920;
  const canvasH = 1060;
  const padding = 50;

  const scale = Math.min((canvasW - padding * 2) / viewBox.w, (canvasH - padding * 2) / viewBox.h);
  const offsetX = canvasX + (canvasW - viewBox.w * scale) / 2;
  const offsetY = canvasY + (canvasH - viewBox.h * scale) / 2;

  const toScreen = (pt: { x: number; y: number }) => ({
    x: offsetX + (pt.x - viewBox.x) * scale,
    y: offsetY + (pt.y - viewBox.y) * scale,
  });

  // Tray color buttons
  const trayColors = COLORS.slice(0, 10);
  const currentPath = activePathIdx >= 0 && activePathIdx < numPaths ? pathsInfo[activePathIdx] : pathsInfo[0];
  const activeColor = currentPath ? currentPath.color : COLORS[0];
  const activeMeta = currentPath ? currentPath.colorMeta : { name: 'Cherry Red', emoji: '🍒' };

  // Calculate Crayon Tray position for active color
  let activeCrayonIdx = trayColors.indexOf(activeColor);
  if (activeCrayonIdx === -1) activeCrayonIdx = (currentPath ? currentPath.crayonIndex : 0) % trayColors.length;
  const trayStartX = 80 + 350;
  const activeCrayonScreenPos = {
    x: trayStartX + activeCrayonIdx * 54 + 19,
    y: 1430 + 110 + 60,
  };

  // Animated cursor motion:
  let cursorX = 540;
  let cursorY = 900;
  let tapScale = 1;
  let showTapRipple = false;

  if (activePathIdx >= 0 && activePathIdx < numPaths) {
    const targetCanvasPos = toScreen(pathsInfo[activePathIdx].centroid);

    if (activeProgress < 0.30) {
      cursorX = activeCrayonScreenPos.x;
      cursorY = activeCrayonScreenPos.y;
      const subProg = activeProgress / 0.30;
      tapScale = 1 + Math.sin(subProg * Math.PI) * 0.15;
    } else if (activeProgress < 0.60) {
      const moveProgress = (activeProgress - 0.30) / 0.30;
      const ease = 1 - Math.pow(1 - moveProgress, 3);
      cursorX = activeCrayonScreenPos.x + (targetCanvasPos.x - activeCrayonScreenPos.x) * ease;
      cursorY = activeCrayonScreenPos.y + (targetCanvasPos.y - activeCrayonScreenPos.y) * ease;
    } else {
      cursorX = targetCanvasPos.x;
      cursorY = targetCanvasPos.y;
      const tapProg = (activeProgress - 0.60) / 0.40;
      tapScale = 1 + Math.sin(tapProg * Math.PI) * 0.25;

      if (activeProgress >= 0.40 && activeProgress <= 0.85) {
        showTapRipple = true;
      }
    }
  }

  // Build SVG path strings with current color fills
  const pathsSvg = pathsInfo.map((p, idx) => {
    const isColored = idx < coloredCount;
    const fill = isColored ? p.color : '#FFFFFF';
    const stroke = '#1E293B';
    const sw = Math.max(p.strokeWidth * 1.05, 4.5);
    return `<path d="${escapeXml(p.d)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join('\n        ');

  // Confetti particles for finale celebration
  let confettiSvg = '';
  if (isFinale) {
    const finaleElapsed = currentTime - (totalDuration - finaleDuration);
    const confettiProgress = finaleElapsed / finaleDuration;
    const confettiCount = 60;
    const confettiElements: string[] = [];
    const confettiColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FFD700'];

    for (let c = 0; c < confettiCount; c++) {
      const seed = c * 17.37;
      const startX = 100 + pseudoRandom(seed) * 880;
      const speed = 700 + pseudoRandom(seed + 1) * 900;
      const currentY = -40 + confettiProgress * speed;
      const drift = Math.sin(confettiProgress * 10 + seed) * 50;
      const color = confettiColors[c % confettiColors.length];
      const size = 14 + pseudoRandom(seed + 2) * 16;
      const rotation = confettiProgress * 720 + seed * 60;

      if (currentY > 0 && currentY < 1920) {
        confettiElements.push(
          `<rect x="${startX + drift}" y="${currentY}" width="${size}" height="${size * 0.6}" fill="${color}" rx="3" transform="rotate(${rotation} ${startX + drift + size / 2} ${currentY + size * 0.3})" opacity="${Math.max(0, 1 - confettiProgress * 0.25)}" />`
        );
      }
    }
    confettiSvg = confettiElements.join('\n    ');
  }

  // Construct complete authentic Coloro screen SVG
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandBtnGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FF5252" />
      <stop offset="50%" stop-color="#FF7675" />
      <stop offset="100%" stop-color="#FFAA00" />
    </linearGradient>
  </defs>

  <style>
    .font-sans { font-family: 'Arial', sans-serif; }
    .font-bold { font-family: 'Arial', sans-serif; font-weight: bold; }
  </style>

  <!-- App Main Background (Exact Coloro Warm Cream Studio #FBF9F1) -->
  <rect width="${width}" height="${height}" fill="#FBF9F1" />

  <!-- ================= TOP APP HEADER (Authentic Coloro Nav) ================= -->
  <rect x="0" y="0" width="${width}" height="200" fill="#FFFFFF" />
  <line x1="0" y1="200" x2="${width}" y2="200" stroke="#EBE8DC" stroke-width="3" />

  <!-- Official Coloro Rainbow Logo -->
  ${LOGO_BASE64 ? `
  <image href="data:image/png;base64,${LOGO_BASE64}" x="40" y="30" width="340" height="140" preserveAspectRatio="xMidYMid meet" />
  ` : `
  <g transform="translate(50, 70)">
    <text x="0" y="45" font-size="44" font-weight="bold" fill="#0F172A" class="font-bold">🎨 COLORO</text>
    <text x="0" y="80" font-size="20" font-weight="bold" fill="#FF5252" class="font-bold">KIDS DIGITAL ART STUDIO</text>
  </g>
  `}

  <!-- App Header Action Buttons (Studio, Undo, Print, Download) -->
  <g transform="translate(620, 70)">
    <rect x="0" y="0" width="130" height="60" rx="20" fill="#FFF9E6" stroke="#FFD93D" stroke-width="2" />
    <circle cx="30" cy="30" r="7" fill="#FF5252" />
    <circle cx="42" cy="24" r="5" fill="#FFAA00" />
    <circle cx="46" cy="34" r="5" fill="#10B981" />
    <text x="85" y="38" text-anchor="middle" font-size="20" font-weight="bold" fill="#8C5B00" class="font-bold">Studio</text>

    <!-- Undo -->
    <g transform="translate(150, 0)">
      <circle cx="30" cy="30" r="28" fill="#F4F1DE" stroke="#E6E2D3" stroke-width="2" />
      <path d="M 37 23 L 26 29 L 37 35 M 27 29 Q 34 26 39 31 Q 42 35 40 40" fill="none" stroke="#636E72" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- Print -->
    <g transform="translate(225, 0)">
      <circle cx="30" cy="30" r="28" fill="#F0FDF4" stroke="#86EFAC" stroke-width="2" />
      <rect x="21" y="25" width="18" height="12" rx="2" fill="#15803D" />
      <rect x="24" y="21" width="12" height="5" fill="#86EFAC" />
      <rect x="24" y="31" width="12" height="6" fill="#FFFFFF" />
    </g>

    <!-- Save / Download -->
    <g transform="translate(300, 0)">
      <circle cx="30" cy="30" r="28" fill="#EFF6FF" stroke="#93C5FD" stroke-width="2" />
      <path d="M 30 20 L 30 35 M 23 29 L 30 36 L 37 29 M 22 39 L 38 39" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>

  <!-- ================= SUB-HEADER: TEMPLATE TITLE & WATERMARK ================= -->
  <g transform="translate(80, 230)">
    <rect x="0" y="0" width="600" height="60" rx="30" fill="#FFFFFF" stroke="#EBE8DC" stroke-width="2" />
    <path d="M 28 20 L 30 26 L 36 28 L 30 30 L 28 36 L 26 30 L 20 28 L 26 26 Z" fill="#F59E0B" />
    <text x="46" y="38" font-size="26" font-weight="bold" fill="#2D3436" class="font-bold">${escapeXml(template.name)}</text>

    <rect x="670" y="0" width="250" height="60" rx="30" fill="#FFF0F0" stroke="#FF8787" stroke-width="2" />
    <path d="M 698 24 L 706 30 L 698 36" fill="none" stroke="#E03131" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <text x="795" y="38" text-anchor="middle" font-size="22" font-weight="bold" fill="#E03131" class="font-bold">www.coloro.in</text>
  </g>

  <!-- ================= MAIN CANVAS ARTBOARD ================= -->
  <rect x="${canvasX}" y="${canvasY + 8}" width="${canvasW}" height="${canvasH}" rx="32" fill="#000000" opacity="0.08" />
  <rect x="${canvasX}" y="${canvasY}" width="${canvasW}" height="${canvasH}" rx="32" fill="#FFFFFF" stroke="${isFinale ? '#F59E0B' : '#EBE8DC'}" stroke-width="${isFinale ? 6 : 3}" />
  <rect x="${canvasX + 16}" y="${canvasY + 16}" width="${canvasW - 32}" height="${canvasH - 32}" rx="20" fill="#FFFFFF" stroke="#F1EFE7" stroke-width="2" stroke-dasharray="8 6" />

  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale}) translate(${-viewBox.x}, ${-viewBox.y})">
    ${pathsSvg}
  </g>

  <!-- Tap Ripple Sparkle Effect on canvas -->
  ${showTapRipple ? `
  <g transform="translate(${cursorX}, ${cursorY})">
    <circle cx="0" cy="0" r="45" fill="none" stroke="${activeColor}" stroke-width="6" opacity="0.8" />
    <circle cx="0" cy="0" r="75" fill="none" stroke="${activeColor}" stroke-width="3" opacity="0.4" />
    <circle cx="0" cy="0" r="14" fill="${activeColor}" opacity="0.9" />
  </g>
  ` : ''}

  <!-- Animated Kid's Stylus Cursor -->
  ${!isFinale ? `
  <g transform="translate(${cursorX}, ${cursorY}) scale(${tapScale}) rotate(-35)">
    <rect x="-12" y="-116" width="32" height="110" rx="6" fill="#000000" opacity="0.2" />
    <rect x="-16" y="-120" width="32" height="110" rx="6" fill="${activeColor}" stroke="#1E293B" stroke-width="4" />
    <rect x="-16" y="-85" width="32" height="40" fill="#FFFFFF" stroke="#1E293B" stroke-width="3" />
    <text x="0" y="-60" text-anchor="middle" fill="#0F172A" font-size="11" font-weight="bold" transform="rotate(-90 0 -60)" class="font-bold">COLORO</text>
    <polygon points="0,0 -16,-10 16,-10" fill="${activeColor}" stroke="#1E293B" stroke-width="4" stroke-linejoin="round" />
  </g>
  ` : ''}

  <!-- ================= AUTHENTIC COLORO CRAYON DOCK (BOTTOM) ================= -->
  <g transform="translate(80, 1420)">
    <g transform="translate(460, 0)">
      <rect x="-170" y="0" width="340" height="50" rx="25" fill="#FFFFFF" stroke="${activeColor}" stroke-width="3" />
      <circle cx="-135" cy="25" r="14" fill="${activeColor}" stroke="#1E293B" stroke-width="2" />
      <text x="15" y="32" text-anchor="middle" font-size="22" font-weight="bold" fill="#2D3436" class="font-bold">
        ${escapeXml(activeMeta.name)} Active (${overallPercent}%)
      </text>
    </g>

    <rect x="0" y="65" width="920" height="240" rx="32" fill="#FFFFFF" stroke="#EBE8DC" stroke-width="3" />
    <rect x="15" y="80" width="890" height="210" rx="24" fill="#F8F6F0" stroke="#EFECE2" stroke-width="2" />

    <!-- Left Tool Buttons -->
    <g transform="translate(35, 100)">
      <!-- Fill -->
      <rect x="0" y="0" width="80" height="130" rx="18" fill="#FFFFFF" stroke="#FF6B6B" stroke-width="3" />
      <path d="M 26 40 L 54 40 L 50 64 L 30 64 Z" fill="#FF6B6B" stroke="#1E293B" stroke-width="2.5" stroke-linejoin="round" />
      <ellipse cx="40" cy="40" rx="14" ry="4.5" fill="#FFA8A8" stroke="#1E293B" stroke-width="2" />
      <text x="40" y="105" text-anchor="middle" font-size="16" font-weight="bold" fill="#FF6B6B" class="font-bold">FILL</text>

      <!-- Eraser -->
      <rect x="95" y="0" width="80" height="130" rx="18" fill="#FFFFFF" stroke="#E5E1D0" stroke-width="2" />
      <rect x="117" y="42" width="36" height="24" rx="4" fill="#F4F1DE" stroke="#1E293B" stroke-width="2" />
      <path d="M 117 52 L 153 52" stroke="#FF7675" stroke-width="5" />
      <text x="135" y="105" text-anchor="middle" font-size="16" font-weight="bold" fill="#636E72" class="font-bold">ERASER</text>

      <!-- Stamps -->
      <rect x="190" y="0" width="80" height="130" rx="18" fill="#FFFFFF" stroke="#E5E1D0" stroke-width="2" />
      <circle cx="230" cy="52" r="16" fill="#FFF3BF" stroke="#1E293B" stroke-width="2" />
      <circle cx="224" cy="48" r="2" fill="#1E293B" />
      <circle cx="236" cy="48" r="2" fill="#1E293B" />
      <path d="M 224 56 Q 230 62 236 56" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" />
      <text x="230" y="105" text-anchor="middle" font-size="16" font-weight="bold" fill="#FF9F43" class="font-bold">STAMPS</text>
    </g>

    <line x1="330" y1="100" x2="330" y2="270" stroke="#E2DFD2" stroke-width="2" />

    <!-- 3D Standing Crayons Row -->
    <g transform="translate(350, 105)">
      ${trayColors.map((col, idx) => {
        const isSel = idx === activeCrayonIdx;
        const xPos = idx * 54;
        const yOffset = isSel ? -18 : 0;
        return `
        <g transform="translate(${xPos}, ${yOffset})">
          ${isSel ? `<rect x="-4" y="-8" width="46" height="150" rx="12" fill="none" stroke="${col}" stroke-width="4" />` : ''}
          <rect x="0" y="30" width="38" height="100" rx="8" fill="${col}" stroke="#1E293B" stroke-width="2.5" />
          <polygon points="19,0 0,30 38,30" fill="${col}" stroke="#1E293B" stroke-width="2.5" stroke-linejoin="round" />
          <rect x="0" y="65" width="38" height="35" fill="#FFFFFF" stroke="#1E293B" stroke-width="1.5" />
        </g>`;
      }).join('\n')}
    </g>
  </g>

  <!-- ================= BOTTOM CALL TO ACTION BANNER ================= -->
  <g transform="translate(80, 1780)">
    <rect x="0" y="0" width="920" height="90" rx="45" fill="url(#brandBtnGrad)" />
    <text x="460" y="56" text-anchor="middle" font-size="30" font-weight="bold" fill="#FFFFFF" class="font-bold" letter-spacing="1">
      ${isFinale ? 'COLOR &amp; PRINT FREE AT WWW.COLORO.IN' : 'PLAY &amp; COLOR FREE AT WWW.COLORO.IN'}
    </text>
  </g>

  ${confettiSvg}
</svg>`;
}

/**
 * Builds the complete 1920x1080 SVG for a single widescreen video frame (16:9 Desktop View)
 */
function buildFrameSvg16x9(
  template: Template,
  pathsInfo: PathInfo[],
  frameIndex: number,
  totalFrames: number,
  fps: number,
  viewBox: { x: number; y: number; w: number; h: number }
): string {
  const width = 1920;
  const height = 1080;
  const currentTime = frameIndex / fps;
  const totalDuration = totalFrames / fps;

  // Timeline phases
  const introDuration = 1.0;
  const finaleDuration = Math.min(4.0, Math.max(2.5, totalDuration * 0.10));
  const coloringDuration = Math.max(1, totalDuration - introDuration - finaleDuration);

  // Time per path
  const numPaths = pathsInfo.length;
  const timePerPath = coloringDuration / numPaths;

  let coloredCount = 0;
  let activePathIdx = -1;
  let activeProgress = 0;

  if (currentTime < introDuration) {
    coloredCount = 0;
    activePathIdx = 0;
    activeProgress = 0;
  } else if (currentTime >= introDuration + coloringDuration) {
    coloredCount = numPaths;
    activePathIdx = numPaths - 1;
    activeProgress = 1;
  } else {
    const elapsedColoring = currentTime - introDuration;
    activePathIdx = Math.min(numPaths - 1, Math.floor(elapsedColoring / timePerPath));
    activeProgress = (elapsedColoring % timePerPath) / timePerPath;
    coloredCount = activeProgress >= 0.40 ? activePathIdx + 1 : activePathIdx;
  }

  const isFinale = currentTime >= totalDuration - finaleDuration;
  const overallPercent = Math.min(100, Math.round((coloredCount / numPaths) * 100));

  // Canvas positioning on 1920x1080 screen
  const canvasX = 520;
  const canvasY = 115;
  const canvasW = 880;
  const canvasH = 750;
  const padding = 40;

  const scale = Math.min((canvasW - padding * 2) / viewBox.w, (canvasH - padding * 2) / viewBox.h);
  const offsetX = canvasX + (canvasW - viewBox.w * scale) / 2;
  const offsetY = canvasY + (canvasH - viewBox.h * scale) / 2;

  const toScreen = (pt: { x: number; y: number }) => ({
    x: offsetX + (pt.x - viewBox.x) * scale,
    y: offsetY + (pt.y - viewBox.y) * scale,
  });

  // Tray color buttons (14 colors on 16:9 dock)
  const trayColors = COLORS.slice(0, 14);
  const currentPath = activePathIdx >= 0 && activePathIdx < numPaths ? pathsInfo[activePathIdx] : pathsInfo[0];
  const activeColor = currentPath ? currentPath.color : COLORS[0];
  const activeMeta = currentPath ? currentPath.colorMeta : { name: 'Cherry Red', emoji: '🍒' };

  let activeCrayonIdx = trayColors.indexOf(activeColor);
  if (activeCrayonIdx === -1) activeCrayonIdx = (currentPath ? currentPath.crayonIndex : 0) % trayColors.length;

  const trayDockX = 360;
  const trayDockY = 890;
  const activeCrayonScreenPos = {
    x: trayDockX + 310 + activeCrayonIdx * 60 + 20,
    y: trayDockY + 52 + 40,
  };

  // Animated cursor motion
  let cursorX = 960;
  let cursorY = 490;
  let tapScale = 1;
  let showTapRipple = false;

  if (activePathIdx >= 0 && activePathIdx < numPaths) {
    const targetCanvasPos = toScreen(pathsInfo[activePathIdx].centroid);

    if (activeProgress < 0.30) {
      cursorX = activeCrayonScreenPos.x;
      cursorY = activeCrayonScreenPos.y;
      const subProg = activeProgress / 0.30;
      tapScale = 1 + Math.sin(subProg * Math.PI) * 0.15;
    } else if (activeProgress < 0.60) {
      const moveProgress = (activeProgress - 0.30) / 0.30;
      const ease = 1 - Math.pow(1 - moveProgress, 3);
      cursorX = activeCrayonScreenPos.x + (targetCanvasPos.x - activeCrayonScreenPos.x) * ease;
      cursorY = activeCrayonScreenPos.y + (targetCanvasPos.y - activeCrayonScreenPos.y) * ease;
    } else {
      cursorX = targetCanvasPos.x;
      cursorY = targetCanvasPos.y;
      const tapProg = (activeProgress - 0.60) / 0.40;
      tapScale = 1 + Math.sin(tapProg * Math.PI) * 0.25;

      if (activeProgress >= 0.40 && activeProgress <= 0.85) {
        showTapRipple = true;
      }
    }
  }

  // Paths SVG
  const pathsSvg = pathsInfo.map((p, idx) => {
    const isColored = idx < coloredCount;
    const fill = isColored ? p.color : '#FFFFFF';
    const stroke = '#1E293B';
    const sw = Math.max(p.strokeWidth * 0.85, 3.8);
    return `<path d="${escapeXml(p.d)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join('\n        ');

  // Confetti
  let confettiSvg = '';
  if (isFinale) {
    const finaleElapsed = currentTime - (totalDuration - finaleDuration);
    const confettiProgress = finaleElapsed / finaleDuration;
    const confettiCount = 80;
    const confettiElements: string[] = [];
    const confettiColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FFD700'];

    for (let c = 0; c < confettiCount; c++) {
      const seed = c * 17.37;
      const startX = 50 + pseudoRandom(seed) * 1820;
      const speed = 600 + pseudoRandom(seed + 1) * 800;
      const currentY = -40 + confettiProgress * speed;
      const drift = Math.sin(confettiProgress * 8 + seed) * 60;
      const color = confettiColors[c % confettiColors.length];
      const size = 12 + pseudoRandom(seed + 2) * 14;
      const rotation = confettiProgress * 720 + seed * 60;

      if (currentY > 0 && currentY < 1080) {
        confettiElements.push(
          `<rect x="${startX + drift}" y="${currentY}" width="${size}" height="${size * 0.6}" fill="${color}" rx="3" transform="rotate(${rotation} ${startX + drift + size / 2} ${currentY + size * 0.3})" opacity="${Math.max(0, 1 - confettiProgress * 0.2)}" />`
        );
      }
    }
    confettiSvg = confettiElements.join('\n    ');
  }

  const progressBarWidth = Math.round(320 * (overallPercent / 100));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandBtnGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FF5252" />
      <stop offset="50%" stop-color="#FF7675" />
      <stop offset="100%" stop-color="#FFAA00" />
    </linearGradient>
  </defs>

  <style>
    .font-sans { font-family: 'Arial', sans-serif; }
    .font-bold { font-family: 'Arial', sans-serif; font-weight: bold; }
  </style>

  <!-- App Studio Canvas Cream Background -->
  <rect width="${width}" height="${height}" fill="#FBF9F1" />

  <!-- ================= TOP APP NAVBAR (1920x1080 Real App) ================= -->
  <rect x="0" y="0" width="${width}" height="85" fill="#FFFFFF" />
  <line x1="0" y1="85" x2="${width}" y2="85" stroke="#EBE8DC" stroke-width="2" />

  <!-- Real Coloro Rainbow Logo -->
  ${LOGO_BASE64 ? `
  <image href="data:image/png;base64,${LOGO_BASE64}" x="40" y="10" width="220" height="65" preserveAspectRatio="xMidYMid meet" />
  ` : `
  <g transform="translate(40, 25)">
    <text x="0" y="32" font-size="28" font-weight="bold" fill="#0F172A" class="font-bold">🎨 COLORO</text>
  </g>
  `}

  <!-- Mode Switcher & Template Title Pill -->
  <g transform="translate(300, 18)">
    <rect x="0" y="0" width="130" height="50" rx="16" fill="#F4F1DE" stroke="#E6E2D3" stroke-width="1.5" />
    <text x="65" y="32" text-anchor="middle" font-size="18" font-weight="bold" fill="#636E72" class="font-bold">Library</text>

    <rect x="145" y="0" width="160" height="50" rx="16" fill="#FFFFFF" stroke="#FF6B6B" stroke-width="2" />
    <text x="225" y="32" text-anchor="middle" font-size="18" font-weight="bold" fill="#FF6B6B" class="font-bold">Canvas</text>

    <!-- Template Name Pill -->
    <rect x="330" y="0" width="380" height="50" rx="25" fill="#FFFFFF" stroke="#EBE8DC" stroke-width="2" />
    <path d="M 350 18 L 352 23 L 357 25 L 352 27 L 350 32 L 348 27 L 343 25 L 348 23 Z" fill="#F59E0B" />
    <text x="530" y="32" text-anchor="middle" font-size="20" font-weight="bold" fill="#2D3436" class="font-bold">${escapeXml(template.name)}</text>
  </g>

  <!-- Action Buttons on Right -->
  <g transform="translate(1360, 18)">
    <!-- Undo -->
    <circle cx="25" cy="25" r="23" fill="#F4F1DE" stroke="#E6E2D3" stroke-width="1.5" />
    <path d="M 31 19 L 21 25 L 31 31 M 22 25 Q 29 22 34 27" fill="none" stroke="#636E72" stroke-width="2.5" stroke-linecap="round" />

    <!-- Redo -->
    <g transform="translate(60, 0)">
      <circle cx="25" cy="25" r="23" fill="#F4F1DE" stroke="#E6E2D3" stroke-width="1.5" />
      <path d="M 19 19 L 29 25 L 19 31 M 28 25 Q 21 22 16 27" fill="none" stroke="#636E72" stroke-width="2.5" stroke-linecap="round" />
    </g>

    <!-- Clear -->
    <g transform="translate(120, 0)">
      <circle cx="25" cy="25" r="23" fill="#FFF5F5" stroke="#FECACA" stroke-width="1.5" />
      <path d="M 18 17 L 32 17 M 21 17 L 22 32 L 28 32 L 29 17" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" />
    </g>

    <!-- Print Sheet -->
    <g transform="translate(180, 0)">
      <circle cx="25" cy="25" r="23" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" />
      <rect x="17" y="21" width="16" height="10" rx="2" fill="#15803D" />
      <rect x="20" y="17" width="10" height="5" fill="#86EFAC" />
      <rect x="20" y="26" width="10" height="6" fill="#FFFFFF" />
    </g>

    <!-- Live Website URL Badge -->
    <g transform="translate(250, 0)">
      <rect x="0" y="0" width="230" height="50" rx="25" fill="#FFF0F0" stroke="#FF8787" stroke-width="2" />
      <path d="M 20 19 L 28 25 L 20 31" fill="none" stroke="#E03131" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <text x="125" y="32" text-anchor="middle" font-size="18" font-weight="bold" fill="#E03131" class="font-bold">www.coloro.in</text>
    </g>
  </g>

  <!-- ================= LEFT SIDEBAR PANEL: INFO & CATEGORY ================= -->
  <g transform="translate(60, 145)">
    <rect x="0" y="0" width="380" height="340" rx="24" fill="#FFFFFF" stroke="#EBE8DC" stroke-width="2" />
    <text x="30" y="48" font-size="22" font-weight="bold" fill="#0F172A" class="font-bold">Coloro Kids Studio</text>
    <text x="30" y="85" font-size="16" fill="#64748B">Free interactive coloring app</text>

    <!-- Category Pill -->
    <rect x="30" y="115" width="220" height="42" rx="21" fill="#FFF9E6" stroke="#FFD93D" stroke-width="1.5" />
    <text x="140" y="142" text-anchor="middle" font-size="16" font-weight="bold" fill="#8C5B00" class="font-bold">Category: ${escapeXml(template.category)}</text>

    <!-- Difficulty Pill -->
    <rect x="30" y="172" width="220" height="42" rx="21" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" />
    <text x="140" y="199" text-anchor="middle" font-size="16" font-weight="bold" fill="#15803D" class="font-bold">Difficulty: ${escapeXml(template.difficulty || 'Easy')}</text>

    <!-- Features -->
    <text x="30" y="250" font-size="15" fill="#475569">• One-tap flood fill &amp; custom pens</text>
    <text x="30" y="280" font-size="15" fill="#475569">• Download printable PDF</text>
    <text x="30" y="310" font-size="15" fill="#475569">• 100+ Free Kids Pages</text>
  </g>

  <!-- ================= RIGHT SIDEBAR PANEL: PROGRESS & CALL TO ACTION ================= -->
  <g transform="translate(1480, 145)">
    <rect x="0" y="0" width="380" height="340" rx="24" fill="#FFFFFF" stroke="#EBE8DC" stroke-width="2" />
    <text x="30" y="48" font-size="22" font-weight="bold" fill="#0F172A" class="font-bold">Coloring Progress</text>

    <!-- Active Swatch Preview -->
    <circle cx="60" cy="110" r="28" fill="${activeColor}" stroke="#1E293B" stroke-width="3" />
    <text x="105" y="105" font-size="18" font-weight="bold" fill="#0F172A" class="font-bold">${escapeXml(activeMeta.name)}</text>
    <text x="105" y="128" font-size="15" fill="#64748B">Active Paint Color</text>

    <!-- Progress Bar -->
    <rect x="30" y="165" width="320" height="16" rx="8" fill="#E2E8F0" />
    <rect x="30" y="165" width="${progressBarWidth}" height="16" rx="8" fill="url(#brandBtnGrad)" />
    <text x="350" y="210" text-anchor="end" font-size="18" font-weight="bold" fill="#0F172A" class="font-bold">${overallPercent}% Complete</text>

    <!-- Big CTA Button -->
    <g transform="translate(30, 240)">
      <rect x="0" y="0" width="320" height="60" rx="30" fill="url(#brandBtnGrad)" />
      <text x="160" y="38" text-anchor="middle" font-size="18" font-weight="bold" fill="#FFFFFF" class="font-bold">COLOR FREE NOW</text>
    </g>
  </g>

  <!-- ================= MAIN CANVAS ARTBOARD ================= -->
  <rect x="${canvasX}" y="${canvasY + 6}" width="${canvasW}" height="${canvasH}" rx="28" fill="#000000" opacity="0.08" />
  <rect x="${canvasX}" y="${canvasY}" width="${canvasW}" height="${canvasH}" rx="28" fill="#FFFFFF" stroke="${isFinale ? '#F59E0B' : '#EBE8DC'}" stroke-width="${isFinale ? 5 : 3}" />
  <rect x="${canvasX + 14}" y="${canvasY + 14}" width="${canvasW - 28}" height="${canvasH - 28}" rx="18" fill="#FFFFFF" stroke="#F1EFE7" stroke-width="2" stroke-dasharray="8 6" />

  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale}) translate(${-viewBox.x}, ${-viewBox.y})">
    ${pathsSvg}
  </g>

  <!-- Tap Ripple Sparkle Effect on canvas -->
  ${showTapRipple ? `
  <g transform="translate(${cursorX}, ${cursorY})">
    <circle cx="0" cy="0" r="40" fill="none" stroke="${activeColor}" stroke-width="5" opacity="0.8" />
    <circle cx="0" cy="0" r="65" fill="none" stroke="${activeColor}" stroke-width="2.5" opacity="0.4" />
    <circle cx="0" cy="0" r="12" fill="${activeColor}" opacity="0.9" />
  </g>
  ` : ''}

  <!-- Animated Kid's Stylus Cursor -->
  ${!isFinale ? `
  <g transform="translate(${cursorX}, ${cursorY}) scale(${tapScale}) rotate(-35)">
    <rect x="-10" y="-96" width="26" height="90" rx="5" fill="#000000" opacity="0.2" />
    <rect x="-13" y="-100" width="26" height="90" rx="5" fill="${activeColor}" stroke="#1E293B" stroke-width="3" />
    <rect x="-13" y="-70" width="26" height="32" fill="#FFFFFF" stroke="#1E293B" stroke-width="2" />
    <text x="0" y="-50" text-anchor="middle" fill="#0F172A" font-size="9" font-weight="bold" transform="rotate(-90 0 -50)" class="font-bold">COLORO</text>
    <polygon points="0,0 -13,-10 13,-10" fill="${activeColor}" stroke="#1E293B" stroke-width="3" stroke-linejoin="round" />
  </g>
  ` : ''}

  <!-- ================= BOTTOM PALETTE TRAY (16:9 Authentic Dock) ================= -->
  <g transform="translate(${trayDockX}, ${trayDockY})">
    <g transform="translate(600, 0)">
      <rect x="-170" y="-30" width="340" height="42" rx="21" fill="#FFFFFF" stroke="${activeColor}" stroke-width="2.5" />
      <circle cx="-135" cy="-9" r="12" fill="${activeColor}" stroke="#1E293B" stroke-width="2" />
      <text x="15" y="-3" text-anchor="middle" font-size="18" font-weight="bold" fill="#2D3436" class="font-bold">
        ${escapeXml(activeMeta.name)} Active (${overallPercent}%)
      </text>
    </g>

    <rect x="0" y="20" width="1200" height="150" rx="26" fill="#FFFFFF" stroke="#EBE8DC" stroke-width="2.5" />
    <rect x="12" y="32" width="1176" height="126" rx="20" fill="#F8F6F0" stroke="#EFECE2" stroke-width="1.5" />

    <!-- Left Tools -->
    <g transform="translate(30, 48)">
      <!-- Fill -->
      <rect x="0" y="0" width="65" height="95" rx="14" fill="#FFFFFF" stroke="#FF6B6B" stroke-width="2.5" />
      <path d="M 22 28 L 44 28 L 40 50 L 26 50 Z" fill="#FF6B6B" stroke="#1E293B" stroke-width="2" stroke-linejoin="round" />
      <ellipse cx="33" cy="28" rx="11" ry="3.5" fill="#FFA8A8" stroke="#1E293B" stroke-width="1.5" />
      <text x="32" y="78" text-anchor="middle" font-size="13" font-weight="bold" fill="#FF6B6B" class="font-bold">FILL</text>

      <!-- Eraser -->
      <rect x="80" y="0" width="65" height="95" rx="14" fill="#FFFFFF" stroke="#E5E1D0" stroke-width="1.5" />
      <rect x="98" y="28" width="30" height="20" rx="3" fill="#F4F1DE" stroke="#1E293B" stroke-width="1.5" />
      <path d="M 98 36 L 128 36" stroke="#FF7675" stroke-width="4" />
      <text x="112" y="78" text-anchor="middle" font-size="13" font-weight="bold" fill="#636E72" class="font-bold">ERASER</text>

      <!-- Stamps -->
      <rect x="160" y="0" width="65" height="95" rx="14" fill="#FFFFFF" stroke="#E5E1D0" stroke-width="1.5" />
      <circle cx="192" cy="38" r="14" fill="#FFF3BF" stroke="#1E293B" stroke-width="1.5" />
      <circle cx="187" cy="34" r="1.5" fill="#1E293B" />
      <circle cx="197" cy="34" r="1.5" fill="#1E293B" />
      <path d="M 187 41 Q 192 46 197 41" fill="none" stroke="#1E293B" stroke-width="1.5" stroke-linecap="round" />
      <text x="192" y="78" text-anchor="middle" font-size="13" font-weight="bold" fill="#FF9F43" class="font-bold">STAMPS</text>
    </g>

    <line x1="280" y1="48" x2="280" y2="143" stroke="#E2DFD2" stroke-width="2" />

    <!-- 14 Standing 3D Crayons -->
    <g transform="translate(310, 52)">
      ${trayColors.map((col, idx) => {
        const isSel = idx === activeCrayonIdx;
        const xPos = idx * 60;
        const yOffset = isSel ? -14 : 0;
        return `
        <g transform="translate(${xPos}, ${yOffset})">
          ${isSel ? `<rect x="-3" y="-6" width="46" height="105" rx="10" fill="none" stroke="${col}" stroke-width="3.5" />` : ''}
          <rect x="0" y="24" width="40" height="68" rx="6" fill="${col}" stroke="#1E293B" stroke-width="2" />
          <polygon points="20,0 0,24 40,24" fill="${col}" stroke="#1E293B" stroke-width="2" stroke-linejoin="round" />
          <rect x="0" y="46" width="40" height="24" fill="#FFFFFF" stroke="#1E293B" stroke-width="1.5" />
        </g>`;
      }).join('\n')}
    </g>
  </g>

  <!-- Celebratory Finale Banner in 16:9 -->
  ${isFinale ? `
  <g transform="translate(560, 430)">
    <rect x="0" y="0" width="800" height="110" rx="28" fill="#FFFFFF" stroke="#F59E0B" stroke-width="4" />
    <text x="400" y="48" text-anchor="middle" font-size="30" font-weight="bold" fill="#D97706" class="font-bold">🎉 MASTERPIECE COMPLETE!</text>
    <text x="400" y="85" text-anchor="middle" font-size="20" font-weight="bold" fill="#0F172A" class="font-bold">Color and print 100+ sheets free at www.coloro.in</text>
  </g>
  ` : ''}

  <!-- Bottom Watermark Footer Bar -->
  <g transform="translate(0, 1055)">
    <rect x="0" y="0" width="${width}" height="25" fill="#0F172A" />
    <text x="${width / 2}" y="17" text-anchor="middle" font-size="13" font-weight="bold" fill="#FFFFFF" class="font-bold" letter-spacing="1">
      🎨 COLORO.IN • 100% FREE KIDS COLORING WEB APP • NO SIGNUP REQUIRED • PRINTABLE PDFS
    </text>
  </g>

  ${confettiSvg}
</svg>`;
}

/**
 * Builds the SVG for a single frame, selecting layout based on aspect ratio
 */
function buildFrameSvg(
  template: Template,
  pathsInfo: PathInfo[],
  frameIndex: number,
  totalFrames: number,
  fps: number,
  viewBox: { x: number; y: number; w: number; h: number },
  aspectRatio: '9:16' | '16:9' = '9:16'
): string {
  if (aspectRatio === '16:9') {
    return buildFrameSvg16x9(template, pathsInfo, frameIndex, totalFrames, fps, viewBox);
  }
  return buildFrameSvg9x16(template, pathsInfo, frameIndex, totalFrames, fps, viewBox);
}

/**
 * Reliably cleans up a temporary file or directory with retries for Windows locks
 */
export function cleanDirectoryOrFile(targetPath: string): void {
  try {
    if (!fs.existsSync(targetPath)) return;
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
    } else {
      fs.unlinkSync(targetPath);
    }
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Scans output directory and removes any stale or lingering .temp_* directories and files
 */
export function cleanupAllTempFiles(outputDir: string): void {
  try {
    if (!fs.existsSync(outputDir)) return;
    const entries = fs.readdirSync(outputDir);
    for (const entry of entries) {
      if (entry.startsWith('.temp_')) {
        cleanDirectoryOrFile(path.join(outputDir, entry));
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Main Video Generator function:
 * Converts template into an authentic Coloro App vertical 1080x1920 30FPS MP4 video with audio.
 */
export async function generateShortsVideo(
  template: Template,
  options: VideoGeneratorOptions = {}
): Promise<string> {
  const fps = options.fps || 24; // 24 FPS is the standard cinematic & fast rendering framerate
  const aspectRatio = options.aspectRatio || '9:16';
  const defaultDuration = aspectRatio === '16:9' ? 60 : 15;
  const durationSeconds = options.durationSeconds || defaultDuration;
  const totalFrames = fps * durationSeconds;
  const outputDir = options.outputDir || process.env.VIDEO_OUTPUT_DIR || (fs.existsSync('D:\\Hostiger_Deployment\\Insta_video') ? 'D:\\Hostiger_Deployment\\Insta_video' : path.resolve(process.cwd(), 'output', 'videos'));
  const includeAudio = options.includeAudio !== false;
  const width = aspectRatio === '16:9' ? 1920 : 1080;
  const height = aspectRatio === '16:9' ? 1080 : 1920;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Compute clean output filename with aspect suffix
  const suffix = aspectRatio === '16:9' ? 'widescreen' : 'short';
  const cleanName = (options.fileName || template.name || 'coloring_video')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const finalMp4Path = path.join(outputDir, `${cleanName}-${suffix}.mp4`);

  // Parse template viewBox
  const vbParts = (template.viewBox || '0 0 500 500').trim().split(/[\s,]+/).map(Number);
  const viewBox = {
    x: vbParts[0] || 0,
    y: vbParts[1] || 0,
    w: vbParts[2] || 500,
    h: vbParts[3] || 500,
  };

  // Prepare path information with semantic colors and centroids
  const rawPaths = template.paths || [];
  const pathsInfo: PathInfo[] = rawPaths.map((p, idx) => {
    const assignedColor = p.fill && p.fill !== 'none' && p.fill !== '#ffffff'
      ? p.fill
      : getSemanticColorForPath(p.id || `path-${idx}`, template.category, idx, rawPaths.length);

    const meta = COLOR_METADATA[assignedColor.toUpperCase()] || {
      name: 'Vibrant Tone',
      emoji: '🎨'
    };

    return {
      id: p.id || `path-${idx}`,
      d: p.d,
      stroke: p.stroke || '#000000',
      strokeWidth: p.strokeWidth || 5,
      color: assignedColor,
      centroid: extractPathCentroid(p.d, viewBox.w, viewBox.h),
      colorMeta: meta,
      crayonIndex: idx % (aspectRatio === '16:9' ? 14 : 10)
    };
  });

  // Calculate tap timestamps for audio synchronization
  const introDuration = aspectRatio === '16:9' ? 1.0 : 0.8;
  const finaleDuration = aspectRatio === '16:9'
    ? Math.min(4.0, Math.max(2.5, durationSeconds * 0.10))
    : Math.min(3.5, Math.max(2.4, durationSeconds * 0.15));
  const coloringDuration = Math.max(1, durationSeconds - introDuration - finaleDuration);
  const timePerPath = coloringDuration / pathsInfo.length;

  const tapTimestamps: number[] = pathsInfo.map((_, idx) => {
    return introDuration + idx * timePerPath + timePerPath * 0.40;
  });
  console.log(`🎬 Generating Authentic Coloro App Video (${aspectRatio} ${width}x${height}) for "${template.name}"...`);
  console.log(`   ⏱ Duration: ${durationSeconds}s | 🎞 FPS: ${fps} | 🖼 Total Frames: ${totalFrames}`);
  console.log(`   🎨 Paths to Color: ${pathsInfo.length} sections`);

  // Pre-cleanup any lingering temp files
  cleanupAllTempFiles(outputDir);

  // Create temporary directory for frame sequence
  const tempFramesDir = path.join(outputDir, `.temp_frames_${Date.now()}`);
  fs.mkdirSync(tempFramesDir, { recursive: true });

  // Create temporary audio WAV file if audio is enabled
  let tempAudioPath: string | null = null;
  if (includeAudio) {
    const audioWavBuffer = generateAudioWavBuffer(durationSeconds, tapTimestamps);
    tempAudioPath = path.join(outputDir, `.temp_audio_${Date.now()}.wav`);
    fs.writeFileSync(tempAudioPath, audioWavBuffer);
  }

  // Register process termination handlers to guarantee cleanup on exit or cancel
  const exitCleanup = () => {
    cleanDirectoryOrFile(tempFramesDir);
    if (tempAudioPath) cleanDirectoryOrFile(tempAudioPath);
  };
  process.once('SIGINT', exitCleanup);
  process.once('SIGTERM', exitCleanup);

  const startTime = Date.now();

  try {
    // Windows system font files for crisp, visible text
    const fontFiles: string[] = [];
    const possibleFonts = [
      'C:/Windows/Fonts/arial.ttf',
      'C:/Windows/Fonts/arialbd.ttf'
    ];
    for (const fp of possibleFonts) {
      if (fs.existsSync(fp)) fontFiles.push(fp);
    }

    const fontConfig = {
      fontFiles: fontFiles.length > 0 ? fontFiles : undefined,
      loadSystemFonts: false,
      defaultFontFamily: 'Arial',
    };

    // Render all frames to temporary PNG sequence in parallel batches
    const batchSize = 24; // Concurrently render 24 frames across all CPU cores

    for (let i = 0; i < totalFrames; i += batchSize) {
      const count = Math.min(batchSize, totalFrames - i);
      const batchIndices = Array.from({ length: count }, (_, k) => i + k);

      await Promise.all(
        batchIndices.map(async (f) => {
          const svgString = buildFrameSvg(template, pathsInfo, f, totalFrames, fps, viewBox, aspectRatio);
          const rendered = await renderAsync(svgString, {
            fitTo: { mode: 'width', value: width },
            font: fontConfig,
          });
          const pngBuffer = rendered.asPng();
          const frameFileName = `frame_${String(f).padStart(5, '0')}.png`;
          fs.writeFileSync(path.join(tempFramesDir, frameFileName), pngBuffer);
        })
      );

      const completed = Math.min(i + count, totalFrames);
      const pct = Math.round((completed / totalFrames) * 100);
      process.stdout.write(`   ⚡ Rendering frames (multi-core): ${completed}/${totalFrames} (${pct}%)...\r`);
    }
    console.log('');
    const renderTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ⚡ All frames rendered in ${renderTime}s! Encoding MP4 video...`);

    // Get ffmpeg binary path
    const ffmpegPath = ffmpegStatic;
    if (!ffmpegPath) {
      throw new Error('ffmpeg-static binary not found!');
    }

    // Setup ffmpeg arguments with ultrafast preset for maximum generation speed
    const ffmpegArgs: string[] = [
      '-y',
      '-threads', '0',
      '-framerate', `${fps}`,
      '-i', path.join(tempFramesDir, 'frame_%05d.png'),
    ];

    if (tempAudioPath && fs.existsSync(tempAudioPath)) {
      ffmpegArgs.push('-i', tempAudioPath);
    }

    ffmpegArgs.push(
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-threads', '0',
      '-crf', '22',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart'
    );

    if (tempAudioPath) {
      ffmpegArgs.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    }

    ffmpegArgs.push(finalMp4Path);

    // Run ffmpeg
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegPath, ffmpegArgs);
      let errOutput = '';
      proc.stderr?.on('data', (d) => {
        errOutput += d.toString();
      });
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}: ${errOutput}`));
      });
      proc.on('error', (err) => reject(err));
    });
  } finally {
    // Guaranteed removal of temporary frame sequence and temporary audio file
    cleanDirectoryOrFile(tempFramesDir);
    if (tempAudioPath) cleanDirectoryOrFile(tempAudioPath);
    cleanupAllTempFiles(outputDir);
    process.removeListener('SIGINT', exitCleanup);
    process.removeListener('SIGTERM', exitCleanup);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const fileSizeMb = (fs.statSync(finalMp4Path).size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Authentic Coloro App video generated successfully in ${elapsed}s!`);
  console.log(`   📁 Output: ${finalMp4Path} (${fileSizeMb} MB)`);

  return finalMp4Path;
}

export const generateColoringVideo = generateShortsVideo;
