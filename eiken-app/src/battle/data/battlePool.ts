import type { BattleAnswerFormat, BattleQuestion } from '../core/types';
import { CHEM_COURSES } from '../../eiken/config';
import { getSubjectStats } from '../../data/chapterIndex.generated';

// Keep the full Chemistry question bank out of the initial bundle while exposing exact per-course counts.
export const POOL_COUNTS: Readonly<Record<string, number>> = Object.fromEntries(
  CHEM_COURSES.filter(course => course.available).map(course => [
    course.id,
    getSubjectStats(course.id).marks ?? 8,
  ]),
);
export const POOL_FORMAT_COUNTS: Readonly<Record<string, Readonly<Partial<Record<BattleAnswerFormat, number>>>>> =
  Object.fromEntries(Object.entries(POOL_COUNTS).map(([course, count]) => [course, { choice4: count }]));
export const ANSWER_COUNTS = POOL_COUNTS;
const cache = new Map<string, readonly BattleQuestion[]>();
const inflight = new Map<string, Promise<readonly BattleQuestion[]>>();

export function poolCountOf(subject: string, formats: readonly BattleAnswerFormat[]): number {
  return formats.reduce((count, format) => count + (POOL_FORMAT_COUNTS[subject]?.[format] ?? 0), 0);
}
export async function loadPool(subject: string): Promise<readonly BattleQuestion[]> {
  if (!(subject in POOL_COUNTS)) return [];
  const existing = cache.get(subject);
  if (existing) return existing;
  const running = inflight.get(subject);
  if (running) return running;
  const promise = import('../../chemistry/curriculumAdapter')
    .then(({ FLAT_CHEM_QUESTIONS }) => {
      const list: BattleQuestion[] = FLAT_CHEM_QUESTIONS.filter(
        question => question.course === subject && question.published,
      )
        .map((question): BattleQuestion => ({
          id: `${question.id}_answer`,
          subject,
          chapterId: question.chapterId,
          problemId: question.problemId,
          subQuestionId: question.id,
          format: 'choice4',
          prompt: question.title,
          label: question.instruction,
          options: [...question.choices],
          answerIndex: question.correctAnswer,
          panelOrder: [],
          timeLimit: 25,
        }))
        .sort((a, b) => a.id.localeCompare(b.id, 'en'));
      cache.set(subject, list);
      return list;
    })
    .finally(() => inflight.delete(subject));
  inflight.set(subject, promise);
  return promise;
}
export function questionByIdSync(subject: string, id: string): BattleQuestion | undefined {
  return cache.get(subject)?.find(question => question.id === id);
}
export async function poolIdsOf(subject: string, formats: readonly BattleAnswerFormat[]): Promise<string[]> {
  return (await loadPool(subject)).filter(question => formats.includes(question.format)).map(question => question.id);
}
export function loadedPool(subject: string): readonly BattleQuestion[] {
  return cache.get(subject) ?? [];
}

/** Called only by the result screen; explanations do not enter the answering DOM. */
export async function loadBattleAnswers(subject: string): Promise<ReadonlyMap<string, string>> {
  if (!(subject in POOL_COUNTS)) return new Map();
  const { FLAT_CHEM_QUESTIONS } = await import('../../chemistry/curriculumAdapter');
  return new Map(
    FLAT_CHEM_QUESTIONS.filter(question => question.course === subject && question.published).map(question => [
      `${question.id}_answer`,
      `${question.choices[question.correctAnswer]} — ${question.explanation}`,
    ]),
  );
}

/** No spoken prompt needed for Chemistry battle questions. */
export async function loadBattleSpeech(_id: string): Promise<string | undefined> {
  return undefined;
}
