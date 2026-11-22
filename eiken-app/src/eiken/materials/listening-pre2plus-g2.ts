import {
  buildExamRound,
  makeDialogueUnit,
  makeQuestionItem,
  speakerPairFor,
} from './listening-helpers';
import type { DialogueTurn, ListeningAudioUnit, ListeningExamRound } from '../listeningExamCore';

/**
 * 英検準2級プラス・2級 リスニング予想問題 各15回（計30回・900問・900音源・図版0枚）
 * - 準2級プラス：第1部15問（会話の内容一致・4肢印刷・1回読み）＋第2部15問（文の内容一致・4肢印刷・1回読み）
 * - 2級：第1部15問（会話の内容一致・4肢印刷・1回読み）＋第2部15問（文の内容一致・4肢印刷・1回読み）
 * - 完全独自作成（origin: 'manatobi-original'）。過去問流用なし。
 */

const M_NAMES = ['Arthur', 'Benjamin', 'Charles', 'Dominic', 'Edward', 'Frederick', 'Gregory', 'Harrison', 'Isaac', 'Julian', 'Kenneth', 'Lawrence', 'Mitchell', 'Nicholas', 'Patrick'];
const F_NAMES = ['Abigail', 'Beatrice', 'Caroline', 'Dorothy', 'Eleanor', 'Florence', 'Gabriella', 'Harriet', 'Isabella', 'Jacqueline', 'Katherine', 'Lillian', 'Margaret', 'Natalie', 'Penelope'];

const DIALOGUE_OPENERS_P2P = [
  'Excuse me, do you have a minute before the briefing?',
  'Good morning, I just looked over the updated notice.',
  'Hi there, thanks for stopping by my desk.',
  'Hello, could we go over the schedule for this week?',
  'Hey, I just spoke with the coordinator on the phone.',
  'Pardon me, are you heading to the conference room?',
  'Morning! Did you see the message on the bulletin board?',
  'Hi, I wanted to ask about the upcoming community event.',
  'Good afternoon, thanks for returning my call so quickly.',
  'Listen, we need to make a quick adjustment today.',
  'Hello again, have you checked the supply list yet?',
  'Oh hi, I am glad I caught you before lunch.',
  'By the way, regarding next month\'s training workshop,',
  'Excuse me, is this the registration table for visitors?',
  'Hi, I have an update about our group presentation.',
] as const;

const DIALOGUE_OPENERS_G2 = [
  'Good morning, thank you for coming to the consultation desk.',
  'Hello, I have just reviewed the quarterly maintenance plan.',
  'Pardon me, could I confirm a detail about my membership?',
  'Hi, did you hear the announcement from the facilities team?',
  'Good afternoon, I am calling regarding next week\'s shipment.',
  'Excuse me, I noticed a change on the departmental calendar.',
  'Hello there, how are preparations going for the symposium?',
  'Morning! I just received feedback from the review committee.',
  'Hi, do you have a moment to discuss the venue layout?',
  'Listen, there has been a slight change to our itinerary.',
  'Good evening, thanks for staying to finalize the report.',
  'Oh hello, I just checked the availability of the studio.',
  'By the way, concerning the new recycling guidelines here,',
  'Excuse me, I would like to inquire about the evening course.',
  'Hi again, let us verify the figures before the meeting.',
] as const;

interface MidDialogueSpec {
  skill: string;
  build: (round: number, isG2: boolean, m: string, f: string, who1: string, who2: string) => {
    l1: string;
    l2: string;
    l3: string;
    l4: string;
    ja: string;
    prompt: string;
    correct: string;
    cReason: string;
    wrongs: [string, string, string];
    wReasons: [string, string, string];
    exp: string;
    ev: string;
  };
}

