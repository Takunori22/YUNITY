import { SURVEY_ENDPOINT } from "./endpoint.js";

export function buildPayload(answers, lang, meta = {}) {
  return {
    language: lang,
    _hp: "",
    answers: {
      q1_nationality_code: answers.q1_nationality_code || "",
      q1_nationality: answers.q1_nationality || "",
      q2_visited_before: answers.q2_visited_before || "",
      q3_familiarity: answers.q3_familiarity || "",
      q4_hesitation: answers.q4_hesitation || "",
      q5_concerns: Array.isArray(answers.q5_concerns) ? answers.q5_concerns : [],
      q6_explanation_helped: numOrEmpty(answers.q6_explanation_helped),
      q7_understanding_deepened: numOrEmpty(answers.q7_understanding_deepened),
      q8_impression_change: answers.q8_impression_change || "",
      q9_felt_closer: numOrEmpty(answers.q9_felt_closer),
      q10_free_comment: answers.q10_free_comment || "",
    },
    meta: {
      userAgent: meta.userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : ""),
      startedAt: meta.startedAt || "",
      submittedAt: meta.submittedAt || new Date().toISOString(),
    },
  };
}

function numOrEmpty(v) {
  return typeof v === "number" ? v : "";
}

export async function submitSurvey(payload) {
  return fetch(SURVEY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });
}
