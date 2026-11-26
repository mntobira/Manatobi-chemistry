import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  Gauge,
  History,
  LayoutGrid,
  NotebookPen,
  Pause,
  Play,
  Printer,
  RotateCcw,
  Send,
  Slash,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import { DoorMascot } from './DoorMascot';
import { subjectTheme } from '../data/subjectTheme';
import { CHEM_COURSES, type ChemCourseId, type EikenGrade } from '../eiken/config';
import { CHEM_MOCK_EXAMS } from '../chemistry/materials/mockExams';
import { CHEM_PDF_CATALOG } from '../chemistry/chemistryPdfCatalog.generated';
import { openChemPdfEntry } from './ChemPastAnalysisStudio';
import type { ChemDifficultyLevel, ChemMockExamSpec, ChemMockItem, ChemMockSection } from '../chemistry/types';
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

const KATAKANA_SLOTS = [
  'ア', 'イ', 'ウ', 'エ', 'オ',
  'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト',
] as const;

const CIRCLED_NUMS = ['①', '②', '③', '④'] as const;

const DIFFICULTY_META: Record<
  ChemDifficultyLevel,
  { label: string; className: string }
> = {
  foundation: { label: '★基礎（A問題・必答）', className: 'bg-sky-100 text-sky-900 border-sky-300' },
  kyotsu_standard: { label: '★★共テ標準（B問題）', className: 'bg-amber-100 text-amber-950 border-amber-300' },
  kyotsu_2ji: { label: '★★★満点・2次（C問題）', className: 'bg-purple-100 text-purple-950 border-purple-300' },
};

function recommendCourseForSection(exam: ChemMockExamSpec, sec: ChemMockSection, sectionIndex: number): ChemCourseId {
  if (exam.examCategory === 'basic') {
    return sectionIndex === 0 ? 'chem_basic_matter' : 'chem_basic_change';
  }
  const t = `${sec.title} ${sec.leadText ?? ''}`;
  if (/(高分子|酵素|ペプチド|ナイロン|ポリ|イオン交換|糖|核酸|ゴム)/.test(t) || sectionIndex === 4) {
    return 'chem_polymer';
  }
  if (/(芳香族|有機|エステル|アルケン|サリチル|フェノール|オゾン|ラクトン|アミン)/.test(t) || sectionIndex === 3) {
    return 'chem_organic';
  }
  if (/(無機|錯|沈殿|気体|工業|鉄鉱石|脱硫|ケイ素|ヨウ素|ハーバー|接触法)/.test(t) && sectionIndex === 2) {
    return 'chem_inorganic';
  }
  return 'chem_theory';
}

