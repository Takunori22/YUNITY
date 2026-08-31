// 改行を意図している見出しは \n を入れる。CSS 側で white-space: pre-line。
export default {
  nav: {
    home: "홈",
    sento: "센토 소개",
    manner: "매너",
    about: "소개",
    survey: "설문",
  },

  home: {
    hero_eyebrow: "SENTO GUIDE — TOKYO",
    hero_title: "탕이, 세계를 잇는다.",
    hero_body:
      "일본 전통 대중목욕탕 문화를 통해 외국인 관광객과 지역 주민 간의 다문화 공생과 교류를 촉진하는 프로젝트.",
    hero_note: "A guide to Japanese public bathhouses — written for first-time visitors.",
    hero_cta_primary: "입욕 매너 읽기",
    hero_cta_secondary: "설문조사 참여하기",

    statement: "센토는 처음 오는 사람에게\n가장 활짝 열려 있습니다.",

    stat1_value: "6",
    stat1_label: "입욕 단계",
    stat2_value: "5",
    stat2_label: "지원 언어",
    stat3_value: "¥600",
    stat3_label: "성인 입욕료 (도쿄)",
    stat4_value: "15:30–",
    stat4_label: "다이코쿠유 영업시간",

    flow_eyebrow: "01 — 입욕 순서",
    flow_title: "여섯 가지 단계",
    flow_body: "카운터에서 목욕을 마치고 나올 때까지, 순서대로만 따라가면 헤맬 일이 없습니다.",
    flow_cta: "매너 가이드 자세히 보기",

    sento_eyebrow: "02 — 이번의 센토",
    sento_title: "다이코쿠유",
    sento_romaji: "Daikoku-yu — Bunkyo Ward, Tokyo",
    sento_body:
      "분쿄구의 골목 한켠에 자리한 다이코쿠유는 수십 년간 가마솥에 불을 지피며 지역 주민의 일상 속에 녹아들어 왔습니다. 찾아오는 그 누구도 가리지 않는 넉넉함이야말로 지켜온 자부심입니다.",
    sento_cta: "센토 소개 페이지로",

    survey_eyebrow: "03 — SURVEY / 약 3분",
    survey_title: "목소리를 들려주세요",
    survey_body:
      "여러분의 의견이 YU-NITY의 앞으로를 만들어갑니다. 몇 분만 시간을 내주시면 감사하겠습니다.",
    survey_cta: "설문 참여하기",

    about_eyebrow: "04 — 소개",
    about_title: "센토에서 시작되는,\n다문화 공생.",
    about_body:
      "YU-NITY는 일본의 센토 문화를 통해 외국인 관광객과 지역 주민을 잇는 학생 주도 프로젝트팀입니다. 조사와 인터뷰를 거듭하며 알게 된 것은, 많은 외국인 관광객이 센토에 관심이 있으면서도 매너에 대한 불안과 정보 부족으로 선뜻 발걸음을 옮기지 못한다는 현실이었습니다.",
    about_cta: "팀 소개 보기",
  },

  // _mono は角印の下に置くモノスペースの副題。和文以外の言語では
  // 日本語のローマ字表記を出して、現地の表示と結びつけられるようにする。
  steps: {
    step1_title: "접수",
    step1_mono: "UKETSUKE",
    step1_body:
      "카운터에서 입욕료를 지불합니다. 수건과 비누를 대여해주는 곳도 많으니 필요하면 물어보세요.",
    step2_title: "탈의실",
    step2_mono: "DATSUIJO",
    step2_body: "옷은 사물함이나 선반에 단정히 정리합니다. 귀중품은 사물함에 잠가서 보관하세요.",
    step3_title: "세신 공간",
    step3_mono: "ARAIBA",
    step3_body:
      "탕에 들어가기 전 반드시 의자에 앉아 몸을 씻습니다. 가볍게 헹구는 것만으로도 괜찮으니, 씻고 나서 탕에 들어가세요.",
    step4_title: "탕",
    step4_mono: "YUBUNE",
    step4_body:
      "수건은 탕 밖에 두고 어깨까지 조용히 몸을 담급니다. 수영이나 잠수는 하지 말고 편안히 쉬세요.",
    step5_title: "탕에서 나온 후",
    step5_mono: "AGARIYU",
    step5_body:
      "탕에서 나오면 가볍게 헹궈 땀을 씻어냅니다. 몸을 닦은 후 탈의실로 돌아가면 바닥이 젖지 않습니다.",
    step6_title: "나가기 전",
    step6_mono: "YUAGARI",
    step6_body:
      "사물함 열쇠를 반납하고 놓고 가는 물건이 없는지 확인하세요. 목욕 후 마시는 차가운 음료도 센토의 즐거움 중 하나입니다.",
  },

  sento: {
    page_eyebrow: "SENTO — 센토 소개",
    page_title: "다이코쿠유",
    page_romaji: "Daikoku-yu — Bunkyo Ward, Tokyo",
    lede: "분쿄구 골목에 자리한,\n오래된 목욕탕.",
    body1:
      "다이코쿠유는 수십 년간 가마솥에 불을 지피며 지역 주민의 일상 속에 녹아들어 왔습니다.",
    body2:
      "카운터 너머로 오가는 인사, 단골 손님들의 스스럼없는 대화——이곳에는 도심의 소란을 잊게 하는 따뜻한 시간이 흐릅니다. 찾아오는 그 누구도 가리지 않는 넉넉함이야말로 다이코쿠유가 지켜온 자부심입니다.",

    feature1_title: "옛 모습 그대로의 현관",
    feature1_body:
      "격자 미닫이문을 열면 신발장이 늘어선 토방. 쇼와 시절과 다름없는 현관 풍경이 찾는 이를 그대로 맞이합니다.",
    feature2_title: "카운터에서 시작되는 교류의 시간",
    feature2_body:
      "카운터에서 나누는 사소한 대화가 방문의 시작입니다. 처음 오신 분에게는 입욕 순서도 친절히 알려줍니다.",
    feature3_title: "김이 빠져나가는 탁 트인 천장",
    feature3_body:
      "욕실 천장은 시원하게 트여 있고, 높은 창으로 빛과 바깥 공기가 들어옵니다. 피어오른 김이 완만하게 빠져나가는 옛 방식의 센토 건축입니다.",

    access_eyebrow: "ACCESS — 위치",
    access_title: "오시는 길",
    access_addr_label: "ADDRESS 주소",
    access_addr_value: "〒112-0012 도쿄도 분쿄구 오쓰카 3-8-6",
    access_hours_label: "HOURS 영업시간",
    access_hours_value: "15:30 — 23:30",
    access_closed_label: "CLOSED 정기 휴일",
    access_closed_value: "월요일",
    access_price_label: "PRICE 입욕료",
    access_price_value: "대인 ¥600 / 중인 ¥500 / 소인 ¥200",
    access_cta: "구글 맵에서 열기",
  },

  manner: {
    page_eyebrow: "MANNER — 매너",
    page_title: "다 함께, 기분 좋게 목욕하기.",
    page_intro:
      "센토는 낯선 사람들이 같은 탕물을 함께 나누는 곳입니다. 작은 배려 하나가 모두에게 편안한 시간을 만들어 줍니다.",
    index_title: "입욕 순서",

    rules_eyebrow: "RULES — 개별 규정",
    rules_title: "몇 가지 더",
    rules_body:
      "시설마다 운영이 다른 것도 있습니다. 판단이 서지 않을 때는 카운터에 한마디 묻는 것이 확실합니다.",
    rule1_title: "문신에 대하여",
    rule1_body: "시설마다 규정이 다릅니다. 스티커로 가리면 입욕이 가능한 곳도 많으니 미리 확인해 보세요.",
    rule2_title: "사진 및 영상 촬영",
    rule2_body: "다른 손님의 사생활 보호를 위해 탈의실과 욕실에서의 촬영은 금지되어 있습니다.",
    rule3_title: "수건은 탕 밖에서",
    rule3_body: "위생을 위해 수건을 탕 안에 담그지 마세요.",
    rule4_title: "수영·잠수 금지",
    rule4_body: "탕은 조용히 몸을 담그는 곳입니다. 수영이나 물장난은 삼가주세요.",
    rule5_title: "대화는 조용히",
    rule5_body: "큰 소리로 대화하지 말고, 모두가 조용한 분위기를 함께 누릴 수 있도록 해주세요.",
    rule6_title: "음주 후 입욕은 피하기",
    rule6_body: "취한 상태에서의 입욕은 몸에 무리를 줄 수 있습니다. 시간을 두었다가 방문해 주세요.",

    faq_title: "흔한 오해",
    faq1_q: "문신이 있으면 절대 입욕할 수 없나요?",
    faq1_a:
      "시설마다 다릅니다. 스티커로 가리면 입욕 가능한 센토도 많아, 실제로는 '안 될 것'이라는 선입견인 경우가 적지 않습니다. 걱정되신다면 미리 시설에 문의해 보세요.",
    faq2_q: "일본어를 못해도 괜찮나요?",
    faq2_a:
      "괜찮습니다. 이 페이지의 순서만 알아두면 대화가 적어도 충분히 즐길 수 있습니다. 어려운 점이 있으면 직원이 몸짓을 섞어 친절히 알려줍니다.",
    faq3_q: "수영복을 입고 들어가도 되나요?",
    faq3_a:
      "센토에서는 수영복을 입지 않습니다. 옷을 벗고 입욕하는 것이 기본 매너입니다. 처음에는 낯설 수 있지만, 이는 센토 특유의 '스스럼없는 교류' 문화의 일부입니다.",
  },

  about: {
    page_eyebrow: "ABOUT — 소개",
    page_title: "센토에서 시작되는 다문화 공생.",
    lede: "보이지 않는 벽을,\n조금씩 허물다.",
    body1:
      "YU-NITY는 대학 세미나 활동에서 시작된 프로젝트 팀입니다. '센토'라는 일본 고유의 문화를 입구 삼아 외국인 관광객과 지역 주민이 자연스럽게 어우러지는 장을 만들고 싶다는 마음에서 활동을 시작했습니다.",
    body2:
      "조사와 인터뷰를 거듭하며 알게 된 것은, 많은 외국인 관광객이 센토에 관심이 있으면서도 매너에 대한 불안과 정보 부족으로 선뜻 발걸음을 옮기지 못한다는 현실이었습니다.",
    body3:
      "저희는 센토와 그 매력을 올바르게 전함으로써 이 '보이지 않는 벽'을 조금씩 허물어가고 싶습니다.",
    team_title: "YU-NITY\n멤버",
  },

  team: {
    member1_bio: "팀 전체를 살피며 센토의 매력을 전할 최선의 방법을 고민합니다.",
    member2_bio: "센토와 방문객을 잇는 기획이 제 전문 분야입니다.",
    member3_bio: "문헌 조사와 인터뷰를 통해 생생한 목소리를 모읍니다.",
    member4_bio: "센토의 따뜻함이 전해지는 비주얼 작업을 담당합니다.",
    member5_bio: "SNS와 이벤트를 통해 YU-NITY의 활동을 알립니다.",
    member6_bio: "현장 교류 이벤트를 즐겁고 안전하게 운영합니다.",
  },

  footer: {
    tagline: "센토로 연결하는 세계",
    copy: "© 2026 YU-NITY PROJECT. ALL RIGHTS RESERVED.",
  },
};
