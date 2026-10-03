/**
 * Turns ANY picture on the canvas into a Color by Number page at run time.
 *  - vector pictures (library, AI and procedural SVG paths): every closed shape becomes a numbered region
 *  - raster pictures (Photo Art / AI line-art images): the white areas between the lines are found with a
 *    flood fill, then traced into vector regions
 * Neighbouring regions are always given different color slots, so the numbered palette stays small and clear.
 */

import { SvgPath, Template } from '../types';

export const AUTO_NUMBER_ID_PREFIX = 'auto-number-';

const MAX_REGIONS = 40;
const MAX_SLOTS = 8;
const OWNER_GRID = 64; // sampling grid for vector pictures
const MIN_VECTOR_CELLS = 6; // visible area (of 64x64) below which a shape is too small to tap
const RASTER_GRID = 320; // working resolution for raster pictures
const MIN_RASTER_CELLS = 150; // smaller white areas are treated as part of the lines
const LINE_LUMINANCE = 150; // darker than this = a line

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** Gives each region a slot so that touching regions never share one (greedy graph coloring). */
function assignSlots(count: number, adjacency: Set<number>[], areas: number[], bgIndex: number): string[] {
  const slots: string[] = new Array(count);
  const used = new Array(count).fill(-1);
  if (bgIndex >= 0) slots[bgIndex] = 'bg';

  const order = [...Array(count).keys()]
    .filter((i) => i !== bgIndex)
    .sort((a, b) => adjacency[b].size - adjacency[a].size || areas[b] - areas[a]);

  const slotUse = new Array(MAX_SLOTS).fill(0);
  for (const i of order) {
    const taken = new Set<number>();
    adjacency[i].forEach((n) => {
      if (used[n] >= 0) taken.add(used[n]);
    });
    let pick = -1;
    // prefer a free slot that is already in use (keeps the palette small), then any free slot
    for (let s = 0; s < MAX_SLOTS; s++) {
      if (!taken.has(s) && slotUse[s] > 0 && (pick < 0 || slotUse[s] < slotUse[pick])) pick = s;
    }
    if (pick < 0) {
      for (let s = 0; s < MAX_SLOTS; s++) {
        if (!taken.has(s)) {
          pick = s;
          break;
        }
      }
    }
    if (pick < 0) pick = slotUse.indexOf(Math.min(...slotUse)); // out of colors: reuse the rarest one
    used[i] = pick;
    slotUse[pick]++;
    slots[i] = `c${pick}`;
  }
  return slots;
}

function buildTemplate(
  name: string,
  viewBox: string,
  regions: { d: string }[],
  adjacency: Set<number>[],
  areas: number[],
  bgIndex: number,
  strokeWidth: number
): Template {
  const slotNames = assignSlots(regions.length, adjacency, areas, bgIndex);
  const slots: Record<string, string> = {};
  const paths = regions.map((r, i) => {
    const id = `region-${i}`;
    slots[id] = slotNames[i];
    return { id, d: r.d, strokeWidth };
  });
  return {
    id: `${AUTO_NUMBER_ID_PREFIX}${Date.now()}`,
    name: titleCase(name),
    category: 'colorbynumber',
    difficulty: paths.length > 24 ? 'Detailed' : paths.length > 12 ? 'Medium' : 'Easy',
    viewBox,
    paths,
    numberMode: { slots, schemes: [] },
  };
}

