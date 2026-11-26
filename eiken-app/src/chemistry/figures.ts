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

/** マクスウェル・ボルツマン速度分布と活性化エネルギー以上の分子数 */
export const FIG_MAXWELL_BOLTZMANN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">気体分子の運動エネルギー分布（低温 T₁ vs 高温 T₂）と活性化エネルギー</text>
  <line x1="58" y1="212" x2="438" y2="212" stroke="#475569" stroke-width="2"/>
  <line x1="58" y1="212" x2="58" y2="38" stroke="#475569" stroke-width="2"/>
  <text x="248" y="239" text-anchor="middle" font-size="12" fill="#475569">分子のもつ運動エネルギー E</text>
  <text x="22" y="126" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 126)">分子数の割合</text>
  <!-- 高温 T2 の Ea 以上の面積塗り -->
  <path d="M 300 162 Q 355 190 426 209 L 426 212 L 300 212 Z" fill="#FCA5A5" opacity="0.65"/>
  <!-- 低温 T1 の Ea 以上の面積塗り -->
  <path d="M 300 194 Q 355 206 426 211 L 426 212 L 300 212 Z" fill="#93C5FD" opacity="0.8"/>
  <!-- 低温 T1 曲線 -->
  <path d="M 58 212 C 96 52, 148 48, 185 98 C 228 156, 290 198, 426 211" fill="none" stroke="#2563EB" stroke-width="2.8"/>
  <text x="155" y="56" font-size="11.5" font-weight="bold" fill="#1D4ED8">低温 T₁（山が高く鋭い）</text>
  <!-- 高温 T2 曲線 -->
  <path d="M 58 212 C 110 102, 188 86, 240 124 C 292 162, 355 194, 426 209" fill="none" stroke="#DC2626" stroke-width="2.8"/>
  <text x="262" y="102" font-size="11.5" font-weight="bold" fill="#B91C1C">高温 T₂ ＞ T₁（山が低く右へ広がる）</text>
  <!-- Ea 境界線 -->
  <line x1="300" y1="54" x2="300" y2="212" stroke="#0F766E" stroke-width="2.2" stroke-dasharray="6 3"/>
  <text x="300" y="47" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#0F766E">活性化エネルギー Eₐ</text>
  <line x1="252" y1="68" x2="252" y2="212" stroke="#7C3AED" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="234" y="64" text-anchor="end" font-size="10.5" font-weight="bold" fill="#6D28D9">触媒あり Eₐ'</text>
  <text x="372" y="172" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#991B1B">E ≥ Eₐ の分子割合が急増！</text>
</svg>
`);

/** エンタルピー変化 ΔH とエントロピー変化 ΔS からみた反応の自発性4象限（新課程） */
export const FIG_ENTHALPY_ENTROPY = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 255" font-family="sans-serif">
  <rect width="470" height="255" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">【新課程】エンタルピー ΔH とエントロピー（乱雑さ）ΔS による自発変化の整理</text>
  <rect x="64" y="44" width="176" height="84" rx="6" fill="#FEF2F2" stroke="#FCA5A5"/>
  <rect x="240" y="44" width="176" height="84" rx="6" fill="#FFFBEB" stroke="#FCD34D"/>
  <rect x="64" y="128" width="176" height="84" rx="6" fill="#EFF6FF" stroke="#93C5FD"/>
  <rect x="240" y="128" width="176" height="84" rx="6" fill="#ECFDF5" stroke="#6EE7B7"/>
  <line x1="52" y1="128" x2="428" y2="128" stroke="#334155" stroke-width="2.2"/>
  <line x1="240" y1="36" x2="240" y2="222" stroke="#334155" stroke-width="2.2"/>
  <text x="240" y="241" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#334155">横軸：系のエントロピー変化 ΔS（左：減少 ΔS＜0 ／ 右：増大 ΔS＞0）</text>
  <text x="23" y="130" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#334155" transform="rotate(-90 23 130)">縦軸：ΔH（上：吸熱＞0 ／ 下：発熱＜0）</text>
  <!-- 各象限ラベル -->
  <text x="152" y="72" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#B91C1C">ΔH ＞ 0（吸熱）・ΔS ＜ 0</text>
  <text x="152" y="93" text-anchor="middle" font-size="11" fill="#7F1D1D">どの温度でも自発的に進まない</text>
  <text x="152" y="112" text-anchor="middle" font-size="10" fill="#991B1B">（例：常温での 3O₂ → 2O₃）</text>

  <text x="328" y="72" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#B45309">ΔH ＞ 0（吸熱）・ΔS ＞ 0</text>
  <text x="328" y="93" text-anchor="middle" font-size="11" font-weight="bold" fill="#92400E">高温で自発的に進む！</text>
  <text x="328" y="112" text-anchor="middle" font-size="10" fill="#78350F">（例：氷の融解・CaCO₃熱分解・冷却パック）</text>

  <text x="152" y="156" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#1D4ED8">ΔH ＜ 0（発熱）・ΔS ＜ 0</text>
  <text x="152" y="177" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E40AF">低温で自発的に進む！</text>
  <text x="152" y="196" text-anchor="middle" font-size="10" fill="#1E3A8A">（例：水の凝固・NH₃ + HCl → NH₄Cl(固)）</text>

  <text x="328" y="156" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#047857">ΔH ＜ 0（発熱）・ΔS ＞ 0</text>
  <text x="328" y="177" text-anchor="middle" font-size="11" font-weight="bold" fill="#065F46">すべての温度で自発的に進む！</text>
  <text x="328" y="196" text-anchor="middle" font-size="10" fill="#064E3B">（例：炭化水素の燃焼・2H₂O₂ → 2H₂O + O₂）</text>
</svg>
`);

/** 無機化学の「水酸化物 → 過剰NH₃ / 過剰NaOH 錯イオン再溶解と色」マトリックス図 */
export const FIG_INORGANIC_COLOR_MAP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="23" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">金属イオンの塩基沈殿色と「過剰 NaOH vs 過剰 NH₃水」再溶解マップ</text>
  <!-- ヘッダ -->
  <rect x="24" y="38" width="422" height="28" rx="4" fill="#334155"/>
  <text x="68" y="56" text-anchor="middle" font-size="11" font-weight="bold" fill="#FFFFFF">イオン</text>
  <text x="172" y="56" text-anchor="middle" font-size="11" font-weight="bold" fill="#FFFFFF">少量塩基の沈殿と色</text>
  <text x="296" y="56" text-anchor="middle" font-size="11" font-weight="bold" fill="#FDE68A">過剰 NaOHaq</text>
  <text x="396" y="56" text-anchor="middle" font-size="11" font-weight="bold" fill="#BAE6FD">過剰 NH₃水</text>
  <!-- 行1: Al3+, Pb2+, Sn2+ -->
  <rect x="24" y="70" width="422" height="32" fill="#F8FAFC" stroke="#CBD5E1"/>
  <text x="68" y="90" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E293B">Al³⁺ / Pb²⁺</text>
  <text x="172" y="90" text-anchor="middle" font-size="11" fill="#334155">Al(OH)₃・Pb(OH)₂［白色］</text>
  <text x="296" y="90" text-anchor="middle" font-size="11" font-weight="bold" fill="#047857">○ 無色錯イオンで溶解</text>
  <text x="396" y="90" text-anchor="middle" font-size="11" font-weight="bold" fill="#B91C1C">× 溶けない</text>
  <!-- 行2: Zn2+ -->
  <rect x="24" y="104" width="422" height="32" fill="#ECFDF5" stroke="#A7F3D0"/>
  <text x="68" y="124" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#065F46">★ Zn²⁺</text>
  <text x="172" y="124" text-anchor="middle" font-size="11" fill="#064E3B">Zn(OH)₂［白色］</text>
  <text x="296" y="124" text-anchor="middle" font-size="11" font-weight="bold" fill="#047857">○ [Zn(OH)₄]²⁻ 無色</text>
  <text x="396" y="124" text-anchor="middle" font-size="11" font-weight="bold" fill="#0369A1">○ [Zn(NH₃)₄]²⁺ 無色</text>
  <!-- 行3: Cu2+ -->
  <rect x="24" y="138" width="422" height="32" fill="#EFF6FF" stroke="#BFDBFE"/>
  <text x="68" y="158" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#1D4ED8">Cu²⁺</text>
  <text x="172" y="158" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563EB">Cu(OH)₂［青白色］</text>
  <text x="296" y="158" text-anchor="middle" font-size="11" font-weight="bold" fill="#B91C1C">×（加熱で黒色 CuO）</text>
  <text x="396" y="158" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E3A8A">○ 深青色 [Cu(NH₃)₄]²⁺</text>
  <!-- 行4: Ag+ -->
  <rect x="24" y="172" width="422" height="32" fill="#FEF3C7" stroke="#FDE68A"/>
  <text x="68" y="192" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#92400E">Ag⁺</text>
  <text x="172" y="192" text-anchor="middle" font-size="11" font-weight="bold" fill="#78350F">★ Ag₂O［褐色！］</text>
  <text x="296" y="192" text-anchor="middle" font-size="11" font-weight="bold" fill="#B91C1C">× 溶けない</text>
  <text x="396" y="192" text-anchor="middle" font-size="11" font-weight="bold" fill="#0369A1">○ 無色 [Ag(NH₃)₂]⁺</text>
  <!-- 行5: Fe2+ / Fe3+ -->
  <rect x="24" y="206" width="422" height="32" fill="#FEF2F2" stroke="#FECACA"/>
  <text x="68" y="226" text-anchor="middle" font-size="11" font-weight="bold" fill="#991B1B">Fe²⁺ / Fe³⁺</text>
  <text x="172" y="226" text-anchor="middle" font-size="10.5" fill="#7F1D1D">Fe(OH)₂緑白 / Fe(OH)₃赤褐</text>
  <text x="296" y="226" text-anchor="middle" font-size="11" font-weight="bold" fill="#B91C1C">× 溶けない</text>
  <text x="396" y="226" text-anchor="middle" font-size="11" font-weight="bold" fill="#B91C1C">× 溶けない</text>
