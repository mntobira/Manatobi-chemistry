/**
 * 英検「短文の語句空所補充（大問1）」「会話文の空所補充」：1ページ5問ずつ・一括採点画面
 *
 * TOEIC Part 5（ToeicPageQuiz）と同じ見やすさ・操作感で、
 *   ・1ページ最大5問を PC 2列カード（1,2,3 が左列・4,5 が右列）／スマホ1列で一覧表示
 *   ・対話形式（`A: ... / B: ...`）は話者ピル付きターン表示で視認性を向上
 *   ・各カードの空所 `(     )` は下線枠で描き、選んだ語句が空所にプレビュー表示される
 *   ・下部「このページを採点する」でページの5問を一括採点し、正誤一覧・完成文再掲・解説を表示
 *   ・採点後は「全問／誤答・未回答のみ」フィルタ・一括解説開閉・ノート保存に対応
 *   ・最後のページを採点後「結果を見る」で既存の Explanation 結果画面へ進む
 *
 * 既存の進捗台帳・復習リスト・学習記録・XP/マナコイン・ステージ達成記録と完全互換。
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMountEffect } from '../hooks/useMountEffect';
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  ListChecks,
  MinusCircle,
  Slash,
  Square,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import type { Chapter, Problem, SubQuestion } from '../types/curriculum';
import { subjectTheme } from '../data/subjectTheme';
import { calcMaxCombo, comboMultiplier, scoreProblem, type ScoreBreakdown } from '../utils/scoring';
import { auth } from '../firebase';
import { notify } from '../utils/dialog';
import { FloatingScoreAnimation } from './FloatingScoreAnimation';
import { clearRun, loadRun, saveRun, type ChapterRunState } from '../utils/quizRunState';
import { resolveQuizRange } from '../utils/quizRange';
import { quizAnswersKey, quizExplKey, quizIndexKey, quizStepKey } from '../utils/quizStorageKeys';
import { markProblemSolved, parseStoredNonNegativeInteger, parseStoredStringRecord } from '../utils/progress';
import { recordUnitResult } from '../utils/unitStats';
import { schedulePush } from '../utils/studySync';
import { captureWrongAnswers, applyReviewRetry, noteCorrectAnswers, reviewKeyOf, type WrongAnswerInput } from '../utils/reviewList';
import { focusedSubIds, readReviewFocus } from '../utils/reviewFocus';
import { recordStudyLog } from '../utils/studyLog';
import { submitChapterScore } from '../utils/leaderboard';
import { stageKey } from '../utils/stageRecords';
import { recordStagePlayAndSync } from '../utils/stagePlay';
import { saveQuestionNote } from '../utils/questionNote';
import { safeGetItem, safeRemoveItem, readJsonArray } from '../utils/safeLocalStorage';
import { safeSetItem } from '../utils/storageGuard';
import { isAnswerCorrect } from '../utils/answerJudge';
import { formatText } from '../utils/textFormatter';
import { logRejection } from '../utils/reportError';
import {
  buildEikenClozePages,
  EIKEN_CLOZE_PER_PAGE,
  extractEikenGradeFromChapterId,
  pageFromProblemIndex,
  parseEikenClozeExplanation,
  prefersSingleColumnChoices,
  splitEikenDialogueTurns,
  type EikenClozeEntry,
} from './eikenClozePageModel';
import {
  extractMatchedEikenVocab,
  formatVocabGradeBadge,
  isSpeechSupported,
  speakEikenCompletedText,
  stopSpeech,
  useEikenVocabMap,
} from './eikenStudyHelpers';
import './eiken-cloze-page.css';

export interface EikenClozePageQuizProps {
  mode: 'mini_test' | 'practice';
  chapter: Chapter;
  onFinish: (answers: Record<string, string>, result?: ChapterRunState) => void;
  onBack: () => void;
  onReturnToBattle?: () => void;
  isGuest: boolean;
  onExplanationChange?: (isExplanation: boolean) => void;
  onScored?: (breakdown: ScoreBreakdown, meta: { timeLimit: number; timeUsed: number; questionId: string }) => void;
  questionRange?: { startIndex: number; endIndex: number } | null;
}

const MARK_KEYS: Record<string, number> = {
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 3,
  a: 0,
  b: 1,
  c: 2,
  d: 3,
};

function fmtClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** 1行（または1文）中の `(     )` / `( ___ )` を下線空所ボックスに変換して描画 */
export function InlineBlankLine({
  line,
  filled,
  correctWord,
  result,
}: {
  line: string;
  filled: string;
  correctWord?: string;
  result?: 'right' | 'wrong' | 'blank';
}) {
  const match = line.match(/\(\s*_{0,6}\s*\)/);
  if (!match || match.index === undefined) {
    return <span>{formatText(line, [], { prose: true, noMath: true })}</span>;
  }
  const before = line.slice(0, match.index);
  const after = line.slice(match.index + match[0].length);
  const showCorrection = (result === 'wrong' || result === 'blank') && Boolean(correctWord);
  return (
    <>
      {before && <span>{formatText(before, [], { prose: true, noMath: true })}</span>}
      {showCorrection ? (
        <span className="ecp-blank-compare" data-eiken-cloze-blank>
          {result === 'wrong' && filled && (
            <>
              <span className="ecp-blank" data-filled data-result="wrong">
                {formatText(filled, [], { prose: true, noMath: true })}
              </span>
              <span className="ecp-blank-arrow" aria-hidden="true">
                →
              </span>
            </>
          )}
          <span className="ecp-blank" data-filled data-result="right">
            {formatText(correctWord!, [], { prose: true, noMath: true })}
          </span>
        </span>
      ) : (
        <span
          className="ecp-blank"
          data-filled={filled ? true : undefined}
          data-result={result === 'blank' ? undefined : result}
          data-eiken-cloze-blank
        >
          {filled ? formatText(filled, [], { prose: true, noMath: true }) : <span className="ecp-sr">空所</span>}
        </span>
      )}
      {after && <span>{formatText(after, [], { prose: true, noMath: true })}</span>}
    </>
  );
}

