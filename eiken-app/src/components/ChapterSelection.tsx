import React, { useEffect, useMemo, useRef, useState } from 'react';
import { type SubjectKey } from '../data/allChapters';
import { ArrowLeft, FlaskConical, PenLine } from 'lucide-react';
import { DoorMascot } from './DoorMascot';
import { subjectTheme } from '../data/subjectTheme';
import type { Chapter } from '../types/curriculum';
import { problemKey, readSolvedMap } from '../utils/progress';
import {
  quizAnswersKey,
  quizExplKey,
  quizIndexKey,
  quizRunKey,
} from '../utils/quizStorageKeys';
import { auth } from '../firebase';
import { buildUnitSections } from '../data/unitSections';
import { UnitCard } from './UnitCard';
import './unit-select.css';
import { accuracyOf, readUnitStats } from '../utils/unitStats';
import { isStageCleared, readStageRecords, stageKey } from '../utils/stageRecords';
import { safeGetItem, safeParseJson } from '../utils/safeLocalStorage';
import { getChapterGroups, splitTabTitle } from '../utils/chapterGroups';

interface ChapterSelectionProps {
  mode: 'mini_test' | 'practice';
  onSelectChapter: (
    id: string,
    questionIndex?: number,
    resume?: boolean,
    range?: { startIndex: number; endIndex: number } | null,
  ) => void;
  onBack: () => void;
  onChangeSubject?: () => void;
  rememberedGroup?: string;
  onGroupChange?: (group: string) => void;
  backLabel?: string;
  subject?: SubjectKey;
  /** 分野画面から「共通テスト実戦 通し模試」を直接開く */
  onOpenMock?: (examKind?: 'written' | 'listening') => void;
  /** 分野画面から「実験考察・構造決定ラボ」を直接開く */
  onOpenWriting?: (taskKey: string) => void;
}

