// アンケートの設問スキーマ。保存値はすべて英語安定キー。
export const QUESTIONS = [
  { id: "q1_nationality", section: 1, type: "country", required: true },
  { id: "q2_visited_before", section: 1, type: "single", required: true,
    options: ["first_time", "visited_before"] },
  { id: "q3_familiarity", section: 2, type: "single", required: true,
    options: ["knew_a_lot", "knew_a_little", "heard_only", "did_not_know"] },
  { id: "q4_hesitation", section: 2, type: "single", required: true,
    options: ["a_lot", "some", "not_much", "none"] },
  { id: "q5_concerns", section: 2, type: "multi", required: true,
    options: ["naked", "etiquette", "language", "with_others", "tattoos", "other", "none"] },
  { id: "q6_explanation_helped", section: 3, type: "scale5", required: true },
  { id: "q7_understanding_deepened", section: 3, type: "scale5", required: true },
  { id: "q8_impression_change", section: 3, type: "single", required: true,
    options: ["much_more_positive", "somewhat_more_positive", "no_change", "more_negative"] },
  { id: "q9_felt_closer", section: 3, type: "scale5", required: true },
  { id: "q10_free_comment", section: 4, type: "longtext", required: false },
];

// q5 の排他オプション（選ぶと他を外す／他を選ぶと外れる）
export const EXCLUSIVE_OPTION = { q5_concerns: "none" };

export const STEPS = [1, 2, 3, 4].map((s) => QUESTIONS.filter((q) => q.section === s));
