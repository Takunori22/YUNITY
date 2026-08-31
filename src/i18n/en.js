// 改行を意図している見出しは \n を入れる。CSS 側で white-space: pre-line。
// 英文は和文より長いので、大見出しは改行位置を明示して clamp の上限で溢れないようにする。
export default {
  nav: {
    home: "Home",
    sento: "Sento",
    manner: "Manners",
    about: "About",
    survey: "Survey",
  },

  home: {
    hero_eyebrow: "SENTO GUIDE — TOKYO",
    hero_title: "Where water\nunites the world.",
    hero_body:
      "A project promoting multicultural exchange between foreign visitors and local residents through Japan's public bathhouse culture.",
    hero_note: "Yu ga, sekai o tsunagu.",
    hero_cta_primary: "Read the bathing guide",
    hero_cta_secondary: "Take the survey",

    statement: "A sento is most open\nto the people walking in\nfor the very first time.",

    stat1_value: "6",
    stat1_label: "Steps to a bath",
    stat2_value: "5",
    stat2_label: "Languages",
    stat3_value: "¥600",
    stat3_label: "Adult admission (Tokyo)",
    stat4_value: "15:30–",
    stat4_label: "Daikoku-yu opening hours",

    flow_eyebrow: "01 — HOW IT WORKS",
    flow_title: "Six simple steps",
    flow_body: "From the front desk to the walk home — follow them in order and you won't get lost.",
    flow_cta: "See the full manner guide",

    sento_eyebrow: "02 — THIS MONTH'S SENTO",
    sento_title: "Daikoku-yu",
    sento_romaji: "大黒湯 — Bunkyo Ward, Tokyo",
    sento_body:
      "Tucked into a quiet street in Bunkyo, Daikoku-yu has kept its furnace burning for decades, woven into the daily rhythm of the neighborhood. Welcoming everyone who walks through its doors is the quiet pride it has carried all along.",
    sento_cta: "Visit the sento guide",

    survey_eyebrow: "03 — SURVEY / ABOUT 3 MIN",
    survey_title: "Share your voice",
    survey_body:
      "Your feedback shapes what YU-NITY does next. We'd be grateful if you could take a few minutes.",
    survey_cta: "Take the survey",

    about_eyebrow: "04 — ABOUT",
    about_title: "It starts\nat the sento.",
    about_body:
      "YU-NITY is a student-led project team connecting foreign visitors and local residents through Japan's sento culture. Through research and interviews, we learned that many visitors are genuinely curious about sento but hesitate to take the first step, held back by uncertainty about etiquette and a lack of information.",
    about_cta: "Meet the team",
  },

  // _mono は角印の下に置くモノスペースの副題。和文以外の言語では
  // 日本語のローマ字表記を出して、現地の表示と結びつけられるようにする。
  steps: {
    step1_title: "Check in",
    step1_mono: "UKETSUKE",
    step1_body:
      "Pay your admission at the front desk. Many bathhouses rent towels and soap, so just ask if you need them.",
    step2_title: "Changing room",
    step2_mono: "DATSUIJO",
    step2_body:
      "Fold your clothes neatly into a locker or shelf. Lock up your valuables before heading to the bath.",
    step3_title: "Washing area",
    step3_mono: "ARAIBA",
    step3_body:
      "Always sit and rinse your body before entering the tub — even a quick rinse is fine, just wash before you soak.",
    step4_title: "The bath",
    step4_mono: "YUBUNE",
    step4_body:
      "Keep your towel out of the tub and settle in quietly up to your shoulders. No swimming or diving — just relax.",
    step5_title: "Rinsing off",
    step5_mono: "AGARIYU",
    step5_body:
      "After the bath, a light rinse washes away the sweat. Dry off before returning to the changing room to keep the floor dry.",
    step6_title: "Heading out",
    step6_mono: "YUAGARI",
    step6_body:
      "Return your locker key and check for anything left behind. A cold drink afterward is part of the sento experience.",
  },

  sento: {
    page_eyebrow: "SENTO — THE BATHHOUSE",
    page_title: "Daikoku-yu",
    page_romaji: "大黒湯 — Bunkyo Ward, Tokyo",
    lede: "A timeless bathhouse\nin a Bunkyo back street.",
    body1:
      "Daikoku-yu has kept its furnace burning for decades, woven into the daily rhythm of the neighborhood.",
    body2:
      "A greeting across the reception counter, easy chatter between regulars — here, time slows down in a way the city rarely allows. Welcoming everyone who walks through its doors, without exception, is the quiet pride Daikoku-yu has carried all along.",

    feature1_title: "An old-fashioned entrance welcomes you",
    feature1_body:
      "Slide open the latticed door and you step into a stone-floored genkan lined with wooden shoe lockers — an entryway that has looked much the same since the Showa era.",
    feature2_title: "Connection begins at the counter",
    feature2_body:
      "A few words exchanged at the counter set the tone for your visit — staff are happy to walk first-timers through the routine.",
    feature3_title: "A soaring open ceiling",
    feature3_body:
      "The bathing hall rises into a tall, open ceiling, with high clerestory windows drawing in light and air. The steam lifts and drifts away — classic old-bathhouse architecture.",

    access_eyebrow: "ACCESS — LOCATION",
    access_title: "Access",
    access_addr_label: "ADDRESS",
    access_addr_value: "3-8-6 Otsuka, Bunkyo-ku, Tokyo 112-0012",
    access_hours_label: "HOURS",
    access_hours_value: "15:30 — 23:30",
    access_closed_label: "CLOSED",
    access_closed_value: "Mondays",
    access_price_label: "PRICE",
    access_price_value: "Adults ¥600 / Junior high ¥500 / Elementary & under ¥200",
    access_cta: "Open in Google Maps",
  },

  manner: {
    page_eyebrow: "MANNER — ETIQUETTE",
    page_title: "Bathe well, together.",
    page_intro:
      "A sento is a place where strangers share the same bathwater. A little consideration goes a long way toward making it comfortable for everyone.",
    index_title: "How it works",

    rules_eyebrow: "RULES — GOOD TO KNOW",
    rules_title: "A few more things",
    rules_body:
      "Some of these vary from one bathhouse to the next. When in doubt, a quick word at the front desk settles it.",
    rule1_title: "About tattoos",
    rule1_body:
      "Policies vary by bathhouse. Many allow entry if tattoos are covered with a patch, so it's worth checking ahead.",
    rule2_title: "Photos and video",
    rule2_body:
      "Filming in the changing room or bath is prohibited, out of respect for other guests' privacy.",
    rule3_title: "Keep towels out of the tub",
    rule3_body: "For hygiene, never let your towel touch the bathwater.",
    rule4_title: "No swimming or diving",
    rule4_body: "The tub is a place to sit quietly — please don't swim or splash.",
    rule5_title: "Keep conversation quiet",
    rule5_body: "Avoid loud talking so everyone can share a peaceful atmosphere.",
    rule6_title: "Skip the bath after drinking",
    rule6_body: "Bathing while intoxicated can be dangerous — come back once you've sobered up.",

    faq_title: "Common myths",
    faq1_q: "Are tattoos always a dealbreaker?",
    faq1_a:
      "It depends on the bathhouse. Many allow entry if you cover tattoos with a patch — often the real barrier is just assuming you can't go in. If you're unsure, it's worth asking ahead.",
    faq2_q: "What if I don't speak Japanese?",
    faq2_a:
      "You'll be fine. Follow the steps on this page and you can enjoy a sento with very little conversation. Staff are used to helping with gestures when needed.",
    faq3_q: "Can I wear a swimsuit?",
    faq3_a:
      "Swimsuits aren't worn at a sento — bathing without clothes is the standard practice. It might feel unfamiliar at first, but it's part of the culture of unguarded, honest connection sento are known for.",
  },

  about: {
    page_eyebrow: "ABOUT — THE PROJECT",
    page_title: "Multicultural exchange\nstarts at the sento.",
    lede: "Taking down\nthe invisible wall.",
    body1:
      "YU-NITY began as a university seminar project. We wanted to use Japan's uniquely local sento culture as a doorway for foreign visitors and local residents to meet naturally — and that's where our activities started.",
    body2:
      "Through research and interviews, we learned that many foreign visitors are genuinely curious about sento but hesitate to take the first step, held back by uncertainty about etiquette and a lack of information.",
    body3:
      "By sharing sento culture accurately and warmly, we hope to gradually take down that invisible wall.",
    team_title: "Meet\nYU-NITY",
  },

  team: {
    member1_bio:
      "I keep an eye on the whole team while we figure out the best way to share what makes sento special.",
    member2_bio: "Planning the programs that connect sento with visitors is where I do my best work.",
    member3_bio: "I dig through research and interviews to surface what people really think and feel.",
    member4_bio: "I handle the visuals that carry the warmth of the sento experience.",
    member5_bio: "I share YU-NITY's activities through social media and events.",
    member6_bio: "I run our on-site exchange events — safely, and with plenty of fun.",
  },

  footer: {
    tagline: "Connecting worlds through sento",
    copy: "© 2026 YU-NITY PROJECT. ALL RIGHTS RESERVED.",
  },
};
