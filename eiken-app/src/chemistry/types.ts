import type { ChemCourseId } from '../eiken/config';

export type ChemQuestionFormat =
  | 'statement_judge'      // 正誤判定（適当／誤りを含むものを選べ）
  | 'calculation'          // 量的関係・数値計算（mol・濃度・pH・滴定・平衡・熱・電池）
  | 'experiment_inquiry'   // 実験操作・器具・グラフ・表の考察
  | 'dialogue_inquiry'     // 生徒と先生の探究会話・仮説検証
  | 'structure_synthesis'; // 構造決定・系統分離・反応経路

export interface ChemSubItem {
  id: string;
  /** 例: "問1", "問2(a)", "問2(b)" */
  label: string;
  /** 小問の問いかけ（単独大問では省略可） */
  prompt?: string;
  /** 4択の選択肢（①〜④） */
  choices: readonly [string, string, string, string];
  /** 正解の 0-based index (0..3) */
  answer: 0 | 1 | 2 | 3;
  /** 分野・スキルタグ（弱点分析に表示） */
  skill: string;
  /** 解法の根拠・計算過程 */
  explanation: string;
  /** ①〜④ それぞれの正誤理由 */
  reasons: readonly [string, string, string, string];
  /** 解き方のステップ（解説画面のステップ表示用） */
  steps?: readonly string[];
  /** 配点（共通テスト換算の目安） */
  points?: number;
}

export interface ChemProblemSpec {
  id: string;
  title: string;
  format: ChemQuestionFormat;
  /** 問題文（実験リード文・表・条件・原子量などを含む） */
  stem: string;
  /** SVG Data URI などの図版（滴定曲線・電池・結晶格子・分離フロー等） */
  imageUrl?: string;
  imageCaption?: string;
  subItems: readonly ChemSubItem[];
  /** 周辺知識・語呂合わせ・共通テストの引っかかりポイント */
  surroundingKnowledge: readonly string[];
}

export interface ChemSummaryFormula {
  label: string;
  expr: string;
  note?: string;
}

export interface ChemSummaryTable {
  caption?: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}

/** 1画面に収まる単元別「まとめプリント」データ */
export interface ChemSummarySheet {
  /** 単元の核心キャッチコピー（1行） */
  subtitle: string;
  /** 最重要公式・反応式・定義（2〜3項目） */
  formulas: readonly ChemSummaryFormula[];
  /** 1画面で比較できる整理表（3〜5行） */
  table: ChemSummaryTable;
  /** 共通テストの急所・ひっかけ対策（2項目） */
  traps: readonly string[];
}

export interface ChemChapterSpec {
  /** 必ず `${course}_...` で始まる一意ID */
  id: string;
  course: ChemCourseId;
  /** ChapterSelection の上部タブ名（例: "第1章 物質の構成と分離"） */
  tabTitle: string;
  /** 単元カードの見出し（例: "第1回 純物質と混合物・分離と精製"） */
  unitTitle: string;
  /** 学習テーマ一覧 */
  topics: readonly string[];
  /** 演習の前に1画面で提示する「まとめプリント」（問題中・解説中も再表示可能） */
  summarySheet?: ChemSummarySheet;
  problems: readonly ChemProblemSpec[];
}

export interface ChemMockItem extends ChemSubItem {
  stem: string;
  points: number;
}

export interface ChemMockSection {
  id: string;
  daimonLabel: string;
  title: string;
  leadText?: string;
  imageUrl?: string;
  imageCaption?: string;
  items: readonly ChemMockItem[];
}

export interface ChemMockExamSpec {
  id: string;
  course: ChemCourseId;
  /** 'basic' = 共通テスト『化学基礎』（30分・50点換算）, 'advanced' = 共通テスト『化学』（60分・100点換算） */
  examCategory: 'basic' | 'advanced';
  round: number;
  title: string;
  subtitle: string;
  timeLimitMinutes: number;
  totalPoints: number;
  sections: readonly ChemMockSection[];
}

export interface ChemLabTaskSpec {
  id: string;
  key: string;
  course: ChemCourseId;
  categoryLabel: '実験考察' | '計算立式' | '無機系統分離' | '有機構造決定';
  round?: number;
  title: string;
  instruction: string;
  /** 実験データ・元素分析値・反応条件などの資料文 */
  source?: string;
  /** 記述の目安（例: "目安：80〜140字（反応式＋理由）"） */
  target: string;
  /** 模範解答 */
  model: string;
  /** 採点ポイント・解説 */
  commentary: string;
  /** 自己点検チェックリスト */
  checklist: readonly string[];
}
