/**
 * 共通テスト対策用のオリジナル実験図・グラフ（純粋なインライン SVG data URI）。
 * 外部ライセンス画像を一切使わず、スマホ・PCの両方で高精細に表示される。
 */

function svgDataUri(svg: string): string {
  const clean = svg.replace(/\s*\n\s*/g, ' ').trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(clean)}`;
}

/** 混合物の加熱曲線 vs 純物質の加熱曲線 */
export const FIG_HEATING_CURVE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 250" font-family="sans-serif">
  <rect width="460" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">純物質Aと液体混合物Bの加熱曲線</text>
  <line x1="60" y1="210" x2="425" y2="210" stroke="#475569" stroke-width="2"/>
  <line x1="60" y1="210" x2="60" y2="38" stroke="#475569" stroke-width="2"/>
  <text x="242" y="238" text-anchor="middle" font-size="12" fill="#475569">加熱時間 t</text>
  <text x="22" y="128" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 128)">温度 [℃]</text>
  <line x1="60" y1="90" x2="415" y2="90" stroke="#CBD5E1" stroke-dasharray="4 4"/>
  <text x="52" y="94" text-anchor="end" font-size="11" fill="#475569">100</text>
  <line x1="60" y1="130" x2="415" y2="130" stroke="#CBD5E1" stroke-dasharray="4 4"/>
  <text x="52" y="134" text-anchor="end" font-size="11" fill="#475569">78</text>
  <polyline points="60,192 175,90 365,90 410,56" fill="none" stroke="#2B8A82" stroke-width="3"/>
  <text x="270" y="82" font-size="12" font-weight="bold" fill="#2B8A82">曲線ア（一定温度で沸騰）</text>
  <polyline points="60,192 145,126 335,96 410,68" fill="none" stroke="#C2593F" stroke-width="3" stroke-dasharray="7 4"/>
  <text x="248" y="132" font-size="12" font-weight="bold" fill="#C2593F">曲線イ（沸騰中も温度上昇）</text>
</svg>
`);

/** 第1イオン化エネルギーの周期変化 */
export const FIG_IONIZATION_ENERGY = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 250" font-family="sans-serif">
  <rect width="480" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="240" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">原子番号 1〜20 の第1イオン化エネルギーの推移</text>
  <line x1="58" y1="212" x2="452" y2="212" stroke="#475569" stroke-width="2"/>
  <line x1="58" y1="212" x2="58" y2="38" stroke="#475569" stroke-width="2"/>
  <text x="255" y="240" text-anchor="middle" font-size="12" fill="#475569">原子番号 Z</text>
  <text x="20" y="128" text-anchor="middle" font-size="11" fill="#475569" transform="rotate(-90 20 128)">第1イオン化エネルギー [kJ/mol]</text>
  <polyline points="75,126 94,48 113,174 132,146 151,154 170,134 189,112 208,122 227,92 246,66 265,177 284,158 303,168 322,152 341,138 360,142 379,118 398,96 417,183 436,166" fill="none" stroke="#2F6DA8" stroke-width="2.5"/>
  <circle cx="94" cy="48" r="4.5" fill="#C2593F"/><text x="98" y="45" font-size="11" font-weight="bold" fill="#C2593F">He</text>
  <circle cx="246" cy="66" r="4.5" fill="#C2593F"/><text x="250" y="63" font-size="11" font-weight="bold" fill="#C2593F">Ne</text>
  <circle cx="398" cy="96" r="4.5" fill="#C2593F"/><text x="402" y="92" font-size="11" font-weight="bold" fill="#C2593F">Ar</text>
  <circle cx="113" cy="174" r="4.5" fill="#2B8A82"/><text x="112" y="192" font-size="11" font-weight="bold" fill="#2B8A82">Li</text>
  <circle cx="265" cy="177" r="4.5" fill="#2B8A82"/><text x="262" y="195" font-size="11" font-weight="bold" fill="#2B8A82">Na</text>
  <circle cx="417" cy="183" r="4.5" fill="#2B8A82"/><text x="414" y="201" font-size="11" font-weight="bold" fill="#2B8A82">K</text>
