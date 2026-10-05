/**
 * RSS 2.0 Feed Generator for GitHub Repository (Singhak/insta_video)
 *
 * Generates standards-compliant RSS 2.0 / Media RSS XML feeds from SQLite database (videos.db).
 * Feeds can be connected to Pinterest Auto-Publish, Buffer, Zapier, IFTTT, and RSS readers.
 *
 * GitHub Raw URL:
 * https://raw.githubusercontent.com/Singhak/insta_video/main/feed.xml
 * https://raw.githubusercontent.com/Singhak/insta_video/main/pinterest_videos_feed.xml
 * https://raw.githubusercontent.com/Singhak/insta_video/main/pinterest_pins_feed.xml
 */

import * as fs from 'fs';
import * as path from 'path';
import { getAllVideos, getAllPins, VideoDbRecord, PinDbRecord } from './db.js';
import { getMediaDirectory, syncRepositoryToGit, GITHUB_RAW_BASE } from './git_sync.js';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getStaggeredDate(index: number, baseDateStr?: string, intervalHours: number = 3): string {
  const base = baseDateStr ? new Date(baseDateStr) : new Date();
  const startTime = isNaN(base.getTime()) ? Date.now() : base.getTime();
  return new Date(startTime + index * intervalHours * 3600 * 1000).toUTCString();
}

export interface RssFeedOptions {
  title?: string;
  link?: string;
  description?: string;
  feedUrl?: string;
  startDate?: string;
  intervalHours?: number;
}

/**
 * Builds RSS 2.0 XML with Media RSS extensions for videos
 */
export function buildVideosRssFeed(videos: VideoDbRecord[], options: RssFeedOptions = {}): string {
  const title = options.title || 'Coloro.in Video Creations (Shorts & Reels)';
  const link = options.link || 'https://coloro.in';
  const desc = options.description || 'Satisfying kids coloring animations, toddler drawing activities, and preschool art videos.';
  const feedUrl = options.feedUrl || `${GITHUB_RAW_BASE}/pinterest_videos_feed.xml`;
  const intervalHours = options.intervalHours || 3;

  const items = videos.map((v, index) => {
    const videoUrl = v.video_path.startsWith('http') ? v.video_path : `${GITHUB_RAW_BASE}/${path.basename(v.video_path)}`;
    const pubDate = getStaggeredDate(index, v.created_at || options.startDate, intervalHours);
    const itemTitle = v.youtube_title || `Coloring ${v.name} 🎨 Easy Coloring Activity`;
    const itemDesc = v.instagram_content || v.youtube_description || `Watch ${v.name} come to life! Color online for free at https://coloro.in`;
    const destUrl = `https://coloro.in/app?category=${encodeURIComponent(v.category || 'other')}`;
    const guid = `coloro-video-${v.id || v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return `    <item>
      <title>${escapeXml(itemTitle)}</title>
      <link>${escapeXml(destUrl)}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${itemDesc}]]></description>
      <enclosure url="${videoUrl}" type="video/mp4" length="1500000" />
      <media:content url="${videoUrl}" medium="video" type="video/mp4" duration="${Math.round(v.duration_seconds || 15)}" />
      <category>${escapeXml(v.category || 'kids')}</category>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(desc)}</description>
    <language>en-us</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

/**
 * Builds RSS 2.0 XML with Media RSS extensions for pins / image sheets
 */
export function buildPinsRssFeed(pins: PinDbRecord[], options: RssFeedOptions = {}): string {
  const title = options.title || 'Coloro.in Free Printable Coloring Sheets & Activity Pins';
  const link = options.link || 'https://coloro.in';
  const desc = options.description || 'Free high-contrast printable coloring pages, alphabet sheets, and digital coloring for early learners.';
  const feedUrl = options.feedUrl || `${GITHUB_RAW_BASE}/pinterest_pins_feed.xml`;
  const intervalHours = options.intervalHours || 3;

  const items = pins.map((p, index) => {
    const imageUrl = p.media_path.startsWith('http') ? p.media_path : `${GITHUB_RAW_BASE}/${path.basename(p.media_path)}`;
    const pubDate = getStaggeredDate(index, p.created_at || options.startDate, intervalHours);
    const itemTitle = p.title || `Free Printable ${p.name} Coloring Page | Coloro`;
    const itemDesc = p.description || `Download free printable ${p.name} coloring sheet! Color online with magical sounds at https://coloro.in`;
    const destUrl = p.destination_url || `https://coloro.in/?category=${encodeURIComponent(p.category || 'other')}`;
    const guid = `coloro-pin-${p.id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return `    <item>
      <title>${escapeXml(itemTitle)}</title>
      <link>${escapeXml(destUrl)}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${itemDesc}]]></description>
      <enclosure url="${imageUrl}" type="image/png" length="250000" />
      <media:content url="${imageUrl}" medium="image" type="image/png" width="1000" height="1500" />
      <category>${escapeXml(p.board_name || p.category || 'Coloring Pages')}</category>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(desc)}</description>
    <language>en-us</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

/**
 * Builds combined Master RSS 2.0 Feed containing both videos and image pins
 */
