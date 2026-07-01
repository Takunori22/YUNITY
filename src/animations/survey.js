import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
//  survey.js — the「ご記帳」guestbook climax
//  Sumi brushstroke draw-on (reuses the solution-path
//  strokeDashoffset technique), magnetic CTA, washi frame.
// ============================================================

let brushPath = null;
let drawTrigger = null;

function setupBrush(reduced) {
  brushPath = document.querySelector(".survey-brush__path");
  if (!brushPath) return;
  const len = brushPath.getTotalLength();
  gsap.set(brushPath, { strokeDasharray: len, strokeDashoffset: reduced ? 0 : len });

  if (reduced) return;

  drawTrigger?.kill();
  const tween = gsap.to(brushPath, {
    strokeDashoffset: 0,
    ease: "none",
    duration: 1,
    paused: true,
  });
  drawTrigger = ScrollTrigger.create({
    trigger: ".survey-section__title-wrap",
    start: "top 80%",
    once: true,
    onEnter: () => tween.play(),
  });
}

function setupMagneticCTA() {
  if (window.__reducedMotion) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;
  // The hero CTA ("声を聞かせてください") is the real survey conversion button.
  const cta = document.querySelector(".hero__cta");
  if (!cta) return;

  const xTo = gsap.quickTo(cta, "x", { duration: 0.4, ease: "power3" });
  const yTo = gsap.quickTo(cta, "y", { duration: 0.4, ease: "power3" });

  cta.addEventListener("pointermove", (e) => {
    const r = cta.getBoundingClientRect();
    const relX = e.clientX - (r.left + r.width / 2);
    const relY = e.clientY - (r.top + r.height / 2);
    xTo(relX * 0.35);
    yTo(relY * 0.5);
  });
  cta.addEventListener("pointerleave", () => {
    xTo(0);
    yTo(0);
  });
}

export function initSurvey({ reduced } = {}) {
  setupBrush(reduced);
  setupMagneticCTA();
}

// Called from window.__onLangChange — brush is a fixed SVG sibling of the
// title text so i18n textContent swaps don't wipe it, but re-measure in case
// fonts/layout shifted the SVG box.
export function recomputeBrush() {
  if (!brushPath) return;
  const len = brushPath.getTotalLength();
  const drawn = brushPath.style.strokeDashoffset === "0";
  gsap.set(brushPath, {
    strokeDasharray: len,
    strokeDashoffset: drawn || window.__reducedMotion ? 0 : len,
  });
}