</svg>
`);

/** 中和滴定曲線（弱酸＋強塩基 vs 強酸＋強塩基） */
export const FIG_TITRATION_CURVE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 265" font-family="sans-serif">
  <rect width="470" height="265" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">0.10 mol/L の酸 10 mL に 0.10 mol/L NaOH を滴下した滴定曲線</text>
  <rect x="64" y="74" width="376" height="22" fill="#FCE7F3" opacity="0.8"/>
  <text x="434" y="88" text-anchor="end" font-size="10.5" fill="#9D174D">フェノールフタレイン変色域 (8.0〜9.8)</text>
  <rect x="64" y="162" width="376" height="20" fill="#FEF3C7" opacity="0.85"/>
  <text x="434" y="176" text-anchor="end" font-size="10.5" fill="#92400E">メチルオレンジ変色域 (3.1〜4.4)</text>
  <line x1="64" y1="226" x2="442" y2="226" stroke="#475569" stroke-width="2"/>
  <line x1="64" y1="226" x2="64" y2="38" stroke="#475569" stroke-width="2"/>
  <line x1="64" y1="132" x2="440" y2="132" stroke="#94A3B8" stroke-dasharray="4 4"/>
  <text x="56" y="136" text-anchor="end" font-size="11" fill="#475569">7</text>
  <text x="56" y="64" text-anchor="end" font-size="11" fill="#475569">12</text>
  <text x="56" y="204" text-anchor="end" font-size="11" fill="#475569">2</text>
  <text x="252" y="254" text-anchor="middle" font-size="12" fill="#475569">NaOH 水溶液の滴下量 [mL]</text>
  <text x="24" y="132" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 24 132)">pH</text>
  <line x1="252" y1="226" x2="252" y2="44" stroke="#CBD5E1" stroke-dasharray="3 3"/>
  <text x="252" y="240" text-anchor="middle" font-size="11" fill="#475569">10</text>
  <path d="M 64 176 Q 160 156 244 144 L 252 94 L 260 66 Q 320 56 425 54" fill="none" stroke="#C2593F" stroke-width="2.8"/>
  <text x="135" y="148" font-size="11.5" font-weight="bold" fill="#C2593F">曲線X（CH₃COOH）</text>
  <path d="M 64 208 Q 180 205 246 194 L 252 132 L 258 66 Q 320 56 425 54" fill="none" stroke="#2F6DA8" stroke-width="2.5" stroke-dasharray="6 4"/>
  <text x="138" y="220" font-size="11.5" font-weight="bold" fill="#2F6DA8">曲線Y（HCl）</text>
  <circle cx="252" cy="94" r="4.5" fill="#C2593F"/>
</svg>
`);

/** ダニエル電池の模式図 */
export const FIG_DANIELL_CELL = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 250" font-family="sans-serif">
  <rect width="460" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">ダニエル電池の装置図（(-) Zn | ZnSO₄aq | CuSO₄aq | Cu (+)）</text>
  <line x1="130" y1="74" x2="130" y2="46" stroke="#334155" stroke-width="2.5"/>
  <line x1="330" y1="74" x2="330" y2="46" stroke="#334155" stroke-width="2.5"/>
  <line x1="130" y1="46" x2="205" y2="46" stroke="#334155" stroke-width="2.5"/>
  <line x1="255" y1="46" x2="330" y2="46" stroke="#334155" stroke-width="2.5"/>
  <circle cx="230" cy="46" r="18" fill="#FEF9C3" stroke="#CA8A04" stroke-width="2"/>
  <text x="230" y="51" text-anchor="middle" font-size="12" font-weight="bold" fill="#854D0E">e⁻ →</text>
  <rect x="78" y="92" width="304" height="126" rx="6" fill="#EFF6FF" stroke="#475569" stroke-width="2"/>
  <rect x="230" y="92" width="152" height="126" fill="#DBEAFE" opacity="0.85"/>
  <line x1="230" y1="92" x2="230" y2="218" stroke="#64748B" stroke-width="4" stroke-dasharray="6 4"/>
  <text x="230" y="235" text-anchor="middle" font-size="11" fill="#475569">素焼き板（半透膜）</text>
  <rect x="116" y="74" width="28" height="118" fill="#94A3B8" stroke="#334155" stroke-width="2"/>
  <text x="130" y="136" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">Zn</text>
  <rect x="316" y="74" width="28" height="118" fill="#D97706" stroke="#78350F" stroke-width="2"/>
  <text x="330" y="136" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">Cu</text>
  <text x="145" y="208" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#1E3A8A">ZnSO₄ 水溶液</text>
  <text x="310" y="208" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#1E40AF">CuSO₄ 水溶液</text>
  <text x="178" y="156" font-size="11" fill="#0F766E">Zn → Zn²⁺ + 2e⁻</text>
  <text x="245" y="156" font-size="11" fill="#B45309">Cu²⁺ + 2e⁻ → Cu</text>
