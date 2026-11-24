import type { ChemChapterSpec } from '../types';
import { THEORY_UNITS_1 } from './units/theory1';
import { THEORY_UNITS_2 } from './units/theory2';
import { THEORY_UNITS_3 } from './units/theory3';
import { THEORY_UNITS_4 } from './units/theory4';
import { THEORY_UNITS_5 } from './units/theory5';

export const THEORY_CHAPTERS: readonly ChemChapterSpec[] = [
  ...THEORY_UNITS_1,
  ...THEORY_UNITS_2,
  ...THEORY_UNITS_3,
  ...THEORY_UNITS_4,
  ...THEORY_UNITS_5,
];
