import { syncUserData } from '../utils/userDataSync';
import { auth, FIREBASE_CONFIGURED, USE_EMULATORS } from '../firebase';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, FlaskConical, PenLine, Save } from 'lucide-react';
import { CHEM_COURSES, type EikenGrade } from '../eiken/config';
import { CHEM_LAB_TASKS } from '../chemistry/materials/labTasks';
import type { ChemLabTaskSpec } from '../chemistry/types';
import { emptyWriting, parseWriting, writingKey, type WritingDraft, type WritingProgress } from '../eiken/writingProgress';
import { safeLocalStorage } from '../utils/safeLocalStorage';
import { USER_DATA_SYNCED_EVENT } from '../utils/userDataSyncEvent';
import { formatText } from '../utils/textFormatter';
import './eiken-writing.css';

export interface UnifiedWritingTask extends ChemLabTaskSpec {
  key: string;
  grade: EikenGrade;
}

export const EIKEN_WRITING_TASKS: readonly UnifiedWritingTask[] = CHEM_LAB_TASKS.map(task => ({
  ...task,
  grade: task.course,
}));

const blank: WritingDraft = { text: '', checked: [], reviewed: false, updatedAt: 0 };

function read(uid: string): { data: WritingProgress; error: string } {
  try {
    const store = safeLocalStorage();
    if (!store) throw new Error('保存を利用できません。入力内容をコピーして保管してください。');
    return { data: parseWriting(store.getItem(writingKey(uid))), error: '' };
  } catch (error) {
    return { data: emptyWriting(), error: error instanceof Error ? error.message : '保存記録を読み込めません。' };
  }
}

function parseTargetChars(target: string): [number, number] | null {
  const m = target.match(/(\d+)\s*[〜～-]\s*(\d+)\s*字/);
  if (!m) return null;
  const min = Number(m[1]);
  const max = Number(m[2]);
  return Number.isFinite(min) && Number.isFinite(max) && max > 0 ? [min, max] : null;
}

