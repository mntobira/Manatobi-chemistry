import type { ChemChapterSpec } from '../types';
import { POLYMER_UNITS_1 } from './units/polymer1';
import { POLYMER_UNITS_2 } from './units/polymer2';

export const POLYMER_CHAPTERS: readonly ChemChapterSpec[] = [
  ...POLYMER_UNITS_1,
  ...POLYMER_UNITS_2,
];
