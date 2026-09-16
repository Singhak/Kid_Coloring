/**
 * Silent Background Auto-Publisher for Pinterest
 * Automatically composites and uploads user-colored drawings to Coloro's community feed
 * so Pinterest's RSS Auto-Publisher posts them automatically with ZERO user interaction.
 */

interface AutoPublishOptions {
  paintCanvas: HTMLCanvasElement | null;
  lineArtCanvas: HTMLCanvasElement | null;
  category: string;
  templateName?: string;
  isAi?: boolean;
  fillCount?: number;
}

// Track already published artworks in this session to prevent duplicate spam
const publishedHashes = new Set<string>();

/**
 * Silently exports and publishes user-colored artwork in the background.
 * Triggered automatically when a drawing is finished (e.g. fillCount >= 5, on template switch, or download).
 */
export async function autoPublishArtworkSilently(options: AutoPublishOptions): Promise<void> {
  const { paintCanvas, lineArtCanvas, category, templateName, isAi, fillCount } = options;

  // Safety check: Only publish if canvas exists and user actually colored at least 1 region
  if (!paintCanvas || !lineArtCanvas || (fillCount !== undefined && fillCount < 1)) {
    return;
  }

  try {
    // Generate 1000x1500 High-Contrast Pinterest Pin Card in background
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Background Gradient (Soft warm theme)
    const bgGrad = ctx.createLinearGradient(0, 0, 1000, 1500);
    bgGrad.addColorStop(0, '#FFFDF9');
    bgGrad.addColorStop(0.5, '#FFF7ED');
    bgGrad.addColorStop(1, '#FFEDD5');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 1500);

    // 2. Top Header Brand & Title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 38px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ COLORO.IN COMMUNITY ART', 500, 90);

    const name = templateName || 'Little Artist Masterpiece';
    ctx.fillStyle = '#EA580C';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(name, 500, 140);

    ctx.fillStyle = '#64748B';
    ctx.font = '18px sans-serif';
    ctx.fillText('Colored Live Online • Free Kids Printable Pages', 500, 175);

    // 3. Central Artwork Card with Shadow & Border
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 14;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(60, 220, 880, 880, 28);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 4. Draw User's Painted Fill Layer
    ctx.drawImage(paintCanvas, 80, 240, 840, 840);

    // 5. Composite Crisp Line Art Layer (Multiply mode for sharp outlines)
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(lineArtCanvas, 80, 240, 840, 840);
    ctx.restore();

    // 6. Cute Ribbon Badge on Card
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.roundRect(80, 240, 280, 50, [20, 0, 20, 0]);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🎨 Young Artist Creation', 105, 272);

    // 7. Bottom High-Converting CTA Banner
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(60, 1140, 880, 290, 32);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FFD93D';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ INSTANT FREE ACCESS • NO LOGIN REQUIRED', 500, 1190);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Download & Color Online Now!', 500, 1245);

    const catSlug = (category || 'animal').toLowerCase();
    const destUrl = `coloro.in/?category=${catSlug}`;

    // Red CTA Button
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.roundRect(140, 1280, 720, 68, 34);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`👉 Color More Free Pages: ${destUrl}`, 500, 1324);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Explore 100+ Preschool & Toddler Printables at https://${destUrl}`, 500, 1390);

    // Export Base64 PNG
    const pngData = canvas.toDataURL('image/png', 0.9);

    // Quick duplicate check (hash first 150 chars of data)
    const hash = `${category}_${name}_${pngData.substring(50, 150)}`;
    if (publishedHashes.has(hash)) {
      return;
    }
    publishedHashes.add(hash);

    const visitorId = typeof localStorage !== 'undefined' ? (localStorage.getItem('coloro_vid') || 'guest') : 'guest';

    const payload = JSON.stringify({
      imageData: pngData,
      category: catSlug,
      templateName: name,
      isAi: Boolean(isAi),
      visitorId
    });

    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const primaryUrl = '/api/publish-community-art.php';
    const fallbackUrl = 'https://coloro.in/api/publish-community-art.php';

    // Silent background send to backend
    fetch(isLocalhost ? fallbackUrl : primaryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    }).catch(() => {
      if (!isLocalhost) {
        fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    });
  } catch (e) {
    console.debug('Auto publish error:', e);
  }
}
