import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const VALID_TABS = ["home", "sento", "manner", "about"];

export function initTabs(onTabSwitch) {
  const pages = document.querySelectorAll(".page");
  const noren = document.getElementById("noren");

  let transitioning = false;
  let currentTl = null;
  let currentTab = null;

  // The actual page swap — runs at the noren "covered midpoint" (or instantly)
  function applySwap(tabId) {
    document.querySelectorAll("[data-tab]").forEach((el) => {
      el.classList.toggle("active", el.dataset.tab === tabId);
    });
    pages.forEach((p) => p.classList.toggle("active", p.id === `page-${tabId}`));

    // Scroll to top (Lenis-aware, instant)
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    document.getElementById("nav")?.classList.remove("nav--scrolled");
    document.querySelector(".nav__links")?.classList.remove("open");
    document.getElementById("nav-hamburger")?.classList.remove("is-open");
    history.pushState(null, "", `#${tabId}`);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    onTabSwitch?.();
  }

  // Noren (暖簾) curtain transition wrapping the swap
  function activateTab(tabId, { animate = true } = {}) {
    if (!VALID_TABS.includes(tabId)) tabId = "home";
    if (tabId === currentTab && animate) return; // no-op re-click on same tab
    currentTab = tabId;

    const useNoren = animate && noren && !window.__reducedMotion;

    if (!useNoren) {
      applySwap(tabId);
      return;
    }

    // Interrupt guard — collapse any in-flight transition before starting.
    if (transitioning && currentTl) {
      currentTl.kill();
      gsap.set("#noren", { autoAlpha: 0, pointerEvents: "none" });
    }

    transitioning = true;
    const D = 0.36; // rise / drain duration — total ≈ --noren-duration (0.7s)
    const ease = "power2.inOut";

    currentTl = gsap
      .timeline({
        onComplete: () => {
          transitioning = false;
          gsap.set("#noren", { autoAlpha: 0, pointerEvents: "none" });
        },
      })
      .set("#noren", { autoAlpha: 1, pointerEvents: "auto" })
      .set(".noren__water", { yPercent: 100 })
      .set(".noren__crest", { autoAlpha: 0, scale: 0.85, y: 28 })
      // ── water rises to cover ──
      .to(".noren__water", { yPercent: 0, duration: D, ease })
      .to(".noren__crest", { autoAlpha: 1, scale: 1, y: 0, duration: D * 0.8 }, "<0.05")
      // ── covered midpoint: swap pages + refresh while hidden ──
      .add(() => applySwap(tabId))
      // ── water passes up and out, revealing the new page ──
      .set("#noren", { pointerEvents: "none" })
      .to(".noren__crest", { autoAlpha: 0, y: -22, duration: D * 0.5 }, ">-0.05")
      .to(".noren__water", { yPercent: -100, duration: D, ease }, "<");
  }

  // Event delegation — handles nav tabs and any [data-tab] button.
  // Only suppress default navigation for placeholder "#" anchors — a real
  // fragment href (e.g. the footer's href="#survey" data-tab="home" link)
  // must still get its native same-page scroll.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    if (btn.tagName === "A" && btn.getAttribute("href") === "#") e.preventDefault();
    activateTab(btn.dataset.tab);
  });

  // Browser back/forward — no curtain, just swap
  window.addEventListener("popstate", () => {
    const hash = window.location.hash.slice(1);
    activateTab(VALID_TABS.includes(hash) ? hash : "home", { animate: false });
  });

  // Initial tab from URL hash — no curtain on first paint
  const initialHash = window.location.hash.slice(1);
  activateTab(VALID_TABS.includes(initialHash) ? initialHash : "home", { animate: false });
}
