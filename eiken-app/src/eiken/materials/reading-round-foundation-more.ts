import { question as q, passage as p, reorder, readingRound } from './reading-authoring';

export const READING_4_R3 = readingRound('eiken_4', [
  q(['Please write your name at the (     ) of the page.', ['top', 'taste', 'holiday', 'sound'], 0, 'ページの「一番上」に名前を書くのでat the top of the page。', ['topは上・頂上。ページの最上部。', 'tasteは味。', 'holidayは休日。', 'soundは音。'], 'ページの一番上に名前を書いてください。']),
  q(['My hands were cold, so I put them in my coat (     ).', ['gardens', 'bridges', 'tickets', 'pockets'], 3, '冷たい手を入れるコートの場所はpockets（ポケット）。', ['gardensは庭。', 'bridgesは橋。', 'ticketsは切符。', 'pocketsはポケット。'], '手が冷たかったので、コートのポケットに入れました。']),
  q(['There were no (     ) in the sky, so the sun was very bright.', ['floors', 'clouds', 'stamps', 'forks'], 1, '空に「雲」がなかったので太陽がまぶしかった。', ['floorsは床・階。', 'cloudsは雲。in the skyと合う。', 'stampsは切手。', 'forksはフォーク。'], '空に雲がひとつもなかったので、日差しがとても強かったです。']),
  q(['This sweater is too tight. Can I try a (     ) size?', ['larger', 'louder', 'slower', 'thirsty'], 0, 'きつすぎる（too tight）ので、より大きいサイズlargerを求める。', ['largerはより大きい。tightへの対処として自然。', 'louderはより音が大きい。', 'slowerはより遅い。', 'thirstyはのどが渇いた。'], 'このセーターはきつすぎます。もっと大きいサイズを試せますか。']),
  q(['Nao practices the violin every day. She wants to play in an (     ) one day.', ['orchestra', 'airport', 'umbrella', 'elevator'], 0, 'バイオリンを毎日練習し、将来演奏したい団体なのでorchestra（オーケストラ）。', ['orchestraはオーケストラ。', 'airportは空港。', 'umbrellaは傘。', 'elevatorはエレベーター。'], 'ナオは毎日バイオリンを練習しています。いつかオーケストラで演奏したいと思っています。']),
  q(['Math is (     ) than history for me, so I ask my sister for help.', ['difficulty', 'most difficult', 'difficult', 'more difficult'], 3, 'thanがあるので比較級more difficultを選ぶ。', ['difficultyは名詞。', 'most difficultは最上級。', 'difficultは原級。', 'more difficultは比較級。'], '私にとって数学は歴史より難しいので、姉に手伝ってもらいます。']),
  q(['Our dog barked (     ) when the delivery truck arrived.', ['louder than', 'loud', 'loudly', 'loudness'], 2, '動詞barkedを修飾する副詞loudly（大きな声で）。', ['thanの後ろに比較対象がない。', 'loudは主に形容詞。ここでは副詞loudlyが標準。', 'loudlyは副詞でbarkedを修飾する。', 'loudnessは名詞。'], '配達トラックが着いたとき、私たちの犬は大きな声でほえました。']),
  q(['A: (     ) do you play badminton?\nB: Twice a week.', ['How often', 'How tall', 'How much', 'How long'], 0, 'Twice a week（週に2回）と頻度を答えているのでHow often。', ['How oftenは頻度を尋ねる。', 'How tallは高さを尋ねる。', 'How muchは量や値段。', 'How longは期間や長さ。'], 'A：どのくらいの頻度でバドミントンをしますか。B：週に2回です。']),
  q(['I got off the train and (     ) the stairs to the ticket gate.', ['put on', 'walked down', 'turned on', 'gave up'], 1, '階段を「降りて」改札へ向かったのでwalked down。', ['put onは身につける。', 'walked down the stairsで階段を降りた。', 'turned onは電源を入れる。', 'gave upはあきらめる。'], '私は電車を降りて、改札へ続く階段を降りました。']),
  q(['Kenji (     ) to the library yesterday, but it was closed.', ['going', 'goes', 'go', 'went'], 3, 'yesterday（昨日）があるのでgoの過去形wentを選ぶ。', ['goingだけでは述語にならない。', 'goesは3人称単数の現在形。', 'goは原形・現在形。', 'wentはgoの過去形。'], 'ケンジは昨日図書館へ行きましたが、閉まっていました。']),
  q(['A: Did you finish cleaning your room?\nB: Not yet, Mom. I (     ) do it after lunch.', ['did', 'am', 'will', 'was'], 2, '昼食後にやりますという未来の意思を表す助動詞will。', ['didは過去でafter lunchの予定と合わない。', 'amの後ろに原形doは続かない。', 'will＋原形doで「〜します」。', 'wasの後ろに原形doは続かない。'], 'A：部屋の掃除は終わった？B：まだだよ、お母さん。昼食のあとにするね。']),
  q(['We decided (     ) sandwiches for our club trip.', ['making', 'makes', 'make', 'to make'], 3, 'decideの後ろにはto不定詞（to make）を置く。', ['decideの後ろに動名詞は置かない。', '3人称単数形は続かない。', '原形は続かない。', 'decide to makeで「作ることに決める」。'], '私たちはクラブの遠足にサンドイッチを作ることにしました。']),
  q(['You should wash your hands (     ) you eat dinner.', ['during', 'before', 'between', 'under'], 1, '節you eat dinnerを導き「夕食を食べる前に」を表す接続詞before。', ['duringは前置詞で後ろに節を置けない。', 'before＋節で「〜する前に」。', 'betweenは前置詞。', 'underは前置詞。'], '夕食を食べる前に手を洗うべきです。']),
  q(['Mount Fuji is the (     ) mountain in Japan.', ['higher', 'highly', 'highest', 'high'], 2, 'theがあり日本で一番を表す最上級highest。', ['higherは比較級。', 'highlyは副詞。', 'the highestで「最も高い」。', 'highは原級。'], '富士山は日本で一番高い山です。']),
  q(['Thank you for (     ) me carry these heavy boxes.', ['helps', 'helping', 'helped', 'help'], 1, '前置詞forの後ろには動名詞helpingを置く。', ['3人称単数形は置けない。', 'for helpingで「手伝ってくれたことに」。', '過去形は置けない。', '原形は前置詞の後ろに置けない。'], '重い箱を運ぶのを手伝ってくれてありがとう。']),
  q(['A: Oh no, I left my science textbook at home!\nB: (     ) Let\'s put our desks together and share mine.\nA: Thanks, you saved me!', ['That is fifty yen.', 'Don\'t worry.', 'Happy New Year.', 'In the afternoon.'], 1, '教科書を忘れた相手を「心配しないで」と安心させ、一緒に見ようと提案する。', ['金額の説明で不適切。', '相手を気遣い解決策につなげる自然な応答。', '新年のあいさつで不適切。', '時間帯の返答で不適切。'], 'A：大変、家に理科の教科書を忘れちゃった！ B：心配しないで。机をつけて僕のを一緒に見よう。 A：ありがとう、助かったよ！'], 'conversation'),
  q(['A: What is the weather going to be like tomorrow?\nB: (     ) We can play tennis outside.', ['Three degrees below zero.', 'Yesterday morning.', 'I like winter sports.', 'It will be sunny and warm.'], 3, '明日の天気を尋ねられ、外でテニスができる晴れて暖かい天気だと答える。', ['氷点下3度では暖かい外のテニスという展開に合いにくい。', '過去の時で合わない。', '冬のスポーツの好みは答えにならない。', '天気の質問と外でテニスができる展開に合う。'], 'A：明日の天気はどうなりそうですか。B：晴れて暖かくなるでしょう。外でテニスができますね。'], 'conversation'),
  q(['A: Excuse me. Where can I buy stamps near here?\nB: (     ) It is open until six.\nA: Thank you! I\'ll go right now.', ['I wrote three letters last night.', 'At the convenience store over there.', 'Yes, please put it on the desk.', 'It takes about ten days by ship.'], 1, '切手を買える場所を尋ねられ、あそこのコンビニで買えると教える。', ['手紙を書いた数は答えにならない。', 'Where can I buy ...? に対する適切な場所の案内。', '勧めを受ける表現で合わない。', '期間の返答で合わない。'], 'A：すみません。この近くで切手はどこで買えますか。 B：あそこのコンビニで買えますよ。6時まで開いています。 A：ありがとうございます！今すぐ行ってきます。'], 'conversation'),
  q(['A: Why were you running this morning, Kenta?\nB: (     ) I woke up late.', ['I didn\'t want to miss the bus.', 'Because I like apples.', 'To the second floor.', 'My sister is twelve.'], 0, '朝走っていた理由を尋ねられ、寝坊してバスに乗り遅れたくなかったと答える。', ['寝坊した状況と走る理由が一致する。', 'リンゴが好きだから走ったのでは不自然。', '場所の方向だけでは寝坊とつながらない。', '妹の年齢は無関係。'], 'A：ケンタ、今朝はどうして走っていたの？B：バスに乗り遅れたくなかったんだ。遅く起きちゃって。'], 'conversation'),
  q(['A: Can you help me move this long table, Riku?\nB: (     ) Where should we put it?\nA: Over by the back wall, please.', ['It was last Friday.', 'No, I never eat there.', 'Sure, no problem.', 'One thousand yen.'], 2, 'テーブルを運ぶ手伝いを頼まれ、快諾して置く場所を尋ねる。', ['過去の日付で合わない。', '食事の頻度で無関係。', '依頼を引き受け、次の行動を確認する自然な応答。', '金額で合わない。'], 'A：リク、この長いテーブルを運ぶのを手伝ってくれる？ B：いいよ、もちろん。どこに置けばいい？ A：後ろの壁のそばにお願い。'], 'conversation'),
  reorder('私は先週の日曜日に叔父を訪ねました。', 'I', ['uncle', 'my', 'last Sunday', 'visited'], [4, 2, 1, 3], ['2－1', '2－3', '4－1', '4－3'], 2, 'visited my uncle last Sundayの語順。'),
  reorder('図書館では静かにしなければなりません。', 'We', ['in', 'the library', 'must be', 'quiet'], [3, 4, 1, 2], ['3－1', '3－2', '4－1', '4－2'], 0, 'must be quietで「静かにしなければならない」、in the libraryが場所。'),
  reorder('あなたは今年の夏どこへ行きたいですか。', 'Where', ['want', 'do you', 'this summer', 'to go'], [2, 1, 4, 3], ['1－3', '1－4', '2－3', '2－4'], 3, 'Where＋do you＋want to go＋this summer? の語順。'),
  reorder('この箱の中には何が入っていますか。', 'What', ['is', 'box', 'in', 'this'], [1, 3, 4, 2], ['1－2', '1－4', '3－2', '3－4'], 1, 'What is in this box? の語順。'),
  reorder('ケンは英語を話すことが上手です。', 'Ken', ['good at', 'speaking', 'English', 'is'], [4, 1, 2, 3], ['1－2', '1－3', '4－2', '4－3'], 2, 'be good at＋動名詞speaking＋目的語English。'),
  ...p('r4r3-notice', 'Bicycle Safety Check', `Free Bicycle Check!
Wednesday, October 7, 3:30 p.m. – 5:00 p.m.
School Front Yard

Local mechanics will check your brakes, tires, and lights before winter. All students who ride bicycles to school should come. Bring your student card. If it rains, we will move the check to next Wednesday, October 14. Putting air in your tires is also free!`, `無料自転車点検。10月7日水曜午後3時30分〜5時、学校の正面広場。地元の整備士が冬前にブレーキ・タイヤ・ライトを点検する。自転車通学の生徒は全員参加すること。生徒証を持参。雨天時は翌週10月14日水曜に延期。タイヤの空気入れも無料。`, 'notice', [
    ['Who will check the bicycles?', ['School teachers.', 'Student leaders.', 'Local mechanics.', 'Bus drivers.'], 2, 'Local mechanics will check your brakes, tires, and lightsとある。', ['学校の先生ではない。', '生徒のリーダーではない。', '地元の整備士が点検する。', 'バスの運転手ではない。'], '誰が自転車を点検しますか。'],
    ['What will happen if it rains on October 7?', ['Students must pay 200 yen.', 'The check will be held a week later.', 'The check will be in the gym.', 'Only lights will be checked.'], 1, '雨なら翌週10月14日水曜に移す（延期する）と書かれている。', ['有料になるとはない。', '1週間後に実施される。', '体育館で行うとはない。', 'ライトだけになるとはない。'], '10月7日に雨が降ったらどうなりますか。'],
  ]),
  ...p('r4r3-email', 'Borrowing Tent Gear', `From: Uncle Shin
To: Yuta
Subject: Your camping trip

Hi Yuta,
Your mother told me that you are going camping with your classmates next weekend. You are welcome to borrow my green tent! It is big enough for four people, and it is easy to set up.

I also have two warm sleeping bags and a bright lantern. Do you need them? I will clean the tent this Saturday morning, so you can come to my house on Saturday afternoon. Bring a large backpack to carry the lantern and small tools.

Before the trip, let's practice putting up the tent in my garden once. That way, you won't have trouble at the campsite!

Uncle Shin`, `シン叔父さんからユウタへのメール。来週末クラスメイトとキャンプに行くと母から聞いた。4人用で設営も簡単な緑のテントを貸せる。暖かい寝袋2つと明るいランタンもあるが必要か。今週土曜午前にテントを掃除するので土曜午後に家へ取りに来てよい。ランタンや小道具を入れる大きなリュックを持参すること。当日キャンプ場で困らないよう、出発前に一度庭でテント設営の練習をしよう。`, 'email', [
    ['How many people can sleep in Uncle Shin\'s tent?', ['Four.', 'Three.', 'Two.', 'One.'], 0, 'It is big enough for four peopleとある。', ['4人入れる大きさ。', '3人用ではない。', '2人用は寝袋の数。', '1人用ではない。'], 'シン叔父さんのテントは何人用ですか。'],
    ['When should Yuta go to Uncle Shin\'s house?', ['Friday evening.', 'Sunday morning.', 'Saturday afternoon.', 'Saturday morning.'], 2, '土曜午前に掃除するのでSaturday afternoonに来てよいとある。', ['金曜夜ではない。', '日曜午前ではない。', '土曜の午後。', '土曜午前は叔父が掃除をする時間。'], 'ユウタはいつシン叔父さんの家へ行くべきですか。'],
    ['Why does Uncle Shin want to practice in his garden?', ['To test a new cooking stove.', 'To take a photo for Yuta\'s mother.', 'To clean the sleeping bags.', 'To avoid having trouble at the campsite.'], 3, 'キャンプ場で困らないように一度庭で設営練習をしようと提案している。', ['コンロのテストではない。', '写真を撮るためではなく設営練習のため。', '寝袋を洗うためではない。', 'キャンプ場で困らないように庭で練習したいという内容と一致。'], 'シン叔父さんが庭で練習したがっているのはなぜですか。'],
  ]),
  ...p('r4r3-story', 'Letters Across the Sea', `Last autumn, Ms. Green's English class started a postcard exchange with a school in New Zealand. Each student got a partner. Hina's partner was a boy named Liam. In her first postcard, Hina wrote about her town's autumn festival and drew a small red lantern. However, she was worried that her English sentences were too short.

Three weeks later, postcards arrived from New Zealand. Liam loved Hina's drawing! He sent a postcard with a picture of sheep on a green hill. He wrote, "In New Zealand, October is spring, so baby lambs are everywhere now." Hina was surprised because the seasons were opposite.

For her second card, Hina wanted to share more. She went to the park, picked up two yellow ginkgo leaves, and taped one onto a card after pressing it flat in a thick dictionary. She wrote five sentences about how the trees changed color in November.

In December, Liam sent a photo of his class display board. Hina's yellow leaf was in the center, and many students wrote nice comments around it. Hina felt proud and decided to write longer letters next year.`, `昨秋、グリーン先生の英語クラスはニュージーランドの学校と絵はがき交換を始めました。ヒナの相手はリアムという男の子でした。最初のはがきでヒナは町の秋祭りについて書き赤い提灯の絵を添えましたが、英文が短すぎないか心配でした。3週間後に届いた返事でリアムは絵を気に入り、緑の丘の羊のはがきに「こちらは10月が春なので子羊がたくさんいる」と書いており、ヒナは季節が逆なことに驚きました。2枚目でヒナは公園の黄色いイチョウの葉を厚い辞書で押し葉にして貼り、11月の紅葉について5文で書きました。12月、リアムから教室の掲示板の写真が届き、中央のヒナの葉の周りに多くの生徒の感想が書かれていました。ヒナは誇らしく思い、来年はもっと長い手紙を書こうと決めました。`, 'article', [
    ['What was Hina worried about when she sent her first postcard?', ['She forgot to write Liam\'s name.', 'She lost the address of the school.', 'Her drawing was too big.', 'Her English sentences were too short.'], 3, 'she was worried that her English sentences were too shortとある。', ['名前を忘れたのではない。', '住所をなくしたのではない。', '絵が大きすぎたのではない。', '英文が短すぎるのではないかと心配した。'], '最初のはがきを送ったとき、ヒナは何を心配していましたか。'],
    ['Why was Hina surprised by Liam\'s first postcard?', ['The season in New Zealand was the opposite of Japan\'s.', 'Liam said he did not enjoy winter festivals in his town.', 'Liam had lived near Kenji in Japan two summers ago.', 'The postcard message was written mostly in Japanese.'], 0, '日本が秋の10月にニュージーランドは春で、季節が逆だったから。', ['季節が反対だったことに驚いた。', '祭りが嫌いとはない。', '日本に住んでいたとはない。', '日本語で書かれていたという記述はなく、季節が逆だったことに驚いた。'], 'リアムの最初のはがきにヒナが驚いたのはなぜですか。'],
    ['What did Hina put on her second card?', ['A ticket to a museum.', 'A sticker of a sheep.', 'A photo of her dog.', 'A pressed yellow leaf.'], 3, '黄色いイチョウの葉を辞書で平らにしてカードに貼った。', ['博物館のチケットではない。', '羊のシールではない。', '犬の写真ではない。', '押し葉にした黄色い葉。'], 'ヒナは2枚目のカードに何をつけましたか。'],
    ['Where was Hina\'s card shown in New Zealand?', ['At a post office.', 'On Liam\'s class display board.', 'At an art museum.', 'In a local newspaper.'], 1, 'Liam sent a photo of his class display board. Hina\'s yellow leaf was in the centerとある。', ['郵便局ではない。', 'リアムのクラスの掲示板。', '美術館ではない。', '新聞ではない。'], 'ニュージーランドでヒナのカードはどこに飾られましたか。'],
    ['What did Hina decide to do next year?', ['Write longer letters in English.', 'Visit New Zealand in October.', 'Buy a thicker dictionary.', 'Join the school art club.'], 0, 'decided to write longer letters next yearとある。', ['もっと長い手紙を書くことに決めた。', '訪問を決めたとはない。', '辞書を買い替える話ではない。', '美術部に入る話ではない。'], 'ヒナは来年何をしようと決めましたか。'],
  ]),
], 3);
