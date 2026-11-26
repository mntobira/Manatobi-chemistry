import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Download,
  ExternalLink,
  FileText,
  Minus,
  PanelLeft,
  Plus,
  Printer,
  RotateCw,
} from 'lucide-react';
import { pdfViewerStore, closePdf, openPdf, type OpenPdf } from '../utils/pdfViewer';
import { printPdf, savePdf } from '../utils/pdfShare';
import './pdf-viewer.css';

/**
 * 共通テスト本番冊子クオリティのアプリ内 PDF ブックレットリーダー（2026-11 刷新）。
 *
 * ■ 特徴
 *   1. Web / モバイル共通で pdf.js 高精細キャンバス紙面描画（ブラウザ依存の黒枠 iframe を解消し、
 *      試験冊子らしい紙質感・見開き2ページ表示・サムネイル目次を実現。万一 worker 読込に失敗した
 *      環境のみ自動でネイティブ iframe フォールバックへ切替）。
 *   2. 模試3分冊（問題冊子 / A4横マークシート / ステップ詳解冊子）のワンタップ切替バー搭載。
 *   3. 単元まとめプリント集からの指定ページ直接ジャンプ（initialPage）対応。
 *   4. キーボード操作：Esc（閉じる）、← / →（ページ移動）、+ / -（拡大縮小）。
 */
export function PdfViewerHost() {
  const [doc, setDoc] = useState<OpenPdf | null>(pdfViewerStore.get());
  useEffect(() => pdfViewerStore.subscribe(setDoc), []);
  if (!doc) return null;
  return <PdfViewer key={`${doc.url}#${doc.initialPage ?? 1}`} doc={doc} />;
}

type PdfJs = typeof import('pdfjs-dist');
let pdfjsPromise: Promise<PdfJs> | null = null;

function loadPdfJs(): Promise<PdfJs> {
  pdfjsPromise ??= Promise.all([
    import('pdfjs-dist/legacy/build/pdf.min.mjs') as unknown as Promise<PdfJs>,
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
  ]).then(([lib, worker]) => {
    lib.GlobalWorkerOptions.workerSrc = (worker as { default: string }).default;
    return lib;
  }).catch(e => { pdfjsPromise = null; throw e; });
  return pdfjsPromise;
}