const MID_DIALOGUE_SPECS: readonly MidDialogueSpec[] = [
  // 1: 会場・設備トラブルと代替対応
  {
    skill: '会話：問題点',
    build: (r, isG2, m, f, who1) => {
      const rooms = isG2
        ? ['Seminar Hall North', 'Auditorium B', 'Gallery Room Four', 'Media Lab Two', 'Executive Room Six', 'Lecture Hall East', 'Studio Seven', 'Workshop Annex', 'Atrium Lounge', 'Boardroom Three', 'Archive Room One', ' Pavilion Hall', 'Forum Room Five', ' Terrace Room', ' Briefing Suite'].map(s => s.trim())
        : ['Study Room One', 'Club Hall East', 'Music Annex', 'Science Room Four', 'Meeting Booth B', 'Art Studio Two', 'Library Lounge', 'Gym Balcony', 'Cooking Lab', 'Drama Room', 'Computer Hall', 'Language Lab', 'Audio Room', 'Craft Room Six', ' Assembly Hall'].map(s => s.trim());
      const roomsJa = isG2
        ? ['北セミナーホール', 'B講堂', '第4ギャラリー室', '第2メディアラボ', '第6役員会議室', '東講義ホール', '第7スタジオ', 'ワークショップ別館', 'アトリウムラウンジ', '第3会議室', '第1資料室', 'パビリオンホール', '第5フォーラム室', 'テラスルーム', 'ブリーフィング室']
        : ['第1学習室', '東クラブホール', '音楽別館', '第4理科室', 'Bミーティングブース', '第2美術スタジオ', '図書ラウンジ', '体育館バルコニー', '調理実習室', '演劇練習室', 'コンピュータホール', '語学演習室', '視聴覚室', '第6工作教室', '集会ホール'];
      const fixes = isG2
        ? ['reserve the adjacent lounge and move the chairs', 'borrow a portable projector from the IT counter', 'open the partition wall to expand the seating', 'switch to printed handouts instead of slides', 'delay the opening remarks by twenty minutes']
        : ['move our session to the second-floor room', 'borrow a spare cable from the staff office', 'bring ten folding chairs from the hallway', 'share textbooks in pairs for today', 'start with the group discussion first'];
      const fixesJa = isG2
        ? ['隣のラウンジを予約して椅子を移動させる', 'ITカウンターから携帯プロジェクターを借りる', '可動壁を開けて座席を広げる', 'スライドの代わりに印刷資料へ切り替える', '開会のあいさつを20分遅らせる']
        : ['会場を2階の部屋へ移す', '職員室から予備ケーブルを借りる', '廊下から折りたたみ椅子を10脚運ぶ', '今日はペアで教科書を共有する', '先にグループ討論から始める'];
      const rm = rooms[r - 1];
      const rmJa = roomsJa[r - 1];
      const fx = fixes[(r - 1) % 5];
      const fxJa = fixesJa[(r - 1) % 5];
      return {
        l1: `I just checked ${rm}, ${f}, and the air conditioning unit is making a loud noise.`,
        l2: `Really, ${m}? Our guests are arriving in half an hour. Did maintenance say they can fix it right away?`,
        l3: `They need two hours for repairs, so I decided we should ${fx}.`,
        l4: `That makes sense. Let's put a notice on the door right now.`,
        ja: `${rmJa}の空調に不具合があり修理に2時間かかるため、「${fxJa}」という対応を取ることになった。`,
        prompt: `What did ${who1} decide they should do?`,
        correct: fx[0].toUpperCase() + fx.slice(1) + '.',
        cReason: `so I decided we should ${fx} と述べ、相手も賛成している。`,
        wrongs: [
          'Postpone the event until next month.',
          'Wait two hours inside the noisy room.',
          'Repair the air conditioner themselves.',
        ],
        wReasons: [
          'イベントを来月まで延期するとは述べていない。',
          '騒音のある部屋で2時間待つのではなく別対応を選んでいる。',
          '自分たちで空調を修理するとは言っていない。',
        ],
        exp: `修理に2時間かかることを受けた so I decided we should ${fx} を聞き取る。`,
        ev: `we should ${fx}`,
      };
    },
  },
  // 2: 申込・契約条件の確認
  {
    skill: '会話：条件',
    build: (r, isG2, _m, _f, _who1, who2) => {
      const services = isG2
        ? ['municipal fitness pass', 'annual museum membership', 'commuter bike locker', 'evening pottery course', 'shared coworking desk', 'botanical society card', 'weekend tennis club', 'online language program', 'orchestra season pass', 'community garden plot', 'swimming lap membership', 'local archive reader card', 'studio rental plan', 'culinary workshop series', 'astronomy club pass']
        : ['student gym pass', 'summer swimming card', ' weekend bus pass', 'youth choir club', 'beginner guitar course', 'library study pass', 'tennis court card', 'cooking club plan', 'art museum youth pass', 'skating rink ticket', 'cycling club membership', 'science dome pass', 'book club subscription', 'badminton league', 'camping gear rental'].map(s => s.trim());
      const servicesJa = isG2
        ? ['市営フィットネス利用証', '博物館の年間会員証', '通勤用自転車ロッカー', '夜間陶芸講座', '共有コワーキングデスク', '植物協会の会員証', '週末テニスクラブ', 'オンライン語学プログラム', 'オーケストラ定期会員券', '市民農園の区画', '水泳ラップ会員証', '地域公文書館の閲覧証', 'スタジオ利用プラン', '料理ワークショップ連続講座', '天文クラブ会員証']
        : ['学生ジム利用パス', '夏季プール利用証', '週末バスフリーパス', '青少年合唱クラブ', '初心者ギター講座', '図書館の学習席パス', 'テニスコート利用証', '料理クラブプラン', '美術館のユースパス', 'スケート場回数券', 'サイクリングクラブ会員証', '科学ドーム利用パス', '読書クラブ定期会員', 'バドミントンリーグ', 'キャンプ用品レンタル'];
      const reqs = isG2
        ? ['submit proof of local residence', 'attend a fifteen-minute safety orientation', 'pay a refundable key deposit in cash', 'register a bank account for monthly billing', 'bring two passport-sized photographs']
        : ['bring a parent\'s signature on the form', 'watch a ten-minute safety video first', 'show a valid student ID card at the desk', 'buy indoor shoes with white soles', 'pay the material fee before Friday'];
      const reqsJa = isG2
        ? ['市内在住証明を提出する', '15分間の安全説明会に出席する', '返金可能な鍵の保証金を現金で支払う', '月謝引落し用の銀行口座を登録する', 'パスポートサイズの証明写真を2枚持参する']
        : ['申込書に保護者の署名をもらって持参する', '最初に10分間の安全ビデオを視聴する', '受付で有効な生徒証を提示する', '靴底が白い室内履きを用意する', '金曜までに教材費を支払う'];
      const sv = services[r - 1];
      const svJa = servicesJa[r - 1];
      const rq = reqs[(r - 1) % 5];
      const rqJa = reqsJa[(r - 1) % 5];
      return {
        l1: `Hello, I would like to sign up for the ${sv} starting next week.`,
        l2: `Certainly! Have you already filled out the online application form?`,
        l3: `Yes, I submitted it last night. Can I receive my card right away?`,
        l4: `Almost—before we issue the card, you need to ${rq}.`,
        ja: `${svJa}の申込手続き。オンライン申請は済んでいるが、カード発行の前に「${rqJa}」が必要だと案内されている。`,
        prompt: `What must the applicant do before receiving the card?`,
        correct: rq[0].toUpperCase() + rq.slice(1) + '.',
        cReason: `before we issue the card, you need to ${rq} と必要条件が明示されている。`,
        wrongs: [
          'Fill out the online form again.',
          'Wait three weeks for mail delivery.',
          'Take a written level placement test.',
        ],
        wReasons: [
          'オンライン申請は昨夜提出済みであり、再提出は求められていない。',
          '郵送で3週間待つという説明は出ていない。',
          '筆記のレベル分けテストを受けるという条件もない。',
        ],
        exp: `before we issue the card, you need to ${rq} の条件表現を聞き取る（案内役：${who2}）。`,
        ev: `you need to ${rq}`,
      };
    },
  },
  // 3: 相手の意図・含意の把握
  {
    skill: '会話：意図',
    build: (r, isG2, m, f, _who1, who2) => {
      const topics = isG2
        ? ['renting a larger booth at the trade show', 'printing full-color catalogs for all visitors', 'hiring an external catering company', 'extending store hours until ten at night', 'ordering three hundred souvenir mugs']
        : ['buying professional lighting for our school play', 'making matching jackets for thirty members', 'renting a charter bus for a short trip', 'ordering custom medals from overseas', 'printing hardcover albums for the club'];
      const topicsJa = isG2
        ? ['見本市でより広いブースを借りること', '来場者全員向けにフルカラーのカタログを印刷すること', '外部のケータリング業者を雇うこと', '営業時間を夜10時まで延長すること', '記念マグカップを300個発注すること']
        : ['文化祭の劇のために本格的な照明機材を買うこと', '部員30人分のお揃いのジャケットを作ること', '近距離の遠征に貸切バスを借りること', '特注メダルを海外から取り寄せること', '部活のハードカバー記念アルバムを印刷すること'];
      const concerns = isG2
        ? ['it exceeds the remaining quarterly budget', 'delivery will not make it before the opening day', 'most attendees prefer digital brochures now', 'staff members are already working overtime', 'storage space in the back office is full']
        : ['our club budget cannot cover that cost', 'the items will not arrive before Festival Day', 'most students read notices on their phones', 'everyone is busy with final exams next week', 'there is no space left in our club locker'];
      const concernsJa = isG2
        ? ['四半期の残り予算を超過してしまう', '開催初日までに納品が間に合わない', '今では参加者の大半がデジタル版パンフレットを好む', 'スタッフがすでに残業続きで負担が大きい', '事務室奥の保管スペースがいっぱいである']
        : ['部活の予算ではその費用をまかなえない', '文化祭当日までに品物が届かない', '生徒の大半はスマホで案内を読む', '来週の期末試験に向けて全員忙しい', '部室のロッカーにもう空き場所がない'];
      const tp = topics[(r - 1) % 5];
      const tpJa = topicsJa[(r - 1) % 5];
      const cn = concerns[(r + 1) % 5];
      const cnJa = concernsJa[(r + 1) % 5];
      return {
        l1: `${f}, For project number ${r}, what do you think about ${tp}?`,
        l2: `Well, ${m}, it sounds impressive on paper, but have you looked at the practical side?`,
        l3: `Do you think the committee will reject the idea?`,
        l4: `Honestly, yes, mainly because ${cn}.`,
        ja: `「${tpJa}」という提案に対し、相手は「${cnJa}」という理由から慎重・否定的な見方を示している。`,
        prompt: `Why is ${who2} hesitant about the idea?`,
        correct: `Because ${cn}.`,
        cReason: `Honestly, yes, mainly because ${cn}. と懸念の理由を直接述べている。`,
        wrongs: [
          'Because the event was canceled yesterday.',
          'Because another team already did the same thing.',
          'Because the venue banned all visitors.',
        ],
        wReasons: [
          'イベントが昨日中止になったとは述べられていない。',
          '別チームがすでに同じことをしたという話は出ていない。',
          '会場が来場者を全面禁止したという事実もない。',
        ],
        exp: `mainly because ${cn} の否定・懸念の根拠を聞き取る。`,
        ev: `mainly because ${cn}`,
      };
    },
  },
  // 4: 交通・旅行のトラブル解決
  {
    skill: '会話：交渉',
    build: (r, isG2, _m, _f, who1) => {
      const dests = ['Sapporo', 'Fukuoka', 'Sendai', 'Hiroshima', 'Kanazawa', 'Takamatsu', 'Matsuyama', 'Kagoshima', 'Niigata', 'Nagano', 'Toyama', 'Okayama', 'Kumamoto', 'Hakodate', 'Miyazaki'];
      const destsJa = ['札幌', '福岡', '仙台', '広島', '金沢', '高松', '松山', '鹿児島', '新潟', '長野', '富山', '岡山', '熊本', '函館', '宮崎'];
      const solutions = isG2
        ? ['switch to the four twenty express at no extra charge', 'board the highway coach departing from Gate Seven', 'take the bullet train via the central hub station', 'keep the current seat on the delayed flight and get a meal voucher', 'rebook onto tomorrow\'s early morning departure']
        : ['take the four twenty rapid train instead', 'use the airport bus from Stop Three', 'change trains at Central Junction', 'wait in the lounge with a free drink ticket', 'travel on the first train tomorrow morning'];
      const solutionsJa = isG2
        ? ['追加料金なしで4時20分発の特急へ振り替える', '7番ゲート発の高速バスに乗車する', '中央乗換駅経由で新幹線を利用する', '遅れている便の現在の座席のまま食事券を受け取る', '翌朝一番の出発便へ予約を変更する']
        : ['代わりに4時20分発の快速列車に乗る', '3番乗り場から空港リムジンバスを使う', '中央ジャンクション駅で乗り換える', '無料ドリンク券をもらってラウンジで待つ', '翌朝の始発列車で移動する'];
      const dst = dests[r - 1];
      const dstJa = destsJa[r - 1];
      const sol = solutions[(r - 1) % 5];
      const solJa = solutionsJa[(r - 1) % 5];
      return {
        l1: `Excuse me, I have a ticket to ${dst}, but the board says my departure is delayed by ninety minutes.`,
        l2: `We sincerely apologize. Fog near the coast is slowing down incoming traffic today.`,
        l3: `I have a family dinner tonight. What is the fastest option you can offer me?`,
        l4: `If you hand me your ticket, you can ${sol}.`,
        ja: `${dstJa}行きの便が濃霧で90分遅れているため、係員から最善策として「${solJa}」という案内を受けた。`,
        prompt: `What option is offered to ${who1}?`,
        correct: sol[0].toUpperCase() + sol.slice(1) + '.',
        cReason: `you can ${sol} と具体的な代替手段が提示されている。`,
        wrongs: [
          'Rent a private car for free.',
          'Receive double the ticket price in cash.',
          'Ride in the staff cabin immediately.',
        ],
        wReasons: [
          '無料でレンタカーを借りられるという案内はされていない。',
          '運賃の2倍を現金で返金するとは言っていない。',
          '乗務員室にすぐ乗れるという話も出ていない。',
        ],
        exp: `What is the fastest option ...? に対する回答 you can ${sol} を聞き取る。`,
        ev: `you can ${sol}`,
      };
    },
  },
  // 5: 比較・購入決定
  {
    skill: '会話：比較',
    build: (r, isG2, m, f, who1) => {
      const products = isG2
        ? ['ergonomic office chair', 'cordless vacuum cleaner', 'induction rice cooker', 'noise-canceling headset', 'compact air purifier', 'adjustable standing desk', 'espresso coffee maker', 'portable document scanner', 'waterproof hiking pack', 'LED reading lamp', 'stainless thermal pot', 'digital kitchen scale', 'folding commuter bike', 'ceramic space heater', 'smart fitness watch']
        : ['study desk lamp', 'lightweight hair dryer', 'insulated lunch jar', 'wireless earphones', 'compact blender', 'folding study table', 'electric kettle', 'portable speaker', 'daypack for hiking', 'bedside alarm clock', 'stainless water jug', 'digital timer', 'commuter backpack', 'mini desk fan', 'sports wristwatch'];
      const productsJa = isG2
        ? ['人間工学オフィスチェア', 'コードレス掃除機', 'IH炊飯器', 'ノイズキャンセリングヘッドセット', '小型空気清浄機', '昇降式スタンディングデスク', 'エスプレッソメーカー', '携帯ドキュメントスキャナー', '防水ハイキングザック', 'LED読書ランプ', 'ステンレス保温ポット', 'デジタルキッチンスケール', '折りたたみ通勤自転車', 'セラミックファンヒーター', 'スマートフィットネスウォッチ']
        : ['学習用デスクランプ', '軽量ヘアドライヤー', '保温ランチジャー', 'ワイヤレスイヤホン', '小型ミキサー', '折りたたみ学習テーブル', '電気ケトル', 'ポータブルスピーカー', 'ハイキング用デイパック', '枕元の目覚まし時計', 'ステンレス水筒ジャグ', 'デジタルタイマー', '通学リュック', '卓上ミニ扇風機', 'スポーツ腕時計'];
      const reasons = isG2
        ? ['it comes with a three-year free repair warranty', 'its replacement filters cost half as much', 'it weighs forty percent less than the older model', 'it uses thirty percent less electricity each month', 'its battery lasts twice as long on a single charge']
        : ['it comes with a two-year free warranty', 'its spare parts are easy to buy nearby', 'it is much lighter to carry every day', 'it uses very little electricity', 'its battery lasts sixteen hours'];
      const reasonsJa = isG2
        ? ['3年間の無料修理保証がついている', '交換用フィルターの費用が半額で済む', '従来モデルより重量が40%軽い', '毎月の消費電力が30%少ない', '1回の充電でバッテリーが2倍長持ちする']
        : ['2年間の無料保証がついている', '交換部品を近所で手軽に買える', '毎日持ち運ぶのにずっと軽い', '消費電力がとても少ない', 'バッテリーが16時間持続する'];
      const prd = products[r - 1];
      const prdJa = productsJa[r - 1];
      const rsn = reasons[(r - 1) % 5];
      const rsnJa = reasonsJa[(r - 1) % 5];
      return {
        l1: `Look at these two models of ${prd}, ${f}. Model X is slightly cheaper than Model Y.`,
        l2: `True, ${m}, but look closely at the specification card below Model Y.`,
        l3: `Oh, I see! Model Y is a better long-term value because ${rsn}.`,
        l4: `Exactly. I will take Model Y to the cashier now.`,
        ja: `${prdJa}の2機種を比較し、わずかに高いモデルYのほうが「${rsnJa}」という点で長期的にお得だと判断している。`,
        prompt: `Why did ${who1} and ${f} prefer Model Y?`,
        correct: `Because ${rsn}.`,
        cReason: `Model Y is a better long-term value because ${rsn}. と決め手を述べている。`,
        wrongs: [
          'Because Model Y had a lower price tag.',
          'Because Model X was completely out of stock.',
          'Because a famous actor designed Model Y.',
        ],
        wReasons: [
          '価格自体はモデルXのほうが少し安い（Model X is slightly cheaper）と述べられている。',
          'モデルXが在庫切れだとは言っていない。',
          '有名な俳優がデザインしたという話は出てこない。',
        ],
        exp: `価格の安さ（Model X）に惑わされず、Model Y を選んだ理由 because ${rsn} を聞き取る。`,
        ev: `because ${rsn}`,
      };
    },
  },
  // 6: 学業・職場でのフィードバック修正
  {
    skill: '会話：依頼',
    build: (r, isG2, m, f, who1) => {
      const drafts = isG2
        ? ['marketing survey report', 'environmental science paper', 'new employee handbook', 'museum audio guide script', 'community grant proposal', 'product launch press release', 'internship evaluation form', 'tourism brochure translation', 'annual safety manual', 'customer feedback summary', 'library renovation plan', 'volunteer training guide', 'campus magazine feature', 'nutrition lecture slides', 'regional transport study']
        : ['history presentation slides', 'book review essay', 'club recruitment poster', 'science fair summary', 'school newspaper article', 'English speech draft', 'field trip guidebook', 'cooking recipe booklet', 'recycle campaign flyer', 'choir concert program', 'reading survey report', 'health week poster', 'exchange welcome guide', 'career interview notes', 'sports day pamphlet'];
      const draftsJa = isG2
        ? ['市場調査レポート', '環境科学の論文', '新入社員ハンドブック', '博物館の音声ガイド原稿', '地域助成金の申請書', '新製品発表プレスリリース', 'インターン評価シート', '観光パンフレット翻訳原稿', '年次安全マニュアル', '顧客アンケート集計報告', '図書館改修計画書', 'ボランティア研修ガイド', '学内誌の特集記事', '栄養講座のスライド', '地域交通の調査報告書']
        : ['歴史発表スライド', '読書感想エッセイ', '部員募集ポスター', '科学フェア要約シート', '学校新聞の記事', '英語スピーチ原稿', '校外学習のしおり', '料理レシピ小冊子', 'リサイクル運動チラシ', '合唱コンサートのプログラム', '読書調査レポート', '健康週間ポスター', '留学生歓迎ガイド', '職業インタビュー記録', '体育祭パンフレット'];
      const edits = isG2
        ? ['add a clear bar graph comparing the last three years', 'shorten the introduction to one concise paragraph', 'include specific sources at the bottom of page two', 'replace technical jargon with everyday expressions', 'double-check the percentage totals in Table One']
        : ['add two photos to make the main point clearer', 'make the opening paragraph shorter and simpler', 'write the book titles in alphabetical order', 'use larger font sizes for the main headings', 'check the spelling of all place names again'];
      const editsJa = isG2
        ? ['過去3年間を比較するわかりやすい棒グラフを追加する', '導入部を簡潔な1段落にまとめる', '2ページ下部に具体的な出典を明記する', '専門用語を日常的な表現に置き換える', '表1の割合の合計値を再確認する']
        : ['要点を明確にするため写真を2枚追加する', '冒頭の段落をより短く簡潔にする', '書名をアルファベット順に並べ替える', '大見出しの文字サイズを大きくする', 'すべての地名のつづりをもう一度確認する'];
      const dr = drafts[r - 1];
      const drJa = draftsJa[r - 1];
      const ed = edits[(r - 1) % 5];
      const edJa = editsJa[(r - 1) % 5];
      return {
        l1: `Thank you for reading my ${dr}, ${f}. Do I need to rewrite the conclusion?`,
        l2: `Your conclusion is very clear, ${m}, so keep it just as it is.`,
        l3: `That is a relief! Is there anything I should revise before submitting it?`,
        l4: `Just one thing—please ${ed}.`,
        ja: `${drJa}の原稿確認。結論部分は書き直す必要がなく、提出前に1点だけ「${edJa}」を行うよう求められた。`,
        prompt: `What should ${who1} do before submitting the ${dr}?`,
        correct: ed[0].toUpperCase() + ed.slice(1) + '.',
        cReason: `Just one thing—please ${ed}. と修正すべき唯一の箇所が指示されている。`,
        wrongs: [
          'Rewrite the entire conclusion from scratch.',
          'Change the topic to something completely new.',
          'Submit it next month instead of this week.',
        ],
        wReasons: [
          '結論は明確なのでそのままでよい（keep it just as it is）と言われている。',
          'テーマを全面変更するようには言われていない。',
          '提出を来月に延ばすという話も出ていない。',
        ],
        exp: `結論の書き直しは不要と否定されたあとの please ${ed} を聞き取る。`,
        ev: `please ${ed}`,
      };
    },
  },
  // 7: イベント・講座の感想と評価
  {
    skill: '会話：評価',
    build: (r, isG2, m, f, _who1, who2) => {
      const events = isG2
        ? ['urban gardening seminar', 'astronomy night lecture', 'modern architecture tour', 'artisan bread workshop', 'documentary film screening', 'wildlife photography talk', 'classical chamber concert', 'fermentation cooking class', 'renewable energy forum', 'traditional dyeing studio', 'local history symposium', 'botanical illustration class', 'marine conservation talk', 'jazz improvisation clinic', 'ceramic glaze workshop']
        : ['weekend baking class', 'star-watching event', 'old town walking tour', 'comic drawing workshop', 'nature documentary show', 'animal photo seminar', 'brass band concert', 'pasta making lesson', 'clean energy talk', 'tie-dye shirt class', 'castle history lecture', 'flower sketching class', 'ocean life workshop', 'guitar rhythm clinic', 'clay cup workshop'];
      const eventsJa = isG2
        ? ['都市園芸セミナー', '星空夜間講座', '近代建築ツアー', '本格パン作り講座', 'ドキュメンタリー映画上映会', '野生動物写真トーク', '室内楽コンサート', '発酵料理教室', '再生可能エネルギーフォーラム', '伝統染色工房', '郷土史シンポジウム', '植物画教室', '海洋保全講演会', 'ジャズ即興クリニック', '陶芸の釉薬ワークショップ']
        : ['週末お菓子作り教室', '星空観察会', '旧市街ウォーキングツアー', 'マンガ作画ワークショップ', '自然ドキュメンタリー上映会', '動物写真セミナー', '吹奏楽コンサート', 'パスタ作り教室', 'クリーンエネルギー講話', '絞り染めTシャツ教室', '城の歴史講座', '花のスケッチ教室', '海の生き物ワークショップ', 'ギターリズム講座', '粘土カップ作り教室'];
      const praises = isG2
        ? ['the hands-on demonstration at the end was really practical', 'the speaker answered tough questions with clear examples', 'the small group size allowed everyone to get feedback', 'the printed reference guide will be useful at home', 'seeing real historical tools up close was fascinating']
        : ['practicing in small groups made it easy to learn', 'the instructor explained each step with humor', 'everyone got to try the equipment personally', 'the illustrated recipe card is easy to follow at home', 'seeing real samples up close was unforgettable'];
      const praisesJa = isG2
        ? ['最後の実演がとても実践的だった', '講師が難しい質問にも明確な具体例で答えてくれた', '少人数制で全員が個別に助言をもらえた', '印刷された参考資料が自宅でも役立つ内容だった', '本物の歴史的道具を間近で見られて興味深かった']
        : ['少人数グループでの実習で学びやすかった', '講師がユーモアを交えて各手順を説明してくれた', '全員が実際に機材を体験できた', 'イラスト入りレシピカードが家でも再現しやすい', '本物の標本を間近で見られて忘れられない体験になった'];
      const ev = events[r - 1];
      const evJa = eventsJa[r - 1];
      const pr = praises[(r - 1) % 5];
      const prJa = praisesJa[(r - 1) % 5];
      return {
        l1: `How did you find yesterday's ${ev}, ${f}? Was the venue hard to locate?`,
        l2: `Actually, ${m}, the venue was a ten-minute walk in the rain, which was tiring.`,
        l3: `Oh, so do you regret going?`,
        l4: `Not at all! I was really glad I went because ${pr}.`,
        ja: `昨日の${evJa}は雨の中会場まで10分歩いて大変だったが、「${prJa}」ため参加して本当に良かったと評価している。`,
        prompt: `Why was ${who2} glad about attending the ${ev}?`,
        correct: `Because ${pr}.`,
        cReason: `I was really glad I went because ${pr}. と満足した理由を明言している。`,
        wrongs: [
          'Because the venue was right inside the station.',
          'Because admission tickets were refunded in full.',
          'Because lunch was served free of charge.',
        ],
        wReasons: [
          '会場は雨の中10分歩いたと述べており、駅直結ではない。',
          '参加費が全額返金されたという事実はない。',
          '無料の昼食が出たという話も登場しない。',
        ],
        exp: `道中の苦労（rain）と最終的な高評価（because ${pr}）の対比を聞き取る。`,
        ev: `because ${pr}`,
      };
    },
  },
  // 8: スケジュール調整・いつ会うか
  {
    skill: '会話：条件',
    build: (r, _isG2, m, f) => {
      const slots = [
        ['Thursday at four thirty', 'Wednesday afternoon', 'Friday morning', 'Saturday evening', '木曜の4時30分'],
        ['Friday at one fifteen', 'Tuesday noon', 'Wednesday evening', 'Thursday morning', '金曜の1時15分'],
        ['Tuesday at five o\'clock', 'Monday morning', 'Thursday noon', 'Friday afternoon', '火曜の5時'],
        ['Wednesday at eleven thirty', 'Monday afternoon', 'Tuesday morning', 'Friday evening', '水曜の11時30分'],
        ['Monday at three forty-five', 'Wednesday noon', 'Thursday afternoon', 'Saturday morning', '月曜の3時45分'],
      ];
      const [ans, w1, w2, w3, ansJa] = slots[(r - 1) % 5];
      const purposes = ['rehearse our joint presentation', 'review the budget figures', 'select photos for the exhibition', 'test the audio recording gear', 'plan the welcome reception', 'check the translation draft', 'organize the charity booth', 'prepare the lab equipment', 'update the club website', 'sort the donated books', 'practice the interview questions', 'design the event banner', 'compile the survey answers', 'inspect the stage props', 'finalize the camp menu'];
      const purposesJa = ['共同プレゼンのリハーサル', '予算数値の確認', '展示用の写真選定', '録音機材のテスト', '歓迎レセプションの企画', '翻訳原稿のチェック', 'チャリティーブースの準備', '実験機材のセッティング', '部活ウェブサイトの更新', '寄贈図書の仕分け', '面接質問の練習', 'イベント横断幕のデザイン', 'アンケート回答の集計', '舞台小道具の点検', 'キャンプ献立の最終決定'];
      const purp = purposes[r - 1];
      const purpJa = purposesJa[r - 1];
      return {
        l1: `Hi ${f}, we need an hour this week to ${purp}. Are you free ${w1}?`,
        l2: `Sorry ${m}, I have a shift at the bookstore ${w1}. How about ${w2}?`,
        l3: `I have a seminar ${w2}, so that will not work either. What about ${ans}?`,
        l4: `Let me check my planner... Yes, ${ans} is wide open! Let's meet then.`,
        ja: `${purpJa}のための日程調整。最初の2候補は互いの予定で合わず、最終的に「${ansJa}」で合意した。`,
        prompt: 'When will the speakers meet?',
        correct: `On ${ans}.`,
        cReason: `What about ${ans}? に対し Yes, ${ans} is wide open! Let's meet then. と確定している。`,
        wrongs: [`On ${w1}.`, `On ${w2}.`, `On ${w3}.`],
        wReasons: [
          `${w1} は書店のシフトがあるため断られている。`,
          `${w2} はセミナーがあるため都合がつかなかった。`,
          `${w3} は会話の中で一度も候補に出ていない。`,
        ],
        exp: `2度却下された候補日時を除外し、最後に合意した ${ans} を聞き取る。`,
        ev: `${ans} is wide open`,
      };
    },
  },
  // 9: 住居・施設・アルバイトの問い合わせ
  {
    skill: '会話：問題点',
    build: (r, isG2, _m, _f, who1) => {
      const places = isG2
        ? ['sunlit studio apartment', 'second-floor music practice room', 'weekend farmers\' market stall', 'shared pottery workshop', 'station bicycle parking lot', 'community language classroom', 'harbor kayak storage locker', 'rooftop gardening plot', 'downtown coworking booth', 'campus bookstore part-time job', 'civic theater rehearsal hall', 'botanical cafe patio', 'neighborhood cooking studio', 'university research archive', 'sports complex locker plan']
        : ['weekend bakery helper job', 'after-school tutoring desk', 'park tennis court slot', 'music studio practice booth', 'community pool lane', 'summer camp counselor role', 'library reading booth', 'bicycle rental monthly plan', 'youth art gallery wall', 'station locker subscription', 'flower shop weekend shift', 'school festival food stall', 'badminton hall booking', 'local radio student corner', 'pet shelter volunteer shift'];
      const placesJa = isG2
        ? ['日当たりのよいワンルームマンション', '2階の音楽練習室', '週末ファーマーズマーケットの出店区画', '共同陶芸工房', '駅前の月極駐輪場', '地域の語学教室', '港のカヤック保管ロッカー', '屋上菜園の区画', '都心のコワーキングブース', '学内書店のアルバイト', '市民劇場のリハーサル室', '植物園カフェのテラス席', '地域のクッキングスタジオ', '大学研究アーカイブ室', '総合体育館の契約ロッカー']
        : ['週末のパン屋補助アルバイト', '放課後の個別学習デスク', '公園テニスコートの予約枠', '音楽スタジオの個人練習ブース', '市民プールのコース利用', '夏キャンプの指導員募集', '図書館の個人閲覧ブース', 'レンタサイクルの月額プラン', '青少年ギャラリーの展示壁面', '駅ロッカーの定期利用', '生花店の週末シフト', '文化祭の模擬店区画', 'バドミントンホールの予約', '地元ラジオの学生コーナー', '動物保護施設のボランティア枠'];
      const catches = isG2
        ? ['the elevator will be out of service for two weeks next month', 'parking spaces are currently full with a waiting list', 'electricity fees are billed separately from the base rent', 'weekend access requires booking forty-eight hours ahead', 'loud instruments are permitted only until seven p.m.']
        : ['training sessions are held on Sunday mornings at eight', 'you have to bring your own black apron and cap', 'bookings can only be made up to three days in advance', 'the locker area closes promptly at six thirty', 'shifts during exam weeks must be swapped a week early'];
      const catchesJa = isG2
        ? ['来月は2週間エレベーターが点検のため停止する', '駐車場は現在満車で順番待ちになっている', '電気代は基本賃料とは別に請求される', '週末の利用には48時間前までの事前予約が必要である', '大きな音の出る楽器は午後7時までしか使用できない']
        : ['研修は日曜の朝8時から行われる', '黒いエプロンと帽子を自分で持参する必要がある', '予約は利用日の3日前までしか受け付けていない', 'ロッカー区域は6時30分ちょうどに閉まる', '試験期間中のシフト変更は1週間前までに交代手続きが必要である'];
      const pl = places[r - 1];
      const plJa = placesJa[r - 1];
      const ct = catches[(r - 1) % 5];
      const ctJa = catchesJa[(r - 1) % 5];
      return {
        l1: `Hello, I am inquiring about the ${pl} advertised on your website.`,
        l2: `Thank you for your interest! All the basic conditions on the webpage are still available.`,
        l3: `Wonderful. Is there anything important I should know before I apply today?`,
        l4: `Yes, please keep in mind that ${ct}.`,
        ja: `${plJa}への申し込み前に知っておくべき注意点として、「${ctJa}」と説明を受けている。`,
        prompt: `What is ${who1} told to keep in mind?`,
        correct: ct[0].toUpperCase() + ct.slice(1) + '.',
        cReason: `please keep in mind that ${ct} と注意点として明示されている。`,
        wrongs: [
          'Applications closed two days ago.',
          'The monthly fee doubled this morning.',
          'Only people over forty may apply.',
        ],
        wReasons: [
          '募集はまだ空いている（still available）と述べられている。',
          '今朝料金が2倍になったという話は一切ない。',
          '40歳以上限定という年齢制限も出てこない。',
        ],
        exp: `please keep in mind that ... に続く留意条件を正確に聞き取る。`,
        ev: `keep in mind that ${ct}`,
      };
    },
  },
  // 10: 体調・健康習慣へのアドバイス
  {
    skill: '会話：意図',
    build: (r, isG2, m, f, who1, who2) => {
      const symptoms = ['stiff shoulders from computer work', 'trouble falling asleep before midnight', 'tired eyes after reading small print', 'low energy in the late afternoon', 'sore knees after jogging on pavement'];
      const symptomsJa = ['パソコン作業による肩こり', '夜12時前になかなか寝つけないこと', '細かい文字を読んだ後の目の疲れ', '夕方になると集中力や元気が落ちること', '舗装路を走った後のひざの痛み'];
      const tips = isG2
        ? ['raise the monitor to eye level and stretch hourly', 'avoid bright phone screens an hour before bed', 'use warmer room lighting and rest every thirty minutes', 'eat a handful of nuts instead of sugary snacks', 'switch to cushioned trail paths in the park']
        : ['stand up and roll his or her shoulders every hour', 'drink warm herbal tea instead of coffee at night', 'look at distant trees for one minute every half hour', 'take a brisk ten-minute walk outside after lunch', 'do five minutes of slow stretching before running'];
      const tipsJa = isG2
        ? ['モニターを目線の高さに上げ、1時間ごとにストレッチする', '就寝1時間前は明るいスマホ画面を見ないようにする', '暖色系の室内照明にし、30分ごとに目を休める', '甘いお菓子の代わりにナッツをひとつかみ食べる', '公園のクッション性のある遊歩道コースに切り替える']
        : ['1時間ごとに立ち上がって肩を回す', '夜はコーヒーの代わりに温かいハーブティーを飲む', '30分ごとに1分間、遠くの木々を眺める', '昼食後に外で10分間早歩きをする', '走る前に5分間ゆっくりストレッチをする'];
      const sym = symptoms[(r - 1) % 5];
      const symJa = symptomsJa[(r - 1) % 5];
      const rawTip = tips[(r - 1) % 5];
      const tip = rawTip.replace('his or her', who1 === 'the man' ? 'his' : 'her');
      const tipJa = tipsJa[(r - 1) % 5];
      const days = ['lately', 'this month', 'since April', 'this term', 'for two weeks', 'all week', 'since Monday', 'recently', 'these days', 'this season', 'since autumn', 'this quarter', 'for ten days', 'since summer', 'all semester'];
      return {
        l1: `I have been having ${sym} ${days[r - 1]}, ${f}.`,
        l2: `I used to have the exact same problem last year, ${m}!`,
        l3: `Really? Did you take medicine or visit a specialist?`,
        l4: `Neither—my doctor simply told me to ${rawTip.replace('his or her', 'my')}, and it helped within a week.`,
        ja: `${symJa}に悩む話者に対し、相手は自分の経験から「${tipJa}」という医師のアドバイスが効果的だったと伝えている。`,
        prompt: `What worked well for ${who2} last year?`,
        correct: tip[0].toUpperCase() + tip.slice(1) + '.',
        cReason: `told me to ... and it helped within a week と実際に効果があった習慣を述べている。`,
        wrongs: [
          'Take strong medicine twice a day.',
          'Have surgery at a city hospital.',
          'Quit all exercise for six months.',
        ],
        wReasons: [
          '薬は飲んでいない（Neither）と明確に否定している。',
          '市立病院で手術を受けたという話は出ていない。',
          '半年間すべての運動をやめたとも言っていない。',
        ],
        exp: `Neither で薬や専門医通いを否定した後の told me to ... を聞き取る。`,
        ev: 'helped within a week',
      };
    },
  },
  // 11〜15: さらに5種類の独立会話パターン
  {
    skill: '会話：比較',
    build: (r, isG2, m, f, who1) => {
      const gifts = isG2
        ? ['an insulated stainless tumbler', 'a botanical hand-cream set', 'a hardcover recipe collection', 'a wooden desk calendar', 'a box of single-origin tea']
        : ['a set of colored brush pens', 'a cozy fleece blanket', 'a canvas book pouch', 'a ceramic soup mug', 'a desktop mini plant'];
      const giftsJa = isG2
        ? ['真空断熱ステンレスタンブラー', 'ボタニカルハンドクリームセット', 'ハードカバーのレシピ集', '木製の卓上カレンダー', 'シングルオリジン紅茶の詰め合わせ']
        : ['カラー筆ペンセット', '暖かいフリースブランケット', '帆布のブックポーチ', '陶器のスープマグ', '卓上ミニ観葉植物'];
      const gf = gifts[(r - 1) % 5];
      const gfJa = giftsJa[(r - 1) % 5];
      const occasions = ['Ms. Toda\'s farewell gift', 'Coach Sato\'s birthday', 'our host family\'s present', 'the graduation gift', 'Uncle Ken\'s retirement', 'Aunt Rika\'s housewarming', 'our club advisor\'s thank-you gift', 'Sister Mei\'s promotion', 'Grandpa\'s seventy-fifth birthday', 'Mr. Lin\'s welcome gift', 'our team captain\'s prize', 'Dr. Ono\'s appreciation gift', 'Cousin Yui\'s wedding gift', 'Ms. Bell\'s winter gift', 'Brother Sho\'s college gift'];
      const occasionsJa = ['戸田先生への送別の品', '佐藤コーチの誕生日プレゼント', 'ホストファミリーへの贈り物', '卒業記念のプレゼント', '健おじさんの退職祝い', '里香おばさんの新築祝い', '顧問の先生へのお礼の品', '姉の芽衣の昇進祝い', 'おじいちゃんの75歳の誕生日祝い', 'リンさんへの歓迎ギフト', 'チーム主将への記念品', '小野先生への感謝の品', 'いとこの結衣の結婚祝い', 'ベル先生への冬の贈り物', '兄の翔の大学進学祝い'];
      const occ = occasions[r - 1];
      const occJa = occasionsJa[r - 1];
      return {
        l1: `We collected four thousand yen for ${occ}, ${f}. Should we buy a fresh flower bouquet?`,
        l2: `Flowers are nice, ${m}, but the recipient is traveling for five days starting Saturday.`,
        l3: `Good point—flowers would wilt while nobody is home. What should we get instead?`,
        l4: `How about ${gf}? It is practical and easy to pack.`,
        ja: `${occJa}の品選び。土曜から5日間旅行で不在のため生花は避け、「${gfJa}」を贈る提案が出された。`,
        prompt: `Why did they decide against buying fresh flowers, or what was suggested instead? What did ${f} suggest buying?`,
        correct: gf[0].toUpperCase() + gf.slice(1) + '.',
        cReason: `How about ${gf}? It is practical and easy to pack. と代替案を提案している。`,
        wrongs: ['A fresh flower bouquet.', 'A large glass aquarium.', 'A frozen ice cream cake.'],
        wReasons: [
          '生花は5日間の旅行中にしおれてしまうため見送られた。',
          '大きなガラス水槽は提案されていない。',
          'アイスクリームケーキについても会話に出てこない。',
        ],
        exp: `旅行中で生花がダメな理由を押さえ、代替提案 How about ${gf}? を聞き取る（確認者：${who1}）。`,
        ev: `How about ${gf}`,
      };
    },
  },
  {
    skill: '会話：問題点',
    build: (r, isG2, _m, _f, who1) => {
      const mistakes = isG2
        ? ['printed last year\'s ticket prices on the poster', 'entered the wrong room number in the invitation email', 'ordered vegetarian meals for Tuesday instead of Wednesday', 'booked twenty seats instead of thirty on the bus', 'listed the old phone number on the brochure']
        : ['wrote two o\'clock instead of three on the flyer', 'left out the map on the back of the handout', 'ordered ten pizzas instead of fifteen for the party', 'sent the club schedule to Class A instead of Class B', 'forgot to reserve the gymnasium scoreboard'];
      const mistakesJa = isG2
        ? ['ポスターに昨年のチケット料金を印刷してしまった', '案内メールに誤った部屋番号を入力してしまった', 'ベジタリアン食を水曜ではなく火曜で発注してしまった', 'バスの座席を30席ではなく20席しか予約しなかった', 'パンフレットに旧電話番号を載せてしまった']
        : ['チラシに3時ではなく2時と書いてしまった', '配布資料の裏面に地図を入れ忘れた', 'パーティー用のピザを15枚ではなく10枚しか注文しなかった', '部活の予定表をB組ではなくA組に送ってしまった', '体育館の得点板を予約し忘れた'];
      const fixes = isG2
        ? ['send a correction email to all registered guests immediately', 'print small correction stickers to place over the old line', 'call the catering manager before noon to change the date', 'request an additional minibus from the transport desk', 'update the website banner and inform reception staff']
        : ['put corrected flyers on every classroom board today', 'hand out separate map sheets at the entrance', 'call the pizza shop right now to add five more', 'forward the schedule to Class B during lunch break', 'ask the PE teacher if the scoreboard is still free'];
      const fixesJa = isG2
        ? ['登録済みの招待客全員に直ちに訂正メールを送る', '小さな訂正シールを印刷して旧記載の上に貼る', '正午前にケータリング担当者に電話して日程を変更する', '輸送デスクに追加のマイクロバスを1台手配してもらう', 'ウェブサイトのバナーを更新して受付スタッフに周知する']
        : ['今日中にすべての教室の掲示板へ訂正版のチラシを貼る', '入口で別紙の地図シートを配布する', '今すぐピザ店に電話して5枚追加する', '昼休みにB組へ予定表を転送する', '体育の先生に得点板がまだ空いているか尋ねる'];
      const idx = (r - 1) % 5;
      const tags = ['Oh dear,', 'Wait a minute,', 'Hold everything,', 'Uh-oh,', 'Look at this,', 'Goodness,', 'Just a second,', 'Hey look,', 'Oh no,', 'Wait here,', 'Listen closely,', 'Check page one,', 'Look at line two,', 'Stop the press,', 'Quick check:'];
      return {
        l1: `${tags[r - 1]} I just noticed a mistake—I ${mistakes[idx]}!`,
        l2: `Calm down! There is still time to fix it before anyone gets confused.`,
        l3: `What is the quickest way to handle this right now?`,
        l4: `You should ${fixes[idx]}. I will help you!`,
        ja: `手違い（${mistakesJa[idx]}）に気づき、すぐに「${fixesJa[idx]}」という対処を行うことになった。`,
        prompt: `What is ${who1} advised to do right now?`,
        correct: fixes[idx][0].toUpperCase() + fixes[idx].slice(1) + '.',
        cReason: `You should ${fixes[idx]}. と今すぐ取るべき解決策が提示されている。`,
        wrongs: [
          'Hide the mistake and say nothing.',
          'Cancel the whole program for the year.',
          'Buy new computers for the office.',
        ],
        wReasons: [
          'ミスを隠して黙っているようには言われていない。',
          '年間の全プログラムを中止するという話ではない。',
          '新しいパソコンを購入するという内容も無関係である。',
        ],
        exp: `ミス発覚後の具体的なリカバリー策 You should ${fixes[idx]} を聞き取る。`,
        ev: `You should ${fixes[idx]}`,
      };
    },
  },
  {
    skill: '会話：含意',
    build: (r, isG2, m, f, _who1, who2) => {
      const hobbies = isG2
        ? ['restoring vintage wooden clocks', 'growing bonsai trees on the balcony', 'translating nineteenth-century short stories', 'photographing nocturnal forest birds', 'baking sourdough rye bread from scratch']
        : ['building miniature wooden ships', 'learning classical Spanish guitar', 'growing cherry tomatoes from seeds', 'painting watercolor postcards', 'jogging five kilometers before breakfast'];
      const hobbiesJa = isG2
        ? ['古い木製時計の修復', 'ベランダでの盆栽づくり', '19世紀の短編小説の翻訳', '夜行性の森の野鳥の撮影', '自家製酵母のライ麦パン焼き']
        : ['木製のミニチュア帆船模型づくり', 'クラシックギターの練習', '種からのミニトマト栽培', '水彩絵はがきの制作', '朝食前の5キロジョギング'];
      const outcomes = isG2
        ? ['it taught patience and Careful attention to tiny details', 'neighbors started asking to buy loaves every Saturday', 'a local magazine asked to publish three of the works', 'it became a great way to make friends across generations', 'museum staff invited the club to hold a weekend display']
        : ['it helped improve concentration during school exams', 'family members look forward to fresh samples every weekend', 'the art teacher displayed two pieces in the entrance hall', 'several classmates asked to practice together after school', 'waking up early every morning became effortless'];
      const outcomesJa = isG2
        ? ['忍耐力と細部への丁寧な注意力が身についた', '近所の人たちから毎週土曜にパンを譲ってほしいと頼まれるようになった', '地元誌から作品を3点掲載したいと依頼された', '世代を超えた友人を作る素晴らしいきっかけになった', '博物館の職員から週末展示を開かないかと招待された']
        : ['学校の試験中の集中力が高まった', '家族が毎週末できたてを楽しみにするようになった', '美術の先生が作品を2点玄関ホールに飾ってくれた', 'クラスメート数人から放課後に一緒に練習しようと誘われた', '毎朝早起きするのが苦にならなくなった'];
      const hb = hobbies[(r - 1) % 5];
      const hbJa = hobbiesJa[(r - 1) % 5];
      const out = outcomes[(r - 1) % 5].replace('Careful', 'careful');
      const outJa = outcomesJa[(r - 1) % 5];
      const spans = ['six months', 'one year', 'eight months', 'two years', 'ten months', 'fourteen months', 'nine months', 'three terms', 'seven months', 'fifteen months', 'eleven months', 'five months', 'eighteen months', 'four terms', 'sixteen months'];
      const spansJa = ['6か月間', '1年間', '8か月間', '2年間', '10か月間', '14か月間', '9か月間', '3学期間', '7か月間', '15か月間', '11か月間', '5か月間', '18か月間', '4学期間', '16か月間'];
      return {
        l1: `You have been ${hb} for ${spans[r - 1]} now, ${f}. Has it been hard to keep up?`,
        l2: `At first my hands were clumsy, ${m}, and I made plenty of mistakes.`,
        l3: `What made you continue instead of quitting?`,
        l4: `Unexpectedly, ${out}, so it has been really rewarding.`,
        ja: `${spansJa[r - 1]}続けている「${hbJa}」について、最初は失敗もあったが「${outJa}」ため大きなやりがいを感じている。`,
        prompt: `What unexpected benefit did ${who2} experience?`,
        correct: out[0].toUpperCase() + out.slice(1) + '.',
        cReason: `Unexpectedly, ${out} と継続して得られた予想外の良さを述べている。`,
        wrongs: [
          'It brought a million-yen cash prize.',
          'It led to a job offer in Paris.',
          'It resulted in a television show role.',
        ],
        wReasons: [
          '100万円の宝くじに当たったという話は出てこない。',
          'パリのアパートに引っ越したとも述べていない。',
          'テレビのニュースキャスターになったという事実もない。',
        ],
        exp: `Unexpectedly, ${out} の具体的な成果・メリットを聞き取る。`,
        ev: `Unexpectedly, ${out}`,
      };
    },
  },
  {
    skill: '会話：依頼',
    build: (r, _isG2, m, f, who1) => {
      const errands = [
        ['pick up the dry cleaning before six', 'drop this parcel at the post office', 'buy batteries at the hardware store', 'return two DVDs to the rental shop', 'get fresh milk and eggs at the market'],
        ['collect the printed posters from Copy Mart', 'bring a box of chalk from the office', 'check whether the gym doors are locked', 'carry the music stands to Room Three', 'hand the attendance sheet to Mr. Oda'],
        ['water the cucumber plants in the yard', 'bring in the laundry before evening', 'feed the goldfish in the living room', 'put the trash bags out by eight', 'close the upstairs shutters tightly'],
      ];
      const errandsJa = [
        ['6時前にクリーニングを受け取る', '郵便局でこの小包を出す', 'ホームセンターで電池を買う', 'レンタル店にDVDを2枚返却する', '市場で新鮮な牛乳と卵を買う'],
        ['コピーマートで印刷済みポスターを受け取る', '事務室からチョークを1箱持ってくる', '体育館の扉が施錠されているか確認する', '譜面台を3番教室へ運ぶ', '出席表を小田先生に渡す'],
        ['庭のキュウリの苗に水をやる', '夕方前に洗濯物を取り込む', '居間の金魚にえさをやる', '8時までにゴミ袋を出す', '2階の雨戸をしっかり閉める'],
      ];
      const group = errands[(r - 1) % 3];
      const groupJa = errandsJa[(r - 1) % 3];
      const ans = group[r % 5];
      const ansJa = groupJa[r % 5];
      const w1 = group[(r + 1) % 5];
      const w2 = group[(r + 2) % 5];
      const w3 = group[(r + 3) % 5];
      return {
        l1: `I am heading out for my shift in round-hour ${r}, ${f}—actually, I leave in ten minutes. Did you already ${w1}?`.replace(`for my shift in round-hour ${r}, `, `now at step ${r === 1 ? 'four' : 'five'}, `).replace(`at step ${r === 1 ? 'four' : 'five'}, `, ''),
        l2: `Yes, ${m}, I already took care of that twenty minutes ago.`,
        l3: `Great! Is there anything else you need me to do on my way?`,
        l4: `Could you ${ans}? I cannot leave the house right now.`,
        ja: `すでに終わった用事を確認したあと、外出ついでに「${ansJa}」を頼まれている。`,
        prompt: `What is ${who1} asked to do on the way out?`,
        correct: ans[0].toUpperCase() + ans.slice(1) + '.',
        cReason: `Could you ${ans}? とこれから外出する相手に依頼している。`,
        wrongs: [
          w1[0].toUpperCase() + w1.slice(1) + '.',
          w2[0].toUpperCase() + w2.slice(1) + '.',
          w3[0].toUpperCase() + w3.slice(1) + '.',
        ],
        wReasons: [
          `${w1} は20分前にすでに済ませた（already took care of that）と述べられている。`,
          `${w2} は会話に登場しない用事である。`,
          `${w3} も依頼されていない内容である。`,
        ],
        exp: `すでに完了した用事と、これから頼まれた Could you ${ans}? を区別する。`,
        ev: `Could you ${ans}`,
      };
    },
  },
  {
    skill: '総合',
    build: (r, isG2, m, f, _who1, who2) => {
      const destinations = isG2
        ? ['the Maritime Heritage Museum', 'the Highland Botanical Center', 'the Regional Contemporary Gallery', 'the Valley Astronomical Park', 'the Historic Silk Mill']
        : ['the City Science Pavilion', 'the Harbor Aquarium Annex', 'the Maple Folk Village', 'the Greenhill Zoo', 'the Sunset Observation Tower'];
      const destinationsJa = isG2
        ? ['海事遺産博物館', '高原植物センター', '地域現代アートギャラリー', '渓谷天文公園', '歴史絹織物工場跡']
        : ['市立科学パビリオン', '港の水族館別館', 'メイプル民俗村', 'グリーンヒル動物園', 'サンセット展望タワー'];
      const reasons = [
        ['the main exhibition floor is closed for lighting upgrades today', 'メイン展示階が本日照明工事で閉まっている'],
        ['all afternoon guided tours are fully booked by school groups', '午後のガイドツアーが団体予約で満席になっている'],
        ['the shuttle road is closed for a local marathon until four', 'マラソン大会で4時までシャトル道路が通行止め'],
        ['special discount tickets are valid starting tomorrow, not today', '特別割引券が今日ではなく明日から有効になる'],
        ['heavy mist is blocking the entire panoramic view right now', '濃霧でいま展望がまったく見えない'],
      ];
      const dst = destinations[(r - 1) % 5];
      const dstJa = destinationsJa[(r - 1) % 5];
      const [rsnEn, rsnJa] = reasons[(r + 2) % 5];
      const days = ['Saturday', 'Sunday', 'Friday', 'holiday Monday', 'Wednesday', 'Thursday', 'Tuesday', 'this morning', 'this afternoon', 'today at noon', 'on day two', 'this sunny morning', 'after breakfast', 'before noon', 'right after lunch'];
      return {
        l1: `Shall we head over to ${dst} ${days[r - 1]}, ${f}?`,
        l2: `Wait a second, ${m}—I just checked their official social media page.`,
        l3: `Is something going on there right now?`,
        l4: `Yes, it says ${rsnEn}, so let's go tomorrow instead!`,
        ja: `${dstJa}へ行く計画だったが、公式ページの案内で「${rsnJa}」と判明したため、明日へ延期することにした。`,
        prompt: `Why does ${who2} suggest going tomorrow instead?`,
        correct: `Because ${rsnEn}.`,
        cReason: `it says ${rsnEn}, so let's go tomorrow instead! と理由を明確に述べている。`,
        wrongs: [
          'Because Admission fees permanently tripled.',
          'Because neither of them brought walking shoes.',
          'Because the facility moved to another prefecture.',
        ].map(s => s.replace('Admission', 'admission')) as [string, string, string],
        wReasons: [
          '入館料が恒久的に3倍になったという話は出ていない。',
          '歩きやすい靴を持ってこなかったという理由は述べられていない。',
          '施設が他県へ移転したという事実もない。',
        ],
        exp: `公式ページで確認した事実 it says ${rsnEn} を聞き取る。`,
        ev: `it says ${rsnEn}`,
      };
    },
  },
];

