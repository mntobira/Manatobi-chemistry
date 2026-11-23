import type { ChemChapterSpec } from '../types';
import { ORGANIC_UNITS_1 } from './units/organic1';
import { ORGANIC_UNITS_2 } from './units/organic2';

export const ORGANIC_CHAPTERS: readonly ChemChapterSpec[] = [
  ...ORGANIC_UNITS_1,
  ...ORGANIC_UNITS_2,
];
