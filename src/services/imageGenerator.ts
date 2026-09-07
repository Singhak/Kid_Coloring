/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SvgPath } from "../types";
import { SUBJECTS_BY_CATEGORY } from "../constants";
import { generateProceduralRealisticScene } from "./proceduralRealisticGenerator";

const ALL_SUBJECTS = Object.values(SUBJECTS_BY_CATEGORY).flat();

export const generateProceduralPaths = (category: string): { paths: SvgPath[], viewBox: string } => {
  return generateProceduralRealisticScene(category);
};

export const getImageUsingAPI = async (subject: string, category: string): Promise<{ paths: SvgPath[], viewBox: string }> => {
  if (subject === 'random') {
    subject = ALL_SUBJECTS[Math.floor(Math.random() * ALL_SUBJECTS.length)];
  }

  const isCurrentDomain = typeof window !== 'undefined' && (window.location.hostname.includes('coloro.in') || window.location.hostname.includes('storywalla.com'));
  const geminiEndpoint = isCurrentDomain
    ? '/api/generate-paths-gemini.php'
    : 'https://coloro.in/api/generate-paths-gemini.php';
  const openRouterEndpoint = isCurrentDomain
    ? '/api/generate-paths.php'
    : 'https://coloro.in/api/generate-paths.php';

  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 35000): Promise<Response> => {
    const fetchPromise = fetch(url, options);
    fetchPromise.catch(() => {}); 

    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
    });

    return Promise.race([fetchPromise, timeoutPromise]);
  };

  // 1. Try Gemini PHP endpoint first (live tested and confirmed functional on server)
  let response: Response | undefined;
  try {
    response = await fetchWithTimeout(geminiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, category })
    }, 35000); // 35 seconds for live Gemini generation or fast cached return
  } catch (e) {
    console.warn("Primary Gemini PHP endpoint timed out or failed, trying secondary endpoint...", e);
  }

  // 2. Fallback to OpenRouter PHP endpoint if Gemini failed
  if (!response || !response.ok) {
    try {
      response = await fetchWithTimeout(openRouterEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category })
      }, 25000);
    } catch (e) {
      console.warn("Secondary PHP endpoint failed:", e);
    }
  }

  if (!response || !response.ok) {
    throw new Error("Backend PHP AI path generation failed");
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.paths) || data.paths.length === 0) {
    throw new Error("Backend returned empty or invalid path structure");
  }

  const newPaths: SvgPath[] = data.paths.map((p: any, idx: number) => ({
    id: p.id || `part-${idx + 1}`,
    d: p.d,
    fill: '#FFFFFF',
    stroke: p.stroke || '#000000',
    strokeWidth: p.strokeWidth || 3
  }));

  return { paths: newPaths, viewBox: data.viewBox || "0 0 500 500" };
};