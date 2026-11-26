/**
 * 学習カタログ（データ駆動）
 *
 *   科目（subject） → 学習コンテンツ（contents） → 単元・模試・ラボ・暗記帳画面
 */
import { getSubjectStats } from './chapterIndex.generated';
import { CHEM_COURSES } from '../eiken/config';
import { CHEM_MOCK_EXAMS } from '../chemistry/materials/mockExams';
import { CHEM_LAB_TASKS } from '../chemistry/materials/labTasks';
import { isSubjectEnabled } from '../config/features';
import { VOCABULARY_COUNT } from './listeningVocabularyMeta.generated';

/** コンテンツを押したときに開く既存の画面。App 側で1か所にまとめて解釈する */
export type StudyAction =
  | { kind: 'units'; subject: string }           // 単元一覧（ChapterSelection）
  | { kind: 'foundation'; tab: 'words' | 'grammar' | 'more' } // 暗記帳ページの各タブ
  | { kind: 'vocabQuiz' }                         // 用語・化学式の4択演習
  | { kind: 'reading' }
  | { kind: 'writing' }                           // 実験考察・構造決定ラボ
  | { kind: 'mock' }                              // 共通テスト実戦 通し模試モード
  | { kind: 'pastAnalysis'; initialTab?: 'pdfs' | 'traps' | 'timeline' | 'tactics' }; // 37年過去問分析＆PDF冊子スタジオ

export type StudyIcon = 'headphones' | 'pen' | 'letters' | 'book' | 'flask' | 'sigma' | 'globe' | 'briefcase';

export interface StudyContent {
  id: string;
  title: string;
  /** 1行の説明（何が学べるか） */
  description: string;
  /** 規模（単元数・問題数など）。データから作る */
  meta: string;
  icon: StudyIcon;
  /** 主役のコンテンツ（カードを少し強調する） */
  primary?: boolean;
  /**
   * 並べる場所：
   *   'practice' … 問題を解くもの（分野別カード）
   *   'memorize' … 模試・考察ラボ・暗記帳・スピード4択
   *   'spotlight' … とびら君の吹き出しの右に置く小さな入口
   */
  section?: 'practice' | 'memorize' | 'spotlight';
  /** 進捗の集計に使う科目ID（単元一覧を持つコンテンツだけ） */
  progressSubject?: string;
  /** タイトル横の小さな札（例：'NEW'）。「前回」のほうが優先 */
  badge?: string;
  action: StudyAction;
}

export interface StudySubject {
  id: string;
  label: string;
  /** 科目カードの一言 */
  description: string;
  icon: StudyIcon;
  contents: StudyContent[];
}

const DESC_BY_COURSE: Record<string, string> = {
  chem_basic_matter: '純物質とクロマトRf/多段抽出・白色粉末定性・質量分析MS・吸光度・周期律・分子極性(CH₂Cl₂/SO₂)・C₆₀結晶（全17単元）',
  chem_basic_change: 'mol計算・過不足濃度範囲・気体逸散と元素%・ワルダー二段滴定・硫安逆滴定・COD・一次電池・トタンとブリキ（全20単元）',
  chem_theory: '密閉燃焼・逆浸透・ヘンリー・弱酸希釈pH・ΔS自発変化・一次反応半減期・アレニウス式・直列並列電気分解（全23単元）',
  chem_inorganic: 'ヨウ素製法・水ガラスとシリカゲル・鉄シアノ錯塩・実用合金・銑鉄/バイヤー計算・H₂S×Ksp選択沈殿・EDTA（全20単元）',
  chem_organic: '原油分留・オゾン分解・エステル化平衡K=4.0・環状ラクトン・芳香族異性体完全制覇(コルナー法)・多段階構造決定（全19単元）',
  chem_polymer: '糖類・グルタチオンGSSG・ペンタペプチド配列決定・微量S分子量・PVB・ポリイミド・共重合ゴムSBR/NBR・イオン交換連立（全15単元）',
};

