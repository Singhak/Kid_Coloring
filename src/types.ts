/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SvgPath {
  id: string;
  /** Color role (e.g. 'body', 'sky'); only set on AI pictures made for Color by Number. */
  slot?: string;
  d: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface HistoryState {
  paths?: SvgPath[];
  canvasDataUrl?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: any;
  color: string;
  emoji?: string;
}

export interface Template {
  id?: string;
  name: string;
  category: string;
  difficulty?: 'Easy' | 'Medium' | 'Detailed';
  viewBox: string;
  paths: {
    id: string;
    d: string;
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
  }[];
  imageUrl?: string;
  previewSvg?: string;
  isVip?: boolean;
  numberMode?: {
    /** path id -> slot name (what the region is, e.g. 'body', 'sky') */
    slots: Record<string, string>;
    schemes: ColorScheme[];
  };
}

/** A color assignment for a picture's slots. The numbered palette is derived from it. */
export interface ColorScheme {
  id: string;
  name: string;
  colors: Record<string, string>;
}

export interface NumberPaletteEntry {
  number: number;
  color: string;
  pathIds: string[];
}

export interface ViewportTransform {
  scale: number;
  x: number;
  y: number;
}