/** Vector pictures: closed shapes -> numbered regions. */
export function autoNumberFromPaths(paths: SvgPath[], viewBox: string, name: string): Template | null {
  const [vx, vy, vw, vh] = viewBox.split(/[\s,]+/).map(Number);
  if (![vx, vy, vw, vh].every(Number.isFinite) || vw <= 0 || vh <= 0) return null;

  const closed = paths.filter((p) => p.d && /z\s*$/i.test(p.d.trim()));
  if (closed.length === 0) return null;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', '10');
  svg.setAttribute('height', '10');
  svg.style.cssText = 'position:absolute;left:-9999px;top:0;opacity:0;pointer-events:none';
  const els = closed.map((p) => {
    const el = document.createElementNS(ns, 'path');
    el.setAttribute('d', p.d);
    svg.appendChild(el);
    return el;
  });
  document.body.appendChild(svg);

  // owner[j][i] = index of the topmost shape at that sample point (-1 = bare paper)
  const owner: number[][] = [];
  try {
    const pt = svg.createSVGPoint();
    for (let j = 0; j < OWNER_GRID; j++) {
      const row: number[] = [];
      for (let i = 0; i < OWNER_GRID; i++) {
        pt.x = vx + ((i + 0.5) / OWNER_GRID) * vw;
        pt.y = vy + ((j + 0.5) / OWNER_GRID) * vh;
        let hit = -1;
        for (let k = els.length - 1; k >= 0; k--) {
          if (els[k].isPointInFill(pt)) {
            hit = k;
            break;
          }
        }
        row.push(hit);
      }
      owner.push(row);
    }
  } catch {
    return null;
  } finally {
    document.body.removeChild(svg);
  }

  const visible = new Array(closed.length).fill(0);
  let bare = 0;
  owner.forEach((row) => row.forEach((o) => (o >= 0 ? visible[o]++ : bare++)));

  // Largest visible shapes first, then restore painting order
  let keep = closed
    .map((_, i) => i)
    .filter((i) => visible[i] >= MIN_VECTOR_CELLS)
    .sort((a, b) => visible[b] - visible[a])
    .slice(0, MAX_REGIONS)
    .sort((a, b) => a - b);

  const needsBackground = bare > OWNER_GRID * OWNER_GRID * 0.1;
  const regions: { d: string }[] = [];
  const areas: number[] = [];
  const indexOf = new Map<number, number>();
  let bgIndex = -1;

  if (needsBackground) {
    const m = vw * 0.04;
    regions.push({
      d: `M ${vx + m},${vy + m} L ${vx + vw - m},${vy + m} L ${vx + vw - m},${vy + vh - m} L ${vx + m},${vy + vh - m} Z`,
    });
    areas.push(bare);
    bgIndex = 0;
  }
  for (const i of keep) {
    indexOf.set(i, regions.length);
    regions.push({ d: closed[i].d });
    areas.push(visible[i]);
  }
  if (regions.length < 3) return null;

  const adjacency: Set<number>[] = regions.map(() => new Set<number>());
  const link = (a: number, b: number) => {
    if (a === b) return;
    const ra = a < 0 ? bgIndex : indexOf.get(a) ?? -1;
    const rb = b < 0 ? bgIndex : indexOf.get(b) ?? -1;
    if (ra < 0 || rb < 0 || ra === rb) return;
    adjacency[ra].add(rb);
    adjacency[rb].add(ra);
  };
  for (let j = 0; j < OWNER_GRID; j++) {
    for (let i = 0; i < OWNER_GRID; i++) {
      if (i + 1 < OWNER_GRID) link(owner[j][i], owner[j][i + 1]);
      if (j + 1 < OWNER_GRID) link(owner[j][i], owner[j + 1][i]);
    }
  }

  return buildTemplate(name, viewBox, regions, adjacency, areas, bgIndex, 6 * (vw / 1000));
}