function PdfViewer({ doc }: { doc: OpenPdf } & React.Attributes) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(doc.initialPage ?? 1);
  const [zoom, setZoom] = useState(1);
  const [spread, setSpread] = useState(false);
  const [showSidebar, setShowSidebar] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [attempt, setAttempt] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [busy, setBusy] = useState<'' | 'print' | 'save'>('');
  const [note, setNote] = useState('');

  const jumpToPage = useCallback((pageNo: number, behavior: ScrollBehavior = 'smooth') => {
    const box = pagesRef.current;
    if (!box) return;
    const clamped = Math.max(1, Math.min(pageCount || pageNo, pageNo));
    const target = box.querySelector<HTMLElement>(`[data-pdf-page="${clamped}"]`);
    if (target) {
      target.scrollIntoView({ behavior, block: 'start' });
      setCurrentPage(clamped);
    }
  }, [pageCount]);

  // キーボードショートカット
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePdf();
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (pageCount > 1 && currentPage < pageCount) {
          e.preventDefault();
          jumpToPage(currentPage + (spread ? 2 : 1));
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (pageCount > 1 && currentPage > 1) {
          e.preventDefault();
          jumpToPage(currentPage - (spread ? 2 : 1));
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(z => Math.min(2.25, +(z + 0.25).toFixed(2)));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom(z => Math.max(0.75, +(z - 0.25).toFixed(2)));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentPage, jumpToPage, pageCount, spread]);

  // スクロール位置から現在ページを追従
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || fallback) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const box = pagesRef.current;
        if (!box) return;
        const sheets = Array.from(box.querySelectorAll<HTMLElement>('[data-pdf-page]'));
        if (sheets.length === 0) return;
        const topLine = scroller.getBoundingClientRect().top + 120;
        let active = 1;
        for (const el of sheets) {
          const r = el.getBoundingClientRect();
          const p = Number(el.dataset.pdfPage || 1);
          if (r.top <= topLine) active = p;
          else break;
        }
        setCurrentPage(active);
      });
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener('scroll', onScroll);
    };
  }, [fallback, pageCount]);

  // サムネイルのアクティブ表示スクロール追従
  useEffect(() => {
    const tbox = thumbsRef.current;
    if (!tbox || !showSidebar) return;
    const activeThumb = tbox.querySelector<HTMLElement>(`[data-thumb-page="${currentPage}"]`);
    activeThumb?.scrollIntoView({ block: 'nearest' });
  }, [currentPage, showSidebar]);

  // pdf.js 描画（紙面キャンバス＋左サムネイル生成）
  useEffect(() => {
    let cancelled = false;
    let task: { destroy: () => Promise<void> } | null = null;
    const box = pagesRef.current;
    const tbox = thumbsRef.current;
    if (!box) return;
    box.replaceChildren();
    tbox?.replaceChildren();

    setState('loading');
    setFallback(false);
    let shown = false;

    const watchdog = window.setTimeout(() => {
      if (cancelled || shown) return;
      cancelled = true;
      void task?.destroy().catch(() => {});
      setFallback(true);
      setState('ready');
    }, 9000);

    loadPdfJs().then(async lib => {
      const loading = lib.getDocument({
        url: doc.url,
        isEvalSupported: false,
        disableRange: true,
        disableStream: true,
      });
      task = loading;
      const pdf = await loading.promise;
      if (cancelled) return;
      setPageCount(pdf.numPages);
      const targetInitial = Math.max(1, Math.min(pdf.numPages, doc.initialPage ?? 1));
      setCurrentPage(targetInitial);

      const containerW = (scrollRef.current?.clientWidth || window.innerWidth) - 36;
      const baseTargetW = spread
        ? Math.min(Math.max(280, Math.floor((containerW - 24) / 2)), 540)
        : Math.min(Math.max(300, containerW), 860);
      const renderWidth = baseTargetW * zoom;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // 先に全ページのシート枠とサムネイル枠を配置してレイアウト確定＆即時ページジャンプ可能にする
      const sheetHolders: { sheet: HTMLDivElement; canvas: HTMLCanvasElement; thumbCanvas?: HTMLCanvasElement }[] = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        const sheet = document.createElement('div');
        sheet.className = 'pdfv-sheet';
        sheet.dataset.pdfPage = String(n);

        const badge = document.createElement('div');
        badge.className = 'pdfv-sheet-head';
        badge.textContent = `Page ${n} / ${pdf.numPages}`;

        const canvas = document.createElement('canvas');
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', `${doc.title} ${n}ページ目`);

        sheet.appendChild(badge);
        sheet.appendChild(canvas);
        box.appendChild(sheet);

        let thumbCanvas: HTMLCanvasElement | undefined;
        if (tbox) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'pdfv-thumb-btn';
          btn.dataset.thumbPage = String(n);
          btn.onclick = () => {
            sheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setCurrentPage(n);
            if (window.innerWidth < 900) setShowSidebar(false);
          };
          thumbCanvas = document.createElement('canvas');
          const numSpan = document.createElement('span');
          numSpan.textContent = `${n} ページ`;
          btn.appendChild(thumbCanvas);
          btn.appendChild(numSpan);
          tbox.appendChild(btn);
        }
        sheetHolders.push({ sheet, canvas, thumbCanvas });
      }

      // 優先描画順：initialPage とその前後を最優先で描画してから残りを描画
      const order: number[] = [];
      order.push(targetInitial);
      if (targetInitial + 1 <= pdf.numPages) order.push(targetInitial + 1);
      if (targetInitial - 1 >= 1) order.push(targetInitial - 1);
      for (let n = 1; n <= pdf.numPages; n++) {
        if (!order.includes(n)) order.push(n);
      }

      let jumpedInitial = false;
      for (const n of order) {
        if (cancelled) return;
        const page = await pdf.getPage(n);
        if (cancelled) return;
        const holder = sheetHolders[n - 1];
        const base = page.getViewport({ scale: 1 });
        // 横向き用紙（A4横マークシート等）は見やすい幅を確保
        const isLandscape = base.width > base.height * 1.15;
        const effWidth = isLandscape && !spread
          ? Math.min(Math.max(renderWidth, Math.min(containerW, 980) * zoom), 1280)
          : renderWidth;
        const vp = page.getViewport({ scale: (effWidth / base.width) * dpr });
        holder.canvas.width = Math.floor(vp.width);
        holder.canvas.height = Math.floor(vp.height);
        holder.canvas.style.width = `${Math.floor(vp.width / dpr)}px`;
        if (isLandscape) holder.sheet.dataset.landscape = 'true';
        const ctx = holder.canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
        }

        if (!shown && !cancelled) {
          shown = true;
          window.clearTimeout(watchdog);
          setState('ready');
          if (!jumpedInitial && targetInitial > 1) {
            jumpedInitial = true;
            requestAnimationFrame(() => {
              holder.sheet.scrollIntoView({ behavior: 'auto', block: 'start' });
            });
          }
        }

        if (holder.thumbCanvas && !cancelled) {
          const tvp = page.getViewport({ scale: (132 / base.width) * Math.min(dpr, 1.5) });
          holder.thumbCanvas.width = Math.floor(tvp.width);
          holder.thumbCanvas.height = Math.floor(tvp.height);
          const tctx = holder.thumbCanvas.getContext('2d');
          if (tctx) {
            await page.render({ canvasContext: tctx, viewport: tvp }).promise;
          }
        }
      }
    }).catch(() => {
      window.clearTimeout(watchdog);
      if (!cancelled) {
        pdfjsPromise = null;
        setFallback(true);
        setState('ready');
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(watchdog);
      void task?.destroy().catch(() => {});
    };
  }, [doc.url, doc.title, doc.initialPage, zoom, spread, attempt]);

  const run = (kind: 'print' | 'save') => {
    if (busy) return;
    setBusy(kind);
    setNote('');
    (kind === 'print' ? printPdf(doc.url, doc.fileName, doc.title) : savePdf(doc.url, doc.fileName, doc.title))
      .then(msg => { if (msg) setNote(msg); })
      .catch(() => setNote(kind === 'print' ? '印刷を始められませんでした。もう一度お試しください。' : '保存できませんでした。もう一度お試しください。'))
      .finally(() => setBusy(''));
  };

  return (
    <div className="pdfv" role="dialog" aria-modal="true" aria-label={`${doc.title}（PDF）`} data-pdf-viewer>
      {/* 上部メインコントロールバー */}
      <header className="pdfv-bar">
        <button type="button" className="pdfv-back" onClick={closePdf} data-pdf-close autoFocus>
          <ChevronLeft size={18} aria-hidden="true" />もどる
        </button>

        {!fallback && pageCount > 1 && (
          <button
            type="button"
            className={`pdfv-icon-btn ${showSidebar ? 'is-active' : ''}`}
            aria-label="ページ一覧サイドバーの切替"
            title="ページ目次サムネイル"
            onClick={() => setShowSidebar(s => !s)}
          >
            <PanelLeft size={17} aria-hidden="true" />
            <span className="pdfv-hide-sm">目次</span>
          </button>
        )}

        <div className="pdfv-title">
          <div className="pdfv-title-row">
            {doc.badge && <span className="pdfv-badge">{doc.badge}</span>}
            <strong>{doc.title}</strong>
          </div>
          {doc.subtitle && <small className="pdfv-subtitle">{doc.subtitle}</small>}
        </div>

        {/* ページャー＆表示切替 */}
        {!fallback && pageCount > 0 && (
          <div className="pdfv-pager" aria-label="ページ移動">
            <button
              type="button"
              aria-label="前のページ"
              disabled={currentPage <= 1}
              onClick={() => jumpToPage(currentPage - (spread ? 2 : 1))}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span className="pdfv-page-indicator">
              <strong>{currentPage}</strong> / {pageCount}p
            </span>
            <button
              type="button"
              aria-label="次のページ"
              disabled={currentPage >= pageCount}
              onClick={() => jumpToPage(currentPage + (spread ? 2 : 1))}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="pdfv-tools">
          {!fallback && pageCount > 1 && (
            <button
              type="button"
              className={`pdfv-spread-btn ${spread ? 'is-active' : ''}`}
              aria-label={spread ? '1ページ表示に切替' : '見開き2ページ表示に切替'}
              title={spread ? '1ページ表示' : '試験冊子の見開き2ページ表示'}
              onClick={() => setSpread(s => !s)}
            >
              {spread ? <FileText size={16} aria-hidden="true" /> : <Columns2 size={16} aria-hidden="true" />}
              <span>{spread ? '単頁' : '見開き'}</span>
            </button>
          )}
          {!fallback && (
            <>
              <button
                type="button"
                aria-label="小さくする"
                disabled={zoom <= 0.75}
                onClick={() => setZoom(z => Math.max(0.75, +(z - 0.25).toFixed(2)))}
              >
                <Minus size={17} aria-hidden="true" />
              </button>
              <span className="pdfv-zoom-pct">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                aria-label="大きくする"
                disabled={zoom >= 2.25}
                onClick={() => setZoom(z => Math.min(2.25, +(z + 0.25).toFixed(2)))}
              >
                <Plus size={17} aria-hidden="true" />
              </button>
            </>
          )}
          <button
            type="button"
            className="pdfv-action-primary"
            aria-label="この PDF を印刷する"
            data-pdf-print
            disabled={busy !== ''}
            onClick={() => run('print')}
          >
            <Printer size={17} aria-hidden="true" /><span>印刷</span>
          </button>
          <button
            type="button"
            className="pdfv-action-save"
            aria-label="この PDF を保存する"
            data-pdf-save
            disabled={busy !== ''}
            onClick={() => run('save')}
          >
            <Download size={17} aria-hidden="true" /><span>保存</span>
          </button>
        </div>
      </header>

      {/* 分冊バリアント切替バー（問題冊子 / A4横マークシート / 正答・詳解冊子） */}
      {doc.variants && doc.variants.length > 1 && (
        <nav className="pdfv-variant-bar" aria-label="冊子種別の切替">
          <span className="pdfv-variant-lead">
            <BookOpen size={14} aria-hidden="true" /> 冊子切替：
          </span>
          <div className="pdfv-variant-tabs">
            {doc.variants.map(v => {
              const active = v.url === doc.url;
              return (
                <button
                  key={v.url}
                  type="button"
                  className={`pdfv-variant-tab ${active ? 'is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    if (active) return;
                    openPdf(v.url, doc.title, {
                      fileName: v.fileName,
                      subtitle: doc.subtitle,
                      badge: v.badge ?? doc.badge,
                      variants: doc.variants,
                    });
                  }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="pdfv-ext-link"
            title="ブラウザ標準のPDFタブで開く"
          >
            <ExternalLink size={13} aria-hidden="true" /> 別タブ
          </a>
        </nav>
      )}

      {/* 本体ステージ（左サムネイル目次＋右試験紙ステージ） */}
      <div className="pdfv-body">
        {!fallback && pageCount > 1 && (
          <aside
            className={`pdfv-sidebar ${showSidebar ? 'is-open' : 'is-closed'}`}
            aria-label="ページサムネイル目次"
          >
            <div className="pdfv-sidebar-head">
              <span>全 {pageCount} ページ</span>
              <small>クリックで移動</small>
            </div>
            <div className="pdfv-thumbs" ref={thumbsRef} data-active-page={currentPage} />
          </aside>
        )}

        <div
          className="pdfv-scroll"
          ref={scrollRef}
          data-zoom={zoom > 1.1 || undefined}
          data-spread={spread || undefined}
        >
          {note && <p className="pdfv-note" role="status">{note}</p>}

          {state === 'loading' && !fallback && (
            <div className="pdfv-loading-card" role="status">
              <div className="pdfv-spinner" aria-hidden="true" />
              <p>
                <strong>試験冊子PDFを高精細レンダリングしています…</strong>
                <small>図表・化学式・マークシートを用紙サイズに合わせて描画中</small>
              </p>
            </div>
          )}

          {fallback && (
            <p className="pdfv-note" role="status">
              ブラウザ標準のPDF表示を使用しています。表示されない場合は{' '}
              <a href={doc.url} target="_blank" rel="noreferrer">PDFを別タブで開く</a> をお試しください。
            </p>
          )}

          {state === 'error' && (
            <div className="pdfv-status" role="alert">
              <p>PDF を表示できませんでした。接続を確認して、もう一度お試しください。</p>
              <div className="pdfv-status-actions">
                <button type="button" onClick={() => { setState('loading'); setAttempt(a => a + 1); }}>
                  <RotateCw size={16} aria-hidden="true" />もう一度
                </button>
                <button type="button" onClick={closePdf}>もどる</button>
              </div>
            </div>
          )}

          {fallback ? (
            <iframe
              className="pdfv-native"
              src={doc.initialPage && doc.initialPage > 1 ? `${doc.url}#page=${doc.initialPage}` : doc.url}
              title={`${doc.title}（PDF）`}
            />
          ) : (
            <div className="pdfv-pages" ref={pagesRef} />
          )}
        </div>
      </div>
    </div>
  );
}
