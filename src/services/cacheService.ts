/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SvgPath } from "../types";

interface CachedImage {
    paths: SvgPath[];
    viewBox: string;
    subject: string;
    timestamp: number;
}

const CACHE_KEY = 'kidcolor_ai_cache';
const MAX_CACHE_PER_CATEGORY = 5;

export const saveToCache = (category: string, subject: string, paths: SvgPath[], viewBox: string) => {
    try {
        const rawCache = localStorage.getItem(CACHE_KEY);
        const cache: Record<string, CachedImage[]> = rawCache ? JSON.parse(rawCache) : {};

        if (!cache[category]) {
            cache[category] = [];
        }

        // Add new image to the front
        cache[category].unshift({
            paths,
            viewBox,
            subject,
            timestamp: Date.now()
        });

        // Limit cache size per category
        if (cache[category].length > MAX_CACHE_PER_CATEGORY) {
            cache[category] = cache[category].slice(0, MAX_CACHE_PER_CATEGORY);
        }

        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn("Failed to save to local cache:", e);
    }
};

export const getFromCache = (category: string): CachedImage | null => {
    try {
        const rawCache = localStorage.getItem(CACHE_KEY);
        if (!rawCache) return null;

        const cache: Record<string, CachedImage[]> = JSON.parse(rawCache);
        const categoryCache = cache[category];

        if (!categoryCache || categoryCache.length === 0) return null;

        // Pick a random one from the cache for variety
        const randomIndex = Math.floor(Math.random() * categoryCache.length);
        return categoryCache[randomIndex];
    } catch (e) {
        console.warn("Failed to read from local cache:", e);
        return null;
    }
};