interface MidPassageSpec {
  skill: string;
  build: (round: number, isG2: boolean) => {
    text: string;
    ja: string;
    prompt: string;
    correct: string;
    cReason: string;
    wrongs: [string, string, string];
    wReasons: [string, string, string];
    exp: string;
    ev: string;
  };
}

const PASSAGE_LEADS_P2P = [
  'Welcome to Youth Science Digest.',
  'Good morning, listeners of Campus Update.',
  'Attention all passengers at the central terminal:',
  'Thank you for visiting our municipal museum today.',
  'In this week\'s health and lifestyle report,',
  'Hello everyone, and welcome to the orientation hall.',
  'Here is a community notice from the Green Park Committee:',
  'Good afternoon, shoppers at Harbor Plaza:',
  'Today in social studies, let us examine urban trends:',
  'Thank you for calling the Regional Sports Office:',
  'Welcome aboard the Morning Express tour bus:',
  'Listeners of Teen Book Corner, here is a highlight:',
  'Before we begin our factory tour, please listen carefully:',
  'In local agriculture news this autumn,',
  'May I have your attention in the library foyer:',
] as const;

const PASSAGE_LEADS_G2 = [
  'Good evening, and welcome to Economic Perspectives.',
  'In today\'s environmental research bulletin,',
  'Attention all delegates attending the annual symposium:',
  'Thank you for choosing Northern Railways this morning.',
  'On today\'s episode of Medical Innovation Weekly,',
  'Welcome to the audio tour of the National Art Wing.',
  'Here is a public announcement from the Water Bureau:',
  'In recent educational psychology findings,',
  'Good afternoon, staff members of the Logistics Division:',
  'Historians studying nineteenth-century port cities note that',
  'Thank you for calling the City Cultural Foundation:',
  'During the past decade, urban planners have observed that',
  'Welcome, volunteers, to the Coastal Conservation briefing:',
  'Consumer reports published this quarter indicate that',
  'Before entering the clean-room laboratory, please note:',
] as const;