</svg>
`);

/** 化学平衡（ハーバー・ボッシュ法：圧力・温度とアンモニア収率） */
export const FIG_HABER_EQUILIBRIUM = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">N₂ + 3H₂ ⇄ 2NH₃（発熱反応）における平衡時の NH₃ 体積百分率</text>
  <line x1="64" y1="212" x2="435" y2="212" stroke="#475569" stroke-width="2"/>
  <line x1="64" y1="212" x2="64" y2="38" stroke="#475569" stroke-width="2"/>
  <text x="248" y="240" text-anchor="middle" font-size="12" fill="#475569">全圧 P [×10⁷ Pa]</text>
  <text x="22" y="125" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 125)">NH₃ の割合 [%]</text>
  <path d="M 64 206 Q 180 120 415 58" fill="none" stroke="#2B8A82" stroke-width="2.8"/>
  <text x="365" y="52" font-size="12" font-weight="bold" fill="#2B8A82">温度 T₁（低温）</text>
  <path d="M 64 208 Q 190 158 415 108" fill="none" stroke="#B9732F" stroke-width="2.8"/>
  <text x="365" y="102" font-size="12" font-weight="bold" fill="#B9732F">温度 T₂（中温）</text>
  <path d="M 64 210 Q 200 185 415 156" fill="none" stroke="#C2593F" stroke-width="2.8"/>
  <text x="365" y="150" font-size="12" font-weight="bold" fill="#C2593F">温度 T₃（高温）</text>
</svg>
`);

/** 金属イオンの系統分離フロー */
export const FIG_CATION_SEPARATION = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 260" font-family="sans-serif">
  <rect width="480" height="260" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="240" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">陽イオン混合水溶液（Ag⁺, Cu²⁺, Fe³⁺, Zn²⁺, Ca²⁺）の系統分離</text>
  <rect x="140" y="34" width="200" height="28" rx="6" fill="#E0F2FE" stroke="#0284C7"/>
  <text x="240" y="52" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#0369A1">試料水溶液 + 希塩酸 HCl（操作①）</text>
  <line x1="190" y1="62" x2="105" y2="86" stroke="#475569" stroke-width="1.8"/>
  <line x1="290" y1="62" x2="335" y2="86" stroke="#475569" stroke-width="1.8"/>
  <rect x="35" y="86" width="140" height="28" rx="6" fill="#F1F5F9" stroke="#64748B"/>
  <text x="105" y="104" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#334155">沈殿ア（白色）</text>
  <rect x="215" y="86" width="235" height="28" rx="6" fill="#DCFCE7" stroke="#16A34A"/>
  <text x="332" y="104" text-anchor="middle" font-size="11" font-weight="bold" fill="#166534">ろ液 + 酸性で H₂S 通気（操作②）</text>
  <line x1="280" y1="114" x2="175" y2="142" stroke="#475569" stroke-width="1.8"/>
  <line x1="375" y1="114" x2="375" y2="142" stroke="#475569" stroke-width="1.8"/>
  <rect x="100" y="142" width="150" height="28" rx="6" fill="#1E293B"/>
  <text x="175" y="160" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#FFFFFF">沈殿イ（黒色）</text>
  <rect x="270" y="142" width="190" height="28" rx="6" fill="#FEF3C7" stroke="#D97706"/>
  <text x="365" y="160" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#92400E">煮沸・HNO₃酸化 + 過剰 NH₃水（③）</text>
  <line x1="325" y1="170" x2="235" y2="198" stroke="#475569" stroke-width="1.8"/>
  <line x1="405" y1="170" x2="405" y2="198" stroke="#475569" stroke-width="1.8"/>
  <rect x="155" y="198" width="155" height="32" rx="6" fill="#FFEDD5" stroke="#C2410C"/>
  <text x="232" y="218" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#9A3412">沈殿ウ（赤褐色）</text>
  <rect x="330" y="198" width="135" height="32" rx="6" fill="#F3E8FF" stroke="#7E22CE"/>
  <text x="397" y="218" text-anchor="middle" font-size="11" font-weight="bold" fill="#6B21A8">ろ液（Zn²⁺錯イオン, Ca²⁺）</text>
