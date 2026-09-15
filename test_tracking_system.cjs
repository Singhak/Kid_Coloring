const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { DatabaseSync } = require('node:sqlite');

console.log('====================================================');
console.log('🧪 RUNNING COLORO TELEMETRY & SQLITE VERIFICATION TESTS');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}\n`);
    failedTests++;
  }
}

const apiDir = path.join(__dirname, 'public', 'api');

// 1. Verify Backend PHP Telemetry & Database Files Exist
runTest('Backend tracking files exist in public/api', () => {
  assert(fs.existsSync(path.join(apiDir, 'tracking-db.php')), 'tracking-db.php must exist');
  assert(fs.existsSync(path.join(apiDir, 'track.php')), 'track.php must exist');
  assert(fs.existsSync(path.join(apiDir, 'tracking-stats.php')), 'tracking-stats.php must exist');
  assert(fs.existsSync(path.join(apiDir, 'analytics-dashboard.php')), 'analytics-dashboard.php must exist');
});

// 2. Verify Apache .htaccess Blocks SQLite and Helper Files
runTest('.htaccess security rule protects SQLite database and internal files', () => {
  const htaccessPath = path.join(apiDir, '.htaccess');
  assert(fs.existsSync(htaccessPath), '.htaccess must exist');
  const content = fs.readFileSync(htaccessPath, 'utf8');
  assert(content.includes('tracking-db\\.php'), '.htaccess must block tracking-db.php');
  assert(content.includes('\\.sqlite'), '.htaccess must block .sqlite files');
  assert(content.includes('\\.db$'), '.htaccess must block .db files');
});

// 2b. Verify AppFooter has NO public Telemetry link
runTest('AppFooter.tsx does NOT expose telemetry link to public users', () => {
  const footerPath = path.join(__dirname, 'src', 'components', 'AppFooter.tsx');
  const footerCode = fs.readFileSync(footerPath, 'utf8');
  assert(!footerCode.includes('📊 Telemetry'), 'AppFooter must not contain any Telemetry link');
  assert(!footerCode.includes('href="#analytics"'), 'AppFooter must not link to analytics');
});

// 2c. Verify Backend and Modal Admin Authentication
runTest('Backend tracking-stats.php and analytics-dashboard.php enforce admin authentication', () => {
  const statsCode = fs.readFileSync(path.join(apiDir, 'tracking-stats.php'), 'utf8');
  assert(statsCode.includes('isTelemetryAuthorized()'), 'tracking-stats.php must check isTelemetryAuthorized()');
  assert(statsCode.includes('401'), 'tracking-stats.php must return 401 on unauthorized access');

  const dashCode = fs.readFileSync(path.join(apiDir, 'analytics-dashboard.php'), 'utf8');
  assert(dashCode.includes('Enter Admin Passcode') || dashCode.includes('name="passcode"'), 'analytics-dashboard.php must have passcode lock screen');

  const modalCode = fs.readFileSync(path.join(__dirname, 'src', 'components', 'AnalyticsDashboardModal.tsx'), 'utf8');
  assert(modalCode.includes('Admin Passcode Required'), 'AnalyticsDashboardModal must require admin passcode');
});

// 3. Verify Frontend Telemetry Service Exists and Exports Tracker
runTest('Frontend telemetry client tracker.ts exists and has granular methods', () => {
  const trackerPath = path.join(__dirname, 'src', 'services', 'tracker.ts');
  assert(fs.existsSync(trackerPath), 'tracker.ts must exist');
  const code = fs.readFileSync(trackerPath, 'utf8');
  assert(code.includes('export const tracker'), 'Must export tracker singleton');
  assert(code.includes('trackTemplate'), 'Must define trackTemplate');
  assert(code.includes('trackTool'), 'Must define trackTool');
  assert(code.includes('trackColor'), 'Must define trackColor');
  assert(code.includes('trackCanvas'), 'Must define trackCanvas');
  assert(code.includes('trackAI'), 'Must define trackAI');
  assert(code.includes('trackMonetization'), 'Must define trackMonetization');
  assert(code.includes('sendBeacon'), 'Must support navigator.sendBeacon');
});

// 4. Test SQLite Schema and CRUD via node:sqlite
const testDbPath = path.join(__dirname, 'public', 'api', 'data', 'test_tracking.db');
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}

runTest('SQLite database schema initialization and table creation', () => {
  const dataDir = path.dirname(testDbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new DatabaseSync(testDbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');

  // Read schema definition from tracking-db.php
  const phpContent = fs.readFileSync(path.join(apiDir, 'tracking-db.php'), 'utf8');
  assert(phpContent.includes('CREATE TABLE IF NOT EXISTS tracking_sessions'), 'Must declare tracking_sessions');
  assert(phpContent.includes('CREATE TABLE IF NOT EXISTS tracking_pageviews'), 'Must declare tracking_pageviews');
  assert(phpContent.includes('CREATE TABLE IF NOT EXISTS tracking_events'), 'Must declare tracking_events');

  // Execute schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracking_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      visitor_id TEXT NOT NULL,
      user_id TEXT,
      ip_hash TEXT,
      country TEXT,
      city TEXT,
      user_agent TEXT,
      device_type TEXT DEFAULT 'desktop',
      browser TEXT,
      os TEXT,
      screen_res TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      landing_page TEXT,
      created_at TEXT NOT NULL,
      last_heartbeat_at TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      pageviews_count INTEGER DEFAULT 1,
      events_count INTEGER DEFAULT 0,
      is_pro INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tracking_pageviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      user_id TEXT,
      page_path TEXT NOT NULL,
      page_title TEXT,
      referrer TEXT,
      duration_seconds INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tracking_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      user_id TEXT,
      category TEXT NOT NULL,
      action TEXT NOT NULL,
      label TEXT,
      value REAL,
      metadata TEXT,
      created_at TEXT NOT NULL
    );
  `);

  db.close();
});

