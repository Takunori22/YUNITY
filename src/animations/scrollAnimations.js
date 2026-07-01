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
  // ── Concept ──────────────────────────────────────────
  registerAll(".concept-section .section__label", { y: 20 });
  registerAll(".concept-section__visual",          { x: -50 });
  registerAll(".concept-section__text > *",        { x: 40 }, 0.1);


  // ── Gallery ──────────────────────────────────────────
  registerAll(".gallery-section .section__label",  { y: 20 });
  registerAll(".gallery-section .section__title",  { y: 28 });

  // ── Team ─────────────────────────────────────────────
  register(document.querySelector(".team-section > .container"), { y: 20 });
  registerAll(".team-section .section__label",     { y: 20, delay: 0.15 });
  registerAll(".team-section .section__title",     { y: 28, delay: 0.15 });
  registerAll(".team-card",                        { y: 32, delay: 0.15 }, 0.08);

  // ── Survey ───────────────────────────────────────────
  registerAll(".survey-section__inner > *",        { y: 28 }, 0.12);

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