</svg>
`);

/** 有機化合物（芳香族混合物：アニリン・フェノール・安息香酸・ニトロベンゼン）の分液ロート抽出 */
export const FIG_ORGANIC_EXTRACTION = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 255" font-family="sans-serif">
  <rect width="480" height="255" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="240" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">芳香族化合物4種（エーテル溶液）の分液ロートによる系統分離</text>
  <rect x="125" y="34" width="230" height="28" rx="6" fill="#FEE2E2" stroke="#DC2626"/>
  <text x="240" y="52" text-anchor="middle" font-size="11" font-weight="bold" fill="#991B1B">エーテル層 + 希塩酸 HCl 振り混ぜ（操作1）</text>
  <line x1="185" y1="62" x2="100" y2="88" stroke="#475569" stroke-width="1.8"/>
  <line x1="295" y1="62" x2="340" y2="88" stroke="#475569" stroke-width="1.8"/>
  <rect x="28" y="88" width="145" height="28" rx="6" fill="#DBEAFE" stroke="#2563EB"/>
  <text x="100" y="106" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E40AF">水層A（塩基性成分の塩）</text>
  <rect x="210" y="88" width="245" height="28" rx="6" fill="#FEF3C7" stroke="#D97706"/>
  <text x="332" y="106" text-anchor="middle" font-size="11" font-weight="bold" fill="#92400E">エーテル層 + NaHCO₃ 飽和水溶液（操作2）</text>
  <line x1="280" y1="116" x2="165" y2="144" stroke="#475559" stroke-width="1.8"/>
  <line x1="380" y1="116" x2="380" y2="144" stroke="#475559" stroke-width="1.8"/>
  <rect x="85" y="144" width="160" height="28" rx="6" fill="#DBEAFE" stroke="#2563EB"/>
  <text x="165" y="162" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E40AF">水層B（カルボン酸の塩）</text>
  <rect x="268" y="144" width="192" height="28" rx="6" fill="#DCFCE7" stroke="#16A34A"/>
  <text x="364" y="162" text-anchor="middle" font-size="11" font-weight="bold" fill="#166534">エーテル層 + NaOH 水溶液（操作3）</text>
  <line x1="320" y1="172" x2="225" y2="200" stroke="#475569" stroke-width="1.8"/>
  <line x1="405" y1="172" x2="405" y2="200" stroke="#475569" stroke-width="1.8"/>
  <rect x="145" y="200" width="155" height="30" rx="6" fill="#DBEAFE" stroke="#2563EB"/>
  <text x="222" y="219" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E40AF">水層C（フェノキシド）</text>
  <rect x="322" y="200" width="142" height="30" rx="6" fill="#F3E8FF" stroke="#7E22CE"/>
  <text x="393" y="219" text-anchor="middle" font-size="11" font-weight="bold" fill="#6B21A8">エーテル層D（中性成分）</text>
</svg>
`);

/** 炭酸ナトリウム Na₂CO₃（または NaOH + Na₂CO₃ 混合液）の二段階中和滴定曲線 */
export const FIG_TWO_STEP_TITRATION = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 265" font-family="sans-serif">
  <rect width="480" height="265" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="240" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">Na₂CO₃ 水溶液に塩酸 HCl を滴下した二段階滴定曲線</text>
  <rect x="62" y="72" width="388" height="24" fill="#FCE7F3" opacity="0.82"/>
  <text x="444" y="88" text-anchor="end" font-size="10.5" fill="#9D174D">フェノールフタレイン変色域 (8.0〜9.8)</text>
  <rect x="62" y="160" width="388" height="22" fill="#FEF3C7" opacity="0.88"/>
  <text x="444" y="175" text-anchor="end" font-size="10.5" fill="#92400E">メチルオレンジ変色域 (3.1〜4.4)</text>
  <line x1="62" y1="226" x2="454" y2="226" stroke="#475569" stroke-width="2"/>
  <line x1="62" y1="226" x2="62" y2="36" stroke="#475569" stroke-width="2"/>
  <text x="258" y="254" text-anchor="middle" font-size="12" fill="#475569">塩酸 HCl の滴下量 [mL]</text>
  <text x="22" y="132" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 132)">pH</text>
  <text x="54" y="56" text-anchor="end" font-size="11" fill="#475569">12</text>
  <text x="54" y="128" text-anchor="end" font-size="11" fill="#475569">7</text>
  <text x="54" y="200" text-anchor="end" font-size="11" fill="#475569">2</text>
  <line x1="205" y1="226" x2="205" y2="42" stroke="#CBD5E1" stroke-dasharray="4 3"/>
  <line x1="348" y1="226" x2="348" y2="42" stroke="#CBD5E1" stroke-dasharray="4 3"/>
  <text x="205" y="240" text-anchor="middle" font-size="11" font-weight="bold" fill="#9D174D">V₁（第1中和点）</text>
  <text x="348" y="240" text-anchor="middle" font-size="11" font-weight="bold" fill="#92400E">V₂（第2中和点）</text>
  <path d="M 62 56 Q 145 64 198 72 L 205 85 L 214 114 Q 280 124 340 138 L 348 171 L 357 202 Q 400 208 446 210" fill="none" stroke="#2F6DA8" stroke-width="3"/>
  <circle cx="205" cy="85" r="4.5" fill="#BE185D"/>
  <circle cx="348" cy="171" r="4.5" fill="#B45309"/>
  <text x="128" y="55" font-size="10.5" font-weight="bold" fill="#1E3A8A">CO₃²⁻ + H⁺ → HCO₃⁻</text>
  <text x="266" y="114" font-size="10.5" font-weight="bold" fill="#1E3A8A">HCO₃⁻ + H⁺ → H₂O + CO₂</text>