export function EikenWriting({
  uid,
  grade: selectedGrade,
  onGrade,
  initialTaskKey,
  onBack,
}: {
  uid: string;
  grade: EikenGrade;
  onGrade: (grade: EikenGrade) => void;
  initialTaskKey?: string | null;
  onBack: () => void;
}) {
  const available = useMemo(
    () => CHEM_COURSES.filter(c => EIKEN_WRITING_TASKS.some(t => t.grade === c.id)),
    [],
  );
  const grade: EikenGrade = EIKEN_WRITING_TASKS.some(t => t.grade === selectedGrade)
    ? selectedGrade
    : (available[0]?.id ?? 'chem_basic_change');

  const [saved, setSaved] = useState(() => read(uid));
  const [message, setMessage] = useState('');
  const editor = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const refresh = () => setSaved(read(uid));
    window.addEventListener(USER_DATA_SYNCED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(USER_DATA_SYNCED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [uid]);

  const gradeTasks = useMemo(
    () => EIKEN_WRITING_TASKS.filter(t => t.grade === grade),
    [grade],
  );

  const [taskId, setTaskId] = useState<string>(() => {
    if (initialTaskKey && EIKEN_WRITING_TASKS.some(t => t.key === initialTaskKey)) {
      return initialTaskKey;
    }
    return gradeTasks[0]?.key ?? EIKEN_WRITING_TASKS[0]!.key;
  });

  useEffect(() => {
    if (initialTaskKey && EIKEN_WRITING_TASKS.some(t => t.key === initialTaskKey)) {
      const matched = EIKEN_WRITING_TASKS.find(t => t.key === initialTaskKey)!;
      if (matched.grade !== grade) onGrade(matched.grade);
      setTaskId(matched.key);
      return;
    }
    if (!gradeTasks.some(t => t.key === taskId) && gradeTasks[0]) {
      setTaskId(gradeTasks[0].key);
    }
  }, [grade, gradeTasks, initialTaskKey, onGrade, taskId]);

  const task = gradeTasks.find(t => t.key === taskId) ?? gradeTasks[0] ?? EIKEN_WRITING_TASKS[0]!;
  const current = saved.data.drafts[task.key] ?? blank;

  const save = (patch: Partial<WritingDraft>) => {
    if (saved.error) return;
    try {
      const store = safeLocalStorage();
      if (!store) throw new Error('この端末では保存を利用できません。');
      const nextDraft: WritingDraft = {
        ...current,
        ...patch,
        updatedAt: Date.now(),
      };
      const next: WritingProgress = {
        ...saved.data,
        drafts: { ...saved.data.drafts, [task.key]: nextDraft },
      };
      store.setItem(writingKey(uid), JSON.stringify(next));
      setSaved({ data: next, error: '' });
      setMessage('端末に保存しました');
      if (auth.currentUser && (FIREBASE_CONFIGURED || USE_EMULATORS)) {
        void syncUserData(auth.currentUser.uid);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存に失敗しました。');
    }
  };

  const toggleCheck = (idx: number) => {
    const nextChecked = current.checked.includes(idx)
      ? current.checked.filter(n => n !== idx)
      : [...current.checked, idx];
    const allChecked = nextChecked.length >= task.checklist.length && current.text.trim().length > 0;
    save({ checked: nextChecked, reviewed: allChecked || current.reviewed });
  };

  const reviewedCount = EIKEN_WRITING_TASKS.filter(t => saved.data.drafts[t.key]?.reviewed).length;
  const charCount = current.text.trim().length;
  const targetRange = parseTargetChars(task.target);
  const inTargetRange = targetRange ? charCount >= targetRange[0] && charCount <= targetRange[1] : charCount >= 40;
  const overTargetRange = targetRange ? charCount > targetRange[1] : false;
  const gaugePct = targetRange ? Math.min(100, Math.round((charCount / targetRange[1]) * 100)) : Math.min(100, charCount);

  return (
    <main className="ew-page" data-writing>
      <header className="ew-header">
        <button type="button" className="ew-back-btn" onClick={onBack}>
          <ArrowLeft size={18} />学習へ
        </button>
        <div className="ew-header-main">
          <h1>実験考察・構造決定ラボ</h1>
          <span className="ew-progress-pill">
            自己点検済み <b>{reviewedCount}</b> / {EIKEN_WRITING_TASKS.length} テーマ
          </span>
        </div>
      </header>

      <nav className="ew-picker" aria-label="考察・構造決定テーマの選択">
        <div className="ew-picker-top">
          <div className="ew-grade-tabs" role="tablist" aria-label="分野の切り替えタブ">
            {available.map(c => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={c.id === grade}
                className="ew-grade-tab"
                data-active={c.id === grade || undefined}
                onClick={() => onGrade(c.id)}
              >
                {c.shortLabel}
              </button>
            ))}
          </div>

          <label className="ew-select-fallback">
            <span>分野</span>
            <select aria-label="考察ラボの分野" value={grade} onChange={event => onGrade(event.target.value as EikenGrade)}>
              {available.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="ew-subtasks" role="group" aria-label="テーマ一覧">
          <span className="ew-subtasks-label">テーマ：</span>
          <div className="ew-subtasks-buttons">
            {gradeTasks.map((item, idx) => {
              const draft = saved.data.drafts[item.key];
              const isReviewed = !!draft?.reviewed;
              const chars = (draft?.text ?? '').trim().length;
              return (
                <button
                  type="button"
                  key={item.key}
                  className="ew-task-card"
                  aria-pressed={item.key === task.key}
                  onClick={() => setTaskId(item.key)}
                >
                  <FlaskConical size={16} aria-hidden="true" />
                  <span className="ew-task-card-text">
                    <strong>課題{idx + 1}：{item.title}</strong>
                    <small>
                      {isReviewed ? '自己点検済み' : chars > 0 ? `下書きあり（${chars}字）` : item.categoryLabel}
                    </small>
                  </span>
                  {isReviewed && <CheckCircle2 size={16} className="ew-done-icon" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {saved.error && <p role="alert">{saved.error}</p>}

      <div className="ew-workspace">
        <section className="ew-prompt" aria-labelledby="writing-task-title">
          <div className="ew-stage-label">
            <FlaskConical size={15} aria-hidden="true" /> {task.categoryLabel}
          </div>
          <h2 id="writing-task-title">{task.title}</h2>
          <div className="ew-instructions leading-relaxed">{formatText(task.instruction)}</div>

          {task.source && (
            <article className="ew-source whitespace-pre-line text-sm leading-relaxed">
              {formatText(task.source)}
            </article>
          )}

          <p className="ew-target">{task.target}</p>
          <p className="ew-disclaimer">
            共通テストの実験考察問題および国公立二次記述への橋渡し演習です。自分の言葉・化学反応式で整理したあと、自己点検リストと模範解答例で根拠を照合しましょう。
          </p>
        </section>

        <section className="ew-answer">
          <label htmlFor="writing-answer">
            <PenLine size={15} className="inline mr-1" aria-hidden="true" />
            あなたの考察・導出メモ（化学式・反応式・理由）
          </label>
          <textarea
            ref={editor}
            id="writing-answer"
            value={current.text}
            maxLength={4000}
            disabled={!!saved.error}
            placeholder="ここに理由・計算式・構造式の導出プロセスを書いて整理しよう（例：ビュレットを純水で濡れたまま使うと滴下液の濃度 c が薄まり…）"
            onChange={event => save({ text: event.target.value, reviewed: false })}
          />
          <div className="ew-save">
            <span data-writing-count>
              <strong>{charCount}</strong> 字
              {targetRange && (
                <em className={`ew-word-badge ${inTargetRange ? 'is-ok' : overTargetRange ? 'is-over' : ''}`}>
                  {inTargetRange
                    ? '目安字数クリア'
                    : overTargetRange
                    ? `目安 +${charCount - targetRange[1]}字`
                    : charCount > 0
                    ? `あと ${targetRange[0] - charCount}字で目安到達`
                    : `目標 ${targetRange[0]}〜${targetRange[1]}字`}
                </em>
              )}
            </span>
            <span role="status">
              <Save size={14} />
              {message || (current.updatedAt ? '保存した下書きから再開' : '入力はこの端末・アカウントに自動保存されます')}
            </span>
          </div>
          {targetRange && (
            <div className="ew-word-meter" aria-hidden="true">
              <div
                className={`ew-word-meter-fill ${inTargetRange ? 'is-ok' : overTargetRange ? 'is-over' : ''}`}
                style={{ width: `${gaugePct}%` }}
              />
            </div>
          )}

          <div className="ew-checklist mt-4">
            <h3>採点ポイント自己点検（すべて確認すると点検済みになります）</h3>
            <ul>
              {task.checklist.map((point, idx) => {
                const checked = current.checked.includes(idx);
                return (
                  <li key={point}>
                    <label className="flex items-start gap-2 cursor-pointer text-sm leading-relaxed">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCheck(idx)}
                        className="mt-1"
                      />
                      <span>{formatText(point)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl bg-[#1f5c53] px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-[#174740] cursor-pointer"
                onClick={() =>
                  save({
                    checked: task.checklist.map((_, i) => i),
                    reviewed: true,
                  })
                }
              >
                自己点検を完了する
              </button>
            </div>
          </div>

          <details className="ew-model mt-4 rounded-xl border border-slate-200 bg-[#fffdf8] p-3.5">
            <summary className="cursor-pointer font-extrabold text-[#1f3b5b]">
              模範解答例・詳しい解説を開く
            </summary>
            <div className="mt-3 space-y-3 text-sm leading-relaxed">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                <strong className="block text-xs font-extrabold text-emerald-800 mb-1">【模範解答例】</strong>
                <div className="whitespace-pre-line text-slate-800">{formatText(task.model)}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <strong className="block text-xs font-extrabold text-slate-700 mb-1">【思考プロセス・共通テストの急所】</strong>
                <div className="whitespace-pre-line text-slate-700">{formatText(task.commentary)}</div>
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}
