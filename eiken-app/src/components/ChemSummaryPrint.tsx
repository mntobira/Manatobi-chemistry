/**
 * =====================================================================
 * 単元別「まとめプリント」（1画面完結・演習直前＆いつでも見返し可能）
 * =====================================================================
 * ご要望：
 *   「まとめプリントを（１画面に収まる量）出して、その次のボタンを押したら、
 *     それに対する問題が複数問出てくるようにしようと思う。」
 *
 * 設計方針：
 *   1. `fixed inset-0 h-[100dvh] overflow-hidden` で上下を固定し、
 *      スマホ（390×844）・PC（1280×800）ともに 1画面に気持ちよく収まる情報量に厳選。
 *      （小型端末 SE 等で万が一高さが足りないときだけ内側グリッドが安全にスクロール）
 *   2. 構成は 3 ブロックのみ：
 *      ① 要点・公式（KaTeX + mhchem 対応、2〜3項目）
 *      ② 比較まとめ表（3〜5行のコンパクト表）
 *      ③ 共通テストの急所（ひっかけ対策 2項目）
 *   3. 下部固定の主ボタン「問題へ進む（全N問）→」を押すと、このプリントに対応した
 *      複数問の演習がそのまま始まる。問題中・解説中もヘッダーからモーダルで再確認可能。
 */
import { useState } from 'react';
import { ArrowLeft, AlertTriangle, BookOpenCheck, ChevronRight, Eye, EyeOff, FlaskConical, Printer, Table2, X } from 'lucide-react';
import { formatText } from '../utils/textFormatter';
import { CHEM_PDF_CATALOG } from '../chemistry/chemistryPdfCatalog.generated';
import { openPdf } from '../utils/pdfViewer';
import type { Chapter } from '../types/curriculum';

export interface ChemSummaryPrintProps {
  chapter: Chapter;
  questionCount: number;
  subQuestionCount: number;
  /** 初回ブリーフィング表示時は「単元選択に戻る」、問題中の参照モーダル時は undefined */
  onExit?: () => void;
  onReturnToBattle?: () => void;
  /** 「問題へ進む」またはモーダルの「問題にもどる」 */
  onStart: () => void;
  /** 問題中・解説中から開いたオーバーレイ表示か */
  isOverlay?: boolean;
}

