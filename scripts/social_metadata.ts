/**
 * Social Media Metadata Generator for Coloro.in
 * Generates tailored, high-converting metadata for YouTube Shorts and Instagram Reels.
 */

import { Template } from '../src/types.js';
import { CATEGORY_MAP, getCategoryMeta } from '../src/services/pinterestPinGenerator.js';

export interface YouTubeShortsMetadata {
  title: string;
  description: string;
  tags: string[];
  categoryId: string; // '27' for Education, '24' for Entertainment
  privacyStatus: 'public' | 'unlisted' | 'private';
  selfDeclaredMadeForKids: boolean;
  destinationUrl: string;
}

export interface InstagramReelsMetadata {
  title?: string;
  cleanCaption?: string;
  caption?: string;
  hashtags?: string[];
  fullCaptionWithHashtags: string;
  destinationUrl: string;
  shareToFeed?: boolean;
  firstComment?: string;
}

export interface SocialPublishMetadata {
  templateName: string;
  category: string;
  youtube: YouTubeShortsMetadata;
  instagram: InstagramReelsMetadata;
}

/**
 * Builds YouTube SEO metadata for either Shorts (9:16) or Standard Long-form (16:9)
 */
export function generateYouTubeShortsMetadata(
  template: Template,
  options: {
    privacyStatus?: 'public' | 'unlisted' | 'private';
    baseUrl?: string;
    aspectRatio?: '9:16' | '16:9';
  } = {}
): YouTubeShortsMetadata {
  const baseUrl = options.baseUrl || 'https://coloro.in';
  const catMeta = getCategoryMeta(template.category);
  const destinationUrl = `${baseUrl}/app?category=${catMeta.querySlug}`;
  const privacyStatus = options.privacyStatus || 'public';
  const isWidescreen = options.aspectRatio === '16:9';

  let title = '';
  let description = '';
  let tags: string[] = [];

  if (isWidescreen) {
    // Standard YouTube 16:9 Long-Form Title (<= 100 chars, NO #Shorts)
    title = `How to Color ${template.name} 🎨 Easy Kids Step-by-Step | Coloro.in`;
    if (title.length > 100) {
      title = `Coloring ${template.name} Step-by-Step 🎨 Kids Art | Coloro.in`;
    }
    if (title.length > 100) {
      title = `${template.name} Coloring Page 🎨 Coloro.in`.slice(0, 100);
    }

    description = `Watch ${template.name} come to life in vibrant color! 🎨✨ Follow along with this relaxing step-by-step coloring session on Coloro.

👉 Color this sheet online or print the free PDF:
${destinationUrl}

Coloro (https://coloro.in) is a 100% free interactive kids coloring website where children and parents can color hundreds of templates online or download high-resolution printable coloring pages!

🖍️ Coloro Key Features:
✨ One-tap flood fill and custom digital pens
📄 Instant printable PDF downloads
🦁 Over 100+ child-friendly templates across Animals, Space, Vehicles, Nature & more
🎉 100% Free with no login or subscription required!

⏱ Timestamps & Chapters:
0:00 - Palette selection & studio setup
0:15 - Detailed coloring of ${template.name}
0:50 - Final details & celebratory finish

#Coloring #KidsArt #ColoringPages #ArtForKids #Coloro #DrawingForKids #ColoringBook #RelaxingArt #HowToColor #KidsActivities #PrintableColoringPages
`.trim();

    tags = [
      'coloring',
      'how to color',
      'kids coloring',
      'art for kids',
      'coloring pages',
      'coloring book',
      'step by step coloring',
      'printable coloring sheets',
      'drawing for kids',
      'coloro',
      'relaxing coloring',
      'kids activities',
      template.name.toLowerCase(),
      catMeta.label.toLowerCase()
    ];
  } else {
    // YouTube Shorts 9:16 Title (must include #Shorts)
    title = `Satisfying Coloring Magic! 🎨 ${template.name} ✨ #Shorts #Coloring`;
    if (title.length > 100) {
      title = `${template.name} Speed Coloring 🎨✨ #Shorts #Coloring`;
    }
    if (title.length > 100) {
      title = `${template.name} Coloring #Shorts`.slice(0, 100);
    }

    description = `Watch ${template.name} come to life with colorful magic! 🎨✨

👉 Color this page online or download the printable PDF free:
${destinationUrl}

Coloro (https://coloro.in) is a 100% free interactive coloring web app with hundreds of printable coloring pages for kids, toddlers, and art lovers of all ages!

🖍️ Coloro Features:
✨ Instant one-tap fill & custom brush coloring
📄 High-resolution printable PDF downloads
🦁 Fun categories: Animals, Alphabet, Numbers, Nature, Space, Vehicles & more
🎉 100% Free, no sign-up required!

#Shorts #Coloring #Satisfying #KidsArt #ColoringPages #ArtForKids #Coloro #ColoringBook #SpeedPaint #SatisfyingColoring #ColoringTime #Relaxing #KidsActivities
`.trim();

    tags = [
      'shorts',
      'youtube shorts',
      'coloring',
      'satisfying coloring',
      'coloro',
      'kids coloring',
      'art for kids',
      'coloring pages',
      'printable coloring sheets',
      'speed coloring',
      'satisfying video',
      'drawing for kids',
      'coloring book',
      template.name.toLowerCase(),
      catMeta.label.toLowerCase()
    ];
  }

  return {
    title,
    description,
    tags,
    categoryId: '27', // Education
    privacyStatus,
    selfDeclaredMadeForKids: true,
    destinationUrl
  };
}

