/**
 * まなとび英検 リスニング「最低限の撮り直し対象」生成スクリプト
 * -------------------------------------------------------------------
 * 全 3,285 音源を網羅監査し、試験問題として本当に作り直し（再収録）が必要な最低限の音源だけを対象に：
 *   1. 修正後の自然な英語台本（turns）＋設問（questionPrompt）＋選択肢（choices）＋正解（answer）＋和訳・解説
 *   2. そのまま Manus / ElevenLabs 音声制作パイプラインに流せるプロンプト帳（TXT / JSON / CSV）
 * を `deliverables/listening_retake_minimal/` に出力する。
 *
 * 【厳選基準（計 199 件 / 3,285 件 = 全体の 6.06%）】
 *  - Tier A（最優先・問題破綻：166件）
 *      A1: 同一回内の完全重複パッセージ 150件（準2級プラス 第2部 No.26〜30 ×15回＝75件、2級 第2部 No.26〜30 ×15回＝75件）
 *          → No.21〜25と一言一句同じ問題が同じ回の後半にもう一度出てしまっているため、5つの完全新規オリジナルパッセージに刷新（正解番号 targetAnswer は既存と同一を維持！）
 *      A2: 業種・作物・施設の組み合わせ矛盾 16件（準2級プラス 12件、2級 4件）
 *          → 書店やオーディオ店で規格外果物箱、劇場や桟橋で「朝食カードに客室番号」、緑茶・新じゃが・ほうれん草を「その果物（the fruit）」と呼ぶ矛盾を、店舗・作物・施設に合った自然な英文に修正
 *  - Tier B（英文法・数詞・台本崩壊：33件）
 *      B1: 5級 テンプレート変数残骸 1件（r01_part1_06 `Supper for round tonight` → `Supper for tonight`）
 *      B2: 4級 代名詞衝突の英文崩壊 4件（r04〜r07_part1_01 `do you want me to lend me...` → `would you like me to...` / `shall I...`）
 *      B3: 4級 自分の家族を Her/His と呼ぶ誤り 15件（r01〜r15_part2_07 `Her older sister caught a cold, so I went` → `My older sister...`）
 *      B4: 4級 冠詞ミス 1件（r05_part3_03 `a orange cat` → `an orange cat`）
 *      B5: 3級・準2級 存在しない英語数詞 `forty-10`〜`forty-15` 計12件（3級 r10〜r15_part3_08 6件 ＋ 準2級 r10〜r15_part3_08 6件）
 *
 *  ※参考：Tier C（会話の言い淀み・二重疑問文：75件）も別枠の任意リストとして参考収録するが、
 *    「最低限これだけ直せば模試として破綻ゼロになる」必須ラインは上記 Tier A + Tier B の【199件】（最優先の重複＋矛盾だけなら166件）に絞っている。
 */

import fs from 'node:fs';
import path from 'node:path';
import { ALL_LISTENING_EXAMS } from '../src/eiken/materials/listening-booklets';
import { LISTENING_BLUEPRINTS, type DialogueTurn, type ListeningAudioUnit, type ListeningExamRound } from '../src/eiken/listeningExamCore';
import { placeCorrectAt } from '../src/eiken/materials/listening-helpers';

const OUT_DIR = path.resolve(process.cwd(), 'deliverables/listening_retake_minimal');
fs.mkdirSync(OUT_DIR, { recursive: true });

interface RetakeItem {
  tier: 'TierA_必須_重複と内容矛盾' | 'TierB_必須_英文法と数詞ミス' | 'TierC_任意_言い淀みと二重質問';
  reasonCategory: string;
  issueSummaryJa: string;
  grade: string;
  gradeLabel: string;
  round: number;
  part: string;
  unitIndex: number;
  questionNumber: number;
  audioId: string;
  targetMp3Name: string;
  wpmRange: readonly [number, number];
  styleHint: string;
  readCount: number;
  speakerAssignment: string;
  oldTurns: readonly DialogueTurn[];
  newTurns: readonly DialogueTurn[];
  oldQuestionPrompt: string;
  newQuestionPrompt: string;
  oldChoices: readonly string[];
  newChoices: readonly string[];
  answerIndex: number; // 0-based (preserved so answer keys don't shift!)
  answerNumber: number; // 1-based
  newTranslationJa: string;
  newExplanationJa: string;
  newDistractorReasonsJa: readonly string[];
  newEvidence: string;
}

const STYLE_BY_GRADE: Record<string, string> = {
  eiken_5: 'clear, speaking slowly',
  eiken_4: 'clear, speaking slowly',
  eiken_3: 'clear, speaking slowly',
  eiken_pre2: 'clear and natural',
  eiken_pre2plus: 'clear and natural',
  eiken_2: 'clear and natural',
  eiken_pre1: 'clear, natural pace',
  eiken_1: 'clear, natural pace',
};

function formatSpeakerAssignment(turns: readonly DialogueTurn[]): string {
  return turns.map(t => `${t.roleLabel}=${t.speaker}`).join(' / ');
}

