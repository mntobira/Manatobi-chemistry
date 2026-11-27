import { trackEvent } from './analytics';
/**
 * アプリ内の PDF 冊子スタジオの開け閉め（どの画面からでも openPdf() で開く）。PdfViewer.tsx を参照。
 *
 * ■ 戻るボタンで閉じる
 *   開くときに履歴を1つ積む（history.pushState）。
 *   Android の戻るボタン（Capacitor は WebView の「戻る」を呼ぶ）・ブラウザの戻る・スワイプで戻る
 *   のどれでも popstate が来るので、そこで閉じる。アプリの画面は動かない（元の画面のまま）。
 *   「‹ もどる」ボタン・Esc で閉じたときは、積んだ履歴を自分で1つ戻して数をそろえる。
 *
 * ■ 冊子バリアント切替・開始ページ指定（2026-11 共通テスト満点UI強化）
 *   問題冊子 / マークシート解答用紙（A4横） / 詳解冊子 の3分冊をワンタップ切替でき、
 *   単元まとめプリント集からは該当単元のページへ直接ジャンプ（initialPage）できる。
 */
export interface PdfVariantOption {
  label: string;
  url: string;
  fileName?: string;
  badge?: string;
}

export interface OpenPdfOptions {
  fileName?: string;
  initialPage?: number;
  subtitle?: string;
  badge?: string;
  variants?: readonly PdfVariantOption[];
}

export interface OpenPdf {
  url: string;
  title: string;
  fileName: string;
  initialPage?: number;
  subtitle?: string;
  badge?: string;
  variants?: readonly PdfVariantOption[];
}

type Listener = (doc: OpenPdf | null) => void;
let current: OpenPdf | null = null;
const listeners = new Set<Listener>();
const MARK = '__manatobiPdf';
let popInstalled = false;
/** 「もどる」で自分から閉じたあと、積んだ履歴を戻すときの popstate を1回だけ無視する */
let skipPop = 0;

function emit() { listeners.forEach(l => l(current)); }

function installPop() {
  if (popInstalled || typeof window === 'undefined') return;
  popInstalled = true;
  window.addEventListener('popstate', () => {
    if (skipPop > 0) { skipPop--; return; }
    if (current && !(history.state && history.state[MARK])) { current = null; emit(); }
  });
}

export const pdfViewerStore = {
  get: () => current,
  subscribe(l: Listener) { listeners.add(l); return () => { listeners.delete(l); }; },
};

function sanitizePdfPath(rawUrl: string): string | null {
  if (typeof window === 'undefined') return null;
  let safe: URL;
  try { safe = new URL(rawUrl, window.location.href); } catch { return null; }
  if (safe.origin !== window.location.origin || !/\.pdf$/i.test(safe.pathname)) return null;
  return safe.pathname;
}

/** 同じサイト内の PDF だけ開く（外のサイトは開かない）。第3引数はファイル名文字列または OpenPdfOptions */
export function openPdf(url: string, title: string, fileNameOrOptions?: string | OpenPdfOptions): void {
  const safePath = sanitizePdfPath(url);
  if (!safePath) return;
  trackEvent('pdf_open');
  installPop();
  const opts: OpenPdfOptions = typeof fileNameOrOptions === 'string'
    ? { fileName: fileNameOrOptions }
    : (fileNameOrOptions ?? {});
  const name = opts.fileName ?? `${title.replace(/[\\/:*?"<>|\s]+/g, '_')}.pdf`;
  const safeVariants = opts.variants
    ?.map(v => {
      const p = sanitizePdfPath(v.url);
      return p ? { ...v, url: p } : null;
    })
    .filter((v): v is PdfVariantOption => v !== null);

  const wasOpen = !!current;
  current = {
    url: safePath,
    title,
    fileName: name,
    initialPage: opts.initialPage && opts.initialPage >= 1 ? Math.floor(opts.initialPage) : undefined,
    subtitle: opts.subtitle,
    badge: opts.badge,
    variants: safeVariants && safeVariants.length > 0 ? safeVariants : undefined,
  };
  try {
    if (!wasOpen) history.pushState({ ...(history.state ?? {}), [MARK]: true }, '');
  } catch { /* 履歴に積めなくても、もどるボタン・Esc で閉じられる */ }
  emit();
}

/**
 * 閉じる（「もどる」ボタン・Esc）。読み込み中でも必ずすぐ閉じる。
 */
export function closePdf(): void {
  if (!current) return;
  current = null; emit();
  if (typeof window !== 'undefined' && history.state && history.state[MARK]) {
    try { skipPop++; history.back(); setTimeout(() => { skipPop = 0; }, 1000); } catch { skipPop = 0; }
  }
}

/** テスト用 */
export function __resetPdfViewer(): void { current = null; listeners.clear(); popInstalled = false; skipPop = 0; }
