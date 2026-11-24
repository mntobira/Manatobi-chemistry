import type { ChemChapterSpec } from '../types';
import { BASIC_MATTER_UNITS_1 } from './units/basicMatter1';
import { BASIC_MATTER_UNITS_2 } from './units/basicMatter2';
import { BASIC_MATTER_UNITS_3 } from './units/basicMatter3';
import { BASIC_MATTER_UNITS_4 } from './units/basicMatter4';

export const BASIC_MATTER_CHAPTERS: readonly ChemChapterSpec[] = [
  ...BASIC_MATTER_UNITS_1,
  ...BASIC_MATTER_UNITS_2,
  ...BASIC_MATTER_UNITS_3,
  ...BASIC_MATTER_UNITS_4,
];
