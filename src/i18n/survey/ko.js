export default {
  intro: "별도 안내가 없는 경우 하나의 항목에 체크해 주세요. 정답이나 오답은 없습니다.",
  consent: "응답은 익명으로 수집되며 YU-NITY 프로젝트 개선을 위해서만 사용됩니다.",
  section: { s1: "기본 정보", s2: "체험 전", s3: "센토 체험 후", s4: "마지막으로" },
  q: {
    q1_nationality: { label: "국적은 무엇입니까?" },
    q2_visited_before: {
      label: "일본의 센토(대중목욕탕)를 이용해 본 적이 있습니까?",
      opt: { first_time: "이번이 처음입니다", visited_before: "이용한 적이 있습니다" },
    },
    q3_familiarity: {
      label: "체험 전, 일본 문화의 하나인 센토에 대해 알고 있었습니까?",
      opt: { knew_a_lot: "잘 알고 있었다", knew_a_little: "조금 알고 있었다", heard_only: "이름만 들어봤다", did_not_know: "몰랐다" },
    },
    q4_hesitation: {
      label: "센토를 체험하는 것에 대해 불안감이나 거부감이 있었습니까?",
      opt: { a_lot: "매우 있었다", some: "조금 있었다", not_much: "별로 없었다", none: "전혀 없었다" },
    },
    q5_concerns: {
      label: "어떤 점이 불안했습니까? (복수 선택 가능)",
      opt: {
        naked: "나체가 되는 것",
        etiquette: "입욕 방법 및 예절",
        language: "언어를 이해하지 못하는 것",
        with_others: "다른 사람과 함께 목욕하는 것",
        tattoos: "문신",
        other: "기타",
        none: "특별 없음",
      },
    },
    q6_explanation_helped: { label: "사전에 받은 규칙 및 예절 설명이 안심하고 센토를 체험하는 데 도움이 되었습니까?" },
    q7_understanding_deepened: { label: "센토를 직접 체험한 후 일본 문화와 생활 습관에 대한 이해가 깊어졌다고 느끼십니까?" },
    q8_impression_change: {
      label: "체험 전후로 일본 센토에 대한 이미지가 바뀌었습니까?",
      opt: { much_more_positive: "매우 좋아졌다", somewhat_more_positive: "조금 좋아졌다", no_change: "변하지 않았다", more_negative: "나빠졌다" },
    },
    q9_felt_closer: { label: "센토 체험을 통해 일본인의 문화와 일상생활을 더 가깝게 느낄 수 있었습니까?" },
    q10_free_comment: { label: "이번 센토 체험에서 인상 깊었던 점이나 새롭게 알게 된 일본 문화에 대해 자유롭게 적어 주세요." },
  },
  scale: { low: "1 = 전혀 그렇지 않다", high: "5 = 매우 그렇다" },
  nationality: { placeholder: "국가를 선택하세요" },
  ui: {
    back: "이전",
    next: "다음",
    submit: "제출",
    step: "{n} / {total} 단계",
    required: "이 문항은 필수입니다.",
    pick_one_plus: "하나 이상 선택해 주세요.",
    retry: "다시 시도",
  },
  thanks: { title: "소중한 경험을 공유해 주셔서 감사합니다.", body: "응답이 저장되었습니다.", home: "홈으로" },
  error_generic: "전송 중 오류가 발생했습니다. 다시 시도해 주세요.",
};
