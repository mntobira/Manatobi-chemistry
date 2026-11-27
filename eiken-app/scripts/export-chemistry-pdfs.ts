/**
 * 化学・化学基礎 PDF 教材ビルダー用 JSON エクスポータ
 * - 共通テスト実戦模試 全8回（CHEM_MOCK_EXAMS）
 * - 全6コース・114単元のまとめプリント（ALL_CHEM_CHAPTER_SPECS）
 * - センター試験(1990-2020)〜共通テスト(2021-2026) 37年過去問分析（pastExamAnalysis）
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CHEM_COURSES } from '../src/eiken/config';
import { ALL_CHEM_CHAPTER_SPECS } from '../src/chemistry/curriculumAdapter';
import { CHEM_MOCK_EXAMS } from '../src/chemistry/materials/mockExams';
import {
  CENTER_KYOTSU_TRAPS,
  EXAM_TIMELINE_RECORDS,
  FULL_SCORE_TACTICS,
} from '../src/chemistry/pastExamAnalysis';

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, 'deliverables');
mkdirSync(OUT_DIR, { recursive: true });

const payload = {
  generatedAt: '2026-11-26',
  courses: CHEM_COURSES,
  mockExams: CHEM_MOCK_EXAMS,
  chapters: ALL_CHEM_CHAPTER_SPECS.map(ch => ({
    id: ch.id,
    course: ch.course,
    tabTitle: ch.tabTitle,
    unitTitle: ch.unitTitle,
    topics: ch.topics,
    summarySheet: ch.summarySheet,
    problemCount: ch.problems.length,
    subQuestionCount: ch.problems.reduce((s, p) => s + p.subItems.length, 0),
  })),
  pastAnalysis: {
    timeline: EXAM_TIMELINE_RECORDS,
    traps: CENTER_KYOTSU_TRAPS,
    tactics: FULL_SCORE_TACTICS,
  },
};

const outPath = resolve(OUT_DIR, 'chemistry-pdf-source.json');
writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
console.log(
  `[export-chemistry-pdfs] Exported ${CHEM_MOCK_EXAMS.length} mock exams, ${ALL_CHEM_CHAPTER_SPECS.length} unit summary sheets, and ${CENTER_KYOTSU_TRAPS.length} 37-year traps -> ${outPath}`,
);
