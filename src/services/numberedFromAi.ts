/**
 * Turns an AI picture (paths with a "slot" each, drawn back to front) into a Color by Number template.
 * AI geometry is unreliable, so every picture is measured and rejected if it isn't kid-friendly.
 */

import { SvgPath, Template } from '../types';

/** Simple subjects that make good numbered pictures (used when the child just taps "surprise me"). */
export const NUMBER_AI_SUBJECTS = [
  'a happy elephant',
  'a cute bunny',
  'a friendly dinosaur',
  'a smiling snail',
  'a cute penguin',
  'an ice cream cone',
  'a tall giraffe',
  'a happy frog on a lily pad',
  'a cute pig',
  'a big smiling whale',
  'a cheerful bee with a flower',
  'a school bus',
  'a train engine',
  'an airplane in the sky',
  'a cupcake with a cherry',
  'a lighthouse by the sea',
  'a hot air balloon',
  'a happy cow on a farm',
  'a cute teddy bear',
  'a snowman',
];

const GRID = 48; // sampling grid used to measure what part of each shape is actually visible
const MIN_VISIBLE_CELLS = 8; // ~0.35% of the picture: smaller shapes are too tiny to tap
const MAX_SLOTS = 8; // keeps the numbered palette small
const MIN_REGIONS = 5;
const MAX_REGIONS = 24;

const titleCase = (s: string) => s.replace(/^(a|an|the)\s+/i, '').replace(/\b\w/g, c => c.toUpperCase());

export function buildNumberTemplateFromAi(paths: SvgPath[], viewBox: string, subject: string): Template | null {
  const [vx, vy, vw, vh] = viewBox.split(/[\s,]+/).map(Number);
  if (![vx, vy, vw, vh].every(Number.isFinite) || vw <= 0 || vh <= 0) return null;

  // Only closed shapes with a slot can become numbered regions
  const closed = paths.filter(p => p.d && /z\s*$/i.test(p.d.trim()) && p.slot);
  if (closed.length < MIN_REGIONS) return null;

  // Measure the visible area of each shape (topmost shape wins at every sample point)
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', '10');
  svg.setAttribute('height', '10');
  svg.style.cssText = 'position:absolute;left:-9999px;top:0;opacity:0;pointer-events:none';
  const els = closed.map(p => {
    const el = document.createElementNS(ns, 'path');
    el.setAttribute('d', p.d);
    svg.appendChild(el);
    return el;
  });
  document.body.appendChild(svg);

  const visible = new Array(closed.length).fill(0);
  try {
    const pt = svg.createSVGPoint();
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        pt.x = vx + ((i + 0.5) / GRID) * vw;
        pt.y = vy + ((j + 0.5) / GRID) * vh;
        for (let k = els.length - 1; k >= 0; k--) {
          if (els[k].isPointInFill(pt)) {
            visible[k]++;
            break;
          }
        }
      }
    }
  } catch {
    return null; // geometry could not be measured (bad path data)
  } finally {
    document.body.removeChild(svg);
  }

  // Drop shapes whose visible part is too small; they would be untappable slivers
  let kept = closed.filter((_, i) => visible[i] >= MIN_VISIBLE_CELLS);
  const keptVisible = visible.filter(v => v >= MIN_VISIBLE_CELLS);

  // Make sure there is a background so no region is "empty paper"
  const hasBackground = keptVisible.some(v => v > GRID * GRID * 0.4);
  const k = vw / 1000;
  const rects: SvgPath[] = [];
  if (!hasBackground) {
    const m = vw * 0.04;
    rects.push({
      id: 'background',
      slot: 'bg',
      d: `M ${vx + m},${vy + m} L ${vx + vw - m},${vy + m} L ${vx + vw - m},${vy + vh - m} L ${vx + m},${vy + vh - m} Z`,
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeWidth: 6 * k,
    });
  }
  kept = [...rects, ...kept];
  if (kept.length < MIN_REGIONS || kept.length > MAX_REGIONS) return null;

  // Keep the palette small: the most-used slots stay, the rest share one "accent" color
  const slotCount: Record<string, number> = {};
  kept.forEach(p => (slotCount[p.slot!] = (slotCount[p.slot!] ?? 0) + 1));
  const topSlots = new Set(
    Object.entries(slotCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_SLOTS)
      .map(([s]) => s)
  );

  const slots: Record<string, string> = {};
  const outPaths = kept.map((p, idx) => {
    const id = `${(p.id || 'part').replace(/[^a-zA-Z0-9_-]/g, '')}-${idx}`;
    slots[id] = topSlots.has(p.slot!) ? p.slot! : 'accent';
    return { id, d: p.d, strokeWidth: 6 * k };
  });

  return {
    id: `ai-number-${Date.now()}`,
    name: titleCase(subject),
    category: 'colorbynumber',
    difficulty: outPaths.length > 14 ? 'Medium' : 'Easy',
    viewBox,
    paths: outPaths,
    numberMode: { slots, schemes: [] },
  };
}