</svg>
`);

/** 純物質の状態図（水 vs 二酸化炭素の融解曲線・蒸気圧曲線・三重点・超臨界流体） */
export const FIG_PHASE_DIAGRAM = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 255" font-family="sans-serif">
  <rect width="470" height="255" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">純物質の状態図（圧力 P と温度 T の関係）</text>
  <line x1="62" y1="216" x2="442" y2="216" stroke="#475569" stroke-width="2"/>
  <line x1="62" y1="216" x2="62" y2="36" stroke="#475569" stroke-width="2"/>
  <text x="252" y="242" text-anchor="middle" font-size="12" fill="#475569">温度 T</text>
  <text x="22" y="126" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 126)">圧力 P</text>
  <path d="M 85 208 Q 145 190 185 156" fill="none" stroke="#475569" stroke-width="2.6"/>
  <path d="M 185 156 Q 275 130 370 68" fill="none" stroke="#2B8A82" stroke-width="2.8"/>
  <line x1="185" y1="156" x2="212" y2="45" stroke="#2F6DA8" stroke-width="2.6"/>
  <line x1="185" y1="156" x2="152" y2="45" stroke="#C2593F" stroke-width="2.5" stroke-dasharray="6 4"/>
  <circle cx="185" cy="156" r="5" fill="#1E293B"/>
  <circle cx="370" cy="68" r="5" fill="#7C3AED"/>
  <text x="200" y="168" font-size="11" font-weight="bold" fill="#1E293B">三重点 T</text>
  <text x="378" y="64" font-size="11" font-weight="bold" fill="#7C3AED">臨界点 C</text>
  <text x="108" y="112" font-size="13" font-weight="bold" fill="#334155">固 体</text>
  <text x="255" y="96" font-size="13" font-weight="bold" fill="#0F766E">液 体</text>
  <text x="315" y="182" font-size="13" font-weight="bold" fill="#B45309">気 体</text>
  <text x="382" y="48" font-size="10.5" font-weight="bold" fill="#6D28D9">超臨界流体</text>
  <text x="218" y="54" font-size="10.5" font-weight="bold" fill="#2F6DA8">一般物質（右上がり）</text>
  <text x="72" y="54" font-size="10.5" font-weight="bold" fill="#C2593F">水 H₂O（右下がり）</text>
</svg>
`);

/** 実在気体の圧縮率因子 Z = PV/(nRT) と圧力 P のグラフ */
export const FIG_REAL_GAS_Z = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">実在気体における Z = PV / (nRT) と圧力 P の関係</text>
  <line x1="62" y1="212" x2="442" y2="212" stroke="#475569" stroke-width="2"/>
  <line x1="62" y1="212" x2="62" y2="36" stroke="#475569" stroke-width="2"/>
  <line x1="62" y1="128" x2="438" y2="128" stroke="#334155" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="52" y="132" text-anchor="end" font-size="11.5" font-weight="bold" fill="#334155">1.0</text>
  <text x="388" y="121" font-size="11" font-weight="bold" fill="#334155">理想気体 (Z = 1)</text>
  <text x="252" y="239" text-anchor="middle" font-size="12" fill="#475569">圧力 P [×10⁷ Pa]</text>
  <text x="22" y="124" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 124)">Z = PV / (nRT)</text>
  <path d="M 62 128 Q 145 198 235 170 T 425 58" fill="none" stroke="#C2593F" stroke-width="2.8"/>
  <text x="172" y="196" font-size="11.5" font-weight="bold" fill="#C2593F">曲線ア（低温 or 極性大）</text>
  <path d="M 62 128 Q 145 154 240 132 T 425 74" fill="none" stroke="#2F6DA8" stroke-width="2.6"/>
  <text x="225" y="152" font-size="11.5" font-weight="bold" fill="#2F6DA8">曲線イ（高温）</text>
  <path d="M 62 128 L 425 88" fill="none" stroke="#2B8A82" stroke-width="2.6"/>
  <text x="295" y="92" font-size="11.5" font-weight="bold" fill="#2B8A82">曲線ウ（H₂・He）</text>