</svg>
`);

/** 酵素反応速度と基質濃度・温度（最適温度と失活）の特性曲線 */
export const FIG_ENZYME_ACTIVITY = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">酵素触媒の反応速度特性（①基質濃度飽和と競争的阻害 ／ ②最適温度と熱変性失活）</text>
  <!-- 左グラフ：基質濃度 -->
  <line x1="46" y1="204" x2="222" y2="204" stroke="#475569" stroke-width="2"/>
  <line x1="46" y1="204" x2="46" y2="48" stroke="#475569" stroke-width="2"/>
  <text x="134" y="228" text-anchor="middle" font-size="11" fill="#475569">基質濃度 [S]</text>
  <text x="18" y="126" text-anchor="middle" font-size="11" fill="#475569" transform="rotate(-90 18 126)">反応速度 v</text>
  <line x1="46" y1="68" x2="220" y2="68" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="82" y="62" font-size="10.5" font-weight="bold" fill="#334155">最大速度 Vmax</text>
  <path d="M 46 204 Q 72 78 218 71" fill="none" stroke="#2563EB" stroke-width="2.6"/>
  <text x="150" y="92" font-size="10.5" font-weight="bold" fill="#1D4ED8">阻害剤なし</text>
  <path d="M 46 204 Q 118 118 218 80" fill="none" stroke="#EA580C" stroke-width="2.2" stroke-dasharray="5 3"/>
  <text x="166" y="132" font-size="10" font-weight="bold" fill="#C2410C">競争的阻害剤あり</text>
  <!-- 右グラフ：温度依存 -->
  <line x1="268" y1="204" x2="444" y2="204" stroke="#475569" stroke-width="2"/>
  <line x1="268" y1="204" x2="268" y2="48" stroke="#475569" stroke-width="2"/>
  <text x="356" y="228" text-anchor="middle" font-size="11" fill="#475569">温度 [℃]</text>
  <text x="292" y="217" text-anchor="middle" font-size="10" fill="#475569">0</text>
  <text x="352" y="217" text-anchor="middle" font-size="10" font-weight="bold" fill="#047857">約40</text>
  <text x="408" y="217" text-anchor="middle" font-size="10" fill="#B91C1C">70</text>
  <!-- 無機触媒 -->
  <path d="M 276 196 Q 350 172 426 56" fill="none" stroke="#64748B" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="412" y="52" text-anchor="end" font-size="10" fill="#475569">無機触媒(MnO₂等)</text>
  <!-- 酵素 -->
  <path d="M 276 198 C 306 175, 332 68, 352 68 C 370 68, 386 184, 408 204" fill="none" stroke="#059669" stroke-width="2.8"/>
  <line x1="352" y1="68" x2="352" y2="204" stroke="#10B981" stroke-dasharray="3 3"/>
  <text x="348" y="60" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#047857">最適温度</text>
  <text x="408" y="156" text-anchor="middle" font-size="10" font-weight="bold" fill="#B91C1C">熱変性で失活！</text>
</svg>
`);

/** 機器分析データ読解（①吸光度検量線 A=εcl ／ ②質量分析の同位体ピーク比 9:6:1） */
export const FIG_SPECTROPHOTOMETRY_MS = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">共通テスト機器分析グラフ（①ランベルト・ベール検量線 ／ ②質量スペクトル同位体ピーク）</text>
  <!-- 左：吸光度検量線 -->
  <line x1="48" y1="204" x2="218" y2="204" stroke="#475569" stroke-width="2"/>
  <line x1="48" y1="204" x2="48" y2="48" stroke="#475569" stroke-width="2"/>
  <text x="134" y="229" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">モル濃度 c [mmol/L]（セル長 l 一定）</text>
  <text x="18" y="126" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155" transform="rotate(-90 18 126)">吸光度 A = εcl</text>
  <line x1="48" y1="204" x2="208" y2="60" stroke="#0F766E" stroke-width="2.6"/>
  <line x1="128" y1="132" x2="128" y2="204" stroke="#0D9488" stroke-dasharray="4 3"/>
  <line x1="48" y1="132" x2="128" y2="132" stroke="#0D9488" stroke-dasharray="4 3"/>
  <circle cx="128" cy="132" r="4" fill="#0F766E"/>
  <text x="43" y="136" text-anchor="end" font-size="10" font-weight="bold" fill="#0F766E">0.45</text>
  <text x="128" y="216" text-anchor="middle" font-size="10" font-weight="bold" fill="#0F766E">2.0</text>
  <text x="140" y="72" font-size="10" font-weight="bold" fill="#115E59">原点を通る比例直線</text>
  <text x="140" y="86" font-size="9.5" fill="#B91C1C">※希釈測定時は倍率を掛ける！</text>
  <!-- 右：CH2Cl2 質量スペクトル -->
  <line x1="266" y1="204" x2="444" y2="204" stroke="#475569" stroke-width="2"/>
  <line x1="266" y1="204" x2="266" y2="48" stroke="#475569" stroke-width="2"/>
  <text x="356" y="229" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">質量電荷比 m/z（CH₂Cl₂⁺：³⁵Cl:³⁷Cl = 3:1）</text>
  <!-- m/z = 84 (9), 86 (6), 88 (1) -->
  <rect x="304" y="69" width="14" height="135" fill="#2563EB"/>
  <text x="311" y="62" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#1D4ED8">9 (100)</text>
  <text x="311" y="216" text-anchor="middle" font-size="10" font-weight="bold" fill="#1E293B">84</text>
  <rect x="354" y="114" width="14" height="90" fill="#0284C7"/>
  <text x="361" y="107" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#0369A1">6 (67)</text>
  <text x="361" y="216" text-anchor="middle" font-size="10" font-weight="bold" fill="#1E293B">86</text>
  <rect x="404" y="189" width="14" height="15" fill="#38BDF8"/>
  <text x="411" y="183" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#0284C7">1 (11)</text>
  <text x="411" y="216" text-anchor="middle" font-size="10" font-weight="bold" fill="#1E293B">88</text>
  <text x="378" y="64" text-anchor="middle" font-size="10" fill="#475569">(3/4)² : 2(3/4)(1/4) : (1/4)²</text>
