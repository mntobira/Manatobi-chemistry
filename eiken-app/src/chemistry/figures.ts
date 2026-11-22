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
