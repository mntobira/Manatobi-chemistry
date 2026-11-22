import { readFileSync, writeFileSync } from 'node:fs';
import { CHEM_COURSES } from '../src/eiken/config';
import { partsForCourse } from '../src/chemistry/curriculumAdapter';
import type { ListeningWord, VocabularyData } from '../src/data/listeningSupport';

// 6分野×3段階レベル（最頻出A・重要B・化学式・反応式・法則）に編成した化学基礎・化学マスター暗記帳原本。
const rows = readFileSync('src/eiken/materials/wordbook.tsv', 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(line => line && !line.startsWith('#'))
  .map(line => line.split('|'));

const chapters = CHEM_COURSES.filter(course => course.available).flatMap(course =>
  partsForCourse(course.id).flatMap(part => part.chapters),
);

const rowsByLevel = new Map<string, string[][]>();
const rowsByTier = new Map<string, string[][]>();
for (const row of rows) {
  const lv = row[0];
  const [, rawTier = 'a'] = lv.split(':');
  const arr = rowsByLevel.get(lv);
  if (arr) arr.push(row);
  else rowsByLevel.set(lv, [row]);
  const tierArr = rowsByTier.get(rawTier);
  if (tierArr) tierArr.push(row);
  else rowsByTier.set(rawTier, [row]);
}

const chaptersByCourse = new Map<string, typeof chapters>();
for (const course of CHEM_COURSES) {
  chaptersByCourse.set(course.id, chapters.filter(ch => ch.id.startsWith(course.id + '_')));
}

const words: ListeningWord[] = rows.map(([rawLevel, word, meaning, exampleSentence, exampleTranslation], index) => {
  if (![rawLevel, word, meaning, exampleSentence, exampleTranslation].every(Boolean)) {
    throw new Error(`Incomplete row ${index + 1}: ${rawLevel}|${word}`);
  }
  const [courseId, rawTier = 'a'] = rawLevel.split(':');
  const course = CHEM_COURSES.find(c => c.id === courseId);
  if (!course) throw new Error(`Unknown course in ${rawLevel}`);
  const levelKey = `${course.id}_${rawTier}`;
  const id = `chem-term-${course.id}-${rawTier}-${String(index + 1).padStart(3, '0')}`;

  const sameLevel = rowsByLevel.get(rawLevel) ?? [];
  const sameTier = rowsByTier.get(rawTier) ?? rows;
  const candidatePool = sameLevel.length >= 4 ? sameLevel : [...sameLevel, ...sameTier];
  const selfIdx = Math.max(0, candidatePool.findIndex(r => r[1] === word));
  const position = index % 4;

  const pickDistractors = (col: number): string[] => {
    const picked: string[] = [];
    const targetVal = col === 1 ? word : meaning;
    const seen = new Set<string>([targetVal]);
    for (const offset of [1, 2, 3, 5, 7, 11, 13, 17, 23]) {
      if (picked.length >= 3) break;
      const cand = candidatePool[(selfIdx + offset) % candidatePool.length]?.[col];
      if (cand && !seen.has(cand)) {
        seen.add(cand);
        picked.push(cand);
      }
    }
    const result = [...picked];
    result.splice(position, 0, targetVal);
    if (new Set(result).size !== 4) throw new Error(`Ambiguous options ${id}`);
    return result;
  };

  // Match term or core headword against practiceProblems in the same course
  const searchTerms = word
    .replace(/（[^）]*）/g, '')
    .split(/[・／\s]+/)
    .map(s => s.trim())
    .filter(s => s.length >= 2);
  const courseChapters = chaptersByCourse.get(course.id) ?? [];
  const chapterIdsSet = new Set<string>();
  const examples: ListeningWord['examples'] = [];

  for (const chapter of courseChapters) {
    for (let problemIndex = 0; problemIndex < chapter.practiceProblems.length; problemIndex++) {
      const problem = chapter.practiceProblems[problemIndex]!;
      const haystack = `${problem.title ?? ''} ${problem.text} ${problem.subQuestions.map(sq => `${sq.label} ${(sq.optionTexts ?? []).join(' ')} ${sq.explainJa ?? ''}`).join(' ')}`;
      if (!searchTerms.some(term => haystack.includes(term))) continue;
      chapterIdsSet.add(chapter.id);
      if (examples.length < 1) {
        examples.push({
          chapterId: chapter.id,
          chapterTitle: `${course.shortLabel} ${chapter.abstractTitle}`,
          problemId: problem.id,
          problemIndex,
          script: problem.text.length > 210 ? problem.text.slice(0, 210) + '…' : problem.text,
          audioUrl: '',
          translation: '',
        });
      }
    }
  }

  return {
    id,
    word,
    meaning,
    fullMeaning: meaning,
    level: levelKey,
    exampleSentence,
    exampleTranslation,
    chapterIds: [...chapterIdsSet],
    examples,
    questions: [
      {
        id: `${id}:t2m`,
        prompt: `「${word}」の内容・定義として最も適切なものを選んでください。`,
        label: word,
        options: pickDistractors(2),
        answerIndex: position,
      },
      {
        id: `${id}:m2t`,
        prompt: `次の説明にあてはまる化学用語・法則を選んでください。\n「${meaning}」`,
        label: meaning,
        options: pickDistractors(1),
        answerIndex: position,
      },
    ],
  };
});

if (new Set(words.map(word => word.id)).size !== words.length) throw new Error('Duplicate word ID');
const data: VocabularyData = {
  wordCount: words.length,
  questionCount: words.reduce((n, word) => n + word.questions.length, 0),
  unitSize: 30,
  chapters: chapters.map(chapter => ({
    id: chapter.id,
    title: `${CHEM_COURSES.find(c => chapter.id.startsWith(c.id + '_'))!.shortLabel} ${chapter.abstractTitle}`,
  })),
  words,
};
writeFileSync('public/data/listeningVocabulary.json', JSON.stringify(data) + '\n');
writeFileSync(
  'src/data/listeningVocabularyMeta.generated.ts',
  `// Generated by scripts/build-eiken-wordbook.ts\nexport const VOCABULARY_COUNT = ${words.length};\n`,
);

const subjectIndex = CHEM_COURSES.map(course => ({
  id: course.id,
  label: course.label,
  chapters: partsForCourse(course.id).flatMap(part => part.chapters).map(chapter => ({
    id: chapter.id,
    title: chapter.title,
    abstractTitle: chapter.abstractTitle,
    realTitle: chapter.realTitle,
    problemCount: chapter.practiceProblems.length + chapter.miniTest.length,
  })),
}));

const stats = Object.fromEntries(
  CHEM_COURSES.map(course => {
    const list = partsForCourse(course.id).flatMap(part => part.chapters);
    const problems = list.flatMap(chapter => [...chapter.practiceProblems, ...chapter.miniTest]);
    return [
      course.id,
      {
        chapters: list.length,
        units: list.length,
        questions: problems.length,
        marks: problems.reduce((count, problem) => count + problem.subQuestions.length, 0),
      },
    ];
  }),
);

writeFileSync(
  'src/data/chapterIndex.generated.ts',
  `// Generated by scripts/build-eiken-wordbook.ts from Chemistry Common Test materials. Do not edit.\nexport interface ChapterIndexEntry { id: string; title?: string; abstractTitle?: string; realTitle?: string; problemCount: number }\nexport interface SubjectIndexEntry { id: string; label: string; chapters: readonly ChapterIndexEntry[] }\nexport interface SubjectStatsEntry { chapters?: number; questions?: number; sections?: number; units?: number; points?: number; marks?: number }\nexport const SUBJECT_INDEX: readonly SubjectIndexEntry[] = ${JSON.stringify(subjectIndex, null, 2)};\nexport const SUBJECT_STATS: Readonly<Record<string, SubjectStatsEntry>> = ${JSON.stringify(stats, null, 2)};\nexport function getChapterIndexOfSubject(subjectId: string | null | undefined): readonly ChapterIndexEntry[] {\n  return (SUBJECT_INDEX.find(subject => subject.id === subjectId) ?? SUBJECT_INDEX[0])?.chapters ?? [];\n}\nexport function getSubjectStats(subjectId: string | null | undefined): SubjectStatsEntry { return SUBJECT_STATS[String(subjectId)] ?? {}; }\n`,
);

console.log(
  `${words.length} chemistry terms/formulas, ${data.questionCount} quiz items, ${words.filter(word => word.examples.length).length} linked to Common Test exercises.`,
);
