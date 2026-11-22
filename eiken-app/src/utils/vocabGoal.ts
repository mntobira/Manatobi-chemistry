/**
 * 志望校と、重要用語・反応式帳の「目標」（出題範囲のプリセット）の保存。
 */
import { safeLocalStorage, safeParseJson } from './safeLocalStorage';

export const VOCAB_PREF_KEY = 'chem_wordbook_prefs_v1';

/** 暗記帳の分野切り替え（ラベルは FoundationWords の PRESETS と同じ） */
export const GOAL_OPTIONS = [
  { id: 'chem_basic_matter', label: '基礎① 構成・結合' },
  { id: 'chem_basic_change', label: '基礎② 物質の変化' },
  { id: 'chem_theory', label: '化学① 理論' },
  { id: 'chem_inorganic', label: '化学② 無機' },
  { id: 'chem_organic', label: '化学③ 有機' },
  { id: 'chem_polymer', label: '化学④ 高分子' },
  { id: 'custom', label: '全分野から選ぶ' },
] as const;
export type GoalId = typeof GOAL_OPTIONS[number]['id'];

function readRaw(): Record<string, unknown> {
  try {
    const v = safeParseJson<unknown>(safeLocalStorage()?.getItem(VOCAB_PREF_KEY), {});
    return v && typeof v === 'object' ? v as Record<string, unknown> : {};
  } catch { return {}; }
}

export function readGoal(): GoalId {
  const p = readRaw().preset;
  return GOAL_OPTIONS.some(o => o.id === p) ? (p as GoalId) : 'chem_basic_matter';
}

export function writeGoal(id: GoalId): void {
  try { safeLocalStorage()?.setItem(VOCAB_PREF_KEY, JSON.stringify({ ...readRaw(), preset: id })); } catch { /* 保存できなくても続ける */ }
}

export const TARGET_SCHOOL_MAX = 40;
export function normalizeTargetSchool(v: string): string {
  return v.replace(/\s+/g, ' ').trim().slice(0, TARGET_SCHOOL_MAX);
}
