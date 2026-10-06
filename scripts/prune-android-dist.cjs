// Remove web-only / unreferenced files from dist before `cap sync android`.
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '..', 'dist');
const remove = [
  'api',                       // PHP backend (server only)
  'pinterest-pins',            // 32MB marketing pins (server-only)
  'community-pins',
  'feed.xml',
  'pinterest-feed.xml',
  'sitemap.xml',
  'robots.txt',
  'llms.txt',
  'llms-full.txt',
  'googlef1aebda263044e9b.html', // Google Search Console verification
  // unreferenced images
  'coloro-brush-icon.jpg',
  'coloro-icon.jpg',
  'coloro-logo-opt.png',
  'coloro-mascot-dragon.jpg',
  'coloro-mascot-icon.jpg',
  'coloro-mascot-paintdrop.jpg',
  'coloro-mascot-palette.jpg',
  'coloro-mascot-sun.jpg',
  'coloro-web-rainbow-brush.jpg',
];
for (const f of remove) fs.rmSync(path.join(dist, f), { recursive: true, force: true });
console.log('Pruned', remove.length, 'web-only entries from dist');