</svg>
`);

/** 海水淡水化の逆浸透法（ΔP = π = icRT）と蒸気圧降下・沸点上昇の対応図 */
export const FIG_REVERSE_OSMOSIS_VAPOR = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">逆浸透法による海水淡水化（ΔP ＞ π）と蒸気圧曲線・沸点上昇 ΔTb の対応</text>
  <!-- 左：逆浸透セル -->
  <rect x="30" y="64" width="186" height="132" rx="6" fill="#FFFFFF" stroke="#475569" stroke-width="2"/>
  <rect x="32" y="92" width="91" height="102" fill="#DBEAFE"/>
  <rect x="123" y="92" width="91" height="102" fill="#ECFEFF"/>
  <line x1="123" y1="64" x2="123" y2="196" stroke="#D97706" stroke-width="3" stroke-dasharray="5 3"/>
  <text x="123" y="56" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#B45309">半透膜</text>
  <!-- ピストン加圧 -->
  <rect x="36" y="76" width="82" height="16" fill="#64748B"/>
  <line x1="77" y1="42" x2="77" y2="73" stroke="#DC2626" stroke-width="3"/>
  <polygon points="71,69 83,69 77,77" fill="#DC2626"/>
  <text x="72" y="38" text-anchor="middle" font-size="10" font-weight="bold" fill="#B91C1C">外圧 P₁</text>
  <text x="168" y="84" text-anchor="middle" font-size="10" fill="#475569">大気圧 P₀</text>
  <text x="77" y="132" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#1E40AF">NaCl水溶液</text>
  <text x="77" y="148" text-anchor="middle" font-size="10" fill="#1E3A8A">(π = 2cRT)</text>
  <text x="168" y="138" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#0F766E">純水（淡水）</text>
  <line x1="98" y1="172" x2="148" y2="172" stroke="#059669" stroke-width="2.8"/>
  <polygon points="145,167 155,172 145,177" fill="#059669"/>
  <text x="123" y="218" text-anchor="middle" font-size="10" font-weight="bold" fill="#065F46">P₁ − P₀ ＞ π で水分子が右へ移動</text>
  <!-- 右：蒸気圧曲線 -->
  <line x1="266" y1="200" x2="446" y2="200" stroke="#475569" stroke-width="2"/>
  <line x1="266" y1="200" x2="266" y2="48" stroke="#475569" stroke-width="2"/>
  <text x="356" y="229" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">温度 [℃]（沸騰時は蒸気圧＝外圧）</text>
  <line x1="266" y1="108" x2="436" y2="108" stroke="#94A3B8" stroke-width="1.6" stroke-dasharray="4 3"/>
  <text x="262" y="111" text-anchor="end" font-size="9.5" font-weight="bold" fill="#334155">P外</text>
  <path d="M 276 188 Q 332 162 384 56" fill="none" stroke="#2563EB" stroke-width="2.5"/>
  <text x="342" y="64" font-size="10" font-weight="bold" fill="#1D4ED8">純水</text>
  <path d="M 276 193 Q 354 172 418 62" fill="none" stroke="#DC2626" stroke-width="2.5"/>
  <text x="416" y="56" text-anchor="middle" font-size="10" font-weight="bold" fill="#B91C1C">水溶液</text>
  <line x1="358" y1="108" x2="358" y2="200" stroke="#2563EB" stroke-dasharray="3 3"/>
  <line x1="392" y1="108" x2="392" y2="200" stroke="#DC2626" stroke-dasharray="3 3"/>
  <text x="355" y="213" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1D4ED8">T₀</text>
  <text x="394" y="213" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#B91C1C">T₀+ΔTb</text>
</svg>
`);

/** 弱酸希釈の pH 曲線と、発熱可逆反応の温度上昇時「速度↑・平衡収率↓」グラフ */
export const FIG_WEAK_ACID_DILUTION_EQUIL = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">共通テスト頻出2大グラフ（①強酸vs弱酸の希釈pH変化 ／ ②温度上昇時の速度と平衡収率）</text>
  <!-- 左：希釈と pH -->
  <line x1="48" y1="202" x2="218" y2="202" stroke="#475569" stroke-width="2"/>
  <line x1="48" y1="202" x2="48" y2="48" stroke="#475569" stroke-width="2"/>
  <text x="134" y="228" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">希釈倍率 V / V₀（1 → 100倍）</text>
  <text x="18" y="125" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155" transform="rotate(-90 18 125)">pH</text>
  <line x1="48" y1="70" x2="216" y2="70" stroke="#64748B" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="43" y="74" text-anchor="end" font-size="10" font-weight="bold" fill="#334155">7.0</text>
  <text x="43" y="176" text-anchor="end" font-size="10" font-weight="bold" fill="#334155">3.0</text>
  <!-- 強酸: 100倍で +2 (pH 3 -> 5) -->
  <path d="M 48 172 Q 100 130 212 120" fill="none" stroke="#2563EB" stroke-width="2.4"/>
  <text x="162" y="112" font-size="10" font-weight="bold" fill="#1D4ED8">強酸 (+log₁₀k)</text>
  <!-- 弱酸: 100倍で +1 (pH 3 -> 4) -->
  <path d="M 48 172 Q 100 151 212 146" fill="none" stroke="#DC2626" stroke-width="2.6"/>
  <text x="155" y="164" font-size="10" font-weight="bold" fill="#B91C1C">弱酸 (+0.5log₁₀k)</text>
  <text x="134" y="59" text-anchor="middle" font-size="9.5" fill="#475569">※薄めても pH ＞ 7 にはならない！</text>
  <!-- 右：発熱反応の温度上昇 -->
  <line x1="266" y1="202" x2="444" y2="202" stroke="#475569" stroke-width="2"/>
  <line x1="266" y1="202" x2="266" y2="48" stroke="#475569" stroke-width="2"/>
  <text x="355" y="228" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">反応時間 t（発熱反応：N₂ + 3H₂ ⇄ 2NH₃）</text>
  <!-- 低温 T1 -->
  <path d="M 266 202 C 296 155, 336 78, 378 78 L 440 78" fill="none" stroke="#2563EB" stroke-width="2.4" stroke-dasharray="5 3"/>
  <text x="404" y="70" text-anchor="middle" font-size="10" font-weight="bold" fill="#1D4ED8">低温 T₁（遅く高い収率）</text>
  <!-- 高温 T2 -->
  <path d="M 266 202 C 278 130, 296 124, 318 124 L 440 124" fill="none" stroke="#DC2626" stroke-width="2.7"/>
  <text x="382" y="140" text-anchor="middle" font-size="10" font-weight="bold" fill="#B91C1C">高温 T₂＞T₁（立ち上がり急・収率低）</text>
</svg>
`);

/** 原油の常圧分留塔と沸点順（石油ガス・ナフサ・灯油・軽油・重油） */
export const FIG_PETROLEUM_FRACTIONATION = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">原油の常圧分留塔（上ほど低沸点・低炭素数 ／ ★灯油より軽油の方が高沸点！）</text>
  <!-- 加熱炉・原油導入 -->
  <rect x="30" y="156" width="66" height="44" rx="6" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.8"/>
  <text x="63" y="176" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#991B1B">加熱炉</text>
  <text x="63" y="191" text-anchor="middle" font-size="9.5" fill="#7F1D1D">原油 約350℃</text>
  <line x1="96" y1="178" x2="136" y2="178" stroke="#DC2626" stroke-width="2.5"/>
  <!-- 分留塔本体 -->
  <rect x="136" y="40" width="90" height="184" rx="12" fill="#F8FAFC" stroke="#334155" stroke-width="2.2"/>
  <line x1="136" y1="76" x2="226" y2="76" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <line x1="136" y1="112" x2="226" y2="112" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <line x1="136" y1="148" x2="226" y2="148" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <line x1="136" y1="184" x2="226" y2="184" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <text x="181" y="62" text-anchor="middle" font-size="10" font-weight="bold" fill="#0369A1">低温（塔頂）</text>
  <text x="181" y="210" text-anchor="middle" font-size="10" font-weight="bold" fill="#B91C1C">高温（塔底）</text>
  <!-- 5段の取り出しライン -->
  <line x1="226" y1="56" x2="262" y2="56" stroke="#0284C7" stroke-width="2.2"/>
  <text x="268" y="60" font-size="11" font-weight="bold" fill="#0369A1">① 石油ガス（〜30℃未満：LPG・C₁〜C₄）</text>
  <line x1="226" y1="94" x2="262" y2="94" stroke="#0D9488" stroke-width="2.2"/>
  <text x="268" y="98" font-size="11" font-weight="bold" fill="#0F766E">② ナフサ・ガソリン（30〜180℃：石油化学原料）</text>
  <line x1="226" y1="130" x2="262" y2="130" stroke="#D97706" stroke-width="2.2"/>
  <text x="268" y="134" font-size="11" font-weight="bold" fill="#B45309">③ 灯油（170〜250℃：ジェット燃料・暖房）</text>
  <line x1="226" y1="166" x2="262" y2="166" stroke="#EA580C" stroke-width="2.2"/>
  <text x="268" y="170" font-size="11" font-weight="bold" fill="#C2410C">④ ★軽油（240〜350℃：ディーゼル燃料）</text>
  <line x1="226" y1="204" x2="262" y2="204" stroke="#991B1B" stroke-width="2.2"/>
  <text x="268" y="208" font-size="11" font-weight="bold" fill="#7F1D1D">⑤ 重油・残渣（350℃以上：船舶燃料・アスファルト）</text>
</svg>
`);

