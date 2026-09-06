/**
 * Custom Canvas Cursors (Kid-friendly Paintbrush & 3D Eraser)
 * Generates data URLs for high-precision, high-contrast 32x32 SVG cursors.
 */

/**
 * Returns a data-URI string for a paintbrush cursor with the tip dipped in the selected color.
 */
export function getBrushCursor(color: string): string {
  // If pattern, use a cheerful vibrant gold/amber paint color for the dipped tip
  const paintColor = !color || color.startsWith('pattern-') ? '#FF9F43' : color;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="brushShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="1.5" stdDeviation="1" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
    <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4D96FF" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="ferruleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E2E8F0" />
      <stop offset="50%" stop-color="#94A3B8" />
      <stop offset="100%" stop-color="#64748B" />
    </linearGradient>
    <linearGradient id="bristleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${paintColor}" />
      <stop offset="55%" stop-color="${paintColor}" />
      <stop offset="100%" stop-color="#4A3728" />
    </linearGradient>
  </defs>
  
  <g filter="url(#brushShadow)">
    <!-- Brush Handle -->
    <path d="M 12 16 L 25 27 C 27 29, 29 27, 27 25 L 16 12 Z" 
          fill="url(#handleGrad)" stroke="#1E293B" stroke-width="1.2" stroke-linejoin="round" />
    
    <!-- Handle highlight reflection -->
    <path d="M 13.5 15.5 L 25.5 25.5" stroke="#93C5FD" stroke-width="1" stroke-linecap="round" opacity="0.8" />

    <!-- Ferrule (Metal Collar) -->
    <path d="M 9 13 L 13 9 L 16 12 L 12 16 Z" 
          fill="url(#ferruleGrad)" stroke="#1E293B" stroke-width="1.2" stroke-linejoin="round" />
    <line x1="10.5" y1="14.5" x2="14.5" y2="10.5" stroke="#CBD5E1" stroke-width="0.8" />

    <!-- Bristles & Color Dipped Tip (Point at 2, 2) -->
    <path d="M 2 2 C 3 7, 6 11, 9 13 L 13 9 C 11 6, 7 3, 2 2 Z" 
          fill="url(#bristleGrad)" stroke="#1E293B" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" />

    <!-- Tip Highlight Accent -->
    <path d="M 2.5 2.5 L 4.5 4.5" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.85" />
  </g>
</svg>`;

  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 2 2, crosshair`;
}

/**
 * Returns a data-URI string for a 3D kid block eraser cursor.
 */
export function getEraserCursor(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="eraserShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="1.5" stdDeviation="1" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
    <linearGradient id="pinkTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFA8BA" />
      <stop offset="100%" stop-color="#FF6B8B" />
    </linearGradient>
    <linearGradient id="pinkLeft" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF6B8B" />
      <stop offset="100%" stop-color="#E84368" />
    </linearGradient>
    <linearGradient id="pinkRight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF85A1" />
      <stop offset="100%" stop-color="#FF5277" />
    </linearGradient>
    <linearGradient id="sleeveLeft" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4D96FF" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="sleeveRight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
    <linearGradient id="whiteLeft" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F1F5F9" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>
    <linearGradient id="whiteRight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
  </defs>

  <g filter="url(#eraserShadow)">
    <!-- Bottom White Rubber Base -->
    <path d="M 4 19 L 10 25 L 10 28 L 4 22 Z" fill="url(#whiteLeft)" stroke="#1E293B" stroke-width="1.2" stroke-linejoin="round" />
    <path d="M 10 25 L 22 21 L 22 24 L 10 28 Z" fill="url(#whiteRight)" stroke="#1E293B" stroke-width="1.2" stroke-linejoin="round" />

    <!-- Middle Protective Sleeve -->
    <path d="M 4 12 L 10 18 L 10 25 L 4 19 Z" fill="url(#sleeveLeft)" stroke="#1E293B" stroke-width="1.2" stroke-linejoin="round" />
    <path d="M 10 18 L 22 14 L 22 21 L 10 25 Z" fill="url(#sleeveRight)" stroke="#1E293B" stroke-width="1.2" stroke-linejoin="round" />
    <!-- Sleeve accent stripe -->
    <line x1="10" y1="21.5" x2="22" y2="17.5" stroke="#93C5FD" stroke-width="0.8" />

    <!-- Top Pink Rubber (Erasing corner at 3, 3) -->
    <!-- Left face -->
    <path d="M 3 3 L 10 9 L 10 18 L 4 12 L 3 3 Z" fill="url(#pinkLeft)" stroke="#1E293B" stroke-width="1.2" stroke-linejoin="round" />
    <!-- Right face -->
    <path d="M 10 9 L 22 5 L 22 14 L 10 18 Z" fill="url(#pinkRight)" stroke="#1E293B" stroke-width="1.2" stroke-linejoin="round" />
    <!-- Top face (Hotspot corner at 3, 3) -->
    <path d="M 3 3 L 15 1 L 22 5 L 10 9 Z" fill="url(#pinkTop)" stroke="#1E293B" stroke-width="1.2" stroke-linejoin="round" />

    <!-- Erasing Corner Highlight at (3, 3) -->
    <circle cx="3.5" cy="3.5" r="0.8" fill="#FFFFFF" opacity="0.9" />
  </g>
</svg>`;

  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 3 3, cell`;
}
