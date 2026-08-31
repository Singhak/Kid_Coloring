/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { SvgPath } from "../types";
import { SUBJECTS_BY_CATEGORY } from "../constants";
import { generateProceduralRealisticScene } from "./proceduralRealisticGenerator";

const ALL_SUBJECTS = Object.values(SUBJECTS_BY_CATEGORY).flat();

export const generateProceduralPaths = (category: string): { paths: SvgPath[], viewBox: string } => {
  return generateProceduralRealisticScene(category);
};

export const generateAiPaths = async (subject: string): Promise<{ paths: SvgPath[], viewBox: string }> => {
  const API_KEY = process.env.GEMINI_API_KEY || ""
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a simple, bold line art SVG of a ${subject} for a kids' coloring book. 
    The SVG should consist of multiple closed paths so they can be filled with color.
    The drawing should be clear and easy for a child to color.
    Return ONLY a JSON object with the following structure:
    {
      "viewBox": "0 0 500 500",
      "paths": [
        { "id": "part-name", "d": "SVG_PATH_DATA" }
      ]
    }
    Ensure all paths are closed (end with Z). Do not include any fill colors in the paths.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          viewBox: { type: Type.STRING },
          paths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                d: { type: Type.STRING },
                stroke: { type: Type.STRING },
                strokeWidth: { type: Type.NUMBER }
              },
              required: ["id", "d"]
            }
          }
        },
        required: ["viewBox", "paths"]
      }
    }
  });

  const data = JSON.parse(response.text);
  const newPaths: SvgPath[] = data.paths.map((p: any) => ({
    ...p,
    fill: '#FFFFFF',
    stroke: p.stroke || '#000000',
    strokeWidth: p.strokeWidth || 3
  }));

  return { paths: newPaths, viewBox: data.viewBox || "0 0 500 500" };
};

export const getImageUsingAPI = async (subject: string, category: string): Promise<{ paths: SvgPath[], viewBox: string }> => {
  if (subject === 'random') {
    subject = ALL_SUBJECTS[Math.floor(Math.random() * ALL_SUBJECTS.length)];
  }

  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 1500): Promise<Response> => {
    // Start the fetch request WITHOUT an AbortController so it continues in the background
    const fetchPromise = fetch(url, options);
    
    // Prevent unhandled promise rejections if the fetch fails silently in the background later
    fetchPromise.catch(() => {}); 

    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), timeoutMs);
    });

    // Race the fetch against the timer. If the timer wins, we reject and fallback instantly.
    return Promise.race([fetchPromise, timeoutPromise]);
  };

  // Fallback to OpenRouter via Backend Proxy
  try {
    let response: Response | undefined;
    try {
      response = await fetchWithTimeout("https://kidcolor.storywalla.com/api/generate-paths.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category })
      }, 15000); // 5 seconds timeout for first API
    } catch (e) {
      console.warn("First API attempt failed or timed out, trying fallback...");
    }

    if (!response || !response.ok) {
      // Try with Google GenAI API directly if proxy fails (e.g., due to CORS or network issues)
      response = await fetchWithTimeout("https://kidcolor.storywalla.com/api/generate-paths-gemini.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category })
      }, 10000); // 5 seconds timeout for fallback API
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Backend generation failed");
      }
    }

    const data = await response.json();
    const newPaths: SvgPath[] = data.paths.map((p: any) => ({
      ...p,
      fill: '#FFFFFF',
      stroke: p.stroke || '#000000',
      strokeWidth: p.strokeWidth || 3
    }));

    return { paths: newPaths, viewBox: data.viewBox || "0 0 500 500" };
  } catch (error) {
    console.error("All AI generation methods failed:", error);
    throw error;
  }
}