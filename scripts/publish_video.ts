/**
 * Master Social Media Video Publisher for Coloro.in
 *
 * Generates vertical 9:16 (1080x1920) and widescreen 16:9 (1920x1080) videos,
 * saves them in D:\Hostiger_Deployment\Insta_video, commits & pushes to GitHub
 * (https://github.com/Singhak/insta_video.git), records metadata in SQLite DB (videos.db),
 * and prepares official Pinterest Video Bulk Upload CSV.
 *
 * Usage:
 *   npx tsx scripts/publish_video.ts --generate-only
 *   npx tsx scripts/publish_video.ts --generate-only --template="solar system"
 *   npx tsx scripts/publish_video.ts --dry-run
 *   npx tsx scripts/publish_video.ts --target=youtube --template="Whiskers The Kitten"
 *   npx tsx scripts/publish_video.ts --target=instagram --category=animal
 *   npx tsx scripts/publish_video.ts --list
 *   npx tsx scripts/publish_video.ts --list-db
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { STATIC_TEMPLATES } from '../src/constants.js';
import { Template } from '../src/types.js';
import { generateShortsVideo } from './shorts_video_generator.js';
import { generateSocialPublishMetadata } from './social_metadata.js';
import { uploadVideoToYouTube } from './youtube_uploader.js';
import { handleInstagramPublish } from './instagram_uploader.js';
import { syncFileToGit, syncRepositoryToGit, getMediaDirectory, getGitRawUrl } from './git_sync.js';
import {
  insertVideoRecord,
  updateVideoStatus,
  printDatabaseSummary,
  getDbPath,
  VideoDbRecord
} from './db.js';
import { getCategoryMeta } from '../src/services/pinterestPinGenerator.js';
import { generateAllRssFiles } from './rss_generator.js';

dotenv.config();

export interface VideoCsvRecord {
  timestamp: string;
  templateName: string;
  category: string;
  aspectRatio: string;
  durationSeconds: number;
  videoPath: string;
  youtubeTitle: string;
  youtubeDescription: string;
  youtubeTags: string;
  instagramContent: string;
  destinationUrl: string;
  youtubePrivacy: string;
  youtubeUrl?: string;
  instagramMediaId?: string;
  status: 'unposted' | 'GENERATED' | 'DRY_RUN' | 'PUBLISHED' | 'FAILED' | 'PARTIAL';
}

function escapeCsvField(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Appends record to project metadata CSV log
 */
export function appendVideoRecordToCsv(record: VideoCsvRecord, csvFilePath?: string): string {
  const targetPath = csvFilePath || path.join(getMediaDirectory(), 'videos_metadata.csv');
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const headers = [
    'Timestamp',
    'Template Name',
    'Category',
    'Aspect Ratio',
    'Duration (s)',
    'Video Path',
    'YouTube Title',
    'YouTube Description',
    'YouTube Tags',
    'Instagram Content',
    'Destination URL',
    'YouTube Privacy',
    'YouTube URL',
    'Instagram Media ID',
    'Status'
  ];

  const row = [
    record.timestamp,
    record.templateName,
    record.category,
    record.aspectRatio,
    record.durationSeconds,
    record.videoPath,
    record.youtubeTitle,
    record.youtubeDescription,
    record.youtubeTags,
    record.instagramContent,
    record.destinationUrl,
    record.youtubePrivacy,
    record.youtubeUrl || '',
    record.instagramMediaId || '',
    record.status
  ].map(escapeCsvField).join(',');

  const fileExists = fs.existsSync(targetPath);
  if (!fileExists) {
    const headerRow = headers.map(escapeCsvField).join(',');
    fs.writeFileSync(targetPath, `${headerRow}\n${row}\n`, 'utf-8');
  } else {
    fs.appendFileSync(targetPath, `${row}\n`, 'utf-8');
  }

  return targetPath;
}

export interface PinterestVideoRecord {
  title: string;
  mediaUrl: string;
  boardName: string;
  thumbnail?: string;
  description: string;
  link: string;
  publishDate?: string;
  keywords?: string;
}

/**
 * Appends video pin record to Pinterest official bulk upload CSV:
 * Headers: Title, Media URL, Pinterest board, Thumbnail, Description, Link, Publish date, Keywords
 */
