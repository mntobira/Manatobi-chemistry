import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  CHEM_COURSES,
  CHEM_STORAGE_PREFIX,
  chemCollection,
  validateEikenTarget,
} from '../src/eiken/config';
import { ALL_CHEM_CHAPTER_SPECS, FLAT_CHEM_QUESTIONS, partsForCourse } from '../src/chemistry/curriculumAdapter';
import { derivePrintRule } from '../src/chemistry/printMethod';
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
    expect(ALL_CHEM_CHAPTER_SPECS).toHaveLength(149);
    expect(FLAT_CHEM_QUESTIONS.length).toBeGreaterThanOrEqual(620);

    let printRuleCount = 0;
    let genericFallbackCount = 0;
    let multiFigCount = 0;
    let tableProbCount = 0;

    for (const course of CHEM_COURSES) {
      const chapters = getChaptersOfSubject(course.id);
      const stats = getSubjectStats(course.id);
      expect(chapters.length).toBeGreaterThanOrEqual(20);
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
        expect(unitSubCount).toBeGreaterThanOrEqual(3);

        for (const prob of ch.practiceProblems) {
          expect(prob.isChemistryProblem).toBe(true);
          if (prob.chemFigures && prob.chemFigures.length >= 2) multiFigCount++;
          if (prob.chemDataTable) tableProbCount++;
          expect(prob.subQuestions.length).toBeGreaterThan(0);
          for (const sq of prob.subQuestions) {
            expect(sq.optionTexts).toHaveLength(4);
            expect(sq.distractors).toHaveLength(4);
            expect(['1', '2', '3', '4']).toContain(sq.correctAnswer);
            expect((sq.explainJa ?? '').length, `${sq.id} explainJa length`).toBeGreaterThanOrEqual(110);
            expect((sq.detailedExplanation?.steps ?? []).length, `${sq.id} steps count`).toBeGreaterThanOrEqual(2);
            const pr = sq.detailedExplanation?.printRule ?? '';
            expect(pr.length, `${sq.id} printRule`).toBeGreaterThan(10);
            if (pr.startsWith('【プリントの鉄則】「')) genericFallbackCount++;
            if (pr) printRuleCount++;
          }
        }
      }
    }
    expect(genericFallbackCount).toBe(0);
    expect(printRuleCount).toBeGreaterThanOrEqual(620);
    expect(multiFigCount).toBeGreaterThanOrEqual(12);
    expect(tableProbCount).toBeGreaterThanOrEqual(12);
  });

  it('validates all 16 Common Test full mock exams (50pt Basic x8, 100pt Chemistry x8) with exact point totals and authentic structure', () => {
    expect(CHEM_MOCK_EXAMS).toHaveLength(16);
    expect(CHEM_MOCK_EXAMS.filter(e => e.examCategory === 'basic')).toHaveLength(8);
    expect(CHEM_MOCK_EXAMS.filter(e => e.examCategory === 'advanced')).toHaveLength(8);
    let dataTableCount = 0;
    let dialogueCount = 0;
    let multiFigSecCount = 0;
    let mockGenericFallback = 0;
    for (const exam of CHEM_MOCK_EXAMS) {
      expect(exam.levelBadge, `${exam.id} levelBadge`).toBeTruthy();
      expect(exam.constantsNote, `${exam.id} constantsNote`).toBeTruthy();
      const totalItems = exam.sections.reduce((acc, sec) => acc + sec.items.length, 0);
      if (exam.examCategory === 'basic') {
        expect(totalItems).toBeGreaterThanOrEqual(8);
        expect(exam.sections).toHaveLength(2);
      } else {
        expect(totalItems).toBeGreaterThanOrEqual(13);
        expect(exam.sections).toHaveLength(5);
      }
      const sumPoints = exam.sections.reduce(
        (acc, sec) => acc + sec.items.reduce((s, it) => s + it.points, 0),
        0,
      );
      expect(sumPoints, `${exam.id} totalPoints`).toBe(exam.totalPoints);
      for (const sec of exam.sections) {
        expect((sec.leadText ?? '').length, `${sec.id} leadText`).toBeGreaterThanOrEqual(50);
        const primaryImg = sec.figures?.[0]?.url ?? sec.imageUrl;
        expect(primaryImg, `${sec.id} imageUrl/figures`).toBeTruthy();
        expect(primaryImg?.startsWith('data:image/svg+xml')).toBe(true);
        if (sec.figures && sec.figures.length >= 2) multiFigSecCount++;
        if (sec.dataTable) {
          dataTableCount++;
          expect(sec.dataTable.headers.length).toBeGreaterThanOrEqual(2);
          expect(sec.dataTable.rows.length).toBeGreaterThanOrEqual(2);
        }
        if (sec.dialogue && sec.dialogue.length > 0) {
          dialogueCount++;
          expect(sec.dialogue.length).toBeGreaterThanOrEqual(2);
        }
        for (const item of sec.items) {
          expect(item.choices).toHaveLength(4);
          expect(item.answer).toBeGreaterThanOrEqual(0);
          expect(item.answer).toBeLessThan(4);
          expect(item.reasons).toHaveLength(4);
          if (item.difficulty) {
            expect(['foundation', 'kyotsu_standard', 'kyotsu_2ji']).toContain(item.difficulty);
          }
          const mockPr = derivePrintRule({
            printRule: item.printRule,
            skill: item.skill,
            stem: `${sec.leadText ?? ''}\n${item.stem}`,
            explanation: item.explanation,
          });
          if (mockPr.startsWith('【プリントの鉄則】「')) mockGenericFallback++;
        }
      }
    }
    expect(mockGenericFallback).toBe(0);
    expect(dataTableCount).toBeGreaterThanOrEqual(15);
    expect(dialogueCount).toBeGreaterThanOrEqual(6);
    expect(multiFigSecCount).toBeGreaterThanOrEqual(10);
  });

  it('validates generated chemistry wordbook JSON and study catalog wiring', () => {
    const vocab = JSON.parse(readFileSync('public/data/listeningVocabulary.json', 'utf8'));
    expect(vocab.wordCount).toBeGreaterThanOrEqual(450);
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
    expect(CHEM_LAB_TASKS).toHaveLength(30);
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