/** 一次反応の一定半減期グラフ（[A] vs t）と アレニウスプロット（ln k vs 1/T） */
export const FIG_FIRST_ORDER_ARRHENIUS = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">共通テスト・2次頻出（①一次反応の一定半減期 t₁/₂ ／ ②アレニウスプロット ln k vs 1/T）</text>
  <line x1="48" y1="202" x2="222" y2="202" stroke="#475569" stroke-width="2"/>
  <line x1="48" y1="202" x2="48" y2="46" stroke="#475569" stroke-width="2"/>
  <text x="135" y="230" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">時間 t（一定間隔ごとに濃度が 1/2！）</text>
  <text x="18" y="125" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155" transform="rotate(-90 18 125)">[N₂O₅]</text>
  <path d="M 48 62 Q 82 118 102 132 Q 132 158 156 167 Q 186 181 212 185" fill="none" stroke="#0F766E" stroke-width="2.8"/>
  <line x1="48" y1="132" x2="102" y2="132" stroke="#94A3B8" stroke-dasharray="3 3"/>
  <line x1="102" y1="132" x2="102" y2="202" stroke="#94A3B8" stroke-dasharray="3 3"/>
  <line x1="48" y1="167" x2="156" y2="167" stroke="#94A3B8" stroke-dasharray="3 3"/>
  <line x1="156" y1="167" x2="156" y2="202" stroke="#94A3B8" stroke-dasharray="3 3"/>
  <circle cx="48" cy="62" r="4" fill="#0F766E"/>
  <circle cx="102" cy="132" r="4" fill="#0F766E"/>
  <circle cx="156" cy="167" r="4" fill="#0F766E"/>
  <text x="43" y="66" text-anchor="end" font-size="9.5" font-weight="bold" fill="#0F766E">c₀</text>
  <text x="43" y="136" text-anchor="end" font-size="9.5" font-weight="bold" fill="#0F766E">c₀/2</text>
  <text x="43" y="171" text-anchor="end" font-size="9.5" font-weight="bold" fill="#0F766E">c₀/4</text>
  <text x="102" y="214" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#334155">t₁/₂</text>
  <text x="156" y="214" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#334155">2t₁/₂</text>
  <line x1="272" y1="202" x2="444" y2="202" stroke="#475569" stroke-width="2"/>
  <line x1="272" y1="202" x2="272" y2="46" stroke="#475569" stroke-width="2"/>
  <text x="358" y="230" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">絶対温度の逆数 1 / T [K⁻¹]（右ほど低温）</text>
  <text x="253" y="125" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155" transform="rotate(-90 253 125)">ln k</text>
  <line x1="286" y1="68" x2="422" y2="190" stroke="#DC2626" stroke-width="2.6"/>
  <text x="380" y="182" font-size="10" font-weight="bold" fill="#B91C1C">触媒なし（傾き −Ea/R）</text>
  <line x1="286" y1="62" x2="432" y2="132" stroke="#2563EB" stroke-width="2.6" stroke-dasharray="5 3"/>
  <text x="382" y="96" font-size="10" font-weight="bold" fill="#1D4ED8">正触媒あり（Ea小→傾き緩）</text>
</svg>
`);

/** 薄層クロマトグラフィー（Rf値）と強酸性陽イオン交換カラムの模式図 */
export const FIG_CHROMATOGRAPHY_ION_EXCHANGE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">クロマトグラフィーの吸着分離（左：Rf値）と強酸性陽イオン交換樹脂カラム（右）</text>
  <rect x="44" y="48" width="142" height="156" rx="4" fill="#FFFFFF" stroke="#475569" stroke-width="2"/>
  <line x1="44" y1="68" x2="186" y2="68" stroke="#0284C7" stroke-width="1.8" stroke-dasharray="4 3"/>
  <text x="192" y="72" font-size="9.5" font-weight="bold" fill="#0369A1">溶媒先端 (b)</text>
  <line x1="44" y1="184" x2="186" y2="184" stroke="#64748B" stroke-width="1.6"/>
  <text x="192" y="188" font-size="9.5" font-weight="bold" fill="#334155">原点ライン</text>
  <circle cx="92" cy="96" r="7" fill="#F59E0B"/>
  <text x="115" y="99" font-size="10" font-weight="bold" fill="#B45309">成分P（吸着弱・Rf大）</text>
  <circle cx="92" cy="146" r="7" fill="#10B981"/>
  <text x="115" y="149" font-size="10" font-weight="bold" fill="#047857">成分Q（吸着強・Rf小）</text>
  <text x="115" y="224" text-anchor="middle" font-size="10" font-weight="bold" fill="#334155">Rf ＝ 原点〜スポット距離 a ÷ 原点〜溶媒先端 b</text>
  <rect x="292" y="48" width="108" height="136" rx="8" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
  <text x="346" y="72" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#92400E">R−SO₃H 型樹脂</text>
  <text x="346" y="94" text-anchor="middle" font-size="10" fill="#78350F">Na⁺ 1個 → H⁺ 1個</text>
  <text x="346" y="114" text-anchor="middle" font-size="10" font-weight="bold" fill="#B91C1C">Cu²⁺ 1個 → H⁺ 2個</text>
  <text x="346" y="134" text-anchor="middle" font-size="10" font-weight="bold" fill="#7C2D12">Al³⁺ 1個 → H⁺ 3個</text>
  <text x="346" y="160" text-anchor="middle" font-size="9.5" fill="#475569">(陰イオンは素通り)</text>
  <line x1="346" y1="184" x2="346" y2="210" stroke="#2563EB" stroke-width="3"/>
  <polygon points="340,206 352,206 346,215" fill="#2563EB"/>
  <text x="346" y="229" text-anchor="middle" font-size="10" font-weight="bold" fill="#1D4ED8">流出 H⁺ mol ＝ 陽イオン電荷総 mol！</text>
</svg>
`);

/** ワルダー法二段階滴定曲線（炭酸ナトリウム・NaOH＋Na₂CO₃混合塩基のフェノールフタレイン第1終点とメチルオレンジ第2終点） */
export const FIG_WARDER_DOUBLE_TITRATION = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="21" text-anchor="middle" font-size="12" font-weight="bold" fill="#1E293B">二段階中和滴定（ワルダー法：NaOH ＋ Na₂CO₃ 混合塩基への HCl 滴下曲線）</text>
  <line x1="56" y1="204" x2="436" y2="204" stroke="#334155" stroke-width="2"/>
  <line x1="56" y1="204" x2="56" y2="38" stroke="#334155" stroke-width="2"/>
  <text x="246" y="232" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">滴下した塩酸 HCl の体積 V [mL]（V₁：第1終点 ／ V₂：第2終点）</text>
  <text x="22" y="122" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155" transform="rotate(-90 22 122)">水溶液の pH</text>
  <!-- 指示薬の変色域バンド -->
  <rect x="57" y="76" width="376" height="22" fill="#FCE7F3" opacity="0.72"/>
  <text x="428" y="90" text-anchor="end" font-size="9.5" font-weight="bold" fill="#BE185D">フェノールフタレイン変色域 (pH 8.0〜9.8)</text>
  <rect x="57" y="148" width="376" height="22" fill="#FEF3C7" opacity="0.8"/>
  <text x="428" y="162" text-anchor="end" font-size="9.5" font-weight="bold" fill="#B45309">メチルオレンジ変色域 (pH 3.1〜4.4)</text>
  <!-- 2段階滴定曲線 -->
  <path d="M 56 48 C 120 50, 185 58, 210 72 C 218 78, 222 95, 232 102 C 260 112, 300 116, 326 126 C 336 135, 338 168, 348 182 C 372 192, 405 194, 430 195" fill="none" stroke="#0F766E" stroke-width="3"/>
  <!-- 第1終点 V1 -->
  <line x1="220" y1="88" x2="220" y2="204" stroke="#BE185D" stroke-width="1.7" stroke-dasharray="4 3"/>
  <circle cx="220" cy="88" r="4.5" fill="#BE185D"/>
  <text x="220" y="217" text-anchor="middle" font-size="10" font-weight="bold" fill="#BE185D">V₁</text>
  <!-- 第2終点 V2 -->
  <line x1="340" y1="159" x2="340" y2="204" stroke="#D97706" stroke-width="1.7" stroke-dasharray="4 3"/>
  <circle cx="340" cy="159" r="4.5" fill="#D97706"/>
  <text x="340" y="217" text-anchor="middle" font-size="10" font-weight="bold" fill="#B45309">V₂</text>
  <!-- 区間注釈 -->
  <rect x="74" y="106" width="134" height="36" rx="5" fill="#FFFFFF" stroke="#94A3B8"/>
  <text x="141" y="120" text-anchor="middle" font-size="9.2" font-weight="bold" fill="#0F172A">0〜V₁：NaOH 全中和</text>
  <text x="141" y="134" text-anchor="middle" font-size="9.2" fill="#334155">＋ Na₂CO₃ → NaHCO₃</text>
  <rect x="228" y="44" width="136" height="28" rx="5" fill="#FFFBEB" stroke="#D97706"/>
  <text x="296" y="62" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#92400E">V₂ − V₁ ＝ NaHCO₃ → CO₂ 量！</text>
