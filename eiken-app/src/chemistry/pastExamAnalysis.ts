import type { ChemCourseId } from '../eiken/config';

/**
 * =====================================================================
 * センター試験（1990〜2020）〜 大学入学共通テスト（2021〜2026）
 * 37年分の過去問徹底分析データ（独自執筆・完全著作権クリア）
 * =====================================================================
 * 目的：
 *   1. センター試験31年分＋共通テスト6年分（本試・追試）の出題構造・平均点推移・
 *      正答率30%台の「差がつく急所」を体系化。
 *   2. 満点（100/100・50/50）を阻む「センター伝統のひっかけ」と
 *      「共通テスト新傾向（探究・複数グラフ・実験誤差・複合計算）」を一覧化。
 *   3. 各急所から該当する単元演習（chapterId）へ1タップで直結させる。
 */

export interface ExamYearRecord {
  year: number;
  era: 'center' | 'kyotsu';
  examLabel: string;
  chemAvg: number;
  basicAvg?: number;
  markCount: number;
  abcRatio: string;
  headline: string;
  signatureTopics: readonly string[];
  lowAccuracyTrap: string;
}

export interface PastExamTrapEntry {
  id: string;
  no: number;
  eraTag: 'センター鉄板' | 'センター〜共テ連続' | '共テ新傾向(2021-2026)' | '正答率30%台の壁';
  course: ChemCourseId;
  chapterId: string;
  title: string;
  wrongStatementExample: string;
  instantKillRule: string;
  appearances: string;
  targetTimeSec: number;
}

export interface FullScoreTactic {
  id: string;
  stepNo: string;
  title: string;
  summary: string;
  bulletPoints: readonly string[];
}

