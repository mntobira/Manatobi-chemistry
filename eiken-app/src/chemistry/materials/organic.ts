import type { ChemChapterSpec } from '../types';
import { ORGANIC_UNITS_1 } from './units/organic1';
import { ORGANIC_UNITS_2 } from './units/organic2';
import { ORGANIC_UNITS_3 } from './units/organic3';
import { ORGANIC_UNITS_4 } from './units/organic4';
import { ORGANIC_UNITS_5 } from './units/organic5';

export const ORGANIC_CHAPTERS: readonly ChemChapterSpec[] = [
  ...ORGANIC_UNITS_1,
  ...ORGANIC_UNITS_2,
  ...ORGANIC_UNITS_3,
  ...ORGANIC_UNITS_4,
  ...ORGANIC_UNITS_5,
];