// ============================================================================
// Replacement generators for Tier A1: Pre-2 Plus & Grade 2 Part 2 No.26-30 (u=11..15)
// ============================================================================
function buildFreshMidPart2CloneReplacement(
  grade: 'eiken_pre2plus' | 'eiken_2',
  round: number,
  u: number, // 11..15
  existingUnit: ListeningAudioUnit,
): Omit<RetakeItem, 'tier' | 'reasonCategory' | 'issueSummaryJa' | 'grade' | 'gradeLabel' | 'round' | 'part' | 'unitIndex' | 'questionNumber' | 'audioId' | 'targetMp3Name' | 'wpmRange' | 'styleHint' | 'readCount' | 'oldTurns' | 'oldQuestionPrompt' | 'oldChoices'> {
  const isG2 = grade === 'eiken_2';
  const rIdx = round - 1;
  const targetAnswer = existingUnit.questions[0].answer;
  const narratorSpeaker = existingUnit.turns[0].speaker; // Keep exact M1/F1 narrator assignment!

  // 5 completely distinct, 100% original topic families for u=11..15 (never overlapping u=1..10!)
  const builders = [
    // u=11 (No.26): 地域交通・コミュニティバスの路線/ダイヤ改定
    () => {
      const lines = isG2
        ? ['Harbor Circular Bus', 'Westside Commuter Shuttle', 'Valley Metro Tram', 'Airport Express Coach', 'Northbay Ferry Link']
        : ['Green Loop Bus', 'Hillside Town Shuttle', 'Riverbank Mini Tram', 'Station South Bus', 'Bayside Park Shuttle'];
      const linesJa = isG2
        ? ['ハーバー循環バス', 'ウエストサイド通勤シャトル', 'バレーメトロ路面電車', '空港リムジンバス', 'ノースベイ連絡フェリー']
        : ['グリーン循環バス', 'ヒルサイド町内シャトル', 'リバーバンク小型トラム', '駅南口バス', 'ベイサイド公園シャトル'];
      const updates = isG2
        ? [
            ['add an express stop in front of the Municipal Hospital', '市立病院前に急行停留所を新設する'],
            ['extend Friday night service until eleven thirty p.m.', '金曜夜間の運行を午後11時30分まで延長する'],
            ['allow passengers to tap credit cards directly at the fare gate', '改札口でクレジットカードのタッチ決済を直接利用できるようにする'],
          ]
        : [
            ['run every ten minutes instead of twenty during morning rush hours', '朝の通勤時間帯は20分間隔から10分間隔に増便する'],
            ['stop directly in front of the new Sports Complex entrance', '新しい総合体育館の正面入口前に直接停車する'],
            ['offer half-price weekend fares for students with a school ID', '生徒証を提示した学生向けに週末運賃を半額にする'],
          ];
      const months = ['April first', 'May first', 'June first', 'July first', 'September first', 'October first', 'November first', 'December first', 'January tenth', 'February first', 'March first', 'April fifteenth', 'May fifteenth', 'June fifteenth', 'October fifteenth'];
      const ln = lines[rIdx % 5];
      const lnJa = linesJa[rIdx % 5];
      const [upEn, upJa] = updates[Math.floor(rIdx / 5) % 3];
      const body = `Passenger notice from the City Transit Bureau. Starting ${months[rIdx]}, the ${ln} will update its timetable based on rider feedback collected this winter. Under the revised schedule, the service will ${upEn.replace(/\.+$/, '')}. Printed pocket timetables are now available at all ticket counters.`;
      const prompt = `What change will be made to the ${ln}?`;
      const placed = placeCorrectAt(
        `It will ${upEn.replace(/\.+$/, '')}.`,
        `the service will ${upEn} と改定内容が明言されている。`,
        [
          'It will suspend all weekday operations for a year.',
          'It will double ticket fares for senior citizens.',
          'It will require seat reservations two weeks ahead.',
        ],
        [
          `${lnJa}が平日の運行を1年間休止するとは案内されていない。`,
          '高齢者向けの運賃を2倍にするという話は出ていない。',
          '2週間前の座席予約を必須にするという変更もない。',
        ],
        targetAnswer,
      );
      return {
        body,
        prompt,
        placed,
        ja: `市交通局からの案内。今冬の利用者アンケートを受け、${lnJa}はダイヤ改定により「${upJa}」ことになった。`,
        exp: `Under the revised schedule, the service will ${upEn}（${upJa}）の改定点を聞き取る。`,
        ev: `the service will ${upEn}`,
      };
    },
    // u=12 (No.27): 博物館・展示会・特別企画の見どころ
    () => {
      const museums = isG2
        ? ['Maritime Science Museum', 'National Textile Gallery', 'Modern Design Pavilion', 'Geological Heritage Hall', 'Astronomical Archive Center']
        : ['City Toy Museum', 'Harbor Nature Hall', 'Sunrise Railway Museum', 'Forest Craft Gallery', 'Starlight Science Dome'];
      const museumsJa = isG2
        ? ['海洋科学博物館', '国立染織ギャラリー', '近代デザインパビリオン', '地質遺産ホール', '天文アーカイブセンター']
        : ['市立おもちゃ博物館', 'ハーバー自然館', 'サンライズ鉄道博物館', '森の工芸ギャラリー', 'スターライト科学ドーム'];
      const features = isG2
        ? [
            ['visitors can operate a working replica of an eighteenth-century navigation clock', '18世紀の航海時計の稼働レプリカを来場者自身が操作できる'],
            ['audio commentary was recorded by the engineers who restored the original machines', '修復を担当した技師自身が録音した音声解説を聞ける'],
            ['guided evening tours include access to the conservation studio on Floor Three', '夜間ガイドツアーでは3階の保存修復スタジオにも入れる'],
          ]
        : [
            ['visitors can touch real meteorites displayed on the center table', '中央テーブルに展示された本物の隕石に触れることができる'],
            ['children can build and test a small wooden glider in the workshop corner', '工作コーナーで小型の木製グライダーを作って飛ばせる'],
            ['every guest receives an illustrated stamp booklet at the entrance gate', '入場ゲートでイラスト入りのスタンプ帳が全員に配られる'],
          ];
      const seasons = ['this Saturday', 'next Tuesday', 'this Friday', 'next weekend', 'on May tenth', 'on June fifth', 'this Thursday', 'next Monday', 'on October third', 'this Sunday', 'next Wednesday', 'on April twelfth', 'on July eighth', 'this holiday Monday', 'on November second'];
      const mu = museums[rIdx % 5];
      const muJa = museumsJa[rIdx % 5];
      const [ftEn, ftJa] = features[(Math.floor(rIdx / 5) + 1) % 3];
      const body = `Welcome to Cultural Weekly. Opening ${seasons[rIdx]}, the ${mu} will host a special three-month exhibition. Unlike past displays where items stayed behind glass cases, this time ${ftEn}. Admission tickets can be booked online with no booking fee.`;
      const prompt = `What is special about the upcoming exhibition at the ${mu}?`;
      const placed = placeCorrectAt(
        ftEn[0].toUpperCase() + ftEn.slice(1) + '.',
        `Unlike past displays ..., this time ${ftEn} と今回の特別展示ならではの特徴が述べられている。`,
        [
          'Photography with flash is required in every hall.',
          'Only university professors are permitted to enter.',
          'The museum will move permanently to another city.',
        ],
        [
          'すべての展示室でフラッシュ撮影が義務づけられているとは述べられていない。',
          '大学教授しか入場できないという制限はない。',
          `${muJa}が別の都市へ恒久移転するという話もない。`,
        ],
        targetAnswer,
      );
      return {
        body,
        prompt,
        placed,
        ja: `${muJa}で始まる3か月間の特別展の紹介。従来のガラスケース展示とは異なり、今回は「${ftJa}」のが特徴。`,
        exp: `Unlike past displays ..., this time ${ftEn}（${ftJa}）で強調される新企画の特徴を聞き取る。`,
        ev: `this time ${ftEn}`,
      };
    },
    // u=13 (No.28): 職場・学校の省エネ・業務改善の取り組み結果
    () => {
      const orgs = isG2
        ? ['Midland Publishing Group', 'Northstar Logistics Office', 'Crestview Medical Clinic', 'Pacific Engineering Corp', 'Bayside Municipal Hall']
        : ['Maple High School', 'Clover Junior High', 'Sunrise Community Library', 'Westgate Youth Center', 'Harbor Cooking School'];
      const orgsJa = isG2
        ? ['ミッドランド出版グループ', 'ノーススター物流オフィス', 'クレストビュー医療クリニック', 'パシフィック技術社', 'ベイサイド市庁舎']
        : ['メイプル高校', 'クローバー中学校', 'サンライズ地域図書館', 'ウエストゲート青少年センター', 'ハーバー料理学校'];
      const results = isG2
        ? [
            ['monthly paper consumption dropped by nearly forty percent within one quarter', '1四半期のうちに月間の紙使用量が約40%削減された'],
            ['afternoon cooling electricity costs fell by twenty percent without discomfort', '快適さを損なわずに午後の冷房電力費が20%下がった'],
            ['staff overtime on Fridays decreased by an average of forty-five minutes', '金曜日の職員の平均残業時間が45分短縮された'],
          ]
        : [
            ['forgotten umbrellas and jackets in the Lost and Found fell by half', '忘れ物コーナーの傘や上着が半分に減った'],
            ['students returned ninety-five percent of library books before the due date', '生徒の95%が返却期限までに図書館の本を返すようになった'],
            ['plastic cup waste during school events dropped by sixty percent', '学校行事でのプラスチックコップごみが60%減った'],
          ];
      const spans = ['Last autumn', 'Six months ago', 'Early this spring', 'Last January', 'Four months ago', 'Last September', 'Earlier this year', 'Last November', 'Three months back', 'Last spring', 'Five months ago', 'Last October', 'At the start of this term', 'Last winter', 'Two quarters ago'];
      const og = orgs[rIdx % 5];
      const ogJa = orgsJa[rIdx % 5];
      const [resEn, resJa] = results[(Math.floor(rIdx / 5) + 2) % 3];
      const body = `${spans[rIdx]}, ${og} introduced a small workflow change suggested by its staff committee. At first, several members doubted such a simple rule would make any noticeable difference. However, an internal review released yesterday confirmed that ${resEn}.`;
      const prompt = `What did the internal review at ${og} confirm?`;
      const placed = placeCorrectAt(
        resEn[0].toUpperCase() + resEn.slice(1) + '.',
        `confirmed that ${resEn} と改善結果が明確に報告されている。`,
        [
          'The new rule was abandoned after just two days.',
          'Operating expenses rose by fifty percent.',
          'Half of the staff transferred to another branch.',
        ],
        [
          '2日で廃止されたのではなく、明確な成果が確認されている。',
          '運営経費が50%増加したとは述べられていない。',
          '職員の半数が他拠点へ異動したという事実もない。',
        ],
        targetAnswer,
      );
      return {
        body,
        prompt,
        placed,
        ja: `${ogJa}が導入した業務改善の検証結果。当初は効果を疑問視する声もあったが、昨日の内部調査で「${resJa}」ことが確認された。`,
        exp: `However, an internal review ... confirmed that ${resEn}（${resJa}）の成果を聞き取る。`,
        ev: `confirmed that ${resEn}`,
      };
    },
    // u=14 (No.29): アウトドア・スポーツ・地域イベント参加時の事前連絡
    () => {
      const events = isG2
        ? ['Autumn Ridge Trail Walk', 'Harbor Charity Cycling Tour', 'Lakeside Botanical Sketch Day', 'Coastal Birdwatching Excursion', 'Highland Stargazing Camp']
        : ['Riverbank Clean-Up Walk', 'Junior Park Relay Run', 'Sunset Beach Picnic', 'Saturday Canoe Lesson', 'Forest Berry Picking Tour'];
      const eventsJa = isG2
        ? ['オータムリッジ自然歩道ウォーク', 'ハーバー・チャリティーサイクリング', '湖畔の植物スケッチ会', '沿岸バードウォッチング遠足', '高原星空観察キャンプ']
        : ['川岸クリーンウォーク', 'ジュニア公園リレー走', 'サンセットビーチ・ピクニック', '土曜カヌー体験教室', '森のベリー摘みツアー'];
      const actions = isG2
        ? [
            ['board the organizer shuttle at North Gate instead of driving private cars', '自家用車での来場は控え、北口から主催者シャトルバスに乗車する'],
            ['bring a refillable metal bottle because single-use cups are not provided', '使い捨てコップの配布がないため詰め替え可能な水筒を持参する'],
            ['check in at the yellow tent thirty minutes before their assigned start group', '割り当てられた出発グループの30分前までに黄色いテントで受付を済ませる'],
          ]
        : [
            ['wear long-sleeved shirts to protect against tall grass along the path', '道沿いの背の高い草で肌を傷めないよう長袖シャツを着用する'],
            ['write an emergency phone number on the back of their name tag', '名札の裏面に緊急連絡先の電話番号を記入しておく'],
            ['meet in front of the park clock tower fifteen minutes before nine', '9時の15分前までに公園の時計台前に集合する'],
          ];
      const callers = [
        'the North Park event desk', 'the organizing committee', 'the city recreation office', 'the outdoor club coordinator', 'the Saturday tour staff',
        'the Harbor Trail office', 'the weekend sports desk', 'the lakeside park team', 'the coastal guide center', 'the highland camp office',
        'the greenway walk desk', 'the youth relay committee', 'the beach picnic staff', 'the canoe club counter', 'the forest tour desk',
      ];
      const ev = events[rIdx % 5];
      const evJa = eventsJa[rIdx % 5];
      const [acEn, acJa] = actions[Math.floor(rIdx / 5) % 3];
      const body = `Hello, this is ${callers[rIdx]} calling with a reminder for everyone registered in tomorrow's ${ev}. Weather conditions look clear and pleasant all day. Because parking and supplies on site are limited, all participants are asked to ${acEn}. We look forward to seeing you tomorrow!`;
      const prompt = `What are participants in tomorrow's ${ev} asked to do?`;
      const placed = placeCorrectAt(
        acEn[0].toUpperCase() + acEn.slice(1) + '.',
        `all participants are asked to ${acEn} と参加者へのお願いが明言されている。`,
        [
          'Postpone their trip until next weekend due to storms.',
          'Pay an extra cash fee of three thousand yen at the gate.',
          'Mail their medical certificates to City Hall next month.',
        ],
        [
          '明日は一日晴天の見込みであり、嵐による来週末への延期ではない。',
          'ゲートで3,000円の追加現金を払うようには求められていない。',
          '来月市役所に診断書を郵送するという指示も出ていない。',
        ],
        targetAnswer,
      );
      return {
        body,
        prompt,
        placed,
        ja: `明日の「${evJa}」登録者へのリマインド連絡。当日は好天の見込みだが、現地の駐車枠や備品に限りがあるため「${acJa}」よう求めている。`,
        exp: `all participants are asked to ${acEn}（${acJa}）の具体的な事前指示を聞き取る。`,
        ev: `asked to ${acEn}`,
      };
    },
    // u=15 (No.30): テクノロジー・生活科学・食品保存のミニ解説
    () => {
      const topics = isG2
        ? [
            ['storing cut herbs in a jar with a damp paper towel', 'keeps leaves crisp nearly twice as long as leaving them in open fridge trays', '切ったハーブを湿らせたキッチンペーパーと一緒に瓶に入れる方法', '冷蔵庫の開いたトレイに置くより約2倍長く鮮度を保てる'],
            ['preheating cast-iron pans gradually over medium-low heat', 'prevents uneven hot spots and stops delicate fish fillets from sticking', '鋳鉄フライパンを弱めの中火でゆっくり予熱する方法', '温度ムラを防ぎ崩れやすい魚の切り身が焦げつかなくなる'],
            ['drying wet leather shoes with crumpled newspaper at room temperature', 'draws out inner moisture without cracking the leather fibers like hair dryers do', '濡れた革靴に丸めた新聞紙を詰めて室温で乾かす方法', 'ドライヤーのように革繊維をひび割れさせず内部の湿気を吸い取れる'],
            ['rinsing freshly brewed cold tea bottles with baking soda water', 'removes bitter tannin film without leaving lingering soap odors', '水出し茶のボトルを重曹水ですすぐ手入れ法', '洗剤のにおいを残さず渋みの茶渋膜を落とせる'],
            ['placing a wooden spoon across a pot of simmering pasta water', 'breaks surface bubbles before starchy foam can spill over the rim', 'ゆで鍋の上に木べらを1本渡しておく工夫', 'デンプンの泡がふちから吹きこぼれる前に表面の泡をつぶせる'],
          ]
        : [
            ['wrapping bananas at the stem with a small piece of plastic wrap', 'slows down ripening gas so the fruit stays yellow for several extra days', 'バナナの房の付け根を少量のラップで包む工夫', '追熟ガスの放出を抑えて数日間長く黄色い状態を保てる'],
            ['putting a slice of white bread inside a jar of hardened brown sugar', 'restores soft moisture overnight so the sugar is easy to scoop again', '固まった黒砂糖の瓶に食パンを1切れ入れる工夫', '一晩で適度な湿り気が戻り再びすくいやすくなる'],
            ['washing canvas sneakers in cold water instead of hot water', 'prevents the cotton fabric from shrinking and keeps colors bright', '布製スニーカーをお湯ではなく水で洗う方法', '綿生地の縮みを防ぎ色あせも抑えられる'],
            ['placing apples in a separate drawer away from leafy green salads', 'keeps lettuce leaves from turning brown prematurely in the refrigerator', 'リンゴを葉物野菜と別の引き出しに分けて保存する工夫', '冷蔵庫内のレタスが早く茶色く傷むのを防げる'],
            ['soaking peeled potatoes in cold water for fifteen minutes before frying', 'removes excess surface starch so homemade fries turn golden and crisp', '皮をむいたジャガイモを揚げる前に15分間冷水にさらす方法', '表面の余分なデンプンが落ちてカリッと黄金色に揚がる'],
          ];
      const [tpEn, effEn, tpJa, effJa] = topics[rIdx % 5];
      const leads = [
        'In today\'s household science corner,',
        'Welcome to Practical Living Tips.',
        'On Kitchen and Home Minute today,',
        'Listeners of Daily Science,',
        'Here is a useful everyday tip:',
        'Good morning from Smart Home Radio.',
        'In this week\'s consumer lab note,',
        'Welcome back to Everyday Chemistry.',
        'Today on Modern Homemaker Digest,',
        'Here is a quick food-science fact:',
        'Thank you for tuning in to Life Hacks.',
        'In our Tuesday kitchen experiment,',
        'From the Home Economics Desk today,',
        'Curious minds often ask our staff:',
        'On Weekend Living Spotlight today,',
      ];
      const body = `${leads[rIdx]} Food and material specialists often test traditional home habits in the lab. Many people assume special chemical sprays or expensive gadgets are necessary, yet tests show that ${tpEn} ${effEn}. Anyone can try this simple method today.`;
      const prompt = `According to the talk, what is the benefit of ${tpEn}?`;
      const placed = placeCorrectAt(
        `It ${effEn}.`,
        `tests show that ${tpEn} ${effEn} と科学的な効果が説明されている。`,
        [
          'It doubles the weight of ingredients in five minutes.',
          'It eliminates the need for refrigerators altogether.',
          'It makes cookware last for five hundred years.',
        ],
        [
          '5分で食材の重さが2倍になるという説明はない。',
          '冷蔵庫自体が完全に不要になるとは述べていない。',
          '調理器具が500年持つようになるという誇張も本文にない。',
        ],
        targetAnswer,
      );
      return {
        body,
        prompt,
        placed,
        ja: `生活科学のミニ解説。高価な道具を使わなくても、「${tpJa}」だけで「${effJa}」ことが実験で確かめられている。`,
        exp: `tests show that ${tpEn} ${effEn}（${effJa}）の実用効果を聞き取る。`,
        ev: effEn,
      };
    },
  ];

  const built = builders[u - 11]();
  const newTurns: DialogueTurn[] = [
    { speaker: narratorSpeaker, roleLabel: 'Narrator', text: built.body },
    { speaker: 'F2', roleLabel: 'Narrator', text: `Question. ${built.prompt}` },
  ];

  return {
    speakerAssignment: formatSpeakerAssignment(newTurns),
    newTurns,
    newQuestionPrompt: built.prompt,
    newChoices: built.placed.choices,
    answerIndex: built.placed.answer,
    answerNumber: built.placed.answer + 1,
    newTranslationJa: built.ja,
    newExplanationJa: built.exp,
    newDistractorReasonsJa: built.placed.reasons,
    newEvidence: built.ev,
  };
}

