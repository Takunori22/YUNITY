// ============================================================
//  tabs.js — ページ切替と湯幕（水面のトランジション）
//
//  湯が下から立ち上がって全面を覆い、覆っている間にページを差し替え、
//  そのまま上へ抜ける。GSAP は使わず CSS transition + タイマーで組む。
// ============================================================

const VALID_TABS = ["home", "sento", "manner", "about", "survey"];
const STEP_HASH = /^step-[1-6]$/;

const D = 380; // 立ち上がり / 抜けの時間
const HOLD = 170; // 全面を覆った状態で保持する時間
const EASE = "cubic-bezier(0.65,0,0.35,1)";

/** ハッシュから表示すべきタブを決める。#step-3 のような
 *  ステップへのアンカーはマナーページに属する。 */
function tabFromHash(hash) {
  const id = hash.replace(/^#/, "");
  if (VALID_TABS.includes(id)) return id;
  if (STEP_HASH.test(id)) return "manner";
  return "home";
}

export function initTabs({ reduced = false, onSwap } = {}) {
  const pages = document.querySelectorAll(".page");
  const noren = document.getElementById("noren");
  const water = document.getElementById("noren-water");
  const crest = document.getElementById("noren-crest");
  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");

  const useCurtain = !reduced && noren && water && crest;
  let currentTab = null;
  let timers = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function closeDrawer() {
    nav?.classList.remove("is-open");
    toggle?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  function applySwap(tabId, { scroll = true } = {}) {
    document
      .querySelectorAll(".site-nav__tab")
      .forEach((el) => el.classList.toggle("active", el.dataset.tab === tabId));
    pages.forEach((p) => p.classList.toggle("active", p.id === `page-${tabId}`));
    // html に scroll-behavior:smooth が効いているので instant を明示する
    if (scroll) window.scrollTo({ top: 0, behavior: "instant" });
    closeDrawer();
    onSwap?.();
  }

  function runCurtain(tabId) {
    clearTimers();
    noren.classList.add("is-active");

    water.style.transition = "none";
    water.style.transform = "translate3d(0,100%,0)";
    crest.style.transition = "none";
    crest.style.opacity = "0";
    crest.style.transform = "translate3d(0,28px,0) scale(.85)";
    void water.offsetWidth; // リセットを確定させてから立ち上げる

    requestAnimationFrame(() => {
      water.style.transition = `transform ${D}ms ${EASE}`;
      water.style.transform = "translate3d(0,0,0)";
      crest.style.transition = `opacity ${D * 0.8}ms ease, transform ${D * 0.8}ms ${EASE}`;
      crest.style.transitionDelay = "50ms";
      crest.style.opacity = "1";
      crest.style.transform = "translate3d(0,0,0) scale(1)";
    });

    later(() => {
      applySwap(tabId);
      later(() => {
        crest.style.transition = `opacity ${D * 0.5}ms ease, transform ${D * 0.5}ms ${EASE}`;
        crest.style.transitionDelay = "0ms";
        crest.style.opacity = "0";
        crest.style.transform = "translate3d(0,-22px,0) scale(1)";
        water.style.transition = `transform ${D}ms ${EASE}`;
        water.style.transform = "translate3d(0,-100%,0)";
        later(() => noren.classList.remove("is-active"), D + 20);
      }, HOLD);
    }, D + 40);
  }

  function activateTab(tabId, { animate = true, push = true, scroll = true } = {}) {
    if (!VALID_TABS.includes(tabId)) tabId = "home";
    if (tabId === currentTab) {
      // 同じタブの再クリックは先頭へ戻すだけ
      if (animate) {
        closeDrawer();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    currentTab = tabId;
    if (push) history.pushState(null, "", `#${tabId}`);

    if (animate && useCurtain) runCurtain(tabId);
    else applySwap(tabId, { scroll });
  }

  // ナビ・フッター・本文中の [data-tab] をまとめて拾う
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-tab]");
    if (!trigger) return;
    if (trigger.tagName === "A" && trigger.getAttribute("href") === "#") e.preventDefault();
    activateTab(trigger.dataset.tab);
  });

  window.addEventListener("popstate", () => {
    activateTab(tabFromHash(location.hash), { animate: false, push: false });
  });

  // 初回描画は湯幕なし。ここで先頭に戻すと、#survey のような
  // 同一ページ内アンカーでの着地位置を潰してしまうので scroll:false。
  // マナーページのステップは display:none の間に着地に失敗しているため、
  // ページを出したあとで改めて送る。
  const initialHash = location.hash;
  activateTab(tabFromHash(initialHash), { animate: false, push: false, scroll: false });
  if (STEP_HASH.test(initialHash.replace(/^#/, ""))) {
    requestAnimationFrame(() => {
      document.getElementById(initialHash.slice(1))?.scrollIntoView();
    });
  }

  return { activateTab, closeDrawer };
}