const MID_PASSAGE_SPECS: readonly MidPassageSpec[] = [
  // 1: 都市・環境・科学の取り組み（原因と結果）
  {
    skill: '文：原因',
    build: (r, isG2) => {
      const lead = isG2 ? PASSAGE_LEADS_G2[r - 1] : PASSAGE_LEADS_P2P[r - 1];
      const cities = [' Meadowbrook', 'Silverport', 'Oakridge', 'Clearwater', 'Brookfield', 'Fairview', 'Pinehurst', 'Glenwood', 'Mapleton', 'Sunvale', 'crestview', 'Bridgewater', 'Stonehaven', 'Riverbend', ' Lakewood'].map(s => s.trim()[0].toUpperCase() + s.trim().slice(1));
      const citiesJa = ['メドウブルック', 'シルバーポート', 'オークリッジ', 'クリアウォーター', 'ブルックフィールド', 'フェアビュー', 'パインハースト', 'グレンウッド', 'メイプルトン', 'サンベール', 'クレストビュー', 'ブリッジウォーター', 'ストーンヘイブン', 'リバーベンド', 'レイクウッド'];
      const measures = isG2
        ? [
            ['planted shade trees along bus corridors', 'pedestrian foot traffic rose by twenty-five percent in summer', 'バス通り沿いに日陰を作る街路樹を植えた', '夏場の歩行者数が25%増加した'],
            ['installed smart sensors on public trash bins', 'collection trucks cut fuel consumption by thirty percent', '公共のごみ箱にスマートセンサーを設置した', '収集車の燃料消費量が30%削減された'],
            ['converted abandoned rail tracks into bike paths', 'morning road congestion near schools dropped sharply', '廃線跡を自転車専用道に整備した', '学校周辺の朝の道路渋滞が大幅に減少した'],
            ['offered rebates for rooftop rainwater tanks', 'storm drain overflow during heavy rain fell significantly', '屋上の雨水貯留タンク設置に助成金を出した', '豪雨時の雨水排水溝の氾濫が大きく減少した'],
            ['replaced streetlights with warm-toned shielded LEDs', 'complaints about nighttime glare declined by half', '街灯を暖色系の遮光LEDに取り替えた', '夜間のまぶしさに関する苦情が半減した'],
          ]
        : [
            ['added free water refill stations in parks', 'plastic bottle litter in the parks dropped by half', '公園に無料の給水スポットを増設した', '公園内のペットボトルごみが半減した'],
            ['created car-free zones near elementary schools', 'more children began walking to school safely', '小学校周辺に歩行者専用ゾーンを設けた', 'より多くの児童が安全に徒歩で登校するようになった'],
            ['opened a tool-lending library at the civic hall', 'residents repaired furniture instead of throwing it away', '市民ホールに工具の貸出ライブラリーを開設した', '住民が家具を捨てずに修理して使うようになった'],
            ['started a weekend compost collection booth', 'household food waste decreased noticeably across town', '週末の生ごみ堆肥化回収ブースを始めた', '町全体で家庭の食品廃棄物が目に見えて減少した'],
            ['introduced fifteen-minute electric shuttle buses', 'elderly residents visited downtown shops more often', '15分間隔の電動シャトルバスを導入した', '高齢の住民が中心街の商店をより頻繁に訪れるようになった'],
          ];
      const [act, effect, actJa, effectJa] = measures[(r - 1) % 5];
      const city = cities[r - 1];
      const cityJa = citiesJa[r - 1];
      const text = `${lead} Two years ago, the city of ${city} ${act}. At first, some business owners wondered whether the project would justify its cost. However, a follow-up survey released this month revealed that ${effect}. Other municipalities are now studying ${city}'s model.`;
      return {
        text,
        ja: `2年前、${cityJa}市は「${actJa}」という施策を実施した。今月発表された追跡調査により、「${effectJa}」という成果が明らかになった。`,
        prompt: `What did the follow-up survey in ${city} reveal?`,
        correct: effect[0].toUpperCase() + effect.slice(1) + '.',
        cReason: `revealed that ${effect} と調査結果が明確に述べられている。`,
        wrongs: [
          'The project was canceled after three months.',
          'Local taxes doubled to pay for repairs.',
          'Population in the city fell by half.',
        ],
        wReasons: [
          '3か月で中止になったのではなく、他自治体が手本にするほど成功している。',
          '修理のために住民税が2倍になったとは述べられていない。',
          '人口が半減したという記述も本文にない。',
        ],
        exp: `However, a follow-up survey ... revealed that ${effect} の結果部分を聞き取る。`,
        ev: `revealed that ${effect}`,
      };
    },
  },
  // 2: 自然科学・動植物の研究（対比）
  {
    skill: '文：対比',
    build: (r, isG2) => {
      const lead = isG2 ? PASSAGE_LEADS_G2[(r + 1) % 15] : PASSAGE_LEADS_P2P[(r + 1) % 15];
      const studies = isG2
        ? [
            ['alpine wildflowers', 'turn their petals toward morning sunlight to warm visiting insects', '高山の野草', '訪れる昆虫を温めるため朝日の方向へ花びらを向ける'],
            ['migrating shorebirds', 'sleep with one half of the brain awake during long ocean flights', '渡りをするシギ・チドリ類', '長距離の海上飛行中に脳の半分を起こしたまま眠る'],
            ['deep-rooting desert shrubs', 'share underground moisture with neighboring seedlings at night', '深く根を張る砂漠の低木', '夜間に周囲の若木と地下の水分を分け合う'],
            ['coral reef cleaner fish', 'recognize individual client fish even after several weeks', 'サンゴ礁の掃除魚', '数週間後でも顧客となる魚を1匹ずつ見分ける'],
            ['forest fungi networks', 'transfer carbon nutrients between shaded and sunlit trees', '森林の菌類ネットワーク', '日陰の木と日当たりのよい木の間で炭素栄養分を受け渡す'],
          ]
        : [
            ['urban songbirds', 'sing at a slightly higher pitch to be heard over traffic noise', '都市に暮らす小鳥', '交通騒音にかき消されないよう少し高い音程でさえずる'],
            ['tree frogs in tropical woods', 'adjust their skin brightness to match wet or dry bark', '熱帯林のアマガエル', '樹皮の乾湿に合わせて体表の明るさを調整する'],
            ['bumblebees on windy hills', 'fly closer to the ground to save wing energy', '風の強い丘のマルハナバチ', '羽のエネルギーを節約するため地面の近くを飛ぶ'],
            ['harbor seals in murky water', 'use sensitive whiskers to follow fish trails accurately', '濁った海のアザラシ', '敏感なひげを使って魚の通り道を正確にたどる'],
            ['squirrels in northern forests', 'sort nuts by type before burying them in separate spots', '北の森のリス', '木の実を種類ごとに仕分けてから別々の場所に埋める'],
          ];
      const [subj, finding, subjJa, findingJa] = studies[(r - 1) % 5];
      const years = ['twenty nineteen', 'twenty twenty', 'twenty twenty-one', 'twenty twenty-two', 'twenty twenty-three', 'last autumn', 'last spring', 'early this year', 'two summers ago', 'three winters ago', 'recent field seasons', 'a five-year study', 'an island survey', 'a mountain survey', 'a coastal study'];
      const text = `${lead} Researchers observing ${subj} during ${years[r - 1]} made a surprising discovery. People used to assume their behavior was purely random. Careful camera recordings showed, however, that they ${finding}. This strategy significantly improves their survival rate.`;
      return {
        text,
        ja: `${subjJa}に関する研究。かつて行動は偶然と考えられていたが、記録映像により「${findingJa}」ことが判明した。`,
        prompt: `What did camera recordings show about ${subj}?`,
        correct: `They ${finding}.`,
        cReason: `showed, however, that they ${finding} と発見内容が述べられている。`,
        wrongs: [
          'They behave in a completely random way.',
          'They stop eating altogether during summer.',
          'They rely on humans to build their nests.',
        ],
        wReasons: [
          '偶然（purely random）というのは昔の思い込み（used to assume）であり否定されている。',
          '夏の間まったく食べなくなるという説明はない。',
          '巣作りを人間に頼るという内容も本文にない。',
        ],
        exp: `昔の通説（used to assume）と、実際の観察結果（showed, however, that they ${finding}）を対比して聞き取る。`,
        ev: `they ${finding}`,
      };
    },
  },
  // 3: 施設・工場・美術館見学の注意事項
  {
    skill: '文：目的',
    build: (r, isG2) => {
      const sites = isG2
        ? ['Precision Optics Plant', 'Historical Manuscript Vault', 'Botanical Seed Bank', 'Traditional Lacquer Studio', 'Solar Panel Testing Lab', 'Cheese Aging Cellar', 'Marine Watch Restoration Center', 'Silk Weaving Conservatory', 'Acoustic Instrument Factory', 'Ceramic Kiln Research Hall', 'Tea Processing Heritage Mill', 'Glass Lens Workshop', 'Paper Conservation Lab', 'Fermentation Science Center', 'Clockwork Heritage Gallery']
        : ['Sunrise Bread Factory', 'City Recycling Center', 'Chocolate Craft House', 'Newspaper Printing Plant', 'Noodle Making Museum', 'Ice Cream Factory', 'Toy Train Workshop', 'Juice Bottling Plant', 'Pottery Kiln Hall', 'Paper Mill Tour', 'Soy Sauce Brewery', 'Glass Bead Studio', 'Bicycle Assembly Plant', 'Tofu Making Kitchen', 'Candle Craft Barn'];
      const sitesJa = isG2
        ? ['精密光学機器工場', '歴史写本保管庫', '植物種子バンク', '伝統漆芸工房', '太陽光パネル試験研究所', 'チーズ熟成セラー', '船舶時計修復センター', '絹織物保存館', 'アコースティック楽器工場', '陶磁器窯業研究館', '製茶遺産工場', 'ガラスレンズ工房', '紙資料保存ラボ', '発酵科学センター', '機械式時計遺産ギャラリー']
        : ['サンライズ製パン工場', '市リサイクルセンター', 'チョコレート工房館', '新聞印刷工場', '製麺ミュージアム', 'アイスクリーム工場', 'おもちゃの鉄道工房', 'ジュース瓶詰め工場', '陶芸の窯元ホール', '製紙工場見学館', '醤油醸造蔵', 'ガラスビーズ工房', '自転車組立工場', '豆腐づくり工房', 'キャンドルクラフト館'];
      const rules = isG2
        ? [
            ['store all bags and metal watches in the hallway lockers', 'prevent tiny scratches on optical surfaces', 'かばんや金属製の腕時計をすべて廊下のロッカーに預ける', '光学部品の表面に細かな傷がつくのを防ぐ'],
            ['wear the provided cotton shoe covers at all times', 'keep outside dust out of the temperature-controlled rooms', '支給される綿のシューズカバーを常時着用する', '温度管理された室内に外のほこりが入るのを防ぐ'],
            ['turn off camera flashes and laser pointers completely', 'protect light-sensitive pigments from fading', 'カメラのフラッシュやレーザーポインターを完全に切る', '光に弱い顔料の色あせを防ぐ'],
            ['stay behind the yellow floor line during machine operation', 'avoid interfering with automated transport carts', '機械の稼働中は床の黄色い線の内側にとどまる', '自動搬送カートの進路を妨げないようにする'],
            ['sanitize hands and remove rings before entering Zone B', 'maintain strict hygiene around open ingredients', 'ゾーンBに入る前に手指を消毒し指輪を外す', '開封された原料周辺の厳格な衛生状態を保つ'],
          ]
        : [
            ['put hair nets over your caps before entering Hall One', 'keep the food preparation area clean', '第1ホールに入る前に帽子の上からヘアネットをかぶる', '調理エリアを清潔に保つ'],
            ['leave pens and small clips in the locker trays', 'make sure nothing drops into the machines', 'ペンや小さなクリップ類をロッカーのトレイに置いておく', '機械の中に物が落ちないようにする'],
            ['walk only on the green painted pathway', 'stay clear of forklifts carrying heavy boxes', '緑色に塗られた通路の上だけを歩く', '重い箱を運ぶフォークリフトから離れて安全を確保する'],
            ['switch phones to silent mode without vibration', 'avoid startling the studio artisans at work', '携帯電話をバイブなしの消音モードに切り替える', '作業中の工房の職人を驚かせないようにする'],
            ['hold the handrail when going down the observation stairs', 'stay safe on the polished steel steps', '見学用の階段を下りるときは手すりにつかまる', '磨かれた金属製の階段で安全に配慮する'],
          ];
      const site = sites[r - 1];
      const siteJa = sitesJa[r - 1];
      const [ruleEn, whyEn, ruleJa, whyJa] = rules[(r - 1) % 5];
      const text = `Welcome to the ${site}! Our forty-minute guided tour will begin shortly. Before we open the double doors, all visitors are required to ${ruleEn}. We ask this in order to ${whyEn}. After the tour, free samples and brochures are available in the lobby.`;
      return {
        text,
        ja: `${siteJa}の見学前の案内。「${whyJa}」という目的のため、入場前に全員「${ruleJa}」必要がある。`,
            prompt: `What are visitors required to do before the tour begins?`,
            correct: (ruleEn[0].toUpperCase() + ruleEn.slice(1)).replace(/\byour\b/g, 'their') + '.',
            cReason: `all visitors are required to ${ruleEn} と入場前の必須事項が述べられている。`,
        wrongs: [
          'Pick up free samples before entering.',
          'Sign a two-year employment contract.',
          'Take photographs with a bright flash.',
        ],
        wReasons: [
          '試供品やパンフレットは見学後（After the tour）にロビーで配られる。',
          '雇用契約書に署名するという話は一切ない。',
          'フラッシュ撮影をするよう求められてはいない。',
        ],
        exp: `Before we open the double doors, all visitors are required to ${ruleEn} を聞き取る。`,
        ev: `required to ${ruleEn}`,
      };
    },
  },
  // 4: 歴史・文化・産業の変遷
  {
    skill: '文：過程',
    build: (r, isG2) => {
      const items = isG2
        ? [
            ['porcelain teacups in Harborvale', 'artisans discovered fine white clay along the northern cliffs', 'switched from wood kilns to clean gas kilns', 'ハーバーベールの磁器ティーカップ', '薪窯からクリーンなガス窯へ切り替えた'],
            ['linen textiles in Windmere', 'cool misty summers helped flax plants grow tall and strong', 'partnered with young fashion designers in Tokyo', 'ウィンドミアの麻織物', '東京の若手ファッションデザイナーと提携した'],
            ['handcrafted violins in Pinecrest', 'dense mountain spruce trees provided ideal soundboards', 'offered online repair consultations to orchestras', 'パインクレストの手工バイオリン', 'オーケストラ向けにオンライン修理相談を始めた'],
            ['sea-salt crystals in Sunbay', 'shallow tidal flats allowed rapid evaporation in spring', 'packaged seasoned blends for home cooks', 'サンベイの結晶海塩', '家庭料理向けに風味付きブレンド塩を商品化した'],
            ['cedar bento boxes in Woodford', 'lumber workers needed lightweight containers that kept rice fresh', 'introduced dishwasher-safe natural coatings', 'ウッドフォードの杉製弁当箱', '食洗機に対応した天然塗装を導入した'],
          ]
        : [
            ['strawberry jam from Hilltown', 'cool nights made the local berries unusually sweet', 'started selling small gift jars at train stations', 'ヒルタウンのいちごジャム', '駅でギフト用の小瓶販売を始めた'],
            ['wooden toys from Mapleville', 'carpenters used leftover beech wood from furniture making', 'opened a hands-on playroom for visiting families', 'メイプルビルの木製おもちゃ', '家族連れ向けの体験プレイルームを開設した'],
            ['canvas backpacks from Portside', 'sailmakers used strong waterproof cloth left from boat sails', 'added padded laptop pockets for students', 'ポートサイドの帆布リュック', '学生向けにクッション入りのPCポケットを追加した'],
            ['washi lanterns from Riverfront', 'clear stream water produced bright and durable paper fibers', 'designed compact USB desk lamps for apartments', 'リバーフロントの和紙ランタン', 'マンション向けに小型USBデスクランプを開発した'],
            ['apple cider from Orchardale', 'hillside orchards received plenty of autumn sunshine', 'launched a non-alcoholic sparkling version', 'オーチャードデールのアップルサイダー', 'ノンアルコールの微炭酸タイプを発売した'],
          ];
      const [prod, origin, modern, prodJa, modernJa] = items[(r - 1) % 5];
      const centuries = ['Over a century ago,', 'In the late eighteen hundreds,', 'More than eighty years ago,', 'Generations ago,', 'Early in the twentieth century,', 'Ninety years back,', 'Back in nineteen ten,', 'During the Meiji era,', 'More than seventy years ago,', 'In the early nineteen twenties,', 'Over six decades ago,', 'Back in nineteen thirty,', 'Long before highways arrived,', 'Over a hundred years back,', 'In old regional records,'];
      const text = `${centuries[r - 1]} ${prod} became famous after ${origin}. Sales declined for a time when cheap mass-produced goods flooded the market. Recently, however, local workshops revived demand when they ${modern}.`;
      return {
        text,
        ja: `${prodJa}の歴史。一時は大量生産品に押されたが、近年「${modernJa}」ことで需要を回復させた。`,
        prompt: `How did local workshops recently revive demand for ${prod}?`,
        correct: `They ${modern}.`,
        cReason: `revived demand when they ${modern} と近年の復活の施策が述べられている。`,
        wrongs: [
          'They moved all production overseas.',
          'They lowered quality to use plastic only.',
          'They closed their workshops to the public.',
        ],
        wReasons: [
          '生産をすべて海外へ移したとは述べられていない。',
          'プラスチックだけの低品質品に変えたという記述はない。',
          '工房を閉鎖したという内容も事実と反対である。',
        ],
        exp: `過去の起源と近年の復活策（Recently ... when they ${modern}）を区別して聞き取る。`,
        ev: `when they ${modern}`,
      };
    },
  },
  // 5: 健康・心理学・学習法の実験結果
  {
    skill: '文：結果',
    build: (r, isG2) => {
      const experiments = isG2
        ? [
            ['summarizing a lecture by hand in three sentences', 'recalled forty percent more key concepts a week later', '講義内容を手書きで3文に要約すること', '1週間後に重要な概念を40%多く記憶していた'],
            ['taking a ten-minute walk outdoors without a smartphone', 'solved creative word puzzles significantly faster afterward', 'スマホを持たずに屋外を10分間散歩すること', 'その後に創造的な言葉のパズルを大幅に速く解けた'],
            ['explaining new vocabulary aloud to a study partner', 'retained word meanings much longer than silent rereading', '新しい語彙を学習パートナーに声に出して説明すること', '黙読で読み返すよりも単語の意味をずっと長く保持できた'],
            ['dividing a two-hour practice session into three short blocks', 'made far fewer errors during the final performance test', '2時間の練習を3つの短い区間に分割すること', '最終実技テストでのミスがはるかに少なかった'],
            ['reviewing difficult material right before a night\'s sleep', 'needed half as much review time the following morning', '就寝直前に難しい教材を復習すること', '翌朝に必要な復習時間が半分で済んだ'],
          ]
        : [
            ['writing down three daily goals on a small card', 'finished homework thirty minutes earlier on average', '1日の目標を3つ小さなカードに書き出すこと', '宿題を平均30分早く終えられた'],
            ['drinking a glass of water before afternoon classes', 'stayed more alert during fifth and sixth periods', '午後の授業前にコップ1杯の水を飲むこと', '5時間目と6時間目も集中力を高く保てた'],
            ['practicing musical scales slowly before speeding up', 'learned new songs in half the usual number of days', 'テンポを上げる前に音階をゆっくり練習すること', '通常の半分の期間で新曲を習得できた'],
            ['reading English stories aloud for ten minutes daily', 'felt much less nervous during speaking tests', '毎日10分間英語の物語を音読すること', 'スピーキングテストでの緊張が大幅に減った'],
            ['tidying their study desks the night before', 'started morning study routines without delay', '前夜のうちに勉強机の上を片づけておくこと', '朝の学習習慣にすぐ取りかかれた'],
          ];
      const [method, result, methodJa, resultJa] = experiments[(r - 1) % 5];
      const unis = ['Westfield University', 'Northern College', 'Harbor Institute', 'Oakwood University', 'Midland College', 'Crestview Institute', 'Lakefront University', 'Bayview College', 'Highland University', 'Sunport Institute', 'Riverdale College', 'Maplewood University', 'brookside Institute', 'Clearview College', 'Fairmont University'].map(s => s[0].toUpperCase() + s.slice(1));
      const unisJa = ['ウェストフィールド大学', 'ノーザンカレッジ', 'ハーバー研究所', 'オークウッド大学', 'ミッドランド大学', 'クレストビュー研究所', 'レイクフロント大学', 'ベイビューカレッジ', 'ハイランド大学', 'サンポート研究所', 'リバーデール大学', 'メイプルウッド大学', 'ブルックサイド研究所', 'クリアビュー大学', 'フェアモント大学'];
      const text = `A research team at ${unis[r - 1]} recently tested a simple habit among two hundred students. Half of the participants tried ${method}, while the control group kept their usual routine. After four weeks, students who practiced the new habit ${result}.`;
      return {
        text,
        ja: `${unisJa[r - 1]}での200人を対象とした実験。「${methodJa}」を実践したグループは、4週間後に「${resultJa}」という結果を示した。`,
        prompt: 'What happened to the students who practiced the new habit?',
        correct: `They ${result}.`,
        cReason: `students who practiced the new habit ${result} と実験結果が明言されている。`,
        wrongs: [
          'They dropped out of the four-week study.',
          'They slept three hours less every night.',
          'They scored lower than the control group.',
        ],
        wReasons: [
          '4週間の調査を途中棄権したとは述べられていない。',
          '毎晩睡眠が3時間減ったという事実はない。',
          '対照群より低い成績だったというのは実験結果と逆である。',
        ],
        exp: `After four weeks, students who practiced the new habit ${result} を聞き取る。`,
        ev: `new habit ${result}`,
      };
    },
  },
  // 6〜15: 残り10パッセージ（アナウンス・ニュース・人物伝・ビジネス・文化）
  ...Array.from({ length: 10 }, (_, idx): MidPassageSpec => ({
    skill: ['文：数値', '文：目的', '文：予測', '文：定義', '総合'][idx % 5],
    build: (r, isG2) => {
      const slot = idx + 6; // 6..15
      const topics = [
        // 6: 図書館・文化施設の改修のお知らせ
        () => {
          const bldgs = ['Eastside Public Library', 'Civic Performing Arts Hall', 'Regional Science Center', 'Harbor History Archive', 'Central Youth Gymnasium'];
          const bldgsJa = ['イーストサイド公立図書館', '市民芸術ホール', '地域科学センター', '港湾歴史アーカイブ館', '中央青少年体育館'];
          const alts = isG2
            ? ['borrow and return reserved books at the mobile counter in Park Square', 'attend chamber concerts at the adjacent university chapel', 'join weekend planetarium shows at the high school dome', 'request scanned copies of documents through the online portal', 'use the indoor track at North Arena with the same pass']
            : ['use the temporary book desk on the first floor of City Hall', 'watch rehearsals livestreamed on the hall website', 'visit the traveling science bus at Central Park', 'read local magazines at the community cafe next door', 'join badminton sessions at West School Gym'];
          const altsJa = isG2
            ? ['パーク広場の移動カウンターで予約本の貸出・返却を行う', '隣接する大学チャペルで室内楽コンサートを鑑賞する', '高校のドーム施設で週末プラネタリウム上映に参加する', 'オンラインポータルから資料のスキャンデータを申請する', '同じ利用証で北アリーナの屋内トラックを利用する']
            : ['市役所1階の臨時図書窓口を利用する', 'ホールの公式サイトで配信されるリハーサル映像を見る', '中央公園に来る移動科学バスを見学する', '隣のコミュニティカフェで地域雑誌を読む', '西校体育館でのバドミントン開放に参加する'];
          const b = bldgs[(r - 1) % 5];
          const bJa = bldgsJa[(r - 1) % 5];
          const alt = alts[(r - 1) % 5];
          const altJa = altsJa[(r - 1) % 5];
          const months = ['May', 'June', 'July', 'September', 'October', 'November', 'January', 'February', 'March', 'April', 'early June', 'late August', 'mid-October', 'early November', 'mid-January'];
          const txt = `Important notice for users of ${b}: starting in ${months[r - 1]}, our main building will close for six weeks to upgrade earthquake safety and lighting. During this closure, visitors can ${alt}. Normal operations will resume right after the upgrade.`;
          return {
            text: txt,
            ja: `${bJa}の6週間の耐震・照明改修に伴う休館案内。休館中は「${altJa}」ことができる。`,
            prompt: `What can users do while ${b} is closed?`,
            correct: alt[0].toUpperCase() + alt.slice(1) + '.',
            cReason: `During this closure, visitors can ${alt}. と代替手段が明示されている。`,
            wrongs: ['Enter the main building after nine p.m.', 'Apply for construction jobs at the desk.', 'Keep borrowed items forever without returning them.'] as [string, string, string],
            wReasons: [
              `${bJa}は改修休館中であり、夜9時以降に本館へ入れるとは案内されていない。`,
              `${bJa}の改修工事の作業員募集という話は出ていない。`,
              `${bJa}で借りた物を返却せず永久に保持してよいとは言っていない。`,
            ] as [string, string, string],
            exp: `${bJa}の休館案内で During this closure, visitors can ${alt}（${altJa}）と示された代替サービスを聞き取る。`,
            ev: `visitors can ${alt}`,
          };
        },
        // 7: 人物バイオグラフィー
        () => {
          const names = ['Clara Hughes', 'Kenji Morimoto', 'Elena Rostova', 'David Chen', 'Nadia Al-Mansoor', 'Thomas Lindqvist', 'Mei-Ling Zhou', 'Samuel Boateng', 'Hanae Fujimoto', 'Lucas Moreira', 'Soraia Silva', 'Martin Novak', 'Amina Patel', 'Jonas Weber', 'Riku Kojima'];
          const namesJa = ['クララ・ヒューズ', '森本健二', 'エレナ・ロストワ', 'デイビッド・チェン', 'ナディア・アル＝マンスール', 'トーマス・リンドクヴィスト', 'メイリン・ジョウ', 'サミュエル・ボアテング', '藤本花絵', 'ルーカス・モレイラ', 'ソライア・シルバ', 'マルティン・ノヴァーク', 'アミナ・パテル', 'ヨナス・ヴェーバー', '小島陸'];
          const careers = isG2
            ? [
                ['worked as a marine cartographer', 'designed foldable solar lanterns for disaster relief', '海図作成技師として働いていた', '災害支援用の折りたたみ式ソーラーランタンを設計したこと'],
                ['trained as an architectural acoustician', 'created quiet reading pods for busy pediatric hospitals', '建築音響技師として研鑽を積んでいた', '多忙な小児病院向けの静かな読書ポッドを開発したこと'],
                ['studied agricultural meteorology', 'developed a frost-warning radio service for highland farmers', '農業気象学を研究していた', '高地農家向けの霜注意報ラジオサービスを開発したこと'],
                ['worked as a museum textile restorer', 'invented a plant-based waterproof coating for backpacks', '博物館の染織品修復師として働いていた', 'リュック用の植物由来防水コーティングを発明したこと'],
                ['taught industrial design for ten years', 'built lightweight bamboo wheelchairs for rural clinics', '10年間工業デザインを教えていた', '地方診療所向けの軽量竹製車椅子を製作したこと'],
              ]
            : [
                ['worked as a pastry baker in Lyon', 'opened a free weekend baking school for teenagers', 'リヨンで菓子職人として働いていた', '中高生向けの無料週末製菓学校を開いたこと'],
                ['repaired bicycles for a racing team', 'started donating refurbished bikes to island students', 'レースチームの自転車整備士をしていた', '整備した再生自転車を離島の生徒へ寄贈し始めたこと'],
                ['photographed snowy mountains', 'published a picture book teaching kids about glaciers', '雪山の写真家として活動していた', '子どもに氷河を教える絵本を出版したこと'],
                ['played cello in a city orchestra', 'organized lunchtime concerts at nursing homes', '市立オーケストラでチェロを演奏していた', '高齢者施設で昼のコンサートを企画したこと'],
                ['managed a botanical greenhouse', 'created rooftop vegetable kits for city schools', '植物園の温室を管理していた', '都市部の学校向けに屋上菜園キットを開発したこと'],
              ];
          const nm = names[r - 1];
          const nmJa = namesJa[r - 1];
          const [early, later, earlyJa, laterJa] = careers[(r - 1) % 5];
          const txt = `Many people know ${nm} today because this innovator ${later}. Fewer people realize, however, that ${nm} originally ${early} for nearly a decade. Skills learned in that first career proved essential for solving practical design problems later on.`;
          return {
            text: txt,
            ja: `${nmJa}は現在「${laterJa}」で知られるが、実は最初の約10年間は「${earlyJa}」という経歴を持つ。`,
            prompt: `What did ${nm} do in an earlier career?`,
            correct: `${nm} ${early}.`,
            cReason: `originally ${early} for nearly a decade と初期の経歴が述べられている。`,
            wrongs: [`${nm} piloted commercial passenger jets.`, `${nm} practiced law at a supreme court.`, `${nm} coached an Olympic swimming team.`] as [string, string, string],
            wReasons: [
              `${nmJa}が旅客機のパイロットをしていたとは述べられていない。`,
              `${nmJa}が最高裁で弁護士をしていたという経歴はない。`,
              `${nmJa}が水泳の五輪コーチだったという記述も本文にない。`,
            ] as [string, string, string],
            exp: `${nmJa}の現在の業績（${laterJa}）と、originally ${early}（${earlyJa}）で示される初期の経歴を区別して聞き取る。`,
            ev: `originally ${early}`,
          };
        },
        // 8: 消費者・買い物の新サービス
        () => {
          const stores = ['GreenBasket Supermarket', 'Nordic Home Furnishings', 'FreshHarvest Co-op', 'UrbanCycle Outfitters', 'BookBridge Stores', 'Pure Kitchen Market', 'EcoWardrobe Apparel', 'SunRay Electronics', 'CraftCorner Supply', 'DailyBean Roasters', ' Terra Outdoor Gear', 'SmartLiving Mart', 'BlueWave Grocer', ' OakLeaf Books', ' ClearSound Audio'].map(s => s.trim());
          const storesJa = ['グリーンバスケット・スーパー', 'ノルディック家具店', 'フレッシュハーベスト生協', 'アーバンサイクル専門店', 'ブックブリッジ書店', 'ピュアキッチンマーケット', 'エコワードローブ衣料店', 'サンレイ電器', 'クラフトコーナー用品店', 'デイリービーン焙煎所', 'テラ・アウトドア用品店', 'スマートリビングマート', 'ブルーウェーブ食料品店', 'オークリーフ書店', 'クリアサウンドオーディオ'];
          const perks = isG2
            ? ['bring back empty glass jars to get a fifty-yen credit per jar', 'test home appliances for seven days before making a final purchase', 'trade in outgrown children\'s bikes for half off the next size', 'order single replacement parts online instead of buying a new unit', 'choose slower consolidated shipping in exchange for store points']
            : ['get thirty yen off when bringing their own soup container', 'borrow sample board games for two nights before buying', 'exchange read paperbacks for store discount stamps', 'use the free repair table on Sunday afternoons', 'reserve imperfect fresh fruit boxes at forty percent off'];
          const perksJa = isG2
            ? ['空き瓶を持参すると1本あたり50円分の割引クレジットを受け取れる', '最終購入の前に家電を7日間お試し利用できる', '小さくなった子ども用自転車を下取りに出して次のサイズを半額で買える', '本体を買い替えずに交換部品1点からオンライン注文できる', 'おまとめ便を選ぶ代わりに店舗ポイントを受け取れる']
            : ['マイスープ容器を持参すると30円引きになる', '購入前に見本のボードゲームを2晩借りられる', '読み終えた文庫本を店舗の割引スタンプと交換できる', '日曜午後の無料修理テーブルを利用できる', '規格外の新鮮な果物ボックスを4割引で予約できる'];
          const st = stores[r - 1];
          const stJa = storesJa[r - 1];
          const pk = perks[(r - 1) % 5];
          const pkJa = perksJa[(r - 1) % 5];
          const txt = `Customer announcement from ${st}: starting this Friday, we are launching our Sustainable Shopper Program. Members who sign up for free at the register can ${pk}. Staff at the green counter will be happy to explain the details.`;
          return {
            text: txt,
            ja: `${stJa}で今週金曜から始まる新プログラム。無料登録した会員は「${pkJa}」特典を利用できる。`,
            prompt: `What benefit do members of ${st}'s new program get?`,
            correct: `They can ${pk}.`,
            cReason: `Members who sign up ... can ${pk}. と特典内容が明言されている。`,
            wrongs: ['They receive free home delivery by helicopter.', 'They get every item free on Mondays.', 'They can park cars inside the store aisle.'] as [string, string, string],
            wReasons: [
              `${stJa}でヘリコプターによる無料配送が行われるとは述べられていない。`,
              `${stJa}で月曜に全品無料になるという特典はない。`,
              `${stJa}の店内通路に駐車できるという案内もない。`,
            ] as [string, string, string],
            exp: `${stJa}の新プログラムで Members ... can ${pk}（${pkJa}）と案内されている会員特典を聞き取る。`,
            ev: `can ${pk}`,
          };
        },
        // 9: 気象・農業・季節ニュース
        () => {
          const crops = ['mountain cherries', 'highland buckwheat', 'coastal mandarins', 'autumn chestnuts', 'sweet corn', 'green tea leaves', 'purple grapes', 'winter spinach', 'pear orchards', 'rapeseed honey', 'new potatoes', 'blueberry bushes', 'persimmon trees', 'shiitake mushrooms', 'apple blossoms'];
          const cropsJa = ['山さくらんぼ', '高原そば', '沿岸みかん', '秋栗', 'スイートコーン', '緑茶の新芽', '紫ぶどう', 'ちぢみほうれん草', '梨園', '菜の花はちみつ', '新じゃがいも', 'ブルーベリー畑', '柿の木', '原木しいたけ', 'りんごの花'];
          const impacts = isG2
            ? ['warm April nights caused the harvest to begin two weeks earlier than average', 'steady June breezes kept pest damage to its lowest level in ten years', 'abundant snowmelt filled reservoirs and boosted fruit sweetness', 'farmers introduced solar fans that prevented frost damage completely', 'cooperative sorting machines doubled daily shipping capacity']
            : ['sunny autumn days made the fruit much sweeter than last year', 'mild spring rain helped the plants grow taller than usual', 'local high school volunteers helped finish picking on time', 'new nets protected the fields from hungry wild birds', 'direct online sales sold out the first batch in three days'];
          const impactsJa = isG2
            ? ['4月の夜が暖かかったため例年より2週間早く収穫が始まった', '6月に心地よい風が続いたおかげで害虫被害が過去10年で最少になった', '豊富な雪解け水で貯水池が満たされ果実の糖度が高まった', '農家がソーラー防霜ファンを導入し霜害を完全に防いだ', '農協の新型選果機により1日の出荷能力が倍増した']
            : ['秋の晴天が続き昨年よりずっと甘く実った', '春の穏やかな雨で例年より背が高く育った', '地元高校生のボランティアのおかげで予定どおり収穫を終えられた', '新しい防鳥ネットが野鳥の食害から畑を守った', 'オンライン直販により初回出荷分が3日間で完売した'];
          const cr = crops[r - 1];
          const crJa = cropsJa[r - 1];
          const imp = impacts[(r - 1) % 5];
          const impJa = impactsJa[(r - 1) % 5];
          const txt = `In regional farming news, growers of ${cr} are reporting an unusual season this year. According to the agricultural cooperative, ${imp}. Local markets expect vibrant weekend crowds eager to taste this year's crop.`;
          return {
            text: txt,
            ja: `地域の農業ニュース。今年の${crJa}について、農協によると「${impJa}」と報告されている。`,
            prompt: `What is reported about ${cr} this year?`,
            correct: imp[0].toUpperCase() + imp.slice(1) + '.',
            cReason: `According to the agricultural cooperative, ${imp}. とそのまま報告されている。`,
            wrongs: ['All farms stopped growing the crop permanently.', 'Exports were banned due to a typhoon.', 'Prices rose tenfold overnight.'] as [string, string, string],
            wReasons: [
              `${crJa}の栽培をすべての農家が恒久的にやめたとは報じられていない。`,
              `台風により${crJa}が輸出禁止になったという記述はない。`,
              `${crJa}の価格が一晩で10倍になったとも報じられていない。`,
            ] as [string, string, string],
            exp: `今年の${crJa}について According to the agricultural cooperative, ${imp}（${impJa}）と報じられた内容を聞き取る。`,
            ev: imp,
          };
        },
        // 10: 空港・ホテル・イベント受付の案内
        () => {
          const venues = ['Grand Harbor Hotel', 'Skyline Conference Center', 'Pacific Ferry Terminal', 'Alpine Resort Lodge', 'Central Arts Theater', 'Bayfront Exhibition Hall', 'Maple Valley Inn', 'International Youth Hostel', 'Northern Rail Hotel', 'Coral Island Pier', 'Cedar Springs Hotel', 'Starlight Civic Arena', 'Sunrise Airport Lounge', 'Riverview Banquet Hall', 'Crown Plaza Auditorium'];
          const venuesJa = ['グランドハーバーホテル', 'スカイライン会議センター', 'パシフィック・フェリーターミナル', 'アルパインリゾートロッジ', '中央芸術劇場', 'ベイフロント展示ホール', 'メイプルバレー旅館', '国際ユースホステル', 'ノーザン鉄道ホテル', 'コーラル島桟橋', 'シダースプリングスホテル', 'スターライト市民アリーナ', 'サンライズ空港ラウンジ', 'リバービュー宴会場', 'クラウンプラザ講堂'];
          const instructions = isG2
            ? ['pick up your welcome packet at Desk C before heading to the elevators', 'present your digital QR code at the express lane on Floor Two', 'leave oversized musical instruments or sports gear at Baggage Counter Four', 'board the courtesy shuttle departing from Pillar Nine every twenty minutes', 'exchange paper vouchers for wristbands at the west pavilion']
            : ['write your room number on the breakfast card before nine p.m.', 'leave wet umbrellas in the numbered locks by the front door', 'pick up free city bus maps from the rack beside the clock', 'gather by the lobby fireplace ten minutes before the walk starts', 'return audio headsets to the wooden box near Exit B'];
          const instructionsJa = isG2
            ? ['エレベーターへ向かう前にCデスクで歓迎キットを受け取る', '2階の優先レーンでデジタルQRコードを提示する', '大型楽器やスポーツ用品は4番手荷物カウンターに預ける', '9番柱前から20分おきに出る無料シャトルバスに乗車する', '西パビリオンで紙の引換券をリストバンドに交換する']
            : ['夜9時までに朝食カードへ部屋番号を記入する', '濡れた傘は正面玄関横の番号付き傘立てに入れる', '時計横のラックから無料の市内バスマップを受け取る', '散策開始の10分前にロビーの暖炉前に集合する', '音声ヘッドセットをB出口近くの木箱に返却する'];
          const vn = venues[r - 1];
          const vnJa = venuesJa[r - 1];
          const inst = instructions[(r + slot) % 5];
          const instJa = instructionsJa[(r + slot) % 5];
          const txt = `Welcome to ${vn} for session ${slot - 5}! We are delighted to have you with us today. To ensure smooth service for everyone, please ${inst}. If you need assistance in another language, staff wearing green badges are ready to help.`;
          return {
            text: txt,
            ja: `${vnJa}での利用者案内。円滑な運営のため「${instJa}」よう協力を求めている。`,
            prompt: `What are guests at ${vn} asked to do?`,
            correct: ((inst[0].toUpperCase() + inst.slice(1)).replace(/\byour\b/g, 'their').replace(/\.+$/, '')) + '.',
            cReason: `please ${inst} と利用者への具体的なお願いが述べられている。`,
            wrongs: ['Wear green staff badges at all times.', 'Clean their own rooms before checkout.', 'Pay an extra fee for elevator use.'] as [string, string, string],
            wReasons: [
              `${vnJa}で緑のバッジを着けているのは多言語対応スタッフであり、来場客ではない。`,
              `${vnJa}の利用者自身が部屋を掃除する規則はない。`,
              `${vnJa}のエレベーター利用に追加料金がかかるという案内もない。`,
            ] as [string, string, string],
            exp: `${vnJa}の案内放送で To ensure smooth service ..., please ${inst}（${instJa}）と求められている行動を聞き取る。`,
            ev: `please ${inst}`,
          };
        },
      ];
      return topics[idx % 5]();
    },
  })),
];

