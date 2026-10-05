/**
 * Quick Instagram Post Utility for Coloro.in
 *
 * Usage:
 *   Check connection:
 *     npx tsx scripts/post_instagram.ts --status
 *
 *   Post Photo with First Comment Link:
 *     npx tsx scripts/post_instagram.ts --image="https://example.com/photo.jpg" --caption="My caption" --link="https://coloro.in"
 *
 *   Post Reel/Video with First Comment Link:
 *     npx tsx scripts/post_instagram.ts --video="https://example.com/video.mp4" --caption="My caption" --link="https://coloro.in"
 *
 *   Custom Comment Text:
 *     npx tsx scripts/post_instagram.ts --image="https://example.com/photo.jpg" --comment="🎨 Color online now: https://coloro.in"
 */

import dotenv from 'dotenv';
import {
  publishPhotoToInstagram,
  publishToInstagramGraphApi,
  buildInstagramFirstComment
} from './instagram_uploader.js';

dotenv.config();

function parseArgs() {
  const args = process.argv.slice(2);
  let image = '';
  let video = '';
  let caption = 'Coloring Fun for Kids! 🎨✨ Visit https://coloro.in for free printable sheets. #kidsactivities #coloring #preschool #kidsart';
  let link = 'https://coloro.in';
  let comment = '';
  let noComment = false;
  let status = false;

  for (const arg of args) {
    if (arg === '--status') {
      status = true;
    } else if (arg.startsWith('--image=')) {
      image = arg.slice(8).trim().replace(/^['"]|['"]$/g, '');
    } else if (arg.startsWith('--video=')) {
      video = arg.slice(8).trim().replace(/^['"]|['"]$/g, '');
    } else if (arg.startsWith('--caption=')) {
      caption = arg.slice(10).trim().replace(/^['"]|['"]$/g, '');
    } else if (arg.startsWith('--link=')) {
      link = arg.slice(7).trim().replace(/^['"]|['"]$/g, '');
    } else if (arg.startsWith('--comment=')) {
      comment = arg.slice(10).trim().replace(/^['"]|['"]$/g, '');
    } else if (arg === '--no-comment') {
      noComment = true;
    }
  }

  return { image, video, caption, link, comment, noComment, status };
}

async function checkStatus() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!token || !accountId) {
    console.error('❌ Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_ACCOUNT_ID in .env');
    return;
  }

  const base = token.startsWith('IG')
    ? 'https://graph.instagram.com/v19.0'
    : 'https://graph.facebook.com/v19.0';

  console.log(`🔍 Checking Instagram API connection via ${base}...`);
  try {
    const res = await fetch(`${base}/me?fields=id,username,account_type&access_token=${token}`);
    const data = await res.json() as any;
    if (data.error) {
      console.error('❌ Instagram API Error:', data.error.message);
    } else {
      console.log('✅ Instagram Connected Successfully:');
      console.log(`   🆔 Account ID: ${data.id}`);
      console.log(`   👤 Username:   @${data.username}`);
      console.log(`   🏷️  Type:       ${data.account_type || 'Business/Creator'}`);
    }
  } catch (err: any) {
    console.error('❌ Request failed:', err.message);
  }
}

async function main() {
  const opts = parseArgs();

  if (opts.status || (!opts.image && !opts.video)) {
    await checkStatus();
    if (!opts.image && !opts.video) {
      console.log('\n💡 To post an image with first comment:');
      console.log('   npx tsx scripts/post_instagram.ts --image="https://example.com/photo.jpg" --caption="Your caption" --link="https://coloro.in"');
      console.log('\n💡 To post a reel with first comment:');
      console.log('   npx tsx scripts/post_instagram.ts --video="https://example.com/video.mp4" --caption="Your caption" --link="https://coloro.in"');
    }
    return;
  }

  const firstComment = opts.noComment
    ? undefined
    : (opts.comment || buildInstagramFirstComment({ destinationUrl: opts.link }));

  if (opts.image) {
    const res = await publishPhotoToInstagram(opts.image, opts.caption, {
      firstComment,
      destinationUrl: opts.link,
      skipComment: opts.noComment,
    });

    if (res.success) {
      console.log(`\n🎉 Success! Image posted to Instagram with Media ID: ${res.mediaId}`);
      if (res.commentId) {
        console.log(`💬 First comment with link posted! Comment ID: ${res.commentId}`);
      }
    } else {
      console.error(`\n❌ Failed to post image: ${res.error}`);
    }
    return;
  }

  if (opts.video) {
    const res = await publishToInstagramGraphApi(opts.video, {
      title: 'Kids Coloring Reel',
      cleanCaption: opts.caption,
      fullCaptionWithHashtags: opts.caption,
      hashtags: ['#kidsart', '#coloring'],
      destinationUrl: opts.link,
      firstComment: opts.noComment ? undefined : firstComment,
      shareToFeed: true,
    });

    if (res.success) {
      console.log(`\n🎉 Success! Reel posted to Instagram with Media ID: ${res.mediaId}`);
      if (res.commentId) {
        console.log(`💬 First comment with link posted! Comment ID: ${res.commentId}`);
      }
    } else {
      console.error(`\n❌ Failed to post reel: ${res.error}`);
    }
  }
}

main().catch(console.error);
