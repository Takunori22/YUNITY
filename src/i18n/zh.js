// 改行を意図している見出しは \n を入れる。CSS 側で white-space: pre-line。
export default {
  nav: {
    home: "首页",
    sento: "钱汤介绍",
    manner: "礼仪",
    about: "关于我们",
  },

  home: {
    hero_eyebrow: "SENTO GUIDE — TOKYO",
    hero_title: "汤，连接世界。",
    hero_body:
      "通过日本传统公共浴场文化，促进外国游客与当地居民之间的多元文化共生与交流。",
    hero_note: "A guide to Japanese public bathhouses — written for first-time visitors.",
    hero_cta_primary: "阅读入浴礼仪",
    hero_cta_secondary: "参加问卷调查",

    statement: "钱汤，对第一次到访的人\n敞开得最彻底。",

    stat1_value: "6",
    stat1_label: "入浴步骤",
    stat2_value: "4",
    stat2_label: "支持语言",
    stat3_value: "¥520",
    stat3_label: "成人入浴费（东京）",
    stat4_value: "15:30–",
    stat4_label: "大黒湯营业时间",

    flow_eyebrow: "01 — 入浴流程",
    flow_title: "六个简单步骤",
    flow_body: "从前台到走出大门，按顺序来就不会迷路。",
    flow_cta: "查看完整礼仪指南",

    sento_eyebrow: "02 — 本次的钱汤",
    sento_title: "大黒湯",
    sento_romaji: "Daikoku-yu — Bunkyo Ward, Tokyo",
    sento_body:
      "大黒湯坐落在文京区的小巷深处，数十年如一日地烧着热水，融入了当地居民的日常生活。对每一位到访者都敞开怀抱，这正是它一直守护的骄傲。",
    sento_cta: "前往钱汤介绍页面",

    survey_eyebrow: "03 — SURVEY / 约3分钟",
    survey_title: "分享您的声音",
    survey_body: "您的反馈将塑造YU-NITY今后的活动。诚邀您花几分钟填写问卷。",
    survey_cta: "参加问卷",

    about_eyebrow: "04 — 关于我们",
    about_title: "从钱汤开始的，\n多元文化共生。",
    about_body:
      "YU-NITY是一支学生发起的项目团队，通过日本钱汤文化连接外国游客与当地居民。在调研与访谈中我们发现，许多外国游客其实对钱汤抱有兴趣，却因为对礼仪的不安和信息不足而迟迟无法迈出第一步。",
    about_cta: "认识我们的团队",
  },

  // _mono は角印の下に置くモノスペースの副題。和文以外の言語では
  // 日本語のローマ字表記を出して、現地の表示と結びつけられるようにする。
  steps: {
    step1_title: "前台",
    step1_mono: "UKETSUKE",
    step1_body: "在前台支付入浴费。许多钱汤也提供毛巾和肥皂租借，有需要请直接询问。",
    step2_title: "更衣室",
    step2_mono: "DATSUIJO",
    step2_body: "将衣物整齐地放入储物柜或架子。贵重物品请上锁保管后再进入浴室。",
    step3_title: "洗澡区",
    step3_mono: "ARAIBA",
    step3_body: "进入浴池前，请务必先坐下冲洗身体，哪怕只是简单淋浴也好——先洗净，再入浴。",
    step4_title: "浴池",
    step4_mono: "YUBUNE",
    step4_body: "请将毛巾放在浴池外，安静地泡到肩膀。不要游泳或跳水，放松地享受就好。",
    step5_title: "出浴冲洗",
    step5_mono: "AGARIYU",
    step5_body: "起身后用清水冲去汗水。擦干身体后再回更衣室，可以保持地面干爽。",
    step6_title: "离开前",
    step6_mono: "YUAGARI",
    step6_body: "归还储物柜钥匙，确认没有遗漏物品。泡后来一杯冷饮也是钱汤乐趣之一。",
  },

  sento: {
    page_eyebrow: "SENTO — 钱汤介绍",
    page_title: "大黒湯",
    page_romaji: "Daikoku-yu — Bunkyo Ward, Tokyo",
    lede: "扎根文京区小巷的，\n老式钱汤。",
    body1: "「大黒湯」数十年如一日地烧着热水，融入了当地居民的日常生活。",
    body2:
      "柜台前的一句问候，常客之间不经意的闲聊——这里流淌着让都市喧嚣暂时远去的温暖时光。对每一位到访者都敞开怀抱，这正是大黒湯一直守护的骄傲。",

    feature1_title: "昔日风貌依旧的玄关",
    feature1_body: "推开格子拉门，便是摆着木制鞋柜的水泥地玄关。这方与昭和年代别无二致的入口，静静迎接每一位来客。",
    feature2_title: "从柜台开始的交流时光",
    feature2_body:
      "在柜台前，与店主或工作人员的简单交谈由此展开，初次到访者也会被耐心告知入浴流程。",
    feature3_title: "让蒸汽升腾散去的挑高空间",
    feature3_body: "浴室天花板高高挑空，高窗引入光线与外气。腾起的热气缓缓向上散去，正是昔日钱汤的建筑智慧。",

    access_eyebrow: "ACCESS — 场所",
    access_title: "交通指南",
    access_addr_label: "ADDRESS 地址",
    access_addr_value: "〒112-0012 东京都文京区大塚3-8-6",
    access_hours_label: "HOURS 营业时间",
    access_hours_value: "15:30 — 23:30",
    access_closed_label: "CLOSED 定休日",
    access_closed_value: "周一",
    access_price_label: "PRICE 入浴费",
    access_price_value: "成人 ¥600 ／ 初中生 ¥500 ／ 小学生及以下 ¥200",
    access_cta: "在谷歌地图中打开",
  },

  manner: {
    page_eyebrow: "MANNER — 礼仪",
    page_title: "舒心入浴，与众同乐。",
    page_intro:
      "钱汤是陌生人共享同一池热水的地方。一点点体贴，就能让大家都舒心自在。",
    index_title: "入浴流程",

    rules_eyebrow: "RULES — 个别规定",
    rules_title: "还有这些小提示",
    rules_body: "有些规定因店铺而异。拿不准的时候，在前台问一句最稳妥。",
    rule1_title: "关于纹身",
    rule1_body: "各店铺规定不同。许多钱汤允许用贴布遮住纹身后入浴，建议事先确认。",
    rule2_title: "拍照与录像",
    rule2_body: "为保护其他客人的隐私，更衣室与浴室内禁止拍摄。",
    rule3_title: "毛巾不入池",
    rule3_body: "出于卫生考虑，请勿将毛巾浸入浴池中。",
    rule4_title: "禁止游泳、潜水",
    rule4_body: "浴池是安静泡浴的地方，请不要游泳或戏水。",
    rule5_title: "交谈请轻声",
    rule5_body: "请避免大声交谈，与大家共享安静的氛围。",
    rule6_title: "饮酒后请勿入浴",
    rule6_body: "醉酒状态下入浴容易引发身体不适，请等酒醒后再来。",

    faq_title: "常见误解",
    faq1_q: "有纹身就绝对不能入浴吗？",
    faq1_a:
      "这取决于店铺。许多钱汤允许贴布遮盖后入浴，很多时候只是「以为不能进」的误解。如果担心，不妨事先向店铺确认。",
    faq2_q: "不会说日语也没关系吗？",
    faq2_a:
      "没问题。只要掌握本页的流程，即使交流不多也能舒心享受钱汤。遇到困难时，工作人员也会用手势耐心讲解。",
    faq3_q: "可以穿泳装入浴吗？",
    faq3_a:
      "钱汤不可穿泳装，赤裸入浴是基本礼仪。刚开始可能会有些紧张，但这正是钱汤「坦诚相待」文化的一部分。",
  },

  about: {
    page_eyebrow: "ABOUT — 关于我们",
    page_title: "从钱汤开始的多元文化共生。",
    lede: "一点点拆除，\n看不见的墙。",
    body1:
      "YU-NITY源自大学的研讨课项目。我们希望以「钱汤」这一日本独有的文化作为入口，让外国游客与当地居民自然地相遇——这正是我们活动的起点。",
    body2:
      "在调研与访谈中我们发现，许多外国游客其实对钱汤抱有兴趣，却因为对礼仪的不安和信息不足而迟迟无法迈出第一步。",
    body3: "我们希望通过准确、真诚地传递钱汤文化，一点点拆除这堵「看不见的墙」。",
    team_title: "YU-NITY\n成员",
  },

  team: {
    member1_bio: "统筹团队整体，摸索传递钱汤魅力的最佳方式。",
    member2_bio: "擅长策划连接钱汤与访客的活动企划。",
    member3_bio: "通过文献调查与访谈，收集最真实的声音。",
    member4_bio: "负责传达钱汤温度的视觉设计工作。",
    member5_bio: "通过社交媒体与活动发布YU-NITY的动态。",
    member6_bio: "负责现场交流活动的运营，兼顾趣味与安全。",
  },

  survey: {
    formUrl: "https://forms.gle/eRkf3yYtsHTEPZaX9",
  },

  footer: {
    tagline: "以钱汤连接世界",
    copy: "© 2025 YU-NITY PROJECT. ALL RIGHTS RESERVED.",
  },
};
