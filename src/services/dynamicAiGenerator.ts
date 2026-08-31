/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Randomized creative prompt builder for infinite variety
const ADJECTIVES = ['cute', 'playful', 'majestic', 'happy', 'friendly', 'magical', 'adventurous', 'brave', 'futuristic', 'royal'];

const SUBJECTS: Record<string, string[]> = {
  animal: [
    'baby panda with bamboo', 'fluffy golden retriever puppy', 'curious kitten with yarn', 
    'safari lion cub with crown', 'dolphin jumping over ocean waves', 'koala on eucalyptus tree',
    'sea turtle swimming near coral reef', 'baby elephant spraying water', 'majestic bald eagle in flight',
    'chameleon on jungle branch', 'penguin sliding on iceberg', 'friendly t-rex dinosaur'
  ],
  vehicles: [
    'high speed formula racecar', 'supersonic fighter jet in sky', 'monster truck leaping over hills',
    'steam locomotive train on bridge', 'rocket ship launching to stars', 'submarine exploring deep ocean',
    'vintage convertible car on beach', 'fire engine with ladder', 'helicopter over mountains'
  ],
  nature: [
    'enchanted fairytale castle on mountain', 'waterfall in lush forest with bridge',
    'rainbow over peaceful meadow with trees', 'cozy cottage by a lake with sun',
    'volcano with smoke and prehistoric palm trees', 'snowy alpine mountain peaks with pine trees'
  ],
  plant: [
    'monarch butterfly on blooming sunflower', 'magic mushroom village with flowers',
    'bouquet of spring roses and daisies', 'ancient oak tree with swing',
    'desert cactus garden with blooming flowers'
  ],
  space: [
    'astronaut exploring alien planet with flags', 'space station orbiting ringed planet Saturn',
    'friendly alien in flying saucer UFO', 'rover exploring rocky Martian craters',
    'cosmic rocket soaring through stars and comets'
  ],
  human: [
    'superhero soaring above city skyscrapers', 'young astronaut waving from spaceship',
    'master chef baking a giant birthday cake', 'brave knight with shield in front of castle',
    'skater kid doing trick on skateboard ramp'
  ]
};

const SETTINGS = [
  'with stars and clouds in background',
  'with flowers and butterflies around',
  'with sunburst and rolling hills',
  'with sparkles and magic trails',
  'in a vibrant detailed setting'
];

/**
 * Constructs a randomized creative prompt based on category or custom subject
 */
export function buildDynamicPrompt(subjectOrCategory: string): { prompt: string; displayName: string } {
  let categoryKey = subjectOrCategory.toLowerCase();
  
  if (categoryKey === 'random' || !SUBJECTS[categoryKey]) {
    const keys = Object.keys(SUBJECTS);
    categoryKey = keys[Math.floor(Math.random() * keys.length)];
  }

  const categoryList = SUBJECTS[categoryKey] || SUBJECTS.animal;
  const chosenSubject = categoryList[Math.floor(Math.random() * categoryList.length)];
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const setting = SETTINGS[Math.floor(Math.random() * SETTINGS.length)];

  const fullPrompt = `${adj} ${chosenSubject}, ${setting}`;
  const displayName = `${chosenSubject.charAt(0).toUpperCase() + chosenSubject.slice(1)}`;

  return { prompt: fullPrompt, displayName };
}

/**
 * Generates a unique, high-resolution coloring page dynamically using AI Image Diffusion
 */
export async function generateDynamicAiColoringImage(
  queryOrCategory: string,
  customPrompt?: string
): Promise<{ imageUrl: string; name: string; category: string }> {
  let subjectPrompt = '';
  let displayName = '';

  if (customPrompt && customPrompt.trim().length > 0) {
    subjectPrompt = customPrompt.trim();
    displayName = customPrompt.trim().slice(0, 30);
  } else {
    const built = buildDynamicPrompt(queryOrCategory);
    subjectPrompt = built.prompt;
    displayName = built.displayName;
  }

  // Refined coloring book line-art prompt engineered for clean flood-fillable contours
  const lineArtEnginePrompt = `clean black and white coloring book page for kids of ${subjectPrompt}, bold black line art outlines, pure white background, no grayscale, no shading, no color, high contrast, clean enclosed coloring areas, sharp vector coloring book style`;

  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(lineArtEnginePrompt);
  
  const targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1000&height=1000&seed=${seed}&nologo=true&enhance=true`;

  // Pre-load and verify image in browser before returning
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = setTimeout(() => {
      // If it takes longer than 15s, resolve anyway and let canvas attempt load
      resolve();
    }, 15000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve();
    };

    img.onerror = (err) => {
      clearTimeout(timeout);
      console.warn('AI image load warning:', err);
      resolve(); // fallback will be handled by canvas
    };

    img.src = targetUrl;
  });

  return {
    imageUrl: targetUrl,
    name: displayName,
    category: queryOrCategory === 'random' ? 'animal' : queryOrCategory
  };
}
