import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  CHEM_COURSES,
  CHEM_STORAGE_PREFIX,
  chemCollection,
  validateEikenTarget,
} from '../src/eiken/config';
import { ALL_CHEM_CHAPTER_SPECS, FLAT_CHEM_QUESTIONS, partsForCourse } from '../src/chemistry/curriculumAdapter';
import { CHEM_MOCK_EXAMS } from '../src/chemistry/materials/mockExams';
import { CHEM_LAB_TASKS } from '../src/chemistry/materials/labTasks';
import { getChaptersOfSubject } from '../src/data/allChapters';
import { getSubjectStats } from '../src/data/chapterIndex.generated';
import { STUDY_CATALOG } from '../src/data/studyCatalog';
import { loadPool, POOL_COUNTS } from '../src/battle/data/battlePool';
import { renderLatex, toChemLatex } from '../src/utils/mathTypeset';

describe('Manatobi Chemistry Common Test Curriculum & Isolation', () => {
  it('registers all 6 chemistry courses with valid chapters, 1-screen summary sheets, 4+ questions per unit, and detailed explanations', () => {
    expect(CHEM_COURSES).toHaveLength(6);
    expect(ALL_CHEM_CHAPTER_SPECS).toHaveLength(114);
    expect(FLAT_CHEM_QUESTIONS.length).toBeGreaterThanOrEqual(457);

    for (const course of CHEM_COURSES) {
      const chapters = getChaptersOfSubject(course.id);
      const stats = getSubjectStats(course.id);
      expect(chapters.length).toBeGreaterThanOrEqual(15);
      expect(stats.chapters).toBe(chapters.length);

      const parts = partsForCourse(course.id);
      expect(parts.length).toBeGreaterThanOrEqual(1);

      for (const ch of chapters) {
        expect(ch.id.startsWith(`${course.id}_`)).toBe(true);
        expect(['foundation', 'kyotsu_standard', 'kyotsu_2ji']).toContain(ch.targetLevel);
        expect(ch.summarySheet).toBeDefined();
        expect(ch.summarySheet?.formulas.length).toBeGreaterThanOrEqual(2);
        expect(ch.summarySheet?.table.rows.length).toBeGreaterThanOrEqual(3);
        expect(ch.summarySheet?.traps.length).toBeGreaterThanOrEqual(2);
        expect(ch.practiceProblems.length).toBeGreaterThan(0);

        const unitSubCount = ch.practiceProblems.reduce((s, p) => s + p.subQuestions.length, 0);
        expect(unitSubCount).toBeGreaterThanOrEqual(4);

        for (const prob of ch.practiceProblems) {
          expect(prob.subQuestions.length).toBeGreaterThan(0);
          for (const sq of prob.subQuestions) {
            expect(sq.optionTexts).toHaveLength(4);
            expect(sq.distractors).toHaveLength(4);
            expect(['1', '2', '3', '4']).toContain(sq.correctAnswer);
            expect((sq.explainJa ?? '').length).toBeGreaterThan(20);
            expect((sq.detailedExplanation?.steps ?? []).length).toBeGreaterThanOrEqual(1);
          }
        }
      }
    }
  });

  it('validates all 8 Common Test full mock exams (50pt Basic x4, 100pt Chemistry x4) with exact point totals and authentic structure', () => {
    expect(CHEM_MOCK_EXAMS).toHaveLength(8);
    for (const exam of CHEM_MOCK_EXAMS) {
      expect(exam.levelBadge).toBeTruthy();
      expect(exam.constantsNote).toBeTruthy();
      const totalItems = exam.sections.reduce((acc, sec) => acc + sec.items.length, 0);
      if (exam.examCategory === 'basic') {
        expect(totalItems).toBeGreaterThanOrEqual(9);
        expect(exam.sections).toHaveLength(2);
      } else {
        expect(totalItems).toBe(15);
        expect(exam.sections).toHaveLength(5);
      }
      const sumPoints = exam.sections.reduce(
        (acc, sec) => acc + sec.items.reduce((s, it) => s + it.points, 0),
        0,
      );
      expect(sumPoints, `${exam.id} totalPoints`).toBe(exam.totalPoints);
      for (const sec of exam.sections) {
        expect(sec.recommendedMinutes).toBeGreaterThan(0);
        for (const item of sec.items) {
          expect(item.choices).toHaveLength(4);
          expect(item.answer).toBeGreaterThanOrEqual(0);
          expect(item.answer).toBeLessThan(4);
          expect(item.reasons).toHaveLength(4);
        }
      }
    }
  });

  it('validates generated chemistry wordbook JSON and study catalog wiring', () => {
    const vocab = JSON.parse(readFileSync('public/data/listeningVocabulary.json', 'utf8'));
    expect(vocab.wordCount).toBeGreaterThanOrEqual(400);
    expect(vocab.questionCount).toBe(vocab.wordCount * 2);
    for (const w of vocab.words) {
      expect(w.questions).toHaveLength(2);
      for (const q of w.questions) {
        expect(new Set(q.options).size).toBe(4);
      }
    }

    expect(STUDY_CATALOG).toHaveLength(1);
    expect(STUDY_CATALOG[0].id).toBe('chemistry');
    expect(STUDY_CATALOG[0].contents.length).toBe(10);
  });

  it('loads 4-choice battle pools for all 6 chemistry courses and renders KaTeX mhchem formulas', async () => {
    for (const course of CHEM_COURSES) {
      const pool = await loadPool(course.id);
      expect(pool.length).toBe(POOL_COUNTS[course.id]);
      expect(pool[0]?.format).toBe('choice4');
      expect(pool[0]?.timeLimit).toBe(25);
    }

    const latex = toChemLatex('MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O');
    expect(latex).toBeTruthy();
    const html = renderLatex(latex!);
    expect(html).toContain('katex');
    expect(CHEM_LAB_TASKS).toHaveLength(24);
  });

  it('enforces chemistry storage and Firestore collection isolation', () => {
    expect(CHEM_STORAGE_PREFIX).toBe('chemistry:v1:');
    expect(chemCollection('users')).toBe('chem_users');
    expect(chemCollection('chem_rooms')).toBe('chem_rooms');
    expect(() =>
      validateEikenTarget({
        VITE_EIKEN_ENABLE_CLOUD: 'true',
        VITE_EIKEN_FIREBASE_PROJECT_ID: 'manatobi-listening-prod',
      }),
    ).toThrow();
  });
});
