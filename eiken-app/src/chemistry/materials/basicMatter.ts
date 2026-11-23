import type { ChemChapterSpec } from '../types';
import { BASIC_MATTER_UNITS_1 } from './units/basicMatter1';
import { BASIC_MATTER_UNITS_2 } from './units/basicMatter2';

export const BASIC_MATTER_CHAPTERS: readonly ChemChapterSpec[] = [
  ...BASIC_MATTER_UNITS_1,
  ...BASIC_MATTER_UNITS_2,
];
