/**
 * YouTube Data API v3 Automated Video Uploader for Coloro.in
 *
 * Handles OAuth 2.0 authentication, local token storage, video upload,
 * and metadata publication for YouTube Shorts.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { URL } from 'url';
import { exec } from 'child_process';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { YouTubeShortsMetadata } from './social_metadata.js';

dotenv.config();

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly'
];

const TOKENS_PATH = path.resolve(process.cwd(), '.youtube_tokens.json');
const CLIENT_SECRETS_PATH = path.resolve(process.cwd(), 'client_secrets.json');

export interface YouTubeUploadResult {
  success: boolean;
  videoId?: string;
  shortsUrl?: string;
  watchUrl?: string;
  error?: string;
}

/**
 * Loads OAuth2 credentials from environment or client_secrets.json
 */
function getOAuth2Credentials(): { clientId: string; clientSecret: string; redirectUri: string } {
  let clientId = process.env.YOUTUBE_CLIENT_ID || '';
  let clientSecret = process.env.YOUTUBE_CLIENT_SECRET || '';
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

  if (!clientId || !clientSecret) {
    if (fs.existsSync(CLIENT_SECRETS_PATH)) {
      try {
        const raw = fs.readFileSync(CLIENT_SECRETS_PATH, 'utf-8');
        const json = JSON.parse(raw);
        const creds = json.installed || json.web || {};
        clientId = creds.client_id || clientId;
        clientSecret = creds.client_secret || clientSecret;
      } catch (err) {
        console.warn('⚠️ Could not parse client_secrets.json:', err);
      }
    }
  }

  return { clientId, clientSecret, redirectUri };
}

/**
 * Creates and authenticates an OAuth2 client
 */
export async function getAuthenticatedOAuth2Client(): Promise<any> {
  const { clientId, clientSecret, redirectUri } = getOAuth2Credentials();

  if (!clientId || !clientSecret) {
    throw new Error(
      '❌ Missing YouTube OAuth2 Credentials!\n' +
      'Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in your .env file,\n' +
      'or place your downloaded client_secrets.json in the project root.\n' +
      'See README_SOCIAL_VIDEO.md for step-by-step setup instructions.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  // Check if tokens are already saved
  if (fs.existsSync(TOKENS_PATH)) {
    try {
      const tokensRaw = fs.readFileSync(TOKENS_PATH, 'utf-8');
      const tokens = JSON.parse(tokensRaw);
      oauth2Client.setCredentials(tokens);

      oauth2Client.on('tokens', (newTokens) => {
        const merged = { ...tokens, ...newTokens };
        fs.writeFileSync(TOKENS_PATH, JSON.stringify(merged, null, 2));
      });

      return oauth2Client;
    } catch (err) {
      console.warn('⚠️ Saved tokens invalid or expired, requesting new authorization...');
    }
  }

  // Not yet authorized: Start interactive OAuth flow
  console.log('\n🔑 Starting YouTube OAuth 2.0 Authorization...');
  return new Promise((resolve, reject) => {
    const port = 3000;
    const server = http.createServer(async (req, res) => {
      try {
        if (!req.url) return;
        const reqUrl = new URL(req.url, `http://localhost:${port}`);
        if (reqUrl.pathname === '/oauth2callback') {
          const code = reqUrl.searchParams.get('code');
          if (code) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(
              '<html><body style="font-family:sans-serif;text-align:center;padding:50px;">' +
              '<h1 style="color:#10B981;">✅ Authorization Successful!</h1>' +
              '<p>You have successfully authenticated with YouTube. You can return to your terminal now.</p>' +
              '</body></html>'
            );

            server.close();

            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
            console.log('✅ YouTube tokens received and saved to .youtube_tokens.json\n');
            resolve(oauth2Client);
          } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Authorization failed: No code provided.');
            reject(new Error('No authorization code provided in callback'));
          }
        }
      } catch (e) {
        reject(e);
      }
    });

    server.listen(port, () => {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES,
      });

      console.log('👉 Please authenticate in your browser:');
      console.log(`\n🔗 ${authUrl}\n`);

      // Attempt to auto-open browser on Windows/macOS
      const startCmd = process.platform === 'win32' ? `start "" "${authUrl}"` : `open "${authUrl}"`;
      exec(startCmd, () => {
        // ignore browser launch failures
      });
    });

    server.on('error', (err) => {
      reject(new Error(`OAuth callback server error: ${err.message}`));
    });
  });
}

/**
 * Uploads a video file to YouTube with SEO metadata
 */
export async function uploadVideoToYouTube(
  videoPath: string,
  metadata: YouTubeShortsMetadata
): Promise<YouTubeUploadResult> {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found at: ${videoPath}`);
  }

  const fileSize = fs.statSync(videoPath).size;
  const fileSizeMb = (fileSize / (1024 * 1024)).toFixed(2);

  console.log(`\n🚀 Uploading Video to YouTube (${fileSizeMb} MB)...`);
  console.log(`   📌 Title: ${metadata.title}`);
  console.log(`   🔒 Privacy: ${metadata.privacyStatus.toUpperCase()}`);
  console.log(`   🏷 Tags: ${metadata.tags.slice(0, 6).join(', ')}...`);

  const auth = await getAuthenticatedOAuth2Client();
  const youtube = google.youtube({ version: 'v3', auth });

  try {
    const res = await youtube.videos.insert(
      {
        part: ['snippet', 'status'],
        notifySubscribers: true,
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: metadata.categoryId || '27', // Education
            defaultLanguage: 'en',
            defaultAudioLanguage: 'en',
          },
          status: {
            privacyStatus: metadata.privacyStatus,
            selfDeclaredMadeForKids: metadata.selfDeclaredMadeForKids,
            embeddable: true,
            publicStatsViewable: true,
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      },
      {
        // Track upload progress
        onUploadProgress: (evt) => {
          const progress = Math.round((evt.bytesRead / fileSize) * 100);
          process.stdout.write(`   Uploading: ${progress}% (${(evt.bytesRead / (1024 * 1024)).toFixed(1)} MB)...\r`);
        },
      }
    );

    console.log('');
    const videoId = res.data.id;
    if (!videoId) {
      throw new Error('Upload succeeded but no video ID was returned.');
    }

    const shortsUrl = `https://youtube.com/shorts/${videoId}`;
    const watchUrl = `https://youtu.be/${videoId}`;

    console.log('🎉 Upload Successful!');
    console.log(`   📺 Shorts Link: ${shortsUrl}`);
    console.log(`   🔗 Direct Link: ${watchUrl}`);

    return {
      success: true,
      videoId,
      shortsUrl,
      watchUrl,
    };
  } catch (err: any) {
    console.error('❌ YouTube Upload Error:', err.message || err);
    return {
      success: false,
      error: err.message || String(err),
    };
  }
}
