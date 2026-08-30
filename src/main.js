import { initI18n, hasStoredLang, setLanguage, detectDefaultLang } from "./i18n/index.js";
import { initReveal } from "./animations/reveal.js";
import { createParallax } from "./animations/parallax.js";
import { createHeaderChrome } from "./animations/header.js";
import { initTabs } from "./animations/tabs.js";
import { initSurvey } from "./survey/wizard.js";

// ── 動きの設定はここが唯一の判断点 ───────────────────
// .js-motion が付いているときだけ animations.css のリビールが働く。
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduced) document.body.classList.add("js-motion");

initI18n();

function initLangGate() {
  const gate = document.getElementById("lang-gate");
  if (!gate || hasStoredLang()) return;

  const suggestion = detectDefaultLang();
  const btns = [...gate.querySelectorAll("[data-lang-choice]")];
  const suggested = btns.find((b) => b.dataset.langChoice === suggestion);
  if (suggested) suggested.classList.add("is-suggested");

  gate.hidden = false;
  document.body.style.overflow = "hidden";
  (suggested || btns[0]).focus();

  function trap(e) {
    if (e.key !== "Tab") return;
    const first = btns[0], last = btns[btns.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  gate.addEventListener("keydown", trap);

  btns.forEach((b) =>
    b.addEventListener("click", () => {
      setLanguage(b.dataset.langChoice);
      gate.hidden = true;
      document.body.style.overflow = "";
      gate.removeEventListener("keydown", trap);
    })
  );
}
initLangGate();

// ── スクロール連動 — リスナーは1本にまとめて rAF で間引く ──
const updateHeader = createHeaderChrome();
const updateParallax = reduced ? () => {} : createParallax();

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updateHeader();
    updateParallax();
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });

// タブを先に確定させてからリビールを仕込む。#manner のように
// 直接ページを指して来たとき、走査時に正しいページが表示されていないと
// 「読み込み時に画面内にある要素」を取り違える。
initTabs({ reduced, onSwap: onScroll });

initSurvey({ rootId: "survey-form-root" });

if (!reduced) initReveal();

// ── モバイルのドロワー ──────────────────────────────
function initNavToggle() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });
}
initNavToggle();

onScroll();