/**
 * 問題文の描画。`A: ...\nB: ...` 形式の対話は話者ピル付きの会話ターンとして整形し、
 * 通常の1文は問番号バッジ＋インライン英文として描画する。
 */
export function EikenQuestionStem({
  displayNo,
  stem,
  filled,
  correctWord,
  result,
  unansweredTag,
  skillLabel,
  orderTokens,
  labelId,
}: {
  displayNo: number;
  stem: string;
  filled: string;
  correctWord?: string;
  result?: 'right' | 'wrong' | 'blank';
  unansweredTag?: boolean;
  skillLabel?: string;
  orderTokens?: string[];
  labelId: string;
}) {
  const turns = splitEikenDialogueTurns(stem);
  if (turns) {
    return (
      <div className="ecp-dialogue-wrap" id={labelId}>
        <div className="ecp-dialogue-head">
          <span className="ecp-no" aria-hidden="true">
            {displayNo}
          </span>
          <span className="ecp-sr">問{displayNo}　</span>
          <span className="ecp-dialogue-kicker">{skillLabel || '対話の空所補充'}</span>
          {unansweredTag && (
            <span className="ecp-tag" data-eiken-unanswered>
              未回答
            </span>
          )}
        </div>
        <div className="ecp-dialogue-turns">
          {turns.map((turn, tIdx) => (
            <div key={tIdx} className="ecp-turn" data-speaker={turn.speaker}>
              <span className="ecp-speaker-pill" data-speaker={turn.speaker} aria-hidden="true">
                {turn.speaker}
              </span>
              <span className="ecp-sr">{turn.speaker}: </span>
              <p className="ecp-turn-text" lang="en">
                <InlineBlankLine line={turn.text} filled={filled} correctWord={correctWord} result={result} />
              </p>
            </div>
          ))}
        </div>
        {orderTokens && orderTokens.length > 0 && (
          <div className="ecp-order-tokens" aria-label="並べ替え語群">
            {orderTokens.map((tok, i) => (
              <span key={i} className="ecp-order-chip" lang="en">
                <b>{i + 1}.</b> {formatText(tok, [], { prose: true, noMath: true })}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ecp-stem-block" id={labelId}>
      <p className="ecp-sentence">
        <span className="ecp-no" aria-hidden="true">
          {displayNo}
        </span>
        <span className="ecp-sr">問{displayNo}　</span>
        <span lang="en">
          <InlineBlankLine line={stem} filled={filled} correctWord={correctWord} result={result} />
        </span>
        {unansweredTag && (
          <span className="ecp-tag" data-eiken-unanswered>
            未回答
          </span>
        )}
      </p>
      {orderTokens && orderTokens.length > 0 && (
        <div className="ecp-order-tokens" aria-label="並べ替え語群">
          {orderTokens.map((tok, i) => (
            <span key={i} className="ecp-order-chip" lang="en">
              <b>{i + 1}.</b> {formatText(tok, [], { prose: true, noMath: true })}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function EikenClozePageQuiz({
  mode,
  chapter,
  onFinish,
  onBack,
  onReturnToBattle,
  isGuest,
  onExplanationChange,
  onScored,
  questionRange,
}: EikenClozePageQuizProps) {
  const questions: Problem[] = mode === 'mini_test' ? chapter.miniTest || [] : chapter.practiceProblems || [];
  const gradeId = useMemo(() => extractEikenGradeFromChapterId(chapter.id), [chapter.id]);
  const theme = subjectTheme(gradeId);

  const [run, setRun] = useState<ChapterRunState>(() => loadRun(chapter.id, mode));
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    parseStoredStringRecord(safeGetItem(quizAnswersKey(chapter.id, mode))),
  );

  const storedQuestionIndex = useMemo(
    () => parseStoredNonNegativeInteger(safeGetItem(quizIndexKey(chapter.id, mode)), Math.max(0, questions.length - 1)),
    [chapter.id, mode, questions.length],
  );
  const { rangeStart, rangeEnd } = resolveQuizRange(questions.length, questionRange, storedQuestionIndex);

  const pages = useMemo(
    () => buildEikenClozePages(questions, rangeStart, rangeEnd, EIKEN_CLOZE_PER_PAGE),
    [questions, rangeStart, rangeEnd],
  );
  const allEntries = useMemo(() => pages.flat(), [pages]);

  const [pageIndex, setPageIndex] = useState(() => {
    const rawStep = safeGetItem(quizStepKey(chapter.id, mode));
    if (rawStep !== null && rawStep !== '') {
      const parsed = parseStoredNonNegativeInteger(rawStep, Math.max(0, pages.length - 1));
      return Math.min(Math.max(0, parsed), Math.max(0, pages.length - 1));
    }
    return pageFromProblemIndex(pages, storedQuestionIndex);
  });

  const safePage = Math.min(Math.max(0, pageIndex), Math.max(0, pages.length - 1));
  const page = useMemo(() => pages[safePage] || [], [pages, safePage]);

  // ページ内の全問題が run.perQuestion に記録済みなら、そのページは採点済み
  const isPageScored = (idx: number) => {
    const target = pages[idx];
    if (!target || target.length === 0) return false;
    return target.every(entry => Boolean(run.perQuestion[entry.problem.id]));
  };
  const pageScored = isPageScored(safePage);
  const allScored = pages.length > 0 && pages.every((_, i) => isPageScored(i));
  const isLastPage = safePage >= pages.length - 1;

  const answeredCount = allEntries.filter(e => Boolean(answers[e.sq.id])).length;
  const unansweredEntriesOnPage = page.filter(e => !answers[e.sq.id]);
  const unansweredOnPage = unansweredEntriesOnPage.length;
  const pageCorrect = page.filter(e => isAnswerCorrect(e.sq, answers[e.sq.id] || '')).length;
  const pageWrongOrBlank = page.length - pageCorrect;

  // 採点後の表示フィルタ（ページ切替時は全問表示に戻す）
  const [scoredFilter, setScoredFilter] = useState<'all' | 'wrong'>('all');
  useEffect(() => {
    setScoredFilter('all');
  }, [safePage]);

  // 1問あたり40秒を目安として章全体の目安時間を算出（例：17問 → 約11分20秒、15問 → 10分）
  const totalLimitSec = Math.max(60, allEntries.length * 40);
  const [elapsedSec, setElapsedSec] = useState(() => Math.max(0, Math.round(run.totalTimeSec || 0)));
  const elapsedRef = useRef(elapsedSec);
  const pageStartSecRef = useRef(elapsedSec);

  useEffect(() => {
    if (allScored || allEntries.length === 0) return undefined;
    const id = window.setInterval(() => {
      setElapsedSec(prev => {
        const next = prev + 1;
        elapsedRef.current = next;
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [allScored, allEntries.length]);

  // localStorage 永続化
  useEffect(() => {
    safeSetItem(quizAnswersKey(chapter.id, mode), JSON.stringify(answers));
  }, [answers, chapter.id, mode]);

  useEffect(() => {
    safeSetItem(quizStepKey(chapter.id, mode), String(safePage));
    const firstIdx = pages[safePage]?.[0]?.problemIndex ?? 0;
    safeSetItem(quizIndexKey(chapter.id, mode), String(firstIdx));
  }, [safePage, pages, chapter.id, mode]);

  useEffect(() => {
    safeSetItem(quizExplKey(chapter.id, mode), 'false');
  }, [chapter.id, mode]);

  useMountEffect(() => {
    onExplanationChange?.(false);
    void import('../battle/data/growthStore')
      .then(({ resetStudySession }) => resetStudySession())
      .catch(logRejection('growth.resetStudySession'));
  });

  // 得点アニメーション
  const [scoreFx, setScoreFx] = useState<{ breakdown: ScoreBreakdown; totalScore: number } | null>(null);
  const [showFx, setShowFx] = useState(false);
  useEffect(() => {
    if (!showFx) return undefined;
    const t = window.setTimeout(() => setShowFx(false), 3200);
    return () => window.clearTimeout(t);
  }, [showFx]);

  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [openEx, setOpenEx] = useState<Record<string, boolean>>({});
  const [openReasons, setOpenReasons] = useState<Record<string, boolean>>({});
  const [eliminated, setEliminated] = useState<Record<string, string[]>>({});
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const canSpeak = useMemo(() => isSpeechSupported(), []);
  const vocabMap = useEikenVocabMap(pageScored);

  useEffect(() => {
    setSpeakingKey(null);
    stopSpeech();
    return () => stopSpeech();
  }, [safePage, chapter.id]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollTop = () => scrollRef.current?.scrollTo({ top: 0 });

  // ノート保存状態
  const noteUid = auth.currentUser?.uid || 'guest';
  const [savedNotes, setSavedNotes] = useState<Record<string, boolean>>(() => {
    const existing = readJsonArray<{ chapterId?: string; questionId?: string }>(`notes_${noteUid}`);
    const map: Record<string, boolean> = {};
    for (const n of existing) {
      if (n && n.chapterId === chapter.id && n.questionId) {
        map[n.questionId] = true;
      }
    }
    return map;
  });

  const handleSaveNote = (entry: EikenClozeEntry) => {
    if (savedNotes[entry.problem.id]) return;
    try {
      saveQuestionNote({
        uid: noteUid,
        question: entry.problem,
        chapter,
        questionIndex: entry.displayNo,
      });
      setSavedNotes(prev => ({ ...prev, [entry.problem.id]: true }));
      notify(
        isGuest
          ? 'ノートに保存しました！（ゲスト利用のため、この端末にだけ保存されます）'
          : 'ノートに保存しました！',
      );
    } catch {
      notify('保存に失敗しました。');
    }
  };

  const selectChoice = (sq: SubQuestion, mark: string) => {
    if (pageScored) return;
    setAnswers(prev => {
      const next = { ...prev };
      if (next[sq.id] === mark) delete next[sq.id];
      else next[sq.id] = mark;
      return next;
    });
    // 選んだ肢に消去スラッシュが付いていたら自動で外す
    setEliminated(prev => {
      const cur = prev[sq.id];
      if (!cur || !cur.includes(mark)) return prev;
      return { ...prev, [sq.id]: cur.filter(m => m !== mark) };
    });
  };

  const toggleEliminate = (sq: SubQuestion, mark: string) => {
    if (pageScored) return;
    setEliminated(prev => {
      const cur = prev[sq.id] || [];
      const exists = cur.includes(mark);
      const nextMarks = exists ? cur.filter(m => m !== mark) : [...cur, mark];
      return { ...prev, [sq.id]: nextMarks };
    });
    // 選択中だった肢を消去した場合は選択を解除する
    setAnswers(prev => {
      if (prev[sq.id] !== mark) return prev;
      const next = { ...prev };
      delete next[sq.id];
      return next;
    });
  };

  const handleToggleSpeak = (id: string, stem: string, word: string, completed: string, rate = 1) => {
    const key = `${id}:${rate}`;
    if (speakingKey === key) {
      stopSpeech();
      setSpeakingKey(null);
      return;
    }
    setSpeakingKey(key);
    const ok = speakEikenCompletedText(key, stem, word, completed, {
      rate,
      onEnd: () => setSpeakingKey(cur => (cur === key ? null : cur)),
    });
    if (!ok) setSpeakingKey(null);
  };

  const scoreCurrentPage = () => {
    if (pageScored || page.length === 0) return;
    setAttempted(prev => ({ ...prev, [safePage]: true }));

    const pageTimeUsed = Math.max(0, elapsedRef.current - pageStartSecRef.current);
    pageStartSecRef.current = elapsedRef.current;
    const perItemTimeUsed = Math.max(1, Math.round(pageTimeUsed / Math.max(1, page.length)));
    const perItemLimit = 40;

    let workingRun: ChapterRunState = { ...run };
    let pageAddedScore = 0;
    let pageCorrectCount = 0;
    let pageJudgeableCount = 0;
    const uid = auth.currentUser?.uid || (isGuest ? 'guest' : null);
    const wrongInputs: WrongAnswerInput[] = [];
    const correctReviewKeys: string[] = [];

    for (const entry of page) {
      const { problem, sq, problemIndex } = entry;
      if (workingRun.perQuestion[problem.id]) continue;

      const subs = [sq];
      const maxCombo = calcMaxCombo(subs, answers);
      const bd = scoreProblem(subs, answers, {
        timeLimit: perItemLimit,
        timeUsed: perItemTimeUsed,
        maxCombo,
        runningCombo: workingRun.runningCombo,
      });
      const mult = comboMultiplier(workingRun.runningCombo);
      const boosted = Math.floor(bd.finalScore * mult);
      const finalBd: ScoreBreakdown = { ...bd, finalScore: boosted };
      const ok = bd.judgeableCount > 0 && bd.correctCount === bd.judgeableCount;
      const nextCombo = ok ? workingRun.runningCombo + 1 : 0;

      workingRun = {
        ...workingRun,
        totalScore: workingRun.totalScore + boosted,
        runningCombo: nextCombo,
        totalCorrect: workingRun.totalCorrect + bd.correctCount,
        totalJudgeable: workingRun.totalJudgeable + bd.judgeableCount,
        totalTimeSec: workingRun.totalTimeSec + perItemTimeUsed,
        perQuestion: {
          ...workingRun.perQuestion,
          [problem.id]: { ...finalBd, timeLimit: perItemLimit, timeUsed: perItemTimeUsed },
        },
      };

      pageAddedScore += boosted;
      pageCorrectCount += bd.correctCount;
      pageJudgeableCount += bd.judgeableCount;

      try {
        markProblemSolved(uid, chapter.id, problem.id, boosted);
        if (uid && boosted >= 1) {
          const gKey = `${chapter.id}::${problem.id}`;
          void import('../battle/data/growthStore')
            .then(({ recordStudyGrowth }) => recordStudyGrowth(uid, gKey, { timeUsed: perItemTimeUsed, timeLimit: perItemLimit }))
            .catch(logRejection('growth.recordStudy'));
        } else if (uid) {
          void import('../battle/data/growthStore')
            .then(({ breakStudyStreak }) => breakStudyStreak())
            .catch(logRejection('growth.breakStreak'));
        }
      } catch {
        /* 進捗記録エラーで学習を止めない */
      }

      if (uid) {
        if (isAnswerCorrect(sq, answers[sq.id])) {
          correctReviewKeys.push(reviewKeyOf(chapter.id, problem.id, String(sq.id)));
        } else {
          wrongInputs.push({
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            questionIndex: problemIndex + 1,
            questionId: problem.id,
            subLabel: sq.label,
            subQuestionId: sq.id,
            questionText: problem.text,
            correctAnswer: sq.correctAnswer,
            wrongAnswer: (answers[sq.id] || '').trim(),
          });
        }

        try {
          const unitTitle = String(chapter.abstractTitle || chapter.realTitle || chapter.title || chapter.id);
          recordStudyLog(uid, {
            key: `study:${chapter.id}:${problem.id}:${new Date().toDateString()}`,
            kind: 'study',
            at: Date.now(),
            chapterId: chapter.id,
            questionId: problem.id,
            title: unitTitle,
            sub: String(problem.title || `問${entry.displayNo}`),
            items: [
              {
                id: String(sq.id),
                label: `問${entry.displayNo}`,
                correct: isAnswerCorrect(sq, answers[sq.id]),
                answer: isAnswerCorrect(sq, answers[sq.id]) ? undefined : String(sq.correctAnswer ?? ''),
              },
            ],
          });
          const focusIds = focusedSubIds(readReviewFocus(), chapter.id, problem.id);
          if (focusIds && focusIds.includes(String(sq.id))) {
            applyReviewRetry(uid, chapter.id, problem.id, [
              { subQuestionId: String(sq.id), correct: isAnswerCorrect(sq, answers[sq.id]) },
            ]);
          }
        } catch {
          /* ignore log errors */
        }
      }
    }

    try {
      if (uid && pageJudgeableCount > 0) {
        recordUnitResult(uid, chapter.id, pageCorrectCount, pageJudgeableCount);
      }
      if (uid && wrongInputs.length > 0) {
        captureWrongAnswers(uid, wrongInputs);
      }
      if (uid && correctReviewKeys.length > 0) {
        noteCorrectAnswers(uid, correctReviewKeys);
      }
      schedulePush();
    } catch {
      /* ignore sync errors */
    }

    setRun(workingRun);
    saveRun(chapter.id, mode, workingRun);

    const pageSubs = page.map(e => e.sq);
    const pageSummaryBd = scoreProblem(pageSubs, answers, {
      timeLimit: page.length * perItemLimit,
      timeUsed: pageTimeUsed,
      maxCombo: calcMaxCombo(pageSubs, answers),
      runningCombo: workingRun.runningCombo,
    });
    const displayBd: ScoreBreakdown = { ...pageSummaryBd, finalScore: pageAddedScore };

    if (onScored && page[0]) {
      onScored(displayBd, {
        timeLimit: page.length * perItemLimit,
        timeUsed: pageTimeUsed,
        questionId: page[0].problem.id,
      });
    }

    if (pageAddedScore > 0) {
      setScoreFx({ breakdown: displayBd, totalScore: pageAddedScore });
      setShowFx(true);
    }
    scrollTop();
  };

  const finishChapter = () => {
    const latest = loadRun(chapter.id, mode);
    try {
      const single = questionRange && rangeStart === rangeEnd ? questions[rangeStart] : null;
      const unitTitle = String(chapter.abstractTitle || chapter.title || chapter.id);
      recordStagePlayAndSync(
        auth.currentUser?.uid || 'guest',
        stageKey(chapter.id, single?.id),
        single ? `${unitTitle} ${single.title || `第${rangeStart + 1}問`}` : unitTitle,
        latest.totalCorrect,
        latest.totalJudgeable,
      );
    } catch {
      /* ignore stage play error */
    }

    if (!isGuest) {
      const correctRate = latest.totalJudgeable > 0 ? latest.totalCorrect / latest.totalJudgeable : 0;
      void submitChapterScore({
        chapterId: chapter.id,
        score: latest.totalScore,
        correctRate,
        totalCorrect: latest.totalCorrect,
        totalQuestions: latest.totalJudgeable,
        timeUsedSec: latest.totalTimeSec,
      }).catch(() => undefined);
    }

    clearRun(chapter.id, mode);
    safeRemoveItem(quizAnswersKey(chapter.id, mode));
    safeRemoveItem(quizStepKey(chapter.id, mode));
    safeRemoveItem(quizIndexKey(chapter.id, mode));
    safeRemoveItem(quizExplKey(chapter.id, mode));
    onFinish(answers, latest);
  };

  const goPage = (targetIdx: number) => {
    const next = Math.min(Math.max(0, targetIdx), Math.max(0, pages.length - 1));
    setPageIndex(next);
    scrollTop();
  };

  const handleForward = () => {
    if (!pageScored) {
      scoreCurrentPage();
      return;
    }
    if (!isLastPage) {
      goPage(safePage + 1);
      return;
    }
    finishChapter();
  };

  const jumpToQuestion = (sqId: string) => {
    if (pageScored && scoredFilter === 'wrong') {
      const targetEntry = page.find(e => e.sq.id === sqId);
      if (targetEntry && isAnswerCorrect(targetEntry.sq, answers[sqId] || '')) {
        setScoredFilter('all');
        window.requestAnimationFrame(() => {
          const el = document.getElementById(`ecp-item-${sqId}`);
          el?.scrollIntoView({ block: 'start', behavior: 'auto' });
          groupRefs.current[sqId]?.focus({ preventScroll: true });
        });
        return;
      }
    }
    const el = document.getElementById(`ecp-item-${sqId}`);
    el?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
    groupRefs.current[sqId]?.focus({ preventScroll: true });
  };

  const jumpToFirstUnanswered = () => {
    const first = unansweredEntriesOnPage[0];
    if (first) jumpToQuestion(first.sq.id);
  };

  const toggleAllExplanations = (nextOpen: boolean) => {
    const patch: Record<string, boolean> = {};
    for (const entry of page) {
      patch[entry.sq.id] = nextOpen;
    }
    setOpenEx(prev => ({ ...prev, ...patch }));
  };

  const onGroupKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, sq: SubQuestion, idx: number) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const digitFromCode = e.code.startsWith('Digit') ? e.code.slice(5) : '';
    const k = (digitFromCode || e.key).toLowerCase();
    if (k in MARK_KEYS) {
      const mark = sq.options[MARK_KEYS[k]];
      if (mark) {
        e.preventDefault();
        if (e.shiftKey) toggleEliminate(sq, mark);
        else selectChoice(sq, mark);
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const target = page[idx + (e.key === 'ArrowDown' ? 1 : -1)];
      if (target) {
        e.preventDefault();
        groupRefs.current[target.sq.id]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && safePage > 0) {
      e.preventDefault();
      goPage(safePage - 1);
    } else if (e.key === 'ArrowRight' && safePage < pages.length - 1) {
      e.preventDefault();
      goPage(safePage + 1);
    } else if (e.key === 'Enter') {
      if (!pageScored && unansweredOnPage === 0) {
        e.preventDefault();
        scoreCurrentPage();
      } else if (pageScored) {
        e.preventDefault();
        handleForward();
      }
    }
  };

  if (allEntries.length === 0) {
    return (
      <div className="ecp-root" data-eiken-cloze-quiz>
        <p className="ecp-empty">この回の問題は準備中です。</p>
        <button type="button" className="ecp-btn ecp-btn-sub" onClick={onBack}>
          戻る
        </button>
      </div>
    );
  }

  const remainingSec = totalLimitSec - elapsedSec;
  const timerState = allScored ? 'done' : remainingSec < 0 ? 'over' : remainingSec < totalLimitSec * 0.2 ? 'low' : 'run';
  const timerPct = Math.max(0, Math.min(100, (elapsedSec / totalLimitSec) * 100));
  const forwardLabel = !pageScored ? 'このページを採点する' : !isLastPage ? '次のページ' : '結果を見る';
  const headerTitle = chapter.realTitle
    ? `${chapter.realTitle.replace(/^大問\d+\s*/, '')}｜${chapter.abstractTitle}`
    : chapter.abstractTitle;

  const visibleEntries =
    pageScored && scoredFilter === 'wrong'
      ? page.filter(e => !isAnswerCorrect(e.sq, answers[e.sq.id] || ''))
      : page;

  const allExOpen =
    visibleEntries.length > 0 &&
    visibleEntries.every(e => {
      const ok = isAnswerCorrect(e.sq, answers[e.sq.id] || '');
      return openEx[e.sq.id] ?? !ok;
    });

  return (
    <div
      className="ecp-root"
      data-eiken-cloze-quiz
      style={theme.accent ? ({ '--ecp-accent': theme.accent } as React.CSSProperties) : undefined}
    >
      {scoreFx && (
        <FloatingScoreAnimation
          breakdown={scoreFx.breakdown}
          totalScore={scoreFx.totalScore}
          isVisible={showFx}
        />
      )}

      {onReturnToBattle && (
        <button type="button" onClick={onReturnToBattle} className="ecp-battle-return">
          バトル結果・解説に戻る
        </button>
      )}

      {/* 上部ヘッダー帯（TOEIC Part 5 / QuizHeader と同じクリーム帯） */}
      <header className="ecp-head" data-quiz-header>
        <button
          type="button"
          className="ecp-back"
          onClick={onBack}
          aria-label="単元選択に戻る"
          title="単元選択に戻る"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <span className="ecp-mode">{mode === 'mini_test' ? '小テスト' : '演習'}</span>
        <h2 className="ecp-title">{headerTitle}</h2>

        <dl className="ecp-stats">
          <div title="いまのページ／全ページ">
            <dt>
              <FileText size={14} aria-hidden="true" />
              <span className="ecp-sr">ページ</span>
            </dt>
            <dd data-eiken-page-pos>
              <b>{safePage + 1}</b>/{pages.length}
              <small>ページ</small>
            </dd>
          </div>
          <div title="答えた問題／全問題">
            <dt>
              <ListChecks size={14} aria-hidden="true" />
              <span className="ecp-sr">回答済み</span>
            </dt>
            <dd data-eiken-answered>
              <b>{answeredCount}</b>/{allEntries.length}
              <small>問</small>
            </dd>
          </div>
        </dl>
      </header>

      {/* タイマー＋ページ番号ステップインジケータ */}
      <div className="ecp-subbar" data-state={timerState}>
        <div className="ecp-subbar-row">
          <p className="ecp-timer-label" role="timer">
            <Clock size={13} aria-hidden="true" />
            <span>
              {timerState === 'done'
                ? `所要時間 ${fmtClock(elapsedSec)}`
                : timerState === 'over'
                ? `経過 ${fmtClock(elapsedSec)}（目安 ${fmtClock(totalLimitSec)} 超過）`
                : `経過 ${fmtClock(elapsedSec)} ・ 残り ${fmtClock(remainingSec)}`}
            </span>
            {timerState !== 'done' && timerState !== 'over' && (
              <span className="ecp-timer-limit">／ {fmtClock(totalLimitSec)}</span>
            )}
          </p>

          {pages.length > 1 && (
            <ol className="ecp-page-pills" aria-label={`${pages.length}ページ中${safePage + 1}ページ目`}>
              {pages.map((pItems, idx) => {
                const done = isPageScored(idx);
                const current = idx === safePage;
                const partial = !done && !current && pItems.some(e => Boolean(answers[e.sq.id]));
                const rangeText =
                  pItems.length > 0
                    ? `問${pItems[0].displayNo}〜${pItems[pItems.length - 1].displayNo}`
                    : `ページ${idx + 1}`;
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      className="ecp-page-pill"
                      data-progress={current ? 'current' : done ? 'done' : partial ? 'partial' : 'future'}
                      aria-current={current ? 'step' : undefined}
                      aria-label={`ページ${idx + 1}（${rangeText}）${done ? ' 採点済み' : current ? ' 現在' : ''}`}
                      title={`ページ${idx + 1}（${rangeText}）`}
                      onClick={() => goPage(idx)}
                    >
                      {done && !current ? '✓' : idx + 1}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* このページ内の5問クイックジャンプ＋消去法ワンポイント案内 */}
        <div className="ecp-subbar-qstrip">
          <ol className="ecp-q-dots" aria-label="このページの設問へ移動">
            {page.map(entry => {
              const chosen = answers[entry.sq.id] || '';
              const elimCount = (eliminated[entry.sq.id] || []).length;
              const qState = !pageScored
                ? chosen
                  ? 'answered'
                  : elimCount > 0
                  ? 'working'
                  : 'todo'
                : !chosen
                ? 'blank'
                : isAnswerCorrect(entry.sq, chosen)
                ? 'correct'
                : 'wrong';
              return (
                <li key={entry.sq.id}>
                  <button
                    type="button"
                    className="ecp-q-dot"
                    data-qstate={qState}
                    onClick={() => jumpToQuestion(entry.sq.id)}
                    title={`問${entry.displayNo}へ移動`}
                  >
                    <span>問{entry.displayNo}</span>
                    {pageScored && (
                      <em aria-hidden="true">
                        {qState === 'correct' ? '○' : qState === 'wrong' ? '×' : '−'}
                      </em>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          {!pageScored && (
            <span className="ecp-elim-tip">
              <Slash size={11} aria-hidden="true" />
              <span>右クリック・×で選択肢を消去できます</span>
            </span>
          )}
        </div>

        <div className="ecp-timer-track" aria-hidden="true">
          <div className="ecp-timer-fill" style={{ width: `${timerPct}%` }} />
        </div>
      </div>

      {/* メインスクロール領域：1ページ5問ずつカード表示 */}
      <div className="ecp-scroll" ref={scrollRef}>
        {pageScored && (
          <section
            className="ecp-result"
            aria-label="このページの結果"
            data-eiken-page-result
            data-perfect={pageCorrect === page.length || undefined}
          >
            <div className="ecp-result-top">
              <p className="ecp-result-score" role="status">
                <CheckCircle2 size={20} aria-hidden="true" />
                <span>このページ</span>
                <b>{pageCorrect}</b>
                <span>/{page.length}問正解</span>
                {pageCorrect === page.length && <span className="ecp-perfect-pill">PERFECT!</span>}
              </p>

              <div className="ecp-result-tools">
                {pageWrongOrBlank > 0 && (
                  <div className="ecp-result-filter" role="group" aria-label="表示の絞り込み">
                    <button
                      type="button"
                      className="ecp-tool-pill"
                      data-active={scoredFilter === 'all' || undefined}
                      onClick={() => setScoredFilter('all')}
                    >
                      全問 ({page.length})
                    </button>
                    <button
                      type="button"
                      className="ecp-tool-pill"
                      data-active={scoredFilter === 'wrong' || undefined}
                      onClick={() => setScoredFilter('wrong')}
                    >
                      誤答・未回答 ({pageWrongOrBlank})
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="ecp-tool-pill is-ghost"
                  onClick={() => toggleAllExplanations(!allExOpen)}
                >
                  {allExOpen ? '解説をすべて閉じる' : '解説をすべて開く'}
                </button>
              </div>
            </div>

            <ol
              className="ecp-result-marks"
              aria-label="問題ごとの正誤（押すとその問題へ移動）"
              style={{ gridTemplateColumns: `repeat(${Math.max(1, page.length)}, minmax(0, 1fr))` }}
            >
              {page.map(entry => {
                const chosen = answers[entry.sq.id] || '';
                const st = !chosen ? 'blank' : isAnswerCorrect(entry.sq, chosen) ? 'correct' : 'wrong';
                return (
                  <li key={entry.sq.id}>
                    <button
                      type="button"
                      className="ecp-result-mark"
                      data-result={st}
                      onClick={() => jumpToQuestion(entry.sq.id)}
                      aria-label={`問${entry.displayNo} ${
                        st === 'correct' ? '正解' : st === 'wrong' ? '不正解' : '未回答'
                      }`}
                    >
                      <span className="ecp-result-no">問{entry.displayNo}</span>
                      <span className="ecp-result-sym" aria-hidden="true">
                        {st === 'correct' ? '○' : st === 'wrong' ? '×' : '−'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <div
          className={`ecp-list${pageScored ? ' is-scored' : ''}`}
          data-eiken-cloze-page={safePage + 1}
          data-page-count={visibleEntries.length}
        >
          {visibleEntries.map((entry, idx) => {
            const { problem, sq, displayNo } = entry;
            const chosen = answers[sq.id] || '';
            const texts = sq.optionTexts || [];
            const ok = pageScored && isAnswerCorrect(sq, chosen);
            const status = !pageScored
              ? chosen
                ? 'answered'
                : attempted[safePage]
                ? 'unanswered'
                : 'todo'
              : !chosen
              ? 'blank'
              : ok
              ? 'correct'
              : 'wrong';
            const filled = chosen ? texts[sq.options.indexOf(chosen)] ?? '' : '';
            const ex = pageScored ? parseEikenClozeExplanation(entry) : null;
            const isExOpen = openEx[sq.id] ?? status !== 'correct';
            const labelId = `ecp-q-${sq.id}`;
            const singleCol = prefersSingleColumnChoices(texts);

            return (
              <article
                key={sq.id}
                id={`ecp-item-${sq.id}`}
                className="ecp-item"
                data-status={status}
                data-eiken-question={displayNo}
              >
                <EikenQuestionStem
                  displayNo={displayNo}
                  stem={problem.text}
                  filled={filled}
                  correctWord={ex?.correctWord}
                  result={pageScored ? (ok ? 'right' : chosen ? 'wrong' : 'blank') : undefined}
                  unansweredTag={status === 'unanswered' || status === 'blank'}
                  labelId={labelId}
                />

                <div
                  role="radiogroup"
                  aria-labelledby={labelId}
                  aria-disabled={pageScored || undefined}
                  tabIndex={0}
                  ref={el => {
                    groupRefs.current[sq.id] = el;
                  }}
                  onKeyDown={e => onGroupKeyDown(e, sq, idx)}
                  className={`ecp-choices${singleCol ? ' is-single' : ''}${pageScored ? ' is-scored' : ''}`}
                >
                  {sq.options.map((mark, i) => {
                    const checked = chosen === mark;
                    const isEliminated = !pageScored && (eliminated[sq.id] || []).includes(mark);
                    const isRight = pageScored && mark === sq.correctAnswer;
                    const isWrongPick = pageScored && checked && !isRight;
                    const text = texts[i] ?? mark;
                    return (
                      <div
                        key={mark}
                        role="radio"
                        aria-checked={checked}
                        aria-disabled={pageScored || undefined}
                        aria-label={`${mark} ${text} ／${
                          isRight && checked
                            ? '（あなたの答え・正解）'
                            : isRight
                            ? '（正解）'
                            : isWrongPick
                            ? '（あなたの答え）'
                            : isEliminated
                            ? '（消去メモ中）'
                            : ''
                        }`}
                        tabIndex={-1}
                        className="ecp-choice"
                        data-checked={checked || undefined}
                        data-eliminated={isEliminated || undefined}
                        data-result={isRight ? 'right' : isWrongPick ? 'wrong' : undefined}
                        onClick={() => selectChoice(sq, mark)}
                        onContextMenu={e => {
                          if (pageScored) return;
                          e.preventDefault();
                          toggleEliminate(sq, mark);
                        }}
                      >
                        <span className="ecp-bubble" aria-hidden="true">
                          {mark}
                        </span>
                        <span className="ecp-choice-body" aria-hidden="true">
                          <span className="ecp-choice-text" lang="en">
                            {formatText(text, [], { prose: true, noMath: true })}
                          </span>
                        </span>
                        {(isRight || isWrongPick) && (
                          <span
                            className="ecp-choice-badge"
                            data-tone={isRight ? 'right' : 'wrong'}
                            aria-hidden="true"
                          >
                            {isRight && checked ? 'あなた・正解' : isRight ? '正解' : 'あなた'}
                          </span>
                        )}
                        {checked && !pageScored && (
                          <Check size={17} strokeWidth={3} className="ecp-choice-check" aria-hidden="true" />
                        )}
                        {!pageScored && !checked && (
                          <button
                            type="button"
                            className="ecp-elim-btn"
                            data-active={isEliminated || undefined}
                            aria-label={`選択肢${mark}を${isEliminated ? '消去解除' : '消去する'}`}
                            title={isEliminated ? '消去メモを解除' : 'この選択肢を消去（右クリックでも可）'}
                            tabIndex={-1}
                            onClick={e => {
                              e.stopPropagation();
                              toggleEliminate(sq, mark);
                            }}
                          >
                            <X size={13} strokeWidth={2.5} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {pageScored && ex && (
                  <div className="ecp-compact-review">
                    <details
                      className="ecp-ex ecp-ex-compact"
                      open={isExOpen || undefined}
                      onToggle={e => {
                        const nextOpen = (e.currentTarget as HTMLDetailsElement).open;
                        if (nextOpen !== isExOpen) {
                          setOpenEx(prev => ({ ...prev, [sq.id]: nextOpen }));
                        }
                      }}
                    >
                      <summary className="ecp-ex-summary">
                        <span className="ecp-judge" data-result={status}>
                          {status === 'correct' ? (
                            <CheckCircle2 size={15} aria-hidden="true" />
                          ) : status === 'wrong' ? (
                            <XCircle size={15} aria-hidden="true" />
                          ) : (
                            <MinusCircle size={15} aria-hidden="true" />
                          )}
                          <span>
                            {status === 'correct'
                              ? '正解'
                              : status === 'wrong'
                              ? `不正解（正解 ${sq.correctAnswer}）`
                              : `未回答（正解 ${sq.correctAnswer}）`}
                          </span>
                        </span>
                        <span className="ecp-ex-toggle-hint">
                          {isExOpen ? '解説を閉じる' : '訳・解説を見る'}
                        </span>
                        <ChevronDown size={15} className="ecp-ex-chev" aria-hidden="true" />
                      </summary>

                      <div className="ecp-ex-body">
                        {ex.translation && (
                          <div className="ecp-ex-line" data-role="tr">
                            <span className="ecp-ex-tag" data-role="tr">
                              和訳
                            </span>
                            <p className="ecp-ex-text">{formatText(ex.translation, [], { prose: true, noMath: true })}</p>
                          </div>
                        )}

                        {ex.why && (
                          <div className="ecp-ex-line" data-role="why">
                            <span className="ecp-ex-tag" data-role="why">
                              要点
                            </span>
                            <p className="ecp-ex-text">{formatText(ex.why, [], { prose: true, noMath: true })}</p>
                          </div>
                        )}

                        <div className="ecp-ex-subtools">
                          {canSpeak && ex.correctWord && (
                            <div className="ecp-recap-audio" lang="ja">
                              <button
                                type="button"
                                className="ecp-speak-btn"
                                data-speaking={speakingKey === `${sq.id}:1` || undefined}
                                onClick={() =>
                                  handleToggleSpeak(sq.id, ex.stem, ex.correctWord, ex.completedSentence, 1)
                                }
                                title="完成文の英語音声を再生"
                              >
                                {speakingKey === `${sq.id}:1` ? (
                                  <Square size={11} aria-hidden="true" />
                                ) : (
                                  <Volume2 size={12} aria-hidden="true" />
                                )}
                                <span>{speakingKey === `${sq.id}:1` ? '停止' : '英文を聞く'}</span>
                              </button>
                              <button
                                type="button"
                                className="ecp-speak-btn is-slow"
                                data-speaking={speakingKey === `${sq.id}:0.8` || undefined}
                                onClick={() =>
                                  handleToggleSpeak(sq.id, ex.stem, ex.correctWord, ex.completedSentence, 0.8)
                                }
                                title="ゆっくり再生（0.8倍速）"
                              >
                                <span>{speakingKey === `${sq.id}:0.8` ? '停止' : '0.8x'}</span>
                              </button>
                            </div>
                          )}

                          {ex.choices.some(c => Boolean(c.reason)) && (
                            <button
                              type="button"
                              className="ecp-reasons-toggle-btn"
                              aria-expanded={Boolean(openReasons[sq.id])}
                              onClick={() =>
                                setOpenReasons(prev => ({ ...prev, [sq.id]: !prev[sq.id] }))
                              }
                            >
                              <span>他の選択肢の理由</span>
                              <ChevronDown
                                size={14}
                                className={`ecp-fold-chev${openReasons[sq.id] ? ' is-open' : ''}`}
                                aria-hidden="true"
                              />
                            </button>
                          )}
                        </div>

                        {openReasons[sq.id] && ex.choices.some(c => Boolean(c.reason)) && (
                          <ul className="ecp-ex-choices">
                            {ex.choices.map(c => (
                              <li key={c.mark} data-correct={c.correct || undefined}>
                                <span className="ecp-ex-mark" aria-hidden="true">
                                  {c.correct ? '○' : '×'}
                                </span>
                                <span>
                                  <b lang="en">
                                    {c.mark}. {formatText(c.text, [], { prose: true, noMath: true })}
                                  </b>
                                  {c.reason ? (
                                    <> — {formatText(c.reason, [], { prose: true, noMath: true })}</>
                                  ) : c.correct ? (
                                    ' — 正解'
                                  ) : null}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {(() => {
                          const vocabHits = extractMatchedEikenVocab(vocabMap, texts, [ex.stem], 3);
                          if (vocabHits.length === 0) return null;
                          return (
                            <div className="ecp-vocab-chips" aria-label="重要語チェック">
                              <BookOpen size={12} className="ecp-vocab-icon" aria-hidden="true" />
                              {vocabHits.map(v => {
                                const vKey = `vocab:${sq.id}:${v.word}`;
                                const isSpeakingWord = speakingKey === `${vKey}:1`;
                                return (
                                  <button
                                    key={v.word}
                                    type="button"
                                    className="ecp-vocab-chip"
                                    data-speaking={isSpeakingWord || undefined}
                                    onClick={() => {
                                      if (!canSpeak) return;
                                      handleToggleSpeak(vKey, v.word, '', v.word, 1);
                                    }}
                                    title={
                                      v.exampleSentence
                                        ? `例文: ${v.exampleSentence}`
                                        : canSpeak
                                        ? `${v.word} の発音を聞く`
                                        : v.word
                                    }
                                  >
                                    {canSpeak && <Volume2 size={11} aria-hidden="true" />}
                                    <strong lang="en">{v.word}</strong>
                                    <span>{v.meaning}</span>
                                    <small>{formatVocabGradeBadge(v.level)}</small>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </details>

                    <button
                      type="button"
                      className="ecp-save ecp-save-compact"
                      data-saved={savedNotes[problem.id] || undefined}
                      disabled={Boolean(savedNotes[problem.id])}
                      onClick={() => handleSaveNote(entry)}
                      title={savedNotes[problem.id] ? '学習ノートに保存済み' : 'この問題を学習ノートに保存'}
                    >
                      {savedNotes[problem.id] ? (
                        <BookmarkCheck size={14} aria-hidden="true" />
                      ) : (
                        <Bookmark size={14} aria-hidden="true" />
                      )}
                      <span>{savedNotes[problem.id] ? '保存済' : 'ノート保存'}</span>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* 下部固定フッター（「前のページ」・未回答ジャンプピル・「このページを採点する」） */}
      <footer className="ecp-foot">
        <button
          type="button"
          className="ecp-btn ecp-btn-sub"
          onClick={() => goPage(safePage - 1)}
          disabled={safePage === 0}
        >
          <ChevronLeft size={18} aria-hidden="true" />
          <span>前のページ</span>
        </button>

        {!pageScored &&
          (unansweredOnPage > 0 ? (
            <button
              type="button"
              className="ecp-unanswered ecp-unanswered-btn"
              onClick={jumpToFirstUnanswered}
              title="最初の未回答問題へ移動"
              data-eiken-unanswered-count
            >
              未回答 {unansweredOnPage}問
            </button>
          ) : (
            <span className="ecp-unanswered is-complete" aria-live="polite" data-eiken-unanswered-count>
              <Check size={14} strokeWidth={3} aria-hidden="true" />
              <span>すべて回答済み</span>
            </span>
          ))}

        <button
          type="button"
          className="ecp-btn ecp-btn-main"
          data-ready={!pageScored && unansweredOnPage === 0 ? true : undefined}
          onClick={handleForward}
          data-eiken-cloze-forward
        >
          <span>{forwardLabel}</span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}
