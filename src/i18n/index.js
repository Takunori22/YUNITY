import ja from "./ja.js";
import en from "./en.js";
import zh from "./zh.js";
import ko from "./ko.js";

const translations = { ja, en, zh, ko };

// 和文フォントに中国語・韓国語の字形は入っていないので、
// その言語を選んだときだけ Noto を足す。
const fontMap = {
  zh: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap",
  ko: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap",
};

function loadFont(lang) {
  const url = fontMap[lang];
  if (url && !document.querySelector(`link[href="${url}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }
}

function detectDefaultLang() {
  const saved = localStorage.getItem("yunity-lang");
  if (saved && translations[saved]) return saved;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("ja")) return "ja";
  if (browser.startsWith("zh")) return "zh";
  if (browser.startsWith("ko")) return "ko";
  return "en";
}

export function setLanguage(lang) {
  if (!translations[lang]) return;
  localStorage.setItem("yunity-lang", lang);
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const text = el.dataset.i18n
      .split(".")
      .reduce((obj, key) => obj?.[key], translations[lang]);
    if (text != null) el.textContent = text;
  });

  // アンケートの回答先
  const formUrl = translations[lang].survey?.formUrl;
  const cta = document.getElementById("survey-cta");
  if (cta && formUrl) cta.href = formUrl;

  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langBtn === lang);
  });

  loadFont(lang);
}

export function initI18n() {
  setLanguage(detectDefaultLang());

  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.langBtn));
  });
}

export function getCurrentLang() {
  return localStorage.getItem("yunity-lang") || detectDefaultLang();
}
