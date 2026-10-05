/**
 * Instagram Bulk & Single Post Automation from videos_metadata.csv
 *
 * Reads records from D:\Hostiger_Deployment\Insta_video\videos_metadata.csv
 * and automatically publishes Reels to Instagram via Instagram Graph API.
 *
 * Usage:
 *   List all videos and their post status:
 *     npx.cmd tsx scripts/post_csv_to_instagram.ts --list
 *
 *   Post the next unposted video:
 *     npx.cmd tsx scripts/post_csv_to_instagram.ts --next
 *
 *   Post a specific video by index (e.g. #1):
 *     npx.cmd tsx scripts/post_csv_to_instagram.ts --index=1
 *
 *   Post a specific video by name:
 *     npx.cmd tsx scripts/post_csv_to_instagram.ts --template="Happy Baby Panda"
 *
 *   Dry run (preview without publishing):
 *     npx.cmd tsx scripts/post_csv_to_instagram.ts --next --dry-run
 *
 *   Post all unposted videos sequentially:
 *     npx.cmd tsx scripts/post_csv_to_instagram.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { getMediaDirectory, syncRepositoryToGit } from './git_sync.js';
import { publishToInstagramGraphApi } from './instagram_uploader.js';
import { updateVideoStatus, getAllVideos } from './db.js';

dotenv.config();

export interface VideoCsvRow {
  Timestamp: string;
  'Template Name': string;
  Category: string;
  'Aspect Ratio': string;
  'Duration (s)': string;
  'Video Path': string;
  'YouTube Title': string;
  'YouTube Description': string;
  'YouTube Tags': string;
  'Instagram Content': string;
  'Destination URL': string;
  'YouTube Privacy': string;
  'YouTube URL': string;
  'Instagram Media ID': string;
  Status: string;
}

/**
 * Robust RFC 4180 compliant CSV parser for multi-line quoted fields
 */
export function parseCsv(csvText: string): { headers: string[]; rows: VideoCsvRow[] } {
  const rawRows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        currentRow.push(currentField);
        rawRows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField);
        rawRows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rawRows.push(currentRow);
  }

  if (rawRows.length === 0) return { headers: [], rows: [] };

  const headers = rawRows[0].map(h => h.trim());
  const rows: VideoCsvRow[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (row.length === 1 && !row[0].trim()) continue;
    const item: any = {};
    headers.forEach((h, idx) => {
      item[h] = row[idx] ?? '';
    });
    rows.push(item as VideoCsvRow);
  }

  return { headers, rows };
}

/**
 * Serializes rows back to CSV with proper RFC 4180 escaping
 */