export const EXAM_TIMELINE_RECORDS: readonly ExamYearRecord[] = [
  {
    year: 2026,
    era: 'kyotsu',
    examLabel: '2026年度 共通テスト（新課程2年目）',
    chemAvg: 56.86,
    basicAvg: 29.8,
    markCount: 33,
    abcRatio: 'A(知識)14 : B(典型)17 : C(新出)2',
    headline: '前年比+11.52点回復するも、正答率30%台の「原理理解5問」で9割〜満点層が鮮明に分かれた年',
    signatureTopics: [
      '第1問：六方最密断面図・アルコールロケット燃焼圧力(249mL=8.3×30の親切設計)',
      '第2問：AgNO₃/Pb(NO₃)₂電解・N₂O₅一次反応・NH₃:HCl=2:1緩衝液成立条件(正答率37.3%)',
      '第3問：硫酸塩水和物の加熱式量決定・H₂S×Ksp境界条件・系統分離の逆推論パズル(正答率33.4%)',
      '第4問：C₄H₈アルケン異性体とシス-トランス・トレハロース/アミロース・グルタチオン(S-S/pH)',
      '第5問：CrO₄²⁻⇄Cr₂O₇²⁻液性・光ファイバー(高純度SiO₂ガラス)・ポリイミド・エステル化平衡定数K(水を含む! 正答率30.1%)',
    ],
    lowAccuracyTrap: 'エステル化平衡定数 K = [エステル][H₂O]/([酸][アルコール]) で生成した水を分母分子から抜いて K=1.5 を選ぶ罠（正答率30.1%）＆ NH₃+HCl 2:1 部分中和による緩衝液判定（37.3%）',
  },
  {
    year: 2025,
    era: 'kyotsu',
    examLabel: '2025年度 共通テスト（新課程初年度・過去最低平均点）',
    chemAvg: 45.34,
    basicAvg: 27.0,
    markCount: 33,
    abcRatio: 'A(知識)11 : B(典型)16 : C(新出・長文)6',
    headline: '共通テスト史上最難（45.34点）。長文リード（枕草子・臭生水）の不要情報切り捨て力と新課程ΔH・熱重量曲線が勝負を決めた年',
    signatureTopics: [
      '第1問：蛍石型単位格子(追試)・気液平衡ピストン引き上げP-V曲線(2V₀で0.5P₀か0.75P₀か)・冷却曲線の氷析出増分',
      '第2問：反応エンタルピーΔHとボルン・ハーバー/ヘス経路・過不足滴定と二段滴定グラフ',
      '第3問：水ガラス→酸添加→ケイ酸ゲル→シリカゲル工程・鉄シアノ錯体呈色・複塩ミョウバン熱重量減少曲線',
      '第4問：原油分留・環状化合物の開環と不斉炭素・医薬品/染料(インジゴ還元建て染め・アゾ染料)',
      '第5問：イオン交換膜法による海水濃縮・光化学/分光または高分子複合問題',
    ],
    lowAccuracyTrap: '水ガラスを酸処理せずそのまま加熱乾燥してシリカゲルになると誤認する罠、および気液平衡グラフで V>V₀ の双曲線(0.5P₀)と直線(0.75P₀)を目盛り計算せずに雰囲気で選ぶ罠',
  },
  {
    year: 2024,
    era: 'kyotsu',
    examLabel: '2024年度 共通テスト',
    chemAvg: 54.77,
    basicAvg: 27.31,
    markCount: 31,
    abcRatio: 'A(知識)12 : B(典型)15 : C(探究)4',
    headline: '第5問に「質量分析法(MS)と同位体ピーク比」が本格登場！単位換算(cm³→L)とオストワルト希釈律グラフで差がついた良問回',
    signatureTopics: [
      '第1問：配位結合イオン識別(HCOO⁻除外)・液体→気体の体積膨張倍率(cm³とL換算)・水の状態図と氷の融解残存体積',
      '第2問：吸熱溶解エネルギー図・電池1kgあたり電気量比較(空気亜鉛>Li>アルカリ)・弱酸滴定途中のKa算出(2.7×10⁻⁵)',
      '第3問：Na保存液(エタノール不可)・アスタチン族内推定・NiSとCuCl₂循環製錬の電子収支 n(Ni)=n(Cl₂)-n(H₂)',
      '第4問：ワッカー法エチレン酸化・トリペプチド3種検出反応・配糖体サリシンの非還元性',
      '第5問：臭素⁷⁹Br/⁸¹Br(1:1)を含む有機物の質量スペクトルM / M+2 / M+4強度比(1:2:1)',
    ],
    lowAccuracyTrap: '弱酸滴定の当量点を超えた後に [A⁻] が減少する理由を「中和で消費されるため」とする誤文（正しくは滴下液による体積膨張＝希釈のみ！）',
  },
  {
    year: 2023,
    era: 'kyotsu',
    examLabel: '2023年度 共通テスト',
    chemAvg: 54.01,
    basicAvg: 29.42,
    markCount: 34,
    abcRatio: 'A(知識)12 : B(典型)17 : C(探究)5',
    headline: 'ランベルト・ベールの吸光度比例やリン酸の多段階電離pH分布図など、初見グラフを「端のpH・比例関係」で読み解く力が問われた回',
    signatureTopics: [
      '第1問：結晶格子とイオン半径・気体の分圧と水上置換・コロイド透析',
      '第2問：比色分析（吸光度とモル濃度・セル長の比例）・リン酸のpH別モル分率グラフ・太陽電池/二次電池',
      '第3問：気体発生装置と乾燥剤の適合・遷移元素と錯イオン・金属製錬の量的関係',
      '第4問：油脂のけん化価とヨウ素価・光学異性体・エステル加水分解とラクトン環化',
      '第5問：酵素反応速度（ミカエリス・メンテン型飽和曲線）と阻害・合成高分子の架橋構造',
    ],
    lowAccuracyTrap: '3価の酸（H₃PO₄）や塩素水（Cl₂/HClO/ClO⁻）の存在割合グラフで、交点の pH ＝ pKa を見落とすミス',
  },
  {
    year: 2022,
    era: 'kyotsu',
    examLabel: '2022年度 共通テスト（旧課程での難化回）',
    chemAvg: 47.63,
    basicAvg: 27.73,
    markCount: 33,
    abcRatio: 'A(知識)10 : B(典型)17 : C(複合計算)6',
    headline: '計算ステップ数が急増し平均47.63点へ難化。ヘンリーの法則の連立・圧平衡定数Kp・逆滴定など「手を動かす速度」が直撃した回',
    signatureTopics: [
      '第1問：結晶の充填率・混合気体と蒸気圧・ヘンリーの法則（気相残存量との連立）',
      '第2問：化学平衡（圧平衡定数Kpと全圧変化）・電離平衡・燃料電池と電気分解の直列計算',
      '第3問：ハロゲン・硫黄化合物の酸化還元・無機陽イオン分離の実験考察',
      '第4問：アルケンのオゾン分解・芳香族分離フローと異性体数え上げ',
      '第5問：合成ゴム（SBR/NBR）の共重合比計算（窒素・硫黄含有率からの逆算）',
    ],
    lowAccuracyTrap: '密閉容器内の気体溶解で「水に溶けた分だけ気相のmolが減り分圧も下がる」連立条件を見落として初期圧のままヘンリー計算する罠',
  },
  {
    year: 2021,
    era: 'kyotsu',
    examLabel: '2021年度 共通テスト（第1回本試験）',
    chemAvg: 57.59,
    basicAvg: 24.65,
    markCount: 33,
    abcRatio: 'A(知識)13 : B(典型)16 : C(探究)4',
    headline: 'センター試験から共通テストへの転換初年度。実在気体のZグラフ・実験仮説検証会話・イオン交換樹脂など思考型フォーマットが確立',
    signatureTopics: [
      '第1問：実在気体の圧縮率因子 Z = PV/(nRT) の温度・分子種比較・固体結晶構造',
      '第2問：発光・吸熱反応とエネルギー図・反応速度と平衡移動のグラフ選択',
      '第3問：金属単体と酸の反応・アンモニアソーダ法（ソルベー法）と熱分解',
      '第4問：フェノール類・サリチル酸誘導体の呈色と炭酸水素ナトリウム発泡識別',
      '第5問：糖類の鎖状構造（アルデヒド基と還元性）・高分子の機能性材料',
    ],
    lowAccuracyTrap: '化学基礎第1回（平均24.65/50点）で実験会話文の前提条件（定容か定圧か、何を一定にした比較実験か）を読み飛ばす失点',
  },
  {
    year: 2020,
    era: 'center',
    examLabel: '2020年度 センター試験（最終回・全34マーク）',
    chemAvg: 54.79,
    basicAvg: 28.2,
    markCount: 34,
    abcRatio: 'A(知識)16 : B(典型)16 : C(応用)2',
    headline: '31年続いたセンター化学の集大成！状態図・水上置換の液柱差・Fe₃O₄熱量測定・指示薬Ka変色域・Ni水素電池Ah換算など黄金典型が凝縮',
    signatureTopics: [
      '第1問：ハロゲン酸化力 vs イオン還元力・水の状態図・等モル混合気体密度 d=15P/RT・水上置換の水銀柱差(760-532mmHg)・浸透圧分子量・ゾルとゲル',
      '第2問：Fe酸化物の組成(Fe₃O₄)と生成熱測定グラフ・ヘスの法則・反応速度次数(2²×2=8倍)・温度/触媒の平衡到達曲線・指示薬Kaと滴定曲線重ね合わせ',
      '第3問：ニクロム線抵抗・MnO₂は触媒(還元剤ではない!)・Ag⁺/Pb²⁺塩化物と過剰NH₃系統分離・Ca(OH)₂は難溶でも強塩基!・Ni水素電池Ah容量',
      '第4問：シクロアルカン一般式・元素分析(H₂O→2H)・酸性強弱(安息香酸>フェノール>ベンジルアルコール)・不斉炭素・エステル合成',
      '第5〜7問：高分子原料・アミノ酸等電点・合成高分子/天然高分子の選択問題',
    ],
    lowAccuracyTrap: '「水酸化カルシウム Ca(OH)₂ は水に溶けにくいので弱塩基である」というセンター30年伝統の最大級ひっかけ誤文！（溶けた分は完全電離する強塩基！）',
  },
  {
    year: 2015,
    era: 'center',
    examLabel: '1990〜2019年度 センター試験 黄金30年アーカイブ総括',
    chemAvg: 58.4,
    basicAvg: 30.5,
    markCount: 34,
    abcRatio: 'A(知識・正誤)18 : B(典型計算)15 : C(工夫)1',
    headline: '現在の共通テストのA問題・B問題（計31/33マーク＝94%）の母体！正誤問題の「決定的な大間違い」パターンはすべてこの30年で完成された',
    signatureTopics: [
      '理論鉄板：同素体「SCOP(硫黄・炭素・酸素・リン)」・イオン化エネルギーと電子親和力の族/周期逆転・ボイルシャルルと蒸気圧凝縮・結晶格子充填率・中和滴定の器具共洗い("コメビツ")',
      '熱・速度・平衡鉄板：黒鉛の昇華熱忘れ・定温定容への希ガスAr注入（平衡移動なし!）・N₂O₄⇄2NO₂圧縮時の色の濃さ（「元の色よりは濃い赤褐色」!）・塩の加水分解と緩衝液',
      '無機鉄板：気体の乾燥剤不適ペア（NH₃+濃硫酸、H₂S+濃硫酸、酸性気体+ソーダ石灰）・不動態「鉄骨にアルミ(Fe,Co,Ni,Al,Cr)」・AgFのみ水溶性・さらし粉と塩素発生',
      '有機・高分子鉄板：C₄H₁₀O(アルコール4種[不斉1]+エーテル3種=計7種)・芳香族C₇H₈O(クレゾール3+ベンジルアルコール+アニソール=計5種)・ヨードホルム反応条件・銀鏡反応2mol Ag析出・ナイロン66/PET縮合水分子量引き算',
    ],
    lowAccuracyTrap: 'N₂O₄ ⇄ 2NO₂ の定温体積半減で「平衡が左へ移動するから圧縮前より色が薄くなる」と誤認する罠（体積半減で一旦2倍濃くなり、少し戻るが圧縮前よりは必ず濃い！）',
  },
];