</svg>
`);

/** 金属結晶の単位格子（体心立方格子 BCC と面心立方格子 FCC） */
export const FIG_CRYSTAL_LATTICES = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 245" font-family="sans-serif">
  <rect width="480" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="240" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">金属結晶の単位格子モデル（一辺の長さ a、原子半径 r）</text>
  <g transform="translate(45,42)">
    <text x="78" y="14" text-anchor="middle" font-size="12" font-weight="bold" fill="#1E3A8A">格子A：体心立方格子 (BCC)</text>
    <rect x="28" y="54" width="84" height="84" fill="none" stroke="#64748B" stroke-width="1.8"/>
    <rect x="54" y="30" width="84" height="84" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="28" y1="54" x2="54" y2="30" stroke="#64748B" stroke-width="1.6"/>
    <line x1="112" y1="54" x2="138" y2="30" stroke="#64748B" stroke-width="1.6"/>
    <line x1="28" y1="138" x2="54" y2="114" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="112" y1="138" x2="138" y2="114" stroke="#64748B" stroke-width="1.6"/>
    <line x1="28" y1="138" x2="138" y2="30" stroke="#C2593F" stroke-width="2" stroke-dasharray="4 2"/>
    <circle cx="28" cy="54" r="8" fill="#3B82F6"/><circle cx="112" cy="54" r="8" fill="#3B82F6"/>
    <circle cx="28" cy="138" r="8" fill="#3B82F6"/><circle cx="112" cy="138" r="8" fill="#3B82F6"/>
    <circle cx="54" cy="30" r="7" fill="#60A5FA"/><circle cx="138" cy="30" r="8" fill="#3B82F6"/>
    <circle cx="54" cy="114" r="7" fill="#93C5FD"/><circle cx="138" cy="114" r="8" fill="#3B82F6"/>
    <circle cx="83" cy="84" r="12" fill="#EF4444" stroke="#991B1B" stroke-width="1.5"/>
    <text x="83" y="164" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">体対角線 √3 a = 4r（粒子数 2）</text>
  </g>
  <g transform="translate(262,42)">
    <text x="84" y="14" text-anchor="middle" font-size="12" font-weight="bold" fill="#0F766E">格子B：面心立方格子 (FCC)</text>
    <rect x="28" y="54" width="84" height="84" fill="none" stroke="#64748B" stroke-width="1.8"/>
    <rect x="54" y="30" width="84" height="84" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="28" y1="54" x2="54" y2="30" stroke="#64748B" stroke-width="1.6"/>
    <line x1="112" y1="54" x2="138" y2="30" stroke="#64748B" stroke-width="1.6"/>
    <line x1="28" y1="138" x2="54" y2="114" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="112" y1="138" x2="138" y2="114" stroke="#64748B" stroke-width="1.6"/>
    <line x1="28" y1="138" x2="112" y2="54" stroke="#0F766E" stroke-width="2" stroke-dasharray="4 2"/>
    <circle cx="28" cy="54" r="7.5" fill="#14B8A6"/><circle cx="112" cy="54" r="7.5" fill="#14B8A6"/>
    <circle cx="28" cy="138" r="7.5" fill="#14B8A6"/><circle cx="112" cy="138" r="7.5" fill="#14B8A6"/>
    <circle cx="138" cy="30" r="7.5" fill="#14B8A6"/><circle cx="138" cy="114" r="7.5" fill="#14B8A6"/>
    <circle cx="54" cy="30" r="6.5" fill="#5EEAD4"/>
    <circle cx="70" cy="96" r="10" fill="#0D9488" stroke="#115E59" stroke-width="1.5"/>
    <circle cx="83" cy="42" r="8.5" fill="#2DD4BF"/><circle cx="125" cy="72" r="8.5" fill="#2DD4BF"/>
    <text x="84" y="164" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">面対角線 √2 a = 4r（粒子数 4）</text>
  </g>
</svg>
`);

/** 純溶媒と希薄溶液の冷却曲線（過冷却と凝固点降下 ΔTf） */
export const FIG_COOLING_CURVE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">純水（実線）とグルコース水溶液（破線）の冷却曲線</text>
  <line x1="62" y1="212" x2="438" y2="212" stroke="#475569" stroke-width="2"/>
  <line x1="62" y1="212" x2="62" y2="36" stroke="#475569" stroke-width="2"/>
  <line x1="62" y1="108" x2="430" y2="108" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <text x="54" y="112" text-anchor="end" font-size="11" font-weight="bold" fill="#334155">0 ℃</text>
  <line x1="62" y1="146" x2="260" y2="146" stroke="#FCA5A5" stroke-dasharray="4 3"/>
  <text x="54" y="150" text-anchor="end" font-size="11" font-weight="bold" fill="#B91C1C">-ΔTf</text>
  <text x="250" y="239" text-anchor="middle" font-size="12" fill="#475569">冷却時間 t</text>
  <text x="22" y="124" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 124)">温度 [℃]</text>
  <path d="M 72 52 L 152 132 L 170 108 L 365 108 L 420 150" fill="none" stroke="#2F6DA8" stroke-width="2.8"/>
  <text x="305" y="100" font-size="11.5" font-weight="bold" fill="#2F6DA8">純水（0 ℃で一定）</text>
  <path d="M 72 64 L 165 174 L 186 150 L 395 178" fill="none" stroke="#C2593F" stroke-width="2.8" stroke-dasharray="7 4"/>
  <line x1="186" y1="150" x2="142" y2="144" stroke="#B91C1C" stroke-width="1.6" stroke-dasharray="3 2"/>
  <text x="295" y="186" font-size="11.5" font-weight="bold" fill="#C2593F">水溶液（氷析出で濃縮し温度低下）</text>
  <text x="128" y="192" font-size="10.5" fill="#64748B">過冷却状態</text>
