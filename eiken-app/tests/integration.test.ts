import { afterEach, describe, expect, it, vi } from 'vitest';
import { CHEM_LAB_TASKS } from '../src/chemistry/materials/labTasks';
import { emptyWriting, mergeWriting, parseWriting, wordCount, writingKey } from '../src/eiken/writingProgress';
import { migrateGuestData, reconcile, SYNC_SECTIONS, type KV } from '../src/utils/userDataSyncCore';

class MemoryKV implements KV {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const draft = (text: string, updatedAt = 1) => ({ text, checked: [], reviewed: false, updatedAt });
const task = 'chem_lab_titration_error';
afterEach(() => vi.unstubAllGlobals());

describe('Chemistry integration contracts', () => {
  it('connects all 18 independently authored chemistry lab & structure tasks with rubrics and model answers', () => {
    expect(CHEM_LAB_TASKS).toHaveLength(18);
    for (const item of CHEM_LAB_TASKS) {
      expect(item.instruction.length).toBeGreaterThan(20);
      expect(wordCount(item.model)).toBeGreaterThan(30);
      expect(item.checklist.length).toBeGreaterThanOrEqual(3);
      expect(item.commentary.length).toBeGreaterThan(20);
    }
  });

  it('rejects broken and oversized drafts rather than overwriting them', () => {
    expect(parseWriting(null)).toEqual(emptyWriting());
    for (const raw of [
      '{',
      '{}',
      JSON.stringify({ version: 1, drafts: { bad: draft('text') }, conflicts: {} }),
      JSON.stringify({ version: 1, drafts: { [task]: draft('x'.repeat(6001)) }, conflicts: {} }),
    ]) {
      expect(() => parseWriting(raw)).toThrow();
    }
  });

  it('merges different lab tasks and preserves a recoverable copy of concurrently edited text', () => {
    const base = { ...emptyWriting(), drafts: { [task]: draft('初期メモ', 1) } };
    const left = { ...emptyWriting(), drafts: { [task]: draft('端末Aの考察メモ', 2) } };
    const right = {
      ...emptyWriting(),
      drafts: {
        [task]: draft('端末Bの考察メモ', 3),
        chem_lab_ester_c9h10o2: draft('安息香酸エチルと決定', 4),
      },
    };
    const merged = mergeWriting(left, right, base)!;
    expect(merged.drafts[task].text).toBe('端末Bの考察メモ');
    expect(merged.conflicts[task][0].text).toBe('端末Aの考察メモ');
    expect(merged.drafts.chem_lab_ester_c9h10o2.text).toBe('安息香酸エチルと決定');
    expect(parseWriting(JSON.stringify(merged))).toEqual(merged);
  });

  it('reads the chemistry writing key in SYNC_SECTIONS and preserves unrelated records', () => {
    expect(SYNC_SECTIONS.find(section => section.id === 'reading')!.keys('alice')).toEqual([writingKey('alice')]);
    const store = new MemoryKV();
    store.setItem('vocab_quiz_v1_alice', 'old-record');
    reconcile(store, 'alice', null, {});
    expect(store.getItem('vocab_quiz_v1_alice')).toBe('old-record');
  });

  it('round-trips wordbook quiz, lab drafts and growth records across two isolated device stores', () => {
    const a = new MemoryKV();
    const b = new MemoryKV();
    const record = { version: 1, missed: ['chem-term-chem_basic_matter-a-001'], mastered: [], best: {} };
    a.setItem('eiken_vocab_quiz_v2_alice', JSON.stringify(record));
    a.setItem(writingKey('alice'), JSON.stringify({ ...emptyWriting(), drafts: { [task]: draft('ビュレットは共洗いする', 1) } }));
    const first = reconcile(a, 'alice', null, {});
    expect(Object.keys(first.upload)).toEqual(expect.arrayContaining(['s_reading', 's_vocabQuiz']));
    reconcile(b, 'alice', first.upload, {});
    expect(JSON.parse(b.getItem('eiken_vocab_quiz_v2_alice')!)).toEqual(record);
    expect(parseWriting(b.getItem(writingKey('alice'))).drafts[task].text).toBe('ビュレットは共洗いする');
    expect(b.getItem(writingKey('bob'))).toBeNull();
  });

  it('moves guest lab drafts into the signed-in account idempotently', () => {
    const store = new MemoryKV();
    store.setItem(writingKey('guest'), JSON.stringify({ ...emptyWriting(), drafts: { [task]: draft('ゲストの下書き') } }));
    migrateGuestData(store, 'alice');
    expect(parseWriting(store.getItem(writingKey('alice'))).drafts[task].text).toBe('ゲストの下書き');
  });
});
