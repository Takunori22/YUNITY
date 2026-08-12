// ============================================================
//  header.js — ヘッダーの地色反転
//  全画面写真を抜けたところで、透明・白文字から生成り地・墨文字へ。
//  色そのものは layout.css の .site-header.is-solid が持つ。
// ============================================================

const THRESHOLD = 0.72; // innerHeight に対する割合

export function createHeaderChrome() {
  const header = document.getElementById("site-header");

  return function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > window.innerHeight * THRESHOLD);
  };
}