</svg>
`);

/** イオン交換膜法による塩化ナトリウム水溶液の電気分解 */
export const FIG_ION_EXCHANGE_ELECTROLYSIS = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 255" font-family="sans-serif">
  <rect width="480" height="255" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="240" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">陽イオン交換膜法による NaCl 水溶液の電気分解（NaOH 工業的製法）</text>
  <rect x="80" y="66" width="320" height="148" rx="6" fill="#F8FAFC" stroke="#334155" stroke-width="2"/>
  <rect x="82" y="92" width="158" height="120" fill="#FEF9C3" opacity="0.55"/>
  <rect x="240" y="92" width="158" height="120" fill="#DBEAFE" opacity="0.6"/>
  <line x1="240" y1="66" x2="240" y2="214" stroke="#7C3AED" stroke-width="4" stroke-dasharray="7 4"/>
  <text x="240" y="234" text-anchor="middle" font-size="11" font-weight="bold" fill="#6D28D9">陽イオン交換膜（Na⁺ のみ通過）</text>
  <rect x="118" y="54" width="22" height="124" fill="#475569"/>
  <text x="129" y="48" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#B91C1C">陽極 (+) 炭素/Ti</text>
  <rect x="340" y="54" width="22" height="124" fill="#64748B"/>
  <text x="351" y="48" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#1D4ED8">陰極 (-) 鉄 Fe</text>
  <text x="166" y="118" font-size="11" font-weight="bold" fill="#854D0E">2Cl⁻ → Cl₂↑ + 2e⁻</text>
  <text x="255" y="118" font-size="11" font-weight="bold" fill="#1E40AF">2H₂O + 2e⁻ → H₂↑ + 2OH⁻</text>
  <line x1="205" y1="156" x2="275" y2="156" stroke="#DC2626" stroke-width="2.5"/>
  <polygon points="275,156 266,151 266,161" fill="#DC2626"/>
  <text x="240" y="149" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#DC2626">Na⁺</text>
  <text x="155" y="202" text-anchor="middle" font-size="11" fill="#475569">陽極室：飽和 NaCl 水溶液</text>
  <text x="322" y="202" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E3A8A">陰極室：純水 → 高純度 NaOHaq</text>
</svg>
`);

/** アミノ酸混合液のろ紙電気泳動（等電点と移動方向） */
export const FIG_AMINO_ELECTROPHORESIS = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 235" font-family="sans-serif">
  <rect width="470" height="235" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">pH 6.0 緩衝液におけるアミノ酸3種（Glu・Ala・Lys）の電気泳動</text>
  <rect x="56" y="78" width="358" height="84" rx="6" fill="#FFFBEB" stroke="#94A3B8" stroke-width="2"/>
  <rect x="56" y="78" width="38" height="84" rx="4" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.8"/>
  <text x="75" y="125" text-anchor="middle" font-size="14" font-weight="bold" fill="#B91C1C">陽極(+)</text>
  <rect x="376" y="78" width="38" height="84" rx="4" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.8"/>
  <text x="395" y="125" text-anchor="middle" font-size="14" font-weight="bold" fill="#1D4ED8">陰極(-)</text>
  <line x1="235" y1="72" x2="235" y2="168" stroke="#64748B" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="235" y="64" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">原点（試料滴下位置）</text>
  <circle cx="145" cy="120" r="16" fill="#C084FC" opacity="0.85"/>
  <text x="145" y="124" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">スポットA</text>
  <circle cx="235" cy="120" r="16" fill="#818CF8" opacity="0.85"/>
  <text x="235" y="124" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">スポットB</text>
  <circle cx="325" cy="120" r="16" fill="#38BDF8" opacity="0.85"/>
  <text x="325" y="124" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">スポットC</text>
  <text x="235" y="198" text-anchor="middle" font-size="11.5" fill="#334155">等電点 pI：グルタミン酸(Glu) = 3.2 ／ アラニン(Ala) = 6.0 ／ リシン(Lys) = 9.7</text>
  <text x="235" y="218" text-anchor="middle" font-size="11" fill="#64748B">ニンヒドリン反応で赤紫〜青紫色に発色させたスポット位置</text>
