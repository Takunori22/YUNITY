// ============================================================
//  reveal.js — [data-reveal] のフェードアップ
//
//  4ページ分の要素は最初から DOM にあり、非アクティブなページは
//  display:none なので交差しない。ページが表示された時点で
//  IntersectionObserver が改めて評価するため、タブ切替のたびに
//  observe し直す必要はない。
// ============================================================

function reveal(el) {
  const delay = parseInt(el.dataset.delay || "0", 10);
  if (delay) el.style.transitionDelay = `${delay}ms`;
  el.classList.add("is-revealed");
}

export function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );

  const vh = window.innerHeight;

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const rect = el.getBoundingClientRect();
    // 読み込み時点で画面内にある要素はその場で動かす。ヒーローの導入は
    // スクロールを待つものではないし、下端に寄った要素は負の rootMargin と
    // 開始時の translateY で観測から外れて出てこられなくなる。
    // display:none のページの要素は矩形が 0 なのでここには入らない。
    if (rect.top < vh && rect.bottom > 0) {
      requestAnimationFrame(() => reveal(el));
    } else {
      io.observe(el);
    }
  });

  return io;
}
