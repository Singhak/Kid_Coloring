/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Converts Hex color string (#RRGGBB or #RGB) to RGBA object
 */
export function hexToRgba(hex: string): RGBA {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    a: 255
  };
}

/**
 * Converts Hex color string to 32-bit integer (little endian ABGR format)
 */
export function hexToUint32(hex: string): number {
  const { r, g, b, a } = hexToRgba(hex);
  return (a << 24) | (b << 16) | (g << 8) | r;
}

/**
 * Generates HSL to RGBA 32-bit for rainbow patterns
 */
function hslToUint32(h: number, s: number, l: number): number {
  h = (h % 360) / 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const rInt = Math.round(r * 255);
  const gInt = Math.round(g * 255);
  const bInt = Math.round(b * 255);
  return (255 << 24) | (bInt << 16) | (gInt << 8) | rInt;
}

/**
 * Fast pixel generator for Special Patterns (Glitter, Rainbow, Polka dots, Hearts, Stars)
 */
function getPatternPixel32(patternType: string, x: number, y: number): number {
  switch (patternType) {
    case 'pattern:glitter': {
      // Golden shimmering base with multi-tone glitter sparks
      const noise = ((x * 1299721 + y * 179426549 + (x ^ y) * 982451653) >>> 0) % 100;
      if (noise < 8) return 0xFFFFFFFF; // Pure white sparkle
      if (noise < 20) return 0xFF5CE1E6; // Cyan shimmer
      if (noise < 35) return 0xFF45B6FE; // Golden-orange sparkle
      if (noise < 50) return 0xFFFF70A6; // Purple-pink gleam
      return 0xFF28A745; // Emerald base or Gold base
    }

    case 'pattern:rainbow': {
      // Diagonal smooth rainbow ribbon
      const hue = Math.floor(((x + y) * 0.8) % 360);
      return hslToUint32(hue, 0.9, 0.6);
    }

    case 'pattern:polka_dots': {
      // Yellow base with Coral polka dots
      const cellX = (x % 28) - 14;
      const cellY = (y % 28) - 14;
      const distSq = cellX * cellX + cellY * cellY;
      if (distSq <= 36) {
        return 0xFF6B6BFF; // Coral dots (#FF6B6B)
      }
      return 0xFF3DD9FF; // Butter yellow base (#FFD93D)
    }

    case 'pattern:hearts': {
      // Soft baby pink with deep pink mini hearts
      const cellX = (x % 30) - 15;
      const cellY = (y % 30) - 15;
      // Approximate heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const nx = cellX / 8;
      const ny = -cellY / 8;
      const heart = (nx * nx + ny * ny - 1) ** 3 - nx * nx * ny * ny * ny;
      if (heart <= 0) {
        return 0xFF6D4DFF; // Deep pink heart (#FF4D6D)
      }
      return 0xFFECE5FF; // Pastel pink base (#FFE5EC)
    }

    case 'pattern:stars': {
      // Midnight violet with golden star sparkle
      const cellX = Math.abs((x % 32) - 16);
      const cellY = Math.abs((y % 32) - 16);
      if (cellX + cellY <= 5 || (cellX === 0 && cellY <= 7) || (cellY === 0 && cellX <= 7)) {
        return 0xFF66D1FF; // Golden star (#FFD166)
      }
      return 0xFF422D2B; // Midnight navy/violet base (#2B2D42)
    }

    default:
      return 0xFF000000;
  }
}

/**
 * Determines if a pixel in line art canvas is a boundary (dark outline)
 */
function isLineArtBoundary(
  lineArtData: Uint8ClampedArray,
  index: number,
  darkThreshold = 110
): boolean {
  const a = lineArtData[index + 3];
  if (a < 30) return false; // Transparent = not a boundary

  const r = lineArtData[index];
  const g = lineArtData[index + 1];
  const b = lineArtData[index + 2];
  
  // Perceived brightness (luminance)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < darkThreshold;
}

/**
 * Checks if two colors in paint canvas are considered matching within a tolerance
 */
function colorMatch(
  paintData: Uint8ClampedArray,
  index: number,
  targetR: number,
  targetG: number,
  targetB: number,
  targetA: number,
  tolerance = 30
): boolean {
  const r = paintData[index];
  const g = paintData[index + 1];
  const b = paintData[index + 2];
  const a = paintData[index + 3];

  return (
    Math.abs(r - targetR) <= tolerance &&
    Math.abs(g - targetG) <= tolerance &&
    Math.abs(b - targetB) <= tolerance &&
    Math.abs(a - targetA) <= tolerance
  );
}

/**
 * High-performance Scanline Flood Fill Algorithm with Pattern & Glitter support
 */