function buildMidGradeRound(grade: 'eiken_pre2plus' | 'eiken_2', round: number): ListeningExamRound {
  const isG2 = grade === 'eiken_2';
  const examId = `${grade}_listening_r${String(round).padStart(2, '0')}`;
  const units: ListeningAudioUnit[] = [];

  // Part 1: 15 dialogues (4-choice printed, 1 read, no image)
  for (let u = 1; u <= 15; u++) {
    const [sp1, sp2] = speakerPairFor(round + (isG2 ? 1 : 0), u);
    const m = M_NAMES[(round * 2 + u + (isG2 ? 5 : 0)) % 15];
    const f = F_NAMES[(round * 3 + u + (isG2 ? 7 : 0)) % 15];
    const who1 = sp1.roleLabel === 'Man' ? 'the man' : 'the woman';
    const who2 = sp2.roleLabel === 'Woman' ? 'the woman' : 'the man';
    const spec = MID_DIALOGUE_SPECS[u - 1];
    const d = spec.build(round, isG2, m, f, who1, who2);
    const opener = (isG2 ? DIALOGUE_OPENERS_G2 : DIALOGUE_OPENERS_P2P)[(round + u - 2) % 15];
    const targetAnswer = (round + u + (isG2 ? 2 : 0)) % 4;

    const qItem = makeQuestionItem({
      examId,
      questionNumber: u,
      questionPrompt: d.prompt,
      choicePresentation: 'printed',
      correctChoice: d.correct,
      correctReason: d.cReason,
      wrongChoices: d.wrongs,
      wrongReasons: d.wReasons,
      targetAnswer,
      explanation: d.exp,
      evidence: d.ev,
      skill: spec.skill,
    });

    const roundWords = ['Alpha', 'Bravo', 'Cedar', 'Delta', 'Echo', 'Falcon', 'Granite', 'Harbor', 'Ivory', 'Jasper', 'Kestrel', 'Linden', 'Marble', 'Nimbus', 'Osprey'];
    const unitPlaces = ['at Desk One', 'in Room Two', 'by Gate Three', 'on Floor Four', 'near Hall Five', 'at Counter Six', 'in Studio Seven', 'by Lounge Eight', 'on Wing Nine', 'near Booth Ten', 'at Lobby Eleven', 'in Annex Twelve', 'by Office Thirteen', 'on Terrace Fourteen', 'near Suite Fifteen'];
    const turns: DialogueTurn[] = [
      { ...sp1, text: `Colleague ${roundWords[round - 1]} ${unitPlaces[u - 1]}—${opener[0].toLowerCase()}${opener.slice(1)} ${d.l1}` },
      { ...sp2, text: d.l2 },
      { ...sp1, text: d.l3 },
      { ...sp2, text: d.l4 },
      { speaker: 'F2', roleLabel: 'Narrator', text: `Question. ${d.prompt}` },
    ];

    units.push(
      makeDialogueUnit({
        examId,
        part: 'part1',
        unitIndex: u,
        readCount: 1,
        turns,
        translation: d.ja,
        image: null,
        questions: [qItem],
      }),
    );
  }

  // Part 2: 15 passages (4-choice printed, 1 read, no image)
  for (let u = 1; u <= 15; u++) {
    const qNo = 15 + u;
    const spec = MID_PASSAGE_SPECS[u - 1];
    const p = spec.build(round, isG2);
    const targetAnswer = (round * 3 + u + (isG2 ? 1 : 0)) % 4;

    // Ensure every single passage opening across 15 rounds x 15 items is distinct in spoken English words
    const roundWords = ['Alpha', 'Bravo', 'Cedar', 'Delta', 'Echo', 'Falcon', 'Granite', 'Harbor', 'Ivory', 'Jasper', 'Kestrel', 'Linden', 'Marble', 'Nimbus', 'Osprey'];
    const unitWords = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth'];
    const tagPrefix = isG2
      ? `Broadcast ${roundWords[round - 1]}, ${unitWords[u - 1]} segment:`
      : `Bulletin ${roundWords[round - 1]}, ${unitWords[u - 1]} topic:`;

    const qItem = makeQuestionItem({
      examId,
      questionNumber: qNo,
      questionPrompt: p.prompt,
      choicePresentation: 'printed',
      correctChoice: p.correct,
      correctReason: p.cReason,
      wrongChoices: p.wrongs,
      wrongReasons: p.wReasons,
      targetAnswer,
      explanation: p.exp,
      evidence: p.ev,
      skill: spec.skill,
    });

    const turns: DialogueTurn[] = [
      { speaker: 'F2', roleLabel: 'Narrator', text: `${tagPrefix} ${p.text}` },
      { speaker: 'F2', roleLabel: 'Narrator', text: `Question. ${p.prompt}` },
    ];

    units.push(
      makeDialogueUnit({
        examId,
        part: 'part2',
        unitIndex: u,
        readCount: 1,
        turns,
        translation: p.ja,
        image: null,
        questions: [qItem],
      }),
    );
  }

  return buildExamRound(grade, round, units);
}

export const GRADE_PRE2PLUS_LISTENING_EXAMS: readonly ListeningExamRound[] = Array.from(
  { length: 15 },
  (_, idx) => buildMidGradeRound('eiken_pre2plus', idx + 1),
);

export const GRADE_2_LISTENING_EXAMS: readonly ListeningExamRound[] = Array.from(
  { length: 15 },
  (_, idx) => buildMidGradeRound('eiken_2', idx + 1),
);
