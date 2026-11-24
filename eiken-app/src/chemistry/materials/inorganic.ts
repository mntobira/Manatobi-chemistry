import type { ChemChapterSpec } from '../types';
import { INORGANIC_UNITS_1 } from './units/inorganic1';
import { INORGANIC_UNITS_2 } from './units/inorganic2';
import { INORGANIC_UNITS_3 } from './units/inorganic3';

export const INORGANIC_CHAPTERS: readonly ChemChapterSpec[] = [
  ...INORGANIC_UNITS_1,
  ...INORGANIC_UNITS_2,
  ...INORGANIC_UNITS_3,
];