// 5. Test Granular Ingestion Simulation
runTest('Simulated granular telemetry ingestion (sessions, events, pageviews)', () => {
  const db = new DatabaseSync(testDbPath);
  const now = new Date().toISOString();

  // Insert session
  const insertSession = db.prepare(`
    INSERT INTO tracking_sessions (
      session_id, visitor_id, user_id, device_type, browser, os,
      created_at, last_heartbeat_at, duration_seconds, is_pro
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSession.run('sess_test_1', 'vis_test_1', 'user_123', 'desktop', 'Chrome', 'Windows', now, now, 120, 1);

  // Insert pageview
  const insertPv = db.prepare(`
    INSERT INTO tracking_pageviews (session_id, visitor_id, user_id, page_path, page_title, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertPv.run('sess_test_1', 'vis_test_1', 'user_123', '/', 'Coloro Coloring Canvas', now);
  insertPv.run('sess_test_1', 'vis_test_1', 'user_123', '#pricing', 'VIP Pricing & Plans', now);

  // Insert granular events
  const insertEvent = db.prepare(`
    INSERT INTO tracking_events (session_id, visitor_id, user_id, category, action, label, value, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Template select
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'template', 'select_template', 'Friendly Dinosaur', null, JSON.stringify({ category: 'animals' }), now);
  
  // Tool & color picks
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'tools', 'use_tool', 'fill_bucket', null, null, now);
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'colors', 'pick_color', 'Cherry Red', null, JSON.stringify({ hex: '#FF6B6B' }), now);
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'colors', 'pick_pattern', 'Glitter ✨', null, JSON.stringify({ id: 'pattern:glitter' }), now);

  // Flood fill stroke
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'canvas', 'flood_fill', null, null, JSON.stringify({ color: '#FF6B6B' }), now);

  // Sticker stamp
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'canvas', 'stamp_sticker', 'Star', null, JSON.stringify({ emoji: '⭐' }), now);

  // AI Prompt
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'ai_generation', 'magic_prompt', 'Baby panda eating bamboo', null, null, now);

  // Canvas export
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'canvas', 'download_image', null, null, JSON.stringify({ isPro: true }), now);

  // Monetization funnel
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'monetization', 'view_pricing', null, null, null, now);
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'monetization', 'click_subscribe', 'annual', 499, null, now);
  insertEvent.run('sess_test_1', 'vis_test_1', 'user_123', 'monetization', 'payment_success', 'annual', 499, null, now);

  // Verify rows
  const sessionCount = db.prepare('SELECT COUNT(*) AS count FROM tracking_sessions').get().count;
  const pvCount = db.prepare('SELECT COUNT(*) AS count FROM tracking_pageviews').get().count;
  const eventCount = db.prepare('SELECT COUNT(*) AS count FROM tracking_events').get().count;

  assert.strictEqual(sessionCount, 1, 'Should have 1 session');
  assert.strictEqual(pvCount, 2, 'Should have 2 pageviews');
  assert.strictEqual(eventCount, 11, 'Should have 11 granular events');

  // Verify aggregations
  const topTmpl = db.prepare(`SELECT label, COUNT(*) AS c FROM tracking_events WHERE category = 'template' GROUP BY label`).get();
  assert.strictEqual(topTmpl.label, 'Friendly Dinosaur');

  const topColor = db.prepare(`SELECT label, COUNT(*) AS c FROM tracking_events WHERE category = 'colors' ORDER BY c DESC LIMIT 1`).get();
  assert(topColor.label === 'Cherry Red' || topColor.label === 'Glitter ✨');

  const funnelSub = db.prepare(`SELECT COUNT(*) AS c FROM tracking_events WHERE action = 'payment_success'`).get().c;
  assert.strictEqual(funnelSub, 1, 'Should record payment success in funnel');

  db.close();

  // Cleanup test DB
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
