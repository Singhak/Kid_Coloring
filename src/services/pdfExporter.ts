/**
 * Printable Coloring Sheet Exporter (A4 / Letter Print-Ready)
 */

import { MAGIC_COLORS } from '../constants';
import { Template, NumberPaletteEntry } from '../types';

/** Prints an HTML document through a hidden iframe so the main UI is untouched. */
function printHtml(html: string): boolean {
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(printFrame);
    return false;
  }

  doc.open();
  doc.write(html);
  doc.close();

  // Trigger print once content is loaded
  printFrame.contentWindow?.focus();
  setTimeout(() => {
    try {
      printFrame.contentWindow?.print();
    } catch (e) {
      console.error('Print failed:', e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 2000);
    }
  }, 350);

  return true;
}

export function printColoringSheet(
  lineArtCanvas: HTMLCanvasElement | null,
  title: string = 'Coloring Masterpiece'
): boolean {
  if (!lineArtCanvas) return false;

  const dataUrl = lineArtCanvas.toDataURL('image/png');

  return printHtml(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Coloro - ${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            text-align: center;
            color: #2D3436;
            background: #fff;
            padding: 20px 10px;
          }
          .header {
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px dashed #E0E0E0;
            padding-bottom: 12px;
          }
          .logo {
            font-size: 22px;
            font-weight: 900;
            color: #2D3436;
            letter-spacing: -0.5px;
          }
          .logo span {
            color: #FF6B6B;
          }
          .artist-line {
            font-size: 14px;
            font-weight: bold;
            color: #555;
          }
          .canvas-frame {
            width: 100%;
            max-width: 580px;
            margin: 0 auto;
            border: 3px solid #333;
            border-radius: 16px;
            padding: 15px;
            background: #FFFFFF;
          }
          .coloring-img {
            width: 100%;
            height: auto;
            display: block;
          }
          .footer {
            margin-top: 25px;
            font-size: 12px;
            font-weight: 600;
            color: #888;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🎨 Color<span>o</span> Magic Studio</div>
          <div class="artist-line">Little Artist: ______________________ Date: ________</div>
        </div>

        <div class="canvas-frame">
          <img src="${dataUrl}" class="coloring-img" alt="${title}" />
        </div>

        <div class="footer">
          <span>✨ Print, color with real crayons & hang on your fridge!</span>
          <span>https://coloro.in</span>
        </div>
      </body>
    </html>
  `);
}

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Friendly name (and emoji) for any hex, via the nearest color in the app's named palette. */
export function nearestColorName(hex: string): { name: string; emoji: string } {
  const [r, g, b] = hexToRgb(hex);
  let best = MAGIC_COLORS[0];
  let bestD = Infinity;
  for (const c of MAGIC_COLORS) {
    const [cr, cg, cb] = hexToRgb(c.hex);
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return { name: best.name, emoji: best.emoji };
}

export interface NumberSheetBadge {
  pathId: string;
  x: number;
  y: number;
  r: number;
}

/** Printable color-by-number page: blank numbered picture plus a "number = color name" key. */
export function printNumberSheet(
  template: Template,
  palette: NumberPaletteEntry[],
  badges: NumberSheetBadge[],
  schemeName: string
): boolean {
  const numberByPath: Record<string, number> = {};
  palette.forEach(e => e.pathIds.forEach(id => (numberByPath[id] = e.number)));

  const paths = template.paths
    .map(p => `<path d="${p.d}" fill="#fff" stroke="#1A1A1A" stroke-width="${p.strokeWidth ?? 6}" stroke-linejoin="round"/>`)
    .join('');
  const badgeSvg = badges
    .filter(b => numberByPath[b.pathId])
    .map(
      b =>
        `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="#fff" stroke="#2D3436" stroke-width="3"/>` +
        `<text x="${b.x}" y="${b.y}" text-anchor="middle" dominant-baseline="central" font-size="${b.r * 1.15}" font-weight="900" fill="#2D3436" font-family="Arial, sans-serif">${numberByPath[b.pathId]}</text>`
    )
    .join('');

  const legend = palette
    .map(e => {
      const { name, emoji } = nearestColorName(e.color);
      return `<div class="key"><span class="num">${e.number}</span><span class="swatch" style="background:${e.color}"></span><span class="cname">${emoji} ${name}</span></div>`;
    })
    .join('');

  return printHtml(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Coloro - ${template.name} Color by Number</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; color: #2D3436; background: #fff; padding: 20px 10px; }
          .header { margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #E0E0E0; padding-bottom: 12px; }
          .logo { font-size: 22px; font-weight: 900; }
          .logo span { color: #FF6B6B; }
          .artist-line { font-size: 14px; font-weight: bold; color: #555; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .sub { font-size: 13px; color: #777; margin-bottom: 12px; }
          .frame { width: 100%; max-width: 520px; margin: 0 auto; border: 3px solid #333; border-radius: 16px; padding: 12px; }
          svg { width: 100%; height: auto; display: block; }
          .keys { margin: 18px auto 0; max-width: 560px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
          .key { display: flex; align-items: center; gap: 8px; border: 2px solid #EBE8DC; border-radius: 999px; padding: 6px 14px 6px 6px; font-size: 15px; font-weight: 700; }
          .num { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #2D3436; display: flex; align-items: center; justify-content: center; font-weight: 900; }
          .swatch { width: 22px; height: 22px; border-radius: 6px; border: 2px solid #2D3436; }
          .footer { margin-top: 22px; font-size: 12px; font-weight: 600; color: #888; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🎨 Color<span>o</span> Magic Studio</div>
          <div class="artist-line">Little Artist: ______________________ Date: ________</div>
        </div>
        <h1>${template.name} - Color by Number</h1>
        <div class="sub">Color each spot with the color that matches its number (${schemeName}).</div>
        <div class="frame"><svg viewBox="${template.viewBox}">${paths}${badgeSvg}</svg></div>
        <div class="keys">${legend}</div>
        <div class="footer">
          <span>✨ Print, color with real crayons & hang on your fridge!</span>
          <span>https://coloro.in</span>
        </div>
      </body>
    </html>
  `);
}
