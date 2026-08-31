/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SvgPath {
  id: string;
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
}

export interface ViewportTransform {
  scale: number;
  x: number;
  y: number;
}
