/**
 * Instagram Image / Photo Publisher from images_metadata.csv
 *
 * Reads records from D:\Hostiger_Deployment\Insta_video\images_metadata.csv
 * and automatically publishes Single Photo Posts to Instagram via Instagram Graph API.
 *
 * Usage:
 *   List all images and their post status:
 *     npx.cmd tsx scripts/post_images_csv_to_instagram.ts --list
 *
 *   Post the next unposted image:
 *     npx.cmd tsx scripts/post_images_csv_to_instagram.ts --next
 *
 *   Post a specific image by index (e.g. #1):
 *     npx.cmd tsx scripts/post_images_csv_to_instagram.ts --index=1
 *
 *   Post a specific image by name:
 *     npx.cmd tsx scripts/post_images_csv_to_instagram.ts --template="Letter A - Apple"
 *
 *   Dry run (preview without publishing):
 *     npx.cmd tsx scripts/post_images_csv_to_instagram.ts --next --dry-run
 *
 *   Post all unposted images sequentially:
 *     npx.cmd tsx scripts/post_images_csv_to_instagram.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { getMediaDirectory, syncRepositoryToGit } from './git_sync.js';
import { publishPhotoToInstagram } from './instagram_uploader.js';
import { parseCsv, stringifyCsv } from './post_csv_to_instagram.js';
import { getDatabase } from './db.js';

dotenv.config();

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

function parseCliArgs() {
  const args = process.argv.slice(2);
  let list = false;
  let next = false;
  let all = false;
  let dryRun = false;
  let index: number | null = null;
  let template = '';

  for (const arg of args) {
    if (arg === '--list') list = true;
    else if (arg === '--next') next = true;
    else if (arg === '--all') all = true;
    else if (arg === '--dry-run') dryRun = true;
    else if (arg.startsWith('--index=')) index = parseInt(arg.slice(8), 10);
    else if (arg.startsWith('--template=')) template = arg.slice(11).trim().replace(/^['"]|['"]$/g, '');
  }

  return { list, next, all, dryRun, index, template };
}

async function postSingleImage(
  row: ImageCsvRow,
  rowIndex: number,
  dryRun: boolean
): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  console.log(`\n===========================================================`);
  console.log(`🖼️  [Image #${rowIndex + 1}] ${row['Template Name']} (${row.Category})`);
  console.log(`===========================================================`);
  console.log(`🔗 Image URL: ${row['Image Path']}`);

  const caption = row['Instagram Caption']?.trim() ||
    `Free Printable Coloring Sheet: ${row['Template Name']}! 🎨✨ Visit https://coloro.in #coloring #kidsactivities`;

  const firstComment = `🎨 Color ${row['Template Name']} online or download free printable sheet:\n👉 ${row['Destination URL'] || 'https://coloro.in'}\n(Link also in bio! ✨)`;

  console.log(`📝 Caption preview:\n${caption.slice(0, 160)}...\n`);
  console.log(`💬 First comment with link:\n${firstComment}\n`);

  if (dryRun) {
    console.log(`🔍 [DRY RUN] Would publish Photo to Instagram and post first comment.`);
    return { success: true, mediaId: 'SIMULATED_MEDIA_ID' };
  }

  const result = await publishPhotoToInstagram(row['Image Path'], caption, {
    firstComment,
    templateName: row['Template Name'],
    destinationUrl: row['Destination URL'] || 'https://coloro.in',
  });
  return result;
}

function updatePinDatabaseStatus(name: string, status: string): void {
  try {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE pins SET status = ? WHERE name = ? OR title LIKE ?');
    stmt.run(status, name, `%${name}%`);
  } catch (err: any) {
    console.warn(`   ⚠️ SQLite pin update note: ${err.message}`);
  }
}

async function main() {
  const cli = parseCliArgs();
  const mediaDir = getMediaDirectory();
  const csvPath = path.join(mediaDir, 'images_metadata.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found at: ${csvPath}`);
    console.log('   Run: npx.cmd tsx scripts/generate_images_csv.ts first!');
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const { headers, rows } = parseCsv(fileContent);

  console.log(`📊 Found ${rows.length} image records in ${csvPath}`);

  // Mode: List
  if (cli.list) {
    console.log('\n📋 INSTAGRAM IMAGES CATALOG & POST STATUS:');
    console.log('--------------------------------------------------------------------------------------------------');
    console.log('Idx | Template Name                | Category    | Posted to IG?  | Instagram Media ID');
    console.log('--------------------------------------------------------------------------------------------------');
    rows.forEach((r, idx) => {
      const isPosted = Boolean(r['Instagram Media ID'] && r['Instagram Media ID'].trim());
      const postedTag = isPosted ? '✅ YES' : '⏳ NO ';
      const mediaId = r['Instagram Media ID'] || '-';
      const name = (r['Template Name'] || 'Unknown').padEnd(28).slice(0, 28);
      const cat = (r.Category || 'other').padEnd(11).slice(0, 11);
      const idxStr = String(idx + 1).padStart(3);
      console.log(`${idxStr} | ${name} | ${cat} | ${postedTag}        | ${mediaId}`);
    });
    console.log('--------------------------------------------------------------------------------------------------');
    const unpostedCount = rows.filter(r => !r['Instagram Media ID']?.trim()).length;
    console.log(`💡 ${unpostedCount} unposted image(s) ready to publish.`);
    console.log(`   To publish the next one: npm run instagram:images -- --next`);
    console.log(`   To publish a specific one: npm run instagram:images -- --index=1`);
    return;
  }

  // Determine target rows
  let targets: { row: ImageCsvRow; index: number }[] = [];

  if (cli.index !== null) {
    const targetIdx = cli.index - 1;
    if (targetIdx < 0 || targetIdx >= rows.length) {
      console.error(`❌ Invalid index ${cli.index}. Must be between 1 and ${rows.length}.`);
      process.exit(1);
    }
    targets.push({ row: rows[targetIdx] as any, index: targetIdx });
  } else if (cli.template) {
    const query = cli.template.toLowerCase();
    const foundIdx = rows.findIndex(r => r['Template Name'].toLowerCase().includes(query));
    if (foundIdx === -1) {
      console.error(`❌ No image found matching template: "${cli.template}"`);
      process.exit(1);
    }
    targets.push({ row: rows[foundIdx] as any, index: foundIdx });
  } else if (cli.all) {
    rows.forEach((r, idx) => {
      if (!r['Instagram Media ID']?.trim()) {
        targets.push({ row: r as any, index: idx });
      }
    });
    if (targets.length === 0) {
      console.log('🎉 All images are already posted to Instagram!');
      return;
    }
  } else {
    // Default: next unposted image
    const unpostedIdx = rows.findIndex(r => !r['Instagram Media ID']?.trim());
    if (unpostedIdx === -1) {
      console.log('🎉 All images in CSV have already been published to Instagram!');
      return;
    }
    targets.push({ row: rows[unpostedIdx] as any, index: unpostedIdx });
  }

  console.log(`🎯 Ready to process ${targets.length} image(s)...`);

  let updatedCount = 0;

  for (let i = 0; i < targets.length; i++) {
    const { row, index } = targets[i];

    if (row['Instagram Media ID']?.trim() && !cli.dryRun) {
      console.log(`⚠️ Image #${index + 1} "${row['Template Name']}" already has Instagram Media ID: ${row['Instagram Media ID']}. Skipping.`);
      continue;
    }

    const postRes = await postSingleImage(row, index, cli.dryRun);

    if (postRes.success && postRes.mediaId && !cli.dryRun) {
      // 1. Update CSV row
      row['Instagram Media ID'] = postRes.mediaId;
      row.Status = 'PUBLISHED';
      updatedCount++;

      // 2. Update SQLite DB
      updatePinDatabaseStatus(row['Template Name'], 'PUBLISHED');

      // 3. Save CSV immediately
      fs.writeFileSync(csvPath, stringifyCsv(headers, rows as any), 'utf-8');
      console.log(`   💾 Updated ${csvPath} with Instagram Media ID: ${postRes.mediaId}`);

      // Pause 15s between images if multiple targets
      if (i < targets.length - 1) {
        console.log(`⏳ Waiting 15 seconds before next post to respect Instagram API limits...`);
        await new Promise(res => setTimeout(res, 15000));
      }
    } else if (!postRes.success) {
      console.error(`❌ Error publishing image #${index + 1}: ${postRes.error}`);
    }
  }

  if (updatedCount > 0 && !cli.dryRun) {
    console.log(`\n📦 Committing updated CSV to Git repository...`);
    try {
      syncRepositoryToGit(`Update Instagram Media IDs in images_metadata.csv (${updatedCount} posted)`, mediaDir);
    } catch (gitErr: any) {
      console.warn(`   ⚠️ Git sync warning: ${gitErr.message}`);
    }
  }

  console.log(`\n✨ Finished processing! ${updatedCount} image(s) published.`);
}

if (process.argv[1]?.includes('post_images_csv_to_instagram')) {
  main().catch(console.error);
}
