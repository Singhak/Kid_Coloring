/**
 * Instagram Reels Publisher for Coloro.in
 *
 * Supports:
 * 1. Automated Meta Graph API publication (for Business/Creator accounts)
 * 2. Instant ready-to-post local export (.txt with formatted caption + hashtags)
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { InstagramReelsMetadata } from './social_metadata.js';

dotenv.config();

export interface InstagramPublishResult {
  success: boolean;
  mediaId?: string;
  reelUrl?: string;
  captionFilePath?: string;
  commentId?: string;
  commentError?: string;
  error?: string;
}

export interface PublishPhotoOptions {
  firstComment?: string;
  destinationUrl?: string;
  templateName?: string;
  skipComment?: boolean;
}

/**
 * Builds standard, engaging first comment containing direct link to the coloring sheet
 */
export function buildInstagramFirstComment(options: {
  templateName?: string;
  destinationUrl?: string;
}): string {
  const url = options.destinationUrl || 'https://coloro.in';
  if (options.templateName) {
    return `🎨 Color ${options.templateName} online or download free printable sheet:\n👉 ${url}\n(Link also in bio! ✨)`;
  }
  return `🎨 Color online or download free printable sheets:\n👉 ${url}\n(Link also in bio! ✨)`;
}

/**
 * Saves caption and hashtags to a clean text file for easy copy-pasting
 */
export function exportInstagramCaptionFile(
  videoPath: string,
  metadata: InstagramReelsMetadata
): string {
  const parsed = path.parse(videoPath);
  const captionFilePath = path.join(parsed.dir, `${parsed.name}-instagram.txt`);
  const commentText = metadata.firstComment || buildInstagramFirstComment({
    destinationUrl: metadata.destinationUrl,
  });

  const content = `=====================================================
COLORO.IN INSTAGRAM REEL CAPTION & HASHTAGS
Video: ${parsed.base}
=====================================================

${metadata.fullCaptionWithHashtags}

=====================================================
First Comment (with Link):
${commentText}

=====================================================
Direct Link to Sheets:
${metadata.destinationUrl}
=====================================================
`;

  fs.writeFileSync(captionFilePath, content, 'utf-8');
  return captionFilePath;
}

function getGraphApiBaseUrl(accessToken: string): string {
  return accessToken.startsWith('IG')
    ? 'https://graph.instagram.com/v19.0'
    : 'https://graph.facebook.com/v19.0';
}

/**
 * Publishes a comment to an existing Instagram Media (Photo or Reel)
 */
export async function postCommentToInstagram(
  mediaId: string,
  commentText: string
): Promise<{ success: boolean; commentId?: string; error?: string }> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return { success: false, error: 'Missing INSTAGRAM_ACCESS_TOKEN in .env' };
  }

  const apiBase = getGraphApiBaseUrl(accessToken);
  console.log(`\n💬 Posting first comment with link to Instagram Media (${mediaId})...`);

  try {
    const params = new URLSearchParams({
      message: commentText,
      access_token: accessToken,
    });

    const res = await fetch(`${apiBase}/${mediaId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const json = await res.json() as any;
    if (!res.ok || !json.id) {
      const errMsg = json?.error?.message || JSON.stringify(json);
      console.warn(`   ⚠️ Instagram Comment Note: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    console.log(`   ✅ First comment posted successfully! Comment ID: ${json.id}`);
    return { success: true, commentId: json.id };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.warn(`   ⚠️ Instagram Comment Error: ${errMsg}`);
    return { success: false, error: errMsg };
  }
}

/**
 * Publishes a Single Photo/Image via Instagram Graph API
 */
