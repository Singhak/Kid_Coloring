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
 * High-performance Scanline Flood Fill Algorithm
 * Colors only the enclosed region clicked by the user bounded by the line art layer.
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

  const targetFillRgba = hexToRgba(fillColorHex);
  const targetFill32 = (targetFillRgba.a << 24) | (targetFillRgba.b << 16) | (targetFillRgba.g << 8) | targetFillRgba.r;

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

  // Already the same color?
  if (
    Math.abs(targetR - targetFillRgba.r) < 5 &&
    Math.abs(targetG - targetFillRgba.g) < 5 &&
    Math.abs(targetB - targetFillRgba.b) < 5 &&
    Math.abs(targetA - targetFillRgba.a) < 5
  ) {
    return false;
  }

  // Visited map (1 bit per pixel) to prevent infinite loops & re-checks
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
      paintData32[pos] = targetFill32;
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

  // Dilation pass (1-2px edge bleed under black outlines to eliminate white halos)
  const dilatedData32 = new Uint32Array(paintData.buffer);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pos = y * width + x;
      if (visited[pos]) {
        // If current pixel was filled, check surrounding 4 neighbors
        const neighbors = [pos - 1, pos + 1, pos - width, pos + width];
        for (const nPos of neighbors) {
          if (!visited[nPos]) {
            const nIdx = nPos * 4;
            // If neighbor is semi-dark edge border in line art, color it to blend smoothly under multiply
            if (isLineArtBoundary(lineArtData, nIdx, 140)) {
              dilatedData32[nPos] = targetFill32;
            }
          }
        }
      }
    }
  }

  paintCtx.putImageData(paintImgData, 0, 0);
  return true;
}
