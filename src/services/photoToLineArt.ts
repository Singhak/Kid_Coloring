/**
 * Photo to Line Art Generator
 * Converts real user photos (camera / gallery) into clean, fillable black-and-white coloring pages.
 */

export interface LineArtOptions {
  sensitivity: number; // 1 to 100 (Threshold sensitivity)
  lineDarkness: number; // 1 to 100
  simplify: boolean;    // Smooth out tiny photographic noise
}

/**
 * Processes an Image element into a coloring outline canvas
 */
export function convertPhotoToLineArt(
  img: HTMLImageElement,
  options: LineArtOptions = { sensitivity: 50, lineDarkness: 70, simplify: true }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 1000;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  // 1. Draw and fit image into square 1000x1000 (aspect fit with white background)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  let drawW = width;
  let drawH = height;
  let offsetX = 0;
  let offsetY = 0;

  const aspect = img.width / img.height;
  if (aspect > 1) {
    drawW = width;
    drawH = width / aspect;
    offsetY = (height - drawH) / 2;
  } else {
    drawH = height;
    drawW = height * aspect;
    offsetX = (width - drawW) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

  // 2. Get pixel data
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const totalPixels = width * height;

  // 3. Grayscale buffer
  const gray = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    // Luminance standard
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // 4. Optional Gaussian Blur to smooth out noise for cleaner cartoon lines
  const blurred = new Float32Array(totalPixels);
  const radius = options.simplify ? 2 : 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            sum += gray[ny * width + nx];
            count++;
          }
        }
      }
      blurred[y * width + x] = sum / count;
    }
  }

  // 5. Sobel Edge Detection
  const edgeMagnitude = new Float32Array(totalPixels);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;

      // Sobel horizontal
      const gx =
        -1 * blurred[(y - 1) * width + (x - 1)] +
         1 * blurred[(y - 1) * width + (x + 1)] +
        -2 * blurred[y * width + (x - 1)] +
         2 * blurred[y * width + (x + 1)] +
        -1 * blurred[(y + 1) * width + (x - 1)] +
         1 * blurred[(y + 1) * width + (x + 1)];

      // Sobel vertical
      const gy =
        -1 * blurred[(y - 1) * width + (x - 1)] +
        -2 * blurred[(y - 1) * width + x] +
        -1 * blurred[(y - 1) * width + (x + 1)] +
         1 * blurred[(y + 1) * width + (x - 1)] +
         2 * blurred[(y + 1) * width + x] +
         1 * blurred[(y + 1) * width + (x + 1)];

      edgeMagnitude[idx] = Math.hypot(gx, gy);
    }
  }

  // 6. Adaptive Thresholding to create clean black line art on white
  // Map sensitivity (1..100) -> threshold
  const threshold = Math.max(12, 90 - options.sensitivity * 0.7);
  const darknessMultiplier = (options.lineDarkness / 50);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const mag = edgeMagnitude[i] * darknessMultiplier;

    if (mag > threshold) {
      // Outline line (Black)
      data[idx] = 25;
      data[idx + 1] = 25;
      data[idx + 2] = 25;
      data[idx + 3] = 255;
    } else {
      // Background (Pure White for fillability)
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // 7. Add cute outer rounded frame border for coloring sheet look
  ctx.strokeStyle = '#2D3436';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  return canvas;
}
