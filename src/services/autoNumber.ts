/**
 * Turns ANY picture on the canvas into a Color by Number page at run time.
 * Every picture is reduced to "lines", the white areas between the lines are found with a flood fill, and
 * each area is traced into a numbered vector region:
 *  - vector pictures (library, AI and procedural SVG paths): the strokes are drawn onto a canvas first, so
 *    open lines (necks, legs, whiskers) act as walls and stay visible on top of the regions
 *  - raster pictures (Photo Art / AI line-art images): dark pixels are the lines
 * Neighbouring regions are always given different color slots, so the numbered palette stays small and clear.
 */

import { SvgPath, Template } from '../types';

export const AUTO_NUMBER_ID_PREFIX = 'auto-number-';

const MAX_REGIONS = 40;
const MAX_SLOTS = 8;
const RASTER_GRID = 400; // working resolution for raster pictures
const MIN_RASTER_CELLS = 40; // smaller white areas are treated as part of the lines
const MIN_INNER_RADIUS = 5; // roomy areas fit an 11x11-cell square
const MIN_SMALL_INNER_RADIUS = 2; // small but compact areas (eyes, tongue) only need a 5x5 square
const MIN_COMPACTNESS = 0.45; // area / bounding box: round shapes ~0.78, thin curved slivers well below 0.4
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
  strokeWidth: number,
  decor?: Template['decor']
): Template {
  const slotNames = assignSlots(regions.length, adjacency, areas, bgIndex);
  const slots: Record<string, string> = {};
  const paths = regions.map((r, i) => {
    const id = `region-${i}`;
    slots[id] = slotNames[i];
    // the background region has no outline of its own (it would only draw a frame around the page)
    return { id, d: r.d, strokeWidth: i === bgIndex ? 0 : strokeWidth };
  });
  return {
    id: `${AUTO_NUMBER_ID_PREFIX}${Date.now()}`,
    name: titleCase(name),
    category: 'colorbynumber',
    difficulty: paths.length > 24 ? 'Detailed' : paths.length > 12 ? 'Medium' : 'Easy',
    viewBox,
    paths,
    ...(decor ? { decor } : {}),
    numberMode: { slots, schemes: [] },
  };
}

/** Vector pictures: draw the strokes, find the areas they enclose, number those. */
export function autoNumberFromPaths(paths: SvgPath[], viewBox: string, name: string): Template | null {
  const [vx, vy, vw, vh] = viewBox.split(/[\s,]+/).map(Number);
  if (![vx, vy, vw, vh].every(Number.isFinite) || vw <= 0 || vh <= 0 || paths.length === 0) return null;

  const N = RASTER_GRID;
  const canvas = document.createElement('canvas');
  canvas.width = N;
  canvas.height = N;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, N, N);
  ctx.scale(N / vw, N / vh);
  ctx.translate(-vx, -vy);
  ctx.strokeStyle = '#000000';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // Lines are drawn a little thicker than on screen so small gaps between strokes do not leak
  ctx.lineWidth = vw * 0.012;
  try {
    for (const p of paths) ctx.stroke(new Path2D(p.d));
  } catch {
    return null; // bad path data
  }

  const { data } = ctx.getImageData(0, 0, N, N);
  const isLine = new Uint8Array(N * N);
  for (let c = 0; c < N * N; c++) isLine[c] = data[c * 4] < LINE_LUMINANCE ? 1 : 0;

  const decor = paths
    .filter((p) => p.d)
    .map((p) => ({ d: p.d, strokeWidth: (p.strokeWidth || 4) * 1.2 })); // same width the canvas draws these lines with
  return numberFromLineMask(isLine, name, viewBox, decor);
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
  return numberFromLineMask(isLine, name, '0 0 1000 1000');
}