export const CENTER_KYOTSU_TRAPS: readonly PastExamTrapEntry[] = [
  {
    id: 'trap_01',
    no: 1,
    eraTag: 'センター〜共テ連続',
    course: 'chem_basic_matter',
    chapterId: 'chem_basic_matter_ch01',
    title: '同素体「SCOP」と化合物（ドライアイス・氷・石英）の混同',
    wrongStatementExample: '× 一酸化炭素 CO と二酸化炭素 CO₂ は互いに炭素の同素体である。／ × 赤リンは空気中で自然発火するため水中に保存する（2026本試 第3問）。',
    instantKillRule: '同素体は「単体どうし（S・C・O・P のみ）」！化合物は即除外。自然発火して水中保存するのは猛毒の「黄リン P₄」であり赤リンではない！',
    appearances: '1994, 2001, 2009, 2016, 2021, 2026本試',
    targetTimeSec: 15,
  },
  {
    id: 'trap_02',
    no: 2,
    eraTag: 'センター〜共テ連続',
    course: 'chem_basic_matter',
    chapterId: 'chem_basic_matter_ch04',
    title: '質量数と原子番号・イオンの電子数の加減算トラップ',
    wrongStatementExample: '× ⁶⁴₃₀Zn²⁺ に含まれる電子の数は 64 − 2 = 62個である（2026追試 化学基礎 第1問）。',
    instantKillRule: '電子数は左上の質量数（陽子＋中性子）とは無関係！「原子番号 Z − イオン価数」（陽イオンは引き、陰イオンは足す：30 − 2 = 28個）！',
    appearances: '1997, 2005, 2014, 2018, 2023, 2026追試',
    targetTimeSec: 15,
  },
  {
    id: 'trap_03',
    no: 3,
    eraTag: '共テ新傾向(2021-2026)',
    course: 'chem_basic_matter',
    chapterId: 'chem_basic_matter_ch09',
    title: '配位結合を含むイオンの識別（HCOO⁻・NO₃⁻ vs NH₄⁺・H₃O⁺）',
    wrongStatementExample: '× ギ酸イオン HCOO⁻ はギ酸分子に H⁺ が配位結合して生じたイオンである（2024本試 第1問）。',
    instantKillRule: '「非共有電子対をもつ分子（NH₃, H₂O）＋ 空軌道をもつ陽イオン（H⁺, Ag⁺, Cu²⁺）」の合体が配位結合！H⁺ を放出して残った陰イオン（HCOO⁻, CH₃COO⁻）は違う！',
    appearances: '2012, 2017, 2024本試',
    targetTimeSec: 20,
  },
  {
    id: 'trap_04',
    no: 4,
    eraTag: 'センター鉄板',
    course: 'chem_basic_change',
    chapterId: 'chem_basic_change_ch07',
    title: '溶解度と強弱の混同（Ca(OH)₂は難溶でも強塩基！）',
    wrongStatementExample: '× 水酸化カルシウム Ca(OH)₂ は水に対する溶解度が小さいため、弱塩基に分類される（2020センター最終回 第3問）。',
    instantKillRule: '酸・塩基の強弱は「溶けやすさ」ではなく「溶けた分の電離度 α」！アルカリ金属・アルカリ土類金属（Be,Mg除く Ca, Sr, Ba）の水酸化物はすべて強塩基！',
    appearances: '1998, 2007, 2015, 2020本試',
    targetTimeSec: 15,
  },
  {
    id: 'trap_05',
    no: 5,
    eraTag: 'センター〜共テ連続',
    course: 'chem_basic_change',
    chapterId: 'chem_basic_change_ch09',
    title: '中和滴定4大ガラス器具の「水洗い vs 共洗い」と濃硫酸希釈の定容罠',
    wrongStatementExample: '× コニカルビーカーを試料溶液で共洗いした。／ × 純水 1000 mL に濃硫酸 50 mL を加えて 1000 mL の希硫酸を調製した（2026追試）。',
    instantKillRule: '語呂「コメ（コニカル・メスフラスコ）は純水洗い、ビツ（ビュレット・ホールピペット）は共洗い」！定容は「半量の純水に濃硫酸を少しずつ注ぎ、冷ましてから標線まで水を追加して 1000 mL に合わせる」！',
    appearances: '1995, 2004, 2011, 2019, 2022, 2024, 2026追試',
    targetTimeSec: 20,
  },
  {
    id: 'trap_06',
    no: 6,
    eraTag: 'センター〜共テ連続',
    course: 'chem_basic_change',
    chapterId: 'chem_basic_change_ch12',
    title: '過酸化水素 H₂O₂ の酸化数と二酸化マンガン MnO₂ の役割（触媒 vs 酸化還元）',
    wrongStatementExample: '× 過酸化水素 H₂O₂ 中の水素原子の酸化数は −1 である（2026本試 第3問）。／ × H₂O₂ 分解に加える MnO₂ は還元剤として働く（2020本試）。',
    instantKillRule: 'H₂O₂ で例外なのは酸素の方（O = −1、H は通常の +1；H = −1 は NaH などの金属水素化物のみ）！また H₂O₂ 自己酸化還元分解の MnO₂ は消費されない「触媒」！',
    appearances: '2003, 2013, 2020本試, 2026本試',
    targetTimeSec: 15,
  },
  {
    id: 'trap_07',
    no: 7,
    eraTag: 'センター〜共テ連続',
    course: 'chem_basic_change',
    chapterId: 'chem_basic_change_ch15',
    title: 'ダニエル電池の「電子の向き」と「電流の向き」逆転ひっかけ',
    wrongStatementExample: '× ダニエル電池では負極の亜鉛板から正極の銅板の向きへ導線を伝わって電流が流れる（2026追試 第1問）。',
    instantKillRule: '負極（Zn）から正極（Cu）へ流れるのは「電子 e⁻」！「電流」の定義は電子と真逆の「正極（Cu）→ 負極（Zn）」！主語に丸をつけてからマークせよ！',
    appearances: '1996, 2008, 2016, 2021, 2026追試',
    targetTimeSec: 15,
  },
  {
    id: 'trap_08',
    no: 8,
    eraTag: '共テ新傾向(2021-2026)',
    course: 'chem_theory',
    chapterId: 'chem_theory_ch03',
    title: '気液平衡ピストン操作の P-V グラフ選別（水平プラトー＋双曲線の格子点検算）',
    wrongStatementExample: '× 体積 V₀ で全量気化した後、2V₀ での圧力が 0.75P₀ を通る直線グラフを選んでしまう（2025追試 第1問）。',
    instantKillRule: '① 液体共存中（V ≦ V₀）は P = P₀ 水平直線、② 全量気化後（V ＞ V₀）は PV = P₀V₀ のボイル双曲線なので「V = 2V₀ で必ず P = 0.50P₀」を通る格子点を指差し確認！また気液平衡・溶解平衡で「蒸発や溶解が停止している」は100%誤り（2026本試）！',
    appearances: '2006, 2015, 2020, 2025追試, 2026本試',
    targetTimeSec: 30,
  },
  {
    id: 'trap_09',
    no: 9,
    eraTag: 'センター鉄板',
    course: 'chem_theory',
    chapterId: 'chem_theory_ch07',
    title: 'ヘンリーの法則の縦軸トラップ（「標準状態の体積」vs「その圧力下での体積」）',
    wrongStatementExample: '× 一定温度で気体の圧力を3倍にすると、一定量の水に溶けた気体をその圧力（3P）のもとで測った体積も3倍になる。',
    instantKillRule: '圧力が3倍になると溶ける物質量 n（および標準状態換算体積）は3倍になるが、ボイルの法則 V = (3n)RT/(3P) により3が約分されるため「その圧力下で測った体積」は一定（水平直線）！',
    appearances: '1999, 2008, 2014, 2019, 2022本試',
    targetTimeSec: 25,
  },
  {
    id: 'trap_10',
    no: 10,
    eraTag: '共テ新傾向(2021-2026)',
    course: 'chem_theory',
    chapterId: 'chem_theory_ch08',
    title: '冷却曲線の共存領域における「氷の析出増分」逆算（2025追試・2024本試）',
    wrongStatementExample: '× 水 1.00 kg に溶質 0.100 mol を溶かし −0.370 ℃（ΔTf=0.370 K）にあるとき、液相の水はまだ 1.00 kg 残っているとして計算する。',
    instantKillRule: '氷が析出すると溶媒の水が減って濃縮される！ΔTf = Kf × (n_溶質 / W_残存水[kg]) から「その温度で液相に残っている水の質量 W」を直接逆算し、初期水量との差を氷の質量とする！',
    appearances: '2013, 2021, 2024本試, 2025追試',
    targetTimeSec: 45,
  },
  {
    id: 'trap_11',
    no: 11,
    eraTag: 'センター〜共テ連続',
    course: 'chem_theory',
    chapterId: 'chem_theory_ch12',
    title: 'ルシャトリエ2大罠：①定温定容のAr添加 ②N₂O₄⇄2NO₂圧縮後の赤褐色の濃さ',
    wrongStatementExample: '× 定温・定容容器に Ar を加えて全圧を上げると N₂+3H₂⇄2NH₃ は右へ移動する。／ × N₂O₄⇄2NO₂ を定温で体積1/2に圧縮すると平衡が左へ移動するため圧縮前より色が薄くなる。',
    instantKillRule: '① 定温・定容の希ガス添加は各成分の分圧・濃度が不変なので「平衡移動なし」（定温・定圧なら体積膨張で分子数増側へ移動）！② 体積1/2圧縮直後に [NO₂] は2倍になり、少し左へ戻るが「圧縮前よりは必ず濃い」！',
    appearances: '1993, 2002, 2010, 2017, 2022, 2024本試',
    targetTimeSec: 25,
  },
  {
    id: 'trap_12',
    no: 12,
    eraTag: '正答率30%台の壁',
    course: 'chem_theory',
    chapterId: 'chem_theory_ch13',
    title: '部分中和による緩衝液の成立条件（NH₃ : HCl = 2 : 1 vs 1 : 1）',
    wrongStatementExample: '× 0.10 mol/L アンモニア水と 0.10 mol/L 塩酸を体積比 1 : 1 で混合した液は緩衝作用を示す（2026本試 第2問 問4c：正答率37.3%）。',
    instantKillRule: '1 : 1 混合は完全中和して「NH₄Cl 単独水溶液（塩の加水分解で弱酸性）」になり緩衝液ではない！弱塩基 : 強酸 ＝「2 : 1」で混合したとき半分だけ中和され「NH₃ と NH₄⁺ が 1 : 1 共存」して最強の緩衝液になる！',
    appearances: '2011, 2018, 2024本試, 2026本試',
    targetTimeSec: 30,
  },
  {
    id: 'trap_13',
    no: 13,
    eraTag: 'センター〜共テ連続',
    course: 'chem_theory',
    chapterId: 'chem_theory_ch15',
    title: '鉛蓄電池放電後の電解液濃度（分母の質量が −80g/mol(e⁻) 減る！）とAl融解塩電解の陽極消耗',
    wrongStatementExample: '× 鉛蓄電池で電子 1 mol 放電後、電解液 500 g の分母を 500 g のままにして H₂SO₄ 濃度を出す。／ × ホール・エルー法の陽極炭素からは O₂ のみが発生し電極は消耗しない。',
    instantKillRule: '鉛蓄電池は電子 2 mol で 2H₂SO₄(−196g) 消費＋ 2H₂O(+36g) 生成＝電解液が「160 g（1e⁻あたり80 g）減少」する！Al融解塩電解の陽極炭素 C は O²⁻ と反応して CO / CO₂ になり激しく消耗する（2025追試では CO/CO₂ 連立出題）！',
    appearances: '1997, 2005, 2014, 2020, 2025追試',
    targetTimeSec: 40,
  },
  {
    id: 'trap_14',
    no: 14,
    eraTag: '正答率30%台の壁',
    course: 'chem_inorganic',
    chapterId: 'chem_inorganic_ch06',
    title: 'ケイ素単体 Si vs 二酸化ケイ素 SiO₂・水ガラス→シリカゲル工程（2025・2026連続出題！）',
    wrongStatementExample: '× 光ファイバーの主材料には高純度の単体ケイ素 Si が用いられる（2026本試 第5問：正答率37.8%）。／ × 水ガラスをそのまま加熱乾燥するとシリカゲルが得られる（2025本試）。',
    instantKillRule: '太陽電池・半導体集積回路＝「高純度単体 Si」、光ファイバー＝「高純度石英ガラス（SiO₂）」！シリカゲルは水ガラス（Na₂SiO₃aq）に必ず「塩酸などの酸を加えてケイ酸 H₂SiO₃ を遊離させてから」脱水乾燥する！',
    appearances: '2009, 2016, 2025本試, 2026本試',
    targetTimeSec: 20,
  },
  {
    id: 'trap_15',
    no: 15,
    eraTag: '正答率30%台の壁',
    course: 'chem_inorganic',
    chapterId: 'chem_inorganic_ch15',
    title: 'ハロゲン化銀の例外（AgFのみ水溶性！）と金属陽イオン系統分離の逆推論（2025追試・2026本試）',
    wrongStatementExample: '× AgF, AgCl, AgBr, AgI はいずれも水に難溶である（2025追試 第2問）。／ × 過剰 NH₃ 水で溶ける水酸化物を Al³⁺ と誤認する。',
    instantKillRule: 'ハロゲン化銀で「AgF だけは水に極めてよく溶ける（HF だけが弱酸であるのとセット暗記）」！過剰 NaOH に溶ける＝「あぜん・すん・なまり（Al, Zn, Sn, Pb）」、過剰 NH₃ に溶ける＝「銀・銅・亜鉛（Ag, Cu, Zn；Ni）」！両方溶けるのは Zn²⁺ のみ！',
    appearances: '毎年必出（1990〜2026 全37年で30回以上出題！2026本試 問5b 正答率33.4%）',
    targetTimeSec: 45,
  },
  {
    id: 'trap_16',
    no: 16,
    eraTag: '正答率30%台の壁',
    course: 'chem_organic',
    chapterId: 'chem_organic_ch07',
    title: 'エステル化平衡定数 K における「水 H₂O の濃度算入」（2026本試 正答率30.1% 最低正答率！）',
    wrongStatementExample: '× 均一有機液相のエステル化 RCOOH + R\'OH ⇄ RCOOR\' + H₂O で、希薄水溶液の電離平衡と同じ感覚で [H₂O] を式から除外してしまう（2026本試 第5問 問3b）。',
    instantKillRule: '無溶媒または有機混合物中のエステル化では水は大量の溶媒ではなく「反応で1:1生成する1成分」！必ず K = ([エステル][H₂O]) / ([酸][アルコール]) と [H₂O] を分子に入れて計算する（酢酸1mol+エタノール1mol→平衡時2/3molなら K = (2/3)²/(1/3)² = 4.0）！',
    appearances: '2007, 2016, 2023, 2026本試',
    targetTimeSec: 40,
  },
  {
    id: 'trap_17',
    no: 17,
    eraTag: 'センター〜共テ連続',
    course: 'chem_organic',
    chapterId: 'chem_organic_ch11',
    title: '芳香族の分離フロー（NaHCO₃ vs NaOH）とサリチル酸2大誘導体',
    wrongStatementExample: '× フェノールは炭酸水素ナトリウム NaHCO₃ 水溶液と反応して CO₂ を発生して水層へ溶ける。',
    instantKillRule: '酸の強さ序列「スルホン酸・HCl ＞ カルボン酸（−COOH）＞ 炭酸 H₂CO₃ ＞ フェノール（−OH）＞ 第2段階炭酸 HCO₃⁻」！だから NaHCO₃ に溶けて発泡するのは −COOH だけ（フェノールは溶けない）！',
    appearances: '1992, 2000, 2008, 2015, 2020, 2021, 2024, 2026本試',
    targetTimeSec: 20,
  },
  {
    id: 'trap_18',
    no: 18,
    eraTag: '共テ新傾向(2021-2026)',
    course: 'chem_polymer',
    chapterId: 'chem_polymer_ch02',
    title: '非還元糖（スクロース・トレハロース・配糖体サリシン）と多糖構造・グルタチオンペプチド',
    wrongStatementExample: '× マルトースもトレハロースも二糖類なのでともに銀鏡反応（還元性）を示す。／ × アミロースは冷水に非常に溶けやすい直鎖分子である。',
    instantKillRule: '還元性がない二糖は「スクロース（ショ糖）とトレハロース」の2トップ（アノマー −OH どうしが結合して開環できない；配糖体サリシンも非還元性）！またグルタチオン（Glu-Cys-Gly）は γ-カルボキシ基でペプチド結合し、−SH 2分子が酸化されて −S−S− 結合をつくる！',
    appearances: '2010, 2018, 2021, 2024本試, 2026本試',
    targetTimeSec: 25,
  },
  {
    id: 'trap_19',
    no: 19,
    eraTag: 'センター鉄板',
    course: 'chem_basic_matter',
    chapterId: 'chem_basic_matter_ch24',
    title: '同素体（SCOP単体のみ）vs 同位体・フラーレン C₆₀ の結晶分類と共有結合 90 本',
    wrongStatementExample: '× 一酸化炭素 CO と二酸化炭素 CO₂ は互いに同素体である。／ × フラーレン C₆₀ はダイヤモンドと同じ共有結合の結晶であり、1分子中に 60 本の結合をもつ。',
    instantKillRule: '同素体は「S・C・O・P の単体同士」のみ（CO と CO₂ は化合物、¹²C と ¹⁴C は同位体）！フラーレン C₆₀ は球状分子が分子間力で集まった「分子結晶」であり、各炭素から3本手が出るため辺（結合）の総数は 60×3÷2 ＝ 90 本（単60＋二重30）！',
    appearances: '1995, 2003, 2012, 2019, 2022, 2025本試',
    targetTimeSec: 20,
  },
  {
    id: 'trap_20',
    no: 20,
    eraTag: 'センター〜共テ連続',
    course: 'chem_basic_change',
    chapterId: 'chem_basic_change_ch27',
    title: 'Ba(OH)₂＋H₂SO₄ 電気伝導度滴定の「ゼロ谷」とリチウムイオン二次電池の電解液・質量収支',
    wrongStatementExample: '× Ba(OH)₂ 水溶液を塩酸 HCl で滴定すると中和点で電気伝導度がほぼ 0 になる。／ × リチウムイオン二次電池の電解液には希硫酸水溶液を用いる。',
    instantKillRule: '中和点で電気伝導度がほぼ 0 まで落ちるのは「BaSO₄↓（難溶性沈殿）＋2H₂O」しか残らない Ba(OH)₂＋H₂SO₄ の組み合わせだけ（HCl 滴定では BaCl₂ が電離残存し 0 にならない）！Liイオン電池は水と反応する Li を守るため必ず「有機溶媒」を使い、放電時は負極 −7.0g/mol(e⁻)・正極 ＋7.0g/mol(e⁻) で電解液濃度不変！',
    appearances: '2001, 2013, 2019, 2023, 2024本試',
    targetTimeSec: 30,
  },
  {
    id: 'trap_21',
    no: 21,
    eraTag: '共テ新傾向(2021-2026)',
    course: 'chem_theory',
    chapterId: 'chem_theory_ch31',
    title: '簡易熱量計における冷却曲線の「混合時刻 t₀ 直線外挿」と混合後の溶液総質量 m',
    wrongStatementExample: '× 1.0 mol/L 塩酸 50 mL と 1.0 mol/L NaOHaq 50 mL の中和実験で、実測最高温度 Tmax をそのまま使い、質量 m = 50 g で q = mcΔT を計算する。',
    instantKillRule: '混合〜最高温到達中にも放熱しているため、一定速度の冷却直線を必ず「混合時刻 t₀」まで巻き戻して外挿温度 T₂* を読む！さらに混合液の総質量 m は「両液の合計 100 g（固体溶解なら水＋溶質の合計）」を使い、発熱なら ΔH に必ずマイナス符号をつける！',
    appearances: '2015, 2021, 2024, 2025本試',
    targetTimeSec: 35,
  },
  {
    id: 'trap_22',
    no: 22,
    eraTag: 'センター鉄板',
    course: 'chem_inorganic',
    chapterId: 'chem_inorganic_ch27',
    title: '塩素精製「①水→②濃硫酸」の順序・乾燥剤 2 大例外（CaCl₂×NH₃・濃H₂SO₄×H₂S）・硝酸の酸化剤比',
    wrongStatementExample: '× 発生した塩素を「濃硫酸→水」の順に通して乾燥塩素を得る。／ × アンモニアを中性の塩化カルシウムで乾燥する。／ × 3Cu+8HNO₃ で消費された 8 mol の HNO₃ すべてが酸化剤として働いた。',
    instantKillRule: 'Cl₂ 精製は必ず「①水（脱HCl）→②濃硫酸（脱H₂O）」！乾燥剤 2 大NGは「CaCl₂×NH₃（付加化合物形成）」と「濃H₂SO₄×H₂S（酸化還元反応）」！3Cu+8HNO₃ の 8 mol 中、酸化剤（+5→+2 の NO）は 2 mol（1/4）のみで残り 6 mol は塩をつくる酸！',
    appearances: '1994, 2004, 2011, 2018, 2023本試',
    targetTimeSec: 25,
  },
  {
    id: 'trap_23',
    no: 23,
    eraTag: '正答率30%台の壁',
    course: 'chem_organic',
    chapterId: 'chem_organic_ch25',
    title: 'フェノールエステル（NaOH 2 mol 消費！）と氷冷ジアゾ化・アゾカップリング（脱水ではない！）',
    wrongStatementExample: '× 酢酸フェニル 1 mol を加水分解するのに必要な NaOH は 1 mol である。／ × 塩化ベンゼンジアゾニウムとナトリウムフェノキシドから水 H₂O が脱離してアゾ化合物が生じる。',
    instantKillRule: '酢酸フェニルは加水分解で生じる酢酸と「フェノール」の両方が中和されるため NaOH を【2 mol】消費する（酢酸ベンジルはアルコールなので 1 mol）！また 0〜5℃ 氷冷のアゾカップリングで抜けるのは「NaCl（または HCl）」であり水 H₂O は一切抜けない（分子量 198）！',
    appearances: '1999, 2008, 2017, 2022, 2025本試',
    targetTimeSec: 30,
  },
  {
    id: 'trap_24',
    no: 24,
    eraTag: '共テ新傾向(2021-2026)',
    course: 'chem_polymer',
    chapterId: 'chem_polymer_ch21',
    title: '陽イオン交換樹脂の 2 価混合塩連立・ポリイミド（−2H₂O/単位）・二本鎖 DNA 水素結合数',
    wrongStatementExample: '× MgCl₂ 1 mol を H 型陽イオン交換樹脂に通すと H⁺ が 1 mol 流出する。／ × 1000 塩基対（全2000塩基、G=28%）の DNA の水素結合数を全塩基 2000 に掛けて 5120 本とする。',
    instantKillRule: '陽イオン交換樹脂は電荷等量交換なので「Na⁺→1H⁺、Mg²⁺・Cu²⁺→2H⁺、Al³⁺→3H⁺」！二本鎖 DNA（N 塩基対）の水素結合総数は「塩基個数ではなく【塩基対数】に掛ける：2N ＋ (G≡C 対数)」（1000対・G≡C 560対なら 2000＋560＝2560 本）！',
    appearances: '2014, 2020, 2024, 2025, 2026本試',
    targetTimeSec: 35,
  },
];

