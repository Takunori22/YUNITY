import ja from "./ja.js";
import en from "./en.js";
import zh from "./zh.js";
import ko from "./ko.js";

const translations = { ja, en, zh, ko };

const fontMap = {
  zh: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;500;700&display=swap",
  ko: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;500;700&display=swap",
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
    const key = el.dataset.i18n;
    const text = key.split(".").reduce((obj, k) => obj?.[k], translations[lang]);
    if (text != null) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
  });

  // Update Google Form iframe src and CTA link
  const formUrl = translations[lang].survey?.formUrl;
  const iframe = document.querySelector(".survey-iframe");
  if (iframe && formUrl) iframe.src = formUrl;
  const ctaLink = document.getElementById("survey-cta-link");
  if (ctaLink && formUrl) ctaLink.href = formUrl;

  // Update active state on language buttons
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langBtn === lang);
  });

  loadFont(lang);

  // setLanguage overwrites textContent — let decorations recompute geometry
  window.__onLangChange?.();
}

export function initI18n() {
  const lang = detectDefaultLang();
  const firstVisit = !localStorage.getItem("yunity-lang");

  if (firstVisit) {
    showLangOverlay();
  } else {
    setLanguage(lang);
    hideLangOverlay();
  }
}

function showLangOverlay() {
  const overlay = document.getElementById("lang-overlay");
  if (overlay) overlay.classList.remove("hidden");
}

function hideLangOverlay() {
  const overlay = document.getElementById("lang-overlay");
  if (overlay) overlay.classList.add("hidden");
}

export function getCurrentLang() {
  return localStorage.getItem("yunity-lang") || detectDefaultLang();
}
