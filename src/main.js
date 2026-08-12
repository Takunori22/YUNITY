import { initI18n } from "./i18n/index.js";
import { initReveal } from "./animations/reveal.js";
import { createParallax } from "./animations/parallax.js";
import { createHeaderChrome } from "./animations/header.js";
import { initTabs } from "./animations/tabs.js";

// ── 動きの設定はここが唯一の判断点 ───────────────────
// .js-motion が付いているときだけ animations.css のリビールが働く。
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduced) document.body.classList.add("js-motion");

initI18n();

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
