import type { Chapter, Part, Problem, SubQuestion } from '../types/curriculum';
import { SQ_BODY_MARK, SQ_MARK } from '../utils/explanationFormat';
import { CHEM_COURSES, type ChemCourseId } from '../eiken/config';
import type { ChemChapterSpec, ChemDifficultyLevel, ChemProblemSpec, ChemSubItem } from './types';
import { derivePrintRule } from './printMethod';
import { BASIC_MATTER_CHAPTERS } from './materials/basicMatter';
import { BASIC_CHANGE_CHAPTERS } from './materials/basicChange';
import { THEORY_CHAPTERS } from './materials/theory';
import { INORGANIC_CHAPTERS } from './materials/inorganic';
import { ORGANIC_CHAPTERS } from './materials/organic';
import { POLYMER_CHAPTERS } from './materials/polymer';

const FORMAT_LABELS: Record<ChemProblemSpec['format'], string> = {
  statement_judge: '正誤判定',
  calculation: '量的関係・計算',
  experiment_inquiry: '実験・グラフ考察',
  dialogue_inquiry: '会話文・探究考察',
  structure_synthesis: '系統分離・構造決定',
};

export const ALL_CHEM_CHAPTER_SPECS: readonly ChemChapterSpec[] = [
  ...BASIC_MATTER_CHAPTERS,
  ...BASIC_CHANGE_CHAPTERS,
  ...THEORY_CHAPTERS,
  ...INORGANIC_CHAPTERS,
  ...ORGANIC_CHAPTERS,
  ...POLYMER_CHAPTERS,
];

const CIRCLED_NUMS = ['①', '②', '③', '④'] as const;

function deriveStructuredSteps(sub: ChemSubItem, printRule: string): string[] {
  const correctCircle = CIRCLED_NUMS[sub.answer];
  const correctReason = sub.reasons[sub.answer];

  if (sub.steps && sub.steps.length >= 2) {
    return [...sub.steps];
  }
  if (sub.steps && sub.steps.length === 1) {
    return [
      sub.steps[0]!,
      `検算と選択肢の確定：${correctCircle}（${correctReason}）が条件をすべて満たすことを確認し、他選択肢のひっかけを消去する。`,
    ];
  }
  const lines = sub.explanation
    .split('\n')
    .map(l => l.replace(/^[・●▪■]\s*/, '').trim())
    .filter(l => l.length > 0);
  if (lines.length >= 2) {
    return lines.slice(0, 4);
  }
  return [
    `型の適用：${printRule.replace(/^【[^】]+】/, '').trim()}`,
    `結論と誤答消去：${correctCircle}（${correctReason}）を選び、他選択肢の数値・条件の誤りを除外する。`,
  ];
}

function difficultyLevelToScore(level: ChemDifficultyLevel): number {
  switch (level) {
    case 'foundation':
      return 2;
    case 'kyotsu_standard':
      return 4;
    case 'kyotsu_2ji':
      return 5;
  }
}

export function inferChapterTargetLevel(spec: ChemChapterSpec): ChemDifficultyLevel {
  if (spec.targetLevel) return spec.targetLevel;
  const subDiffs = spec.problems.flatMap(p => p.subItems.map(s => s.difficulty).filter(Boolean));
  if (subDiffs.includes('kyotsu_2ji')) return 'kyotsu_2ji';
  if (subDiffs.includes('kyotsu_standard')) return 'kyotsu_standard';

  const m = spec.id.match(/_ch(\d+)$/);
  const chNo = m ? Number(m[1]) : 1;
  switch (spec.course) {
    case 'chem_basic_matter':
      if (chNo <= 5) return 'foundation';
      if (chNo <= 12) return 'kyotsu_standard';
      return 'kyotsu_2ji';
    case 'chem_basic_change':
      if (chNo <= 5) return 'foundation';
      if (chNo <= 14) return 'kyotsu_standard';
      return 'kyotsu_2ji';
    case 'chem_theory':
      if (chNo <= 5) return 'foundation';
      if (chNo <= 15) return 'kyotsu_standard';
      return 'kyotsu_2ji';
    case 'chem_inorganic':
      if (chNo <= 5) return 'foundation';
      if (chNo <= 13) return 'kyotsu_standard';
      return 'kyotsu_2ji';
    case 'chem_organic':
      if (chNo <= 5) return 'foundation';
      if (chNo <= 12) return 'kyotsu_standard';
      return 'kyotsu_2ji';
    case 'chem_polymer':
      if (chNo <= 3) return 'foundation';
      if (chNo <= 9) return 'kyotsu_standard';
      return 'kyotsu_2ji';
    default:
      return 'kyotsu_standard';
  }
}

function toSubQuestion(
  sub: ChemSubItem,
  fallbackLevel: ChemDifficultyLevel,
  problemStem?: string,
): SubQuestion {
  const fullLabel = sub.prompt ? `${sub.label}　${sub.prompt}` : sub.label;
  const level = sub.difficulty ?? fallbackLevel;
  const printRule = derivePrintRule({
    printRule: sub.printRule,
    skill: sub.skill,
    stem: `${problemStem ?? ''} ${sub.prompt ?? ''}`,
    explanation: sub.explanation,
  });
  return {
    id: sub.id,
    label: fullLabel,
    type: 'multiple_choice',
    options: ['1', '2', '3', '4'],
    optionTexts: [...sub.choices],
    correctAnswer: String(sub.answer + 1),
    skill: sub.skill,
    examPoints: sub.points ?? 4,
    explainJa: sub.explanation,
    detailedExplanation: {
      theme: sub.skill,
      printRule,
      steps: deriveStructuredSteps(sub, printRule),
      difficulty: difficultyLevelToScore(level),
    },
    distractors: sub.reasons.map((why, index) => ({ no: index + 1, why })),
  };
}

