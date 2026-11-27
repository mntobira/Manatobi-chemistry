import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Flame,
  FlaskConical,
  History,
  Printer,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  CENTER_KYOTSU_TRAPS,
  EXAM_TIMELINE_RECORDS,
  FULL_SCORE_TACTICS,
  type PastExamTrapEntry,
} from '../chemistry/pastExamAnalysis';
import { CHEM_PDF_CATALOG, type ChemPdfEntry } from '../chemistry/chemistryPdfCatalog.generated';
import { CHEM_COURSES, type ChemCourseId } from '../eiken/config';
import { openPdf, type PdfVariantOption } from '../utils/pdfViewer';
import { savePdf } from '../utils/pdfShare';

export interface ChemPastAnalysisStudioProps {
  onBack: () => void;
  backLabel?: string;
  /** ひっかけ18選から該当単元のまとめ＆演習へ1タップ直行 */
  onStartUnit?: (course: ChemCourseId, chapterId: string) => void;
  /** 実戦通し模試モードを開く */
  onOpenMock?: () => void;
  initialTab?: 'pdfs' | 'traps' | 'timeline' | 'tactics';
}

const COURSE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  CHEM_COURSES.map(c => [c.id, c.shortLabel]),
);

function buildVariantOptions(entry: ChemPdfEntry): PdfVariantOption[] | undefined {
  if (!entry.variants || entry.variants.length === 0) return undefined;
  return [
    ...entry.variants.map(v => ({
      label: `${v.label} (${v.pages}p)`,
      url: v.file,
      fileName: v.file.split('/').pop(),
      badge: entry.badge,
    })),
    {
      label: `3冊合本フルパック (${entry.pages}p)`,
      url: entry.file,
      fileName: entry.file.split('/').pop(),
      badge: entry.badge,
    },
  ];
}

export function openChemPdfEntry(
  entry: ChemPdfEntry,
  part?: 'questions' | 'answers' | 'explanations',
  initialPage?: number,
): void {
  const variants = buildVariantOptions(entry);
  const chosenVariant = part ? entry.variants?.find(v => v.part === part) : undefined;
  const url = chosenVariant ? chosenVariant.file : entry.file;
  openPdf(url, entry.title, {
    fileName: url.split('/').pop(),
    initialPage,
    subtitle: entry.subtitle,
    badge: entry.badge,
    variants,
  });
}

