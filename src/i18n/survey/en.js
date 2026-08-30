export default {
  intro: "Please check one box unless otherwise stated. There are no right or wrong answers.",
  consent: "Your responses are collected anonymously and used only to improve the YU-NITY project.",
  section: {
    s1: "Basic information",
    s2: "Before the experience",
    s3: "After experiencing the sento",
    s4: "Finally",
  },
  q: {
    q1_nationality: { label: "What is your nationality?" },
    q2_visited_before: {
      label: "Have you ever visited a Japanese sento (public bath) before?",
      opt: { first_time: "This is my first time", visited_before: "I have visited one before" },
    },
    q3_familiarity: {
      label: "Before this experience, were you familiar with sento as part of Japanese culture?",
      opt: {
        knew_a_lot: "I knew a lot about it",
        knew_a_little: "I knew a little about it",
        heard_only: "I had only heard of it",
        did_not_know: "I did not know about it",
      },
    },
    q4_hesitation: {
      label: "Did you have any concerns or hesitation about experiencing a sento?",
      opt: { a_lot: "A lot", some: "Some", not_much: "Not much", none: "None at all" },
    },
    q5_concerns: {
      label: "What were you concerned about? (Select all that apply)",
      opt: {
        naked: "Being naked",
        etiquette: "Bathing procedures and etiquette",
        language: "Not understanding the language",
        with_others: "Bathing together with other people",
        tattoos: "Tattoos",
        other: "Other",
        none: "None",
      },
    },
    q6_explanation_helped: {
      label: "Did the explanation of the rules and etiquette beforehand help you feel more comfortable using the sento?",
    },
    q7_understanding_deepened: {
      label: "After experiencing the sento, do you feel that your understanding of Japanese culture and customs has deepened?",
    },
    q8_impression_change: {
      label: "Did your impression of Japanese sento change after the experience?",
      opt: {
        much_more_positive: "It became much more positive",
        somewhat_more_positive: "It became somewhat more positive",
        no_change: "It did not change",
        more_negative: "It became more negative",
      },
    },
    q9_felt_closer: {
      label: "Did the sento experience help you feel closer to Japanese culture and everyday life?",
    },
    q10_free_comment: {
      label: "Please tell us anything that stood out to you during this sento experience, or any aspects of Japanese culture that you learned about for the first time.",
    },
  },
  scale: { low: "1 = Not at all", high: "5 = Very much" },
  nationality: { placeholder: "Select your country" },
  ui: {
    back: "Back",
    next: "Next",
    submit: "Submit",
    step: "Step {n} / {total}",
    required: "This question is required.",
    pick_one_plus: "Please select at least one option.",
    retry: "Try again",
  },
  thanks: {
    title: "Thank you for sharing your experience.",
    body: "Your response has been recorded.",
    home: "Back to home",
  },
  error_generic: "Something went wrong sending your response. Please try again.",
};