</svg>
`);

/** トタン（Znめっき）とブリキ（Snめっき）の傷口における局部電池と電子移動の比較図 */
export const FIG_CORROSION_GALVANIC = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="21" text-anchor="middle" font-size="12" font-weight="bold" fill="#1E293B">めっき鋼板の傷口における局部電池比較（イオン化傾向：Zn ＞ Fe ＞ Sn）</text>
  <!-- 左：トタン -->
  <rect x="22" y="38" width="204" height="190" rx="10" fill="#F0FDF4" stroke="#86EFAC"/>
  <text x="124" y="57" text-anchor="middle" font-size="11" font-weight="bold" fill="#166534">① トタン（鉄 Fe に 亜鉛 Zn めっき）</text>
  <path d="M 46 122 Q 124 72 202 122 Z" fill="#BAE6FD" opacity="0.75"/>
  <text x="124" y="102" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#0369A1">水滴（O₂ ＋ H₂O）</text>
  <rect x="38" y="122" width="64" height="24" fill="#94A3B8" stroke="#475569"/>
  <text x="70" y="138" text-anchor="middle" font-size="10" font-weight="bold" fill="#0F172A">Zn 層</text>
  <rect x="146" y="122" width="64" height="24" fill="#94A3B8" stroke="#475569"/>
  <text x="178" y="138" text-anchor="middle" font-size="10" font-weight="bold" fill="#0F172A">Zn 層</text>
  <rect x="38" y="146" width="172" height="34" fill="#CBD5E1" stroke="#334155"/>
  <text x="124" y="167" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#1E293B">内部の鉄板 Fe（保護され錆びない！）</text>
  <path d="M 82 142 Q 104 160 122 148" fill="none" stroke="#DC2626" stroke-width="2.2"/>
  <text x="124" y="198" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#15803D">Zn → Zn²⁺ ＋ 2e⁻（犠牲防食）</text>
  <text x="124" y="214" text-anchor="middle" font-size="9" fill="#334155">e⁻ が Fe へ流れ込み Fe の溶出を阻止</text>
  <!-- 右：ブリキ -->
  <rect x="244" y="38" width="204" height="190" rx="10" fill="#FEF2F2" stroke="#FCA5A5"/>
  <text x="346" y="57" text-anchor="middle" font-size="11" font-weight="bold" fill="#991B1B">② ブリキ（鉄 Fe に スズ Sn めっき）</text>
  <path d="M 268 122 Q 346 72 424 122 Z" fill="#BAE6FD" opacity="0.75"/>
  <text x="346" y="102" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#0369A1">水滴（O₂ ＋ H₂O）</text>
  <rect x="260" y="122" width="64" height="24" fill="#E2E8F0" stroke="#475569"/>
  <text x="292" y="138" text-anchor="middle" font-size="10" font-weight="bold" fill="#0F172A">Sn 層</text>
  <rect x="368" y="122" width="64" height="24" fill="#E2E8F0" stroke="#475569"/>
  <text x="400" y="138" text-anchor="middle" font-size="10" font-weight="bold" fill="#0F172A">Sn 層</text>
  <rect x="260" y="146" width="172" height="34" fill="#FECACA" stroke="#991B1B"/>
  <text x="346" y="167" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#7F1D1D">鉄板 Fe が負極となり急速腐食！</text>
  <text x="346" y="198" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#B91C1C">Fe → Fe²⁺ ＋ 2e⁻（e⁻ が Sn 側へ流出）</text>
  <text x="346" y="214" text-anchor="middle" font-size="9" fill="#334155">傷がつくと裸の鉄より速く赤錆が進行！</text>
</svg>
`);

/** 無機4大工業製法（アンモニアソーダ法・オストワルト法・接触法・ホール・エルー法）の要所比較チャート */
export const FIG_INDUSTRIAL_INORGANIC_FLOW = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="21" text-anchor="middle" font-size="12" font-weight="bold" fill="#1E293B">無機4大工業製法の触媒・中間体・回収ループ総整理</text>
  <!-- 1 ソルベー法 -->
  <rect x="18" y="34" width="212" height="94" rx="8" fill="#EFF6FF" stroke="#60A5FA"/>
  <text x="124" y="51" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#1E40AF">① アンモニアソーダ法（Na₂CO₃）</text>
  <text x="28" y="69" font-size="9.3" font-weight="bold" fill="#1E293B">飽和NaCl水 → ★先にNH₃吸収 → CO₂吹込</text>
  <text x="28" y="85" font-size="9.3" fill="#B91C1C" font-weight="bold">→ 溶解度小の NaHCO₃↓ が先に沈殿！</text>
  <text x="28" y="101" font-size="9" fill="#334155">熱分解：2NaHCO₃ → Na₂CO₃＋H₂O＋CO₂↑</text>
  <text x="28" y="117" font-size="9" fill="#0F766E">副生物：CaCl₂（NH₃ と CO₂ は全循環再利用）</text>
  <!-- 2 接触法 -->
  <rect x="240" y="34" width="212" height="94" rx="8" fill="#FEFCE8" stroke="#FACC15"/>
  <text x="346" y="51" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#854D0E">② 接触法（濃硫酸 H₂SO₄）</text>
  <text x="250" y="69" font-size="9.3" font-weight="bold" fill="#1E293B">S / FeS₂ → SO₂ →［触媒 V₂O₅］→ SO₃</text>
  <text x="250" y="85" font-size="9.3" fill="#B91C1C" font-weight="bold">→ ★濃硫酸に吸収させて発煙硫酸へ！</text>
  <text x="250" y="101" font-size="9" fill="#334155">（水への直接吸収は発熱ミスト化するため不可）</text>
  <text x="250" y="117" font-size="9" fill="#0F766E">最後に希硫酸で薄めて濃硫酸を得る</text>
  <!-- 3 オストワルト法 -->
  <rect x="18" y="138" width="212" height="94" rx="8" fill="#F0FDF4" stroke="#4ADE80"/>
  <text x="124" y="155" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#166534">③ オストワルト法（硝酸 HNO₃）</text>
  <text x="28" y="173" font-size="9.3" font-weight="bold" fill="#1E293B">4NH₃＋5O₂ →［触媒 Pt］→ 4NO＋6H₂O</text>
  <text x="28" y="189" font-size="9.3" fill="#334155">2NO＋O₂ → 2NO₂ ／ 3NO₂＋H₂O → 2HNO₃＋NO</text>
  <text x="28" y="206" font-size="9.3" fill="#B91C1C" font-weight="bold">★副生 NO 再利用時：NH₃ 1mol → HNO₃ 1mol</text>
  <text x="28" y="221" font-size="9" fill="#0F766E">合算式：NH₃ ＋ 2O₂ → HNO₃ ＋ H₂O</text>
  <!-- 4 ホール・エルー法 -->
  <rect x="240" y="138" width="212" height="94" rx="8" fill="#FDF2F8" stroke="#F472B6"/>
  <text x="346" y="155" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#9D174D">④ ホール・エルー法（Al 融解塩電解）</text>
  <text x="250" y="173" font-size="9.3" font-weight="bold" fill="#1E293B">融解氷晶石 Na₃AlF₆ に Al₂O₃ を溶解</text>
  <text x="250" y="189" font-size="9.3" fill="#334155">陰極：Al³⁺ ＋ 3e⁻ → Al(液) 析出</text>
  <text x="250" y="206" font-size="9.3" fill="#B91C1C" font-weight="bold">陽極：炭素 C 自身が酸化消耗（CO / CO₂↑）</text>
  <text x="250" y="221" font-size="9" fill="#0F766E">（水溶液電解では H₂ が出るため Al は不可）</text>
