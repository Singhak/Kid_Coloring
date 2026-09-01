/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Randomized creative prompt builder for infinite variety
const ADJECTIVES = ['cute', 'playful', 'majestic', 'happy', 'friendly', 'magical', 'adventurous', 'brave', 'futuristic', 'royal'];

const SUBJECTS: Record<string, string[]> = {
  alphabet: [
    'big letter A with a shiny sweet apple and smiling worm',
    'big letter B with a colorful fluttering butterfly and flowers',
    'big letter C with a cute fluffy kitten playing with ball of yarn',
    'big letter D with a friendly smiling baby dinosaur in jungle',
    'big letter E with a happy baby elephant spraying water',
    'big letter S with a sparkling smiling night sky star',
    'big letter Z with a playful striped baby zebra'
  ],
  numbers: [
    'big number 1 with a radiant smiling morning sun',
    'big number 2 with two yellow ducklings swimming in a pond',
    'big number 3 with three colorful floating party balloons',
    'big number 4 with four glowing stars in the clouds',
    'big number 5 with five red apples on an apple tree',
    'big number 10 with ten cute floating rainbow hearts'
  ],
  fruits: [
    'juicy watermelon slice with cute black seeds and green rind',
    'sweet red strawberry with fresh green leafy top and seeds',
    'bunch of ripe yellow bananas on a tropical palm branch',
    'crisp red apple with green leaf and cute morning dew',
    'bunch of plump purple grapes on vine with green leaf',
    'tropical pineapple with spiky crown wearing cute sunglasses',
    'sweet golden mango on tree branch with leaves',
    'pair of sweet red cherries connected by green stems'
  ],
  vegetables: [
    'crunchy orange carrot with fresh bushy green top',
    'round magic autumn pumpkin with curly vine stem',
    'plump ripe red tomato with star shaped green leaf cap',
    'happy tree-shaped green broccoli floret',
    'golden sweet corn on the cob with peeled green husks',
    'glossy purple eggplant with green stem',
    'open pea pod with four smiling round green peas'
  ],
  animal: [
    'baby panda with bamboo shoot', 'fluffy golden retriever puppy', 'curious kitten with yarn', 
    'safari lion cub with crown', 'dolphin jumping over ocean waves', 'koala on eucalyptus tree',
    'sea turtle swimming near coral reef', 'baby elephant spraying water', 'majestic bald eagle in flight',
    'chameleon on jungle branch', 'penguin sliding on iceberg', 'friendly t-rex dinosaur'
  ],
  object: [
    'cuddly plush teddy bear with a big bow tie',
    'flying diamond shaped kite with ribbon bows soaring in sky',
    'wrapped surprise birthday gift box with a giant decorative ribbon bow',
    'vintage toy steam locomotive train chugging puffy smoke clouds',
    'retro round alarm clock with bells and clock hands',
    'magic marching snare drum with wooden drumsticks and musical notes'
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
  space: [
    'astronaut exploring alien planet with flags', 'space station orbiting ringed planet Saturn',
    'friendly alien in flying saucer UFO', 'rover exploring rocky Martian craters',
    'cosmic rocket soaring through stars and comets'
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
