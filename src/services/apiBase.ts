import { Capacitor } from '@capacitor/core';

/**
 * Base URL of the PHP API. The native app is served from a local origin
 * (https://localhost), so relative `/api` URLs must point at the live site there.
 */
export const API_BASE = Capacitor.isNativePlatform() ? 'https://coloro.in/api' : '/api';
