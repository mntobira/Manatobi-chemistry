import type { ChemChapterSpec } from '../types';
import { BASIC_MATTER_UNITS_1 } from './units/basicMatter1';
import { BASIC_MATTER_UNITS_2 } from './units/basicMatter2';
import { BASIC_MATTER_UNITS_3 } from './units/basicMatter3';
import { BASIC_MATTER_UNITS_4 } from './units/basicMatter4';
import { BASIC_MATTER_UNITS_5 } from './units/basicMatter5';
import { BASIC_MATTER_UNITS_6 } from './units/basicMatter6';
import { WAVE2_BASIC_MATTER_UNITS } from './units/commonTestWave2';
import { WAVE3_BASIC_MATTER_UNITS } from './units/commonTestWave3';
import { WAVE4_BASIC_MATTER_UNITS } from './units/commonTestWave4';
import { BASIC_SUPPLEMENT_PROBLEMS } from './units/basicSupplements';
import { MASTERY_UNIT_SUPPLEMENT_PROBLEMS } from './units/masteryUnitSupplements';

const RAW_UNITS: readonly ChemChapterSpec[] = [
  ...BASIC_MATTER_UNITS_1,
  ...BASIC_MATTER_UNITS_2,
  ...BASIC_MATTER_UNITS_3,
  ...BASIC_MATTER_UNITS_4,
  ...BASIC_MATTER_UNITS_5,
  ...BASIC_MATTER_UNITS_6,
  ...WAVE2_BASIC_MATTER_UNITS,
  ...WAVE3_BASIC_MATTER_UNITS,
  ...WAVE4_BASIC_MATTER_UNITS,
];

export const BASIC_MATTER_CHAPTERS: readonly ChemChapterSpec[] = RAW_UNITS.map(unit => {
  const extra1 = BASIC_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  const extra2 = MASTERY_UNIT_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  return extra1.length > 0 || extra2.length > 0
    ? { ...unit, problems: [...unit.problems, ...extra1, ...extra2] }
    : unit;
});