export function stringifyCsv(headers: string[], rows: VideoCsvRow[]): string {
  const escape = (val: any) => {
    const str = String(val ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headerLine = headers.map(escape).join(',');
  const rowLines = rows.map(r => headers.map(h => escape((r as any)[h] ?? '')).join(','));
  return [headerLine, ...rowLines].join('\n') + '\n';
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

async function postSingleRow(
  row: VideoCsvRow,
  rowIndex: number,
  dryRun: boolean
): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  console.log(`\n===========================================================`);
  console.log(`🎬 [Video #${rowIndex + 1}] ${row['Template Name']} (${row.Category})`);
  console.log(`===========================================================`);
  console.log(`🔗 Video URL: ${row['Video Path']}`);

  const caption = row['Instagram Content']?.trim() ||
    `Coloring ${row['Template Name']}! 🎨 Free printable sheets on https://coloro.in #coloring #kidsactivities`;

  const destinationUrl = row['Destination URL'] || 'https://coloro.in';
  const firstComment = `🎨 Color ${row['Template Name']} online or download free printable sheet:\n👉 ${destinationUrl}\n(Link also in bio! ✨)`;

  console.log(`📝 Caption preview:\n${caption.slice(0, 150)}...\n`);
  console.log(`💬 First comment with link:\n${firstComment}\n`);

  if (dryRun) {
    console.log(`🔍 [DRY RUN] Would publish Reel to Instagram and post first comment.`);
    return { success: true, mediaId: 'SIMULATED_MEDIA_ID' };
  }

  const result = await publishToInstagramGraphApi(row['Video Path'], {
    title: row['Template Name'],
    cleanCaption: caption,
    fullCaptionWithHashtags: caption,
    hashtags: ['#kidsart', '#coloring', '#coloringpages'],
    destinationUrl,
    firstComment,
    shareToFeed: true,
  });

  return result;
}

async function main() {
  const cli = parseCliArgs();
  const mediaDir = getMediaDirectory();
  const csvPath = path.join(mediaDir, 'videos_metadata.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found at: ${csvPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const { headers, rows } = parseCsv(fileContent);

  console.log(`📊 Found ${rows.length} video records in ${csvPath}`);

  // Mode: List
  if (cli.list) {
    console.log('\n📋 VIDEO CATALOG & INSTAGRAM STATUS:');
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
    console.log(`💡 ${unpostedCount} unposted video(s) ready to publish.`);
    console.log(`   To publish the next one: npx.cmd tsx scripts/post_csv_to_instagram.ts --next`);
    console.log(`   To publish a specific one: npx.cmd tsx scripts/post_csv_to_instagram.ts --index=1`);
    return;
  }

  // Determine target rows
  let targets: { row: VideoCsvRow; index: number }[] = [];

  if (cli.index !== null) {
    const targetIdx = cli.index - 1;
    if (targetIdx < 0 || targetIdx >= rows.length) {
      console.error(`❌ Invalid index ${cli.index}. Must be between 1 and ${rows.length}.`);
      process.exit(1);
    }
    targets.push({ row: rows[targetIdx], index: targetIdx });
  } else if (cli.template) {
    const query = cli.template.toLowerCase();
    const foundIdx = rows.findIndex(r => r['Template Name'].toLowerCase().includes(query));
    if (foundIdx === -1) {
      console.error(`❌ No video found matching template: "${cli.template}"`);
      process.exit(1);
    }
    targets.push({ row: rows[foundIdx], index: foundIdx });
  } else if (cli.all) {
    rows.forEach((r, idx) => {
      if (!r['Instagram Media ID']?.trim()) {
        targets.push({ row: r, index: idx });
      }
    });
    if (targets.length === 0) {
      console.log('🎉 All videos are already posted to Instagram!');
      return;
    }
  } else {
    // Default: next unposted video
    const unpostedIdx = rows.findIndex(r => !r['Instagram Media ID']?.trim());
    if (unpostedIdx === -1) {
      console.log('🎉 All videos in CSV have already been published to Instagram!');
      return;
    }
    targets.push({ row: rows[unpostedIdx], index: unpostedIdx });
  }

  console.log(`🎯 Ready to process ${targets.length} video(s)...`);

  let updatedCount = 0;

  for (let i = 0; i < targets.length; i++) {
    const { row, index } = targets[i];

    if (row['Instagram Media ID']?.trim() && !cli.dryRun) {
      console.log(`⚠️ Video #${index + 1} "${row['Template Name']}" already has Instagram Media ID: ${row['Instagram Media ID']}. Skipping.`);
      continue;
    }

    const postRes = await postSingleRow(row, index, cli.dryRun);

    if (postRes.success && postRes.mediaId && !cli.dryRun) {
      // 1. Update CSV row
      row['Instagram Media ID'] = postRes.mediaId;
      row['Status'] = 'PUBLISHED';
      updatedCount++;

      // 2. Update SQLite DB if matching
      try {
        const dbVideos = getAllVideos(200);
        const match = dbVideos.find(v => v.name.toLowerCase() === row['Template Name'].toLowerCase());
        if (match && match.id) {
          updateVideoStatus(match.id, 'PUBLISHED');
          console.log(`   🗄️ SQLite DB record [ID: ${match.id}] updated to PUBLISHED.`);
        }
      } catch (dbErr: any) {
        console.warn(`   ⚠️ SQLite update note: ${dbErr.message}`);
      }

      // Save CSV immediately after each post to protect state
      fs.writeFileSync(csvPath, stringifyCsv(headers, rows), 'utf-8');
      console.log(`   💾 Updated ${csvPath} with Instagram Media ID: ${postRes.mediaId}`);

      // If multiple targets, pause 30s between posts to respect Instagram rate limits
      if (i < targets.length - 1) {
        console.log(`⏳ Waiting 30 seconds before next post to respect Instagram API limits...`);
        await new Promise(res => setTimeout(res, 30000));
      }
    } else if (!postRes.success) {
      console.error(`❌ Error publishing #${index + 1}: ${postRes.error}`);
    }
  }

  if (updatedCount > 0 && !cli.dryRun) {
    console.log(`\n📦 Committing updated CSV & database to Git repository...`);
    try {
      syncRepositoryToGit(`Update Instagram Media IDs in videos_metadata.csv (${updatedCount} posted)`, mediaDir);
    } catch (gitErr: any) {
      console.warn(`   ⚠️ Git sync warning: ${gitErr.message}`);
    }
  }

  console.log(`\n✨ Finished processing! ${updatedCount} video(s) published.`);
}

if (process.argv[1]?.includes('post_csv_to_instagram')) {
  main().catch(console.error);
}
