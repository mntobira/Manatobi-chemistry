import { CHEM_COURSES, type ChemCourseId } from '../eiken/config';

/**
 * ===================================================================
 * 教科の登録簿（教科を足すときに書き換えるのは、原則ここと教科データだけ）
 * ===================================================================
 *
 * 「まなとび化学基礎・化学」の6コース構成：
 *   1. chem_basic_matter : 化学基礎① 物質の構成と結合（ミントティール）
 *   2. chem_basic_change : 化学基礎② 物質の変化（mol・酸塩基・酸化還元）（コバルトブルー）
 *   3. chem_theory       : 化学① 理論化学（アンバーゴールド）
 *   4. chem_inorganic    : 化学② 無機物質（エメラルドグリーン）
 *   5. chem_organic      : 化学③ 有機化合物（コーラルオレンジ）
 *   6. chem_polymer      : 化学④ 高分子化合物（バイオレットパープル）
 */

export interface SubjectTheme {
  label: string;
  accent: string;
  accentSoft: string;
  surface: string;
  bubbleBorderClass: string;
  bubbleBgClass: string;
  bubbleShadow: string;
  chipTextClass: string;
  chipBgClass: string;
  progressBarClass: string;
}

export interface ReviewSubjectStyle {
  textClass: string;
  bgClass: string;
  borderClass: string;
  activeClass: string;
  stripeClass: string;
}

export interface SubjectDefinition {
  id: string;
  label: string;
  shortLabel: string;
  enabled: boolean;
  chapterIdPattern: RegExp;
  entry: 'chapters' | 'mode_selection';
  practiceDescription: string;
  learningDescription?: string;
  classroom?: boolean;
  theme: SubjectTheme;
  reviewStyle: ReviewSubjectStyle;
}

