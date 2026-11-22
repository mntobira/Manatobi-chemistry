export const VOCABULARY_URL = '/data/listeningVocabulary.json?v=chemistry-wordbook-20261121';
import { perUserKey } from '../utils/userStorageKeys';
export interface WordQuestion { id: string; prompt: string; label: string; options: string[]; answerIndex: number }
export interface ListeningExample { chapterId: string; chapterTitle: string; problemId: string; problemIndex: number; script: string; audioUrl: string; translation: string }
export interface ListeningWord { id: string; word: string; meaning: string; fullMeaning: string; level: string; exampleSentence?: string; exampleTranslation?: string; chapterIds: string[]; examples: ListeningExample[]; questions: WordQuestion[] }
export interface VocabularyData { wordCount: number; questionCount: number; unitSize: number; chapters: { id: string; title: string }[]; words: ListeningWord[] }

export const VOCAB_LEVELS: Record<string, string> = {
  chem_basic_matter_a: '最頻出A・化学基礎① 純物質・分離・原子構造・周期表',
  chem_basic_matter_b: '重要B・化学基礎① 化学結合・結晶・極性・分子間力',
  chem_basic_matter_i: '反応式・法則・化学基礎① 炎色反応・成分検出・語呂と法則',
  chem_basic_change_a: '最頻出A・化学基礎② 物質量mol・溶液濃度・酸と塩基・pH',
  chem_basic_change_b: '重要B・化学基礎② 中和滴定・酸化還元・イオン化傾向・電池',
  chem_basic_change_i: '反応式・半反応式・化学基礎② 中和・酸化還元・電池の重要反応式',
  chem_theory_a: '最頻出A・化学① 気体の法則・結晶格子・希薄溶液の性質',
  chem_theory_b: '重要B・化学① エンタルピー・反応速度・化学平衡・電気分解',
  chem_theory_i: '公式・法則・化学① 理論化学の必須計算公式と平衡定数',
  chem_inorganic_a: '最頻出A・化学② 非金属元素・気体の製法と性質・工業的製法',
  chem_inorganic_b: '重要B・化学② 典型金属・遷移元素・錯イオン・沈殿と系統分離',
  chem_inorganic_i: '反応式・化学② 無機化学の最重要化学反応式・イオン反応式',
  chem_organic_a: '最頻出A・化学③ 脂肪族炭化水素・アルコール・カルボニル・エステル',
  chem_organic_b: '重要B・化学③ 油脂・芳香族化合物・抽出分離・構造決定の検出反応',
  chem_organic_i: '反応式・化学③ 有機化合物の重要反応経路と官能基判定',
  chem_polymer_a: '最頻出A・化学④ 糖類・アミノ酸・タンパク質・酵素・核酸',
  chem_polymer_b: '重要B・化学④ 合成繊維・合成樹脂・イオン交換樹脂・天然/合成ゴム',
  chem_polymer_i: '構造・重合・化学④ 単量体と重合反応・呈色反応まとめ',
};

export function levelsOfGrade(courseId: string): string[] {
  return [`${courseId}_a`, `${courseId}_b`, `${courseId}_c`, `${courseId}_i`].filter(k => k in VOCAB_LEVELS);
}

export interface SupportProgress { version: 1; words: string[]; grammar: string[] }
export const supportStorageKey = (uid: string) => perUserKey('chemistry_support_v1_', uid);

export function parseSupportProgress(raw: string | null): SupportProgress {
  if (raw === null) return { version: 1, words: [], grammar: [] };
  const p = JSON.parse(raw);
  if (!p || p.version !== 1 || !Array.isArray(p.words) || !Array.isArray(p.grammar) || ![...p.words, ...p.grammar].every(x => typeof x === 'string')) {
    throw new Error('保存記録を読み込めません。元の記録は上書きせず保護しています。');
  }
  return { version: 1, words: [...new Set<string>(p.words)], grammar: [...new Set<string>(p.grammar)] };
}

export function filterVocabulary(words: readonly ListeningWord[], query: string, level: string, chapter: string, unlearned: boolean, known: readonly string[]): ListeningWord[] {
  const needle = query.normalize('NFKC').toLowerCase().trim();
  const seen = new Set(known);
  return words.filter(w => (!level || w.level === level) && (!chapter || w.chapterIds.includes(chapter)) && (!unlearned || !seen.has(w.id)) && (!needle || (w.word + ' ' + w.fullMeaning).normalize('NFKC').toLowerCase().includes(needle)));
}

export interface GrammarLesson { id: string; title: string; point: string; example: string; translation: string; tip: string; question: string; options: string[]; answer: number; explanation: string }
export const LISTENING_GRAMMAR: readonly GrammarLesson[] = [
  { id: 'mol', title: '物質量 mol を中心に置く', point: '質量 g・気体体積 L・粒子数 個・モル濃度 mol/L はすべて一度 mol に変換して結ぶ。', example: 'CO₂ 88 g → 88 / 44 = 2.0 mol → 標準状態で 44.8 L', translation: 'モル質量 44 g/mol で割って物質量を求め、22.4 L/mol を掛ける。', tip: '化学計算で迷ったらまず mol を求める。', question: '標準状態で CO₂ 11.2 L の物質量は？', options: ['0.25 mol', '0.50 mol', '2.0 mol'], answer: 1, explanation: '11.2 L ÷ 22.4 L/mol = 0.50 mol です。' },
  { id: 'neutralization', title: '中和点と液性の区別', point: '中和の量的関係 acV = bc\'V\' に強弱は関係しないが、中和点の pH は生成する塩の加水分解で決まる。', example: 'CH₃COOH + NaOH → CH₃COONa + H₂O（中和点は弱塩基性）', translation: '弱酸と強塩基の中和点では酢酸ナトリウムが加水分解し塩基性になる。', tip: '「強」がつく側に液性が引っ張られる（フェノールフタレインを選択）。', question: '酢酸を NaOH 水溶液で滴定するときの適切な指示薬は？', options: ['メチルオレンジ', 'フェノールフタレイン', 'どちらも不可'], answer: 1, explanation: '塩基性側に変色域（8.0〜9.8）をもつフェノールフタレインを用います。' },
  { id: 'redox', title: '酸化数と半反応式の組み立て', point: 'O の数は H₂O で合わせ、H の数は H⁺ で合わせ、最後に電荷を e⁻ で合わせる。', example: 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O', translation: 'マンガンは酸化数 +7 から +2 へ変化するため 5 個の電子を受け取る。', tip: '酸化剤が受け取る e⁻ の物質量 ＝ 還元剤が失う e⁻ の物質量。', question: '酸性条件で MnO₄⁻ 1 mol が受け取る電子は何 mol？', options: ['2 mol', '3 mol', '5 mol'], answer: 2, explanation: 'Mn の酸化数が +7 → +2 に 5 減少するため 5 mol の e⁻ を受け取ります。' },
];
