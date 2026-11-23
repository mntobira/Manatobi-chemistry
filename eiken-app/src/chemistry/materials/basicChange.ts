import type { ChemChapterSpec } from '../types';
import { BASIC_CHANGE_UNITS_1 } from './units/basicChange1';
import { BASIC_CHANGE_UNITS_2 } from './units/basicChange2';
import { BASIC_CHANGE_UNITS_3 } from './units/basicChange3';

export const BASIC_CHANGE_CHAPTERS: readonly ChemChapterSpec[] = [
  ...BASIC_CHANGE_UNITS_1,
  ...BASIC_CHANGE_UNITS_2,
  ...BASIC_CHANGE_UNITS_3,
];