export function ChemPastAnalysisStudio({
  onBack,
  backLabel = '学習へ',
  onStartUnit,
  onOpenMock,
  initialTab = 'pdfs',
}: ChemPastAnalysisStudioProps) {
  const [tab, setTab] = useState<'pdfs' | 'traps' | 'timeline' | 'tactics'>(initialTab);
  const [eraFilter, setEraFilter] = useState<'all' | PastExamTrapEntry['eraTag']>('all');
  const [courseFilter, setCourseFilter] = useState<'all' | ChemCourseId>('all');
  const [redSheet, setRedSheet] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const biblePdf = useMemo(() => CHEM_PDF_CATALOG.find(e => e.kind === 'bible'), []);
  const mockPdfs = useMemo(() => CHEM_PDF_CATALOG.filter(e => e.kind === 'mock'), []);
  const summaryPdfs = useMemo(() => CHEM_PDF_CATALOG.filter(e => e.kind === 'summary'), []);

  const filteredTraps = useMemo(() => {
    return CENTER_KYOTSU_TRAPS.filter(t => {
      if (eraFilter !== 'all' && t.eraTag !== eraFilter) return false;
      if (courseFilter !== 'all' && t.course !== courseFilter) return false;
      return true;
    });
  }, [eraFilter, courseFilter]);

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickSave = (entry: ChemPdfEntry) => {
    if (savingId) return;
    setSavingId(entry.id);
    const fn = entry.file.split('/').pop() ?? `${entry.id}.pdf`;
    savePdf(entry.file, fn, entry.title).finally(() => setSavingId(null));
  };

  return (
    <div
      className="min-h-[100dvh] w-full bg-[#F8F6F0] pb-28 font-modern text-slate-800"
      data-chem-past-studio
    >
      {/* 上部ヒーローヘッダー */}
      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-[#0F172A] text-white shadow-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-white/12 px-3 text-xs font-extrabold text-white transition hover:bg-white/20 cursor-pointer"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              <span>{backLabel}</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950">
                  1990–2026 徹底解剖
                </span>
                <span className="hidden text-[11px] font-semibold text-sky-300 sm:inline">
                  センター31年＋共通テスト6年・全39冊PDF収録
                </span>
              </div>
              <h1 className="truncate text-sm font-black tracking-tight sm:text-base">
                共通テスト満点バイブル ＆ 本番形式PDF冊子スタジオ
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {biblePdf && (
              <button
                type="button"
                onClick={() => openChemPdfEntry(biblePdf)}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-xs transition hover:brightness-110 cursor-pointer"
                data-open-bible-pdf
              >
                <Printer size={14} aria-hidden="true" />
                <span>37年バイブルPDFを開く</span>
              </button>
            )}
            {onOpenMock && (
              <button
                type="button"
                onClick={onOpenMock}
                className="hidden items-center gap-1 rounded-full border border-emerald-400/50 bg-emerald-500/15 px-3 py-1.5 text-xs font-extrabold text-emerald-200 transition hover:bg-emerald-500/25 sm:inline-flex cursor-pointer"
              >
                <FlaskConical size={13} aria-hidden="true" />
                <span>実戦模試へ</span>
              </button>
            )}
          </div>
        </div>

        {/* 4タブナビゲーション */}
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2 sm:px-6">
          {[
            { id: 'pdfs' as const, label: '印刷PDF冊子・マークシート (全39冊)', icon: FileText },
            { id: 'traps' as const, label: `歴代ひっかけ誤文＆秒殺${CENTER_KYOTSU_TRAPS.length}選`, icon: AlertTriangle },
            { id: 'timeline' as const, label: 'センター〜共テ37年 出題・平均点分析', icon: History },
            { id: 'tactics' as const, label: '共通テスト100点満点 3大戦術', icon: Target },
          ].map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                data-studio-tab={item.id}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition cursor-pointer ${
                  active
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={14} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 pt-4 sm:px-6 sm:pt-6">
        {/* ============================================================
            TAB 1: 本番形式PDF冊子・A4横マークシート・全単元まとめPDFスタジオ
           ============================================================ */}
        {tab === 'pdfs' && (
          <div className="space-y-6">
            {/* 特集：37年過去問分析＆満点バイブルPDF */}
            {biblePdf && (
              <section className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-[#0F172A] via-[#172554] to-[#1E3A8A] p-4 text-white shadow-md sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <img
                    src={biblePdf.thumb}
                    alt={biblePdf.title}
                    className="h-44 w-32 shrink-0 self-center rounded-lg border border-white/25 bg-white object-cover shadow-lg md:h-48 md:w-36"
                    loading="lazy"
                  />
                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-black text-slate-950">
                        試験会場持ち込み用 最終確認冊子
                      </span>
                      <span className="text-xs font-bold text-sky-200">
                        A4縦・全{biblePdf.pages}ページ（{biblePdf.kb} KB）
                      </span>
                    </div>
                    <h2 className="text-base font-black leading-snug sm:text-xl">
                      {biblePdf.title}
                    </h2>
                    <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
                      センター試験（1990〜2020）の伝統ひっかけから、2025年過去最低平均点（45.34点）・2026年正答率30.1%のエステル化平衡定数トラップまで、試験直前15分で総点検できる凝縮バイブルPDFです。見開き2ページ表示・高精細印刷に対応しています。
                    </p>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => openChemPdfEntry(biblePdf)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 shadow-xs transition hover:bg-sky-50 cursor-pointer"
                      >
                        <BookOpen size={15} aria-hidden="true" />
                        <span>冊子リーダーで開く（見開き・印刷対応）</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSave(biblePdf)}
                        disabled={savingId === biblePdf.id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-white/20 cursor-pointer"
                      >
                        <Download size={15} aria-hidden="true" />
                        <span>PDFを直接保存</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* セクションA：共通テスト実戦模試 全8回（問題冊子＋A4横マークシート＋ステップ詳解） */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
                    <FileSpreadsheet className="text-sky-700" size={20} aria-hidden="true" />
                    <span>共通テスト実戦模試 本番形式PDFパック（全8回・3分冊対応）</span>
                  </h2>
                  <p className="text-xs text-slate-600">
                    表紙（注意事項・原子量表）＋SVG実験図表つき問題冊子・実寸A4横マークシート・ステップ詳解を個別または合本で印刷できます。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                {mockPdfs.map(entry => {
                  const qVar = entry.variants?.find(v => v.part === 'questions');
                  const aVar = entry.variants?.find(v => v.part === 'answers');
                  const eVar = entry.variants?.find(v => v.part === 'explanations');
                  return (
                    <article
                      key={entry.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs transition hover:border-sky-300 hover:shadow-sm"
                    >
                      <div className="flex gap-3.5">
                        <button
                          type="button"
                          onClick={() => openChemPdfEntry(entry, 'questions')}
                          className="group relative shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                          title="問題冊子を開く"
                        >
                          <img
                            src={entry.thumb}
                            alt={entry.title}
                            className="h-32 w-24 object-cover transition group-hover:scale-105"
                            loading="lazy"
                          />
                          <span className="absolute right-1 bottom-1 rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {entry.pages}p
                          </span>
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black text-white ${
                                entry.examCategory === 'basic' ? 'bg-teal-600' : 'bg-indigo-600'
                              }`}
                            >
                              {entry.examCategory === 'basic' ? '化学基礎' : '化学（5大問）'}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700">
                              {entry.badge}
                            </span>
                          </div>
                          <h3 className="mt-1 line-clamp-2 text-sm font-black leading-snug text-slate-900">
                            {entry.title.replace('（本番形式冊子＋A4横マークシート＋詳解）', '')}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-slate-600">
                            {entry.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5">
                        {qVar && (
                          <button
                            type="button"
                            onClick={() => openChemPdfEntry(entry, 'questions')}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11.5px] font-extrabold text-white transition hover:bg-slate-800 cursor-pointer"
                          >
                            <FileText size={13} aria-hidden="true" />
                            <span>問題冊子 ({qVar.pages}p)</span>
                          </button>
                        )}
                        {aVar && (
                          <button
                            type="button"
                            onClick={() => openChemPdfEntry(entry, 'answers')}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-[11.5px] font-extrabold text-rose-900 transition hover:bg-rose-100 cursor-pointer"
                          >
                            <CheckCircle2 size={13} aria-hidden="true" />
                            <span>A4横マークシート</span>
                          </button>
                        )}
                        {eVar && (
                          <button
                            type="button"
                            onClick={() => openChemPdfEntry(entry, 'explanations')}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-[11.5px] font-extrabold text-sky-900 transition hover:bg-sky-100 cursor-pointer"
                          >
                            <Sparkles size={13} aria-hidden="true" />
                            <span>詳解 ({eVar.pages}p)</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleQuickSave(entry)}
                          disabled={savingId === entry.id}
                          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                          title="3冊合本PDFを保存"
                        >
                          <Download size={12} aria-hidden="true" />
                          <span>合本保存</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* セクションB：全6分野・全114単元「1単元1ページA4まとめプリント集」 */}
            <section className="space-y-3">
              <div>
                <h2 className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
                  <BookOpen className="text-teal-700" size={20} aria-hidden="true" />
                  <span>分野別「全114単元 A4まとめプリント集」PDF（全6冊・1単元1ページ完結）</span>
                </h2>
                <p className="text-xs text-slate-600">
                  各単元の「重要公式・反応式」「比較整理テーブル」「共通テストの急所（ひっかけ注意）」を美しい1ページA4シートに凝縮。バインダー綴じ学習に最適です。
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {summaryPdfs.map(entry => (
                  <article
                    key={entry.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs transition hover:border-teal-300"
                  >
                    <div className="flex gap-3">
                      <img
                        src={entry.thumb}
                        alt={entry.title}
                        className="h-28 w-20 shrink-0 rounded-md border border-slate-200 object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[10.5px] font-extrabold text-teal-800">
                          {entry.badge}（全{entry.pages}p）
                        </span>
                        <h3 className="mt-1 text-sm font-black leading-snug text-slate-900">
                          {entry.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                          {entry.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-2.5">
                      <button
                        type="button"
                        onClick={() => openChemPdfEntry(entry)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-teal-800 cursor-pointer"
                      >
                        <BookOpen size={13} aria-hidden="true" />
                        <span>プリント集を開く</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSave(entry)}
                        disabled={savingId === entry.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <Download size={13} aria-hidden="true" />
                        <span>保存</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ============================================================
            TAB 2: センター〜共通テスト 歴代ひっかけ誤文＆秒殺ルール18選（赤シート＆単元直結）
           ============================================================ */}
        {tab === 'traps' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5">
              <div>
                <h2 className="text-sm font-black text-amber-950 sm:text-base">
                  センター(1990–2020)〜共通テスト(2021–2026) 歴代ひっかけ誤文＆秒殺ルール{CENTER_KYOTSU_TRAPS.length}選
                </h2>
                <p className="text-xs text-amber-900/80">
                  「赤シート暗記モード」をONにすると秒殺ルールが隠れ、自分の頭で誤文の根拠を即答できるかテストできます。
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRedSheet(r => !r);
                  setRevealedIds({});
                }}
                data-toggle-redsheet
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black shadow-2xs transition cursor-pointer ${
                  redSheet
                    ? 'bg-rose-600 text-white'
                    : 'border border-rose-300 bg-white text-rose-700 hover:bg-rose-50'
                }`}
              >
                {redSheet ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
                <span>{redSheet ? '赤シートON（タップで1つずつ開示）' : '赤シートで秒殺ルールを隠す'}</span>
              </button>
            </div>

            {/* フィルタバー */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', '正答率30%台の壁', '共テ新傾向(2021-2026)', 'センター〜共テ連続', 'センター鉄板'] as const).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setEraFilter(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-extrabold transition cursor-pointer ${
                    eraFilter === tag
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tag === 'all' ? 'すべて (18)' : tag}
                </button>
              ))}
              <select
                aria-label="分野で絞り込む"
                value={courseFilter}
                onChange={e => setCourseFilter(e.target.value as 'all' | ChemCourseId)}
                className="ml-auto rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800"
              >
                <option value="all">全6分野</option>
                {CHEM_COURSES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.shortLabel}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {filteredTraps.map(trap => {
                const hidden = redSheet && !revealedIds[trap.id];
                return (
                  <article
                    key={trap.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-black text-white">
                            #{String(trap.no).padStart(2, '0')}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${
                              trap.eraTag === '正答率30%台の壁'
                                ? 'bg-rose-100 text-rose-800'
                                : trap.eraTag === '共テ新傾向(2021-2026)'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {trap.eraTag}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600">
                            {COURSE_LABEL_MAP[trap.course] ?? trap.course}
                          </span>
                        </div>
                        <span className="text-[11px] font-extrabold text-teal-700">
                          目標 {trap.targetTimeSec}秒
                        </span>
                      </div>

                      <h3 className="text-sm font-black leading-snug text-slate-900">
                        {trap.title}
                      </h3>

                      <div className="rounded-xl border border-rose-200/90 bg-rose-50/60 px-3 py-2 text-xs leading-relaxed text-rose-950">
                        <span className="mr-1 inline-block rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                          典型誤文
                        </span>
                        <span className="font-semibold">{trap.wrongStatementExample}</span>
                      </div>

                      {hidden ? (
                        <button
                          type="button"
                          onClick={() => toggleReveal(trap.id)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-rose-300 bg-rose-500/10 px-3 py-4 text-xs font-black text-rose-700 hover:bg-rose-500/15 cursor-pointer"
                        >
                          <Eye size={15} aria-hidden="true" />
                          <span>タップして「満点秒殺ルール」を表示</span>
                        </button>
                      ) : (
                        <div
                          onClick={() => redSheet && toggleReveal(trap.id)}
                          className={`rounded-xl border border-teal-200 bg-teal-50/55 px-3 py-2 text-xs leading-relaxed text-slate-900 ${
                            redSheet ? 'cursor-pointer' : ''
                          }`}
                        >
                          <span className="mr-1 inline-block rounded bg-teal-700 px-1.5 py-0.5 text-[10px] font-black text-white">
                            秒殺ルール
                          </span>
                          <span className="font-bold">{trap.instantKillRule}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        出題歴：{trap.appearances}
                      </span>
                      {onStartUnit && (
                        <button
                          type="button"
                          onClick={() => onStartUnit(trap.course, trap.chapterId)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11.5px] font-extrabold text-white transition hover:bg-slate-700 cursor-pointer"
                        >
                          <span>この単元を演習する</span>
                          <ArrowRight size={13} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: センター試験(1990–2020)〜共通テスト(2021–2026) 年度別徹底分析
           ============================================================ */}
        {tab === 'timeline' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <h2 className="text-sm font-black text-slate-900 sm:text-base">
                センター試験31年＋共通テスト6年：平均点推移・A/B/C難易度比率・差がついた急所
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                共通テスト『化学』は例年約33マーク中、<strong>A問題（基礎知識・センター正誤直系）＋B問題（典型計算・グラフ）が約29〜31マーク（約90%）</strong>を占め、残り2〜4マークのC問題（正答率30%台）が90点〜100点満点の分水嶺になっています。
              </p>
            </div>

            <div className="space-y-3.5">
              {EXAM_TIMELINE_RECORDS.map(rec => {
                const pct = Math.min(100, Math.round(rec.chemAvg));
                return (
                  <article
                    key={rec.year}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-black text-white ${
                            rec.era === 'kyotsu' ? 'bg-indigo-600' : 'bg-amber-700'
                          }`}
                        >
                          {rec.era === 'kyotsu' ? '共通テスト' : 'センター試験'}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 sm:text-base">
                          {rec.examLabel}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-extrabold text-slate-800">
                          化学平均：<strong className="text-indigo-700">{rec.chemAvg.toFixed(2)}</strong> / 100点
                        </span>
                        {rec.basicAvg !== undefined && (
                          <span className="rounded-lg bg-teal-50 px-2.5 py-1 font-extrabold text-teal-900">
                            化学基礎：<strong>{rec.basicAvg.toFixed(1)}</strong> / 50点
                          </span>
                        )}
                        <span className="rounded-lg bg-amber-50 px-2.5 py-1 font-bold text-amber-950">
                          {rec.abcRatio}
                        </span>
                      </div>
                    </div>

                    {/* 平均点ビジュアルバー */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            rec.chemAvg < 50 ? 'bg-rose-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">
                        全{rec.markCount}マーク
                      </span>
                    </div>

                    <p className="mt-2.5 text-xs font-extrabold leading-relaxed text-slate-800 sm:text-[13px]">
                      {rec.headline}
                    </p>

                    <ul className="mt-2.5 grid grid-cols-1 gap-1.5 text-xs text-slate-700 md:grid-cols-2">
                      {rec.signatureTopics.map((topic, idx) => (
                        <li
                          key={idx}
                          className="rounded-lg bg-slate-50 px-2.5 py-1.5 leading-snug"
                        >
                          {topic}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/65 px-3 py-2 text-xs leading-relaxed text-rose-950">
                      <span className="mr-1.5 inline-flex items-center gap-1 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                        <Flame size={11} aria-hidden="true" />
                        差がついた急所
                      </span>
                      <span className="font-bold">{rec.lowAccuracyTrap}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: 共通テスト100点満点・化学基礎50点満点 3大実戦戦術
           ============================================================ */}
        {tab === 'tactics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {FULL_SCORE_TACTICS.map(tac => (
                <article
                  key={tac.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:p-5"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-black text-white">
                      <Award size={13} aria-hidden="true" />
                      {tac.stepNo}
                    </span>
                    <h2 className="text-sm font-black text-slate-900 sm:text-base">
                      {tac.title}
                    </h2>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600 sm:text-sm">
                    {tac.summary}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {tac.bulletPoints.map((bp, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/45 px-3 py-2 text-xs font-bold leading-relaxed text-slate-800 sm:text-[13px]"
                      >
                        <CheckCircle2
                          size={15}
                          className="mt-0.5 shrink-0 text-indigo-600"
                          aria-hidden="true"
                        />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            {/* 60分タイムテーブル早見カード */}
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
              <h3 className="text-sm font-black text-emerald-950 sm:text-base">
                共通テスト『化学』（60分・100点）満点者の標準ペース配分
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-6">
                {[
                  { label: '第1問 物質の状態', min: '10分', tip: 'グラフ格子点を即代入' },
                  { label: '第2問 反応と平衡', min: '11分', tip: '緩衝液2:1・ΔH符号確認' },
                  { label: '第3問 無機物質', min: '9分', tip: '逆推論パズルは2周目へ' },
                  { label: '第4問 有機化合物', min: '11分', tip: '異性体書き出しは余白整理' },
                  { label: '第5問 高分子・総合', min: '11分', tip: 'エステルKに水H₂Oを入れる' },
                  { label: '2周目＆マーク検算', min: '8分', tip: '保留回収＋マークずれゼロ確認' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-emerald-200 bg-white p-2.5 text-center shadow-2xs"
                  >
                    <div className="text-[11px] font-extrabold text-slate-600">{item.label}</div>
                    <div className="my-1 text-base font-black text-emerald-700">{item.min}</div>
                    <div className="text-[10.5px] font-semibold leading-tight text-slate-500">
                      {item.tip}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
