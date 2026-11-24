import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
  LayoutGrid,
  Pause,
  Play,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';
import { DoorMascot } from './DoorMascot';
import { subjectTheme } from '../data/subjectTheme';
import type { EikenGrade } from '../eiken/config';
import { CHEM_MOCK_EXAMS } from '../chemistry/materials/mockExams';
import type { ChemMockExamSpec, ChemMockItem, ChemMockSection } from '../chemistry/types';
import {
  emptyMockState,
  formatDuration,
  mockStorageKey,
  parseMockState,
  type MockProgressState,
  type MockSubmittedRecord,
} from '../eiken/mockProgress';
import { captureWrongAnswers, type WrongAnswerInput } from '../utils/reviewList';
import { safeLocalStorage } from '../utils/safeLocalStorage';
import { formatText } from '../utils/textFormatter';
import './unit-select.css';
import './unit-card.css';
import './eiken-mock-exam.css';

export type MockExamKind = 'written' | 'listening';

interface FlatMockEntry {
  section: ChemMockSection;
  item: ChemMockItem;
  globalNo: number;
}

function readMock(uid: string): MockProgressState {
  try {
    const ls = safeLocalStorage();
    return ls ? parseMockState(ls.getItem(mockStorageKey(uid))) : emptyMockState();
  } catch {
    return emptyMockState();
  }
}