interface FlatMockEntry {
  section: ChemMockSection;
  sectionIndex: number;
  item: ChemMockItem;
  globalNo: number;
  markSlot: string;
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
  exam.sections.forEach((sec, sectionIndex) => {
    for (const item of sec.items) {
      const slot = item.markSlot || KATAKANA_SLOTS[n - 1] || String(n);
      out.push({ section: sec, sectionIndex, item, globalNo: n++, markSlot: slot });
    }
  });
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
      recommendedMinutes: sec.recommendedMinutes,
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
  onOpenPastAnalysis,
  backLabel = '学習へ',
}: {
  uid: string;
  grade: EikenGrade;
  onGrade: (grade: EikenGrade) => void;
  onBack: () => void;
  onRunningChange?: (running: boolean) => void;
  onOpenPastAnalysis?: (tab?: 'pdfs' | 'traps' | 'timeline' | 'tactics') => void;
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
  const [eliminated, setEliminated] = useState<Record<string, number[]>>({});
  const [flags, setFlags] = useState<string[]>([]);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [paused, setPaused] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(false);
  const [scratchNotes, setScratchNotes] = useState<Record<string, string>>({});
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [constantsOpen, setConstantsOpen] = useState(true);
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
    setEliminated({});
    setFlags(savedSession?.flags ?? []);
    setElapsedSec(savedSession?.elapsedSec ?? 0);
    setSectionIdx(savedSession ? Math.min(savedSession.currentIndex, exam.sections.length - 1) : 0);
    setPaused(false);
    setPaletteOpen(false);
    setScratchOpen(false);
    setFocusedItemId(exam.sections[0]?.items[0]?.id ?? null);
    setConstantsOpen(true);
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
            wrongAnswer: Number.isInteger(picked) ? CIRCLED_NUMS[picked] ?? String(picked + 1) : '未解答',
            correctAnswer: `${CIRCLED_NUMS[item.answer] ?? item.answer + 1} ${item.choices[item.answer]}`,
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

  const toggleEliminateChoice = (itemId: string, cIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEliminated(prev => {
      const cur = prev[itemId] ?? [];
      const next = cur.includes(cIdx) ? cur.filter(x => x !== cIdx) : [...cur, cIdx];
      return { ...prev, [itemId]: next };
    });
  };

  const jumpToQuestion = (secIndex: number, itemId: string) => {
    setSectionIdx(secIndex);
    setFocusedItemId(itemId);
    setPaletteOpen(false);
    window.requestAnimationFrame(() => {
      const el = document.querySelector(`[data-mock-question="${itemId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  useEffect(() => {
    if (phase !== 'running' || !activeExam) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      const target = ev.target as HTMLElement | null;
      if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable)) {
        return;
      }
      if (confirmSubmit) return;
      const sec = activeExam.sections[sectionIdx];
      if (!sec) return;
      if (ev.key >= '1' && ev.key <= '4') {
        const choiceIdx = Number(ev.key) - 1;
        const targetItem =
          sec.items.find(it => it.id === focusedItemId) ??
          sec.items.find(it => !Number.isInteger(answers[it.id])) ??
          sec.items[0];
        if (targetItem && choiceIdx < targetItem.choices.length) {
          ev.preventDefault();
          setAnswers(prev => ({ ...prev, [targetItem.id]: choiceIdx }));
          setFocusedItemId(targetItem.id);
        }
      } else if (ev.key === 'ArrowRight' && ev.altKey && sectionIdx < activeExam.sections.length - 1) {
        ev.preventDefault();
        setSectionIdx(i => Math.min(activeExam.sections.length - 1, i + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (ev.key === 'ArrowLeft' && ev.altKey && sectionIdx > 0) {
        ev.preventDefault();
        setSectionIdx(i => Math.max(0, i - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, activeExam, sectionIdx, focusedItemId, answers, confirmSubmit]);

  if (phase === 'select' || !activeExam) {
    return (
      <div className="mtb-page chapter-route em-select-page flex h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] min-h-0 w-full flex-col overflow-hidden notebook-paper p-3 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:p-5 sm:pb-[calc(5.75rem+env(safe-area-inset-bottom))] relative font-handwriting">
        <header className="chapter-route-heading unit-head shrink-0">
          <button type="button" onClick={onBack} className="unit-head-back" aria-label={`${backLabel}へ戻る`}>
            <ArrowLeft size={18} aria-hidden="true" />
            <span>{backLabel}</span>
          </button>
          <div className="unit-head-title">
            <h2 style={{ color: theme.accent }}>大学入学共通テスト 実戦通し模試</h2>
            <p>本番準拠「問題冊子＋マーク解答用紙」2ペイン設計・印刷用3分冊PDF・満点ペースメーカー・2次診断つき</p>
          </div>
          {onOpenPastAnalysis && (
            <button
              type="button"
              onClick={() => onOpenPastAnalysis('traps')}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-extrabold text-indigo-950 shadow-2xs transition hover:bg-indigo-100 cursor-pointer"
              data-mock-open-past-bible
            >
              <History size={13} aria-hidden="true" />
              <span>37年過去問分析・PDF一覧</span>
            </button>
          )}
          <DoorMascot subject={initialGrade} showSpeech={false} size="mini" className="unit-head-mascot w-auto" />
        </header>

        <div className="chapter-workspace flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="em-grade-pills !grid-cols-3 sm:!w-auto" role="tablist" aria-label="科目区分">
              {([
                ['all', '全8回（基礎4＋化学4）', CHEM_MOCK_EXAMS.length],
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
                className={timedMode ? 'is-active' : ''}
                aria-pressed={timedMode}
                onClick={() => setTimedMode(true)}
              >
                <Clock size={13} aria-hidden="true" />
                <span>本番タイマー（推奨配分つき）</span>
              </button>
              <button
                type="button"
                className={!timedMode ? 'is-active' : ''}
                aria-pressed={!timedMode}
                onClick={() => setTimedMode(false)}
              >
                <span>時間制限なし</span>
              </button>
            </div>
          </div>

          <section className="em-tab-panel min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
              {visibleExams.map(exam => {
                const session = mockState.sessions[exam.id];
                const hist = mockState.history[exam.id] ?? [];
                const latest = hist[0];
                const bestPct = hist.reduce(
                  (mx, h) => Math.max(mx, h.total > 0 ? Math.round((h.correct / h.total) * 100) : 0),
                  0,
                );
                const itemCount = exam.sections.reduce((n, s) => n + s.items.length, 0);
                const answeredInSession = session ? Object.keys(session.answers).length : 0;
                const pdfEntry = CHEM_PDF_CATALOG.find(p => p.examId === exam.id);

                return (
                  <article
                    key={exam.id}
                    className="em-exam-select-card rounded-2xl border border-slate-200 bg-[#fffdf8] p-4 shadow-xs flex flex-col justify-between gap-3"
                    data-mock-card={exam.id}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                            <FlaskConical size={12} aria-hidden="true" />
                            {exam.examCategory === 'basic' ? '理科｜化学基礎' : '理科｜化学'} 第{exam.round}回
                          </span>
                          {exam.levelBadge && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-900">
                              {exam.levelBadge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-slate-600">
                          {exam.timeLimitMinutes}分 ／ {exam.totalPoints}点満点（マーク{itemCount}欄）
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-extrabold text-[#1c2a39]">{exam.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{exam.subtitle}</p>

                      <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                        {exam.sections.map(sec => {
                          const secPts = sec.items.reduce((s, i) => s + i.points, 0);
                          return (
                            <div
                              key={sec.id}
                              className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-[11px]"
                            >
                              <div className="flex items-center justify-between font-extrabold text-slate-800">
                                <span>{sec.daimonLabel}</span>
                                <span className="text-[#16697a]">{secPts}点</span>
                              </div>
                              <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
                                <span>{sec.items.length}設問</span>
                                {sec.recommendedMinutes && <span>目安{sec.recommendedMinutes}分</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 pt-3">
                      <div className="text-xs font-bold text-slate-600">
                        {session ? (
                          <span className="text-amber-700">
                            中断中：{answeredInSession}/{itemCount}欄マーク済（経過 {formatDuration(session.elapsedSec)}）
                          </span>
                        ) : latest ? (
                          <span className="text-emerald-800">
                            直近 <b>{latest.correct}</b>/{latest.total}点（{Math.round((latest.correct / latest.total) * 100)}%）
                            {hist.length > 1 && ` ・ 自己ベスト ${bestPct}%`}
                          </span>
                        ) : (
                          <span className="text-slate-500">目標目安：共テ本番 85% ／ 2次余裕圏 92%+</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {pdfEntry && (
                          <>
                            <button
                              type="button"
                              onClick={() => openChemPdfEntry(pdfEntry, 'questions')}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50 cursor-pointer"
                              title="本番形式の問題冊子PDFを開く（見開き・印刷対応）"
                              data-mock-pdf-questions={exam.id}
                            >
                              <Printer size={13} aria-hidden="true" />
                              <span>問題冊子PDF</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openChemPdfEntry(pdfEntry, 'answers')}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-2.5 py-2 text-xs font-extrabold text-rose-900 hover:bg-rose-100 cursor-pointer"
                              title="実寸A4横マークシート解答用紙PDFを開く"
                              data-mock-pdf-answers={exam.id}
                            >
                              <FileSpreadsheet size={13} aria-hidden="true" />
                              <span>マークシートPDF</span>
                            </button>
                          </>
                        )}
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
                          <span>{latest && !session ? '再受験する' : 'Web受験を開始'}</span>
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
  const slotByItemId = new Map(flatEntries.map(e => [e.item.id, e.markSlot]));
  const currentSec = activeExam.sections[sectionIdx] ?? activeExam.sections[0]!;
  const currentSecPoints = currentSec.items.reduce((s, it) => s + it.points, 0);
  const limitSec = activeExam.timeLimitMinutes * 60;
  const remainingSec = Math.max(0, limitSec - elapsedSec);
  const isTimeOver = timedMode && elapsedSec >= limitSec;
  const answeredTotal = flatEntries.filter(e => Number.isInteger(answers[e.item.id])).length;
  const activePdfEntry = CHEM_PDF_CATALOG.find(p => p.examId === activeExam.id);
  const cumulativeTargetSec = activeExam.sections
    .slice(0, sectionIdx + 1)
    .reduce((acc, s) => acc + (s.recommendedMinutes ?? Math.floor(activeExam.timeLimitMinutes / activeExam.sections.length)) * 60, 0);
  const paceDeltaSec = cumulativeTargetSec - elapsedSec;

  if (phase === 'running') {
    return (
      <main className="em-kyotsu-runner" data-mock-running={activeExam.id}>
        {/* 上部固定コントロールバー（本番時計・大問タブ・マークシート開閉・採点） */}
        <header className="em-kyotsu-topbar">
          <div className="em-kyotsu-topbar-inner">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setPhase('select')}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span>中断保存</span>
              </button>
              <span className="hidden md:inline-flex items-center rounded bg-slate-900 px-2 py-0.5 text-[11px] font-black tracking-wider text-white shrink-0">
                {activeExam.examCategory === 'basic' ? '理科｜化学基礎' : '理科｜化学'}
              </span>
              <strong className="truncate text-xs sm:text-sm font-extrabold text-slate-900">
                {activeExam.title}
              </strong>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black tabular-nums ${
                  isTimeOver
                    ? 'bg-rose-600 text-white'
                    : timedMode && remainingSec <= 300
                    ? 'bg-amber-200 text-amber-950'
                    : 'bg-slate-900 text-white'
                }`}
              >
                <Clock size={13} aria-hidden="true" />
                {timedMode
                  ? isTimeOver
                    ? `超過 +${formatDuration(elapsedSec - limitSec)}`
                    : `残り ${formatDuration(remainingSec)}`
                  : `経過 ${formatDuration(elapsedSec)}`}
              </span>

              <button
                type="button"
                onClick={() => setPaused(p => !p)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                aria-label={paused ? 'タイマー再開' : '一時停止'}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
                <span className="hidden sm:inline">{paused ? '再開' : '停止'}</span>
              </button>

              {timedMode && (
                <span
                  className={`hidden lg:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${
                    paceDeltaSec >= 120
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : paceDeltaSec >= -90
                        ? 'border-sky-300 bg-sky-50 text-sky-900'
                        : 'border-amber-400 bg-amber-50 text-amber-950'
                  }`}
                  title="満点2周ペースメーカー（現在の大問完了目安との差）"
                >
                  <Gauge size={13} aria-hidden="true" />
                  <span>
                    {paceDeltaSec >= 0
                      ? `${currentSec.daimonLabel}目安まで残り ${formatDuration(paceDeltaSec)}`
                      : `目安超過 +${formatDuration(-paceDeltaSec)}（難問は★付箋で2周目へ！）`}
                  </span>
                </span>
              )}

              {activePdfEntry && (
                <button
                  type="button"
                  onClick={() => openChemPdfEntry(activePdfEntry, 'questions')}
                  className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  title="印刷用PDF冊子・A4横マークシートを表示"
                >
                  <FileText size={13} aria-hidden="true" />
                  <span>冊子PDF</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setScratchOpen(o => !o)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-extrabold cursor-pointer ${
                  scratchOpen
                    ? 'border-amber-500 bg-amber-50 text-amber-950'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                data-mock-scratch-toggle
              >
                <NotebookPen size={13} aria-hidden="true" />
                <span>計算メモ</span>
              </button>

              <button
                type="button"
                onClick={() => setPaletteOpen(o => !o)}
                className="xl:hidden inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-800 cursor-pointer"
              >
                <FileSpreadsheet size={14} aria-hidden="true" />
                <span>マーク欄 {answeredTotal}/{flatEntries.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmSubmit(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1f5c53] px-3 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-[#16443d] cursor-pointer"
                data-mock-submit-trigger
              >
                <Send size={13} aria-hidden="true" />
                <span>答案提出・採点</span>
              </button>
            </div>
          </div>

          {/* 大問ナビゲーション（目安時間・マーク進捗つき） */}
          <nav className="em-kyotsu-daimon-bar" role="tablist" aria-label="大問切替">
            {activeExam.sections.map((sec, idx) => {
              const secDone = sec.items.filter(it => Number.isInteger(answers[it.id])).length;
              const secAllDone = secDone === sec.items.length;
              const firstSlot = slotByItemId.get(sec.items[0]?.id ?? '') ?? '';
              const lastSlot = slotByItemId.get(sec.items[sec.items.length - 1]?.id ?? '') ?? '';
              const slotRange = firstSlot === lastSlot ? firstSlot : `${firstSlot}〜${lastSlot}`;
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
                  className={`em-kyotsu-daimon-tab ${idx === sectionIdx ? 'is-active' : ''} ${secAllDone ? 'is-complete' : ''}`}
                >
                  <span className="font-black">{sec.daimonLabel}</span>
                  <span className="text-[11px] opacity-85">[{slotRange}]</span>
                  <span className="em-kyotsu-daimon-count">
                    {secDone}/{sec.items.length}
                  </span>
                  {sec.recommendedMinutes && (
                    <span className="hidden sm:inline text-[10px] opacity-75">目安{sec.recommendedMinutes}分</span>
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        {/* 計算・構造決定メモ帳ドロワー（冊子余白の代わりにmol表・半反応式・異性体メモを残せる） */}
        {scratchOpen && (
          <section className="em-scratchpad-drawer" aria-label="計算・構造決定メモ帳">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <NotebookPen size={14} className="text-amber-800" aria-hidden="true" />
                <strong className="text-xs font-black text-slate-900">
                  問題冊子 余白計算メモ（{currentSec.daimonLabel}：mol収支・半反応式・構造決定の下書き用）
                </strong>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setScratchNotes(prev => ({
                      ...prev,
                      [`${activeExam.id}:${currentSec.id}`]: '',
                    }))
                  }
                  className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  クリア
                </button>
                <button
                  type="button"
                  onClick={() => setScratchOpen(false)}
                  className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={scratchNotes[`${activeExam.id}:${currentSec.id}`] ?? ''}
              onChange={e =>
                setScratchNotes(prev => ({
                  ...prev,
                  [`${activeExam.id}:${currentSec.id}`]: e.target.value,
                }))
              }
              placeholder="例）反応前 n(HCl) = 0.100 × 0.050 = 5.0 mmol ／ 不飽和度 U = (2C+2-H)/2 = ... （大問ごとに自動保持されます）"
              className="em-scratchpad-textarea"
            />
          </section>
        )}

        {/* モバイル・タブレット用マークシートドロワー */}
        {paletteOpen && (
          <section className="em-mobile-marksheet-drawer xl:hidden" aria-label="モバイル用マークシート">
            <div className="flex items-center justify-between mb-2">
              <strong className="text-xs font-black text-slate-900">
                マーク解答用紙（直接マーク・設問ジャンプ可）
              </strong>
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold text-slate-600 cursor-pointer"
              >
                閉じる
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
              {flatEntries.map(entry => {
                const picked = answers[entry.item.id];
                const flagged = flags.includes(entry.item.id);
                return (
                  <div
                    key={entry.item.id}
                    className={`em-marksheet-row ${entry.sectionIndex === sectionIdx ? 'is-active-sec' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => jumpToQuestion(entry.sectionIndex, entry.item.id)}
                      className="em-marksheet-slot-btn"
                    >
                      <span className="em-mark-katakana">{entry.markSlot}</span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {entry.section.daimonLabel}{entry.item.label}
                        {flagged ? ' ★' : ''}
                      </span>
                    </button>
                    <div className="em-marksheet-bubbles">
                      {entry.item.choices.map((_, cIdx) => {
                        const isMarked = picked === cIdx;
                        return (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => setAnswers(prev => ({ ...prev, [entry.item.id]: cIdx }))}
                            className={`em-oval-bubble ${isMarked ? 'is-marked' : ''}`}
                            aria-label={`解答欄${entry.markSlot}の選択肢${cIdx + 1}`}
                            aria-pressed={isMarked}
                          >
                            {cIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 採点確認ダイアログ */}
        {confirmSubmit && (
          <div className="em-modal-backdrop" role="alertdialog" aria-label="採点確認">
            <div className="em-modal">
              <h2>答案を提出して採点しますか？</h2>
              <p>
                マーク済み：<b>{answeredTotal}</b> ／ 全 <b>{flatEntries.length}</b> 欄
                （経過時間：{formatDuration(elapsedSec)}）
              </p>
              {answeredTotal < flatEntries.length && (
                <p className="em-modal-warn">
                  未マークの解答欄が {flatEntries.length - answeredTotal} 箇所あります。本番同様、すべてマークしてからの提出を推奨します。
                </p>
              )}
              {flags.length > 0 && (
                <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-950">
                  見直し付箋★が {flags.length} 問残っています。マークずれ・主語の読み違い（電流vs電子、強塩基vs難溶、水H₂Oの算入）がないか最終確認しましょう。
                </p>
              )}
              <div className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11.5px] leading-relaxed text-slate-700">
                <strong className="block font-extrabold text-slate-900">【共通テスト満点 提出前5秒チェック】</strong>
                ① マーク番号の段ずれはないか ／ ②「誤っているもの」と「正しいもの」を取り違えていないか ／ ③ 有効数字・単位（mL vs L, g vs kg）は合っているか
              </div>
              <div className="em-modal-actions">
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(false)}
                  className="em-ghost-btn"
                >
                  問題冊子に戻る
                </button>
                <button
                  type="button"
                  onClick={submitExam}
                  className="em-primary-btn !bg-[#1f5c53]"
                  data-mock-confirm-submit
                >
                  採点して診断結果を見る
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2ペイン本体：左＝共通テスト問題冊子（オフホワイト試験紙） ／ 右＝固定マーク解答用紙 */}
        <div className="em-booklet-split">
          <section className="em-booklet-paper" aria-label="共通テスト問題冊子">
            {/* 試験紙ヘッダー枠（本番冊子の黒枠見出しを再現） */}
            <div className="em-booklet-banner">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="em-booklet-subject-chip">
                    {activeExam.examCategory === 'basic' ? '化学基礎' : '化　学'}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    （解答番号 <span className="em-inline-slot-box">{flatEntries[0]?.markSlot}</span> 〜{' '}
                    <span className="em-inline-slot-box">{flatEntries[flatEntries.length - 1]?.markSlot}</span>）
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setConstantsOpen(o => !o)}
                  className="rounded border border-slate-400 bg-white px-2 py-0.5 text-[11px] font-extrabold text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  {constantsOpen ? '▲ 原子量・定数欄をたたむ' : '▼ 原子量・定数欄を開く'}
                </button>
              </div>

              {constantsOpen && activeExam.constantsNote && (
                <div className="em-booklet-constants-box">
                  {activeExam.constantsNote}
                </div>
              )}
            </div>

            {/* 大問見出し・リード文・実験図 */}
            <div className="em-daimon-header">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2.5">
                  <span className="em-daimon-box">{currentSec.daimonLabel}</span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {currentSec.title}
                  </h2>
                </div>
                <span className="text-xs font-extrabold text-slate-600 shrink-0">
                  必答問題（配点 {currentSecPoints}点{currentSec.recommendedMinutes ? `・目安 ${currentSec.recommendedMinutes}分` : ''}）
                </span>
              </div>

              {currentSec.leadText && (
                <div className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                  {formatText(currentSec.leadText)}
                </div>
              )}

              {currentSec.imageUrl && (
                <figure className="em-booklet-figure mt-3">
                  <img
                    src={currentSec.imageUrl}
                    alt={currentSec.imageCaption || currentSec.title}
                    className="mx-auto max-h-80 w-auto max-w-full object-contain"
                  />
                  {currentSec.imageCaption && (
                    <figcaption className="mt-1.5 text-center text-xs font-bold text-slate-700">
                      {currentSec.imageCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {currentSec.dataTable && (
                <div className="em-booklet-table-wrap mt-3">
                  {currentSec.dataTable.caption && (
                    <div className="em-booklet-table-caption">{currentSec.dataTable.caption}</div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="em-booklet-table">
                      <thead>
                        <tr>
                          {currentSec.dataTable.headers.map((hd, hIdx) => (
                            <th key={hIdx}>{formatText(hd)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentSec.dataTable.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>{formatText(cell)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {currentSec.dialogue && currentSec.dialogue.length > 0 && (
                <div className="em-booklet-dialogue mt-3" aria-label="探究会話文">
                  <div className="em-booklet-dialogue-title">【実験・考察に関する会話】</div>
                  <div className="space-y-1.5">
                    {currentSec.dialogue.map((line, lIdx) => (
                      <div key={lIdx} className="em-booklet-dialogue-row">
                        <span
                          className={`em-booklet-speaker ${
                            line.speaker.includes('先生') ? 'is-teacher' : 'is-student'
                          }`}
                        >
                          {line.speaker}
                        </span>
                        <div className="min-w-0 flex-1 text-xs sm:text-[13.5px] leading-relaxed text-slate-800">
                          {formatText(line.text)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 設問リスト */}
            <div className="space-y-6 mt-5">
              {currentSec.items.map(item => {
                const picked = answers[item.id];
                const itemElims = eliminated[item.id] ?? [];
                const flagged = flags.includes(item.id);
                const slot = slotByItemId.get(item.id) ?? '?';

                return (
                  <article
                    key={item.id}
                    onClick={() => setFocusedItemId(item.id)}
                    className={`em-booklet-question ${Number.isInteger(picked) ? 'is-answered' : ''} ${
                      focusedItemId === item.id ? 'is-focused' : ''
                    }`}
                    data-mock-question={item.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="em-question-label">{item.label}</span>
                        <span className="text-xs font-extrabold text-slate-800">
                          解答番号 <span className="em-inline-slot-box">{slot}</span>
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                          配点 {item.points}点
                        </span>
                        {item.difficulty && (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${
                              DIFFICULTY_META[item.difficulty].className
                            }`}
                          >
                            {DIFFICULTY_META[item.difficulty].label}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="hidden sm:inline text-[11px] font-bold text-slate-400">
                          ×ボタンで選択肢を消去できます
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFlag(item.id)}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold cursor-pointer ${
                            flagged
                              ? 'border-amber-500 bg-amber-50 text-amber-900'
                              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {flagged ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                          <span>{flagged ? '見直し★' : '付箋'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="em-booklet-stem whitespace-pre-line">
                      {formatText(item.stem)}
                    </div>

                    {item.imageUrl && (
                      <figure className="em-booklet-figure my-3">
                        <img
                          src={item.imageUrl}
                          alt={item.imageCaption || item.label}
                          className="mx-auto max-h-64 w-auto max-w-full object-contain"
                        />
                        {item.imageCaption && (
                          <figcaption className="mt-1 text-center text-xs font-bold text-slate-700">
                            {item.imageCaption}
                          </figcaption>
                        )}
                      </figure>
                    )}

                    <div className="mt-3 space-y-2">
                      {item.choices.map((choice, cIdx) => {
                        const selected = picked === cIdx;
                        const isEliminated = itemElims.includes(cIdx) && !selected;
                        return (
                          <div key={cIdx} className="flex items-stretch gap-1.5">
                            <button
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setAnswers(prev => ({ ...prev, [item.id]: cIdx }))}
                              className={`em-booklet-choice flex-1 ${selected ? 'is-selected' : ''} ${
                                isEliminated ? 'is-eliminated' : ''
                              }`}
                            >
                              <span className={`em-booklet-choice-num ${selected ? 'is-selected' : ''}`}>
                                {CIRCLED_NUMS[cIdx] ?? cIdx + 1}
                              </span>
                              <span className="min-w-0 flex-1 break-words text-left">
                                {formatText(choice)}
                              </span>
                            </button>
                            <button
                              type="button"
                              title={itemElims.includes(cIdx) ? '消去スラッシュを解除' : 'この選択肢を消去（×）'}
                              aria-label={`選択肢${cIdx + 1}を消去`}
                              aria-pressed={itemElims.includes(cIdx)}
                              onClick={e => toggleEliminateChoice(item.id, cIdx, e)}
                              className={`em-slash-btn ${itemElims.includes(cIdx) ? 'is-active' : ''}`}
                            >
                              <Slash size={13} aria-hidden="true" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* 冊子下部ページ送り */}
            <div className="mt-6 flex items-center justify-between border-t-2 border-slate-800 pt-4">
              <button
                type="button"
                disabled={sectionIdx === 0}
                onClick={() => {
                  setSectionIdx(i => Math.max(0, i - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={15} />
                前の大問へ
              </button>

              <span className="text-xs font-black text-slate-600">
                {sectionIdx + 1} / {activeExam.sections.length} 大問
              </span>

              {sectionIdx < activeExam.sections.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setSectionIdx(i => Math.min(activeExam.sections.length - 1, i + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 cursor-pointer"
                >
                  次の大問へ
                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(true)}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#1f5c53] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#16443d] cursor-pointer"
                >
                  <Send size={14} />
                  答案を提出して採点
                </button>
              )}
            </div>
          </section>

          {/* 右ペイン（PC常時表示）：本番型マーク解答用紙 */}
          <aside className="em-marksheet-pane hidden xl:flex" aria-label="マーク解答用紙">
            <div className="em-marksheet-header">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-black tracking-wide text-emerald-950">
                  マーク解答用紙（{activeExam.examCategory === 'basic' ? '化学基礎' : '化学'}）
                </strong>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-900">
                  {answeredTotal} / {flatEntries.length} 塗潰済
                </span>
              </div>
              <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                解答番号を押すと設問へ移動・楕円①〜④で直接マーク可能
              </p>
            </div>

            <div className="em-marksheet-body">
              {flatEntries.map((entry, idx) => {
                const picked = answers[entry.item.id];
                const flagged = flags.includes(entry.item.id);
                const prevSecId = idx > 0 ? flatEntries[idx - 1]?.section.id : null;
                const showDaimonDivider = entry.section.id !== prevSecId;

                return (
                  <React.Fragment key={entry.item.id}>
                    {showDaimonDivider && (
                      <div className="em-marksheet-daimon-divider">
                        <span>{entry.section.daimonLabel}</span>
                        {entry.section.recommendedMinutes && (
                          <span>目安 {entry.section.recommendedMinutes}分</span>
                        )}
                      </div>
                    )}
                    <div
                      className={`em-marksheet-row ${
                        entry.sectionIndex === sectionIdx ? 'is-active-sec' : ''
                      } ${flagged ? 'is-flagged' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => jumpToQuestion(entry.sectionIndex, entry.item.id)}
                        className="em-marksheet-slot-btn"
                        title={`${entry.section.daimonLabel} ${entry.item.label}へ移動`}
                      >
                        <span className="em-mark-katakana">{entry.markSlot}</span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {entry.item.label}
                          {flagged ? '★' : ''}
                        </span>
                      </button>

                      <div className="em-marksheet-bubbles">
                        {entry.item.choices.map((_, cIdx) => {
                          const isMarked = picked === cIdx;
                          return (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => setAnswers(prev => ({ ...prev, [entry.item.id]: cIdx }))}
                              className={`em-oval-bubble ${isMarked ? 'is-marked' : ''}`}
                              aria-label={`解答欄${entry.markSlot} 選択肢${cIdx + 1}`}
                              aria-pressed={isMarked}
                            >
                              {cIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="em-marksheet-footer">
              <button
                type="button"
                onClick={() => setConfirmSubmit(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1f5c53] py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-[#16443d] cursor-pointer"
              >
                <Send size={14} aria-hidden="true" />
                答案を提出して一括採点する
              </button>
            </div>
          </aside>
        </div>
      </main>
    );
  }

  const score = scoreChemMock(activeExam, answers);
  const filteredEntries = flatEntries.filter(({ item }) => {
    if (resultFilter === 'wrong') return answers[item.id] !== item.answer;
    if (resultFilter === 'flagged') return flags.includes(item.id);
    return true;
  });

  const targetDiagnosis =
    score.pct >= 92
      ? {
          badge: 'S判定：共テ満点圏・国公立2次余裕合格レベル！',
          tone: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          detail: '共通テスト本番で9割超を安定確保でき、難関国公立・医学部の2次記述にも余裕をもって挑める完成度です。',
        }
      : score.pct >= 84
      ? {
          badge: 'A判定：共通テスト85%突破・難関国公立合格圏！',
          tone: 'bg-teal-100 text-teal-950 border-teal-300',
          detail: '共通テスト本番の目標ライン（85%）に到達しています。失点した設問の計算トラップを潰せば9割・満点に届きます。',
        }
      : score.pct >= 70
      ? {
          badge: 'B判定：共通テスト標準突破（あと2〜3問で85%圏！）',
          tone: 'bg-amber-100 text-amber-950 border-amber-300',
          detail: '基礎〜標準知識は定着しています。大問別の得点率が低い分野を単元演習の「★★★共テ満点・2次」で補強しましょう。',
        }
      : {
          badge: 'C判定：基礎〜標準単元の優先固めフェーズ',
          tone: 'bg-slate-100 text-slate-800 border-slate-300',
          detail: 'まずは「誤答・未解答」タブで【正解までの道すじ】を確認し、該当単元の要点まとめシートから復習しましょう。',
        };

  return (
    <main className="em-page" data-mock-result={activeExam.id}>
      <header className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-[#fffdf8] p-4 shadow-xs">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#16697a]">
            <Sparkles size={13} aria-hidden="true" />
            大学入学共通テスト 実戦模試 採点・2次力診断シート
          </span>
          <h1 className="mt-0.5 text-lg font-extrabold text-[#1c2a39]">{activeExam.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {activePdfEntry && (
            <>
              <button
                type="button"
                onClick={() => openChemPdfEntry(activePdfEntry, 'explanations')}
                className="inline-flex items-center gap-1 rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-extrabold text-sky-950 hover:bg-sky-100 cursor-pointer"
              >
                <Printer size={14} aria-hidden="true" />
                <span>ステップ詳解PDF</span>
              </button>
              <button
                type="button"
                onClick={() => openChemPdfEntry(activePdfEntry, 'questions')}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <FileText size={14} aria-hidden="true" />
                <span>問題・マークシートPDF</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => startExam(activeExam, false)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw size={14} />
            解き直す
          </button>
          <button
            type="button"
            onClick={() => setPhase('select')}
            className="inline-flex items-center gap-1 rounded-xl bg-[#1f5c53] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#16443d] cursor-pointer"
          >
            <LayoutGrid size={14} />
            模試一覧へ
          </button>
        </div>
      </header>

      {/* 総合スコア＆共通テスト基準ライン比較 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-baseline gap-4">
            <div>
              <span className="text-xs font-extrabold text-slate-500">総合得点（マーク換算）</span>
              <div className="text-3xl sm:text-4xl font-black text-[#1f5c53] tabular-nums">
                {score.earnedPoints}{' '}
                <small className="text-base font-bold text-slate-500">
                  / {score.totalPoints} 点（{score.pct}%）
                </small>
              </div>
            </div>
            <div className={`rounded-xl border px-3 py-2 text-xs ${targetDiagnosis.tone}`}>
              <div className="font-black">{targetDiagnosis.badge}</div>
              <p className="mt-0.5 text-[11px] font-semibold opacity-90">{targetDiagnosis.detail}</p>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-600 space-y-1">
            <div>正解マーク数：{score.correctCount} / {score.totalCount} 欄</div>
            <div>所要時間：{formatDuration(elapsedSec)} ／ 制限 {activeExam.timeLimitMinutes}分</div>
          </div>
        </div>

        {/* 基準ラインゲージ（全国平均60% / 難関国公立85% / 医・旧帝2次余裕92%） */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
            <span>得点率ゲージ（共通テスト目標ライン比較）</span>
            <span>全国平均目安 60% ／ 難関国公立 85% ／ 2次余裕合格 92%</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2a8c82] to-[#16594f] transition-all"
              style={{ width: `${Math.min(100, score.pct)}%` }}
            />
            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400" style={{ left: '60%' }} title="平均目安 60%" />
            <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500" style={{ left: '85%' }} title="難関国公立 85%" />
            <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-700" style={{ left: '92%' }} title="2次余裕 92%" />
          </div>
        </div>

        {/* マーク番号別 ○× 一覧ストリップ */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {flatEntries.map(entry => {
            const picked = answers[entry.item.id];
            const ok = picked === entry.item.answer;
            return (
              <a
                key={entry.item.id}
                href={`#rev-${entry.item.id}`}
                className={`inline-flex flex-col items-center rounded-lg border px-2 py-1 text-[11px] font-extrabold no-underline ${
                  ok
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-rose-300 bg-rose-50 text-rose-900'
                }`}
              >
                <span>[{entry.markSlot}]</span>
                <span>{ok ? '○' : '×'}</span>
              </a>
            );
          })}
        </div>

        {/* 大問別スコア分析 */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {score.sectionScores.map(sec => {
            const secPct = sec.maxPoints > 0 ? Math.round((sec.earnedPoints / sec.maxPoints) * 100) : 0;
            return (
              <div key={sec.id} className="rounded-xl border border-slate-200/90 bg-[#fffdf8] p-3 text-xs">
                <div className="flex items-center justify-between font-extrabold text-slate-800">
                  <span>
                    {sec.daimonLabel}
                    {sec.recommendedMinutes ? `（目安${sec.recommendedMinutes}分）` : ''}
                  </span>
                  <span className="tabular-nums">
                    {sec.earnedPoints} / {sec.maxPoints} 点（{secPct}%）
                  </span>
                </div>
                <p className="mt-0.5 truncate text-slate-500">{sec.title}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80" aria-hidden="true">
                  <div
                    className={`h-full rounded-full ${secPct >= 85 ? 'bg-emerald-600' : secPct >= 65 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${secPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 弱点スキル＆最優先復習処方箋（ワンタップで該当単元コースへ直行） */}
        {(() => {
          const missedEntries = flatEntries
            .filter(({ item }) => answers[item.id] !== item.answer)
            .sort((a, b) => b.item.points - a.item.points)
            .slice(0, 3);
          if (missedEntries.length === 0) {
            return (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3.5 text-xs text-emerald-950">
                <strong className="font-black">パーフェクト達成！全設問正解です。</strong>
                <span className="ml-2 font-semibold">
                  次の回の実戦模試、または単元演習の「★★★共テ満点・2次」フィルターで記述力をさらに磨きましょう。
                </span>
              </div>
            );
          }
          return (
            <div className="rounded-xl border border-amber-300/90 bg-amber-50/60 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="inline-flex items-center gap-1.5 text-xs font-black text-amber-950">
                  <Target size={14} className="text-amber-700" aria-hidden="true" />
                  得点直結！最優先で潰すべき弱点テーマ Top {missedEntries.length}（単元演習へ直結）
                </strong>
                <span className="text-[11px] font-bold text-amber-900">
                  ここを復習すると +{missedEntries.reduce((s, e) => s + e.item.points, 0)} 点アップ！
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {missedEntries.map(entry => {
                  const recCourseId = recommendCourseForSection(activeExam, entry.section, entry.sectionIndex);
                  const courseMeta = CHEM_COURSES.find(c => c.id === recCourseId);
                  return (
                    <div
                      key={entry.item.id}
                      className="flex flex-col justify-between gap-2 rounded-lg border border-amber-200 bg-white p-2.5 text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-slate-800">
                            [{entry.markSlot}] {entry.section.daimonLabel} {entry.item.label}
                          </span>
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-800">
                            −{entry.item.points}点
                          </span>
                        </div>
                        <p className="mt-1 font-bold text-slate-700 leading-snug">{entry.item.skill}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onGrade(recCourseId);
                          onBack();
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-teal-700/30 bg-teal-50 px-2.5 py-1.5 text-[11px] font-extrabold text-teal-950 hover:bg-teal-100 cursor-pointer"
                      >
                        <span>{courseMeta?.shortLabel ?? '単元演習'}で復習する →</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </section>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="解説フィルター">
        {([
          ['all', `全設問（${flatEntries.length}）`],
          ['wrong', `誤答・未マークのみ（${flatEntries.length - score.correctCount}）`],
          ['flagged', `見直し付箋★（${flags.length}）`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setResultFilter(key)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-extrabold cursor-pointer ${
              resultFilter === key
                ? 'border-[#1f5c53] bg-[#1f5c53] text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="space-y-4">
        {filteredEntries.map(({ section, item, markSlot }) => {
          const picked = answers[item.id];
          const isCorrect = picked === item.answer;
          return (
            <article
              id={`rev-${item.id}`}
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-rose-600 shrink-0" />
                  )}
                  <span className="em-inline-slot-box">{markSlot}</span>
                  <strong className="text-sm font-extrabold text-slate-800">
                    {section.daimonLabel} {item.label}
                  </strong>
                  {item.difficulty && (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${
                        DIFFICULTY_META[item.difficulty].className
                      }`}
                    >
                      {DIFFICULTY_META[item.difficulty].label}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-500">配点 {item.points}点 ・ {item.skill}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                    isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  あなたのマーク：{Number.isInteger(picked) ? CIRCLED_NUMS[picked] : '未マーク'} ／ 正解：{CIRCLED_NUMS[item.answer]}
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
                          <span className="font-extrabold mr-1">{CIRCLED_NUMS[cIdx]}</span>
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