// ============================================================================
// Replacement helper for Tier A2: Semantic contradictions in Part 2 No.23-25
// ============================================================================
function buildSemanticFixForMidPart2(
  grade: 'eiken_pre2plus' | 'eiken_2',
  round: number,
  u: number, // 8, 9, or 10
  existingUnit: ListeningAudioUnit,
): Omit<RetakeItem, 'tier' | 'reasonCategory' | 'issueSummaryJa' | 'grade' | 'gradeLabel' | 'round' | 'part' | 'unitIndex' | 'questionNumber' | 'audioId' | 'targetMp3Name' | 'wpmRange' | 'styleHint' | 'readCount' | 'oldTurns' | 'oldQuestionPrompt' | 'oldChoices'> {
  const isG2 = grade === 'eiken_2';
  const q0 = existingUnit.questions[0];
  const targetAnswer = q0.answer;
  const narratorSpeaker = existingUnit.turns[0].speaker;
  const oldBody = existingUnit.turns[0].text;

  if (u === 8) {
    // Store announcement: match the benefit to the actual store industry!
    const storeMap: Record<string, { perkEn: string; perkJa: string; storeJa: string }> = {
      'Nordic Home Furnishings': {
        storeJa: 'ノルディック家具店',
        perkEn: 'borrow fabric and wood color samples for three days before ordering furniture',
        perkJa: '家具を注文する前に生地や木材の色見本を3日間無料で借りられる',
      },
      'BookBridge Stores': {
        storeJa: 'ブックブリッジ書店',
        perkEn: 'trade in gently used hardcover books for twenty-percent discount coupons',
        perkJa: '状態の良い単行本を下取りに出すと20%割引クーポンを受け取れる',
      },
      'EcoWardrobe Apparel': isG2
        ? {
            storeJa: 'エコワードローブ衣料店',
            perkEn: 'receive free hemming and button repairs on any coat or jacket bought here',
            perkJa: '当店で購入したコートやジャケットの裾上げ・ボタン修理を無料で受けられる',
          }
        : {
            storeJa: 'エコワードローブ衣料店',
            perkEn: 'bring clean cotton shirts for recycling to get a three-hundred-yen coupon',
            perkJa: '清潔な綿シャツをリサイクルに持参すると300円分のクーポンがもらえる',
          },
      'SunRay Electronics': isG2
        ? {
            storeJa: 'サンレイ電器',
            perkEn: 'recycle old smartphone chargers and batteries in exchange for store points',
            perkJa: '古いスマホ充電器や電池をリサイクルに出すと店舗ポイントと交換できる',
          }
        : {
            storeJa: 'サンレイ電器',
            perkEn: 'get a free protective screen film installed when buying a tablet or phone',
            perkJa: 'タブレットやスマホの購入時に保護フィルムの無料貼り付けサービスを受けられる',
          },
      'DailyBean Roasters': {
        storeJa: 'デイリービーン焙煎所',
        perkEn: 'get forty yen off any freshly brewed coffee when bringing a reusable tumbler',
        perkJa: 'マイタンブラーを持参すると淹れたてコーヒーが全品40円引きになる',
      },
      'Terra Outdoor Gear': isG2
        ? {
            storeJa: 'テラ・アウトドア用品店',
            perkEn: 'rent waterproof hiking tents for a weekend before deciding to buy one',
            perkJa: '購入を決める前に防水登山テントを週末にお試しレンタルできる',
          }
        : {
            storeJa: 'テラ・アウトドア用品店',
            perkEn: 'have hiking backpack zippers and straps inspected andadjusted for free'.replace('andadjusted', 'and adjusted'),
            perkJa: '登山リュックのファスナーやベルトの無料点検・調整を受けられる',
          },
      'ClearSound Audio': {
        storeJa: 'クリアサウンドオーディオ',
        perkEn: 'test noise-canceling headphones at home for three days before purchasing',
        perkJa: '購入前にノイズキャンセリングヘッドホンを自宅で3日間試聴できる',
      },
    };
    const storeName = Object.keys(storeMap).find(k => oldBody.includes(k))!;
    const spec = storeMap[storeName];
    const body = `Customer announcement from ${storeName}: starting this Friday, we are launching our Sustainable Shopper Program. Members who sign up for free at the register can ${spec.perkEn}. Staff at the service counter will be happy to explain the details.`;
    const prompt = `What benefit do members of ${storeName}'s new program get?`;
    const placed = placeCorrectAt(
      `They can ${spec.perkEn}.`,
      `Members who sign up ... can ${spec.perkEn}. と業種に合った特典が明言されている。`,
      [
        'They get every item in the store free on Mondays.',
        'They receive same-hour delivery by charter helicopter.',
        'They can use the staff office as a private lounge.',
      ],
      [
        `${spec.storeJa}で月曜に全品無料になるという特典はない。`,
        'ヘリコプターによる配送サービスは案内されていない。',
        'スタッフルームを専用ラウンジとして使えるという話もない。',
      ],
      targetAnswer,
    );
    return {
      speakerAssignment: formatSpeakerAssignment([
        { speaker: narratorSpeaker, roleLabel: 'Narrator', text: body },
        { speaker: 'F2', roleLabel: 'Narrator', text: `Question. ${prompt}` },
      ]),
      newTurns: [
        { speaker: narratorSpeaker, roleLabel: 'Narrator', text: body },
        { speaker: 'F2', roleLabel: 'Narrator', text: `Question. ${prompt}` },
      ],
      newQuestionPrompt: prompt,
      newChoices: placed.choices,
      answerIndex: placed.answer,
      answerNumber: placed.answer + 1,
      newTranslationJa: `${spec.storeJa}で今週金曜から始まる新プログラム。無料登録した会員は「${spec.perkJa}」特典を利用できる。`,
      newExplanationJa: `${spec.storeJa}の案内で Members ... can ${spec.perkEn}（${spec.perkJa}）と述べられている特典を聞き取る。`,
      newDistractorReasonsJa: placed.reasons,
      newEvidence: `can ${spec.perkEn}`,
    };
  }

  if (u === 9) {
    // Crop news: green tea leaves / new potatoes / winter spinach should NOT be called "the fruit"!
    const cropMap: Record<string, { cropJa: string; impEn: string; impJa: string }> = {
      'green tea leaves': {
        cropJa: '緑茶の新芽',
        impEn: 'cool misty mornings gave the young leaves a much richer aroma than last year',
        impJa: '涼しく朝霧のかかる日が続いたおかげで、昨年よりずっと香り高い新茶に育った',
      },
      'new potatoes': {
        cropJa: '新じゃがいも',
        impEn: 'well-drained sandy soil produced unusually smooth and flavorful tubers this spring',
        impJa: '水はけのよい砂地のおかげで、今春は例年以上になめらかで風味豊かな芋が育った',
      },
      'winter spinach': {
        cropJa: 'ちぢみほうれん草',
        impEn: 'crisp January frost made the thick green leaves noticeably sweeter and tenderer',
        impJa: '1月の厳しい霜にあたったことで、肉厚な緑の葉が格段に甘く柔らかくなった',
      },
    };
    const cropName = Object.keys(cropMap).find(k => oldBody.includes(k))!;
    const spec = cropMap[cropName];
    const body = `In regional farming news, growers of ${cropName} are reporting an encouraging season this year. According to the agricultural cooperative, ${spec.impEn}. Local markets expect lively weekend crowds eager to buy this year's harvest.`;
    const prompt = `What is reported about ${cropName} this year?`;
    const placed = placeCorrectAt(
      spec.impEn[0].toUpperCase() + spec.impEn.slice(1) + '.',
      `According to the agricultural cooperative, ${spec.impEn}. とそのまま報告されている。`,
      [
        'All local farms stopped growing the crop permanently.',
        'Shipments were suspended due to a summer typhoon.',
        'Retail prices rose tenfold within a single week.',
      ],
      [
        `${spec.cropJa}の栽培を全農家がやめたとは報じられていない。`,
        '台風で出荷停止になったという内容は放送にない。',
        '1週間で小売価格が10倍になったという事実もない。',
      ],
      targetAnswer,
    );
    return {
      speakerAssignment: `${ 'Narrator' }=${narratorSpeaker} / Narrator=F2`,
      newTurns: [
        { speaker: narratorSpeaker, roleLabel: 'Narrator', text: body },
        { speaker: 'F2', roleLabel: 'Narrator', text: `Question. ${prompt}` },
      ],
      newQuestionPrompt: prompt,
      newChoices: placed.choices,
      answerIndex: placed.answer,
      answerNumber: placed.answer + 1,
      newTranslationJa: `地域の農業ニュース。今年の${spec.cropJa}について、農協によると「${spec.impJa}」と報告されている。`,
      newExplanationJa: `According to the agricultural cooperative, ${spec.impEn}（${spec.impJa}）の報告内容を聞き取る。`,
      newDistractorReasonsJa: placed.reasons,
      newEvidence: spec.impEn,
    };
  }

  // u === 10: Venue announcement (Central Arts Theater / Coral Island Pier / Crown Plaza Auditorium)
  const venueMap: Record<string, { venueJa: string; instEn: string; instJa: string }> = {
    'Central Arts Theater': {
      venueJa: '中央芸術劇場',
      instEn: 'turn off smartwatches and mobile screens completely before the curtain rises',
      instJa: '開演前にスマートウォッチや携帯画面の電源・点灯を完全に切る',
    },
    'Coral Island Pier': {
      venueJa: 'コーラル島桟橋',
      instEn: 'have boarding passes ready for inspection before stepping onto Deck Two',
      instJa: '第2デッキへ進む前に乗船券を手元に用意して改札を受ける',
    },
    'Crown Plaza Auditorium': {
      venueJa: 'クラウンプラザ講堂',
      instEn: 'pick up simultaneous interpretation headsets at Table B before taking a seat',
      instJa: '着席前にBテーブルで同時通訳ヘッドセットを受け取る',
    },
  };
  const venueName = Object.keys(venueMap).find(k => oldBody.includes(k))!;
  const spec = venueMap[venueName];
  const body = `Welcome to ${venueName}! We are delighted to have you with us today. To ensure smooth operations for everyone, please ${spec.instEn}. If you need assistance in another language, staff wearing green badges are ready to help.`;
  const prompt = `What are visitors at ${venueName} asked to do?`;
  const placed = placeCorrectAt(
    spec.instEn[0].toUpperCase() + spec.instEn.slice(1) + '.',
    `please ${spec.instEn} と来場者へのお願いが明確に述べられている。`,
    [
      'Wear green staff badges throughout the event.',
      'Move stage lighting equipment by themselves.',
      'Pay an extra cash fee to use the lobby stairs.',
    ],
    [
      '緑のバッジを着けているのは案内スタッフであり来場者ではない。',
      '来場者自身で照明機材を運ぶ規則はない。',
      'ロビー階段の利用に追加料金がかかるという案内もない。',
    ],
    targetAnswer,
  );
  return {
    speakerAssignment: `Narrator=${narratorSpeaker} / Narrator=F2`,
    newTurns: [
      { speaker: narratorSpeaker, roleLabel: 'Narrator', text: body },
      { speaker: 'F2', roleLabel: 'Narrator', text: `Question. ${prompt}` },
    ],
    newQuestionPrompt: prompt,
    newChoices: placed.choices,
    answerIndex: placed.answer,
    answerNumber: placed.answer + 1,
    newTranslationJa: `${spec.venueJa}での来場者案内。円滑な運営のため「${spec.instJa}」よう協力を求めている。`,
    newExplanationJa: `please ${spec.instEn}（${spec.instJa}）と求められている行動を聞き取る。`,
    newDistractorReasonsJa: placed.reasons,
    newEvidence: `please ${spec.instEn}`,
  };
}