export async function publishPhotoToInstagram(
  imageUrl: string,
  caption: string,
  options?: PublishPhotoOptions
): Promise<InstagramPublishResult> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!accessToken || !igAccountId) {
    return {
      success: false,
      error: 'Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_ACCOUNT_ID in .env'
    };
  }

  const apiBase = getGraphApiBaseUrl(accessToken);
  console.log(`\n📸 Publishing Photo to Instagram (${apiBase})...`);

  try {
    // Step 1: Create Photo container
    const containerParams = new URLSearchParams({
      image_url: imageUrl,
      caption: caption,
      access_token: accessToken,
    });

    const createRes = await fetch(`${apiBase}/${igAccountId}/media?${containerParams.toString()}`, {
      method: 'POST',
    });

    const createJson = await createRes.json() as any;
    if (!createRes.ok || !createJson.id) {
      throw new Error(`Failed to create Instagram Photo container: ${JSON.stringify(createJson)}`);
    }

    const creationId = createJson.id;
    console.log(`   📦 Photo container created (ID: ${creationId}).`);

    // Step 2: Publish the container
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });

    const pubRes = await fetch(
      `${apiBase}/${igAccountId}/media_publish?${publishParams.toString()}`,
      { method: 'POST' }
    );

    const pubJson = await pubRes.json() as any;
    if (!pubRes.ok || !pubJson.id) {
      throw new Error(`Failed to publish Instagram Photo: ${JSON.stringify(pubJson)}`);
    }

    const mediaId = pubJson.id;
    console.log(`🎉 Instagram Photo Published! Media ID: ${mediaId}`);

    let commentId: string | undefined;
    let commentError: string | undefined;

    if (!options?.skipComment) {
      const commentText = options?.firstComment || buildInstagramFirstComment({
        templateName: options?.templateName,
        destinationUrl: options?.destinationUrl || 'https://coloro.in',
      });

      if (commentText) {
        // Wait 2 seconds to ensure media object is ready for comments
        await new Promise((r) => setTimeout(r, 2000));
        const commentRes = await postCommentToInstagram(mediaId, commentText);
        if (commentRes.success) {
          commentId = commentRes.commentId;
        } else {
          commentError = commentRes.error;
        }
      }
    }

    return { success: true, mediaId, commentId, commentError };
  } catch (err: any) {
    console.error('❌ Instagram Photo Publish Error:', err.message || err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Publishes a Reel via Meta Instagram Graph API
 */
export async function publishToInstagramGraphApi(
  videoPublicUrl: string,
  metadata: InstagramReelsMetadata
): Promise<InstagramPublishResult> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!accessToken || !igAccountId) {
    return {
      success: false,
      error: 'Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_ACCOUNT_ID in .env'
    };
  }

  const apiBase = getGraphApiBaseUrl(accessToken);
  console.log(`\n📸 Publishing Reel to Instagram Graph API (${apiBase})...`);

  try {
    // Step 1: Create Reel container
    const containerParams = new URLSearchParams({
      media_type: 'REELS',
      video_url: videoPublicUrl,
      caption: metadata.fullCaptionWithHashtags,
      share_to_feed: metadata.shareToFeed ? 'true' : 'false',
      access_token: accessToken,
    });

    const createRes = await fetch(`${apiBase}/${igAccountId}/media?${containerParams.toString()}`, {
      method: 'POST',
    });

    const createJson = await createRes.json() as any;
    if (!createRes.ok || !createJson.id) {
      throw new Error(`Failed to create Instagram Reel container: ${JSON.stringify(createJson)}`);
    }

    const creationId = createJson.id;
    console.log(`   📦 Reel container created (ID: ${creationId}). Waiting for processing...`);

    // Step 2: Poll container status until ready
    let status = 'IN_PROGRESS';
    let attempts = 0;
    const maxAttempts = 30;

    while (status !== 'FINISHED' && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 4000));
      attempts++;

      const statusRes = await fetch(
        `${apiBase}/${creationId}?fields=status_code&access_token=${accessToken}`
      );
      const statusJson = await statusRes.json() as any;
      status = statusJson.status_code || 'IN_PROGRESS';

      if (status === 'ERROR') {
        throw new Error(`Instagram video processing failed: ${JSON.stringify(statusJson)}`);
      }

      process.stdout.write(`   Processing Reel: attempt ${attempts}/${maxAttempts} (${status})...\r`);
    }

    console.log('');
    if (status !== 'FINISHED') {
      throw new Error('Timeout waiting for Instagram video processing.');
    }

    // Step 3: Publish the container
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });

    const pubRes = await fetch(
      `${apiBase}/${igAccountId}/media_publish?${publishParams.toString()}`,
      { method: 'POST' }
    );

    const pubJson = await pubRes.json() as any;
    if (!pubRes.ok || !pubJson.id) {
      throw new Error(`Failed to publish Instagram Reel: ${JSON.stringify(pubJson)}`);
    }

    const mediaId = pubJson.id;
    console.log(`🎉 Instagram Reel Published! Media ID: ${mediaId}`);

    let commentId: string | undefined;
    let commentError: string | undefined;

    const commentText = metadata.firstComment || buildInstagramFirstComment({
      templateName: metadata.title,
      destinationUrl: metadata.destinationUrl || 'https://coloro.in',
    });

    if (commentText) {
      // Wait 2 seconds to ensure media object is ready for comments
      await new Promise((r) => setTimeout(r, 2000));
      const commentRes = await postCommentToInstagram(mediaId, commentText);
      if (commentRes.success) {
        commentId = commentRes.commentId;
      } else {
        commentError = commentRes.error;
      }
    }

    return {
      success: true,
      mediaId,
      commentId,
      commentError,
    };
  } catch (err: any) {
    console.error('❌ Instagram Graph API Error:', err.message || err);
    return {
      success: false,
      error: err.message || String(err),
    };
  }
}

/**
 * Handles Instagram publication or local caption export
 */
export async function handleInstagramPublish(
  videoPath: string,
  metadata: InstagramReelsMetadata
): Promise<InstagramPublishResult> {
  // Always export local caption file
  const captionFilePath = exportInstagramCaptionFile(videoPath, metadata);
  console.log(`\n📋 Instagram Caption & Hashtags saved:`);
  console.log(`   📁 ${captionFilePath}`);

  const publicBaseUrl = process.env.PUBLIC_VIDEO_BASE_URL;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (accessToken && igAccountId && publicBaseUrl) {
    const videoFileName = path.basename(videoPath);
    const videoPublicUrl = `${publicBaseUrl.replace(/\/$/, '')}/${videoFileName}`;
    return await publishToInstagramGraphApi(videoPublicUrl, metadata);
  } else {
    console.log('ℹ️  Instagram API credentials or PUBLIC_VIDEO_BASE_URL not set in .env.');
    console.log('   Video is 100% ready for manual upload via Instagram Mobile App or Web!');
    console.log('   Simply open the saved .txt file to copy the formatted caption & hashtags.');
    return {
      success: true,
      captionFilePath,
    };
  }
}