const COURSE_THEMES: Record<ChemCourseId, { practiceDescription: string; theme: Omit<SubjectTheme, 'label'>; reviewStyle: ReviewSubjectStyle }> = {
  chem_basic_matter: {
    practiceDescription: '純物質と分離・同素体・原子と周期表・イオン・化学結合と結晶・分子の極性と水素結合を共通テスト形式で演習します。',
    theme: {
      accent: '#2B8A82',
      accentSoft: '#A9E0D8',
      surface: '#F5FCFA',
      bubbleBorderClass: 'border-[#A9E0D8]/80',
      bubbleBgClass: 'bg-[#F8FEFC]/95',
      bubbleShadow: '0 10px 24px -14px rgba(43,138,130,0.55)',
      chipTextClass: 'text-[#246E68]',
      chipBgClass: 'bg-[#A9E0D8]/35',
      progressBarClass: 'bg-[#3BA89E]',
    },
    reviewStyle: {
      textClass: 'text-[#246E68]',
      bgClass: 'bg-[#A9E0D8]/25',
      borderClass: 'border-[#A9E0D8]',
      activeClass: 'bg-[#2B8A82] text-white border-[#2B8A82]',
      stripeClass: 'bg-[#2B8A82]',
    },
  },
  chem_basic_change: {
    practiceDescription: '物質量mol・溶液濃度・酸と塩基とpH・中和滴定と指示薬・酸化還元滴定・イオン化傾向と電池を共通テスト形式で演習します。',
    theme: {
      accent: '#2F6DA8',
      accentSoft: '#BBD6F2',
      surface: '#F4F8FD',
      bubbleBorderClass: 'border-[#BBD6F2]/80',
      bubbleBgClass: 'bg-[#F8FBFF]/95',
      bubbleShadow: '0 10px 24px -14px rgba(47,109,168,0.55)',
      chipTextClass: 'text-[#245685]',
      chipBgClass: 'bg-[#BBD6F2]/35',
      progressBarClass: 'bg-[#4687C4]',
    },
    reviewStyle: {
      textClass: 'text-[#245685]',
      bgClass: 'bg-[#BBD6F2]/25',
      borderClass: 'border-[#BBD6F2]',
      activeClass: 'bg-[#2F6DA8] text-white border-[#2F6DA8]',
      stripeClass: 'bg-[#2F6DA8]',
    },
  },
  chem_theory: {
    practiceDescription: '気体の状態方程式と蒸気圧・結晶格子・希薄溶液の性質・エンタルピー・反応速度・化学平衡と緩衝液・電気分解を演習します。',
    theme: {
      accent: '#B9732F',
      accentSoft: '#EFD3B4',
      surface: '#FDF8F2',
      bubbleBorderClass: 'border-[#EFD3B4]/80',
      bubbleBgClass: 'bg-[#FFFBF6]/95',
      bubbleShadow: '0 10px 24px -14px rgba(185,115,47,0.55)',
      chipTextClass: 'text-[#925820]',
      chipBgClass: 'bg-[#EFD3B4]/35',
      progressBarClass: 'bg-[#D28C46]',
    },
    reviewStyle: {
      textClass: 'text-[#925820]',
      bgClass: 'bg-[#EFD3B4]/25',
      borderClass: 'border-[#EFD3B4]',
      activeClass: 'bg-[#B9732F] text-white border-[#B9732F]',
      stripeClass: 'bg-[#B9732F]',
    },
  },
  chem_inorganic: {
    practiceDescription: '非金属元素と気体の製法・工業的製法・典型金属と両性元素・遷移元素と錯イオン・金属イオン系統分離を演習します。',
    theme: {
      accent: '#2E8555',
      accentSoft: '#B7E4C7',
      surface: '#F4FBF6',
      bubbleBorderClass: 'border-[#B7E4C7]/80',
      bubbleBgClass: 'bg-[#F8FDF9]/95',
      bubbleShadow: '0 10px 24px -14px rgba(46,133,85,0.55)',
      chipTextClass: 'text-[#236B43]',
      chipBgClass: 'bg-[#B7E4C7]/35',
      progressBarClass: 'bg-[#45A16E]',
    },
    reviewStyle: {
      textClass: 'text-[#236B43]',
      bgClass: 'bg-[#B7E4C7]/25',
      borderClass: 'border-[#B7E4C7]',
      activeClass: 'bg-[#2E8555] text-white border-[#2E8555]',
      stripeClass: 'bg-[#2E8555]',
    },
  },
  chem_organic: {
    practiceDescription: '炭化水素と異性体・アルコールとカルボニル・カルボン酸とエステルと油脂・芳香族と分離操作・構造決定を演習します。',
    theme: {
      accent: '#C2593F',
      accentSoft: '#F3C6BA',
      surface: '#FDF6F4',
      bubbleBorderClass: 'border-[#F3C6BA]/80',
      bubbleBgClass: 'bg-[#FFF9F8]/95',
      bubbleShadow: '0 10px 24px -14px rgba(194,89,63,0.55)',
      chipTextClass: 'text-[#9A432D]',
      chipBgClass: 'bg-[#F3C6BA]/35',
      progressBarClass: 'bg-[#DA7258]',
    },
    reviewStyle: {
      textClass: 'text-[#9A432D]',
      bgClass: 'bg-[#F3C6BA]/25',
      borderClass: 'border-[#F3C6BA]',
      activeClass: 'bg-[#C2593F] text-white border-[#C2593F]',
      stripeClass: 'bg-[#C2593F]',
    },
  },
  chem_polymer: {
    practiceDescription: '単糖・二糖・多糖類、アミノ酸・タンパク質・酵素、合成繊維・合成樹脂・機能性高分子・ゴムを共通テスト形式で演習します。',
    theme: {
      accent: '#6B4FA2',
      accentSoft: '#D5C7EE',
      surface: '#F8F5FC',
      bubbleBorderClass: 'border-[#D5C7EE]/80',
      bubbleBgClass: 'bg-[#FBF9FE]/95',
      bubbleShadow: '0 10px 24px -14px rgba(107,79,162,0.55)',
      chipTextClass: 'text-[#533B82]',
      chipBgClass: 'bg-[#D5C7EE]/35',
      progressBarClass: 'bg-[#8467BA]',
    },
    reviewStyle: {
      textClass: 'text-[#533B82]',
      bgClass: 'bg-[#D5C7EE]/25',
      borderClass: 'border-[#D5C7EE]',
      activeClass: 'bg-[#6B4FA2] text-white border-[#6B4FA2]',
      stripeClass: 'bg-[#6B4FA2]',
    },
  },
};

const CHEM_SUBJECTS = CHEM_COURSES.map(course => {
  const cfg = COURSE_THEMES[course.id];
  return {
    id: course.id,
    label: course.label,
    shortLabel: course.shortLabel,
    enabled: course.available,
    chapterIdPattern: new RegExp('^' + course.id + '_'),
    entry: 'chapters' as const,
    practiceDescription: cfg.practiceDescription,
    classroom: true,
    theme: { label: course.label, ...cfg.theme },
    reviewStyle: cfg.reviewStyle,
  };
});

