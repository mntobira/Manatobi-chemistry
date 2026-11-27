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
  chem_basic_matter: '純物質とクロマトRf/多段抽出・分留と再結晶・同素体SCOPとC₆₀(90辺)・等電子イオン半径・質量分析MS・結晶・多資料統合（全24単元）',
  chem_basic_change: 'mol計算・過不足濃度・ワルダー二段滴定・逆滴定・Ba(OH)₂電気伝導度V字曲線・吸光度検量線・COD・Liイオン＆燃料電池統合（全27単元）',
  chem_theory: '状態方程式と圧縮因子Z・気液平衡×沸点上昇・熱量計の冷却直線外挿(ΔT)・結合エネルギー・弱酸存在分率・ΔS・一次反応・電気分解（全31単元）',
  chem_inorganic: '気体発生＆洗気びん順序・乾燥剤2大例外・3Cu+8HNO₃役割比・ヨウ素/水ガラス・鉄シアノ錯塩・モール法Ksp・再溶解グラフ・系統分離（全27単元）',
  chem_organic: 'オゾン分解・エステル化平衡・ラクトン・5大裏切り者・氷冷ジアゾ化＆カップリング・ニトロ化+45即算・医薬品収率・芳香族系統分離（全25単元）',
  chem_polymer: '糖類・グルタチオン・ペプチド配列・酵素阻害(Vmax/Km)・ビニロン＋12の鉄則・PET/PLA・イオン交換2価混合塩連立・DNA水素結合数（全21単元）',
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
      badge: '冊子＋第6問B式スマホ対応',
      section: 'memorize',
      description: '『化学基礎』30分/50点（全9回）＋『化学』60分/100点・5大問15設問（全9回）。スマホ1画面資料切替＆PC問題冊子＋マーク解答用紙・プリント解法鉄則つき',
      meta: `全${CHEM_MOCK_EXAMS.length}回（基礎${CHEM_MOCK_EXAMS.filter(e => e.examCategory === 'basic').length}回・化学${CHEM_MOCK_EXAMS.filter(e => e.examCategory === 'advanced').length}回）`,
      action: { kind: 'mock' },
    },
    {
      id: 'chem_lab',
      title: '実験考察・構造決定ラボ',
      icon: 'pen',
      section: 'memorize',
      description: '熱量計の冷却直線外挿・Li電池vs鉛蓄電池・塩素精製と硝酸酸化比・氷冷ジアゾ化・イオン交換連立・ポリイミドまで記述で整理＆自己採点',
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