export function ChapterSelection({
  mode,
  onSelectChapter,
  onBack,
  subject = 'chem_basic_matter',
  rememberedGroup,
  onGroupChange,
  backLabel = '戻る',
  onOpenMock,
  onOpenWriting,
}: ChapterSelectionProps) {
  const theme = subjectTheme(subject);
  const groups = useMemo(() => getChapterGroups(subject), [subject]);

  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [activeGroupTitle, setActiveGroupTitle] = useState(
    groups.some(g => g.title === rememberedGroup) ? rememberedGroup! : groups[0]?.title || '',
  );
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const uid = auth.currentUser?.uid || 'guest';
  const [solvedMap] = useState(() => readSolvedMap(uid));
  const [stageRecords] = useState(() => readStageRecords(uid));
  const [unitStats] = useState(() => readUnitStats(uid));

  useEffect(() => {
    setActiveGroupTitle(groups.some(g => g.title === rememberedGroup) ? rememberedGroup! : groups[0]?.title || '');
    setExpandedChapterId(null);
  }, [groups, rememberedGroup]);

  useEffect(() => {
    tabRefs.current[activeGroupTitle]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeGroupTitle]);

  const activeGroup = groups.find(group => group.title === activeGroupTitle) || groups[0];

  const chapterNumberById = useMemo(() => {
    const m = new Map<string, number>();
    groups.flatMap(g => g.chapters).forEach((c, i) => m.set(c.id, i));
    return m;
  }, [groups]);

  const unitSections = useMemo(() => {
    const chapters = activeGroup?.chapters ?? [];
    return buildUnitSections<Chapter>(subject, chapters, c =>
      (mode === 'mini_test' ? c.miniTest || [] : c.practiceProblems || []).length,
    );
  }, [subject, activeGroup, mode]);

  const orderedChapters = useMemo(() => unitSections.flatMap(sec => sec.chapters), [unitSections]);
  const unitSectionByChapter = useMemo(() => {
    const m = new Map<string, (typeof unitSections)[number]>();
    for (const sec of unitSections) for (const c of sec.chapters) m.set(c.id, sec);
    return m;
  }, [unitSections]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mtb-page chapter-route flex h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] min-h-0 w-full flex-col overflow-hidden notebook-paper p-3 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:p-5 sm:pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:p-6 md:pb-[calc(5.75rem+env(safe-area-inset-bottom))] relative font-handwriting">
      <header className="chapter-route-heading unit-head shrink-0">
        <button type="button" onClick={onBack} className="unit-head-back" aria-label={`${backLabel}へ戻る`}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>{backLabel}</span>
        </button>
        <div className="unit-head-title">
          <h2 style={{ color: theme.accent }}>{theme.label}</h2>
          <p>
            {mode === 'mini_test'
              ? '確認テスト（共通テスト形式）'
              : '共通テスト対策（正誤・計算・実験グラフ・探究考察・構造決定）'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {onOpenMock && (
            <button
              type="button"
              onClick={() => onOpenMock('written')}
              className="inline-flex items-center gap-1 rounded-full border border-[#3e9c93]/55 bg-[#fffdf8] px-3 py-1.5 text-xs font-extrabold text-[#1f5c53] shadow-[0_2px_0_#d8ebe6] transition hover:bg-[#edf9f6] cursor-pointer"
              data-chapter-open-mock
            >
              <FlaskConical size={13} aria-hidden="true" />
              <span>通し模試へ</span>
            </button>
          )}
          {onOpenWriting && (
            <button
              type="button"
              onClick={() => onOpenWriting('')}
              className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#c9883a]/45 bg-[#fffdf8] px-3 py-1.5 text-xs font-extrabold text-[#7d4912] shadow-[0_2px_0_#f0dfc2] transition hover:bg-[#fdf6ea] cursor-pointer"
              data-chapter-open-lab
            >
              <PenLine size={13} aria-hidden="true" />
              <span>考察ラボ</span>
            </button>
          )}
        </div>
        <DoorMascot subject={subject} showSpeech={false} size="mini" className="unit-head-mascot w-auto" />
      </header>

      <div className="chapter-workspace flex min-h-0 flex-1 flex-col font-handwriting lg:!flex-col lg:!gap-2.5">
        {groups.length > 0 && (
          <div
            className="chapter-index mb-3 shrink-0 border-b border-slate-200/80 lg:!w-full lg:!pr-0 lg:!mb-1 lg:!border-r-0"
            data-few-tabs={groups.length <= 3 || undefined}
          >
            <div
              role="tablist"
              aria-label="章を選択"
              className={`flex touch-pan-x snap-x snap-mandatory gap-1.5 overflow-x-auto overscroll-x-contain px-0.5 pb-2 [scrollbar-width:thin] sm:grid sm:overflow-x-visible sm:overscroll-auto ${
                groups.length >= 6
                  ? 'sm:grid-cols-3 lg:!grid lg:!grid-cols-6'
                  : groups.length === 5
                  ? 'sm:grid-cols-3 lg:!grid lg:!grid-cols-5'
                  : groups.length === 4
                  ? 'sm:grid-cols-2 lg:!grid lg:!grid-cols-4'
                  : groups.length === 3
                  ? 'sm:grid-cols-3 lg:!grid lg:!grid-cols-3'
                  : 'sm:grid-cols-2 lg:!grid lg:!grid-cols-2'
              }`}
            >
              {groups.map((group, index) => {
                const isActive = group.title === activeGroup?.title;
                const { kicker: chapterNumber, label: shortTitle } = splitTabTitle(group.title, index);

                return (
                  <button
                    key={group.title}
                    ref={element => {
                      tabRefs.current[group.title] = element;
                    }}
                    id={`chapter-tab-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="chapter-tab-panel"
                    onClick={() => {
                      setActiveGroupTitle(group.title);
                      onGroupChange?.(group.title);
                      setExpandedChapterId(null);
                      document.getElementById('chapter-tab-panel')?.scrollTo({ top: 0 });
                    }}
                    className={`flex h-full min-h-[3rem] w-[42vw] min-w-[8.5rem] max-w-[12rem] shrink-0 snap-center flex-col justify-center rounded-xl border px-2.5 py-2 text-left transition-all cursor-pointer sm:w-auto sm:min-w-0 sm:max-w-none sm:shrink ${
                      isActive
                        ? 'border-[#A9CCE3] bg-[#2C3E50] text-white shadow-sm'
                        : 'border-slate-200 bg-white/75 text-slate-600 hover:border-[#A9CCE3] hover:bg-white'
                    }`}
                  >
                    <span
                      className="block text-xs font-bold leading-none"
                      style={{ color: isActive ? theme.accentSoft : theme.accent }}
                    >
                      {chapterNumber}・{group.chapters.length}単元
                    </span>
                    <span className="mt-1 block text-xs sm:text-sm font-bold leading-snug break-words [overflow-wrap:anywhere]">
                      {shortTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeGroup && (
          <section
            id="chapter-tab-panel"
            role="tabpanel"
            aria-labelledby={`chapter-tab-${groups.indexOf(activeGroup)}`}
            tabIndex={0}
            className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain rounded-2xl border border-slate-200/80 bg-white/35 p-3 pb-6 sm:p-4 sm:pb-6 [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable]"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
              <p className="text-xs font-bold" style={{ color: theme.accent }}>
                {activeGroup.partTitle}
              </p>
            </div>

            <div className="chapter-route-list unit-card-list xl:!grid-cols-2">
              {orderedChapters.map((chapter, routeIndex) => {
                const questions = mode === 'mini_test' ? chapter.miniTest || [] : chapter.practiceProblems || [];
                const hasQuestions = questions.length > 0;
                const savedIndex = Math.max(
                  0,
                  Math.min(
                    questions.length - 1,
                    parseInt(safeGetItem(quizIndexKey(chapter.id, mode)) || '0', 10) || 0,
                  ),
                );
                const hasSavedProgress =
                  hasQuestions &&
                  (savedIndex > 0 ||
                    safeGetItem(quizExplKey(chapter.id, mode)) === 'true' ||
                    !!safeGetItem(quizRunKey(chapter.id, mode)) ||
                    Object.keys(safeParseJson<object>(safeGetItem(quizAnswersKey(chapter.id, mode)), {}) ?? {})
                      .length > 0);
                const solvedCount = questions.filter(q => solvedMap[problemKey(chapter.id, q.id)]).length;
                const stat = unitStats[chapter.id];
                const stage = stageRecords[stageKey(chapter.id)];
                const status = isStageCleared(stage)
                  ? 'done'
                  : solvedCount > 0 || hasSavedProgress || !!stat || !!stage
                  ? 'doing'
                  : 'todo';

                const section = unitSectionByChapter.get(chapter.id);
                const prevSection =
                  routeIndex > 0 ? unitSectionByChapter.get(orderedChapters[routeIndex - 1].id) : undefined;
                const stageHeading =
                  section?.label && section !== prevSection ? (
                    <h4
                      className="math-stage-heading col-span-full flex items-center justify-between gap-2"
                      data-stage={section.key?.split(':')[1] ?? section.key ?? ''}
                    >
                      <span>{section.label}</span>
                      <small className="shrink-0 whitespace-nowrap">{section.chapters.length}単元</small>
                    </h4>
                  ) : null;
                const expanded = expandedChapterId === chapter.id;
                const totalSubQuestions = questions.reduce((sum, q) => sum + (q.subQuestions?.length || 1), 0);

                return (
                  <React.Fragment key={chapter.id}>
                    {stageHeading}
                    <div data-unit-id={chapter.id} data-unit-full-title={chapter.title}>
                      <UnitCard
                        index={chapterNumberById.get(chapter.id) ?? routeIndex}
                        title={chapter.abstractTitle}
                        topics={chapter.topics}
                        questionCount={questions.length}
                        countLabel={`大問${questions.length}題・設問${totalSubQuestions}問`}
                        status={status}
                        accuracy={accuracyOf(stat)}
                        perfects={stage?.p ?? 0}
                        hasSavedProgress={hasSavedProgress}
                        expanded={expanded}
                        accent={theme.accent}
                        onToggle={() => setExpandedChapterId(expanded ? null : chapter.id)}
                        onStart={() => onSelectChapter(chapter.id, 0, false)}
                        onResume={() => onSelectChapter(chapter.id, savedIndex, true)}
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
