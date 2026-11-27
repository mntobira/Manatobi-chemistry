import type { ChemChapterSpec } from '../types';
import { POLYMER_UNITS_1 } from './units/polymer1';
import { POLYMER_UNITS_2 } from './units/polymer2';
import { POLYMER_UNITS_3 } from './units/polymer3';
import { POLYMER_UNITS_4 } from './units/polymer4';
import { POLYMER_UNITS_5 } from './units/polymer5';
import { POLYMER_UNITS_6 } from './units/polymer6';
import { WAVE2_POLYMER_UNITS } from './units/commonTestWave2';
import { WAVE3_POLYMER_UNITS } from './units/commonTestWave3';
import { WAVE4_POLYMER_UNITS } from './units/commonTestWave4';
import { WAVE5_POLYMER_UNITS } from './units/commonTestWave5';
import { WAVE6_POLYMER_UNITS } from './units/commonTestWave6';
import { ORGANIC_POLYMER_SUPPLEMENT_PROBLEMS } from './units/organicPolymerSupplements';
import { MASTERY_UNIT_SUPPLEMENT_PROBLEMS } from './units/masteryUnitSupplements';

const RAW_UNITS: readonly ChemChapterSpec[] = [
  ...POLYMER_UNITS_1,
  ...POLYMER_UNITS_2,
  ...POLYMER_UNITS_3,
  ...POLYMER_UNITS_4,
  ...POLYMER_UNITS_5,
  ...POLYMER_UNITS_6,
  ...WAVE2_POLYMER_UNITS,
  ...WAVE3_POLYMER_UNITS,
  ...WAVE4_POLYMER_UNITS,
  ...WAVE5_POLYMER_UNITS,
  ...WAVE6_POLYMER_UNITS,
];

export const POLYMER_CHAPTERS: readonly ChemChapterSpec[] = RAW_UNITS.map(unit => {
  const extra1 = ORGANIC_POLYMER_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  const extra2 = MASTERY_UNIT_SUPPLEMENT_PROBLEMS[unit.id] ?? [];
  return extra1.length > 0 || extra2.length > 0
    ? { ...unit, problems: [...unit.problems, ...extra1, ...extra2] }
    : unit;
});