</svg>
`);

/** サリチル酸誘導体の反応マップ（アセチルサリチル酸＝熱NaOH 3mol消費 vs サリチル酸メチル） */
export const FIG_SALICYLIC_REACTION_MAP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="21" text-anchor="middle" font-size="12" font-weight="bold" fill="#1E293B">サリチル酸誘導体の官能基・FeCl₃呈色・熱NaOH消費モル比較</text>
  <!-- 中央：サリチル酸 -->
  <rect x="166" y="84" width="138" height="72" rx="10" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
  <text x="235" y="105" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E40AF">サリチル酸 (M=138)</text>
  <text x="235" y="122" text-anchor="middle" font-size="9.5" fill="#1E293B">o-HO − C₆H₄ − COOH</text>
  <text x="235" y="138" text-anchor="middle" font-size="9.2" font-weight="bold" fill="#7C3AED">FeCl₃：赤紫色（陽性）</text>
  <text x="235" y="151" text-anchor="middle" font-size="9" fill="#334155">NaHCO₃：発泡(○) ／ NaOH 2mol</text>
  <!-- 左：アセチルサリチル酸 -->
  <rect x="14" y="54" width="128" height="136" rx="10" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.8"/>
  <text x="78" y="75" text-anchor="middle" font-size="10.2" font-weight="bold" fill="#991B1B">アセチルサリチル酸</text>
  <text x="78" y="91" text-anchor="middle" font-size="9" fill="#334155">(アスピリン M=180)</text>
  <text x="78" y="108" text-anchor="middle" font-size="8.8" font-weight="bold" fill="#1E293B">CH₃COO−C₆H₄−COOH</text>
  <text x="78" y="126" text-anchor="middle" font-size="9" fill="#475569">FeCl₃：呈色せず(−)</text>
  <text x="78" y="142" text-anchor="middle" font-size="9" fill="#0F766E" font-weight="bold">NaHCO₃：発泡する(○)</text>
  <rect x="22" y="152" width="112" height="30" rx="5" fill="#FEE2E2"/>
  <text x="78" y="166" text-anchor="middle" font-size="9" font-weight="bold" fill="#B91C1C">★熱NaOH：3 mol 消費！</text>
  <text x="78" y="178" text-anchor="middle" font-size="8.2" fill="#7F1D1D">(−COOH＋酢酸＋露出ArOH)</text>
  <line x1="166" y1="115" x2="142" y2="115" stroke="#DC2626" stroke-width="2"/>
  <text x="154" y="76" text-anchor="middle" font-size="8.5" font-weight="bold" fill="#B91C1C">無水酢酸</text>
  <!-- 右：サリチル酸メチル -->
  <rect x="328" y="54" width="128" height="136" rx="10" fill="#F0FDF4" stroke="#16A34A" stroke-width="1.8"/>
  <text x="392" y="75" text-anchor="middle" font-size="10.2" font-weight="bold" fill="#166534">サリチル酸メチル</text>
  <text x="392" y="91" text-anchor="middle" font-size="9" fill="#334155">(消炎塗布薬 M=152)</text>
  <text x="392" y="108" text-anchor="middle" font-size="8.8" font-weight="bold" fill="#1E293B">HO−C₆H₄−COOCH₃</text>
  <text x="392" y="126" text-anchor="middle" font-size="9" font-weight="bold" fill="#7C3AED">FeCl₃：赤紫色（陽性！）</text>
  <text x="392" y="142" text-anchor="middle" font-size="9" fill="#64748B">NaHCO₃：反応せず(−)</text>
  <rect x="336" y="152" width="112" height="30" rx="5" fill="#DCFCE7"/>
  <text x="392" y="166" text-anchor="middle" font-size="9" font-weight="bold" fill="#15803D">熱NaOH：2 mol 消費</text>
  <text x="392" y="178" text-anchor="middle" font-size="8.2" fill="#14532D">(ArOH＋加水分解−COOH)</text>
  <line x1="304" y1="115" x2="328" y2="115" stroke="#16A34A" stroke-width="2"/>
  <text x="316" y="76" text-anchor="middle" font-size="8.5" font-weight="bold" fill="#15803D">CH₃OH＋濃H₂SO₄</text>
  <text x="235" y="222" text-anchor="middle" font-size="9.8" font-weight="bold" fill="#334155">急所：フェノールエステル（左）は加水分解で新たにフェノール性 −OH が生じるため NaOH を余分に 1 mol 喰う！</text>
</svg>
`);

/** 有機構造決定の総合ロードマップ（オゾン分解・ラクトン閉環・ヨードホルム反応・C₈H₁₀コルナー法） */
export const FIG_ORGANIC_STRUCTURE_PUZZLE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 245" font-family="sans-serif">
  <rect width="470" height="245" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="21" text-anchor="middle" font-size="12" font-weight="bold" fill="#1E293B">有機構造決定の4大決め手（不飽和度・オゾン分解・ラクトン・環一置換体数）</text>
  <rect x="18" y="36" width="212" height="92" rx="8" fill="#EFF6FF" stroke="#60A5FA"/>
  <text x="124" y="54" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#1E40AF">① 不飽和度 U の即算式</text>
  <text x="124" y="74" text-anchor="middle" font-size="10" font-weight="bold" fill="#0F172A">U ＝ (2C ＋ 2 ＋ N − H − X) ÷ 2</text>
  <text x="28" y="94" font-size="9.2" fill="#334155">・U＝1：二重結合1個 または 環1個</text>
  <text x="28" y="110" font-size="9.2" fill="#B91C1C" font-weight="bold">・U＝4 以上：まずベンゼン環（U＝4）を疑う！</text>
  <rect x="240" y="36" width="212" height="92" rx="8" fill="#FEFCE8" stroke="#FACC15"/>
  <text x="346" y="54" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#854D0E">② アルケンのオゾン分解パズル</text>
  <text x="346" y="74" text-anchor="middle" font-size="9.8" font-weight="bold" fill="#0F172A">R₁R₂C＝CHR₃ → R₁R₂C＝O ＋ O＝CHR₃</text>
  <text x="250" y="94" font-size="9.2" fill="#334155">・生成カルボニル2個の「＝O」同士を消して直結！</text>
  <text x="250" y="110" font-size="9.2" fill="#B45309" font-weight="bold">・幾何異性体なし ⇔ 片方の C に同じ基が2個</text>
  <rect x="18" y="138" width="212" height="92" rx="8" fill="#F0FDF4" stroke="#4ADE80"/>
  <text x="124" y="156" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#166534">③ 加水分解しても炭素数が減らないエステル</text>
  <text x="124" y="175" text-anchor="middle" font-size="9.6" font-weight="bold" fill="#0F172A">CₙH₂ₙ₋₂O₂ ＋ H₂O → CₙH₂ₙO₃（単一生成物！）</text>
  <text x="28" y="194" font-size="9.2" fill="#15803D" font-weight="bold">⇒ 分子内環状エステル（ラクトン）で確定！</text>
  <text x="28" y="211" font-size="9" fill="#334155">ヨードホルム陽性なら −CH(OH)CH₃ 末端をもつ</text>
  <rect x="240" y="138" width="212" height="92" rx="8" fill="#FDF2F8" stroke="#F472B6"/>
  <text x="346" y="156" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#9D174D">④ C₈H₁₀ 芳香族の環一置換体（コルナー法）</text>
  <text x="250" y="176" font-size="9.3" font-weight="bold" fill="#B91C1C">・p-キシレン：対称性最高 → 1種類のみ！</text>
  <text x="250" y="193" font-size="9.3" font-weight="bold" fill="#1E293B">・o-キシレン：2種類 ／ m-キシレン：3種類</text>
  <text x="250" y="210" font-size="9.2" fill="#334155">・エチルベンゼン：o, m, p の 3種類（酸化で安息香酸）</text>
</svg>
`);

// --- Wave-2 Additional Common Test SVG Figures ---
export const FIG_HCP_CROSS_SECTION = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 250" font-family="sans-serif">
  <rect width="480" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="240" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#2A3B4C">最密充填構造の積層パターン（ABAB… vs ABCABC…）と断面原子配置</text>
  <g transform="translate(26,40)">
    <rect width="204" height="190" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="102" y="20" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#0F766E">六方最密構造 (HCP)：ABAB積層</text>
    <polygon points="102,42 154,68 154,126 102,152 50,126 50,68" fill="none" stroke="#64748B" stroke-width="1.6"/>
    <line x1="50" y1="68" x2="154" y2="68" stroke="#94A3B8" stroke-dasharray="3 3"/>
    <line x1="50" y1="126" x2="154" y2="126" stroke="#94A3B8" stroke-dasharray="3 3"/>
    <circle cx="102" cy="42" r="7" fill="#0D9488"/><circle cx="154" cy="68" r="7" fill="#0D9488"/>
    <circle cx="50" cy="68" r="7" fill="#0D9488"/><circle cx="102" cy="68" r="7" fill="#14B8A6"/>
    <circle cx="78" cy="97" r="8.5" fill="#F59E0B" stroke="#B45309" stroke-width="1.4"/>
    <circle cx="126" cy="97" r="8.5" fill="#F59E0B" stroke="#B45309" stroke-width="1.4"/>
    <circle cx="102" cy="106" r="8.5" fill="#FBBF24" stroke="#B45309" stroke-width="1.4"/>
    <circle cx="50" cy="126" r="7" fill="#0D9488"/><circle cx="154" cy="126" r="7" fill="#0D9488"/>
    <circle cx="102" cy="152" r="7" fill="#0D9488"/><circle cx="102" cy="126" r="7" fill="#14B8A6"/>
    <text x="102" y="172" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">配位数 12・充填率 74%（六角柱内 6個）</text>
    <text x="102" y="185" text-anchor="middle" font-size="9.5" fill="#64748B">高さ c = 2√(2/3) a ≒ 1.63a（a = 2r）</text>
  </g>
  <g transform="translate(250,40)">
    <rect width="204" height="190" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="102" y="20" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#1E3A8A">FCC の面対角線断面（(110)面）</text>
    <rect x="38" y="42" width="128" height="92" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.8"/>
    <circle cx="38" cy="42" r="11" fill="#3B82F6" opacity="0.85"/>
    <circle cx="166" cy="42" r="11" fill="#3B82F6" opacity="0.85"/>
    <circle cx="38" cy="134" r="11" fill="#3B82F6" opacity="0.85"/>
    <circle cx="166" cy="134" r="11" fill="#3B82F6" opacity="0.85"/>
    <circle cx="102" cy="42" r="14" fill="#0EA5E9" stroke="#0369A1" stroke-width="1.5"/>
    <circle cx="102" cy="134" r="14" fill="#0EA5E9" stroke="#0369A1" stroke-width="1.5"/>
    <circle cx="38" cy="88" r="9" fill="#93C5FD" stroke="#2563EB" stroke-dasharray="2 2"/>
    <circle cx="166" cy="88" r="9" fill="#93C5FD" stroke="#2563EB" stroke-dasharray="2 2"/>
    <text x="102" y="92" text-anchor="middle" font-size="10" font-weight="bold" fill="#B91C1C">体心には原子なし！</text>
    <text x="102" y="162" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">横 √2 a × 縦 a の長方形断面</text>
    <text x="102" y="180" text-anchor="middle" font-size="9.5" fill="#64748B">上下面の中央（面心）で原子が接する</text>
  </g>
</svg>
`);

