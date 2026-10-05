import * as fs from 'fs';
import * as path from 'path';
import { getMediaDirectory, syncRepositoryToGit } from './git_sync.js';
import { parseCsv, stringifyCsv } from './post_csv_to_instagram.js';

function deduplicateImagesCsv() {
  const mediaDir = getMediaDirectory();
  const csvPath = path.join(mediaDir, 'images_metadata.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found at: ${csvPath}`);
    return;
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const { headers, rows } = parseCsv(content);

  console.log(`Original rows in CSV: ${rows.length}`);

  const seenPaths = new Set<string>();
  const seenNames = new Set<string>();
  const dedupedRows: any[] = [];
  const removedDuplicates: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as any;
    const imgPath = (row['Image Path'] || '').trim().toLowerCase();
    const name = (row['Template Name'] || '').trim().toLowerCase();

    // Check duplicate by image path or name
    if (seenPaths.has(imgPath) || (name && seenNames.has(name))) {
      removedDuplicates.push({ index: i + 1, name: row['Template Name'], path: row['Image Path'] });
      continue;
    }

    if (imgPath) seenPaths.add(imgPath);
    if (name) seenNames.add(name);
    dedupedRows.push(row);
  }

  console.log(`Duplicates found & removed: ${removedDuplicates.length}`);
  removedDuplicates.forEach(d => {
    console.log(`  - Removed [#${d.index}] "${d.name}" (${d.path})`);
  });

  console.log(`Clean unique rows remaining: ${dedupedRows.length}`);

  if (removedDuplicates.length > 0) {
    const newCsv = stringifyCsv(headers, dedupedRows);
    fs.writeFileSync(csvPath, newCsv, 'utf-8');
    console.log(`💾 Successfully overwritten ${csvPath} with deduplicated rows.`);

    try {
      syncRepositoryToGit(`Remove ${removedDuplicates.length} duplicate entries in images_metadata.csv`, mediaDir);
      console.log('✅ Git sync complete.');
    } catch (e: any) {
      console.warn('Git sync note:', e.message);
    }
  } else {
    console.log('✨ No duplicates found.');
  }
}

deduplicateImagesCsv();
