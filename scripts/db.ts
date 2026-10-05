/**
 * SQLite Database Manager for Video & Image Assets
 *
 * Persists video and picture metadata using Node.js built-in `node:sqlite`.
 * Default status for new records is 'unposted'.
 */

import * as path from 'path';
import * as fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { getMediaDirectory } from './git_sync.js';

export interface VideoDbRecord {
  id?: number;
  name: string;
  category: string;
  aspect_ratio: string;
  duration_seconds: number;
  video_path: string;
  youtube_title?: string;
  youtube_description?: string;
  youtube_tags?: string;
  instagram_content?: string;
  status?: string; // 'unposted', 'published', 'failed'
  created_at?: string;
}

export interface PinDbRecord {
  id?: number;
  name: string;
  category: string;
  aspect_ratio?: string;
  media_type?: string;
  media_path: string;
  title?: string;
  description?: string;
  board_name?: string;
  destination_url?: string;
  keywords?: string;
  status?: string; // 'unposted', 'published'
  created_at?: string;
}

let dbInstance: DatabaseSync | null = null;

export function getDbPath(): string {
  const dir = getMediaDirectory();
  return path.join(dir, 'videos.db');
}

/**
 * Initializes the SQLite Database and ensures tables exist
 */
export function getDatabase(customPath?: string): DatabaseSync {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const dbPath = customPath || getDbPath();
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);

  // Initialize videos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      aspect_ratio TEXT,
      duration_seconds REAL,
      video_path TEXT NOT NULL,
      youtube_title TEXT,
      youtube_description TEXT,
      youtube_tags TEXT,
      instagram_content TEXT,
      status TEXT DEFAULT 'unposted',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Initialize pins/images table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      aspect_ratio TEXT DEFAULT '2:3',
      media_type TEXT DEFAULT 'image',
      media_path TEXT NOT NULL,
      title TEXT,
      description TEXT,
      board_name TEXT,
      destination_url TEXT,
      keywords TEXT,
      status TEXT DEFAULT 'unposted',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if (!customPath) {
    dbInstance = db;
  }

  return db;
}

/**
 * Inserts a video record into SQLite DB (default status: 'unposted')
 */
export function insertVideoRecord(record: VideoDbRecord): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO videos (
      name, category, aspect_ratio, duration_seconds, video_path,
      youtube_title, youtube_description, youtube_tags, instagram_content, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const res = stmt.run(
    record.name,
    record.category || 'other',
    record.aspect_ratio || '9:16',
    record.duration_seconds || 15,
    record.video_path,
    record.youtube_title || '',
    record.youtube_description || '',
    record.youtube_tags || '',
    record.instagram_content || '',
    record.status || 'unposted'
  );

  return Number(res.lastInsertRowid);
}

/**
 * Inserts a pin/image record into SQLite DB (default status: 'unposted')
 */
export function insertPinRecord(record: PinDbRecord): number {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM pins WHERE name = ? OR media_path = ?').get(record.name, record.media_path) as any;
  if (existing && existing.id) {
    const updateStmt = db.prepare(`
      UPDATE pins SET
        category = ?, aspect_ratio = ?, media_type = ?, media_path = ?,
        title = ?, description = ?, board_name = ?, destination_url = ?, keywords = ?
      WHERE id = ?
    `);
    updateStmt.run(
      record.category || 'other',
      record.aspect_ratio || '2:3',
      record.media_type || 'image',
      record.media_path,
      record.title || '',
      record.description || '',
      record.board_name || '',
      record.destination_url || '',
      record.keywords || '',
      existing.id
    );
    return Number(existing.id);
  }

  const stmt = db.prepare(`
    INSERT INTO pins (
      name, category, aspect_ratio, media_type, media_path,
      title, description, board_name, destination_url, keywords, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const res = stmt.run(
    record.name,
    record.category || 'other',
    record.aspect_ratio || '2:3',
    record.media_type || 'image',
    record.media_path,
    record.title || '',
    record.description || '',
    record.board_name || '',
    record.destination_url || '',
    record.keywords || '',
    record.status || 'unposted'
  );

  return Number(res.lastInsertRowid);
}

/**
 * Retrieves all video records
 */
export function getAllVideos(limit: number = 100): VideoDbRecord[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM videos ORDER BY id DESC LIMIT ?');
  return stmt.all(limit) as unknown as VideoDbRecord[];
}

/**
 * Retrieves all pin records
 */
export function getAllPins(limit: number = 100): PinDbRecord[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM pins ORDER BY id DESC LIMIT ?');
  return stmt.all(limit) as unknown as PinDbRecord[];
}

/**
 * Updates video publication status
 */
export function updateVideoStatus(id: number, status: string): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE videos SET status = ? WHERE id = ?');
  stmt.run(status, id);
}

/**
 * Prints a clean summary table of database records to console
 */
export function printDatabaseSummary(): void {
  const videos = getAllVideos(20);
  const pins = getAllPins(20);
  const dbPath = getDbPath();

  console.log('\n===========================================================');
  console.log(`🗄️ SQLITE DATABASE SUMMARY (${dbPath})`);
  console.log('===========================================================');

  console.log(`\n🎥 VIDEOS TABLE (${videos.length} recent records):`);
  if (videos.length === 0) {
    console.log('   (No videos recorded yet)');
  } else {
    videos.forEach((v) => {
      console.log(`   [ID: ${v.id}] ${v.name} | Cat: ${v.category} | ${v.aspect_ratio} (${v.duration_seconds}s) | Status: [${v.status}]`);
      console.log(`      🔗 Git: ${v.video_path}`);
    });
  }

  console.log(`\n📌 PINS/IMAGES TABLE (${pins.length} recent records):`);
  if (pins.length === 0) {
    console.log('   (No pins recorded yet)');
  } else {
    pins.forEach((p) => {
      console.log(`   [ID: ${p.id}] ${p.name} | Cat: ${p.category} | Status: [${p.status}]`);
      console.log(`      🔗 Git: ${p.media_path}`);
    });
  }
  console.log('===========================================================\n');
}
