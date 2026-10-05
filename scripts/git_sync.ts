/**
 * Git Synchronization Helper for Video & Image Assets
 *
 * Automatically manages local files in D:\Hostiger_Deployment\Insta_video
 * and synchronizes with https://github.com/Singhak/insta_video.git
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

export const DEFAULT_MEDIA_DIR = process.env.VIDEO_OUTPUT_DIR || 'D:\\Hostiger_Deployment\\Insta_video';
export const GITHUB_REPO_URL = 'https://github.com/Singhak/insta_video.git';
export const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Singhak/insta_video/main';

/**
 * Returns the effective media directory, ensuring it exists
 */
export function getMediaDirectory(): string {
  const dir = DEFAULT_MEDIA_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Computes public raw GitHub URL for a file in the repository
 */
export function getGitRawUrl(fileName: string): string {
  const cleanName = path.basename(fileName);
  return `${GITHUB_RAW_BASE}/${encodeURIComponent(cleanName)}`;
}

export interface GitSyncResult {
  success: boolean;
  gitUrl: string;
  output?: string;
  error?: string;
}

/**
 * Adds, commits, and pushes a file or entire repository changes (including videos.db) to Git
 */
export function syncFileToGit(
  filePath: string,
  commitMessage?: string,
  repoDir: string = getMediaDirectory()
): GitSyncResult {
  const fileName = path.basename(filePath);
  const gitUrl = getGitRawUrl(fileName);

  try {
    // Check if directory is a git repository
    try {
      execSync('git rev-parse --is-inside-work-tree', {
        cwd: repoDir,
        stdio: 'pipe'
      });
    } catch {
      // If not a git repo, try to initialize or clone
      console.log(`⚙️ Initializing git in ${repoDir}...`);
      execSync('git init', { cwd: repoDir, stdio: 'inherit' });
      execSync(`git remote add origin ${GITHUB_REPO_URL}`, { cwd: repoDir, stdio: 'inherit' });
    }

    // Add file
    execSync(`git add "${fileName}"`, { cwd: repoDir, stdio: 'pipe' });

    // Also stage videos.db if present
    if (fs.existsSync(path.join(repoDir, 'videos.db'))) {
      execSync('git add "videos.db"', { cwd: repoDir, stdio: 'pipe' });
    }

    // Check if there are changes to commit
    const status = execSync('git status --porcelain', { cwd: repoDir, encoding: 'utf-8' });
    if (status.trim().length > 0) {
      const msg = commitMessage || `Add ${fileName} & update videos.db`;
      execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { cwd: repoDir, stdio: 'pipe' });
      console.log(`📦 Committed to Git: ${fileName} & videos.db`);
    }

    // Push to remote repository
    console.log(`🚀 Pushing ${fileName} & database to GitHub (Singhak/insta_video)...`);
    try {
      execSync('git push origin main', { cwd: repoDir, stdio: 'pipe', timeout: 30000 });
      console.log(`✅ Git Push Successful!`);
    } catch (pushErr: any) {
      // Try to push with upstream tracking if first time
      try {
        execSync('git push -u origin main', { cwd: repoDir, stdio: 'pipe', timeout: 30000 });
        console.log(`✅ Git Push Successful!`);
      } catch (retryErr: any) {
        console.warn(`⚠️ Git push warning: ${retryErr.message || retryErr}`);
      }
    }

    return {
      success: true,
      gitUrl,
    };
  } catch (err: any) {
    console.error(`❌ Git sync failed for ${fileName}:`, err.message || err);
    return {
      success: false,
      gitUrl,
      error: err.message || String(err),
    };
  }
}

/**
 * Adds, commits, and pushes all modified files in media directory (including videos.db and CSVs)
 */
export function syncRepositoryToGit(
  commitMessage: string = 'Update media assets and videos.db',
  repoDir: string = getMediaDirectory()
): { success: boolean; error?: string } {
  try {
    try {
      execSync('git rev-parse --is-inside-work-tree', {
        cwd: repoDir,
        stdio: 'pipe'
      });
    } catch {
      console.log(`⚙️ Initializing git in ${repoDir}...`);
      execSync('git init', { cwd: repoDir, stdio: 'inherit' });
      execSync(`git remote add origin ${GITHUB_REPO_URL}`, { cwd: repoDir, stdio: 'inherit' });
    }

    // Add all files
    execSync('git add -A', { cwd: repoDir, stdio: 'pipe' });

    const status = execSync('git status --porcelain', { cwd: repoDir, encoding: 'utf-8' });
    if (status.trim().length > 0) {
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: repoDir, stdio: 'pipe' });
      console.log(`📦 Committed repository changes (${commitMessage})`);
    }

    console.log(`🚀 Pushing all updates (media, videos.db & CSVs) to GitHub (Singhak/insta_video)...`);
    try {
      execSync('git push origin main', { cwd: repoDir, stdio: 'pipe', timeout: 30000 });
      console.log(`✅ Git Push Successful!`);
    } catch (pushErr: any) {
      try {
        execSync('git push -u origin main', { cwd: repoDir, stdio: 'pipe', timeout: 30000 });
        console.log(`✅ Git Push Successful!`);
      } catch (retryErr: any) {
        console.warn(`⚠️ Git push warning: ${retryErr.message || retryErr}`);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error(`❌ Git repository sync failed:`, err.message || err);
    return { success: false, error: err.message || String(err) };
  }
}