// ============================================================================
// Scan all 120 exams and construct RetakeItems
// ============================================================================
const retakeItems: RetakeItem[] = [];

for (const ex of ALL_LISTENING_EXAMS) {
  const bp = LISTENING_BLUEPRINTS[ex.grade];
  const styleHint = STYLE_BY_GRADE[ex.grade];

  for (const u of ex.units) {
    const q0 = u.questions[0];
    const flat = u.turns.map(t => t.text).join(' ');

    const baseMeta = {
      grade: ex.grade,
      gradeLabel: bp.label,
      round: ex.round,
      part: u.part,
      unitIndex: u.unitIndex,
      questionNumber: q0.questionNumber,
      audioId: u.audioId,
      targetMp3Name: `${u.audioId}.mp3`,
      wpmRange: bp.wpmRange,
      styleHint,
      readCount: u.readCount,
      oldTurns: u.turns,
      oldQuestionPrompt: q0.questionPrompt,
      oldChoices: q0.choices,
    };

    // ------------------------------------------------------------------------
    // Tier A1: Pre-2 Plus & Grade 2 Part 2 u=11..15 (exact intra-round clone of u=6..10)
    // ------------------------------------------------------------------------
    if ((ex.grade === 'eiken_pre2plus' || ex.grade === 'eiken_2') && u.part === 'part2' && u.unitIndex >= 11 && u.unitIndex <= 15) {
      const rep = buildFreshMidPart2CloneReplacement(ex.grade, ex.round, u.unitIndex, u);
      retakeItems.push({
        ...baseMeta,
        tier: 'TierA_必須_重複と内容矛盾',
        reasonCategory: 'A1_同一回内の完全重複パッセージ',
        issueSummaryJa: `同じ回の No.${q0.questionNumber - 5}（part2_${String(u.unitIndex - 5).padStart(2, '0')}）と本文・設問・正解が完全重複していたため、新規オリジナル問題に差し替え`,
        ...rep,
      });
      continue;
    }

    // ------------------------------------------------------------------------
    // Tier A2: Semantic mismatch in Pre-2 Plus / Grade 2 Part 2 u=8,9,10
    // ------------------------------------------------------------------------
    if (
      (ex.grade === 'eiken_pre2plus' || ex.grade === 'eiken_2') &&
      u.part === 'part2' &&
      u.unitIndex <= 10 &&
      ((/BookBridge Stores|OakLeaf Books/.test(flat) && /soup container|board games|fresh fruit|home appliances|children.s bikes/.test(flat)) ||
        (/EcoWardrobe Apparel/.test(flat) && /board games|home appliances/.test(flat)) ||
        (/SunRay Electronics|ClearSound Audio/.test(flat) && /paperbacks|fresh fruit|children.s bikes/.test(flat)) ||
        (/Terra Outdoor Gear|UrbanCycle Outfitters/.test(flat) && /soup container|empty glass jars/.test(flat)) ||
        (/Nordic Home Furnishings/.test(flat) && /board games/.test(flat)) ||
        (/DailyBean Roasters/.test(flat) && /imperfect fresh fruit boxes/.test(flat)) ||
        (/(green tea leaves|new potatoes|winter spinach)/i.test(flat) && /fruit much sweeter|boosted fruit sweetness/i.test(flat)) ||
        (/(Central Arts Theater|Coral Island Pier|Crown Plaza Auditorium)/i.test(flat) && /room number on the breakfast card/i.test(flat)))
    ) {
      const rep = buildSemanticFixForMidPart2(ex.grade, ex.round, u.unitIndex, u);
      retakeItems.push({
        ...baseMeta,
        tier: 'TierA_必須_重複と内容矛盾',
        reasonCategory: 'A2_業種・作物・施設の内容矛盾',
        issueSummaryJa: '店舗業種と特典（書店で果物等）、作物と表現（茶葉・じゃがいもを果物扱い）、施設と案内（劇場・桟橋で客室番号記入）の矛盾を解消',
        ...rep,
      });
      continue;
    }

    // ------------------------------------------------------------------------
    // Tier B1: Grade 5 r01_part1_06 "Supper for round tonight"
    // ------------------------------------------------------------------------
    if (u.audioId === 'eiken_5_listening_r01_part1_06') {
      const newTurns = u.turns.map((t, i) =>
        i === 0 ? { ...t, text: t.text.replace('Supper for round tonight', 'Supper for tonight') } : t,
      );
      retakeItems.push({
        ...baseMeta,
        tier: 'TierB_必須_英文法と数詞ミス',
        reasonCategory: 'B1_テンプレート変数残骸',
        issueSummaryJa: '`Supper for round tonight` という不自然な語 `round` が混入していたため `Supper for tonight` に修正',
        speakerAssignment: formatSpeakerAssignment(newTurns),
        newTurns,
        newQuestionPrompt: q0.questionPrompt,
        newChoices: q0.choices,
        answerIndex: q0.answer,
        answerNumber: q0.answer + 1,
        newTranslationJa: u.translation,
        newExplanationJa: q0.explanation,
        newDistractorReasonsJa: q0.distractorReasons,
        newEvidence: q0.evidence,
      });
      continue;
    }

    // ------------------------------------------------------------------------
    // Tier B2: Grade 4 r04..r07_part1_01 "do you want me to lend me..."
    // ------------------------------------------------------------------------
    if (/\bwant me to (?:lend|pass|show|help) me\b/i.test(flat)) {
      const fixLine2 = (s: string) =>
        s
          .replace('Could you tell me what you need? Wait—do you want me to lend me your green highlighter?', 'Would you like me to lend you my green highlighter?')
          .replace('Could you tell me what you need? Wait—do you want me to pass me the salt shaker?', 'Would you like me to pass you the salt shaker?')
          .replace('Could you tell me what you need? Wait—do you want me to show me the way to Gate Three?', 'Would you like me to show you the way to Gate Three?')
          .replace('Could you tell me what you need? Wait—do you want me to help me hang this wall map?', 'Would you like me to help you hang that wall map?');
      const newTurns = u.turns.map((t, i) => (i === 1 ? { ...t, text: fixLine2(t.text) } : t));
      retakeItems.push({
        ...baseMeta,
        tier: 'TierB_必須_英文法と数詞ミス',
        reasonCategory: 'B2_代名詞クラッシュ文法崩壊',
        issueSummaryJa: '`do you want me to lend me...` のように主語・目的語の代名詞が衝突していたため自然な申し出表現 `Would you like me to ... you ...?` に修正',
        speakerAssignment: formatSpeakerAssignment(newTurns),
        newTurns,
        newQuestionPrompt: q0.questionPrompt,
        newChoices: q0.choices,
        answerIndex: q0.answer,
        answerNumber: q0.answer + 1,
        newTranslationJa: u.translation,
        newExplanationJa: 'Would you like me to ...? の申し出に対して Yes, please. で受ける応答を選ぶ。',
        newDistractorReasonsJa: q0.distractorReasons,
        newEvidence: 'Would you like me to',
      });
      continue;
    }

    // ------------------------------------------------------------------------
    // Tier B3: Grade 4 r01..r15_part2_07 "Her/His older sister caught a cold, so I went..."
    // ------------------------------------------------------------------------
    if (/\b(?:Her|His) [^.]*, so I\b/.test(flat)) {
      const newTurns = u.turns.map((t, i) =>
        i === 1 ? { ...t, text: t.text.replace(/^Yes! (?:Her|His) /, 'Yes! My ') } : t,
      );
      retakeItems.push({
        ...baseMeta,
        tier: 'TierB_必須_英文法と数詞ミス',
        reasonCategory: 'B3_人称代名詞ミス（Her/His → My）',
        issueSummaryJa: '話者自身の家族・コーチについて話しているのに `Her/His ... caught a cold, so I went` と三人称になっていたため `My ...` に修正',
        speakerAssignment: formatSpeakerAssignment(newTurns),
        newTurns,
        newQuestionPrompt: q0.questionPrompt,
        newChoices: q0.choices,
        answerIndex: q0.answer,
        answerNumber: q0.answer + 1,
        newTranslationJa: u.translation,
        newExplanationJa: q0.explanation,
        newDistractorReasonsJa: q0.distractorReasons,
        newEvidence: q0.evidence,
      });
      continue;
    }

    // ------------------------------------------------------------------------
    // Tier B4: Grade 4 r05_part3_03 "a orange cat"
    // ------------------------------------------------------------------------
    if (/\ba orange\b/i.test(flat)) {
      const newTurns = u.turns.map((t, i) =>
        i === 0 ? { ...t, text: t.text.replace('a orange cat', 'an orange cat') } : t,
      );
      retakeItems.push({
        ...baseMeta,
        tier: 'TierB_必須_英文法と数詞ミス',
        reasonCategory: 'B4_基礎冠詞ミス（a orange → an orange）',
        issueSummaryJa: '`a orange cat` を正しい `an orange cat` に修正',
        speakerAssignment: formatSpeakerAssignment(newTurns),
        newTurns,
        newQuestionPrompt: q0.questionPrompt,
        newChoices: q0.choices,
        answerIndex: q0.answer,
        answerNumber: q0.answer + 1,
        newTranslationJa: u.translation,
        newExplanationJa: q0.explanation,
        newDistractorReasonsJa: q0.distractorReasons,
        newEvidence: q0.evidence,
      });
      continue;
    }

    // ------------------------------------------------------------------------
    // Tier B5: Grade 3 & Pre-2 r10..r15_part3_08 "order number forty-10" .. "forty-15"
    // ------------------------------------------------------------------------
    if (/forty-(?:10|11|12|13|14|15)\b/i.test(flat)) {
      const numWords: Record<number, string> = {
        10: 'fifty',
        11: 'fifty-one',
        12: 'fifty-two',
        13: 'fifty-three',
        14: 'fifty-four',
        15: 'fifty-five',
      };
      const cleanBody = u.turns[0].text
        .replace(/^Program [A-Za-z]+ [A-Za-z]+:\s*[^:]+:\s*/, 'Thank you for shopping with us this week. ')
        .replace(`forty-${ex.round}`, `three-${numWords[ex.round]}`);
      const newTurns = u.turns.map((t, i) => (i === 0 ? { ...t, text: cleanBody } : t));
      retakeItems.push({
        ...baseMeta,
        tier: 'TierB_必須_英文法と数詞ミス',
        reasonCategory: 'B5_存在しない英語数詞（forty-10〜forty-15）',
        issueSummaryJa: `英語に存在しない注文番号 \`forty-${ex.round}\`（＋準2級では冒頭の不自然な番組タグ）を自然な \`three-${numWords[ex.round]}\` に修正`,
        speakerAssignment: formatSpeakerAssignment(newTurns),
        newTurns,
        newQuestionPrompt: q0.questionPrompt,
        newChoices: q0.choices,
        answerIndex: q0.answer,
        answerNumber: q0.answer + 1,
        newTranslationJa: u.translation,
        newExplanationJa: q0.explanation,
        newDistractorReasonsJa: q0.distractorReasons,
        newEvidence: q0.evidence,
      });
      continue;
    }

    // ------------------------------------------------------------------------
    // Tier C (Optional): Meta self-talk in Part 1 (G3 p1_08, Pre2 p1_03, Pre2 p1_06) & Double Narrator Q (Pre2Plus/G2 p1_11)
    // ------------------------------------------------------------------------
    if (/Well, wait—no, you tried it first/i.test(flat)) {
      // Grade 3 Part 1 No.8
      const newTurns: DialogueTurn[] = [
        { ...u.turns[0], text: u.turns[0].text.replace('You checked out ', 'I heard you checked out ').replace(', right?', '.') },
        { ...u.turns[1], text: u.turns[1].text.replace(/^Yes! Well, wait—no, you tried it first, ([A-Za-z]+)\. /, 'Actually, you tried it before me, $1! ') },
        u.turns[2],
      ];
      retakeItems.push({
        ...baseMeta,
        tier: 'TierC_任意_言い淀みと二重質問',
        reasonCategory: 'C1_第1部会話の不自然な言い直し',
        issueSummaryJa: '`Yes! Well, wait—no, you tried it first` の不自然な自己訂正を自然な会話に整形（余裕があれば再収録推奨）',
        speakerAssignment: formatSpeakerAssignment(newTurns),
        newTurns,
        newQuestionPrompt: q0.questionPrompt,
        newChoices: q0.choices,
        answerIndex: q0.answer,
        answerNumber: q0.answer + 1,
        newTranslationJa: u.translation,
        newExplanationJa: q0.explanation,
        newDistractorReasonsJa: q0.distractorReasons,
        newEvidence: q0.evidence,
      });
      continue;
    }

    if (/you mean "/i.test(flat)) {
      // Pre-2 Part 1 No.3
      const m = u.turns[1].text.match(/Calm down, ([A-Za-z]+)\. Tell me—oh, wait, did something break\? Actually, I see: you mean "([^"]+)," right\?/);
      const listenerName = m ? m[1] : '';
      const probClause = m ? m[2] : '';
      const secondPersonProb = probClause.replace(/^my /, 'your ');
      const newTurns: DialogueTurn[] = [
        { ...u.turns[0], text: `${u.turns[0].text.replace(/!$/, '.')} Actually, ${probClause}!` },
        { ...u.turns[1], text: `Oh no, ${listenerName}, ${secondPersonProb}? Do you need a hand right now?` },
        u.turns[2],
      ];
      retakeItems.push({
        ...baseMeta,
        tier: 'TierC_任意_言い淀みと二重質問',
        reasonCategory: 'C2_第1部会話のメタ引用（you mean "..."）',
        issueSummaryJa: '相手がトラブル内容をカギ括弧付きで代弁する不自然なメタ台詞を、本人が状況を伝えて相手が手を差し伸べる自然なやり取りに修正',
        speakerAssignment: formatSpeakerAssignment(newTurns),
        newTurns,
        newQuestionPrompt: q0.questionPrompt,
        newChoices: q0.choices,
        answerIndex: q0.answer,
        answerNumber: q0.answer + 1,
        newTranslationJa: u.translation,
        newExplanationJa: q0.explanation,
        newDistractorReasonsJa: q0.distractorReasons,
        newEvidence: probClause,
      });
      continue;
    }

    if (/Actually, let me ask the staff:/i.test(flat)) {
      // Pre-2 Part 1 No.6
      const stMatch = u.turns[0].text.match(/stop at (.+)\?$/);
      const st = stMatch ? stMatch[1] : 'that station';
      const newTurns: DialogueTurn[] = [
        { ...u.turns[0], text: `Excuse me, I need to get to ${st}, but I just heard this rapid train skips it.` },
        { ...u.turns[1], text: `Oh, let's ask the station attendant right here—excuse me, where should we change trains for ${st}?` },
        u.turns[2],
      ];
      retakeItems.push({
        ...baseMeta,
        tier: 'TierC_任意_言い淀みと二重質問',
        reasonCategory: 'C3_第1部会話の役割急変（乗客→駅員への独り言）',
        issueSummaryJa: '回答していたはずの2人目が急に駅員へ質問し直す不自然な流れを、同行者2人が駅員に尋ねる自然な場面に修正',
        speakerAssignment: formatSpeakerAssignment(newTurns),
        newTurns,
        newQuestionPrompt: q0.questionPrompt,
        newChoices: q0.choices,
        answerIndex: q0.answer,
        answerNumber: q0.answer + 1,
        newTranslationJa: u.translation,
        newExplanationJa: q0.explanation,
        newDistractorReasonsJa: q0.distractorReasons,
        newEvidence: `change trains for ${st}`,
      });
      continue;
    }

    if ((u.turns[u.turns.length - 1].text.match(/\?/g) ?? []).length >= 2) {
      // Pre-2 Plus & Grade 2 Part 1 No.11 double question
      const cleanPrompt = q0.questionPrompt.replace(/^Why did they decide against buying fresh flowers, or what was suggested instead\?\s*/, '');
      const cleanTurn0 = u.turns[0].text.replace(/^Colleague [A-Za-z]+ at Lobby Eleven—/, '');
      const cleanTurn0Cap = cleanTurn0[0].toUpperCase() + cleanTurn0.slice(1);
      const newTurns: DialogueTurn[] = [
        { ...u.turns[0], text: cleanTurn0Cap },
        ...u.turns.slice(1, -1),
        { ...u.turns[u.turns.length - 1], text: `Question. ${cleanPrompt}` },
      ];
      retakeItems.push({
        ...baseMeta,
        tier: 'TierC_任意_言い淀みと二重質問',
        reasonCategory: 'C4_ナレーターの二重疑問文',
        issueSummaryJa: 'ナレーターの Question に疑問文が2つ続いていたため、後半の本来の設問1文だけに整理',
        speakerAssignment: formatSpeakerAssignment(newTurns),
        newTurns,
        newQuestionPrompt: cleanPrompt,
        newChoices: q0.choices,
        answerIndex: q0.answer,
        answerNumber: q0.answer + 1,
        newTranslationJa: u.translation,
        newExplanationJa: q0.explanation,
        newDistractorReasonsJa: q0.distractorReasons,
        newEvidence: q0.evidence,
      });
      continue;
    }
  }
}