export function appendVideoToPinterestCsv(
  record: PinterestVideoRecord,
  csvFilePath?: string
): string {
  const targetPath = csvFilePath || path.join(getMediaDirectory(), 'pinterest_video_bulk_schedule.csv');
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const headers = [
    'Title',
    'Media URL',
    'Pinterest board',
    'Thumbnail',
    'Description',
    'Link',
    'Publish date',
    'Keywords'
  ];

  // Title <= 100 chars
  const rawTitle = record.title.length > 95 ? record.title.substring(0, 95) + '...' : record.title;
  // Description <= 500 chars
  const rawDesc = record.description.length > 480 ? record.description.substring(0, 480) + '...' : record.description;

  const row = [
    rawTitle,
    record.mediaUrl,
    record.boardName,
    record.thumbnail || '',
    rawDesc,
    record.link,
    record.publishDate || '',
    record.keywords || ''
  ].map(escapeCsvField).join(',');

  const fileExists = fs.existsSync(targetPath);
  if (!fileExists) {
    const headerRow = headers.map(escapeCsvField).join(',');
    fs.writeFileSync(targetPath, `${headerRow}\n${row}\n`, 'utf-8');
  } else {
    fs.appendFileSync(targetPath, `${row}\n`, 'utf-8');
  }

  return targetPath;
}

interface CliArgs {
  target: 'youtube' | 'instagram' | 'both';
  templateName?: string;
  category?: string;
  privacy: 'public' | 'unlisted' | 'private';
  duration?: number;
  fps: number;
  aspectRatio: '9:16' | '16:9';
  generateOnly: boolean;
  dryRun: boolean;
  list: boolean;
  listDb: boolean;
  outputDir?: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let target: 'youtube' | 'instagram' | 'both' = 'both';
  let templateName: string | undefined;
  let category: string | undefined;
  let privacy: 'public' | 'unlisted' | 'private' = (process.env.YOUTUBE_DEFAULT_PRIVACY as any) || 'public';
  let duration: number | undefined;
  let fps = 24;
  let aspectRatio: '9:16' | '16:9' = '9:16';
  let generateOnly = false;
  let dryRun = false;
  let list = false;
  let listDb = false;
  let outputDir: string | undefined;

