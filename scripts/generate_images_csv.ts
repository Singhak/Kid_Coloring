/**
 * Generates D:\Hostiger_Deployment\Insta_video\images_metadata.csv
 * for publishing photo posts to Instagram via Instagram Graph API.
 */

import * as fs from 'fs';
import * as path from 'path';
import { getMediaDirectory } from './git_sync.js';
import { parseCsv, stringifyCsv } from './post_csv_to_instagram.js';
import { getAllPins } from './db.js';

export interface ImageCsvRow {
  Timestamp: string;
  'Template Name': string;
  Category: string;
  'Image Path': string;
  Title: string;
  Description: string;
  'Instagram Caption': string;
  'Destination URL': string;
  'Instagram Media ID': string;
  Status: string;
}

export function buildInstagramPhotoCaption(
  name: string,
  category: string,
  destinationUrl: string
): string {
  const hashtags = [
    '#coloring',
    '#coloringpages',
    '#freecoloringpages',
    '#kidsactivities',
    '#toddleractivities',
    '#preschool',
    '#preschoolactivities',
    '#homeschooling',
    '#artforkids',
    '#coloro',
    '#kidsart',
    '#coloringbook',
    '#freeprintables',
    '#kidsfun',
    '#diykids',
    `#${category.replace(/[^a-zA-Z0-9]/g, '')}`,
  ].join(' ');

  return `Free Printable Coloring Sheet: ${name}! 🎨✨

Print this out for relaxing, high-contrast coloring at home or in class, or color it online with digital magic brushes at Coloro! 🖍️

👉 Link in bio to color or print hundreds of free sheets: www.coloro.in
🌐 Direct link: ${destinationUrl}

Save this post for your next creative kids activity session! 💖

.
.
${hashtags}`.trim();
}

export function generateImagesMetadataCsv(): string {
  const mediaDir = getMediaDirectory();
  const targetCsvPath = path.join(mediaDir, 'images_metadata.csv');
  const existingRecordsMap = new Map<string, { mediaId: string; status: string }>();

  // If images_metadata.csv already exists, preserve any already posted Instagram Media IDs & status
  if (fs.existsSync(targetCsvPath)) {
    try {
      const existingText = fs.readFileSync(targetCsvPath, 'utf-8');
      const { rows } = parseCsv(existingText);
      rows.forEach((r: any) => {
        const key = r['Image Path'] || r['Template Name'];
        if (key && r['Instagram Media ID']) {
          existingRecordsMap.set(key, {
            mediaId: r['Instagram Media ID'],
            status: r.Status || 'PUBLISHED',
          });
        }
      });
    } catch (e) {
      console.warn('Note: Could not parse existing images_metadata.csv, recreating fresh.');
    }
  }

  // Read pins from SQLite DB or from pinterest_bulk_schedule.csv
  const pins = getAllPins(500);
  const rows: ImageCsvRow[] = [];
  const seenPaths = new Set<string>();
  const seenNames = new Set<string>();

  if (pins.length > 0) {
    pins.forEach((pin) => {
      const pathKey = (pin.media_path || '').trim().toLowerCase();
      const nameKey = (pin.name || '').trim().toLowerCase();
      if (seenPaths.has(pathKey) || (nameKey && seenNames.has(nameKey))) {
        return; // Skip duplicate
      }
      if (pathKey) seenPaths.add(pathKey);
      if (nameKey) seenNames.add(nameKey);

      const existing = existingRecordsMap.get(pin.media_path) || existingRecordsMap.get(pin.name);
      const destUrl = pin.destination_url || 'https://coloro.in';
      const category = pin.category || 'kids';

      const caption = buildInstagramPhotoCaption(pin.name, category, destUrl);

      rows.push({
        Timestamp: pin.created_at || new Date().toISOString(),
        'Template Name': pin.name,
        Category: category,
        'Image Path': pin.media_path,
        Title: pin.title || `Coloring Sheet - ${pin.name}`,
        Description: pin.description || '',
        'Instagram Caption': caption,
        'Destination URL': destUrl,
        'Instagram Media ID': existing ? existing.mediaId : '',
        Status: existing ? existing.status : 'unposted',
      });
    });
  } else {
    // Fallback: Read from pinterest_bulk_schedule.csv
    const pinScheduleCsv = path.join(mediaDir, 'pinterest_bulk_schedule.csv');
    if (fs.existsSync(pinScheduleCsv)) {
      const content = fs.readFileSync(pinScheduleCsv, 'utf-8');
      const parsed = parseCsv(content);
      parsed.rows.forEach((r: any, idx: number) => {
        const rawTitle = r.Title || '';
        const name = rawTitle.split('|')[0]?.replace(/^Free Printable\s+/i, '')?.trim() || `Pin #${idx + 1}`;
        const mediaPath = r['Media URL'] || '';
        const destUrl = r.Link || 'https://coloro.in';
        const existing = existingRecordsMap.get(mediaPath) || existingRecordsMap.get(name);
        const caption = buildInstagramPhotoCaption(name, 'coloring', destUrl);

        rows.push({
          Timestamp: new Date().toISOString(),
          'Template Name': name,
          Category: 'coloring',
          'Image Path': mediaPath,
          Title: rawTitle,
          Description: r.Description || '',
          'Instagram Caption': caption,
          'Destination URL': destUrl,
          'Instagram Media ID': existing ? existing.mediaId : '',
          Status: existing ? existing.status : 'unposted',
        });
      });
    }
  }

  const headers = [
    'Timestamp',
    'Template Name',
    'Category',
    'Image Path',
    'Title',
    'Description',
    'Instagram Caption',
    'Destination URL',
    'Instagram Media ID',
    'Status',
  ];

  const csvOutput = stringifyCsv(headers, rows as any);
  fs.writeFileSync(targetCsvPath, csvOutput, 'utf-8');
  console.log(`✅ Generated ${rows.length} image records in: ${targetCsvPath}`);
  return targetCsvPath;
}

// Run if called directly
if (process.argv[1]?.includes('generate_images_csv')) {
  generateImagesMetadataCsv();
}
