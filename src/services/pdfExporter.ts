/**
 * Printable Coloring Sheet Exporter (A4 / Letter Print-Ready)
 */

import { Template, NumberPaletteEntry } from '../types';
import { basicColorName } from '../constants/colorByNumberTemplates';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const A4_W = 794; // CSS px at 96dpi
const A4_H = 1123;
const RENDER_SCALE = 2;

/**
 * Android's WebView ignores window.print() on an iframe, so on native we rasterize the
 * sheet to an A4 PNG and hand it to the share sheet (which offers Print / Save).
 */
async function sharePrintableImage(html: string): Promise<void> {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const css = Array.from(parsed.querySelectorAll('style')).map(s => s.textContent ?? '').join('\n')
    .replace(/@page\s*\{[^}]*\}/g, '');
  const body = new XMLSerializer().serializeToString(parsed.body);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${A4_W * RENDER_SCALE}" height="${A4_H * RENDER_SCALE}" viewBox="0 0 ${A4_W} ${A4_H}">` +
    `<foreignObject width="${A4_W}" height="${A4_H}">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${A4_W}px;height:${A4_H}px;background:#fff;overflow:hidden;padding:40px 30px;box-sizing:border-box">` +
    `<style>${css}</style>${body}</div></foreignObject></svg>`;

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not render the print sheet'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const canvas = document.createElement('canvas');
  canvas.width = A4_W * RENDER_SCALE;
  canvas.height = A4_H * RENDER_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  const file = await Filesystem.writeFile({
    path: `coloro-print-${Date.now()}.png`,
    data: canvas.toDataURL('image/png').split(',')[1],
    directory: Directory.Cache,
  });
  await Share.share({
    title: 'Coloro printable sheet',
    files: [file.uri],
    dialogTitle: 'Print or save your coloring sheet',
  });
}

/** Prints an HTML document through a hidden iframe so the main UI is untouched. */
function printHtml(html: string): boolean {
  if (Capacitor.isNativePlatform()) {
    sharePrintableImage(html).catch(err => {
      const msg = String(err?.message ?? err);
      if (!/cancel/i.test(msg)) {
        console.error('Print failed:', err);
        alert(`Could not prepare the print sheet: ${msg}`);
      }
    });
    return true;
  }
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
    .join('') +
    (template.decor ?? [])
      .map(p => `<path d="${p.d}" fill="none" stroke="#1A1A1A" stroke-width="${p.strokeWidth ?? 4}" stroke-linecap="round" stroke-linejoin="round"/>`)
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
      const { name, emoji } = basicColorName(e.color);
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
