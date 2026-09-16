/**
 * Pinterest Batch Pin Generation CLI Script for Coloro.in
 *
 * Automatically generates 50–100 high-contrast Pinterest pins (1000x1500)
 * showing the blank printable sheet side-by-side with the colored version.
 * Direct links to:
 * - Query format: https://coloro.in/?category=animals, https://coloro.in/?category=alphabet
 * - Hash format: https://coloro.in/#category=animals, https://coloro.in/#category=alphabet
 *
 * Run via: npm run generate:pins
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

// Import templates directly
import { EDUCATIONAL_TEMPLATES } from '../src/constants/educationalTemplates.js';
import { THEMATIC_TEMPLATES } from '../src/constants/thematicTemplates.js';
import { REALISTIC_TEMPLATES } from '../src/constants/realisticTemplates.js';
import { getAllWeeklyDropTemplates } from '../src/constants/weeklyDrops.js';
import { getAllFestivalTemplates } from '../src/constants/festivalPacks.js';
import {
  generatePinterestPinSvg,
  generatePinMetadata,
  exportPinsToPinterestCsv,
  exportPinsToRssFeed,
  CATEGORY_MAP,
  getCategoryMeta,
  buildPinDestinationUrl,
  GeneratedPinData
} from '../src/services/pinterestPinGenerator.js';
import { Template } from '../src/types.js';

// Base static templates from constants
const BASE_TEMPLATES: Template[] = [
  {
    name: 'Happy Cottage House',
    category: 'nature',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'roof', d: 'M 100,200 L 250,100 L 400,200 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'walls', d: 'M 100,200 L 100,400 L 400,400 L 400,200 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'door', d: 'M 220,400 L 220,320 L 280,320 L 280,400 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window-1', d: 'M 140,250 L 140,300 L 190,300 L 190,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window-2', d: 'M 310,250 L 310,300 L 360,300 L 360,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'sun', d: 'M 450,50 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Magic Rainbow Flower',
    category: 'nature',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'stem', d: 'M 245,350 L 245,480 L 255,480 L 255,350 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leaf-1', d: 'M 255,420 C 300,400 320,440 255,460 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'leaf-2', d: 'M 245,400 C 200,380 180,420 245,440 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'center', d: 'M 250,250 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'petal-1', d: 'M 250,210 C 280,150 320,150 350,210 C 320,270 280,270 250,210 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'petal-2', d: 'M 290,250 C 350,280 350,320 290,350 C 230,320 230,280 290,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'petal-3', d: 'M 250,290 C 220,350 180,350 150,290 C 180,230 220,230 250,290 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'petal-4', d: 'M 210,250 C 150,220 150,180 210,150 C 270,180 270,220 210,250 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Cosmic Star Rocket',
    category: 'space',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 250,50 C 200,150 200,350 250,400 C 300,350 300,150 250,50 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'fin-l', d: 'M 210,300 L 150,400 L 210,380 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'fin-r', d: 'M 290,300 L 350,400 L 290,380 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window', d: 'M 250,150 m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'flame', d: 'M 230,400 L 250,480 L 270,400 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Whiskers The Kitten',
    category: 'animal',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'head', d: 'M 250,150 m -80,0 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'ear-l', d: 'M 180,100 L 150,30 L 220,80 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'ear-r', d: 'M 320,100 L 350,30 L 280,80 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'body', d: 'M 250,230 C 150,230 150,450 250,450 C 350,450 350,230 250,230 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye-l', d: 'M 220,140 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye-r', d: 'M 280,140 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'nose', d: 'M 250,160 L 245,170 L 255,170 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Playful Ocean Dolphin',
    category: 'animal',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 100,250 C 150,150 350,150 400,250 C 350,350 150,350 100,250 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'tail', d: 'M 400,250 L 480,180 L 480,320 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye', d: 'M 180,230 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -10,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'fin', d: 'M 250,200 L 280,150 L 310,200 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Desert Cactus & Sun',
    category: 'nature',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'pot', d: 'M 200,400 L 300,400 L 320,480 L 180,480 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'body', d: 'M 250,100 C 210,100 210,400 250,400 C 290,400 290,100 250,100 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'arm-l', d: 'M 210,250 C 150,250 150,150 210,180 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'arm-r', d: 'M 290,220 C 350,220 350,320 290,290 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Super Hero Flying',
    category: 'human',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'head', d: 'M 250,100 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'cape', d: 'M 210,150 L 100,400 L 400,400 L 290,150 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'body', d: 'M 210,140 L 290,140 L 310,300 L 190,300 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'mask', d: 'M 220,90 L 280,90 L 280,110 L 220,110 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Solar System Saturn Planet',
    category: 'space',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'planet', d: 'M 250,250 m -100,0 a 100,100 0 1,0 200,0 a 100,100 0 1,0 -200,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'ring', d: 'M 100,250 Q 250,350 400,250 Q 250,150 100,250', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Speedy Toy Car',
    category: 'vehicles',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 100,350 L 100,250 L 200,250 L 250,150 L 400,150 L 450,250 L 450,350 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wheel-l', d: 'M 180,350 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'wheel-r', d: 'M 370,350 m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'window', d: 'M 230,250 L 260,180 L 380,180 L 410,250 Z', stroke: '#000', strokeWidth: 5 }
    ]
  },
  {
    name: 'Friendly Little T-Rex Dinosaur',
    category: 'animal',
    viewBox: '0 0 500 500',
    paths: [
      { id: 'body', d: 'M 200,150 C 150,150 120,220 150,300 C 180,380 250,420 300,400 C 350,380 420,380 450,300 C 400,320 350,280 320,240 C 300,180 260,150 200,150 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'eye', d: 'M 180,180 m -6,0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0 Z', stroke: '#000', strokeWidth: 5 },
      { id: 'teeth', d: 'M 150,240 L 160,250 L 170,240 L 180,250 L 190,240', stroke: '#000', strokeWidth: 4 },
      { id: 'leg-l', d: 'M 220,410 L 220,480 L 250,480', stroke: '#000', strokeWidth: 5 },
      { id: 'leg-r', d: 'M 280,400 L 280,470 L 310,470', stroke: '#000', strokeWidth: 5 },
      { id: 'arm', d: 'M 240,280 L 270,300 L 265,310', stroke: '#000', strokeWidth: 4 }
    ]
  }
];

function run() {
  console.log('====================================================');
  console.log('  📌 Coloro Pinterest Batch Pin Generator & Scheduler');
  console.log('====================================================\n');

  // Collect all templates
  const allTemplates: Template[] = [
    ...EDUCATIONAL_TEMPLATES,
    ...THEMATIC_TEMPLATES,
    ...REALISTIC_TEMPLATES,
    ...getAllWeeklyDropTemplates(),
    ...getAllFestivalTemplates(),
    ...BASE_TEMPLATES
  ];

  console.log(`[+] Total static templates found in app: ${allTemplates.length}`);

  // Deduplicate and filter templates with valid paths
  const validTemplates = allTemplates.filter(t => t && t.paths && t.paths.length > 0);

  // We want to generate a robust batch of 50–100 pins (e.g. 70 pins for 10 full days of 7 pins/day)
  // Ensure balanced representation across Alphabet, Animals, Numbers, Fruits, Vegetables, Space, Vehicles, Festivals
  const desiredBatchSize = Math.min(Math.max(validTemplates.length, 50), 100);
  const selectedBatch = validTemplates.slice(0, desiredBatchSize);

  console.log(`[+] Curated batch of ${selectedBatch.length} templates for Pinterest pins`);

  // Target directory
  const outDir = path.resolve(process.cwd(), 'public', 'pinterest-pins');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Daily posting hours (spread 5-8 pins daily)
  const postingSlots = ['08:00', '10:00', '12:00', '14:30', '16:45', '18:30', '20:15'];
  const pinsPerDay = postingSlots.length; // 7 pins daily (meets requirement: 5–8 daily)

  // Start scheduling starting from tomorrow so no time slot is in the past
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  const queryPins: GeneratedPinData[] = [];
  const hashPins: GeneratedPinData[] = [];

  selectedBatch.forEach((template, index) => {
    const dayOffset = Math.floor(index / pinsPerDay);
    const slotIndex = index % pinsPerDay;

    const postDate = new Date(startDate);
    postDate.setDate(startDate.getDate() + dayOffset);
    const dateStr = postDate.toISOString().split('T')[0];
    const timeStr = postingSlots[slotIndex];

    const slugName = (template.name || 'sheet')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const filePrefix = `pin-${String(index + 1).padStart(3, '0')}-${slugName}`;

    // 1. Generate Query format pin (e.g., https://coloro.in/?category=animals)
    const querySvg = generatePinterestPinSvg(template, { urlFormat: 'query' });
    const queryMeta = generatePinMetadata(template, { urlFormat: 'query' });
    const catMeta = getCategoryMeta(template.category);

    const pinQueryData: GeneratedPinData = {
      id: filePrefix,
      templateId: template.id || `template-${index + 1}`,
      templateName: template.name,
      category: template.category,
      categoryLabel: catMeta.label,
      categoryEmoji: catMeta.emoji,
      destinationUrl: queryMeta.destinationUrl,
      title: queryMeta.title,
      description: queryMeta.description,
      boardName: queryMeta.boardName,
      keywords: queryMeta.keywords,
      scheduledDate: dateStr,
      scheduledTime: timeStr,
      svgContent: querySvg
    };
    queryPins.push(pinQueryData);

    // 2. Generate Hash format pin (e.g., https://coloro.in/#category=animals)
    const hashMeta = generatePinMetadata(template, { urlFormat: 'hash' });
    const pinHashData: GeneratedPinData = {
      ...pinQueryData,
      destinationUrl: hashMeta.destinationUrl
    };
    hashPins.push(pinHashData);

    // 1. Save SVG file immediately
    const svgPath = path.join(outDir, `${filePrefix}.svg`);
    fs.writeFileSync(svgPath, querySvg, 'utf8');

    // 2. Render and save high-resolution 1000x1500 PNG file for Pinterest (skip if already exists to be fast)
    const pngPath = path.join(outDir, `${filePrefix}.png`);
    if (!fs.existsSync(pngPath)) {
      try {
        const resvg = new Resvg(querySvg, {
          fitTo: { mode: 'width', value: 1000 }
        });
        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();
        fs.writeFileSync(pngPath, pngBuffer);
      } catch (renderErr) {
        console.warn(`[WARN] PNG rasterization failed for ${filePrefix}:`, renderErr);
      }
    }
  });

  // Save Pinterest Bulk Upload CSVs (both query and hash flavors)
  const csvQuery = exportPinsToPinterestCsv(queryPins);
  const csvQueryPath = path.join(outDir, 'pinterest_bulk_schedule_query.csv');
  fs.writeFileSync(csvQueryPath, csvQuery, 'utf8');

  const csvHash = exportPinsToPinterestCsv(hashPins);
  const csvHashPath = path.join(outDir, 'pinterest_bulk_schedule_hash.csv');
  fs.writeFileSync(csvHashPath, csvHash, 'utf8');

  // Also write standard pinterest_bulk_schedule.csv (query parameter as default)
  const defaultCsvPath = path.join(outDir, 'pinterest_bulk_schedule.csv');
  fs.writeFileSync(defaultCsvPath, csvQuery, 'utf8');

  // Save Pinterest RSS 2.0 XML Feed for Auto-Publish
  const rssXml = exportPinsToRssFeed(queryPins);
  const rssPath = path.join(outDir, 'pinterest-feed.xml');
  fs.writeFileSync(rssPath, rssXml, 'utf8');
  
  // Also write to public/ root for direct https://coloro.in/pinterest-feed.xml and https://coloro.in/feed.xml
  const publicDir = path.resolve(process.cwd(), 'public');
  fs.writeFileSync(path.join(publicDir, 'pinterest-feed.xml'), rssXml, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'feed.xml'), rssXml, 'utf8');

  // Save manifest JSON for in-app or API consumption
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalPins: queryPins.length,
    pinsPerDay,
    daysCovered: Math.ceil(queryPins.length / pinsPerDay),
    categories: Array.from(new Set(queryPins.map(p => p.category))),
    pins: queryPins.map(p => ({
      id: p.id,
      name: p.templateName,
      category: p.category,
      categoryLabel: p.categoryLabel,
      destinationUrl: p.destinationUrl,
      title: p.title,
      description: p.description,
      boardName: p.boardName,
      scheduledDate: p.scheduledDate,
      scheduledTime: p.scheduledTime,
      filename: `${p.id}.png`
    }))
  };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  // Generate an HTML visual batch gallery for browser review
  const htmlGallery = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coloro Pinterest Batch Pin Review &amp; Schedule</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #E60023;
      --bg: #F7F5EC;
      --card-bg: #FFFFFF;
      --text: #2D3436;
      --muted: #636E72;
      --border: #E8E4D8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 32px 20px;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 32px;
      text-align: center;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-weight: 900;
      font-size: 28px;
      color: var(--primary);
      margin-bottom: 8px;
    }
    .subtitle {
      color: var(--muted);
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .stats-bar {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    .stat-pill {
      background: white;
      padding: 8px 18px;
      border-radius: 999px;
      border: 1px solid var(--border);
      font-weight: 700;
      font-size: 13px;
    }
    .downloads-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary);
      color: white;
      text-decoration: none;
      font-weight: 800;
      font-size: 14px;
      padding: 10px 22px;
      border-radius: 12px;
      transition: transform 0.15s, opacity 0.15s;
    }
    .btn:hover { transform: translateY(-2px); opacity: 0.95; }
    .btn.secondary {
      background: white;
      color: var(--text);
      border: 1px solid var(--border);
    }
    .grid {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
    .pin-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-col;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .pin-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.08);
    }
    .pin-preview {
      aspect-ratio: 2/3;
      background: #FAFAFA;
      overflow: hidden;
    }
    .pin-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .pin-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .pin-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 800;
      color: var(--muted);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pin-title {
      font-size: 15px;
      font-weight: 800;
      line-height: 1.3;
      margin-bottom: 8px;
    }
    .pin-desc {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 12px;
    }
    .pin-link {
      font-size: 11px;
      font-weight: 700;
      color: #0984e3;
      word-break: break-all;
      margin-top: auto;
      margin-bottom: 12px;
    }
    .pin-actions {
      display: flex;
      gap: 8px;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 8px;
      flex: 1;
      text-align: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <span>🎨</span>
      <span>Coloro Pinterest Auto-Publish Suite</span>
    </div>
    <p class="subtitle">100 High-Converting Side-by-Side Pins (Blank Printable vs Colored Guide)</p>
    
    <div class="stats-bar">
      <div class="stat-pill">Total Pins: <strong>${queryPins.length}</strong></div>
      <div class="stat-pill">Schedule: <strong>${pinsPerDay} Pins/Day</strong></div>
      <div class="stat-pill">Days Covered: <strong>${Math.ceil(queryPins.length / pinsPerDay)} Days</strong></div>
    </div>

    <div class="downloads-bar">
      <a href="pinterest_bulk_schedule.csv" download class="btn">📊 Download Pinterest CSV (Bulk Schedule)</a>
      <a href="pinterest_bulk_schedule_hash.csv" download class="btn secondary"># Download Hash URLs CSV</a>
      <a href="manifest.json" download class="btn secondary">{ } Manifest JSON</a>
    </div>
  </div>

  <div class="grid">
    ${queryPins.map((p, idx) => `
      <div class="pin-card">
        <div class="pin-preview">
          <img src="${p.id}.png" alt="${p.title}" loading="lazy" />
        </div>
        <div class="pin-body">
          <div class="pin-meta">
            <span>${p.categoryEmoji} ${p.categoryLabel}</span>
            <span>📅 ${p.scheduledDate} @ ${p.scheduledTime}</span>
          </div>
          <h3 class="pin-title">${p.templateName}</h3>
          <p class="pin-desc">${p.description}</p>
          <div class="pin-link">🔗 ${p.destinationUrl}</div>
          <div class="pin-actions">
            <a href="${p.id}.png" download="${p.id}.png" class="btn btn-sm">Download PNG</a>
            <a href="${p.destinationUrl}" target="_blank" class="btn btn-sm secondary">Test Link ↗</a>
          </div>
        </div>
      </div>
    `).join('\n')}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(outDir, 'index.html'), htmlGallery, 'utf8');

  console.log(`\n[✓] Successfully generated ${queryPins.length} Pinterest pins!`);
  console.log(`[✓] Output folder: ${outDir}`);
  console.log(`[✓] Saved SVGs: ${queryPins.length} high-contrast 1000x1500 graphics`);
  console.log(`[✓] Saved CSV: ${defaultCsvPath}`);
  console.log(`[✓] Saved Visual Review Gallery: ${path.join(outDir, 'index.html')}`);
  console.log('\n--- Daily Posting Plan (5–8 Pins/Day) ---');
  
  const dailyCounts: Record<string, number> = {};
  queryPins.forEach(p => {
    dailyCounts[p.scheduledDate] = (dailyCounts[p.scheduledDate] || 0) + 1;
  });

  Object.entries(dailyCounts).slice(0, 10).forEach(([date, count]) => {
    console.log(`  📅 ${date}: ${count} pins scheduled`);
  });

  console.log('\n[✓] All pins are linked to https://coloro.in/?category=... and https://coloro.in/#category=...');
  console.log('====================================================\n');
}

run();