// Separate Tier A+B (Essential Minimal = 199) vs Tier C (Optional Polish = 75)
const essentialItems = retakeItems.filter(i => i.tier !== 'TierC_任意_言い淀みと二重質問');
const optionalItems = retakeItems.filter(i => i.tier === 'TierC_任意_言い淀みと二重質問');

// Format production-ready prompt blocks matching Manus / ElevenLabs exact spec!
function renderPromptBookTxt(title: string, subtitle: string, items: readonly RetakeItem[]): string {
  const lines: string[] = [
    `# ${title}`,
    subtitle,
    '',
    '========================================================================',
    '【そのままコピペで使える 音源生成マスター指示プロンプト（Manus / ElevenLabs 共通）】',
    '========================================================================',
    '以下の英語台本リストから、英検リスニング差し替え用MP3音源を生成してください。',
    '',
    '■ 出力仕様（既存3,285本と完全同一規格）',
    '- 言語：en-US（自然なアメリカ英語）',
    '- 形式：MP3 / 24,000 Hz / モノラル / 128 kbps',
    '- ファイル名：各ブロックの `音源ID` + `.mp3`（例：`eiken_4_listening_r04_part1_01.mp3`）',
    '- 話者割当：各ブロックの `話者割当`（M1=男性1, M2=男性2, F1=女性1, F2=設問ナレーター明瞭女性）に従い、同一音源内では同じ役割の声を維持してください。',
    '- 読み上げ対象：各行の `Man:` / `Woman:` / `Narrator:` の後ろにある英語本文のみを読み上げてください（話者ラベル・音源ID・日本語メモは絶対に読まないでください）。',
    '- 間（ポーズ）：会話／本文と `Question.`（または `Number one.`）の間に約0.6秒〜0.8秒の自然な無音を入れてください。本試験2回読みのパートも、MP3自体は1回分（1音源1ファイル）で作成してください（アプリ側で自動リピート制御します）。',
    '========================================================================',
    '',
  ];

  let currentGrade = '';
  for (const it of items) {
    if (it.grade !== currentGrade) {
      currentGrade = it.grade;
      lines.push(`\n########################################################################`);
      lines.push(`## ${it.gradeLabel}（${it.grade}）｜目標速度：${it.wpmRange[0]}〜${it.wpmRange[1]} WPM｜style: "${it.styleHint}"`);
      lines.push(`########################################################################\n`);
    }
    const partUpper = it.part.toUpperCase();
    lines.push(`[${partUpper}-${String(it.unitIndex).padStart(2, '0')}] 第${it.round}回 No.${it.questionNumber}（${it.reasonCategory}）`);
    lines.push(`音源ID: ${it.audioId} ｜ 保存ファイル名: ${it.targetMp3Name} ｜ 本試験読み回数: ${it.readCount}回 ｜ 話者割当: ${it.speakerAssignment}`);
    lines.push(`修正理由: ${it.issueSummaryJa}`);
    lines.push('');
    for (const t of it.newTurns) {
      lines.push(`${t.roleLabel}: ${t.text}`);
    }
    lines.push('');
    lines.push('------------------------------------------------------------------------');
  }
  return lines.join('\n');
}

