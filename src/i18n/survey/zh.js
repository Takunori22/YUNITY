export default {
  intro: "除非另有说明，请勾选一个选项。答案没有对错之分。",
  consent: "您的回答将以匿名方式收集，仅用于改善 YU-NITY 项目。",
  section: { s1: "基本信息", s2: "体验前", s3: "体验钱汤后", s4: "最后" },
  q: {
    q1_nationality: { label: "您的国籍是什么？" },
    q2_visited_before: {
      label: "您以前去过日本的“钱汤”（公共浴场）吗？",
      opt: { first_time: "这是第一次", visited_before: "以前去过" },
    },
    q3_familiarity: {
      label: "体验之前，您了解作为日本文化之一的“钱汤”吗？",
      opt: { knew_a_lot: "非常了解", knew_a_little: "稍微了解", heard_only: "只听说过名字", did_not_know: "不了解" },
    },
    q4_hesitation: {
      label: "您对体验钱汤是否感到不安或有所抵触？",
      opt: { a_lot: "非常有", some: "有一些", not_much: "不太有", none: "完全没有" },
    },
    q5_concerns: {
      label: "您对哪些方面感到不安？（可多选）",
      opt: {
        naked: "裸体",
        etiquette: "入浴方法和礼仪",
        language: "听不懂语言",
        with_others: "与他人一起入浴",
        tattoos: "纹身",
        other: "其他",
        none: "没有",
      },
    },
    q6_explanation_helped: { label: "事先对规则和礼仪的说明是否帮助您更安心地体验钱汤？" },
    q7_understanding_deepened: { label: "实际体验钱汤后，您觉得自己对日本文化和习惯的理解加深了吗？" },
    q8_impression_change: {
      label: "体验前后，您对日本钱汤的印象有变化吗？",
      opt: { much_more_positive: "变得好很多", somewhat_more_positive: "变得稍微好一些", no_change: "没有变化", more_negative: "变差了" },
    },
    q9_felt_closer: { label: "通过这次钱汤体验，您是否更加切身地感受到日本人的文化和日常生活？" },
    q10_free_comment: { label: "请自由填写这次钱汤体验中给您留下深刻印象的事情，或您新了解到的日本文化。" },
  },
  scale: { low: "1 = 完全没有", high: "5 = 非常" },
  nationality: { placeholder: "请选择您的国家/地区" },
  ui: {
    back: "上一步",
    next: "下一步",
    submit: "提交",
    step: "第 {n} / {total} 步",
    required: "此题为必答题。",
    pick_one_plus: "请至少选择一项。",
    retry: "重试",
  },
  thanks: { title: "感谢您分享您的体验。", body: "您的回答已记录。", home: "返回首页" },
  error_generic: "提交时发生错误，请重试。",
};