/** 過不足のある反応（一定量の固体・溶液に試薬を加えたときの気体発生量・折れ曲がり点） */

export const FIG_EXCESS_LIMITING_GRAPH = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="23" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">一定体積の塩酸に金属や炭酸塩を加えたときの気体発生量（過不足グラフ）</text>
  <line x1="64" y1="212" x2="438" y2="212" stroke="#475569" stroke-width="2"/>
  <line x1="64" y1="212" x2="64" y2="38" stroke="#475569" stroke-width="2"/>
  <text x="250" y="239" text-anchor="middle" font-size="12" fill="#475569">加えた固体の質量 w [g]</text>
  <text x="22" y="125" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 125)">発生した気体体積 V [mL]</text>
  <line x1="224" y1="92" x2="224" y2="212" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <line x1="304" y1="62" x2="304" y2="212" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <text x="224" y="226" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563EB">w₁</text>
  <text x="304" y="226" text-anchor="middle" font-size="11" font-weight="bold" fill="#C2593F">w₂</text>
  <polyline points="64,212 224,92 420,92" fill="none" stroke="#2563EB" stroke-width="2.8"/>
  <circle cx="224" cy="92" r="4.5" fill="#1D4ED8"/>
  <text x="348" y="84" font-size="11" font-weight="bold" fill="#1D4ED8">条件A（塩酸 1.0 mol/L）</text>
  <polyline points="64,212 304,62 420,62" fill="none" stroke="#C2593F" stroke-width="2.6" stroke-dasharray="6 3"/>
  <circle cx="304" cy="62" r="4.5" fill="#B91C1C"/>
  <text x="352" y="54" font-size="11" font-weight="bold" fill="#B91C1C">条件B（塩酸 1.5 mol/L）</text>
  <text x="128" y="138" font-size="10.5" font-weight="bold" fill="#0F766E">固体がすべて反応</text>
  <text x="128" y="152" font-size="10" fill="#0F766E">（傾き＝固体1gあたり気体量）</text>
  <text x="330" y="128" font-size="10.5" font-weight="bold" fill="#64748B">塩酸が不足・固体が余る</text>
  <text x="330" y="142" font-size="10" fill="#64748B">（水平値＝H⁺総物質量で決まる）</text>
</svg>
`);

/** 浸透圧と逆浸透法（海水淡水化：半透膜と加圧 P > π）の模式図 */

export const FIG_RATE_YIELD_SHIFT = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="23" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">発熱可逆反応 A + B ⇄ C (ΔH ＜ 0) における生成物 C の物質量の時間変化</text>
  <line x1="62" y1="212" x2="438" y2="212" stroke="#475569" stroke-width="2"/>
  <line x1="62" y1="212" x2="62" y2="38" stroke="#475569" stroke-width="2"/>
  <text x="250" y="239" text-anchor="middle" font-size="12" fill="#475569">反応時間 t</text>
  <text x="22" y="125" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 125)">生成物 C の物質量 [mol]</text>
  <!-- 基準（低温・触媒なし） -->
  <path d="M 62 212 Q 165 72 285 72 L 425 72" fill="none" stroke="#2563EB" stroke-width="2.8"/>
  <text x="348" y="64" font-size="11" font-weight="bold" fill="#1D4ED8">曲線①：基準（温度 T₁・触媒なし）</text>
  <!-- 低温・触媒あり -->
  <path d="M 62 212 Q 102 72 175 72 L 425 72" fill="none" stroke="#059669" stroke-width="2.6" stroke-dasharray="6 3"/>
  <text x="155" y="92" font-size="11" font-weight="bold" fill="#047857">曲線②：T₁＋触媒あり（到達短縮・平衡量同じ）</text>
  <!-- 高温・触媒なし -->
  <path d="M 62 212 Q 95 128 158 128 L 425 128" fill="none" stroke="#DC2626" stroke-width="2.8"/>
  <text x="315" y="146" font-size="11" font-weight="bold" fill="#B91C1C">曲線③：高温 T₂ ＞ T₁（初期傾き急・平衡量減少）</text>
</svg>
`);

/** グリシン（中性アミノ酸）の塩酸塩に NaOH を滴下した二段階滴定曲線とイオン種変化 */

export const FIG_GLYCINE_TITRATION = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 260" font-family="sans-serif">
  <rect width="480" height="260" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="240" y="23" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">陽イオン型グリシン H₃N⁺-CH₂-COOH に NaOH 水溶液を滴下したpH曲線</text>
  <line x1="62" y1="220" x2="448" y2="220" stroke="#475569" stroke-width="2"/>
  <line x1="62" y1="220" x2="62" y2="38" stroke="#475569" stroke-width="2"/>
  <text x="255" y="248" text-anchor="middle" font-size="12" fill="#475569">加えた NaOH の物質量（グリシン 1 mol あたり [mol]）</text>
  <text x="22" y="130" text-anchor="middle" font-size="12" fill="#475569" transform="rotate(-90 22 130)">pH</text>
  <text x="62" y="234" text-anchor="middle" font-size="10.5" fill="#475569">0</text>
  <text x="148" y="234" text-anchor="middle" font-size="10.5" fill="#475569">0.5</text>
  <text x="234" y="234" text-anchor="middle" font-size="11" font-weight="bold" fill="#0F766E">1.0（等電点）</text>
  <text x="320" y="234" text-anchor="middle" font-size="10.5" fill="#475569">1.5</text>
  <text x="406" y="234" text-anchor="middle" font-size="10.5" fill="#475569">2.0</text>
  <line x1="234" y1="220" x2="234" y2="44" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <line x1="62" y1="132" x2="234" y2="132" stroke="#14B8A6" stroke-dasharray="4 3"/>
  <text x="54" y="136" text-anchor="end" font-size="10.5" font-weight="bold" fill="#0F766E">6.0</text>
  <text x="54" y="186" text-anchor="end" font-size="10.5" fill="#475569">2.3</text>
  <text x="54" y="80" text-anchor="end" font-size="10.5" fill="#475569">9.7</text>
  <path d="M 62 204 Q 130 186 218 172 L 234 132 L 250 92 Q 320 80 392 68 L 406 52 L 438 46" fill="none" stroke="#7C3AED" stroke-width="3"/>
  <circle cx="148" cy="184" r="4" fill="#2563EB"/>
  <circle cx="234" cy="132" r="5" fill="#0D9488"/>
  <circle cx="320" cy="80" r="4" fill="#DC2626"/>
  <text x="135" y="168" text-anchor="middle" font-size="10" font-weight="bold" fill="#1D4ED8">pK₁ = 2.3 緩衝域</text>
  <text x="234" y="122" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#0F766E">双性イオン最大 (pI = 6.0)</text>
  <text x="322" y="66" text-anchor="middle" font-size="10" font-weight="bold" fill="#B91C1C">pK₂ = 9.7 緩衝域</text>
