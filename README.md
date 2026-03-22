# Kid Coloring App

## Overview
Kid Coloring is a web-based coloring application designed for children. Built with modern React, TypeScript, Vite, and Firebase, it provides an engaging platform for kids to color images with features like color palettes, image generation (possibly AI-powered), caching for performance, and mobile support via Capacitor. Backend utilities include PHP scripts for processing image paths and queues.

## Key Features
- **Interactive Coloring**: Canvas-based coloring with color sidebar (ColorSidebar.tsx) and toolbar tools (Toolbar.tsx).
- **Image Management**: Dynamic image loading/generation via `imageGenerator.ts` and caching (`cacheService.ts`).
- **Firebase Integration**: Real-time data sync, authentication, and storage (firebase.ts, firestore.rules).
- **Mobile-Ready**: Capacitor setup for Android/iOS deployment (capacitor.config.ts, android/).
- **AI Path Generation**: PHP scripts (`generate-paths.php`, `generate-paths-gemini.php`) for generating coloring paths, possibly using Google Gemini.
- **Performance Optimized**: Vite for fast builds, service workers/cache for offline use.
- **Responsive UI**: Custom header (Header.tsx), upgrade modal (UpgradeModal.tsx), and global styles (index.css).

## Tech Stack
- **Frontend**: React 18+, TypeScript, Vite, Tailwind CSS (inferred from structure).
- **Backend/State**: Firebase Firestore, Capacitor.
- **Utilities**: PHP for image processing/queue (process-queue.php).
- **Build Tools**: Vite, npm/yarn.

## Project Structure
```
Kid_Coloring/
├── public/              # Static assets (favicon.svg, logo.svg)
├── src/
│   ├── components/      # UI Components (Toolbar, ColorSidebar, Header, UpgradeModal)
│   ├── services/        # App Logic (cacheService, imageGenerator)
│   ├── constants.ts     # App constants
│   ├── types.ts         # TypeScript definitions
│   ├── firebase.ts      # Firebase config
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── android/             # Capacitor Android build
├── Backup/              # Backup files (e.g., index.html)
├── capacitor.config.ts # Capacitor config
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
├── generate-paths*.php  # Path generation scripts
├── process-queue.php    # Queue processor
├── firestore.rules      # Firebase rules
├── firebase-*.json      # Firebase configs
└── ...                  # Git, metadata, etc.
```

## Prerequisites
- Node.js (v18+)
- npm/yarn
- PHP (for path generation)
- Firebase project (copy config to firebase.ts)
- Capacitor CLI (for mobile builds)

## Installation & Setup
1. **Clone/Navigate**:
   ```
   cd e:/01-Bussiness/Kid_Coloring
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Firebase Setup**:
   - Create/update `firebase.ts` with your Firebase config.
   - Deploy rules: `firebase deploy --only firestore:rules`

4. **Run Development Server**:
   ```
   npm run dev
   ```
   Open http://localhost:5173 (Vite default).

5. **Build for Production**:
   ```
   npm run build
   ```

## Mobile Deployment (Capacitor)
1. Install Capacitor:
   ```
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```
2. Sync & Build:
   ```
   npm run build
   npx cap sync android
   npx cap open android
   ```

## Usage
- Open the app in browser/mobile.
- Select images (generated via PHP/AI paths).
- Use toolbar for tools, sidebar for colors.
- Colors are saved/cached locally.

## Development Scripts
From `package.json` (inferred standard Vite):
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview build
- `npm run lint` - Lint code

## PHP Utilities
Run locally or on server:
- `php generate-paths.php` - Generate coloring paths.
- `php generate-paths-gemini.php` - AI-enhanced path generation.
- `php process-queue.php` - Process image queue.

## Firebase Configs
- `firestore.rules`: Security rules for data access.
- `firebase-*.json`: Project blueprints/applets.

## Contributing
1. Fork & PR.
2. Follow TypeScript/React best practices.
3. Update README for new features.

## License
MIT (assumed; add if needed).

## Support
Report issues here. For custom images, run PHP generators.

---
*Built with ❤️ for kids' creativity!*