export function performFloodFill(
  paintCtx: CanvasRenderingContext2D,
  lineArtCtx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance = 32
): boolean {
  const width = paintCtx.canvas.width;
  const height = paintCtx.canvas.height;

  startX = Math.floor(startX);
  startY = Math.floor(startY);

  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    return false;
  }

  const paintImgData = paintCtx.getImageData(0, 0, width, height);
  const lineArtImgData = lineArtCtx.getImageData(0, 0, width, height);

  const paintData = paintImgData.data;
  const lineArtData = lineArtImgData.data;

  // 32-bit views for speed
  const paintData32 = new Uint32Array(paintData.buffer);

  const isPattern = fillColorHex.startsWith('pattern:');
  const targetFillRgba = isPattern ? { r: 0, g: 0, b: 0, a: 255 } : hexToRgba(fillColorHex);
  const targetFill32 = isPattern ? 0 : ((targetFillRgba.a << 24) | (targetFillRgba.b << 16) | (targetFillRgba.g << 8) | targetFillRgba.r);

  let startIndex = (startY * width + startX) * 4;

  // If clicked directly on a line, look around in a 5x5 neighborhood for the nearest open region
  if (isLineArtBoundary(lineArtData, startIndex, 95)) {
    let found = false;
    for (let radius = 1; radius <= 4; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = startX + dx;
          const ny = startY + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = (ny * width + nx) * 4;
            if (!isLineArtBoundary(lineArtData, nIdx, 95)) {
              startX = nx;
              startY = ny;
              startIndex = nIdx;
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
      if (found) break;
    }
    if (!found) return false;
  }

  const targetR = paintData[startIndex];
  const targetG = paintData[startIndex + 1];
  const targetB = paintData[startIndex + 2];
  const targetA = paintData[startIndex + 3];

  // If not a pattern, avoid filling if already exact same color
  if (
    !isPattern &&
    Math.abs(targetR - targetFillRgba.r) < 5 &&
    Math.abs(targetG - targetFillRgba.g) < 5 &&
    Math.abs(targetB - targetFillRgba.b) < 5 &&
    Math.abs(targetA - targetFillRgba.a) < 5
  ) {
    return false;
  }

  // Visited map to prevent infinite loops
  const visited = new Uint8Array(width * height);

  // Queue-based Scanline Flood Fill
  const stack: [number, number][] = [[startX, startY]];
  visited[startY * width + startX] = 1;

  let modifiedPixels = 0;

  while (stack.length > 0) {
    const [currX, currY] = stack.pop()!;
    let lx = currX;

    // Scan left
    while (lx > 0) {
      const nextX = lx - 1;
      const pos = currY * width + nextX;
      const idx = pos * 4;

      if (visited[pos] || isLineArtBoundary(lineArtData, idx, 100)) break;
      if (!colorMatch(paintData, idx, targetR, targetG, targetB, targetA, tolerance)) break;

      visited[pos] = 1;
      lx = nextX;
    }

    // Scan right
    let rx = currX;
    while (rx < width - 1) {
      const nextX = rx + 1;
      const pos = currY * width + nextX;
      const idx = pos * 4;

      if (visited[pos] || isLineArtBoundary(lineArtData, idx, 100)) break;
      if (!colorMatch(paintData, idx, targetR, targetG, targetB, targetA, tolerance)) break;

      visited[pos] = 1;
      rx = nextX;
    }

    // Fill span from lx to rx
    for (let x = lx; x <= rx; x++) {
      const pos = currY * width + x;
      paintData32[pos] = isPattern ? getPatternPixel32(fillColorHex, x, currY) : targetFill32;
      modifiedPixels++;
    }

    // Check row above and below for spans
    for (const ny of [currY - 1, currY + 1]) {
      if (ny < 0 || ny >= height) continue;

      let inSpan = false;
      for (let x = lx; x <= rx; x++) {
        const pos = ny * width + x;
        const idx = pos * 4;

        const isFillable =
          !visited[pos] &&
          !isLineArtBoundary(lineArtData, idx, 100) &&
          colorMatch(paintData, idx, targetR, targetG, targetB, targetA, tolerance);

        if (isFillable) {
          if (!inSpan) {
            stack.push([x, ny]);
            visited[pos] = 1;
            inSpan = true;
          }
        } else {
          inSpan = false;
        }
      }
    }
  }

  if (modifiedPixels === 0) return false;

  // Dilation pass to eliminate white halos under line art outlines
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pos = y * width + x;
      if (visited[pos]) {
        const neighbors = [pos - 1, pos + 1, pos - width, pos + width];
        for (const nPos of neighbors) {
          if (!visited[nPos]) {
            const nIdx = nPos * 4;
            if (isLineArtBoundary(lineArtData, nIdx, 140)) {
              const nx = nPos % width;
              const ny = Math.floor(nPos / width);
              paintData32[nPos] = isPattern ? getPatternPixel32(fillColorHex, nx, ny) : targetFill32;
            }
          }
        }
      }
    }
  }

  paintCtx.putImageData(paintImgData, 0, 0);
  return true;
}
