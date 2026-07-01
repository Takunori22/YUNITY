// ============================================================
//  reveal.js — reduced-motion "reveal everything" registry
//  Single source of truth so every animated element stays
//  visible when prefers-reduced-motion is on. Any new element
//  that starts hidden (autoAlpha:0 / clipPath / scale / --steam)
//  MUST be added to REVEAL_SELECTORS below.
// ============================================================

export const REVEAL_SELECTORS = [
  // Hero
  ".hero__label",
  ".hero__logo",
  ".hero__logo .char",
  ".hero__heading",
  ".hero__subtitle",
  ".hero__cta",
  ".hero__scroll-indicator",
  // Concept
  ".concept-section .section__label",
  ".concept-section__visual",
  ".concept-section__text > *",
  // Gallery
  ".gallery-section .section__label",
  ".gallery-section .section__title",
  // Team
  ".team-section .section__label",
  ".team-section .section__title",
  ".team-card",
  // Survey
  ".survey-section__inner > *",
].join(", ");

// Force everything visible & untransformed (reduced-motion path).
export function revealAll(gsap) {
  gsap.set(REVEAL_SELECTORS, {
    autoAlpha: 1,
    clearProps: "all",
    clipPath: "none",
    x: 0,
    y: 0,
    scale: 1,
  });
  // Hero engraved-letter glow should read as fully settled.
  gsap.set(".hero__logo", { "--steam": 1 });
  // Team photos are CSS rounded-rectangles — no clip animation, leave shape to CSS.
  gsap.set(".team-card__photo", { clipPath: "none" });
  // Survey brushstroke shows fully drawn (offset also enforced in survey.js).
  document.querySelectorAll(".survey-brush__path").forEach((p) => {
    p.style.strokeDashoffset = "0";
  });
}
