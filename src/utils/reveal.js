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
  // Sento page (dedicated) — 斜め分割 (.split) の文字側
  ".sento-page-header .split__body > *",
  ".split--feature .split__body > *",
  // Manner page (dedicated)
  ".manner-page-header .split__body > *",
  ".step-card__title",
  ".step-card__body",
  ".manner-rules-section .split__body > *",
  ".manner-faq-section .split__body > *",
  // Gallery
  ".lead-heading__wrap",
  ".gallery-tile",
  // Sento teaser (home)
  ".sento-section .split__body > *",
  // Manner teaser (home)
  ".manner-section .split__body > *",
  // About story (dedicated page)
  ".about-story-section .section__label",
  ".about-story-section .section__title",
  ".about-story-section .section__body",
  // Team
  ".team-section .section__label",
  ".team-section .section__title",
  ".team-card",
  // Survey
  ".survey-section__inner > *",
  // About teaser (home)
  ".about-teaser-section .section__label",
  ".about-teaser-section .section__title",
  ".about-teaser-section .section__body",
  ".about-teaser__avatars img",
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