const essentialTxt = renderPromptBookTxt(
  `まなとび英検｜リスニング撮り直し用 最低限音源プロンプト集（必須 ${essentialItems.length} 件 / 全 3,285 件中 ${(essentialItems.length / 3285 * 100).toFixed(1)}%）`,
  '※同一回内の重複問題（150件）・業種/作物/施設の矛盾（16件）・英文法/数詞崩壊（33件）のみに厳選した最小セットです。準1級・1級は撮り直し 0 件です。',
  essentialItems,
);

const optionalTxt = renderPromptBookTxt(
  `まなとび英検｜リスニング追加ブラッシュアップ用 任意プロンプト集（任意 ${optionalItems.length} 件）`,
  '※正解判定や模試成立には支障ありませんが、第1部の言い淀みや二重疑問文をさらに自然にしたい場合のみ使える予備リストです。',
  optionalItems,
);

fs.writeFileSync(path.join(OUT_DIR, '01_必須のみ_撮り直し音源プロンプト_199件.txt'), essentialTxt, 'utf8');
fs.writeFileSync(path.join(OUT_DIR, '02_任意予備_会話自然化プロンプト_75件.txt'), optionalTxt, 'utf8');
fs.writeFileSync(
  path.join(OUT_DIR, 'manifest_retake_minimal_199.json'),
  JSON.stringify(
    {
      generatedAt: '2026-11-17',
      totalBankAudioUnits: 3285,
      essentialRetakeCount: essentialItems.length,
      optionalPolishCount: optionalItems.length,
      zeroRetakeGrades: ['eiken_pre1', 'eiken_1'],
      essentialItems,
      optionalItems,
    },
    null,
    2,
  ),
  'utf8',
);