</svg>
`);

// --- Wave-3 Multi-Material (Part 6B Style) Common Test SVG Figures ---

/** 酸塩基の中和混合に伴う電気伝導率変化（強酸＋強塩基 vs 弱酸＋弱塩基 vs BaSO₄沈殿生成） */
export const FIG_CONDUCTIVITY_TITRATION = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">酸水溶液 10 mL に同濃度の塩基水溶液を滴下したときの電気伝導率変化</text>
  <line x1="60" y1="210" x2="438" y2="210" stroke="#475569" stroke-width="2"/>
  <line x1="60" y1="210" x2="60" y2="38" stroke="#475569" stroke-width="2"/>
  <text x="250" y="238" text-anchor="middle" font-size="11.5" fill="#475569">塩基水溶液の滴下量 V [mL]</text>
  <text x="20" y="124" text-anchor="middle" font-size="11.5" fill="#475569" transform="rotate(-90 20 124)">電気伝導率 σ</text>
  <line x1="230" y1="210" x2="230" y2="44" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <text x="230" y="224" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#334155">10（中和点）</text>
  <!-- 曲線①: H2SO4 + Ba(OH)2 -> BaSO4沈殿 + 2H2O でほぼ0 -->
  <polyline points="60,54 230,208 420,70" fill="none" stroke="#DC2626" stroke-width="2.8"/>
  <circle cx="230" cy="208" r="4.5" fill="#DC2626"/>
  <text x="122" y="114" font-size="10.5" font-weight="bold" fill="#B91C1C">曲線① (H₂SO₄+Ba(OH)₂)</text>
  <!-- 曲線②: HCl + NaOH -> NaCl残存でV字(極小>0) -->
  <polyline points="60,64 230,142 420,82" fill="none" stroke="#2563EB" stroke-width="2.6"/>
  <text x="335" y="128" font-size="10.5" font-weight="bold" fill="#1D4ED8">曲線② (HCl+NaOH)</text>
  <!-- 曲線③: CH3COOH + NH3 -> 弱電解質→強電解質塩で上昇→横ばい -->
  <polyline points="60,194 230,136 420,134" fill="none" stroke="#059669" stroke-width="2.6" stroke-dasharray="6 3"/>
  <text x="136" y="188" font-size="10.5" font-weight="bold" fill="#047857">曲線③ (CH₃COOH+NH₃)</text>
</svg>
`);

/** 気体状態方程式・圧縮因子 Z = PV/(nRT) の実在気体グラフ（CH₄・CO₂・H₂ と温度比較） */
export const FIG_COMPRESSIBILITY_FACTOR = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#2A3B4C">実在気体の圧縮因子 Z ＝ PV / (nRT) と圧力 P の関係</text>
  <line x1="60" y1="210" x2="440" y2="210" stroke="#475569" stroke-width="2"/>
  <line x1="60" y1="210" x2="60" y2="38" stroke="#475569" stroke-width="2"/>
  <line x1="60" y1="126" x2="438" y2="126" stroke="#334155" stroke-width="1.8" stroke-dasharray="5 3"/>
  <text x="52" y="130" text-anchor="end" font-size="11" font-weight="bold" fill="#334155">1.0</text>
  <text x="388" y="120" font-size="10.5" font-weight="bold" fill="#334155">理想気体 (Z=1)</text>
  <text x="250" y="238" text-anchor="middle" font-size="11.5" fill="#475569">圧力 P [×10⁷ Pa]</text>
  <text x="20" y="124" text-anchor="middle" font-size="11.5" fill="#475569" transform="rotate(-90 20 124)">Z = PV / (nRT)</text>
  <!-- H2: 分子間力極小 → 常に Z > 1 -->
  <path d="M 60 126 L 426 84" fill="none" stroke="#059669" stroke-width="2.6"/>
  <text x="330" y="84" font-size="10.5" font-weight="bold" fill="#047857">曲線ア：H₂ (300 K)</text>
  <!-- CH4 高温: へこみ小 -->
  <path d="M 60 126 Q 150 146 250 126 T 426 68" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-dasharray="6 3"/>
  <text x="328" y="58" font-size="10.5" font-weight="bold" fill="#1D4ED8">曲線イ：CH₄ (500 K)</text>
  <!-- CH4 低温: 分子間力で大きく下に凸 → 高圧で排除体積により Z>1 -->
  <path d="M 60 126 Q 145 194 240 156 Q 325 118 426 56" fill="none" stroke="#DC2626" stroke-width="2.8"/>
  <text x="165" y="192" font-size="10.5" font-weight="bold" fill="#B91C1C">曲線ウ：CH₄ (250 K)</text>
</svg>
`);

/** カラムクロマトグラフィー／イオン交換樹脂の溶出曲線（アミノ酸混合液の段階 pH 溶出） */
export const FIG_AMINO_ELUTION_PROFILE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="#2A3B4C">陽イオン交換樹脂カラム（Na⁺型）によるアミノ酸3種混合物の段階 pH 溶出曲線</text>
  <line x1="58" y1="208" x2="442" y2="208" stroke="#475569" stroke-width="2"/>
  <line x1="58" y1="208" x2="58" y2="42" stroke="#475569" stroke-width="2"/>
  <text x="250" y="238" text-anchor="middle" font-size="11.5" fill="#475569">溶出液の体積 V（pH 3.2 → pH 4.5 → pH 9.5 へ段階上昇）</text>
  <text x="20" y="125" text-anchor="middle" font-size="11" fill="#475569" transform="rotate(-90 20 125)">ニンヒドリン吸光度</text>
  <!-- 区切り線 -->
  <line x1="185" y1="208" x2="185" y2="48" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <line x1="315" y1="208" x2="315" y2="48" stroke="#94A3B8" stroke-dasharray="4 3"/>
  <text x="122" y="56" text-anchor="middle" font-size="10" font-weight="bold" fill="#475569">緩衝液Ⅰ (pH 3.2)</text>
  <text x="250" y="56" text-anchor="middle" font-size="10" font-weight="bold" fill="#475569">緩衝液Ⅱ (pH 4.5)</text>
  <text x="380" y="56" text-anchor="middle" font-size="10" font-weight="bold" fill="#475569">緩衝液Ⅲ (pH 9.5)</text>
  <!-- ピーク X, Y, Z -->
  <path d="M 65 208 L 95 208 Q 120 70 145 208 L 215 208 Q 248 64 280 208 L 340 208 Q 375 76 410 208 L 436 208" fill="none" stroke="#7C3AED" stroke-width="2.8"/>
  <text x="120" y="112" text-anchor="middle" font-size="11" font-weight="bold" fill="#B91C1C">ピークX</text>
  <text x="248" y="106" text-anchor="middle" font-size="11" font-weight="bold" fill="#1D4ED8">ピークY</text>
  <text x="375" y="114" text-anchor="middle" font-size="11" font-weight="bold" fill="#047857">ピークZ</text>
</svg>
`);

/** 金属イオンのアンモニア水／NaOH水滴下時の沈殿量グラフ（Al³⁺・Zn²⁺・Cu²⁺・Fe³⁺） */
export const FIG_PRECIPITATE_EXCESS_CURVE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 250" font-family="sans-serif">
  <rect width="470" height="250" rx="12" fill="#FCFBF8" stroke="#E2DDD3"/>
  <text x="235" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="#2A3B4C">同物質量の金属イオン水溶液にアンモニア水を過剰まで滴下したときの沈殿物質量</text>
  <line x1="60" y1="210" x2="440" y2="210" stroke="#475569" stroke-width="2"/>
  <line x1="60" y1="210" x2="60" y2="40" stroke="#475569" stroke-width="2"/>
  <text x="250" y="238" text-anchor="middle" font-size="11.5" fill="#475569">加えた NH₃ の物質量 [mol]</text>
  <text x="22" y="125" text-anchor="middle" font-size="11.5" fill="#475569" transform="rotate(-90 22 125)">沈殿の物質量 [mol]</text>
  <!-- Al3+: 3当量で最大→過剰NH3でも溶けない -->
  <polyline points="60,210 195,82 428,82" fill="none" stroke="#2563EB" stroke-width="2.8"/>
  <text x="332" y="73" font-size="10.5" font-weight="bold" fill="#1D4ED8">曲線①（過剰NH₃で不溶）</text>
  <!-- Zn2+ / Cu2+: 2当量で最大→さらに4当量NH3で錯イオン溶解 -->
  <polyline points="60,210 150,82 330,210 428,210" fill="none" stroke="#DC2626" stroke-width="2.8" stroke-dasharray="6 3"/>
  <text x="242" y="136" font-size="10.5" font-weight="bold" fill="#B91C1C">曲線②（錯イオン形成で再溶解）</text>
  <text x="150" y="224" text-anchor="middle" font-size="10" fill="#475569">2n₀</text>
  <text x="195" y="224" text-anchor="middle" font-size="10" fill="#475569">3n₀</text>
  <text x="330" y="224" text-anchor="middle" font-size="10" fill="#475569">6n₀</text>
</svg>
`);

