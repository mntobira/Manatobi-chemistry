import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, FileText, FlaskConical, Table2, X } from 'lucide-react';
import { FigureCarousel } from './ListeningMaterials';
import { parseExplanationBlocks } from './explanationBlocks';
import type { TableBlock } from './explanationBlocks';
import { formatText } from '../utils/textFormatter';
import { cleanQuestionText } from '../utils/questionDisplay';

/**
 * 化学・多資料問題のための「マナトビリスニング第6問B式」1画面切替ワークスペース
 * ==============================================================================
 * ご要望：
 *   「あとUIもスマホを最大限生かすUIにして。特に、資料が多い問題は
 *     マナトビリスニング第６問Bを参考に。使いやすいようにうまくしてほしい。」
 *
 * ■ 特徴
 *   1. 資料（リード文・条件／実験表／複数の図・グラフ）を 1行ピルタブで即切り替え。
 *      画面の縦スクロールで選択肢が見えなくなる現象を根絶する。
 *   2. 実験表・条件表のセルをタップすると「○（赤）→ ×（灰）→ 消去」と冊子書き込みメモができる。
 *   3. 図・グラフは ResizeObserver でペインの空き高さに合わせてアスペクト比を保って最大表示し、
 *      図の上をタップして ○/× スタンプを置ける＋44px「拡大」ボタンでピンチズーム確認できる。
 *   4. 2枚以上の図・グラフがある問題は `FigureCarousel`（◀ ▶ ＋ ピルボタン ＋ 左右スワイプ）で
 *      1枚ずつ大きく見比べられる（まさにリスニング第6問Bと同じ操作感！）。
 */

type Mark = '' | '○' | '×';
const NEXT_MARK: Record<Mark, Mark> = { '': '○', '○': '×', '×': '' };
type StampPoint = { x: number; y: number; v: '○' | '×' };

export interface ChemSlideFigure {
  url: string;
  label: string;
  caption?: string;
}

export interface ChemStructuredTable {
  caption?: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}

export interface ChemMaterialDeckProps {
  /** 問題リード文（Markdown表や【…】見出しを含みうる） */
  leadText: string;
  /** 単一図版（後方互換） */
  imageUrl?: string;
  imageCaption?: string;
  /** 複数図版（第6問B式カルーセル） */
  figures?: readonly ChemSlideFigure[];
  /** 構造化データ表（セル ○/× 書き込み対応） */
  dataTable?: ChemStructuredTable;
  /** 探究会話（通し模試用・任意） */
  dialogue?: readonly { speaker: string; text: string }[];
  /** ハイライト語句 */
  highlights?: string[];
  /** 現在解答中の小問文（図・表への言及を検出して参照バッジを表示する） */
  activeSubPrompt?: string;
  /** コンパクト高さ制限（模試スマホ画面など親が flex-1 でないとき用） */
  compactMaxHeightClass?: string;
}

