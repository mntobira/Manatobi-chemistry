/**
 * 英検演習（5問一括空所補充 EikenClozePageQuiz ＆ 通し演習 EikenMockExam）共通の学習支援ヘルパー
 *
 * - 完成文・対話文の英語読み上げ（A/B 話者別 Web Speech API 対応・通常/ゆっくり速度対応）
 * - 英検重要語彙データ（/data/listeningVocabulary.json）の遅延ロード＆設問・選択肢内の重要語自動抽出
 * - 語句整序（reorder）問題のタップ組み立て＆「1番目－3番目」選択肢との双方向連動
 * - 長文Eメール（From / To / Date / Subject）ヘッダー構造化＆段落分割
 */
import { useEffect, useState } from 'react';
import { isSpeechSupported, speak, speakDialogue, stopSpeech } from '../utils/listeningSpeech';
import { splitEikenDialogueTurns } from './eikenClozePageModel';

export interface EikenVocabEntry {
  word: string;
  meaning: string;
  level: string;
  exampleSentence?: string;
}

const GRADE_SHORT_LABEL: Record<string, string> = {
  eiken_5: '5級',
  eiken_4: '4級',
  eiken_3: '3級',
  eiken_pre2: '準2級',
  eiken_pre2plus: '準2プ',
  eiken_2: '2級',
  eiken_pre1: '準1級',
  eiken_1: '1級',
};

export function formatVocabGradeBadge(level: string): string {
  return GRADE_SHORT_LABEL[level] || level.replace(/^eiken_/, '');
}

let cachedVocabMap: Map<string, EikenVocabEntry> | null = null;
let inflightVocabPromise: Promise<Map<string, EikenVocabEntry>> | null = null;

function buildVocabLookup(rawWords: unknown[]): Map<string, EikenVocabEntry> {
  const map = new Map<string, EikenVocabEntry>();
  for (const item of rawWords) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const word = String(rec.word ?? '').trim();
    const meaning = String(rec.meaning ?? rec.fullMeaning ?? '').trim();
    const level = String(rec.level ?? '').trim();
    if (!word || !meaning) continue;
    const key = word.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        word,
        meaning,
        level,
        exampleSentence: rec.exampleSentence ? String(rec.exampleSentence) : undefined,
      });
    }
  }
  return map;
}

export function loadEikenVocabMap(): Promise<Map<string, EikenVocabEntry>> {
  if (cachedVocabMap) return Promise.resolve(cachedVocabMap);
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return Promise.resolve(new Map());
  }
  if (!inflightVocabPromise) {
    inflightVocabPromise = fetch('/data/listeningVocabulary.json')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        const list = Array.isArray(data?.words) ? data.words : [];
        cachedVocabMap = buildVocabLookup(list);
        return cachedVocabMap;
      })
      .catch(() => {
        const empty = new Map<string, EikenVocabEntry>();
        cachedVocabMap = empty;
        return empty;
      });
  }
  return inflightVocabPromise;
}

/** コンポーネントから遅延取得するためのフック（採点後に有効化すると初期描画負荷ゼロ） */
export function useEikenVocabMap(enabled: boolean): Map<string, EikenVocabEntry> | null {
  const [vocabMap, setVocabMap] = useState<Map<string, EikenVocabEntry> | null>(() => cachedVocabMap);

  useEffect(() => {
    if (!enabled || vocabMap) return;
    let alive = true;
    void loadEikenVocabMap().then(loaded => {
      if (alive) setVocabMap(loaded);
    });
    return () => {
      alive = false;
    };
  }, [enabled, vocabMap]);

  return vocabMap;
}

function candidateLemmas(rawToken: string): string[] {
  const lower = rawToken.toLowerCase().replace(/^'+|'+$/g, '');
  if (lower.length < 3) return [];
  const out = [lower];
  if (lower.endsWith('ies') && lower.length > 4) out.push(`${lower.slice(0, -3)}y`);
  if (lower.endsWith('es') && lower.length > 4) out.push(lower.slice(0, -2));
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 3) out.push(lower.slice(0, -1));
  if (lower.endsWith('ed') && lower.length > 4) {
    out.push(lower.slice(0, -2));
    out.push(lower.slice(0, -1));
    if (lower.endsWith('ied')) out.push(`${lower.slice(0, -3)}y`);
  }
  if (lower.endsWith('ing') && lower.length > 5) {
    out.push(lower.slice(0, -3));
    out.push(`${lower.slice(0, -3)}e`);
  }
  return out;
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'you',
  'are',
  'was',
  'were',
  'have',
  'has',
  'had',
  'not',
  'but',
  'this',
  'that',
  'with',
  'from',
  'they',
  'she',
  'him',
  'her',
  'his',
  'our',
  'your',
  'will',
  'can',
  'did',
  'does',
  'what',
  'when',
  'where',
  'who',
  'how',
  'why',
]);

