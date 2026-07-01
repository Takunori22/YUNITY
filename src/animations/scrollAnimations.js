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

  // ── Problem ──────────────────────────────────────────
  registerAll(".problem-section .section__label",  { y: 20 });
  registerAll(".problem-section .section__title",  { y: 28 });
  registerAll(".counter-card",                     { y: 36 }, 0.1);
  register(document.querySelector(".problem-text-card:nth-child(1)"), { x: -48 });
  register(document.querySelector(".problem-text-card:nth-child(2)"), { x: 48, delay: 0.15 });
  register(document.querySelector(".problem-conclusion"),              { y: 24 });

  // カウントアップ（scroll イベントで監視）
  const counters = [];
  document.querySelectorAll("[data-counter]").forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const obj    = { val: 0 };
    let tween    = null;
    let active   = false;
    counters.push({
      el,
      check() {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
        if (inView && !active) {
          active = true;
          tween?.kill();
          obj.val = 0;
          tween = gsap.to(obj, {
            val: target, duration: 2, ease: "power1.out", snap: { val: 1 },
            onUpdate() { el.textContent = Math.round(obj.val) + suffix; },
            onComplete() {
              // Elastic landing: final-digit overshoot + 紅 ring flash
              gsap.fromTo(el, { scale: 1 },
                { scale: 1.14, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 });
              const card = el.closest(".counter-card");
              if (card) {
                card.classList.remove("counter-card--pop");
                void card.offsetWidth; // restart the keyframe
                card.classList.add("counter-card--pop");
              }
            },
          });
        } else if (!inView && active) {
          active = false;
          tween?.kill();
          el.textContent = "0" + suffix;
        }
      },
    });
  });

  // ── Solution ─────────────────────────────────────────
  // Register the container first so the white bg card is hidden until in view
  register(document.querySelector(".solution-section > .container"), { y: 20 });
  registerAll(".solution-section .section__label", { y: 20, delay: 0.15 });
  registerAll(".solution-section .section__title", { y: 28, delay: 0.15 });
  registerAll("[data-solution-card]",              { y: 40, delay: 0.15 }, 0.15);

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
  counters.forEach((c) => c.check());
  requestAnimationFrame(() => {
    checkVisible();
    counters.forEach((c) => c.check());
  });
  // 全リソースロード後の最終フォールバック
  window.addEventListener("load", () => {
    checkVisible();
    counters.forEach((c) => c.check());
  }, { once: true });

  // ── Scroll listener ──────────────────────────────────
  window.addEventListener("scroll", () => {
    checkVisible();
    counters.forEach((c) => c.check());

    // Nav
    document.getElementById("nav")
      ?.classList.toggle("nav--scrolled", window.scrollY > 80);
  }, { passive: true });

  // ── SVG path（スクラブのみ ScrollTrigger を維持）────
  const solutionPath  = document.querySelector(".solution-path");
  const pathContainer = document.querySelector(".solution-section__path");
  if (solutionPath && pathContainer && window.innerWidth >= 900) {
    pathContainer.style.display = "block";
    const len = solutionPath.getTotalLength();
    gsap.set(solutionPath, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(solutionPath, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: {
        trigger: ".solution-section__cards",
        start: "top 75%", end: "bottom 60%", scrub: 1,
      },
    });
  }
}