const ICON_BY_COURSE: Record<string, StudyIcon> = {
  chem_basic_matter: 'flask',
  chem_basic_change: 'flask',
  chem_theory: 'sigma',
  chem_inorganic: 'globe',
  chem_organic: 'book',
  chem_polymer: 'book',
};

export const STUDY_CATALOG: readonly StudySubject[] = [{
  id: 'chemistry',
  label: 'まなとび化学基礎・化学',
  description: '共通テスト対策（正誤・量的計算・実験グラフ・探究会話・構造決定）＋通し模試・考察ラボ・暗記帳',
  icon: 'flask',
  contents: [
    ...CHEM_COURSES.filter(course => isSubjectEnabled(course.id)).map((course): StudyContent => {
      const stats = getSubjectStats(course.id);
      return {
        id: course.id,
        title: course.label,
        primary: true,
        icon: ICON_BY_COURSE[course.id] ?? 'flask',
        description: DESC_BY_COURSE[course.id] ?? course.tagline,
        meta: `${stats.chapters}単元・${stats.marks}設問`,
        progressSubject: course.id,
        action: { kind: 'units', subject: course.id },
      };
    }),
    {
      id: 'chem_past_spotlight',
      title: '37年過去問分析＆PDF冊子',
      icon: 'book',
      badge: '1990-2026',
      section: 'spotlight',
      description: 'センター〜共テ急所18選＆全39冊PDF印刷',
      meta: '全39冊PDF',
      action: { kind: 'pastAnalysis', initialTab: 'pdfs' },
    },
    {
      id: 'chem_past_bible',
      title: 'センター〜共テ37年 過去問徹底分析＆本番形式PDF冊子スタジオ',
      icon: 'book',
      badge: '満点バイブル＋39冊PDF',
      section: 'memorize',
      description: 'センター(1990-2020)〜共通テスト(2021-2026)の平均点・正答率30%台の壁・歴代ひっかけ誤文18選（赤シート＆単元直結）と、模試3分冊・A4横マークシート・全114単元まとめPDFを完備',
      meta: '37年分析・全39冊PDF収録',
      action: { kind: 'pastAnalysis', initialTab: 'pdfs' },
    },
    {
      id: 'chem_mock',
      title: '共通テスト実戦 通し模試',
      icon: 'briefcase',
      badge: '冊子＋マークシート',
      section: 'memorize',
      description: '『化学基礎』30分/50点（全4回）＋『化学』60分/100点・5大問15設問（全4回）。本番準拠「問題冊子＋マーク解答用紙」・消去スラッシュ・2次余裕合格診断つき',
      meta: `全${CHEM_MOCK_EXAMS.length}回（基礎4回・化学4回）`,
      action: { kind: 'mock' },
    },
    {
      id: 'chem_lab',
      title: '実験考察・構造決定ラボ',
      icon: 'pen',
      section: 'memorize',
      description: '過不足濃度範囲・逆浸透淡水化・弱酸希釈曲線・鉄シアノ錯塩・イミド環化・グルタチオン酸化まで記述で整理＆自己採点',
      meta: `全${CHEM_LAB_TASKS.length}テーマ`,
      action: { kind: 'writing' },
    },
    {
      id: 'chem_wordbook',
      title: '重要用語・化学式・反応式帳',
      icon: 'letters',
      section: 'memorize',
      description: '化学基礎〜高分子の必須用語・半反応式・工業製法・検出反応を分野×重要度別に赤シート感覚で確認',
      meta: `${VOCABULARY_COUNT.toLocaleString()}項目`,
      action: { kind: 'foundation', tab: 'words' },
    },
    {
      id: 'chem_vocab_quiz',
      title: '用語・化学式の4択スピード確認',
      icon: 'flask',
      section: 'memorize',
      description: '定義→用語・用語→定義の双方向4択で共通テスト第1問の知識抜けを素早くチェック',
      meta: `${(VOCABULARY_COUNT * 2).toLocaleString()}問`,
      action: { kind: 'vocabQuiz' },
    },
  ],
}];

export function findStudySubject(id: string | null | undefined): StudySubject | undefined {
  return STUDY_CATALOG.find(s => s.id === id) ?? STUDY_CATALOG[0];
}
