import { QUESTIONS, STEPS, EXCLUSIVE_OPTION } from "./questions.js";
import { sortedCountries, englishCountryName } from "./countries.js";
import { t, getCurrentLang, setLanguage } from "../i18n/index.js";

const DRAFT_KEY = "yunity-survey-draft";

const state = {
  step: 1,
  answers: {},
  status: "editing", // editing | submitting | done | error
  submit: null,
  root: null,
};

export function getSurveyState() {
  return { step: state.step, answers: { ...state.answers } };
}

export function initSurvey({ rootId, submit = null } = {}) {
  const root = document.getElementById(rootId);
  if (!root) return;
  state.root = root;
  state.submit = submit;
  state.answers = loadDraft();
  state.step = firstIncompleteStep();
  render();

  // 言語切替に追従（ヘッダートグル）
  document.querySelectorAll("[data-lang-btn]").forEach((b) =>
    b.addEventListener("click", () => {
      if (state.status !== "done") render();
    })
  );
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state.answers));
  } catch {}
}
function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

function firstIncompleteStep() {
  for (let s = 1; s <= 4; s++) {
    if (STEPS[s - 1].some((q) => q.required && !isAnswered(q))) return s;
  }
  return 4;
}

function isAnswered(q) {
  if (q.id === "q1_nationality") return !!state.answers.q1_nationality_code;
  const v = state.answers[q.id];
  if (q.type === "multi") return Array.isArray(v) && v.length > 0;
  if (q.type === "longtext") return true; // optional
  return v !== undefined && v !== null && v !== "";
}

function setAnswer(id, value) {
  state.answers[id] = value;
  saveDraft();
}

function toggleMulti(id, opt) {
  const cur = new Set(state.answers[id] || []);
  const exclusive = EXCLUSIVE_OPTION[id];
  if (opt === exclusive) {
    cur.has(opt) ? cur.delete(opt) : (cur.clear(), cur.add(opt));
  } else {
    cur.delete(exclusive);
    cur.has(opt) ? cur.delete(opt) : cur.add(opt);
  }
  setAnswer(id, [...cur]);
}

function validateStep() {
  const missing = STEPS[state.step - 1].filter((q) => q.required && !isAnswered(q));
  return missing[0] || null;
}

// ---------- rendering ----------

function render() {
  const root = state.root;
  root.innerHTML = "";
  if (state.status === "done") return renderThanks(root);

  const step = STEPS[state.step - 1];

  const head = el("div", "survey-head");
  head.append(
    el("p", "survey-progress", t("surveyForm.ui.step", { n: state.step, total: 4 })),
    el("div", "survey-bar", "", (b) => {
      const fill = el("span", "survey-bar__fill");
      fill.style.width = `${(state.step / 4) * 100}%`;
      b.append(fill);
    }),
    el("h2", "survey-section", t(`surveyForm.section.s${state.step}`))
  );
  if (state.step === 1) {
    head.append(el("p", "survey-intro", t("surveyForm.intro")));
  }
  root.append(head);

  const form = el("div", "survey-step");
  step.forEach((q) => form.append(renderQuestion(q)));
  if (state.step === 4) {
    form.append(el("p", "survey-consent", t("surveyForm.consent")));
  }
  root.append(form);

  const err = el("p", "survey-error");
  err.hidden = true;
  root.append(err);

  const nav = el("div", "survey-nav");
  if (state.step > 1) {
    nav.append(
      btn("survey-btn survey-btn--ghost", t("surveyForm.ui.back"), () => {
        state.step--;
        render();
        scrollTop();
      })
    );
  }
  const isLast = state.step === 4;
  const primary = btn(
    "survey-btn survey-btn--primary",
    isLast ? t("surveyForm.ui.submit") : t("surveyForm.ui.next"),
    isLast ? onSubmit : onNext
  );
  if (state.status === "submitting") primary.disabled = true;
  nav.append(primary);
  root.append(nav);

  if (state.status === "error") {
    err.hidden = false;
    err.textContent = t("surveyForm.error_generic");
  }

  function onNext() {
    const bad = validateStep();
    if (bad) return showInvalid(bad, err);
    state.step++;
    render();
    scrollTop();
  }
  function onSubmit() {
    const bad = validateStep();
    if (bad) return showInvalid(bad, err);
    doSubmit();
  }
}