function writeMock(uid: string, next: MockProgressState): void {
  try {
    safeLocalStorage()?.setItem(mockStorageKey(uid), JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
}

function flattenExam(exam: ChemMockExamSpec): FlatMockEntry[] {
  const out: FlatMockEntry[] = [];
  let n = 1;
  for (const sec of exam.sections) {
    for (const item of sec.items) {
      out.push({ section: sec, item, globalNo: n++ });
    }
  }
  return out;
}

function scoreChemMock(exam: ChemMockExamSpec, answers: Record<string, number>) {
  let earnedPoints = 0;
  let totalPoints = 0;
  let correctCount = 0;
  let totalCount = 0;
  let answeredCount = 0;

  const sectionScores = exam.sections.map(sec => {
    let secPts = 0;
    let secMax = 0;
    let secCorrect = 0;
    for (const item of sec.items) {
      totalCount += 1;
      totalPoints += item.points;
      secMax += item.points;
      const picked = answers[item.id];
      if (Number.isInteger(picked) && picked >= 0 && picked < item.choices.length) {
        answeredCount += 1;
        if (picked === item.answer) {
          earnedPoints += item.points;
          secPts += item.points;
          correctCount += 1;
          secCorrect += 1;
        }
      }
    }
    return {
      id: sec.id,
      daimonLabel: sec.daimonLabel,
      title: sec.title,
      earnedPoints: secPts,
      maxPoints: secMax,
      correctCount: secCorrect,
      itemCount: sec.items.length,
    };
  });

  return {
    earnedPoints,
    totalPoints,
    correctCount,
    totalCount,
    answeredCount,
    unansweredCount: totalCount - answeredCount,
    pct: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
    sectionScores,
  };
}

export function EikenMockExam({
  uid,
  grade: initialGrade,
  onGrade,
  onBack,
  onRunningChange,
  backLabel = '学習へ',
}: {
  uid: string;
  grade: EikenGrade;
  onGrade: (grade: EikenGrade) => void;
  onBack: () => void;
  onRunningChange?: (running: boolean) => void;
  initialExamKind?: MockExamKind;
  backLabel?: string;
}) {
  const initialCategory: 'all' | 'basic' | 'advanced' =
    initialGrade.startsWith('chem_basic') ? 'basic' : 'all';
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'basic' | 'advanced'>(initialCategory);
  const [timedMode, setTimedMode] = useState<boolean>(true);
  const [mockState, setMockState] = useState<MockProgressState>(() => readMock(uid));
  const [phase, setPhase] = useState<'select' | 'running' | 'result'>('select');
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<string[]>([]);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [paused, setPaused] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [resultFilter, setResultFilter] = useState<'all' | 'wrong' | 'flagged'>('all');

  const theme = subjectTheme(initialGrade);

  useEffect(() => {
    onRunningChange?.(phase === 'running');
    return () => onRunningChange?.(false);
  }, [phase, onRunningChange]);

  const activeExam = useMemo(
    () => CHEM_MOCK_EXAMS.find(e => e.id === activeExamId) ?? null,
    [activeExamId],
  );

  const visibleExams = useMemo(
    () =>
      categoryFilter === 'all'
        ? CHEM_MOCK_EXAMS
        : CHEM_MOCK_EXAMS.filter(e => e.examCategory === categoryFilter),
    [categoryFilter],
  );

  useEffect(() => {
    if (phase !== 'running' || paused || !activeExam) return;
    const id = window.setInterval(() => {
      setElapsedSec(prev => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, paused, activeExam]);

  useEffect(() => {
    if (phase !== 'running' || !activeExam) return;
    const next: MockProgressState = {
      ...mockState,
      sessions: {
        ...mockState.sessions,
        [activeExam.id]: {
          examId: activeExam.id,
          answers,
          writing: {},
          flags,
          elapsedSec,
          timed: timedMode,
          limitSec: activeExam.timeLimitMinutes * 60,
          currentIndex: sectionIdx,
          updatedAt: Date.now(),
        },
      },
    };
    setMockState(next);
    writeMock(uid, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, flags, sectionIdx]);

  const startExam = (exam: ChemMockExamSpec, resume: boolean) => {
    onGrade(exam.course);
    const savedSession = resume ? mockState.sessions[exam.id] : undefined;
    setActiveExamId(exam.id);
    setAnswers(savedSession?.answers ?? {});
    setFlags(savedSession?.flags ?? []);
    setElapsedSec(savedSession?.elapsedSec ?? 0);
    setSectionIdx(savedSession ? Math.min(savedSession.currentIndex, exam.sections.length - 1) : 0);
    setPaused(false);
    setPaletteOpen(false);
    setConfirmSubmit(false);
    setPhase('running');
    window.scrollTo(0, 0);
  };

  const submitExam = () => {
    if (!activeExam) return;
    const score = scoreChemMock(activeExam, answers);
    const rec: MockSubmittedRecord = {
      examId: activeExam.id,
      correct: score.earnedPoints,
      total: score.totalPoints,
      writingDone: score.correctCount,
      writingTotal: score.totalCount,
      elapsedSec,
      timed: timedMode,
      answers,
      writing: {},
      flags,
      submittedAt: Date.now(),
    };
    const nextSessions = { ...mockState.sessions };
    delete nextSessions[activeExam.id];
    const prevHist = mockState.history[activeExam.id] ?? [];
    const next: MockProgressState = {
      version: 1,
      sessions: nextSessions,
      history: {
        ...mockState.history,
        [activeExam.id]: [rec, ...prevHist].slice(0, 5),
      },
    };
    setMockState(next);
    writeMock(uid, next);

    const wrongInputs: WrongAnswerInput[] = [];
    for (const sec of activeExam.sections) {
      for (const item of sec.items) {
        const picked = answers[item.id];
        if (picked !== item.answer) {
          wrongInputs.push({
            chapterId: `${activeExam.course}_ch01`,
            chapterTitle: activeExam.title,
            questionId: sec.id,
            subQuestionId: item.id,
            subLabel: `${sec.daimonLabel} ${item.label}`,
            questionText: item.stem.slice(0, 120),
            wrongAnswer: Number.isInteger(picked) ? `①②③④`[picked] ?? String(picked + 1) : '未解答',
            correctAnswer: `${`①②③④`[item.answer] ?? item.answer + 1} ${item.choices[item.answer]}`,
          });
        }
      }
    }
    if (wrongInputs.length > 0) {
      try {
        captureWrongAnswers(uid, wrongInputs);
      } catch {
        /* ignore */
      }
    }

    setConfirmSubmit(false);
    setPaletteOpen(false);
    setResultFilter('all');
    setPhase('result');
    window.scrollTo(0, 0);
  };

  const toggleFlag = (itemId: string) => {
    setFlags(prev => (prev.includes(itemId) ? prev.filter(x => x !== itemId) : [...prev, itemId]));
  };

  if (phase === 'select' || !activeExam) {
    return (
      <div className="mtb-page chapter-route em-select-page flex h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] min-h-0 w-full flex-col overflow-hidden notebook-paper p-3 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:p-5 sm:pb-[calc(5.75rem+env(safe-area-inset-bottom))] relative font-handwriting">
        <header className="chapter-route-heading unit-head shrink-0">
          <button type="button" onClick={onBack} className="unit-head-back" aria-label={`${backLabel}へ戻る`}>
            <ArrowLeft size={18} aria-hidden="true" />
            <span>{backLabel}</span>
          </button>
          <div className="unit-head-title">
            <h2 style={{ color: theme.accent }}>共通テスト実戦 通し模試</h2>
            <p>本番と同じ配点・制限時間で実戦力を測り、全選択肢の正誤根拠を一括復習できます</p>
          </div>
          <DoorMascot subject={initialGrade} showSpeech={false} size="mini" className="unit-head-mascot w-auto" />
        </header>

        <div className="chapter-workspace flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="em-grade-pills !grid-cols-3 sm:!w-auto" role="tablist" aria-label="科目区分">
              {([
                ['all', 'すべて', CHEM_MOCK_EXAMS.length],
                ['basic', '化学基礎（30分・50点）', CHEM_MOCK_EXAMS.filter(e => e.examCategory === 'basic').length],
                ['advanced', '化学（60分・100点）', CHEM_MOCK_EXAMS.filter(e => e.examCategory === 'advanced').length],
              ] as const).map(([key, label, cnt]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={categoryFilter === key}
                  className={`em-grade-pill ${categoryFilter === key ? 'is-active' : ''}`}
                  style={{ '--unit-accent': theme.accent } as React.CSSProperties}
                  onClick={() => setCategoryFilter(key)}
                >
                  <span>{label}</span>
                  <small>{cnt}回</small>
                </button>
              ))}
            </div>

            <div className="em-timer-toggle" role="group" aria-label="タイマー設定">
              <button
                type="button"
                className={timedMode ? 'is-on' : ''}
                aria-pressed={timedMode}
                onClick={() => setTimedMode(true)}
              >
                <Clock size={13} aria-hidden="true" />
                <span>本番タイマーあり</span>
              </button>
              <button
                type="button"
                className={!timedMode ? 'is-on' : ''}
                aria-pressed={!timedMode}
                onClick={() => setTimedMode(false)}
              >
                <span>時間制限なし</span>
              </button>
            </div>
          </div>

          <section className="em-tab-panel min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {visibleExams.map(exam => {
                const session = mockState.sessions[exam.id];
                const hist = mockState.history[exam.id] ?? [];
                const latest = hist[0];
                const itemCount = exam.sections.reduce((n, s) => n + s.items.length, 0);
                const answeredInSession = session ? Object.keys(session.answers).length : 0;

                return (
                  <article
                    key={exam.id}
                    className="rounded-2xl border border-slate-200 bg-[#fffdf8] p-4 shadow-xs flex flex-col justify-between gap-3"
                    data-mock-card={exam.id}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f5f2] px-2.5 py-0.5 text-xs font-extrabold text-[#16697a]">
                          <FlaskConical size={13} aria-hidden="true" />
                          {exam.examCategory === 'basic' ? '共通テスト 化学基礎' : '共通テスト 化学'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          制限 {exam.timeLimitMinutes}分 ・ {exam.totalPoints}点満点（全{itemCount}設問）
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-extrabold text-[#1c2a39]">{exam.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{exam.subtitle}</p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {exam.sections.map(sec => (
                          <li
                            key={sec.id}
                            className="rounded-md border border-slate-200/90 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600"
                          >
                            {sec.daimonLabel}：{sec.items.length}問
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 pt-3">
                      <div className="text-xs font-bold text-slate-600">
                        {session ? (
                          <span className="text-amber-700">
                            中断データあり（{answeredInSession}/{itemCount}問解答・経過 {formatDuration(session.elapsedSec)}）
                          </span>
                        ) : latest ? (
                          <span className="text-emerald-700">
                            前回スコア：<b>{latest.correct}</b> / {latest.total} 点（{Math.round((latest.correct / latest.total) * 100)}%）
                          </span>
                        ) : (
                          <span>未受験</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {session && (
                          <button
                            type="button"
                            onClick={() => startExam(exam, true)}
                            className="inline-flex items-center gap-1 rounded-xl border border-amber-400 bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-900 hover:bg-amber-100 cursor-pointer"
                          >
                            <Play size={13} aria-hidden="true" />
                            続きから
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => startExam(exam, false)}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#1f5c53] px-3.5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-[#174740] cursor-pointer"
                          data-mock-start={exam.id}
                        >
                          {latest && !session ? <RotateCcw size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
                          <span>{latest && !session ? 'もう一度受験' : '模試を開始'}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const flatEntries = flattenExam(activeExam);
  const currentSec = activeExam.sections[sectionIdx] ?? activeExam.sections[0]!;
  const limitSec = activeExam.timeLimitMinutes * 60;
  const remainingSec = Math.max(0, limitSec - elapsedSec);
  const isTimeOver = timedMode && elapsedSec >= limitSec;
  const answeredTotal = flatEntries.filter(e => Number.isInteger(answers[e.item.id])).length;

  if (phase === 'running') {
    return (
      <main className="em-page" data-mock-running={activeExam.id}>
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-[#fffdf8]/95 px-3.5 py-2.5 shadow-xs backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPhase('select')}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              中断して一覧へ
            </button>
            <strong className="text-xs sm:text-sm font-extrabold text-[#1c2a39]">{activeExam.title}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                isTimeOver
                  ? 'bg-rose-100 text-rose-800'
                  : timedMode && remainingSec <= 300
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <Clock size={14} aria-hidden="true" />
              {timedMode
                ? isTimeOver
                  ? `制限時間超過 +${formatDuration(elapsedSec - limitSec)}`
                  : `残り ${formatDuration(remainingSec)}`
                : `経過 ${formatDuration(elapsedSec)}`}
            </span>

            <button
              type="button"
              onClick={() => setPaused(p => !p)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
              aria-label={paused ? 'タイマー再開' : '一時停止'}
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
              <span className="hidden sm:inline">{paused ? '再開' : '一時停止'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaletteOpen(o => !o)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <LayoutGrid size={14} aria-hidden="true" />
              <span>解答状況 {answeredTotal}/{flatEntries.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmSubmit(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-[#1f5c53] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#174740] cursor-pointer"
              data-mock-submit-trigger
            >
              <Send size={13} aria-hidden="true" />
              採点する
            </button>
          </div>
        </header>

        {paletteOpen && (
          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
            <p className="mb-2 text-xs font-bold text-slate-600">番号を押すと該当の大問へ移動します（★は見直し付箋）</p>
            <div className="flex flex-wrap gap-1.5">
              {flatEntries.map(entry => {
                const secPos = activeExam.sections.findIndex(s => s.id === entry.section.id);
                const done = Number.isInteger(answers[entry.item.id]);
                const flagged = flags.includes(entry.item.id);
                return (
                  <button
                    key={entry.item.id}
                    type="button"
                    onClick={() => {
                      setSectionIdx(secPos);
                      setPaletteOpen(false);
                    }}
                    className={`min-w-[2.5rem] rounded-lg border px-2 py-1 text-xs font-extrabold cursor-pointer ${
                      done
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {entry.globalNo}{flagged ? '★' : ''}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {confirmSubmit && (
          <section className="rounded-2xl border-2 border-[#1f5c53] bg-[#effaf7] p-4 shadow-sm" role="alertdialog" aria-label="採点確認">
            <p className="text-sm font-extrabold text-[#153f39]">
              解答済み {answeredTotal} / {flatEntries.length} 問
              {answeredTotal < flatEntries.length && `（未解答 ${flatEntries.length - answeredTotal} 問あり）`}
              。答案を提出して採点しますか？
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={submitExam}
                className="rounded-xl bg-[#1f5c53] px-4 py-2 text-xs font-extrabold text-white cursor-pointer"
                data-mock-confirm-submit
              >
                採点して結果を見る
              </button>
              <button
                type="button"
                onClick={() => setConfirmSubmit(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer"
              >
                問題に戻る
              </button>
            </div>
          </section>
        )}

        <nav className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="大問切替">
          {activeExam.sections.map((sec, idx) => {
            const secDone = sec.items.filter(it => Number.isInteger(answers[it.id])).length;
            return (
              <button
                key={sec.id}
                type="button"
                role="tab"
                aria-selected={idx === sectionIdx}
                onClick={() => {
                  setSectionIdx(idx);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-extrabold transition cursor-pointer ${
                  idx === sectionIdx
                    ? 'border-[#1f5c53] bg-[#1f5c53] text-white'
                    : 'border-slate-200 bg-[#fffdf8] text-slate-700 hover:bg-white'
                }`}
              >
                {sec.daimonLabel}（{secDone}/{sec.items.length}）
              </button>
            );
          })}
        </nav>

        <section className="rounded-2xl border border-slate-200 bg-[#fffdf8] p-4 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="inline-block rounded-md bg-slate-800 px-2 py-0.5 text-xs font-extrabold text-white">
              {currentSec.daimonLabel}
            </span>
            <h2 className="mt-1.5 text-base sm:text-lg font-extrabold text-[#1c2a39]">{currentSec.title}</h2>
            <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {formatText(currentSec.leadText)}
            </div>
            {currentSec.imageUrl && (
              <figure className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <img
                  src={currentSec.imageUrl}
                  alt={currentSec.imageCaption || currentSec.title}
                  className="mx-auto max-h-72 w-auto max-w-full object-contain"
                />
                {currentSec.imageCaption && (
                  <figcaption className="mt-1.5 text-center text-xs font-bold text-slate-600">
                    {currentSec.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>

          <div className="space-y-5">
            {currentSec.items.map(item => {
              const picked = answers[item.id];
              const flagged = flags.includes(item.id);
              const circled = ['①', '②', '③', '④'];
              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs"
                  data-mock-question={item.id}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[#e6f5f2] px-2 py-0.5 text-xs font-extrabold text-[#16697a]">
                        {item.label}
                      </span>
                      <span className="text-xs font-bold text-slate-500">配点 {item.points}点 ・ {item.skill}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFlag(item.id)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold cursor-pointer ${
                        flagged
                          ? 'border-amber-400 bg-amber-50 text-amber-800'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {flagged ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                      <span>{flagged ? '見直し中' : '見直し付箋'}</span>
                    </button>
                  </div>

                  <div className="whitespace-pre-line text-sm leading-relaxed text-[#1c2a39] mb-3">
                    {formatText(item.stem)}
                  </div>

                  {item.imageUrl && (
                    <figure className="mb-3 rounded-xl border border-slate-200 bg-[#fdfcf8] p-2.5">
                      <img
                        src={item.imageUrl}
                        alt={item.imageCaption || item.label}
                        className="mx-auto max-h-64 w-auto max-w-full object-contain"
                      />
                      {item.imageCaption && (
                        <figcaption className="mt-1 text-center text-xs font-bold text-slate-600">
                          {item.imageCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    {item.choices.map((choice, cIdx) => {
                      const selected = picked === cIdx;
                      return (
                        <button
                          key={cIdx}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setAnswers(prev => ({ ...prev, [item.id]: cIdx }))}
                          className={`flex items-start gap-2.5 rounded-xl border p-3 text-left text-sm leading-relaxed transition cursor-pointer ${
                            selected
                              ? 'border-[#1f5c53] bg-[#edf9f6] font-bold text-[#123c36] shadow-2xs'
                              : 'border-slate-200 bg-[#fffdf9] text-slate-800 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <span className="font-extrabold text-[#1f5c53] shrink-0">{circled[cIdx] ?? cIdx + 1}</span>
                          <span className="min-w-0 break-words">{formatText(choice)}</span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <button
              type="button"
              disabled={sectionIdx === 0}
              onClick={() => {
                setSectionIdx(i => Math.max(0, i - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={15} />
              前の大問へ
            </button>

            {sectionIdx < activeExam.sections.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setSectionIdx(i => Math.min(activeExam.sections.length - 1, i + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1f5c53] px-4 py-2 text-xs font-extrabold text-white cursor-pointer"
              >
                次の大問へ
                <ChevronRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmSubmit(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1f5c53] px-4 py-2 text-xs font-extrabold text-white cursor-pointer"
              >
                <Send size={14} />
                答案を提出して採点する
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  const score = scoreChemMock(activeExam, answers);
  const filteredEntries = flatEntries.filter(({ item }) => {
    if (resultFilter === 'wrong') return answers[item.id] !== item.answer;
    if (resultFilter === 'flagged') return flags.includes(item.id);
    return true;
  });

  return (
    <main className="em-page" data-mock-result={activeExam.id}>
      <header className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-[#fffdf8] p-4 shadow-xs">
        <div>
          <span className="text-xs font-extrabold text-[#16697a]">共通テスト実戦模試 採点結果</span>
          <h1 className="text-lg font-extrabold text-[#1c2a39]">{activeExam.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => startExam(activeExam, false)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <RotateCcw size={14} />
            解き直す
          </button>
          <button
            type="button"
            onClick={() => setPhase('select')}
            className="inline-flex items-center gap-1 rounded-xl bg-[#1f5c53] px-3.5 py-2 text-xs font-extrabold text-white cursor-pointer"
          >
            模試一覧へ
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <div>
              <span className="text-xs font-bold text-slate-500">総合得点</span>
              <div className="text-3xl font-black text-[#1f5c53]">
                {score.earnedPoints} <small className="text-base font-bold text-slate-500">/ {score.totalPoints} 点（{score.pct}%）</small>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                score.pct >= 90
                  ? 'bg-emerald-100 text-emerald-900'
                  : score.pct >= 80
                  ? 'bg-teal-100 text-teal-900'
                  : score.pct >= 65
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {score.pct >= 90
                ? '共通テスト9割突破・最難関圏'
                : score.pct >= 80
                ? '共通テスト8割突破・難関国公立圏'
                : score.pct >= 65
                ? '共通テスト標準突破圏（あと一歩で8割！）'
                : '重要単元のまとめプリントから復習しよう'}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-600 space-x-3">
            <span>正解数：{score.correctCount} / {score.totalCount} 問</span>
            <span>所要時間：{formatDuration(elapsedSec)} / 目安 {activeExam.timeLimitMinutes}分</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {score.sectionScores.map(sec => {
            const secPct = sec.maxPoints > 0 ? Math.round((sec.earnedPoints / sec.maxPoints) * 100) : 0;
            return (
              <div key={sec.id} className="rounded-xl border border-slate-200/90 bg-[#fffdf8] p-2.5 text-xs">
                <div className="flex items-center justify-between font-extrabold text-slate-800">
                  <span>{sec.daimonLabel}</span>
                  <span>{sec.earnedPoints} / {sec.maxPoints} 点（{secPct}%）</span>
                </div>
                <p className="mt-0.5 truncate text-slate-500">{sec.title}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80" aria-hidden="true">
                  <div
                    className={`h-full rounded-full ${secPct >= 80 ? 'bg-emerald-600' : secPct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${secPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="解説フィルター">
        {([
          ['all', `全問（${flatEntries.length}）`],
          ['wrong', `誤答・未解答（${flatEntries.length - score.correctCount}）`],
          ['flagged', `見直し付箋（${flags.length}）`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setResultFilter(key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-extrabold cursor-pointer ${
              resultFilter === key
                ? 'border-[#1f5c53] bg-[#1f5c53] text-white'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="space-y-4">
        {filteredEntries.map(({ section, item, globalNo }) => {
          const picked = answers[item.id];
          const isCorrect = picked === item.answer;
          const circled = ['①', '②', '③', '④'];
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-rose-600 shrink-0" />
                  )}
                  <strong className="text-sm font-extrabold text-slate-800">
                    通し問{globalNo}（{section.daimonLabel} {item.label}）
                  </strong>
                  <span className="text-xs font-bold text-slate-500">{item.points}点 ・ {item.skill}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                    isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  あなたの解答：{Number.isInteger(picked) ? circled[picked] : '未解答'} ／ 正解：{circled[item.answer]}
                </span>
              </div>

              <div className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                {formatText(item.stem)}
              </div>

              {item.imageUrl && (
                <figure className="rounded-xl border border-slate-200 bg-[#fdfcf8] p-2.5">
                  <img
                    src={item.imageUrl}
                    alt={item.imageCaption || item.label}
                    className="mx-auto max-h-60 w-auto max-w-full object-contain"
                  />
                </figure>
              )}

              {(() => {
                const resolvedSteps =
                  item.steps && item.steps.length > 0
                    ? item.steps
                    : item.explanation
                        .split('\n')
                        .map(l => l.replace(/^[・●▪■]\s*/, '').trim())
                        .filter(l => l.length > 0)
                        .slice(0, 4);
                if (resolvedSteps.length === 0) return null;
                return (
                  <div className="rounded-xl border border-teal-200/90 bg-teal-50/40 p-3 text-xs leading-relaxed">
                    <strong className="block font-extrabold text-teal-900 mb-1.5">【正解までの道すじ】</strong>
                    <ol className="space-y-1">
                      {resolvedSteps.map((st, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2 text-slate-800">
                          <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[10px] font-extrabold text-white">
                            {sIdx + 1}
                          </span>
                          <span className="min-w-0">{formatText(st)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })()}

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-sm leading-relaxed">
                <strong className="block text-xs font-extrabold text-emerald-900 mb-1">【解説・計算プロセス】</strong>
                <div className="whitespace-pre-line text-slate-800">{formatText(item.explanation)}</div>
              </div>

              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-700">
                {item.choices.map((choice, cIdx) => {
                  const isAns = cIdx === item.answer;
                  const isUserPick = cIdx === picked;
                  return (
                    <li
                      key={cIdx}
                      className={`rounded-lg border p-2.5 ${
                        isAns
                          ? 'border-emerald-300 bg-emerald-50/50 font-bold text-slate-900'
                          : isUserPick
                          ? 'border-rose-300 bg-rose-50/50 text-slate-800'
                          : 'border-slate-100 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-extrabold mr-1">{circled[cIdx]}</span>
                          {formatText(choice)}
                        </div>
                        {(isAns || isUserPick) && (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                              isAns ? 'bg-emerald-200/80 text-emerald-950' : 'bg-rose-200/80 text-rose-950'
                            }`}
                          >
                            {isAns && isUserPick ? 'あなた・正解' : isAns ? '正解' : 'あなたの選択'}
                          </span>
                        )}
                      </div>
                      {item.reasons[cIdx] && (
                        <div className={`mt-1 ${isAns ? 'text-emerald-800 font-semibold' : isUserPick ? 'text-rose-800 font-semibold' : 'text-slate-600'}`}>
                          {isAns ? '○ ' : '× '}
                          {formatText(item.reasons[cIdx])}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </section>
    </main>
  );
}
