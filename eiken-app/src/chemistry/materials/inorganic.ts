import type { ChemChapterSpec } from '../types';
import { INORGANIC_UNITS_1 } from './units/inorganic1';
import { INORGANIC_UNITS_2 } from './units/inorganic2';
import { INORGANIC_UNITS_3 } from './units/inorganic3';
import { INORGANIC_UNITS_4 } from './units/inorganic4';
import { INORGANIC_UNITS_5 } from './units/inorganic5';
import { INORGANIC_UNITS_6 } from './units/inorganic6';
import { WAVE2_INORGANIC_UNITS } from './units/commonTestWave2';
import { WAVE3_INORGANIC_UNITS } from './units/commonTestWave3';
import { WAVE4_INORGANIC_UNITS } from './units/commonTestWave4';
import { THEORY_INORGANIC_SUPPLEMENT_PROBLEMS } from './units/theoryInorganicSupplements';
import { MASTERY_UNIT_SUPPLEMENT_PROBLEMS } from './units/masteryUnitSupplements';

const RAW_UNITS: readonly ChemChapterSpec[] = [
  ...INORGANIC_UNITS_1,
  ...INORGANIC_UNITS_2,
  ...INORGANIC_UNITS_3,
  ...INORGANIC_UNITS_4,
  ...INORGANIC_UNITS_5,
  ...INORGANIC_UNITS_6,
  ...WAVE2_INORGANIC_UNITS,
  ...WAVE3_INORGANIC_UNITS,
  ...WAVE4_INORGANIC_UNITS,
];

export const INORGANIC_CHAPTERS: readonly ChemChapterSpec[] = RAW_UNITS.map(unit => {
  const extra1 = THEORY_INORGANIC_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  const extra2 = MASTERY_UNIT_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  return extra1.length > 0 || extra2.length > 0
    ? { ...unit, problems: [...unit.problems, ...extra1, ...extra2] }
    : unit;
});
