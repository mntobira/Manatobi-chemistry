import type { ChemChapterSpec } from '../types';
import { THEORY_UNITS_1 } from './units/theory1';
import { THEORY_UNITS_2 } from './units/theory2';
import { THEORY_UNITS_3 } from './units/theory3';
import { THEORY_UNITS_4 } from './units/theory4';
import { THEORY_UNITS_5 } from './units/theory5';
import { THEORY_UNITS_6 } from './units/theory6';
import { THEORY_UNITS_7 } from './units/theory7';
import { WAVE2_THEORY_UNITS } from './units/commonTestWave2';
import { WAVE3_THEORY_UNITS } from './units/commonTestWave3';
import { WAVE4_THEORY_UNITS } from './units/commonTestWave4';
import { THEORY_INORGANIC_SUPPLEMENT_PROBLEMS } from './units/theoryInorganicSupplements';
import { MASTERY_UNIT_SUPPLEMENT_PROBLEMS } from './units/masteryUnitSupplements';

const RAW_UNITS: readonly ChemChapterSpec[] = [
  ...THEORY_UNITS_1,
  ...THEORY_UNITS_2,
  ...THEORY_UNITS_3,
  ...THEORY_UNITS_4,
  ...THEORY_UNITS_5,
  ...THEORY_UNITS_6,
  ...THEORY_UNITS_7,
  ...WAVE2_THEORY_UNITS,
  ...WAVE3_THEORY_UNITS,
  ...WAVE4_THEORY_UNITS,
];

export const THEORY_CHAPTERS: readonly ChemChapterSpec[] = RAW_UNITS.map(unit => {
  const extra1 = THEORY_INORGANIC_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  const extra2 = MASTERY_UNIT_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  return extra1.length > 0 || extra2.length > 0
    ? { ...unit, problems: [...unit.problems, ...extra1, ...extra2] }
    : unit;
});
