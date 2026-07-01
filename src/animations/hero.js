import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initHero() {
  const logoEl = document.querySelector(".hero__logo");
  if (!logoEl) return;

  // Liquid reflection wobble on the tagline (desktop only — SVG displacement
  // is costly and hurts legibility on small screens).
  if (!window.__reducedMotion && window.innerWidth >= 768) {
    document.querySelector(".hero__heading")?.classList.add("liquid-text");
  }

  const text = logoEl.textContent;
  logoEl.innerHTML = text
    .split("")
    .map((c) => `<span class="char">${c === " " ? "&nbsp;" : c}</span>`)
    .join("");

  // GSAP が inline style で初期状態を管理する（CSS の opacity:0 に依存しない）
  const heroEls = [
    ".hero__label",
    ".hero__logo .char",
    ".hero__heading",
    ".hero__subtitle",
    ".hero__cta",
    ".hero__scroll-indicator",
  ];
  gsap.set(heroEls, { autoAlpha: 0 });
  gsap.set(".hero__logo", { "--steam": 0 });
  gsap.set(".hero__logo .char", { y: 80, rotateZ: -8 });
  gsap.set([".hero__label", ".hero__heading", ".hero__subtitle"], { y: 20 });
  gsap.set(".hero__cta", { y: 16, scale: 0.9 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.to(".hero__label",            { autoAlpha: 1, y: 0, duration: 0.6 })
    .to(".hero__logo .char",       { autoAlpha: 1, y: 0, rotateZ: 0, duration: 0.9, stagger: 0.06 }, "-=0.2")
    // engraved letters warm up with a steam glow as they settle
    .to(".hero__logo",             { "--steam": 1, duration: 1.0, ease: "sine.inOut" }, "-=0.4")
    .to(".hero__heading",          { autoAlpha: 1, y: 0, duration: 0.9 }, "-=0.7")
    .to(".hero__subtitle",         { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.3")
    .to(".hero__cta",              { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 }, "-=0.2")
    .to(".hero__scroll-indicator", { autoAlpha: 1, duration: 0.4 }, "+=0.3");

  // スクロールして戻ってきたときに再生
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    onEnterBack: () => {
      gsap.set(heroEls, { autoAlpha: 0 });
      gsap.set(".hero__logo", { "--steam": 0 });
      gsap.set(".hero__logo .char", { y: 80, rotateZ: -8 });
      gsap.set([".hero__label", ".hero__heading", ".hero__subtitle"], { y: 20 });
      gsap.set(".hero__cta", { y: 16, scale: 0.9 });
      tl.restart();
    },
  });
}
