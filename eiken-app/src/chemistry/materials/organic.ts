import type { ChemChapterSpec } from '../types';
import { ORGANIC_UNITS_1 } from './units/organic1';
import { ORGANIC_UNITS_2 } from './units/organic2';
import { ORGANIC_UNITS_3 } from './units/organic3';
import { ORGANIC_UNITS_4 } from './units/organic4';
import { ORGANIC_UNITS_5 } from './units/organic5';
import { ORGANIC_UNITS_6 } from './units/organic6';
import { WAVE2_ORGANIC_UNITS } from './units/commonTestWave2';
import { WAVE3_ORGANIC_UNITS } from './units/commonTestWave3';
import { WAVE4_ORGANIC_UNITS } from './units/commonTestWave4';
import { ORGANIC_POLYMER_SUPPLEMENT_PROBLEMS } from './units/organicPolymerSupplements';
import { MASTERY_UNIT_SUPPLEMENT_PROBLEMS } from './units/masteryUnitSupplements';

const RAW_UNITS: readonly ChemChapterSpec[] = [
  ...ORGANIC_UNITS_1,
  ...ORGANIC_UNITS_2,
  ...ORGANIC_UNITS_3,
  ...ORGANIC_UNITS_4,
  ...ORGANIC_UNITS_5,
  ...ORGANIC_UNITS_6,
  ...WAVE2_ORGANIC_UNITS,
  ...WAVE3_ORGANIC_UNITS,
  ...WAVE4_ORGANIC_UNITS,
];

export const ORGANIC_CHAPTERS: readonly ChemChapterSpec[] = RAW_UNITS.map(unit => {
  const extra1 = ORGANIC_POLYMER_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  const extra2 = MASTERY_UNIT_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  return extra1.length > 0 || extra2.length > 0
    ? { ...unit, problems: [...unit.problems, ...extra1, ...extra2] }
    : unit;
});
