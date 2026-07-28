import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
// scroll イベント + getBoundingClientRect()
// ScrollTrigger / IntersectionObserver を使わない最小構成
// ─────────────────────────────────────────────

const items = []; // { el, fromY, fromX, delay, active }

function register(el, { y = 0, x = 0, delay = 0 } = {}) {
  if (!el) return;
  gsap.set(el, { autoAlpha: 0, y, x, scale: 0.94 });
  items.push({ el, fromY: y, fromX: x, delay, active: false });
}

function registerAll(selector, opts = {}, staggerSec = 0) {
  document.querySelectorAll(selector).forEach((el, i) => {
    register(el, { ...opts, delay: (opts.delay ?? 0) + i * staggerSec });
  });
}

function checkVisible() {
  const vh = window.innerHeight;
  items.forEach((item) => {
    if (item.active) return; // once revealed, never reset
    const rect = item.el.getBoundingClientRect();
    const inView = rect.top < vh * 0.92 && rect.bottom > 0;
    if (inView) {
      item.active = true;
      gsap.to(item.el, {
        autoAlpha: 1, y: 0, x: 0, scale: 1,
        duration: 0.8, ease: "back.out(1.2)",
        delay: item.delay,
        overwrite: true,
      });
    }
  });
}

export function initScrollAnimations() {
  // ── Sento page (dedicated) ──────────────────────────────────────────────
  // 斜め分割 (.split) の写真枠は最初から出したまま、文字側だけを順に起こす。
  // 写真枠は絶対配置 + clip-path なので、scale を掛けると斜めの形が崩れる。
  registerAll(".sento-page-header .split__body > *", { y: 24 }, 0.08);
  registerAll(".split--feature .split__body > *",     { y: 24 }, 0.08);

  // ── Manner page (dedicated) ─────────────────────────
  // ステップのタイルは gap 0 で密着しているので、タイルごと縮めて出すと
  // 一瞬すき間が見える。タイルは出したまま、中の文字だけを起こす。
  registerAll(".manner-page-header .split__body > *",  { y: 24 }, 0.08);
  registerAll(".step-card__title",                      { y: 22 }, 0.05);
  registerAll(".step-card__body",                       { y: 22 }, 0.05);
  registerAll(".manner-rules-section .split__body > *", { y: 24 }, 0.08);
  registerAll(".manner-faq-section .split__body > *",   { y: 24 }, 0.08);

  // ── Gallery ──────────────────────────────────────────
  // 見出しと下線をまとめて起こす（下線だけ先に見えると間が抜ける）。
  registerAll(".lead-heading__wrap",               { y: 28 });
  registerAll(".gallery-tile",                     { y: 32 }, 0.06);

  // ── Sento teaser (home) ─────────────────────────────────────────────
  // 写真が左、文字が右。右から滑り込ませて斜めの流れに沿わせる。
  registerAll(".sento-section .split__body > *", { x: 40 }, 0.08);

  // ── Manner teaser (home) ────────────────────────────
  // 写真が右、文字が左。左から滑り込ませて銭湯紹介と逆向きにする。
  registerAll(".manner-section .split__body > *", { x: -40 }, 0.08);

  // ── About story (dedicated page) ────────────────────
  registerAll(".about-story-section .section__label", { y: 20 });
  registerAll(".about-story-section .section__title", { y: 28 });
  registerAll(".about-story-section .section__body",  { y: 20 }, 0.08);

  // ── Team ─────────────────────────────────────────────
  register(document.querySelector(".team-section > .container"), { y: 20 });
  registerAll(".team-section .section__label",     { y: 20, delay: 0.15 });
  registerAll(".team-section .section__title",     { y: 28, delay: 0.15 });
  registerAll(".team-card",                        { y: 32, delay: 0.15 }, 0.08);

  // ── Survey ───────────────────────────────────────────
  registerAll(".survey-section__inner > *",        { y: 28 }, 0.12);

  // ── About teaser (home) ─────────────────────────────
  registerAll(".about-teaser-section .section__label", { y: 20 });
  registerAll(".about-teaser-section .section__title", { y: 28 });
  registerAll(".about-teaser-section .section__body",  { y: 20, delay: 0.1 });
  registerAll(".about-teaser__avatars img",             { y: 24, delay: 0.15 }, 0.05);

  // ── 初期チェック（ロード時・anchor 遷移時にビュー内の要素を即表示）──
  checkVisible();
  requestAnimationFrame(() => {
    checkVisible();
  });
  // 全リソースロード後の最終フォールバック
  window.addEventListener("load", () => {
    checkVisible();
  }, { once: true });

  // ── Scroll listener ──────────────────────────────────
  window.addEventListener("scroll", () => {
    checkVisible();

    // Nav
    document.getElementById("nav")
      ?.classList.toggle("nav--scrolled", window.scrollY > 80);
  }, { passive: true });
}
