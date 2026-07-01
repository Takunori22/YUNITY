import { gsap } from "gsap";

// ============================================================
//  temperature.js — the "湯の温度" journey engine
//  Reads each section's data-temp (0 cold night … 1 warm steam),
//  tracks the section nearest the viewport center, and lerps a
//  global --temp CSS var + window.__temp (read by the WebGL water).
//  Cold 藍 hero → warm 紅/山吹 survey climax.
// ============================================================

let sections = [];
let target = 0;
let current = 0;
let started = false;

function refreshSections() {
  sections = Array.from(document.querySelectorAll("[data-temp]"));
  computeTarget();
}

function computeTarget() {
  const mid = window.innerHeight / 2;
  let best = null;
  let bestDist = Infinity;
  for (const el of sections) {
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue; // section on a hidden (display:none) page
    const center = r.top + r.height / 2;
    const dist = Math.abs(center - mid);
    if (dist < bestDist) {
      bestDist = dist;
      best = el;
    }
  }
  if (best) {
    target = parseFloat(best.dataset.temp);
    if (Number.isNaN(target)) target = 0;
  }
  // Under reduced motion there is no ticker loop — snap instantly on scroll.
  if (window.__reducedMotion) {
    current = target;
    apply();
  }
}

function tick() {
  current += (target - current) * 0.06;
  if (Math.abs(target - current) < 0.0005) current = target;
  apply();
}

function apply() {
  window.__temp = current;
  document.documentElement.style.setProperty("--temp", current.toFixed(4));
}

export function initTemperature() {
  if (started) return;
  started = true;
  window.__temp = 0;

  refreshSections();
  current = target; // start already at the first section's temperature
  apply();

  window.addEventListener("scroll", computeTarget, { passive: true });
  window.addEventListener("resize", refreshSections);

  if (!window.__reducedMotion) {
    gsap.ticker.add(tick);
  }
}

// Called after a tab swap (sections of the newly-shown page are now measurable).
export function refreshTemperature() {
  refreshSections();
}