export const FULL_SCORE_TACTICS: readonly FullScoreTactic[] = [
  {
    id: 'tactic_1',
    stepNo: '鉄則 01',
    title: '正誤問題は「重箱の隅」ではなく「本質の大間違い」から一撃で抜く',
    summary:
      '共通テスト・センター37年分の正誤問題の9割以上は、馴染みのない題材（グルタチオン・トレハロース・アスタチン等）を隠れ蓑にして、教科書の太字レベルの「絶対不変の原理違反」を1つ混ぜている。',
    bulletPoints: [
      '「平衡状態で蒸発・凝縮（溶解・析出）が完全に停止している」→ 動的平衡の否定なので 100% 誤り！',
      '「触媒を加えると平衡定数 K や反応エンタルピー ΔH が変化する」→ 山の高さ E_a が下がるだけなので 100% 誤り！',
      '知らない物質名の選択肢は一旦保留（△）にし、知っている基本原理で断定できる大間違い（×）を先に探す。',
    ],
  },
  {
    id: 'tactic_2',
    stepNo: '鉄則 02',
    title: '60分100点満点のための「2周マーキング＆後回し3類型」タイムマネジメント',
    summary:
      '本番で90〜100点を安定させる受験生は、1周目で全問を順番に解き切ろうとしない。時間泥棒になりやすい3類型を見抜いた瞬間に「見直しフラグ」を立てて90秒以内に一旦飛ばし、残り15〜18分で無傷の頭で回収する。',
    bulletPoints: [
      '【1周目・42分】A問題（知識：1問20〜30秒）とB問題（典型計算：1問90秒）の約30マークを確実に仕留め、まず85点を確定させる。',
      '【一旦飛ばす3類型】①操作から逆推論する系統分離パズル、②構造異性体＋立体異性体の全書き出し数え上げ、③見慣れない長文実験の最終枝問（問5b等）。',
      '【2周目・18分】問題冊子の余白メモに綺麗な構造式・モル収支表を描き、残りのC問題2〜3マークを落ち着いて仕留めて100点へ到達する。',
    ],
  },
  {
    id: 'tactic_3',
    stepNo: '鉄則 03',
    title: '作問者の「親切な数値設計（約分ギミック）」と「グラフ格子点代入」を見逃さない',
    summary:
      '大学入試センターの計算問題は、電卓なしで60分以内に処理できるよう必ず綺麗な約分が仕込まれている。泥沼の筆算が始まったら立式か単位を疑え！',
    bulletPoints: [
      '気体定数 R = 8.3×10³ に対して「249 mL (= 0.30×8.3×10⁻¹ L)」「4.15 L (= 0.5×8.3)」「300 K」が出たら掛け算する前に分数で約分！',
      'ファラデー定数 F = 9.65×10⁴ C/mol に対して「193 s (= 2×96.5)」「3860 s (= 40×96.5)」「9650 s」はすべて暗算で電子 mol が出る合図！',
      '似た曲線が5〜6本並ぶグラフ選択（気液平衡・熱重量減少・電離度・平衡到達）は、雰囲気で選ばず「x = 2V₀ や pH 端での数値」を1点計算して目盛り交点で即断する！',
    ],
  },
];
