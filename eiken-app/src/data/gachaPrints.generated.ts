// Generated for Manatobi Chemistry — clean cosmetic-focused gacha without legacy Eiken PDF prints.
export type GachaPrintCategory = '出題傾向' | '演習プリント' | '単語テスト' | '完全版';

export interface GachaPrintDef {
  id: string;
  label: string;
  subject: string;
  category: GachaPrintCategory;
  file: string;
  thumb: string;
  pages: number;
  kb: number;
  description?: string;
  variants?: readonly { label: string; file: string; pages: number; start: number; end: number }[];
}

export const GACHA_PRINTS: readonly GachaPrintDef[] = [];
