import type { Chapter, Part, Problem, SubQuestion } from '../types/curriculum';
import { SQ_BODY_MARK, SQ_MARK } from '../utils/explanationFormat';
import { CHEM_COURSES, type ChemCourseId } from '../eiken/config';
import type { ChemChapterSpec, ChemProblemSpec, ChemSubItem } from './types';
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

function deriveStructuredSteps(sub: ChemSubItem): string[] {
  if (sub.steps && sub.steps.length > 0) {
    return [...sub.steps];
  }
  const lines = sub.explanation
    .split('\n')
    .map(l => l.replace(/^[・●▪■]\s*/, '').trim())
    .filter(l => l.length > 0);
  if (lines.length >= 2) {
    return lines.slice(0, 4);
  }
  const correctCircle = CIRCLED_NUMS[sub.answer];
  const correctReason = sub.reasons[sub.answer];
  return [
    `着眼テーマ：「${sub.skill}」の定義・公式・例外条件を確認する。`,
    `選択肢の吟味：${correctCircle}（${correctReason}）が条件に合致することを確認し、他選択肢の引っかけ箇所を除外する。`,
  ];
}

function toSubQuestion(sub: ChemSubItem): SubQuestion {
  const fullLabel = sub.prompt ? `${sub.label}　${sub.prompt}` : sub.label;
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
      steps: deriveStructuredSteps(sub),
    },
    distractors: sub.reasons.map((why, index) => ({ no: index + 1, why })),
  };
}

export function chemProblemToCurriculum(spec: ChemProblemSpec): Problem {
  const subs = spec.subItems.map(toSubQuestion);
  const explanationBlocks = spec.subItems.map((sub, idx) => {
    const sqId = subs[idx]!.id;
    return `${SQ_MARK(sqId)}${SQ_BODY_MARK}${sub.explanation}`;
  });

  return {
    id: spec.id,
    title: spec.title,
    category: FORMAT_LABELS[spec.format],
    text: `【${spec.title}】\n${spec.stem}`,
    ...(spec.imageUrl ? { imageUrl: spec.imageUrl, imageCaption: spec.imageCaption } : {}),
    subQuestions: subs,
    explanation: explanationBlocks.join('\n\n'),
    surroundingKnowledge: [...spec.surroundingKnowledge],
    deepDiveTopics: [],
  };
}

export function chemChapterToCurriculum(spec: ChemChapterSpec): Chapter {
  const problems = spec.problems.map(chemProblemToCurriculum);
  const totalMarks = problems.reduce((sum, p) => sum + p.subQuestions.length, 0);
  return {
    id: spec.id,
    title: `${spec.tabTitle}｜${spec.unitTitle}`,
    abstractTitle: `${spec.unitTitle}（大問${problems.length}題・計${totalMarks}問）`,
    realTitle: spec.tabTitle,
    questionGroup: spec.tabTitle,
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
  return [...byTab.entries()].map(([tabTitle, chapters], index) => ({
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