// Also build CSV for quick progress tracking
const csvRows = [
  ['priority_tier', 'category', 'audio_id', 'mp3_filename', 'grade', 'round', 'part', 'question_no', 'wpm_range', 'style', 'speaker_assignment', 'issue_ja', 'new_spoken_script'].join(','),
  ...essentialItems.map(it =>
    [
      it.tier,
      it.reasonCategory,
      it.audioId,
      it.targetMp3Name,
      it.grade,
      it.round,
      it.part,
      it.questionNumber,
      `${it.wpmRange[0]}-${it.wpmRange[1]}`,
      it.styleHint,
      it.speakerAssignment,
      it.issueSummaryJa,
      it.newTurns.map(t => `${t.roleLabel}: ${t.text}`).join(' | '),
    ]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  ),
];
fs.writeFileSync(path.join(OUT_DIR, 'retake_minimal_199_list.csv'), '\uFEFF' + csvRows.join('\n'), 'utf8');

// Summary stats
const byGradeEssential: Record<string, number> = {};
const byCatEssential: Record<string, number> = {};
for (const it of essentialItems) {
  byGradeEssential[it.grade] = (byGradeEssential[it.grade] ?? 0) + 1;
  byCatEssential[it.reasonCategory] = (byCatEssential[it.reasonCategory] ?? 0) + 1;
}
console.log('Essential Retake Count:', essentialItems.length);
console.log('By Grade (Essential):', byGradeEssential);
console.log('By Category (Essential):', byCatEssential);
console.log('Optional Polish Count:', optionalItems.length);
