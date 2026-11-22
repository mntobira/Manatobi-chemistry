import { ArrowRight, ChevronLeft, FlaskConical, Swords } from 'lucide-react';
import type { SubjectId } from '../data/subjectLabels';
import { getSubjectStats } from '../data/chapterIndex.generated';
import { CHEM_COURSES } from '../eiken/config';
import { isSubjectEnabled } from '../config/features';
import './listening-home.css';
import { KineticText } from '../motion';

export interface ListeningSubjectSelectionProps {
  onSelectSubject: (subject: SubjectId) => void;
  currentSubject?: SubjectId;
  backLabel?: string;
  isGuest: boolean;
  onBack?: () => void;
  onBattle?: () => void;
}

/** リスニング版・英検版のカード・余白・戻る操作を維持し、化学基礎・化学の6分野を選択する。 */
export function ListeningSubjectSelection({
  onSelectSubject,
  currentSubject,
  onBack,
  onBattle,
  backLabel = 'ホームに戻る',
}: ListeningSubjectSelectionProps) {
  return (
    <main className="listening-home ls-subjects" data-eiken-grades>
      <div className="lh-container">
        <header className="lh-header">
          {onBack ? (
            <button className="ls-subjects-back" onClick={onBack} aria-label={backLabel}>
              <ChevronLeft size={18} />
              {backLabel}
            </button>
          ) : (
            <span />
          )}
          <div className="lh-brand">
            <img src="/brand/manatobi-logo.webp" alt="マナトビ" width={1008} height={321} />
          </div>
        </header>
        <section className="ls-subjects-title">
          <p className="lh-eyebrow">なにを学ぶ？</p>
          <h1>
            <KineticText text="化学基礎・化学の分野を選択" step={45} variant="wave" />
          </h1>
          <p>共通テストの出題形式（正誤・計算・実験グラフ・探究考察・構造決定）で分野別に演習しよう。</p>
        </section>
        <section className="ls-grade-grid" aria-label="化学基礎・化学の分野">
          {CHEM_COURSES.map(course => {
            const enabled = isSubjectEnabled(course.id);
            const stats = getSubjectStats(course.id);
            return (
              <button
                type="button"
                key={course.id}
                className="ls-subject-main"
                data-eiken-grade={course.id}
                aria-current={currentSubject === course.id ? 'true' : undefined}
                disabled={!enabled}
                onClick={() => {
                  if (enabled) onSelectSubject(course.id);
                }}
              >
                <span className="lh-main-icon">
                  <FlaskConical size={28} aria-hidden="true" />
                </span>
                <span>
                  <strong>{course.label}</strong>
                  <span>
                    {enabled ? `${stats.chapters}単元・${stats.marks}設問（${course.tagline}）` : '教材準備中'}
                  </span>
                </span>
                <ArrowRight size={22} aria-hidden="true" />
              </button>
            );
          })}
        </section>
        {onBattle && (
          <button className="ls-foundation-battle" onClick={onBattle}>
            <Swords size={22} aria-hidden="true" />
            <span>
              <strong>対戦で固める</strong>
              <small>4択スピード対戦のメニューを開く</small>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
        <p className="ls-subjects-note">
          大学入学共通テスト対策のオリジナル問題です。進捗と復習ノートは分野ごとに保存されます。
        </p>
      </div>
    </main>
  );
}