  for (const arg of args) {
    if (arg === '--list') list = true;
    else if (arg === '--list-db' || arg === '--db') listDb = true;
    else if (arg === '--generate-only') generateOnly = true;
    else if (arg === '--dry-run') dryRun = true;
    else if (arg.startsWith('--target=')) {
      const val = arg.split('=')[1].toLowerCase();
      if (val === 'youtube' || val === 'instagram' || val === 'both') target = val;
    } else if (arg.startsWith('--template=')) {
      templateName = arg.slice('--template='.length).replace(/^["'\\\s]+|["'\\\s]+$/g, '').trim();
    } else if (arg.startsWith('--category=')) {
      category = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--privacy=')) {
      const p = arg.split('=')[1].toLowerCase();
      if (p === 'public' || p === 'unlisted' || p === 'private') privacy = p;
    } else if (arg.startsWith('--duration=')) {
      duration = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--fps=')) {
      fps = parseInt(arg.split('=')[1], 10) || 24;
    } else if (arg.startsWith('--out-dir=')) {
      outputDir = arg.slice('--out-dir='.length).trim();
    } else if (arg.startsWith('--aspect=')) {
      const a = arg.split('=')[1].toLowerCase();
      if (a === '16:9' || a === '16/9' || a === 'wide' || a === 'widescreen' || a === 'long' || a === 'landscape') {
        aspectRatio = '16:9';
      } else {
        aspectRatio = '9:16';
      }
    }
  }

  return {
    target,
    templateName,
    category,
    privacy,
    duration,
    fps,
    aspectRatio,
    generateOnly,
    dryRun,
    list,
    listDb,
    outputDir
  };
}

async function main() {
  const cli = parseArgs();

  // Mode: List SQLite DB
  if (cli.listDb) {
    printDatabaseSummary();
    return;
  }

  // 1. List templates mode
  if (cli.list) {
    console.log('\n🎨 Available Coloro Coloring Templates:\n');
    const available = STATIC_TEMPLATES.filter(t => t.paths && t.paths.length > 0);
    const byCat: Record<string, Template[]> = {};

    for (const t of available) {
      const cat = t.category || 'other';
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(t);
    }

    for (const [cat, items] of Object.entries(byCat)) {
      console.log(`📁 [${cat.toUpperCase()}] (${items.length} templates):`);
      for (const item of items.slice(0, 8)) {
        console.log(`   - "${item.name}" (${item.paths.length} paths, difficulty: ${item.difficulty || 'Normal'})`);
      }
      if (items.length > 8) {
        console.log(`     ... and ${items.length - 8} more`);
      }
      console.log('');
    }
    return;
  }

  const mediaDir = cli.outputDir || getMediaDirectory();
  const defaultDuration = cli.aspectRatio === '16:9' ? 60 : 15;
  const effectiveDuration = cli.duration || defaultDuration;
  const resolution = cli.aspectRatio === '16:9' ? '1920x1080 (Widescreen)' : '1080x1920 (Vertical)';

  console.log('===========================================================');
  console.log(`🎨 COLORO.IN VIDEO PUBLISHER (${cli.aspectRatio} ${resolution})`);
  console.log('===========================================================');
  console.log(`🎯 Target Platform: ${cli.target.toUpperCase()}`);
  console.log(`📁 Output Folder:   ${mediaDir}`);
  console.log(`🗄️ SQLite DB:       ${getDbPath()}`);
  console.log(`📐 Aspect Ratio:    ${cli.aspectRatio} [${cli.aspectRatio === '16:9' ? 'Long Video' : 'Short Video'}]`);
  console.log(`⏱ Duration:        ${effectiveDuration}s | 🎞 FPS: ${cli.fps}`);
  console.log(`🔒 YouTube Privacy: ${cli.privacy.toUpperCase()}`);
  if (cli.dryRun) console.log('🔍 Mode: DRY RUN (Render video & prepare metadata, skip network publish)');
  if (cli.generateOnly) console.log('🎥 Mode: GENERATE ONLY (Render video, commit to Git & log to SQLite DB)');
  console.log('-----------------------------------------------------------');

  // 2. Select template
  const availableTemplates = STATIC_TEMPLATES.filter(t => t.paths && t.paths.length > 0);
  let selectedTemplate: Template | undefined;

  if (cli.templateName) {
    const search = cli.templateName.toLowerCase();
    selectedTemplate = availableTemplates.find(t => t.name.toLowerCase().includes(search));
    if (!selectedTemplate) {
      console.error(`❌ Template matching "${cli.templateName}" not found.`);
      process.exit(1);
    }
  } else if (cli.category) {
    const catSearch = cli.category.toLowerCase();
    const inCat = availableTemplates.filter(t => (t.category || '').toLowerCase().includes(catSearch));
    if (inCat.length > 0) {
      selectedTemplate = inCat[Math.floor(Math.random() * inCat.length)];
    } else {
      console.error(`❌ No templates found matching category "${cli.category}".`);
      process.exit(1);
    }
  } else {
    // If category is not given, randomly select a category and pick a template from it
    const categories = Array.from(new Set(availableTemplates.map(t => t.category).filter(Boolean)));
    if (categories.length > 0) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const inCat = availableTemplates.filter(t => t.category === randomCategory);
      selectedTemplate = inCat[Math.floor(Math.random() * inCat.length)];
      console.log(`🎲 No category specified: Randomly selected category "${randomCategory}"`);
    } else {
      selectedTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    }
  }

  if (!selectedTemplate) {
    console.error('❌ No coloring templates available.');
    process.exit(1);
  }

  console.log(`🎨 Selected Template: "${selectedTemplate.name}" (${selectedTemplate.category})`);
  console.log(`   Paths: ${selectedTemplate.paths.length} sections`);

  // 3. Generate Video directly into target media directory
  const videoPath = await generateShortsVideo(selectedTemplate, {
    durationSeconds: effectiveDuration,
    fps: cli.fps,
    aspectRatio: cli.aspectRatio,
    outputDir: mediaDir,
  });

  // 4. Compute Git Video URL
  const videoFileName = path.basename(videoPath);
  const gitVideoPath = getGitRawUrl(videoFileName);
  console.log(`🔗 Git Video Raw URL: ${gitVideoPath}`);

  // 5. Generate Platform Metadata
  const metadata = generateSocialPublishMetadata(selectedTemplate, {
    privacyStatus: cli.privacy,
    aspectRatio: cli.aspectRatio,
  });
  const catMeta = getCategoryMeta(selectedTemplate.category);

  console.log('\n===========================================================');
  console.log('📝 GENERATED SOCIAL METADATA');
  console.log('===========================================================');

  if (cli.target === 'youtube' || cli.target === 'both') {
    const ytLabel = cli.aspectRatio === '16:9' ? 'YOUTUBE WIDESCREEN (16:9)' : 'YOUTUBE SHORTS (9:16)';
    console.log(`\n▶️  ${ytLabel} METADATA:`);
    console.log(`   📌 Title: ${metadata.youtube.title}`);
    console.log(`   🏷 Tags: ${metadata.youtube.tags.slice(0, 8).join(', ')}...`);
    console.log(`   🔗 Category URL: ${metadata.youtube.destinationUrl}`);
  }

  if (cli.target === 'instagram' || cli.target === 'both') {
    console.log('\n📸 INSTAGRAM METADATA:');
    console.log('   --------------------------------------------------------');
    console.log(metadata.instagram.fullCaptionWithHashtags.split('\n').map(l => `   | ${l}`).join('\n'));
    if (metadata.instagram.firstComment) {
      console.log('   --------------------------------------------------------');
      console.log('   💬 FIRST COMMENT WITH LINK:');
      console.log(metadata.instagram.firstComment.split('\n').map(l => `   | ${l}`).join('\n'));
    }
    console.log('   --------------------------------------------------------');
  }

  // 6. Save to SQLite Database with default status 'unposted'
  const dbRecordId = insertVideoRecord({
    name: selectedTemplate.name,
    category: selectedTemplate.category || 'other',
    aspect_ratio: cli.aspectRatio,
    duration_seconds: effectiveDuration,
    video_path: gitVideoPath,
    youtube_title: metadata.youtube.title,
    youtube_description: metadata.youtube.description,
    youtube_tags: metadata.youtube.tags.join(', '),
    instagram_content: metadata.instagram.fullCaptionWithHashtags,
    status: 'unposted',
  });
  console.log(`\n🗄️ SQLite DB Record Created [ID: ${dbRecordId}] (Status: 'unposted') in ${getDbPath()}`);

  // 7. Save / Append to Pinterest Video Bulk Upload CSV
  const pinterestVideoTitle = `Coloring ${selectedTemplate.name} 🎨 Easy Kids Coloring Activity | Coloro`;
  const pinterestVideoDesc = `Watch ${selectedTemplate.name} come to life! Color this printable sheet online for free or download high-resolution PDF printables for toddlers and preschool activities at Coloro.in. Explore full ${catMeta.label} collection at ${metadata.youtube.destinationUrl}. #coloring #kidsactivities #coloringpages #artforkids #preschoolprintables`;

  const pinCsvPath = appendVideoToPinterestCsv({
    title: pinterestVideoTitle,
    mediaUrl: gitVideoPath,
    boardName: catMeta.board,
    thumbnail: '', // Pinterest will generate thumbnail from video
    description: pinterestVideoDesc,
    link: metadata.youtube.destinationUrl,
    keywords: metadata.youtube.tags.join(', '),
  });
  console.log(`📌 Pinterest Video CSV Logged: ${pinCsvPath}`);

  // 8. Append to metadata CSV log
  const csvPath = appendVideoRecordToCsv({
    timestamp: new Date().toISOString(),
    templateName: selectedTemplate.name,
    category: selectedTemplate.category,
    aspectRatio: cli.aspectRatio,
    durationSeconds: effectiveDuration,
    videoPath: gitVideoPath,
    youtubeTitle: metadata.youtube.title,
    youtubeDescription: metadata.youtube.description,
    youtubeTags: metadata.youtube.tags.join(', '),
    instagramContent: metadata.instagram.fullCaptionWithHashtags,
    destinationUrl: metadata.youtube.destinationUrl,
    youtubePrivacy: cli.privacy,
    status: 'unposted',
  });

  // 9. Update RSS Feeds for GitHub Repository
  generateAllRssFiles(mediaDir);

  // 10. Synchronize video, SQLite DB (videos.db), Pinterest CSV, and RSS feeds to Git
  console.log(`\n📦 Synchronizing ${videoFileName}, videos.db & RSS Feeds with GitHub repository...`);
  syncRepositoryToGit(`Add video: ${videoFileName}, update videos.db, RSS feeds & CSVs`, mediaDir);

  // 11. If generate-only, stop here
  if (cli.generateOnly) {
    console.log('\n✨ Video Generation & Recording Complete!');
    console.log(`📁 Video File:     ${videoPath}`);
    console.log(`🔗 Git Path:       ${gitVideoPath}`);
    console.log(`🗄️ SQLite DB:       ${getDbPath()} (Saved & Pushed)`);
    console.log(`📌 Pinterest CSV:   ${pinCsvPath}`);
    console.log(`📄 Metadata CSV:   ${csvPath}`);
    console.log(`📡 RSS Feed:       https://raw.githubusercontent.com/Singhak/insta_video/main/feed.xml`);
    return;
  }

  // 11. If dry-run, export caption file and display readiness
  if (cli.dryRun) {
    const captionPath = handleInstagramPublish(videoPath, metadata.instagram);
    const csvPath = appendVideoRecordToCsv({
      timestamp: new Date().toISOString(),
      templateName: selectedTemplate.name,
      category: selectedTemplate.category,
      aspectRatio: cli.aspectRatio,
      durationSeconds: effectiveDuration,
      videoPath: gitVideoPath,
      youtubeTitle: metadata.youtube.title,
      youtubeDescription: metadata.youtube.description,
      youtubeTags: metadata.youtube.tags.join(', '),
      instagramContent: metadata.instagram.fullCaptionWithHashtags,
      destinationUrl: metadata.youtube.destinationUrl,
      youtubePrivacy: cli.privacy,
      status: 'unposted',
    });

    console.log('\n✅ DRY RUN SUCCESSFUL!');
    console.log(`   - Video rendered and pushed to Git: ${gitVideoPath}`);
    console.log(`   - Metadata stored in SQLite DB [ID: ${dbRecordId}] (in ${getDbPath()}).`);
    console.log(`   - Pinterest Video CSV updated at ${pinCsvPath}`);
    console.log(`   - Instagram caption file saved at ${captionPath}`);
    return;
  }

  // 10. Publish to Platforms
  let ytResult: any = null;
  let igResult: any = null;

  if (cli.target === 'youtube' || cli.target === 'both') {
    try {
      ytResult = await uploadVideoToYouTube(videoPath, metadata.youtube);
    } catch (err: any) {
      console.error('❌ YouTube publish failed:', err.message || err);
      ytResult = { success: false, error: err.message || String(err) };
    }
  }

  if (cli.target === 'instagram' || cli.target === 'both') {
    try {
      igResult = await handleInstagramPublish(videoPath, metadata.instagram);
    } catch (err: any) {
      console.error('❌ Instagram publish failed:', err.message || err);
      igResult = { success: false, error: err.message || String(err) };
    }
  }

  // Record final publication status to SQLite & CSV
  const isAllSuccess = (!ytResult || ytResult.success) && (!igResult || igResult.mediaId || igResult.captionFilePath);
  const publishStatus = isAllSuccess ? 'PUBLISHED' : (ytResult?.success || igResult?.mediaId ? 'PARTIAL' : 'FAILED');

  if (isAllSuccess) {
    updateVideoStatus(dbRecordId, 'published');
  } else {
    updateVideoStatus(dbRecordId, publishStatus.toLowerCase());
  }
  syncRepositoryToGit(`Update videos.db status for video ${dbRecordId}`, mediaDir);

  const finalCsvPath = appendVideoRecordToCsv({
    timestamp: new Date().toISOString(),
    templateName: selectedTemplate.name,
    category: selectedTemplate.category,
    aspectRatio: cli.aspectRatio,
    durationSeconds: effectiveDuration,
    videoPath: gitVideoPath,
    youtubeTitle: metadata.youtube.title,
    youtubeDescription: metadata.youtube.description,
    youtubeTags: metadata.youtube.tags.join(', '),
    instagramContent: metadata.instagram.fullCaptionWithHashtags,
    destinationUrl: metadata.youtube.destinationUrl,
    youtubePrivacy: cli.privacy,
    youtubeUrl: ytResult?.shortsUrl || '',
    instagramMediaId: igResult?.mediaId || '',
    status: publishStatus as any,
  });

  // 11. Final Summary Report
  console.log('\n===========================================================');
  console.log('📊 PUBLICATION SUMMARY');
  console.log('===========================================================');
  console.log(`📁 Video File:     ${videoPath}`);
  console.log(`🔗 Git Path:       ${gitVideoPath}`);
  console.log(`🗄️ SQLite DB:       ${getDbPath()} (Status: ${isAllSuccess ? 'published' : publishStatus.toLowerCase()})`);
  console.log(`📌 Pinterest CSV:   ${pinCsvPath}`);
  console.log(`📄 Metadata CSV:   ${finalCsvPath}`);

  if (ytResult) {
    if (ytResult.success && ytResult.shortsUrl) {
      console.log(`✅ YouTube Video:  ${ytResult.shortsUrl}`);
    } else {
      console.log(`⚠️ YouTube Status:  ${ytResult.error || 'Failed'}`);
    }
  }

  if (igResult) {
    if (igResult.mediaId) {
      console.log(`✅ Instagram Reel: Published (ID: ${igResult.mediaId})`);
    } else if (igResult.captionFilePath) {
      console.log(`📋 Instagram Post: Ready for upload! Captions at ${igResult.captionFilePath}`);
    } else {
      console.log(`⚠️ Instagram Status: ${igResult.error || 'Failed'}`);
    }
  }
  console.log('===========================================================\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal execution error:', err);
  process.exit(1);
});
