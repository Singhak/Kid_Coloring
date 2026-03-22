/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { SvgPath } from "../types";
import { SUBJECTS_BY_CATEGORY } from "../constants";

const ALL_SUBJECTS = Object.values(SUBJECTS_BY_CATEGORY).flat();

export const generateProceduralPaths = (category: string): { paths: SvgPath[], viewBox: string } => {
  const paths: SvgPath[] = [];
  const centerX = 250;
  const centerY = 250;
  const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  let targetCategory = category;
  if (category === 'random') {
    const categories = ['animal', 'nature', 'plant', 'human', 'space', 'vehicles'];
    targetCategory = categories[Math.floor(Math.random() * categories.length)];
  }

  const variant = rnd(1, 3);

  if (targetCategory === 'animal') {
    if (variant === 1) { // Bear/Cat Face
      const r = rnd(80, 110);
      paths.push({ id: 'face', d: `M ${centerX - r},${centerY - 50} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      const earR = rnd(25, 40);
      paths.push({ id: 'ear-l', d: `M ${centerX - r + 10},${centerY - 120} m -${earR},0 a ${earR},${earR} 0 1,0 ${earR * 2},0 a ${earR},${earR} 0 1,0 -${earR * 2},0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'ear-r', d: `M ${centerX + r - 10},${centerY - 120} m -${earR},0 a ${earR},${earR} 0 1,0 ${earR * 2},0 a ${earR},${earR} 0 1,0 -${earR * 2},0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'eye-l', d: `M ${centerX - 40},${centerY - 70} m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'eye-r', d: `M ${centerX + 40},${centerY - 70} m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'nose', d: `M ${centerX},${centerY - 30} m -15,0 a 15,10 0 1,0 30,0 a 15,10 0 1,0 -30,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'mouth', d: `M ${centerX - 30},${centerY} q 30,${rnd(20, 40)} 60,0`, fill: 'none', stroke: '#000', strokeWidth: 3 });
    } else if (variant === 2) { // Bird
      paths.push({ id: 'body', d: `M ${centerX},${centerY} m -80,0 a 80,60 0 1,0 160,0 a 80,60 0 1,0 -160,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'head', d: `M ${centerX + 70},${centerY - 40} m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'beak', d: `M ${centerX + 100},${centerY - 40} l 30,10 l -30,10 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'wing', d: `M ${centerX - 40},${centerY - 10} q -40,-40 -80,0 q 40,40 80,0`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'eye', d: `M ${centerX + 85},${centerY - 50} m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 });
    } else { // Fish
      paths.push({ id: 'body', d: `M ${centerX - 100},${centerY} q 100,-80 200,0 q -100,80 -200,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'tail', d: `M ${centerX - 100},${centerY} l -50,-40 v 80 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'eye', d: `M ${centerX + 60},${centerY - 10} m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'fin', d: `M ${centerX},${centerY - 30} l 20,-30 l 20,30 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
    }
  } else if (targetCategory === 'nature') {
    if (variant === 1) { // House
      paths.push({ id: 'house-body', d: `M ${centerX - 80},${centerY + 100} h 160 v -120 h -160 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'roof', d: `M ${centerX - 100},${centerY - 20} L ${centerX},${centerY - 100} L ${centerX + 100},${centerY - 20} Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'door', d: `M ${centerX - 20},${centerY + 100} v -50 h 40 v 50 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'sun', d: `M ${rnd(350, 450)},${rnd(50, 100)} m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
    } else if (variant === 2) { // Mountains
      paths.push({ id: 'mtn-1', d: `M 50,400 L 200,150 L 350,400 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'mtn-2', d: `M 250,400 L 400,200 L 500,400 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'cloud', d: `M 100,100 q 20,-30 40,0 q 40,-10 40,20 q 0,30 -40,20 q -40,10 -40,-20 q -20,-10 0,-20 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
    } else { // Tree Scene
      paths.push({ id: 'trunk', d: `M ${centerX - 20},${centerY + 150} h 40 v -100 h -40 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'leaves', d: `M ${centerX},${centerY - 50} m -100,0 a 100,100 0 1,0 200,0 a 100,100 0 1,0 -200,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'apple-1', d: `M ${centerX - 40},${centerY - 20} m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 });
      paths.push({ id: 'apple-2', d: `M ${centerX + 40},${centerY - 60} m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 });
    }
  } else if (targetCategory === 'plant') {
    if (variant === 1) { // Flower
      paths.push({ id: 'stem', d: `M ${centerX},${centerY + 200} v -150`, fill: 'none', stroke: '#000', strokeWidth: 8 });
      paths.push({ id: 'center', d: `M ${centerX},${centerY} m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      const petals = rnd(5, 8);
      for (let i = 0; i < petals; i++) {
        const angle = (i * (360 / petals)) * (Math.PI / 180);
        const px = centerX + Math.cos(angle) * 70;
        const py = centerY + Math.sin(angle) * 70;
        paths.push({ id: `petal-${i}`, d: `M ${px},${py} m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      }
    } else if (variant === 2) { // Cactus
      paths.push({ id: 'pot', d: `M ${centerX - 50},${centerY + 150} l 10,50 h 80 l 10,-50 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'main', d: `M ${centerX - 40},${centerY + 150} v -150 q 40,-50 80,0 v 150 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'arm-l', d: `M ${centerX - 40},${centerY + 50} h -30 v -40 q 15,-20 30,0`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'arm-r', d: `M ${centerX + 40},${centerY} h 30 v -40 q -15,-20 -30,0`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
    } else { // Mushroom
      paths.push({ id: 'stem', d: `M ${centerX - 40},${centerY + 150} q 40,20 80,0 v -80 h -80 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'cap', d: `M ${centerX - 120},${centerY + 70} q 120,-150 240,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'dot-1', d: `M ${centerX - 40},${centerY + 10} m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 });
      paths.push({ id: 'dot-2', d: `M ${centerX + 50},${centerY + 30} m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 });
    }
  } else if (targetCategory === 'human') {
    if (variant === 1) { // Stick Person
      paths.push({ id: 'head', d: `M ${centerX},${centerY - 120} m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'body', d: `M ${centerX},${centerY - 80} v 150`, fill: 'none', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'arms', d: `M ${centerX - 80},${centerY - 20} l 160,0`, fill: 'none', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'leg-l', d: `M ${centerX},${centerY + 70} l -50,80`, fill: 'none', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'leg-r', d: `M ${centerX},${centerY + 70} l 50,80`, fill: 'none', stroke: '#000', strokeWidth: 5 });
    } else if (variant === 2) { // Robot
      paths.push({ id: 'head', d: `M ${centerX - 40},${centerY - 150} h 80 v 60 h -80 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'body', d: `M ${centerX - 70},${centerY - 80} h 140 v 160 h -140 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'eye-l', d: `M ${centerX - 20},${centerY - 120} h 10 v 10 h -10 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 });
      paths.push({ id: 'eye-r', d: `M ${centerX + 10},${centerY - 120} h 10 v 10 h -10 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 });
      paths.push({ id: 'antenna', d: `M ${centerX},${centerY - 150} v -30`, fill: 'none', stroke: '#000', strokeWidth: 3 });
    } else { // Face
      paths.push({ id: 'face', d: `M ${centerX - 100},${centerY - 50} q 0,150 100,150 q 100,0 100 -150 q 0,-100 -100,-100 q -100,0 -100,100`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'eye-l', d: `M ${centerX - 40},${centerY - 50} m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'eye-r', d: `M ${centerX + 40},${centerY - 50} m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'smile', d: `M ${centerX - 50},${centerY + 30} q 50,40 100,0`, fill: 'none', stroke: '#000', strokeWidth: 4 });
    }
  } else if (targetCategory === 'space') {
    if (variant === 1) { // Rocket
      paths.push({ id: 'body', d: `M ${centerX - 40},${centerY + 100} v -150 q 40,-80 80,0 v 150 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'window', d: `M ${centerX},${centerY - 20} m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 3 });
      paths.push({ id: 'fin-l', d: `M ${centerX - 40},${centerY + 40} l -40,60 h 40 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'fin-r', d: `M ${centerX + 40},${centerY + 40} l 40,60 h -40 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
    } else if (variant === 2) { // Planet
      paths.push({ id: 'planet', d: `M ${centerX},${centerY} m -80,0 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'ring', d: `M ${centerX - 140},${centerY} q 140,60 280,0 q -140,-60 -280,0`, fill: 'none', stroke: '#000', strokeWidth: 5 });
    } else { // UFO
      paths.push({ id: 'dome', d: `M ${centerX - 60},${centerY} q 60,-80 120,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'base', d: `M ${centerX - 150},${centerY} q 150,60 300,0 q -150,-60 -300,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'light-1', d: `M ${centerX - 80},${centerY + 15} m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 });
      paths.push({ id: 'light-2', d: `M ${centerX},${centerY + 25} m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 });
      paths.push({ id: 'light-3', d: `M ${centerX + 80},${centerY + 15} m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 });
    }
  } else if (targetCategory === 'vehicles') {
    if (variant === 1) { // Car
      paths.push({ id: 'body', d: `M ${centerX - 150},${centerY + 50} h 300 v -60 h -60 l -40,-60 h -100 l -40,60 h -60 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'wheel-l', d: `M ${centerX - 90},${centerY + 50} m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'wheel-r', d: `M ${centerX + 90},${centerY + 50} m -30,0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
    } else if (variant === 2) { // Truck
      paths.push({ id: 'cab', d: `M ${centerX - 150},${centerY + 50} v -100 h 80 v 100 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'trailer', d: `M ${centerX - 70},${centerY + 50} v -140 h 220 v 140 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'wheel-1', d: `M ${centerX - 110},${centerY + 50} m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'wheel-2', d: `M ${centerX + 20},${centerY + 50} m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'wheel-3', d: `M ${centerX + 100},${centerY + 50} m -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
    } else { // Boat
      paths.push({ id: 'hull', d: `M ${centerX - 180},${centerY + 50} l 40,80 h 280 l 40,-80 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
      paths.push({ id: 'mast', d: `M ${centerX},${centerY + 50} v -150`, fill: 'none', stroke: '#000', strokeWidth: 6 });
      paths.push({ id: 'sail', d: `M ${centerX},${centerY - 100} l 100,75 l -100,75 Z`, fill: '#FFFFFF', stroke: '#000', strokeWidth: 5 });
    }
  }

  return { paths, viewBox: "0 0 500 500" };
};

export const generateAiPaths = async (subject: string): Promise<{ paths: SvgPath[], viewBox: string }> => {
  const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAZqyz7HPmEFPGD-mf5_A6iGHJCgwaA3Yo"
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