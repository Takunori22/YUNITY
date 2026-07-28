import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { initI18n, setLanguage } from "./i18n/index.js";
import { initHero } from "./animations/hero.js";
import { initScrollAnimations } from "./animations/scrollAnimations.js";
import { initGalleryParallax, initGalleryHeading } from "./animations/galleryParallax.js";
import { initTabs } from "./animations/tabs.js";
import { initSurvey, recomputeBrush } from "./animations/survey.js";
import { initTemperature } from "./animations/temperature.js";
import { initWater } from "./animations/water.js";
import { revealAll } from "./utils/reveal.js";
import { heroParticlesConfig, surveyConfettiConfig } from "./animations/particles.js";

gsap.registerPlugin(ScrollTrigger);

// ── Motion preference: single source of truth ───────────────
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
window.__reducedMotion = prefersReducedMotion;
document.body.classList.toggle("reduced", prefersReducedMotion);

// The hero liquid-text SVG filter only runs on desktop + full motion. Remove the
// SMIL-animated <svg defs> entirely otherwise so it doesn't spin the CPU unused.
if (prefersReducedMotion || window.innerWidth < 768) {
  document.querySelector(".svg-defs")?.remove();
}

// Expose language setter globally for inline onclick handlers
window.__setLang = (lang) => {
  setLanguage(lang);
  // Hide overlay when language is selected
  const overlay = document.getElementById("lang-overlay");
  if (overlay) {
    gsap.to(overlay, {
      autoAlpha: 0,
      duration: 0.5,
      onComplete: () => overlay.classList.add("hidden"),
    });
  }
};

// i18n overwrites textContent on every language switch — recompute any
// decorations that depend on layout (survey brushstroke geometry).
window.__onLangChange = () => {
  recomputeBrush();
};

// ── Lenis weighted smooth-scroll, bridged to gsap.ticker ────
function initSmoothScroll() {
  if (window.__reducedMotion) return;
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

async function initParticles() {
  await loadSlim(tsParticles);
  await tsParticles.load({ id: "hero-particles", options: heroParticlesConfig });
}

let surveyConfettiFired = false;
function initSurveyParticles() {
  ScrollTrigger.create({
    trigger: ".survey-section",
    start: "top 60%",
    onEnter: async () => {
      if (surveyConfettiFired) return;
      // Don't fire while the home page is hidden (display:none → zero-box trigger).
      const home = document.getElementById("page-home");
      if (!home || !home.classList.contains("active")) return;
      surveyConfettiFired = true;
      // loadSlim was already called in initParticles — just load the instance
      await tsParticles.load({ id: "survey-particles", options: surveyConfettiConfig });
    },
  });
}

function initNavHamburger() {
  const btn = document.getElementById("nav-hamburger");
  const links = document.querySelector(".nav__links");
  if (!btn || !links) return;

  btn.addEventListener("click", () => {
    links.classList.toggle("open");
    btn.classList.toggle("is-open");
  });

  links.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => {
      links.classList.remove("open");
      btn.classList.remove("is-open");
    });
  });
}

function initBackToTop() {
  document.getElementById("back-to-top")?.addEventListener("click", () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.1 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

// Smooth in-page anchor links (e.g. hero CTA → #survey), Lenis-aware.
function initAnchorLinks() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    if (!id) return; // ignore href="#"
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { offset: -72, duration: 1.1 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
}

function initSurveyIframe() {
  const iframe = document.querySelector(".survey-iframe");
  const placeholder = document.getElementById("survey-placeholder");
  const ctaLink = document.getElementById("survey-cta-link");
  const wrap = document.querySelector(".survey-section__form-wrap");
  if (!iframe || !wrap) return;

  const src = iframe.getAttribute("src") || "";

  // No URL or short URL (forms.gle) or not embedded=true → can't embed in iframe
  const isEmbeddable = src && src.includes("docs.google.com") && src.includes("embedded=true");

  if (!src || !isEmbeddable) {
    iframe.style.display = "none";
    if (placeholder) placeholder.style.display = "none";
    if (ctaLink && src) {
      ctaLink.style.display = "";
      wrap.classList.add("survey-form-wrap--cta");
    } else {
      wrap.classList.add("survey-form-wrap--no-iframe");
    }
    return;
  }

  iframe.addEventListener("load", () => {
    if (placeholder) placeholder.classList.add("hidden");
  });
}

async function main() {
  document.body.classList.add("js-loaded");

  // Initialize i18n (shows lang overlay on first visit)
  initI18n();

  // Smooth scroll (no-op under reduced motion)
  initSmoothScroll();

  // WebGL water background + temperature journey (both run in any motion mode;
  // water.js internally falls back to a static CSS gradient under reduced motion)
  initWater();
  initTemperature();

  // Animations
  if (!prefersReducedMotion) {
    initHero();
    initScrollAnimations();
    initGalleryParallax();
    initGalleryHeading();
    // Particles are purely decorative. A throw here (e.g. a tsParticles
    // engine/plugin version mismatch) must never abort main() and leave the
    // nav, tabs and anchor links below unwired.
    try {
      await initParticles();
      initSurveyParticles();
    } catch (err) {
      console.warn("[particles] disabled:", err);
    }
  } else {
    // Make all animated elements visible without animation
    revealAll(gsap);
  }

  // Tabs must work in BOTH branches (reduced-motion users navigate too)
  initTabs(() => {
    // タブ切替後にスクロールアニメーションを複数タイミングで再チェック
    [0, 80, 250].forEach(ms =>
      setTimeout(() => window.dispatchEvent(new Event("scroll")), ms)
    );
  });

  // Survey "ご記帳" climax — static under reduced motion
  initSurvey({ reduced: prefersReducedMotion });

  initNavHamburger();
  initBackToTop();
  initAnchorLinks();
  initSurveyIframe();
}

main();
