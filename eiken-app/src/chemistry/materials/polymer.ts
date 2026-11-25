import type { ChemChapterSpec } from '../types';
import { POLYMER_UNITS_1 } from './units/polymer1';
import { POLYMER_UNITS_2 } from './units/polymer2';
import { POLYMER_UNITS_3 } from './units/polymer3';
import { POLYMER_UNITS_4 } from './units/polymer4';
import { POLYMER_UNITS_5 } from './units/polymer5';

export const POLYMER_CHAPTERS: readonly ChemChapterSpec[] = [
  ...POLYMER_UNITS_1,
  ...POLYMER_UNITS_2,
  ...POLYMER_UNITS_3,
  ...POLYMER_UNITS_4,
  ...POLYMER_UNITS_5,
];