/**
 * Builds Instagram Reels tailored caption and viral hashtags
 */
export function generateInstagramReelsMetadata(
  template: Template,
  options: { baseUrl?: string } = {}
): InstagramReelsMetadata {
  const baseUrl = options.baseUrl || 'https://coloro.in';
  const catMeta = getCategoryMeta(template.category);
  const destinationUrl = `${baseUrl}/app?category=${catMeta.querySlug}`;

  const caption = `Satisfying Coloring Magic with ${template.name}! 🎨✨

Can you guess what color comes next? Drop your favorite color in the comments! 👇💬

🖍️ Color this sheet online or print it for FREE on Coloro!
👉 Link in bio to color or print hundreds of free sheets: www.coloro.in

Save this Reel for your next fun kids' craft session! 💖`.trim();

  const hashtags = [
    '#reels',
    '#reelsinstagram',
    '#reelsvideo',
    '#coloring',
    '#coloro',
    '#satisfying',
    '#satisfyingvideo',
    '#coloringbook',
    '#kidsactivities',
    '#toddleractivities',
    '#artforkids',
    '#parentinghacks',
    '#homeschooling',
    '#drawing',
    '#coloringpages',
    '#speedpaint',
    '#arttherapy',
    '#diykids',
    '#freebies'
  ];

  const fullCaptionWithHashtags = `${caption}\n\n.\n.\n.\n${hashtags.join(' ')}`;
  const firstComment = `🎨 Color ${template.name} online or download free printable sheet:\n👉 ${destinationUrl}\n(Link also in bio! ✨)`;

  return {
    caption,
    hashtags,
    fullCaptionWithHashtags,
    destinationUrl,
    firstComment,
    shareToFeed: true
  };
}

/**
 * Generates unified metadata bundle for a template
 */
export function generateSocialPublishMetadata(
  template: Template,
  options: {
    privacyStatus?: 'public' | 'unlisted' | 'private';
    baseUrl?: string;
    aspectRatio?: '9:16' | '16:9';
  } = {}
): SocialPublishMetadata {
  return {
    templateName: template.name,
    category: template.category,
    youtube: generateYouTubeShortsMetadata(template, options),
    instagram: generateInstagramReelsMetadata(template, options)
  };
}

