export default {
  intro: "特に指定がない場合は1つだけ選んでください。正解・不正解はありません。",
  consent: "いただいた回答は匿名で集計し、YU-NITY の活動改善のためだけに使用します。",
  section: { s1: "基本情報", s2: "体験前", s3: "体験後", s4: "最後に" },
  q: {
    q1_nationality: { label: "国籍を教えてください" },
    q2_visited_before: {
      label: "これまでに日本の銭湯（公衆浴場）を利用したことがありますか？",
      opt: { first_time: "今回が初めて", visited_before: "以前に利用したことがある" },
    },
    q3_familiarity: {
      label: "今回の体験の前から、日本文化のひとつとして銭湯を知っていましたか？",
      opt: { knew_a_lot: "よく知っていた", knew_a_little: "少し知っていた", heard_only: "名前を聞いたことがある程度", did_not_know: "知らなかった" },
    },
    q4_hesitation: {
      label: "銭湯を体験することに、不安やためらいはありましたか？",
      opt: { a_lot: "とてもあった", some: "少しあった", not_much: "あまりなかった", none: "まったくなかった" },
    },
    q5_concerns: {
      label: "どんなことが不安でしたか？（複数選択可）",
      opt: {
        naked: "裸になること",
        etiquette: "入浴の手順やマナー",
        language: "言葉が分からないこと",
        with_others: "他の人と一緒に入浴すること",
        tattoos: "タトゥー",
        other: "その他",
        none: "特にない",
      },
    },
    q6_explanation_helped: { label: "事前のルール・マナー説明は、安心して銭湯を利用するのに役立ちましたか？" },
    q7_understanding_deepened: { label: "銭湯を体験して、日本の文化や習慣への理解が深まったと感じますか？" },
    q8_impression_change: {
      label: "体験の前後で、日本の銭湯に対する印象は変わりましたか？",
      opt: { much_more_positive: "とても良くなった", somewhat_more_positive: "少し良くなった", no_change: "変わらなかった", more_negative: "悪くなった" },
    },
    q9_felt_closer: { label: "銭湯の体験を通じて、日本の文化や日常生活を身近に感じられましたか？" },
    q10_free_comment: { label: "今回の銭湯体験で印象に残ったことや、初めて知った日本文化について自由にお書きください。" },
  },
  scale: { low: "1 = まったくそう思わない", high: "5 = とてもそう思う" },
  nationality: { placeholder: "国を選択してください" },
  ui: {
    back: "戻る",
    next: "次へ",
    submit: "送信",
    step: "ステップ {n} / {total}",
    required: "この設問は必須です。",
    pick_one_plus: "1つ以上選んでください。",
    retry: "再試行",
  },
  thanks: { title: "ご回答ありがとうございました。", body: "回答を記録しました。", home: "ホームへ戻る" },
  error_generic: "送信中にエラーが発生しました。もう一度お試しください。",
};