/** 図を空き領域いっぱいにアスペクト比維持で収め、タップ ○/× スタンプと 44px 拡大モーダルを備える */
export function ChemFitFigure({
  src,
  caption,
}: {
  src: string;
  caption?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [pts, setPts] = useState<StampPoint[]>([]);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect;
      if (r) setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomed]);

  const fitted = useMemo(() => {
    if (!natural || !box.w || !box.h) return null;
    const scale = Math.min(box.w / natural.w, box.h / natural.h);
    return {
      w: Math.max(1, Math.floor(natural.w * scale)),
      h: Math.max(1, Math.floor(natural.h * scale)),
    };
  }, [natural, box]);

  const placeStamp = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setPts(prev => {
      const hit = prev.findIndex(p => Math.hypot(p.x - x, p.y - y) < 8);
      if (hit < 0) return [...prev, { x, y, v: '○' }];
      const cur = prev[hit]!;
      return cur.v === '○'
        ? prev.map((p, k) => (k === hit ? { ...p, v: '×' } : p))
        : prev.filter((_, k) => k !== hit);
    });
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div
        ref={wrapRef}
        className="relative flex flex-1 min-h-[150px] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-[#FCFBF8] p-1"
      >
        <div
          onClick={placeStamp}
          style={fitted ? { width: fitted.w, height: fitted.h } : undefined}
          className="relative flex max-h-full max-w-full cursor-pointer select-none items-center justify-center"
          title="図をタップすると ○ → × → 消去 の印を付けられます"
        >
          <img
            src={src}
            alt={caption || '実験図・グラフ'}
            onLoad={e => {
              const im = e.currentTarget;
              if (im.naturalWidth && im.naturalHeight) {
                setNatural({ w: im.naturalWidth, h: im.naturalHeight });
              }
            }}
            className="block h-full w-full object-contain"
          />
          {pts.map((p, idx) => (
            <span
              key={idx}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-1.5 py-0.5 text-base font-black leading-none shadow-sm ${
                p.v === '○' ? 'text-rose-600 ring-1 ring-rose-300' : 'text-slate-600 ring-1 ring-slate-300'
              }`}
            >
              {p.v}
            </span>
          ))}
        </div>

        <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1">
          {pts.length > 0 && (
            <button
              type="button"
              onClick={() => setPts([])}
              className="min-h-[36px] rounded-lg border border-slate-300 bg-white/95 px-2 text-[11px] font-extrabold text-slate-600 shadow-xs"
            >
              印クリア
            </button>
          )}
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="図を拡大表示"
            data-chem-fig-zoom
            className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-slate-300 bg-white/95 px-2.5 py-1 text-xs font-extrabold text-slate-800 shadow-xs active:bg-slate-100"
          >
            <Eye size={14} aria-hidden="true" />
            <span>拡大</span>
          </button>
        </div>
      </div>

      {caption && (
        <p className="mt-1 truncate text-center text-[11px] font-bold text-slate-600">
          {formatText(caption)}
        </p>
      )}

      {zoomed &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={caption || '図の拡大表示'}
            className="fixed inset-0 z-[100] flex flex-col bg-slate-950/92 text-white"
            onClick={() => setZoomed(false)}
          >
            <header
              className="flex items-center justify-between border-b border-white/15 px-3 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2"
              onClick={e => e.stopPropagation()}
            >
              <span className="truncate text-xs font-bold text-slate-200">
                {caption || '図・グラフの拡大表示（ピンチ操作で拡大できます）'}
              </span>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-white/15 px-3 text-xs font-extrabold text-white"
              >
                <X size={16} aria-hidden="true" />
                <span>閉じる</span>
              </button>
            </header>
            <div
              className="flex flex-1 items-center justify-center overflow-auto p-3"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={src}
                alt={caption || '拡大図'}
                className="max-h-full max-w-full rounded-lg bg-[#FCFBF8] p-2 object-contain"
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/** セルタップで ○ → × → 空欄 を書き込める共通テスト冊子風テーブル */
export function MarkableChemTable({
  caption,
  headers,
  rows,
}: {
  caption?: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const hasAnyMark = Object.values(marks).some(Boolean);

  const toggleCell = (key: string) => {
    setMarks(prev => ({ ...prev, [key]: NEXT_MARK[prev[key] ?? ''] }));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold text-slate-600">
          {caption ? formatText(caption) : '実験条件・測定データ表'}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
          <span>セルタップで ○/× メモ</span>
          {hasAnyMark && (
            <button
              type="button"
              onClick={() => setMarks({})}
              className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700"
            >
              クリア
            </button>
          )}
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-400 bg-white shadow-2xs">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-800">
              {headers.map((h, hi) => (
                <th
                  key={hi}
                  className="border border-slate-400 px-2 py-1.5 font-extrabold whitespace-normal break-words"
                >
                  {formatText(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                {headers.map((_, ci) => {
                  const cell = row[ci] ?? '';
                  const key = `${ri}:${ci}`;
                  const mk = marks[key] ?? '';
                  return (
                    <td
                      key={ci}
                      onClick={() => toggleCell(key)}
                      data-cell-mark={mk || undefined}
                      className={`relative cursor-pointer select-none border border-slate-400 px-2 py-1.5 align-top leading-snug transition-colors ${
                        ci === 0 ? 'font-extrabold text-slate-900 bg-slate-50/80' : 'text-slate-800'
                      } ${
                        mk === '○'
                          ? '!bg-rose-50/90'
                          : mk === '×'
                          ? '!bg-slate-100/90 text-slate-400 line-through'
                          : 'active:bg-amber-50/60'
                      }`}
                    >
                      <span>{formatText(cell)}</span>
                      {mk && (
                        <span
                          aria-label={`メモ ${mk}`}
                          className={`ml-1 inline-flex items-center justify-center rounded-full px-1 text-[11px] font-black leading-none ${
                            mk === '○' ? 'text-rose-600' : 'text-slate-600'
                          }`}
                        >
                          {mk}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ChemMaterialDeck({
  leadText,
  imageUrl,
  imageCaption,
  figures,
  dataTable,
  dialogue,
  highlights = [],
  activeSubPrompt,
  compactMaxHeightClass,
}: ChemMaterialDeckProps) {
  // 1) 図版リストの統合（figures 指定があれば優先、無ければ単一 imageUrl）
  const slideFigures = useMemo<ChemSlideFigure[]>(() => {
    if (figures && figures.length > 0) {
      return figures.map((f, idx) => ({
        url: f.url,
        label: f.label || `図${idx + 1}`,
        caption: f.caption,
      }));
    }
    if (imageUrl) {
      return [{ url: imageUrl, label: '図・グラフ', caption: imageCaption }];
    }
    return [];
  }, [figures, imageUrl, imageCaption]);

  // 2) 本文中の Markdown テーブルを自動抽出（dataTable 未指定の既存問題でも第6問B式タブが働く！）
  const parsedLead = useMemo(() => {
    const cleaned = cleanQuestionText(leadText || '');
    const blocks = parseExplanationBlocks(cleaned);
    const mdTables: TableBlock[] = [];
    const proseParts: string[] = [];
    for (const b of blocks) {
      if (b.kind === 'table') mdTables.push(b);
      else if (b.text.trim()) proseParts.push(b.text.trim());
    }
    return {
      proseText: proseParts.join('\n\n'),
      mdTables,
    };
  }, [leadText]);

  const allTables = useMemo<ChemStructuredTable[]>(() => {
    const out: ChemStructuredTable[] = [];
    if (dataTable) out.push(dataTable);
    for (const t of parsedLead.mdTables) {
      out.push({ headers: t.header, rows: t.rows });
    }
    return out;
  }, [dataTable, parsedLead.mdTables]);

  const hasTable = allTables.length > 0;
  const hasFigs = slideFigures.length > 0;
  const hasDialogue = Boolean(dialogue && dialogue.length > 0);
  const tabCount = 1 + (hasTable ? 1 : 0) + (hasFigs ? 1 : 0) + (hasDialogue ? 1 : 0);

  type DeckTab = 'text' | 'table' | 'figs' | 'dialogue';
  const [activeTab, setActiveTab] = useState<DeckTab>('text');

  // 現在選択中の小問が「表」「図・グラフ」「会話」を参照しているか判定（タブ上に控えめなドットで誘導）
  const promptHints = useMemo(() => {
    const q = activeSubPrompt || '';
    return {
      table: hasTable && /表|実験\s*[1-9ⅠⅡⅢA-D]|測定値|結果/.test(q),
      figs: hasFigs && /図|グラフ|曲線|スペクトル|装置|経路/.test(q),
      dialogue: hasDialogue && /会話|生徒|先生|下線部/.test(q),
    };
  }, [activeSubPrompt, hasTable, hasFigs, hasDialogue]);

  // 問題が切り替わったら先頭タブ（「問題・条件」）へ戻す
  useEffect(() => {
    setActiveTab('text');
  }, [leadText, imageUrl, figures, dataTable]);

  // 資料が「問題文のみ（図も表も会話も無し）」のときはタブバーを出さずシンプルに描画
  if (tabCount <= 1) {
    return (
      <div
        data-chem-material-deck="single"
        className={`flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 text-[14.5px] leading-[1.75] text-[#2C3E50] ${
          compactMaxHeightClass ?? ''
        }`}
      >
        <div className="whitespace-pre-wrap">{formatText(parsedLead.proseText, highlights)}</div>
      </div>
    );
  }

  return (
    <div
      data-chem-material-deck="multi"
      className={`flex flex-1 min-h-0 flex-col overflow-hidden ${compactMaxHeightClass ?? ''}`}
    >
      {/* 第6問B式 1行スリム資料切替ピルバー */}
      <div
        role="tablist"
        aria-label="問題資料の切り替え"
        className="flex flex-none items-center gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50/90 px-2.5 py-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'text'}
          data-chem-tab="text"
          onClick={() => setActiveTab('text')}
          className={`inline-flex min-h-[34px] shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold transition ${
            activeTab === 'text'
              ? 'border-[#1f5c53] bg-[#1f5c53] text-white shadow-2xs'
              : 'border-slate-300 bg-white text-slate-700 active:bg-slate-100'
          }`}
        >
          <FileText size={13} aria-hidden="true" />
          <span>問題・条件</span>
        </button>

        {hasTable && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'table'}
            data-chem-tab="table"
            onClick={() => setActiveTab('table')}
            className={`inline-flex min-h-[34px] shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold transition ${
              activeTab === 'table'
                ? 'border-[#1f5c53] bg-[#1f5c53] text-white shadow-2xs'
                : promptHints.table
                  ? 'border-amber-400 bg-amber-50/90 text-amber-950 active:bg-amber-100'
                  : 'border-slate-300 bg-white text-slate-700 active:bg-slate-100'
            }`}
          >
            <Table2 size={13} aria-hidden="true" />
            <span>データ表{allTables.length > 1 ? `(${allTables.length})` : ''}</span>
            {promptHints.table && activeTab !== 'table' && (
              <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            )}
          </button>
        )}

        {hasFigs && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'figs'}
            data-chem-tab="figs"
            onClick={() => setActiveTab('figs')}
            className={`inline-flex min-h-[34px] shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold transition ${
              activeTab === 'figs'
                ? 'border-[#1f5c53] bg-[#1f5c53] text-white shadow-2xs'
                : promptHints.figs
                  ? 'border-amber-400 bg-amber-50/90 text-amber-950 active:bg-amber-100'
                  : 'border-slate-300 bg-white text-slate-700 active:bg-slate-100'
            }`}
          >
            <FlaskConical size={13} aria-hidden="true" />
            <span>
              {slideFigures.length > 1 ? `図・グラフ(${slideFigures.length}枚)` : '図・グラフ'}
            </span>
            {promptHints.figs && activeTab !== 'figs' && (
              <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            )}
          </button>
        )}

        {hasDialogue && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dialogue'}
            data-chem-tab="dialogue"
            onClick={() => setActiveTab('dialogue')}
            className={`inline-flex min-h-[34px] shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold transition ${
              activeTab === 'dialogue'
                ? 'border-[#1f5c53] bg-[#1f5c53] text-white shadow-2xs'
                : promptHints.dialogue
                  ? 'border-amber-400 bg-amber-50/90 text-amber-950 active:bg-amber-100'
                  : 'border-slate-300 bg-white text-slate-700 active:bg-slate-100'
            }`}
          >
            <span>会話文</span>
            {promptHints.dialogue && activeTab !== 'dialogue' && (
              <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* タブの中身：選択中の資料に残り高さを 100% 渡す */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-white">
        {activeTab === 'text' && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 text-[14.5px] leading-[1.75] text-[#2C3E50]">
            <div className="whitespace-pre-wrap">{formatText(parsedLead.proseText, highlights)}</div>
            {/* 1タップで隣の資料へ気づける小さなショートカットチップ */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {hasTable && (
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className="inline-flex items-center gap-1 rounded-lg border border-teal-300 bg-teal-50/70 px-2.5 py-1 text-xs font-extrabold text-teal-900"
                >
                  <Table2 size={13} aria-hidden="true" />
                  <span>データ表を開く（○/×メモ可）→</span>
                </button>
              )}
              {hasFigs && (
                <button
                  type="button"
                  onClick={() => setActiveTab('figs')}
                  className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50/70 px-2.5 py-1 text-xs font-extrabold text-sky-900"
                >
                  <FlaskConical size={13} aria-hidden="true" />
                  <span>
                    {slideFigures.length > 1
                      ? `図・グラフ（${slideFigures.length}枚切替）を開く →`
                      : '図・グラフを開く →'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'table' && hasTable && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 space-y-3">
            {allTables.map((tbl, idx) => (
              <MarkableChemTable
                key={idx}
                caption={tbl.caption}
                headers={tbl.headers}
                rows={tbl.rows}
              />
            ))}
          </div>
        )}

        {activeTab === 'figs' && hasFigs && (
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden px-2.5 py-1.5">
            {slideFigures.length === 1 ? (
              <ChemFitFigure
                src={slideFigures[0]!.url}
                caption={slideFigures[0]!.caption}
              />
            ) : (
              <FigureCarousel
                count={slideFigures.length}
                labels={slideFigures.map(f => f.label)}
              >
                {idx => (
                  <ChemFitFigure
                    src={slideFigures[idx]!.url}
                    caption={slideFigures[idx]!.caption}
                  />
                )}
              </FigureCarousel>
            )}
          </div>
        )}

        {activeTab === 'dialogue' && hasDialogue && dialogue && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 space-y-1.5">
            {dialogue.map((line, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs leading-relaxed"
              >
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-black ${
                    line.speaker.includes('先生')
                      ? 'bg-teal-800 text-white'
                      : 'bg-amber-200 text-amber-950'
                  }`}
                >
                  {line.speaker}
                </span>
                <div className="min-w-0 flex-1 text-slate-800">{formatText(line.text)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