export const SUBJECT_REGISTRY = [
  ...CHEM_SUBJECTS,
  // 非表示の互換キー（過去の型参照を壊さないために enabled: false で保持）
  {
    id: 'english_listening',
    label: '英語リスニング',
    shortLabel: 'リスニング',
    enabled: false,
    chapterIdPattern: /^el\d+(_[A-Z])?$/,
    entry: 'chapters',
    practiceDescription: '',
    classroom: false,
    theme: {
      label: '英語リスニング',
      accent: '#3E9C93',
      accentSoft: '#A9E0D8',
      surface: '#F5FCFA',
      bubbleBorderClass: 'border-[#A9E0D8]/80',
      bubbleBgClass: 'bg-[#F8FEFC]/95',
      bubbleShadow: '0 10px 24px -14px rgba(62,156,147,0.55)',
      chipTextClass: 'text-[#2F7C74]',
      chipBgClass: 'bg-[#A9E0D8]/35',
      progressBarClass: 'bg-[#5BC0BE]',
    },
    reviewStyle: {
      textClass: 'text-[#2F7C74]',
      bgClass: 'bg-[#A9E0D8]/25',
      borderClass: 'border-[#A9E0D8]',
      activeClass: 'bg-[#3E9C93] text-white border-[#3E9C93]',
      stripeClass: 'bg-[#3E9C93]',
    },
  },
  {
    id: 'english_grammar',
    label: '英文法',
    shortLabel: '英文法',
    enabled: false,
    chapterIdPattern: /^eg\d+_\d+$/,
    entry: 'chapters',
    practiceDescription: '',
    classroom: false,
    theme: {
      label: '英文法',
      accent: '#C77B3C',
      accentSoft: '#EFD3B4',
      surface: '#FDF8F2',
      bubbleBorderClass: 'border-[#EFD3B4]/80',
      bubbleBgClass: 'bg-[#FFFBF6]/95',
      bubbleShadow: '0 10px 24px -14px rgba(199,123,60,0.55)',
      chipTextClass: 'text-[#9D5C24]',
      chipBgClass: 'bg-[#EFD3B4]/35',
      progressBarClass: 'bg-[#D9975A]',
    },
    reviewStyle: {
      textClass: 'text-[#9F6230]',
      bgClass: 'bg-[#EFD3B4]/25',
      borderClass: 'border-[#EFD3B4]',
      activeClass: 'bg-[#C77B3C] text-white border-[#C77B3C]',
      stripeClass: 'bg-[#C77B3C]',
    },
  },
  {
    id: 'toeic_part5',
    label: 'TOEIC',
    shortLabel: 'TOEIC',
    enabled: false,
    chapterIdPattern: /^tp[567]_\d+$/,
    entry: 'chapters',
    classroom: false,
    practiceDescription: '',
    theme: {
      label: 'TOEIC',
      accent: '#3D5A99',
      accentSoft: '#C3CFEA',
      surface: '#F5F7FC',
      bubbleBorderClass: 'border-[#C3CFEA]/80',
      bubbleBgClass: 'bg-[#F8FAFE]/95',
      bubbleShadow: '0 10px 24px -14px rgba(61,90,153,0.55)',
      chipTextClass: 'text-[#2F4A82]',
      chipBgClass: 'bg-[#C3CFEA]/35',
      progressBarClass: 'bg-[#5B78B8]',
    },
    reviewStyle: {
      textClass: 'text-[#2F4A82]',
      bgClass: 'bg-[#C3CFEA]/25',
      borderClass: 'border-[#C3CFEA]',
      activeClass: 'bg-[#3D5A99] text-white border-[#3D5A99]',
      stripeClass: 'bg-[#3D5A99]',
    },
  },
] as const satisfies readonly SubjectDefinition[];

export type SubjectKey = (typeof SUBJECT_REGISTRY)[number]['id'];
export const SUBJECT_IDS: readonly SubjectKey[] = SUBJECT_REGISTRY.map((s) => s.id);
export const DEFAULT_SUBJECT: SubjectKey = SUBJECT_REGISTRY[0].id;

export function isSubjectKey(value: string | null | undefined): value is SubjectKey {
  return !!value && (SUBJECT_IDS as readonly string[]).includes(value);
}

export function subjectDefinitionOf(id: string | null | undefined): SubjectDefinition | undefined {
  return SUBJECT_REGISTRY.find((s) => s.id === id);
}

export function subjectOfChapterId(chapterId: string | null | undefined): SubjectKey | null {
  const id = (chapterId || '').trim();
  if (!id) return null;
  return SUBJECT_REGISTRY.find((s) => s.chapterIdPattern.test(id))?.id ?? null;
}
