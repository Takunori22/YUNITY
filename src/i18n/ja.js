// 改行を意図している見出しは \n を入れる。CSS 側で white-space: pre-line。
export default {
  nav: {
    home: "ホーム",
    sento: "銭湯紹介",
    manner: "マナー",
    about: "アバウト",
  },

  home: {
    hero_eyebrow: "SENTO GUIDE — TOKYO",
    hero_title: "湯が、世界をつなぐ。",
    hero_body:
      "日本の銭湯文化を通じて、訪日外国人と地域住民の多文化共生・交流を促進するプロジェクト。",
    hero_note: "A guide to Japanese public bathhouses — written for first-time visitors.",
    hero_cta_primary: "入浴の作法を読む",
    hero_cta_secondary: "アンケートに答える",

    statement: "銭湯は、はじめての人にこそ\nいちばん開かれている。",

    stat1_value: "6",
    stat1_label: "入浴のステップ",
    stat2_value: "4",
    stat2_label: "対応言語",
    stat3_value: "¥520",
    stat3_label: "大人の入浴料（東京）",
    stat4_value: "15:30–",
    stat4_label: "大黒湯の営業時間",

    flow_eyebrow: "01 — 入浴の流れ",
    flow_title: "六つのステップ",
    flow_body: "受付から湯上がりまで、順番どおりに進めば迷いません。",
    flow_cta: "マナーを詳しく見る",

    sento_eyebrow: "02 — 今回の銭湯",
    sento_title: "大黒湯",
    sento_romaji: "Daikoku-yu — Bunkyo Ward, Tokyo",
    sento_body:
      "文京区の路地に佇む「大黒湯」は、地域の暮らしに寄り添いながら、何十年も湯を焚き続けてきた銭湯です。訪れる人を選ばない懐の深さこそ、守り続けてきた誇りです。",
    sento_cta: "銭湯紹介ページへ",

    survey_eyebrow: "03 — SURVEY / 約3分",
    survey_title: "声を聞かせてください",
    survey_body:
      "皆さんのご意見が、YU-NITYの活動をつくります。ぜひアンケートにご協力ください。",
    survey_cta: "回答する",

    about_eyebrow: "04 — アバウト",
    about_title: "銭湯から始まる、\n多文化共生。",
    about_body:
      "YU-NITYは、銭湯文化を通じて訪日外国人と地域住民をつなぐ、学生発のプロジェクトチームです。調査やインタビューを重ねる中で見えてきたのは、外国人観光客の多くが銭湯に関心を持ちながらも、マナーへの不安や情報不足から一歩を踏み出せずにいるという現実でした。",
    about_cta: "アバウトページへ",
  },

  // ホームとマナーページで共有する入浴の6ステップ。
  // _mono は角印の下に置くモノスペースの副題。
  steps: {
    step1_title: "受付",
    step1_mono: "RECEPTION",
    step1_body:
      "番台やフロントで入浴料を払います。タオルや石鹸は貸し出している施設も多いので、心配な方は聞いてみましょう。",
    step2_title: "脱衣所",
    step2_mono: "CHANGING ROOM",
    step2_body:
      "衣類はロッカーや棚にきちんとたたんで収納します。貴重品はロッカーの鍵をかけて管理しましょう。",
    step3_title: "洗い場",
    step3_mono: "WASHING AREA",
    step3_body:
      "湯船に入る前に、必ず椅子に座って体を洗い流します。かけ湯だけでもよいので、湯を浴びてから浴槽へ。",
    step4_title: "湯船",
    step4_mono: "THE BATH",
    step4_body:
      "タオルは湯船の外に置き、静かに肩まで浸かります。泳いだり潜ったりはせず、ゆったりと過ごしましょう。",
    step5_title: "上がり湯",
    step5_mono: "FINAL RINSE",
    step5_body:
      "湯船から上がったら、かけ湯で汗を軽く流します。体を拭いてから脱衣所に戻ると、床が濡れずに済みます。",
    step6_title: "退出後",
    step6_mono: "AFTER THE BATH",
    step6_body:
      "ロッカーの鍵を返却し、忘れ物がないか確認して退出しましょう。湯上がりの一杯も銭湯の楽しみのひとつです。",
  },

  sento: {
    page_eyebrow: "SENTO — 銭湯紹介",
    page_title: "大黒湯",
    page_romaji: "Daikoku-yu — Bunkyo Ward, Tokyo",
    lede: "文京区の路地に佇む、\n昔ながらの湯。",
    body1: "「大黒湯」は、地域の暮らしに寄り添いながら、何十年も湯を焚き続けてきた銭湯です。",
    body2:
      "番台越しに交わされるあいさつ、常連客同士の何気ない会話——ここには、都会の喧騒を忘れさせる、あたたかな時間が流れています。訪れる人を選ばない懐の深さこそ、大黒湯が守り続けてきた誇りです。",

    feature1_title: "唐破風の屋根が出迎える玄関",
    feature1_body:
      "堂々とした唐破風造りの屋根は、大黒湯のシンボル。一歩くぐれば、昭和の面影が今も色濃く残ります。",
    feature2_title: "番台からはじまる、ひとときの交流",
    feature2_body:
      "受付では、ご主人やスタッフとの何気ないやり取りが待っています。初めての方には入浴の流れも丁寧に教えてもらえます。",
    feature3_title: "浴室を彩る、雄大な銭湯絵",
    feature3_body:
      "湯気の向こうに広がる富士山の銭湯絵。湯船に浸かりながら見上げる一枚は、大黒湯ならではの贅沢なひとときです。",

    access_eyebrow: "ACCESS — 場所",
    access_title: "アクセス",
    access_addr_label: "ADDRESS 住所",
    access_addr_value: "東京都文京区〇〇 2-0-0",
    access_hours_label: "HOURS 営業時間",
    access_hours_value: "15:30 — 24:00",
    access_closed_label: "CLOSED 定休日",
    access_closed_value: "金曜日",
    access_price_label: "PRICE 入浴料",
    access_price_value: "大人 ¥520 ／ 子ども ¥200",
    access_note: "※営業時間・料金は仮の情報です。正式な情報に差し替えてください。",
    access_cta: "Google マップで開く",
  },

  manner: {
    page_eyebrow: "MANNER — マナー",
    page_title: "気持ちよく、みんなで入る。",
    page_intro:
      "銭湯は、見知らぬ人同士が同じ湯を分かち合う場所。ちょっとした心づかいが、みんなが気持ちよく過ごせる時間をつくります。",
    index_title: "入浴の流れ",

    rules_eyebrow: "RULES — 個別ルール",
    rules_title: "知っておきたいこと",
    rules_body:
      "施設ごとに運用が違うものもあります。判断に迷ったら、受付でひと声かけるのが確実です。",
    rule1_title: "タトゥーについて",
    rule1_body:
      "対応は施設ごとに異なります。シールで隠せば入浴できる施設も多いので、事前に確認しましょう。",
    rule2_title: "写真・動画の撮影",
    rule2_body: "脱衣所・浴室での撮影は他のお客様のプライバシーを守るため禁止です。",
    rule3_title: "タオルは湯船の外へ",
    rule3_body: "衛生のため、タオルを湯船の中に浸けないようにしましょう。",
    rule4_title: "泳がない・潜らない",
    rule4_body: "浴槽は静かに浸かる場所です。泳いだり水しぶきをあげたりするのは控えましょう。",
    rule5_title: "私語は控えめに",
    rule5_body: "大きな声での会話は避け、静かな時間をみんなで共有しましょう。",
    rule6_title: "飲酒後の入浴は控える",
    rule6_body: "酔った状態での入浴は体調を崩す原因になります。時間をおいてから訪れましょう。",

    faq_title: "よくある誤解",
    faq1_q: "タトゥーがあると絶対に入れませんか?",
    faq1_a:
      "施設によって対応は様々です。シールでカバーすれば入浴できる銭湯も多く、実際には「入れない」と思い込んでいるだけのケースが少なくありません。気になる場合は事前に施設へ問い合わせてみましょう。",
    faq2_q: "言葉が話せなくても大丈夫ですか?",
    faq2_a:
      "大丈夫です。このページのステップさえ押さえておけば、会話が少なくても気持ちよく過ごせます。困ったときはスタッフに聞けば、身振りを交えて教えてくれます。",
    faq3_q: "水着を着て入浴してもいいですか?",
    faq3_a:
      "銭湯では水着の着用はできません。裸で入るのが基本のマナーです。慣れないうちは緊張するかもしれませんが、これも「裸の付き合い」という銭湯文化のひとつです。",
  },

  about: {
    page_eyebrow: "ABOUT — アバウト",
    page_title: "銭湯から始まる、多文化共生。",
    lede: "見えない壁を、\n少しずつ取り払う。",
    body1:
      "YU-NITYは、大学のゼミ活動から生まれたプロジェクトチームです。「銭湯」という日本ならではの文化を入り口に、訪日外国人と地域住民が自然に交わる場をつくりたい——そんな想いから活動を始めました。",
    body2:
      "調査やインタビューを重ねる中で見えてきたのは、外国人観光客の多くが銭湯に関心を持ちながらも、マナーへの不安や情報不足から一歩を踏み出せずにいるという現実でした。",
    body3:
      "私たちは、銭湯とその魅力を正しく伝えることで、この「見えない壁」を少しずつ取り払っていきたいと考えています。",
    team_title: "YU-NITY\nメンバー",
  },

  // 氏名は全言語で漢字表記のまま（読みが確定していないため）
  team: {
    member1_bio: "チーム全体を見渡しながら、銭湯の魅力を伝える最善の形を探っています。",
    member2_bio: "銭湯とゲストをつなぐ企画づくりが得意分野です。",
    member3_bio: "文献調査とインタビューから、リアルな声を拾い上げます。",
    member4_bio: "銭湯の温かさが伝わるビジュアルづくりを担当しています。",
    member5_bio: "SNSやイベントを通じて、YU-NITYの活動を発信しています。",
    member6_bio: "現場での交流イベントを、楽しく安全に運営します。",
  },

  survey: {
    formUrl: "https://forms.gle/eRkf3yYtsHTEPZaX9",
  },

  footer: {
    tagline: "銭湯でつながる世界",
    copy: "© 2025 YU-NITY PROJECT. ALL RIGHTS RESERVED.",
  },
};
