import type { Part } from '../types/curriculum';
import type { ChemCourseId } from './config';
import {
  FLAT_CHEM_QUESTIONS,
  partsForCourse,
  type FlatChemQuestion,
} from '../chemistry/curriculumAdapter';

export type EikenQuestion = FlatChemQuestion;
export const EIKEN_QUESTIONS: readonly FlatChemQuestion[] = FLAT_CHEM_QUESTIONS;
export const EIKEN_UNITS: readonly { id: string; title: string }[] = [];

export function partsForGrade(course: ChemCourseId): Part[] {
  return partsForCourse(course);
}