/** 設問文・選択肢に含まれる英検重要語彙を最大 maxCount 件抽出する（選択肢語句を優先） */
export function extractMatchedEikenVocab(
  vocabMap: ReadonlyMap<string, EikenVocabEntry> | null | undefined,
  priorityTexts: readonly string[],
  secondaryTexts: readonly string[] = [],
  maxCount = 5,
): EikenVocabEntry[] {
  if (!vocabMap || vocabMap.size === 0) return [];
  const found: EikenVocabEntry[] = [];
  const seen = new Set<string>();

  const scan = (texts: readonly string[]) => {
    for (const raw of texts) {
      if (!raw) continue;
      // まずフレーズ全体一致を確認
      const phraseClean = raw.trim().toLowerCase().replace(/[.?!,;:"()]/g, '');
      if (vocabMap.has(phraseClean) && !seen.has(phraseClean)) {
        seen.add(phraseClean);
        found.push(vocabMap.get(phraseClean)!);
        if (found.length >= maxCount) return;
      }
      const tokens = raw.match(/[A-Za-z][A-Za-z'-]{2,}/g) ?? [];
      for (const tok of tokens) {
        if (STOP_WORDS.has(tok.toLowerCase())) continue;
        for (const cand of candidateLemmas(tok)) {
          const hit = vocabMap.get(cand);
          if (hit && !seen.has(hit.word.toLowerCase())) {
            seen.add(hit.word.toLowerCase());
            found.push(hit);
            if (found.length >= maxCount) return;
            break;
          }
        }
      }
    }
  };

  scan(priorityTexts);
  if (found.length < maxCount) {
    scan(secondaryTexts);
  }
  return found;
}

/**
 * 完成文または A/B 対話文を読み上げる。
 * `stem` が `A: ...\nB: ...` 形式の場合は空所に `filledWord` を入れたうえで話者別に読み上げる。
 */
export function speakEikenCompletedText(
  id: string,
  stem: string,
  filledWord: string,
  fallbackCompleted: string,
  opts: { rate?: number; onEnd?: () => void } = {},
): boolean {
  if (!isSpeechSupported()) return false;
  const filledStem = filledWord
    ? stem.replace(/\(\s*_{0,6}\s*\)/, filledWord)
    : fallbackCompleted || stem;
  const turns = splitEikenDialogueTurns(filledStem);
  if (turns && turns.length >= 2) {
    return speakDialogue(
      id,
      turns.map(t => ({ who: t.speaker, text: t.text })),
      1,
      opts,
    );
  }
  const cleanSingle = (fallbackCompleted || filledStem)
    .replace(/\(\s*_{0,6}\s*\)/g, filledWord || ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return speak(id, cleanSingle, 1, opts);
}

export { isSpeechSupported, stopSpeech };

/**
 * 語句整序（reorder）の選択肢文字列（例: `"2－4"`, `"1-3"`, `"2 — 4"`）から
 * [1番目の番号, 3番目の番号] を抽出する。
 */
export function parseReorderChoicePair(choiceText: string): [number, number] | null {
  const m = String(choiceText || '')
    .trim()
    .match(/^([1-4])\s*[－\-–—~〜・,]\s*([1-4])$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2])];
}

/**
 * ユーザーが並べたトークン番号列（例: `[2, 1, 4, 3]`）の1番目と3番目に一致する選択肢インデックスを返す。
 */
export function findMatchingReorderChoiceIndex(
  sequence: readonly number[],
  choices: readonly string[] | undefined,
): number | null {
  if (!choices || sequence.length < 3) return null;
  const first = sequence[0];
  const third = sequence[2];
  if (!first || !third) return null;
  const hit = choices.findIndex(c => {
    const pair = parseReorderChoicePair(c);
    return pair !== null && pair[0] === first && pair[1] === third;
  });
  return hit >= 0 ? hit : null;
}

export interface ParsedEmailPassage {
  headers: { key: string; value: string }[];
  paragraphs: string[];
}

/**
 * 長文パッセージから Eメールヘッダー（From / To / Date / Subject）と本文段落を分離する。
 */
export function parsePassageEmailAndParagraphs(rawText: string): ParsedEmailPassage {
  const lines = String(rawText || '').replace(/\r\n/g, '\n').split('\n');
  const headers: { key: string; value: string }[] = [];
  let idx = 0;

  while (idx < lines.length) {
    const trimmed = lines[idx].trim();
    if (!trimmed) {
      if (headers.length > 0) {
        idx += 1;
        break;
      }
      idx += 1;
      continue;
    }
    const m = trimmed.match(/^(From|To|Date|Subject|Sender|Topic):\s*(.+)$/i);
    if (m && headers.length < 6) {
      headers.push({ key: m[1], value: m[2].trim() });
      idx += 1;
    } else {
      break;
    }
  }

  const bodyText = lines.slice(idx).join('\n').trim();
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  return {
    headers,
    paragraphs: paragraphs.length > 0 ? paragraphs : bodyText ? [bodyText] : [],
  };
}
