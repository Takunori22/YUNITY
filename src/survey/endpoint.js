// アンケート送信先（Google Apps Script Web アプリ）。秘密情報ではない。
// Phase 3 の手順でデプロイ後、この文字列を差し替えるか .env に VITE_SURVEY_ENDPOINT を設定する。
export const SURVEY_ENDPOINT =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SURVEY_ENDPOINT) ||
  "https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec";