function renderQuestion(q) {
  const wrap = el("fieldset", "survey-q");
  wrap.dataset.qid = q.id;
  wrap.append(el("legend", "survey-q__label", t(`surveyForm.q.${q.id}.label`)));

  if (q.type === "country") {
    const sel = document.createElement("select");
    sel.className = "survey-select";
    const ph = new Option(t("surveyForm.nationality.placeholder"), "");
    ph.disabled = true;
    ph.selected = !state.answers.q1_nationality_code;
    sel.append(ph);
    for (const c of sortedCountries(getCurrentLang())) {
      const o = new Option(c.name, c.code);
      if (c.code === state.answers.q1_nationality_code) o.selected = true;
      sel.append(o);
    }
    sel.addEventListener("change", () => {
      state.answers.q1_nationality_code = sel.value;
      state.answers.q1_nationality = englishCountryName(sel.value);
      saveDraft();
    });
    wrap.append(sel);
    return wrap;
  }

  if (q.type === "longtext") {
    const ta = document.createElement("textarea");
    ta.className = "survey-textarea";
    ta.rows = 6;
    ta.value = state.answers[q.id] || "";
    ta.addEventListener("input", () => setAnswer(q.id, ta.value));
    wrap.append(ta);
    return wrap;
  }

  if (q.type === "scale5") {
    const row = el("div", "survey-scale");
    for (let n = 1; n <= 5; n++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "survey-scale__btn";
      b.textContent = String(n);
      if (state.answers[q.id] === n) b.classList.add("is-on");
      b.addEventListener("click", () => {
        setAnswer(q.id, n);
        render();
      });
      row.append(b);
    }
    wrap.append(row);
    wrap.append(
      el("div", "survey-scale__ends", "", (d) => {
        d.append(
          el("span", "", t("surveyForm.scale.low")),
          el("span", "", t("surveyForm.scale.high"))
        );
      })
    );
    return wrap;
  }

  // single | multi
  const list = el("div", "survey-opts");
  q.options.forEach((opt) => {
    const id = `${q.id}__${opt}`;
    const label = el("label", "survey-opt");
    const input = document.createElement("input");
    input.type = q.type === "multi" ? "checkbox" : "radio";
    input.name = q.id;
    input.id = id;
    if (q.type === "multi") {
      input.checked = (state.answers[q.id] || []).includes(opt);
      input.addEventListener("change", () => {
        toggleMulti(q.id, opt);
        render();
      });
    } else {
      input.checked = state.answers[q.id] === opt;
      input.addEventListener("change", () => {
        setAnswer(q.id, opt);
      });
    }
    label.append(input, el("span", "", t(`surveyForm.q.${q.id}.opt.${opt}`)));
    list.append(label);
  });
  wrap.append(list);
  return wrap;
}

function renderThanks(root) {
  root.append(
    el("div", "survey-thanks", "", (d) => {
      d.append(
        el("h2", "survey-thanks__title", t("surveyForm.thanks.title")),
        el("p", "survey-thanks__body", t("surveyForm.thanks.body")),
        btn("survey-btn survey-btn--primary", t("surveyForm.thanks.home"), () => {
          document.querySelector('.site-nav__tab[data-tab="home"]').click();
        })
      );
    })
  );
}

async function doSubmit() {
  state.status = "submitting";
  render();
  try {
    if (state.submit) await state.submit(buildAnswersView());
    state.status = "done";
    clearDraft();
  } catch {
    state.status = "error";
  }
  render();
}

function buildAnswersView() {
  // Task 8 で submit.js の buildPayload に置き換わる。ここでは answers をそのまま渡す。
  return { answers: state.answers, language: getCurrentLang() };
}

// ---------- tiny dom helpers ----------
function el(tag, cls, text, build) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  if (build) build(n);
  return n;
}
function btn(cls, text, onClick) {
  const b = el("button", cls, text);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}
function showInvalid(q, errNode) {
  const bad = q.type === "multi" ? t("surveyForm.ui.pick_one_plus") : t("surveyForm.ui.required");
  errNode.hidden = false;
  errNode.textContent = bad;
  const target = state.root.querySelector(`[data-qid="${q.id}"]`);
  if (target) target.scrollIntoView({ block: "center", behavior: "smooth" });
}
function scrollTop() {
  state.root.scrollIntoView({ block: "start" });
}