/** Finds the areas enclosed by lines on the RASTER_GRID mask and turns them into a numbered template. */
function numberFromLineMask(isLine: Uint8Array, name: string, viewBox: string, decor?: Template['decor']): Template | null {
  const N = RASTER_GRID;

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

  // Thin slivers (gaps between doubled lines) are not worth a region: a number would not fit. Roomy areas
  // are kept; small areas are kept only if they are compact, round-ish shapes like an eye or a tongue.
  const white = new Uint8Array(N * N);
  for (let c = 0; c < N * N; c++) white[c] = comp[c] >= 0 ? 1 : 0;
  const roomy = coreFlags(white, comp, sizes.length, N, MIN_INNER_RADIUS);
  const small = coreFlags(white, comp, sizes.length, N, MIN_SMALL_INNER_RADIUS);
  const minX = new Int32Array(sizes.length).fill(N);
  const maxX = new Int32Array(sizes.length).fill(-1);
  const minY = new Int32Array(sizes.length).fill(N);
  const maxY = new Int32Array(sizes.length).fill(-1);
  for (let c = 0; c < N * N; c++) {
    const id = comp[c];
    if (id < 0) continue;
    const x = c % N;
    const y = (c / N) | 0;
    if (x < minX[id]) minX[id] = x;
    if (x > maxX[id]) maxX[id] = x;
    if (y < minY[id]) minY[id] = y;
    if (y > maxY[id]) maxY[id] = y;
  }
  const hasCore = new Uint8Array(sizes.length);
  for (let id = 0; id < sizes.length; id++) {
    const box = (maxX[id] - minX[id] + 1) * (maxY[id] - minY[id] + 1);
    const compact = box > 0 && sizes[id] / box >= MIN_COMPACTNESS;
    hasCore[id] = roomy[id] || (small[id] && compact) ? 1 : 0;
  }

  // 2. Keep the biggest areas; everything else becomes "line" and is absorbed below
  const kept = sizes
    .map((s, id) => ({ id, s }))
    .filter((e) => e.s >= MIN_RASTER_CELLS && hasCore[e.id])
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
  const [, , vbW] = viewBox.split(/[\s,]+/).map(Number);
  const [vbX, vbY, , vbH] = viewBox.split(/[\s,]+/).map(Number);
  const k = vbW / N;
  const regionCells: number[][] = Array.from({ length: count }, () => []);
  for (let c = 0; c < N * N; c++) if (label[c] >= 0) regionCells[label[c]].push(c);

  const regions = regionCells.map((cells, r) => ({ d: traceOutline(cells, label, r, N, k, vbX, vbY) }));
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

  return buildTemplate(name, viewBox, regions, adjacency, areas, bgIndex, decor ? 0 : 5, decor);
}

/** Boundary of a set of grid cells as a closed SVG path (holes included), with straight runs merged. */
function traceOutline(cells: number[], label: Int32Array, r: number, N: number, k: number, ox = 0, oy = 0): string {
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
      d += 'M ' + simple.map(([x, y]) => `${+(ox + x * k).toFixed(1)},${+(oy + y * k).toFixed(1)}`).join(' L ') + ' Z ';
    }
  }
  return d.trim();
}

/** Per area: does it contain a (2R+1)x(2R+1) square of white cells? (separable erosion of the white mask) */
function coreFlags(white: Uint8Array, comp: Int32Array, count: number, N: number, R: number): Uint8Array {
  const horiz = new Uint8Array(N * N);
  for (let y = 0; y < N; y++) {
    for (let x = R; x < N - R; x++) {
      let ok = 1;
      for (let d = -R; d <= R && ok; d++) ok = white[y * N + x + d];
      horiz[y * N + x] = ok;
    }
  }
  const flags = new Uint8Array(count);
  for (let y = R; y < N - R; y++) {
    for (let x = 0; x < N; x++) {
      let ok = 1;
      for (let d = -R; d <= R && ok; d++) ok = horiz[(y + d) * N + x];
      if (ok) flags[comp[y * N + x]] = 1;
    }
  }
  return flags;
}
