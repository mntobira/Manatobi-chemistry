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
  | { kind: 'mock' };                             // 共通テスト実戦 通し模試モード

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
  chem_basic_matter: '純物質と分離・結晶質と非晶質・昇華と凝華・試薬保存法・周期律・化学結合・水素結合（全13単元）',
  chem_basic_change: 'mol計算・気体発生グラフ探究・酸塩基と塩の液性・二段階滴定・COD逆滴定・漂白剤定量・燃料電池（全16単元）',
  chem_theory: '気体とボルツマン分布・結晶格子・蒸気圧降下と浸透圧・エンタルピーとエントロピーΔS・半中和点・二次電池と電解（全19単元）',
  chem_inorganic: '無機反応6大原理・気体製法・工業製法・金属イオンの色と錯イオン・第1〜6属系統分離・セラミックスと環境化学（全16単元）',
  chem_organic: 'σ/π結合とアセチリド・オゾン分解・アルコール・ヒドロキシ酸とメソ体・油脂・芳香族医薬品と分液抽出（全15単元）',
  chem_polymer: '糖類アノマー・アミノ酸電気泳動・酵素反応速度・ナイロン/PET/ビニロン・熱硬化性樹脂・加硫ゴムとイオン交換樹脂（全11単元）',
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
      id: 'chem_mock',
      title: '共通テスト実戦 通し模試',
      icon: 'briefcase',
      badge: '共通テスト',
      section: 'memorize',
      description: '『化学基礎』30分/50点模試（全3回）＋『化学』60分/100点総合模試（全3回）。新課程ΔS・実験グラフ・配点採点つき',
      meta: `全${CHEM_MOCK_EXAMS.length}回（化学基礎3回・化学3回）`,
      action: { kind: 'mock' },
    },
    {
      id: 'chem_lab',
      title: '実験考察・構造決定ラボ',
      icon: 'pen',
      section: 'memorize',
      description: '試薬保存・共洗い誤差・逆滴定・ΔS自発変化・熱水分離・オゾン分解・加硫ゴム計算まで記述で整理＆自己採点',
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
