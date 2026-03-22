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
  paths: SvgPath[];
}

export interface Category {
  id: string;
  label: string;
  icon: any;
  color: string;
}

export interface Template {
  name: string;
  category: string;
  viewBox: string;
  paths: {
    id: string;
    d: string;
    stroke: string;
    strokeWidth: number;
  }[];
}