</svg>
`);

/** 固体の溶解度曲線と水和物再結晶のイメージ */
export const FIG_SOLUBILITY_CURVE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">固体の溶解度曲線（水 100 g に溶ける無水塩の最大質量 [g]）</text>
  <line x1="64" y1="212" x2="438" y2="212" stroke="#475569" stroke-width="2"/>
  <line x1="64" y1="212" x2="64" y2="36" stroke="#475569" stroke-width="2"/>
  <text x="250" y="239" text-anchor="middle" font-size="12" fill="#475569">温度 [℃]</text>
  <text x="22" y="125" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 125)">溶解度 [g / 水 100 g]</text>
  <text x="64" y="226" text-anchor="middle" font-size="11" fill="#475569">0</text>
  <text x="148" y="226" text-anchor="middle" font-size="11" fill="#475569">20</text>
  <text x="316" y="226" text-anchor="middle" font-size="11" fill="#475569">60</text>
  <text x="400" y="226" text-anchor="middle" font-size="11" fill="#475569">80</text>
  <path d="M 64 196 Q 210 172 385 44" fill="none" stroke="#C2593F" stroke-width="2.8"/>
  <text x="332" y="56" font-size="11.5" font-weight="bold" fill="#C2593F">KNO₃</text>
  <path d="M 64 188 Q 215 168 415 112" fill="none" stroke="#2F6DA8" stroke-width="2.8"/>
  <text x="378" y="106" font-size="11.5" font-weight="bold" fill="#2F6DA8">CuSO₄</text>
  <line x1="64" y1="168" x2="415" y2="162" stroke="#2B8A82" stroke-width="2.4" stroke-dasharray="6 3"/>
  <text x="380" y="154" font-size="11.5" font-weight="bold" fill="#2B8A82">NaCl</text>
  <circle cx="316" cy="142" r="4.5" fill="#1D4ED8"/>
  <circle cx="148" cy="177" r="4.5" fill="#1D4ED8"/>
  <line x1="316" y1="142" x2="316" y2="212" stroke="#94A3B8" stroke-dasharray="3 3"/>
  <line x1="148" y1="177" x2="148" y2="212" stroke="#94A3B8" stroke-dasharray="3 3"/>
</svg>
`);

/** 鉛蓄電池の放電模式図 */
export const FIG_LEAD_ACID_BATTERY = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">鉛蓄電池の放電反応（(-) Pb | H₂SO₄aq | PbO₂ (+)）</text>
  <line x1="135" y1="74" x2="135" y2="46" stroke="#334155" stroke-width="2.5"/>
  <line x1="335" y1="74" x2="335" y2="46" stroke="#334155" stroke-width="2.5"/>
  <line x1="135" y1="46" x2="205" y2="46" stroke="#334155" stroke-width="2.5"/>
  <line x1="265" y1="46" x2="335" y2="46" stroke="#334155" stroke-width="2.5"/>
  <circle cx="235" cy="46" r="19" fill="#FEF9C3" stroke="#CA8A04" stroke-width="2"/>
  <text x="235" y="51" text-anchor="middle" font-size="12" font-weight="bold" fill="#854D0E">e⁻ →</text>
  <rect x="82" y="92" width="306" height="126" rx="6" fill="#EFF6FF" stroke="#475569" stroke-width="2"/>
  <rect x="118" y="74" width="34" height="118" fill="#64748B" stroke="#334155" stroke-width="2"/>
  <text x="135" y="128" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">Pb</text>
  <text x="135" y="146" text-anchor="middle" font-size="10" fill="#E2E8F0">負極(-)</text>
  <rect x="318" y="74" width="34" height="118" fill="#78350F" stroke="#451A03" stroke-width="2"/>
  <text x="335" y="128" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#FFFFFF">PbO₂</text>
  <text x="335" y="146" text-anchor="middle" font-size="10" fill="#FDE68A">正極(+)</text>
  <text x="235" y="128" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#1E3A8A">希硫酸 H₂SO₄（放電で濃度低下）</text>
  <text x="235" y="152" text-anchor="middle" font-size="11" fill="#0F766E">両極とも白色の PbSO₄ が付着し質量増加</text>
  <text x="235" y="206" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">Pb + PbO₂ + 2H₂SO₄ → 2PbSO₄ + 2H₂O</text>
</svg>
`);