export function ChemSummaryPrint({
  chapter,
  questionCount,
  subQuestionCount,
  onExit,
  onReturnToBattle,
  onStart,
  isOverlay = false,
}: ChemSummaryPrintProps) {
  const sheet = chapter.summarySheet;
  const cleanUnitTitle = chapter.abstractTitle.replace(/（大問\d+題・計\d+問）$/, '');
  const [redSheetMode, setRedSheetMode] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const summaryPdfEntry = CHEM_PDF_CATALOG.find(
    e => e.kind === 'summary' && e.unitPageMap && chapter.id in e.unitPageMap,
  );
  const unitPdfPage = summaryPdfEntry?.unitPageMap?.[chapter.id];

  const toggleReveal = (key: string) => {
    setRevealedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!sheet) return null;

  return (
    <div
      data-chem-summary-print
      role={isOverlay ? 'dialog' : 'region'}
      aria-modal={isOverlay || undefined}
      aria-label={`${cleanUnitTitle} まとめプリント`}
      className="fixed inset-0 z-[60] flex h-[100dvh] w-full flex-col overflow-hidden bg-[#FDFBF7] font-modern text-[#1E293B]"
    >
      {onReturnToBattle && !isOverlay && (
        <button
          type="button"
          onClick={onReturnToBattle}
          className="min-h-10 shrink-0 border-b border-blue-200 bg-blue-50 px-3 pt-[calc(0.35rem+env(safe-area-inset-top,0px))] pb-1.5 text-xs font-bold text-blue-900"
        >
          バトル結果・解説に戻る
        </button>
      )}

      {/* 上部バー：極力スリムにして 1 画面の本文領域を最大化 */}
      <header
        className={`flex-none border-b border-[#E6DEC8] bg-[#FFFAF0] px-3 pb-2 md:px-6 md:py-2.5 ${
          onReturnToBattle && !isOverlay
            ? 'pt-2'
            : 'pt-[calc(0.5rem+env(safe-area-inset-top,0px))] md:pt-2.5'
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {onExit && !isOverlay ? (
              <button
                type="button"
                onClick={onExit}
                title="単元選択に戻る"
                aria-label="単元選択に戻る"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-amber-100/60"
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
            ) : null}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#2C3E50] px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-white">
                  <BookOpenCheck size={12} aria-hidden="true" />
                  まとめプリント
                </span>
                <span className="truncate text-[11px] font-bold text-slate-500">
                  {chapter.realTitle}
                </span>
              </div>
              <h2 className="mt-0.5 truncate text-[15px] font-extrabold leading-tight text-[#1B2631] md:text-lg">
                {cleanUnitTitle}
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              data-chem-redsheet-toggle
              aria-pressed={redSheetMode}
              onClick={() => {
                setRedSheetMode(m => !m);
                setRevealedKeys({});
              }}
              className={`inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold transition ${
                redSheetMode
                  ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                  : 'border-rose-300 bg-rose-50/80 text-rose-800 hover:bg-rose-100/80'
              }`}
            >
              {redSheetMode ? <Eye size={13} aria-hidden="true" /> : <EyeOff size={13} aria-hidden="true" />}
              <span>{redSheetMode ? '赤シート中' : '赤シート暗記'}</span>
            </button>

            {summaryPdfEntry && unitPdfPage && (
              <button
                type="button"
                onClick={() =>
                  openPdf(summaryPdfEntry.file, summaryPdfEntry.title, {
                    fileName: summaryPdfEntry.file.split('/').pop(),
                    initialPage: unitPdfPage,
                    subtitle: `${cleanUnitTitle}（第${unitPdfPage}ページ）`,
                    badge: summaryPdfEntry.badge,
                  })
                }
                className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-[#2C3E50]/25 bg-white px-2.5 py-1 text-xs font-extrabold text-[#1E3A5F] shadow-2xs transition hover:bg-sky-50 cursor-pointer"
                title="この単元のA4まとめプリントPDFを開く（印刷・保存対応）"
                data-chem-summary-pdf-btn
              >
                <Printer size={14} aria-hidden="true" />
                <span className="hidden sm:inline">A4まとめPDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}

            {isOverlay ? (
              <button
                type="button"
                onClick={onStart}
                aria-label="まとめプリントを閉じる"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              >
                <X size={18} aria-hidden="true" />
              </button>
            ) : (
              <div className="hidden shrink-0 rounded-xl border border-[#E6DEC8] bg-white px-2.5 py-1 text-right sm:block">
                <div className="text-[10px] font-bold text-slate-400">このあと演習</div>
                <div className="text-xs font-extrabold text-[#2C3E50]">
                  全{subQuestionCount}問
                  {questionCount !== subQuestionCount ? `（大問${questionCount}）` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 本体：PC は左右2段組（左：公式＋急所 / 右：整理表）、スマホは高密度3段カードで 1 画面に収める */}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 md:px-6 md:py-3.5">
        <div className="mx-auto flex h-full max-w-5xl flex-col justify-between gap-2 md:gap-3">
          {/* 単元の核心1行バナー */}
          <div className="flex-none rounded-xl border border-[#DCE7F2] bg-[#F3F8FC] px-3 py-1.5 md:px-4 md:py-2">
            <p className="text-xs font-bold leading-snug text-[#1E3A5F] md:text-sm">
              {formatText(sheet.subtitle)}
            </p>
          </div>

          {/* メイングリッド */}
          <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-2 md:grid-cols-12 md:items-stretch md:gap-3">
            {/* 左カラム（PC 5列）：① 要点・公式・定義 ＋ ③ 共通テストの急所 */}
            <div className="flex flex-col gap-2 md:col-span-5 md:justify-between md:gap-3">
              <section
                aria-label="要点・公式"
                className="rounded-2xl border border-[#E5DEC9] bg-white px-3 py-2 shadow-2xs md:flex-1 md:px-4 md:py-3"
              >
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0F766E] md:mb-2 md:text-[13px]">
                  <FlaskConical size={14} aria-hidden="true" />
                  <span>要点・公式・反応式</span>
                </h3>
                <ul className="space-y-1.5 md:space-y-2">
                  {sheet.formulas.map((f, idx) => {
                    const fKey = `f:${idx}`;
                    const masked = redSheetMode && !revealedKeys[fKey];
                    return (
                      <li
                        key={idx}
                        onClick={redSheetMode ? () => toggleReveal(fKey) : undefined}
                        className={`rounded-xl border border-teal-200/80 border-l-4 border-l-teal-600 bg-teal-50/40 px-2.5 py-1.5 md:px-3 md:py-2 ${
                          redSheetMode ? 'cursor-pointer select-none active:bg-teal-100/50' : ''
                        }`}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                          <span className="text-[11px] font-extrabold text-teal-800 md:text-xs">
                            {formatText(f.label)}
                          </span>
                          {f.note && (
                            <span className="text-[11px] font-semibold text-slate-500">
                              {formatText(f.note)}
                            </span>
                          )}
                        </div>
                        <div
                          className={`mt-0.5 rounded px-1 py-0.5 text-[13px] font-bold leading-snug transition md:text-sm ${
                            masked
                              ? 'bg-rose-500/90 text-transparent selection:bg-transparent'
                              : 'text-slate-900'
                          }`}
                          title={masked ? 'タップで開く' : undefined}
                        >
                          {formatText(f.expr)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section
                aria-label="共通テストの急所"
                className="rounded-2xl border border-amber-200/90 bg-[#FFFDF5] px-3 py-2 shadow-2xs md:px-4 md:py-2.5"
              >
                <h3 className="mb-1 flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-amber-800 md:text-[13px]">
                  <AlertTriangle size={14} aria-hidden="true" />
                  <span>共通テストの急所（ひっかけ注意）</span>
                </h3>
                <ul className="space-y-1.5">
                  {sheet.traps.map((trap, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-1.5 text-xs font-semibold leading-snug text-slate-800 md:text-[13px]"
                    >
                      <span className="mt-0.5 inline-flex shrink-0 items-center justify-center rounded-md bg-amber-200/90 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-amber-950">
                        急所{idx + 1}
                      </span>
                      <span className="min-w-0">{formatText(trap)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* 右カラム（PC 7列）：② 1画面整理テーブル */}
            <section
              aria-label="比較・整理表"
              className="flex flex-col rounded-2xl border border-[#E5DEC9] bg-white px-3 py-2 shadow-2xs md:col-span-7 md:px-4 md:py-3"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2 md:mb-2">
                <h3 className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#2C3E50] md:text-[13px]">
                  <Table2 size={14} aria-hidden="true" />
                  <span>{sheet.table.caption || '比較・整理まとめ'}</span>
                </h3>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left text-xs md:text-[13px]">
                  <thead>
                    <tr className="bg-[#F1F5F9] text-[#1E293B]">
                      {sheet.table.headers.map((h, hi) => (
                        <th
                          key={hi}
                          className="border-b border-slate-200 px-2 py-1.5 font-extrabold whitespace-nowrap md:px-3 md:py-2"
                        >
                          {formatText(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sheet.table.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 1 ? 'bg-slate-50/55' : 'bg-white'}>
                        {row.map((cell, ci) => {
                          const cKey = `c:${ri}:${ci}`;
                          const cellMasked = redSheetMode && ci > 0 && !revealedKeys[cKey];
                          return (
                            <td
                              key={ci}
                              onClick={redSheetMode && ci > 0 ? () => toggleReveal(cKey) : undefined}
                              className={`px-2 py-1.5 leading-snug align-top md:px-3 md:py-2 ${
                                ci === 0
                                  ? 'font-extrabold text-[#1E293B] sm:whitespace-nowrap'
                                  : 'font-medium text-slate-700'
                              } ${redSheetMode && ci > 0 ? 'cursor-pointer select-none' : ''}`}
                            >
                              <span
                                className={
                                  cellMasked
                                    ? 'inline-block rounded bg-rose-500/85 px-1 text-transparent selection:bg-transparent'
                                    : undefined
                                }
                              >
                                {formatText(cell)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* 下部固定アクションバー */}
      <footer className="flex-none border-t border-[#E6DEC8] bg-white px-3 pt-2 pb-[calc(0.55rem+env(safe-area-inset-bottom,0px))] md:px-6 md:py-3">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            data-chem-summary-start
            onClick={onStart}
            className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2C3E50] px-5 py-2.5 text-sm font-extrabold tracking-wider text-white shadow-md transition-all duration-200 hover:bg-[#1B2631] active:bg-[#1B2631] md:py-3 md:text-[15px]"
          >
            <span>
              {isOverlay
                ? '問題・解説にもどる'
                : `確認問題へ進む（全${subQuestionCount}問）`}
            </span>
            <ChevronRight size={17} className="stroke-[2.5]" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}
