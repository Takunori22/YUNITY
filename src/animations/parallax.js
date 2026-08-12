// ============================================================
//  parallax.js — [data-parallax] の縦移動
//  写真は枠より inset:-14% 大きく敷いてあり、そのはみ出し分の中で動く。
//  transform ではなく translate プロパティを使う。全画面写真の
//  ドリフト（CSS animation）が transform を専有しているため。
// ============================================================

const MOBILE = "(max-width: 900px)";

export function createParallax() {
  const els = Array.from(document.querySelectorAll("[data-parallax]"));
  const mobile = window.matchMedia(MOBILE);

  // モバイルはアドレスバーの伸縮で innerHeight が変わり、
  // スクロールのたびに写真がガタつくので動かさない。
  mobile.addEventListener("change", () => {
    if (mobile.matches) els.forEach((el) => (el.style.translate = ""));
  });

  return function updateParallax() {
    if (mobile.matches || !els.length) return;
    const vh = window.innerHeight;
    for (const el of els) {
      const host = el.parentElement;
      if (!host) continue;
      const rect = host.getBoundingClientRect();
      if (!rect.height || rect.bottom < -240 || rect.top > vh + 240) continue;
      const rate = parseFloat(el.dataset.parallax) || 0.12;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      el.style.translate = `0 ${(progress * rate * 320).toFixed(2)}px`;
    }
  };
}