/** Raster pictures: white areas between the lines -> numbered regions. */
export async function autoNumberFromImage(imageUrl: string, name: string): Promise<Template | null> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Could not load picture'));
    el.src = imageUrl;
  });

  const N = RASTER_GRID;
  const canvas = document.createElement('canvas');
  canvas.width = N;
  canvas.height = N;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, N, N);
  ctx.drawImage(img, 0, 0, N, N);
  const { data } = ctx.getImageData(0, 0, N, N);

  // label[c] = region index (>=0), -1 = line / not yet assigned
  const isLine = new Uint8Array(N * N);
  for (let c = 0; c < N * N; c++) {
    const lum = 0.299 * data[c * 4] + 0.587 * data[c * 4 + 1] + 0.114 * data[c * 4 + 2];
    isLine[c] = lum < LINE_LUMINANCE ? 1 : 0;
  }

  // 1. Connected white areas
  const comp = new Int32Array(N * N).fill(-1);
  const sizes: number[] = [];
  const stack: number[] = [];
  for (let start = 0; start < N * N; start++) {
    if (isLine[start] || comp[start] >= 0) continue;
    const id = sizes.length;
    let size = 0;
    comp[start] = id;
    stack.push(start);
    while (stack.length) {
      const c = stack.pop()!;
      size++;
      const x = c % N;
      const y = (c / N) | 0;
      if (x > 0 && !isLine[c - 1] && comp[c - 1] < 0) (comp[c - 1] = id), stack.push(c - 1);
      if (x < N - 1 && !isLine[c + 1] && comp[c + 1] < 0) (comp[c + 1] = id), stack.push(c + 1);
      if (y > 0 && !isLine[c - N] && comp[c - N] < 0) (comp[c - N] = id), stack.push(c - N);
      if (y < N - 1 && !isLine[c + N] && comp[c + N] < 0) (comp[c + N] = id), stack.push(c + N);
    }
    sizes.push(size);
  }

  // 2. Keep the biggest areas; everything else becomes "line" and is absorbed below
  const kept = sizes
    .map((s, id) => ({ id, s }))
    .filter((e) => e.s >= MIN_RASTER_CELLS)
    .sort((a, b) => b.s - a.s);
  // Too detailed (typical for photo art): numbering it would be tiny, fiddly spots, so skip it
  if (kept.length < 3 || kept.length > MAX_REGIONS) return null;
  const newIndex = new Map<number, number>(kept.map((e, i) => [e.id, i]));

  const label = new Int32Array(N * N).fill(-1);
  const queue: number[] = [];
  for (let c = 0; c < N * N; c++) {
    const r = comp[c] >= 0 ? newIndex.get(comp[c]) : undefined;
    if (r !== undefined) {
      label[c] = r;
      queue.push(c);
    }
  }

  // 3. Grow regions over the lines so the picture is fully split into regions with no gaps
  for (let head = 0; head < queue.length; head++) {
    const c = queue[head];
    const x = c % N;
    const y = (c / N) | 0;
    const spread = (n: number) => {
      if (label[n] < 0) {
        label[n] = label[c];
        queue.push(n);
      }
    };
    if (x > 0) spread(c - 1);
    if (x < N - 1) spread(c + 1);
    if (y > 0) spread(c - N);
    if (y < N - 1) spread(c + N);
  }

  // 4. Areas, adjacency
  const count = kept.length;
  const areas = new Array(count).fill(0);
  const adjacency: Set<number>[] = Array.from({ length: count }, () => new Set<number>());
  for (let c = 0; c < N * N; c++) {
    const l = label[c];
    if (l < 0) continue;
    areas[l]++;
    const x = c % N;
    if (x < N - 1 && label[c + 1] >= 0 && label[c + 1] !== l) {
      adjacency[l].add(label[c + 1]);
      adjacency[label[c + 1]].add(l);
    }
    if (c + N < N * N && label[c + N] >= 0 && label[c + N] !== l) {
      adjacency[l].add(label[c + N]);
      adjacency[label[c + N]].add(l);
    }
  }

  // 5. Trace each region's outline into a path
  const SIZE = 1000;
  const k = SIZE / N;
  const regionCells: number[][] = Array.from({ length: count }, () => []);
  for (let c = 0; c < N * N; c++) if (label[c] >= 0) regionCells[label[c]].push(c);

  const regions = regionCells.map((cells, r) => ({ d: traceOutline(cells, label, r, N, k) }));
  if (regions.some((r) => !r.d)) return null;

  // The region touching the picture's edge with the most area is treated as the background
  let bgIndex = -1;
  let bgScore = 0;
  for (let r = 0; r < count; r++) {
    const edge = regionCells[r].filter((c) => c % N === 0 || c % N === N - 1 || c < N || c >= N * (N - 1)).length;
    if (edge > bgScore && areas[r] > N * N * 0.15) {
      bgScore = edge;
      bgIndex = r;
    }
  }

  return buildTemplate(name, `0 0 ${SIZE} ${SIZE}`, regions, adjacency, areas, bgIndex, 5);
}

/** Boundary of a set of grid cells as a closed SVG path (holes included), with straight runs merged. */
function traceOutline(cells: number[], label: Int32Array, r: number, N: number, k: number): string {
  // directed edges, clockwise around every cell, only where the neighbour is a different region
  const out = new Map<number, number[]>(); // start vertex -> end vertices
  const V = N + 1;
  const add = (x1: number, y1: number, x2: number, y2: number) => {
    const a = y1 * V + x1;
    const list = out.get(a);
    if (list) list.push(y2 * V + x2);
    else out.set(a, [y2 * V + x2]);
  };
  for (const c of cells) {
    const x = c % N;
    const y = (c / N) | 0;
    if (y === 0 || label[c - N] !== r) add(x, y, x + 1, y);
    if (x === N - 1 || label[c + 1] !== r) add(x + 1, y, x + 1, y + 1);
    if (y === N - 1 || label[c + N] !== r) add(x + 1, y + 1, x, y + 1);
    if (x === 0 || label[c - 1] !== r) add(x, y + 1, x, y);
  }

  let d = '';
  for (const [startKey] of out) {
    while (out.get(startKey)?.length) {
      const loop: number[] = [startKey];
      let cur = startKey;
      for (;;) {
        const next = out.get(cur)?.pop();
        if (next === undefined) break;
        if (next === startKey) break;
        loop.push(next);
        cur = next;
      }
      // merge collinear points
      const pts = loop.map((v) => [v % V, (v / V) | 0]);
      const simple: number[][] = [];
      for (let i = 0; i < pts.length; i++) {
        const prev = pts[(i + pts.length - 1) % pts.length];
        const cur2 = pts[i];
        const nxt = pts[(i + 1) % pts.length];
        const cross = (cur2[0] - prev[0]) * (nxt[1] - cur2[1]) - (cur2[1] - prev[1]) * (nxt[0] - cur2[0]);
        if (cross !== 0) simple.push(cur2);
      }
      if (simple.length < 3) continue;
      d += 'M ' + simple.map(([x, y]) => `${+(x * k).toFixed(1)},${+(y * k).toFixed(1)}`).join(' L ') + ' Z ';
    }
  }
  return d.trim();
}