export function buildMasterRssFeed(videos: VideoDbRecord[], pins: PinDbRecord[], options: RssFeedOptions = {}): string {
  const title = options.title || 'Coloro.in Media & Activity Feed (Videos + Printables)';
  const link = options.link || 'https://coloro.in';
  const desc = options.description || 'Latest videos, animations, and printable coloring pages from Coloro.in.';
  const feedUrl = options.feedUrl || `${GITHUB_RAW_BASE}/feed.xml`;
  const intervalHours = options.intervalHours || 3;
  const baseTime = options.startDate ? new Date(options.startDate).getTime() : new Date('2026-09-22T06:00:00Z').getTime();

  let currentIndex = 0;

  // Combine and sort by ID / recency
  const videoItems = videos.map((v) => {
    const videoUrl = v.video_path.startsWith('http') ? v.video_path : `${GITHUB_RAW_BASE}/${path.basename(v.video_path)}`;
    const pubDate = new Date(baseTime + (currentIndex++) * intervalHours * 3600 * 1000).toUTCString();
    const itemTitle = v.youtube_title || `Coloring ${v.name} 🎨 Video`;
    const itemDesc = v.instagram_content || v.youtube_description || `Watch ${v.name} coloring animation on Coloro.in`;
    const destUrl = `https://coloro.in/app?category=${encodeURIComponent(v.category || 'other')}`;
    const guid = `coloro-video-${v.id}`;

    return `    <item>
      <title>${escapeXml(itemTitle)}</title>
      <link>${escapeXml(destUrl)}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${itemDesc}]]></description>
      <enclosure url="${videoUrl}" type="video/mp4" length="1500000" />
      <media:content url="${videoUrl}" medium="video" type="video/mp4" duration="${Math.round(v.duration_seconds || 15)}" />
      <category>${escapeXml(v.category || 'videos')}</category>
    </item>`;
  });

  const pinItems = pins.map((p) => {
    const imageUrl = p.media_path.startsWith('http') ? p.media_path : `${GITHUB_RAW_BASE}/${path.basename(p.media_path)}`;
    const pubDate = new Date(baseTime + (currentIndex++) * intervalHours * 3600 * 1000).toUTCString();
    const itemTitle = p.title || `Free Printable ${p.name} Coloring Page`;
    const itemDesc = p.description || `Download free printable ${p.name} coloring sheet!`;
    const destUrl = p.destination_url || `https://coloro.in/?category=${encodeURIComponent(p.category || 'other')}`;
    const guid = `coloro-pin-${p.id}`;

    return `    <item>
      <title>${escapeXml(itemTitle)}</title>
      <link>${escapeXml(destUrl)}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${itemDesc}]]></description>
      <enclosure url="${imageUrl}" type="image/png" length="250000" />
      <media:content url="${imageUrl}" medium="image" type="image/png" width="1000" height="1500" />
      <category>${escapeXml(p.board_name || p.category || 'printables')}</category>
    </item>`;
  });

  const allItems = [...videoItems, ...pinItems].join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(desc)}</description>
    <language>en-us</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${allItems}
  </channel>
</rss>`;
}

/**
 * Generates all RSS XML files and writes them directly into target directory (D:\Hostiger_Deployment\Insta_video)
 */
export function generateAllRssFiles(targetDir: string = getMediaDirectory()): {
  masterFeedPath: string;
  videosFeedPath: string;
  pinsFeedPath: string;
} {
  const videos = getAllVideos(100);
  const pins = getAllPins(100);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const masterXml = buildMasterRssFeed(videos, pins);
  const videosXml = buildVideosRssFeed(videos);
  const pinsXml = buildPinsRssFeed(pins);

  const masterFeedPath = path.join(targetDir, 'feed.xml');
  const videosFeedPath = path.join(targetDir, 'pinterest_videos_feed.xml');
  const pinsFeedPath = path.join(targetDir, 'pinterest_pins_feed.xml');

  fs.writeFileSync(masterFeedPath, masterXml, 'utf-8');
  fs.writeFileSync(videosFeedPath, videosXml, 'utf-8');
  fs.writeFileSync(pinsFeedPath, pinsXml, 'utf-8');

  console.log(`📡 RSS Feeds generated in ${targetDir}:`);
  console.log(`   - Master Feed:         ${masterFeedPath} (${videos.length} videos, ${pins.length} pins)`);
  console.log(`   - Video-Only Feed:     ${videosFeedPath} (${videos.length} videos)`);
  console.log(`   - Pin-Only Feed:       ${pinsFeedPath} (${pins.length} pins)`);

  return {
    masterFeedPath,
    videosFeedPath,
    pinsFeedPath
  };
}

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith('rss_generator.ts')) {
  console.log('🔄 Generating RSS Feeds from SQLite Database...');
  generateAllRssFiles();
  console.log('🚀 Pushing updated RSS feeds to GitHub (Singhak/insta_video)...');
  syncRepositoryToGit('Update RSS feeds (feed.xml, pinterest_videos_feed.xml, pinterest_pins_feed.xml)');
  console.log('✅ RSS Feeds Synced to GitHub!');
  console.log(`🔗 Master RSS Feed URL:       ${GITHUB_RAW_BASE}/feed.xml`);
  console.log(`🔗 Pinterest Video Feed URL:  ${GITHUB_RAW_BASE}/pinterest_videos_feed.xml`);
  console.log(`🔗 Pinterest Pins Feed URL:   ${GITHUB_RAW_BASE}/pinterest_pins_feed.xml`);
}