export function chemProblemToCurriculum(
  spec: ChemProblemSpec,
  fallbackLevel: ChemDifficultyLevel = 'kyotsu_standard',
): Problem {
  const subs = spec.subItems.map(s => toSubQuestion(s, fallbackLevel, spec.stem));
  const explanationBlocks = spec.subItems.map((sub, idx) => {
    const sqId = subs[idx]!.id;
    return `${SQ_MARK(sqId)}${SQ_BODY_MARK}${sub.explanation}`;
  });

  const chemFigures =
    spec.figures && spec.figures.length > 0
      ? spec.figures.map(f => ({ url: f.url, label: f.label, caption: f.caption }))
      : undefined;

  return {
    id: spec.id,
    title: spec.title,
    category: FORMAT_LABELS[spec.format],
    text: `【${spec.title}】\n${spec.stem}`,
    isChemistryProblem: true,
    ...(spec.imageUrl ? { imageUrl: spec.imageUrl, imageCaption: spec.imageCaption } : {}),
    ...(chemFigures ? { chemFigures } : {}),
    ...(spec.dataTable ? { chemDataTable: spec.dataTable } : {}),
    subQuestions: subs,
    explanation: explanationBlocks.join('\n\n'),
    surroundingKnowledge: [...spec.surroundingKnowledge],
    deepDiveTopics: [],
  };
}

export function cleanChemUnitTitle(raw: string): string {
  return raw
    .replace(/^第\d+回\s*/, '')
    .replace(/（大問\d+題・計\d+問）$/, '')
    .trim();
}

export function chemChapterToCurriculum(spec: ChemChapterSpec): Chapter {
  const targetLevel = inferChapterTargetLevel(spec);
  const problems = spec.problems.map(p => chemProblemToCurriculum(p, targetLevel));
  const totalMarks = problems.reduce((sum, p) => sum + p.subQuestions.length, 0);
  const cleanUnit = cleanChemUnitTitle(spec.unitTitle);
  return {
    id: spec.id,
    title: `${spec.tabTitle}｜${cleanUnit}`,
    abstractTitle: cleanUnit,
    realTitle: spec.tabTitle,
    questionGroup: spec.tabTitle,
    targetLevel,
    topics: [...spec.topics],
    marks: totalMarks,
    ...(spec.summarySheet ? { summarySheet: spec.summarySheet } : {}),
    practiceProblems: problems,
    miniTest: [],
  };
}

export function partsForCourse(course: ChemCourseId): Part[] {
  const courseDef = CHEM_COURSES.find(c => c.id === course) ?? CHEM_COURSES[0];
  const specs = ALL_CHEM_CHAPTER_SPECS.filter(ch => ch.course === courseDef.id);
  const byTab = new Map<string, Chapter[]>();
  for (const spec of specs) {
    const list = byTab.get(spec.tabTitle) ?? [];
    list.push(chemChapterToCurriculum(spec));
    byTab.set(spec.tabTitle, list);
  }
  const sortedEntries = [...byTab.entries()].sort(([a], [b]) => {
    const ma = a.match(/^第?(\d+)章/);
    const mb = b.match(/^第?(\d+)章/);
    if (ma && mb) return Number(ma[1]) - Number(mb[1]);
    return 0;
  });
  return sortedEntries.map(([tabTitle, chapters], index) => ({
    id: `${courseDef.id}_part_${index + 1}`,
    title: `${courseDef.label}｜${tabTitle}`,
    section: `part_${index + 1}`,
    chapters,
  }));
}

export interface FlatBattleItem {
  id: string;
  course: ChemCourseId;
  chapterId: string;
  problemId: string;
  questionNumber: number;
  title: string;
  instruction: string;
  choices: readonly [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: string;
  reasons: readonly [string, string, string, string];
  skill: string;
  published: boolean;
}

export type FlatChemQuestion = FlatBattleItem;

/** 対戦モード・マナラッシュで即座に使える 4択フラット問題プール */
export const FLAT_CHEM_QUESTIONS: readonly FlatBattleItem[] = ALL_CHEM_CHAPTER_SPECS.flatMap(ch =>
  ch.problems.flatMap(prob =>
    prob.subItems.map((sub, idx): FlatBattleItem => {
      const compactStem = prob.stem.split('\n')[0] ?? '';
      const instruction = sub.prompt
        ? `${sub.prompt}`
        : `${compactStem}\n${sub.label}`;
      return {
        id: sub.id,
        course: ch.course,
        chapterId: ch.id,
        problemId: prob.id,
        questionNumber: idx + 1,
        title: prob.title,
        instruction,
        choices: sub.choices,
        correctAnswer: sub.answer,
        explanation: sub.explanation,
        reasons: sub.reasons,
        skill: sub.skill,
        published: true,
      };
    }),
  ),
);
