import type { ChemChapterSpec } from '../types';
import { BASIC_CHANGE_UNITS_1 } from './units/basicChange1';
import { BASIC_CHANGE_UNITS_2 } from './units/basicChange2';
import { BASIC_CHANGE_UNITS_3 } from './units/basicChange3';
import { BASIC_CHANGE_UNITS_4 } from './units/basicChange4';
import { BASIC_CHANGE_UNITS_5 } from './units/basicChange5';
import { BASIC_CHANGE_UNITS_6 } from './units/basicChange6';
import { BASIC_CHANGE_UNITS_7 } from './units/basicChange7';
import { WAVE2_BASIC_CHANGE_UNITS } from './units/commonTestWave2';
import { WAVE3_BASIC_CHANGE_UNITS } from './units/commonTestWave3';
import { WAVE4_BASIC_CHANGE_UNITS } from './units/commonTestWave4';
import { BASIC_SUPPLEMENT_PROBLEMS } from './units/basicSupplements';
import { MASTERY_UNIT_SUPPLEMENT_PROBLEMS } from './units/masteryUnitSupplements';

const RAW_UNITS: readonly ChemChapterSpec[] = [
  ...BASIC_CHANGE_UNITS_1,
  ...BASIC_CHANGE_UNITS_2,
  ...BASIC_CHANGE_UNITS_3,
  ...BASIC_CHANGE_UNITS_4,
  ...BASIC_CHANGE_UNITS_5,
  ...BASIC_CHANGE_UNITS_6,
  ...BASIC_CHANGE_UNITS_7,
  ...WAVE2_BASIC_CHANGE_UNITS,
  ...WAVE3_BASIC_CHANGE_UNITS,
  ...WAVE4_BASIC_CHANGE_UNITS,
];

export const BASIC_CHANGE_CHAPTERS: readonly ChemChapterSpec[] = RAW_UNITS.map(unit => {
  const extra1 = BASIC_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  const extra2 = MASTERY_UNIT_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  return extra1.length > 0 || extra2.length > 0
    ? { ...unit, problems: [...unit.problems, ...extra1, ...extra2] }
    : unit;
});
