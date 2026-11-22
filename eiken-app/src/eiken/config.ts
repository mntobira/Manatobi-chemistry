export const CHEM_APP_ID = 'manatobi-chemistry';
export const CHEM_STORAGE_PREFIX = 'chemistry:v1:';

// Backwards-compatible export names used across shared shell modules
export const EIKEN_APP_ID = CHEM_APP_ID;
export const EIKEN_STORAGE_PREFIX = CHEM_STORAGE_PREFIX;

export const CHEM_COURSES = [
  { id: 'chem_basic_matter', label: '化学基礎① 物質の構成と結合', shortLabel: '基礎・構成', tagline: '純物質・分離・原子構造・周期表・化学結合・分子の極性', available: true },
  { id: 'chem_basic_change', label: '化学基礎② 物質の変化', shortLabel: '基礎・変化', tagline: 'mol計算・濃度・酸塩基とpH・中和滴定・酸化還元・電池', available: true },
  { id: 'chem_theory', label: '化学① 理論化学', shortLabel: '理論化学', tagline: '気体の法則・結晶格子・希薄溶液・反応エンタルピー・化学平衡・電気分解', available: true },
  { id: 'chem_inorganic', label: '化学② 無機物質', shortLabel: '無機物質', tagline: '気体の製法・工業化学・典型金属・遷移元素と系統分離', available: true },
  { id: 'chem_organic', label: '化学③ 有機化合物', shortLabel: '有機化合物', tagline: '脂肪族・アルコール酸化・エステル・油脂・芳香族分離・構造決定', available: true },
  { id: 'chem_polymer', label: '化学④ 高分子化合物', shortLabel: '高分子', tagline: '糖類・アミノ酸と電気泳動・核酸・合成繊維・イオン交換樹脂', available: true },
] as const;

export const EIKEN_GRADES = CHEM_COURSES;
export type ChemCourseId = typeof CHEM_COURSES[number]['id'];
export type EikenGrade = ChemCourseId;

export function isChemCourse(value: unknown): value is ChemCourseId {
  return CHEM_COURSES.some(course => course.id === value);
}

export const isEikenGrade = isChemCourse;

export const LEGACY_PROJECT_IDS = ['mntb-listening', 'mntb-4ef06', 'demo-manatobi-listening', 'manatobi-eiken'];

export function validateChemistryTarget(env: Record<string, unknown>) {
  const enabled = env.VITE_CHEM_ENABLE_CLOUD === 'true' || env.VITE_EIKEN_ENABLE_CLOUD === 'true';
  const projectId = String(env.VITE_CHEM_FIREBASE_PROJECT_ID || env.VITE_EIKEN_FIREBASE_PROJECT_ID || '').trim();
  if (Object.keys(env).some(key => key.startsWith('VITE_FIREBASE_') && env[key])) {
    throw new Error('旧版のFirebase環境変数は使用できません。VITE_CHEM_FIREBASE_* に分離してください。');
  }
  if (projectId && (LEGACY_PROJECT_IDS.includes(projectId) || !/^manatobi-chem(?:istry)?(?:-[a-z0-9-]+)?$/.test(projectId))) {
    throw new Error('化学版専用の manatobi-chemistry または manatobi-chem-* プロジェクトだけが接続対象です。');
  }
  if (enabled) {
    for (const field of ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'STORAGE_BUCKET', 'MESSAGING_SENDER_ID', 'APP_ID']) {
      const val = String(env[`VITE_CHEM_FIREBASE_${field}`] || env[`VITE_EIKEN_FIREBASE_${field}`] || '').trim();
      if (!val) throw new Error(`化学版Firebaseの設定が不足しています: ${field}`);
    }
    const domain = String(env.VITE_CHEM_FIREBASE_AUTH_DOMAIN || env.VITE_EIKEN_FIREBASE_AUTH_DOMAIN);
    const bucket = String(env.VITE_CHEM_FIREBASE_STORAGE_BUCKET || env.VITE_EIKEN_FIREBASE_STORAGE_BUCKET);
    if (domain !== `${projectId}.firebaseapp.com`) {
      throw new Error('認証ドメインは化学版専用プロジェクトのものを指定してください。');
    }
    if (![`${projectId}.appspot.com`, `${projectId}.firebasestorage.app`].includes(bucket)) {
      throw new Error('Storageバケットが化学版プロジェクトと一致しません。');
    }
  }
  return { enabled, projectId };
}

export const validateEikenTarget = validateChemistryTarget;

export function chemCollection(name: string): string {
  if (!/^[a-z][a-z0-9_]*$/.test(name)) throw new Error('Invalid collection name');
  return name.startsWith('chem_') ? name : `chem_${name}`;
}

export const eikenCollection = chemCollection;
