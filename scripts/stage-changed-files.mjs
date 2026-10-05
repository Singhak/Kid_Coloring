/**
 * Smart Deployment Staging Utility for Coloro
 * Identifies changed files between deployments and stages them in .deploy_staging/
 * so that SCP only transfers modified files in seconds rather than uploading 30MB+ of assets.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const stagingDir = path.join(rootDir, '.deploy_staging');
const manifestFile = path.join(rootDir, '.deploy_manifest.json');

const args = process.argv.slice(2);
const isCommit = args.includes('--commit');
const modeArg = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'changed';

function getFileHash(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(buffer).digest('hex');
  } catch {
    return null;
  }
}

function getAllFiles(dir, base = '') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const relPath = base ? `${base}/${file}` : file;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relPath));
    } else {
      results.push({ fullPath, relPath, mtime: stat.mtimeMs, size: stat.size });
    }
  }
  return results;
}

if (isCommit) {
  // Commit pending manifest update after successful SCP
  const pendingFile = path.join(rootDir, '.deploy_manifest_pending.json');
  if (fs.existsSync(pendingFile)) {
    fs.copyFileSync(pendingFile, manifestFile);
    fs.unlinkSync(pendingFile);
    console.log('[OK] Deployment state successfully saved to .deploy_manifest.json');
  }
  // Clean up staging folder
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  process.exit(0);
}

// Clean and prepare staging directory
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// Load previous deployment manifest
let previousManifest = {};
if (fs.existsSync(manifestFile)) {
  try {
    previousManifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  } catch {
    previousManifest = {};
  }
}

const currentFiles = getAllFiles(distDir);
const newManifest = {};
const changedFiles = [];

for (const file of currentFiles) {
  const rel = file.relPath.replace(/\\/g, '/');
  
  // Exclude mode filters
  if (modeArg === 'code-only') {
    if (rel.startsWith('pinterest-pins/') || rel.startsWith('community-pins/')) {
      continue;
    }
  }

  const hash = getFileHash(file.fullPath);
  newManifest[rel] = { hash, size: file.size, mtime: file.mtime };

  if (modeArg === 'all') {
    changedFiles.push(file);
    continue;
  }

  const prev = previousManifest[rel];
  // If file didn't exist before, or hash changed
  if (!prev || prev.hash !== hash) {
    changedFiles.push(file);
  }
}

console.log(`\n======================================================`);
console.log(`  🔍 Deployment Diff Engine (Mode: ${modeArg.toUpperCase()})`);
console.log(`======================================================`);

if (changedFiles.length === 0) {
  console.log(`[INFO] No modified files detected since last deployment!`);
  console.log(`[TIP] All files on live server are already up to date.`);
  // Stage index.html as a heartbeat just in case
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join(stagingDir, 'index.html'));
  }
} else {
  console.log(`[+] Staging ${changedFiles.length} modified/new file(s):`);
  for (const file of changedFiles) {
    const targetPath = path.join(stagingDir, file.relPath);
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.copyFileSync(file.fullPath, targetPath);
    console.log(`    -> ${file.relPath}`);
  }
}

// Write pending manifest for commit after successful upload
fs.writeFileSync(
  path.join(rootDir, '.deploy_manifest_pending.json'),
  JSON.stringify(newManifest, null, 2),
  'utf8'
);

console.log(`[OK] Staged into .deploy_staging/ (${changedFiles.length} files ready for transfer)`);
