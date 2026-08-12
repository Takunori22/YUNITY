# YU-NITY サイト リデザイン 設計書

- 日付: 2026-08-12
- 基準資料: `~/Desktop/design_handoff_yunity_redesign/`（`README.md` / `yunity-site-v2.dc.html`）
- 忠実度: ハイファイ。色・タイポ・余白・インタラクションまで再現する

## 目的

訪日外国人観光客向けの「銭湯マナーのリファレンス」として使われることを最優先に、
現行の Vite + バニラ JS 実装を、ハンドオフの静謐・和モダンなデザインへ全面的に置き換える。

## スコープ判断（確定事項）

| 項目 | 決定 |
|---|---|
| 写真 | ヒーローのみ既存 `hero-sento.mp4` を敷く。他は斜線プレースホルダ（`data-ph` に必要な写真内容を記述） |
| 現行演出 | WebGL 水面 / tsParticles / 温度 journey / ギャラリー / 和紙テクスチャ / ビネット / 液体 SVG フィルタ / Lenis — **すべて削除** |
| 依存 | `gsap` `lenis` `@tsparticles/*` を削除。Vite のみに |
| 言語選択オーバーレイ | 廃止。ブラウザ言語で自動判定し、ヘッダーの `JA / EN / 中文 / KO` で切替 |
| 多言語 | ja / en / zh / ko の4言語を新キー体系で書き直す |
| モバイル | 今回対応する（ハンドオフでは未実装扱い） |

## アプローチ

**全面書き直し**を採る。既存 `layout.css`（1,369行）に上書きレイヤーを足す案は
競合のデバッグコストが高く「ピクセル単位で再現」に届かない。ハンドオフ HTML の
インライン style をそのまま移植する案は `data-i18n` を張る土台がなく多言語と両立しない。

既存の `src/styles/` + `src/animations/` + `src/i18n/` というディレクトリ構成と、
`.page` の表示切替 + `[data-tab]` のイベント委譲という現行パターンは踏襲する。

## ファイル構成

```
index.html                  4ページ分のマークアップ / ヘッダー / フッター / 湯幕
src/styles/base.css         リセット + :root トークン + 共通プリミティブ
src/styles/layout.css       ヘッダー / ナビ / フッター / コンテナ / 湯幕
src/styles/components.css   写真枠 .ph / ボタン / カード / ステップ / FAQ / 索引レール
src/styles/pages.css        4ページ各セクション
src/styles/animations.css   reveal / parallax / drift / cue / reduced-motion
src/animations/reveal.js    [data-reveal] の IntersectionObserver
src/animations/parallax.js  [data-parallax] の縦移動
src/animations/header.js    スクロールによるヘッダー地色反転
src/animations/tabs.js      湯幕トランジション + history 連携
src/main.js                 初期化のみ
src/i18n/{index,ja,en,zh,ko}.js
```

**削除**: `src/animations/{hero,particles,scrollAnimations,survey,temperature,water,galleryParallax}.js`、
`src/utils/reveal.js`、`src/styles/` の旧内容、`package.json` の3依存。

## デザイントークン

`:root` の CSS 変数として定義する。

| 変数 | 値 | 用途 |
|---|---|---|
| `--paper` | `#F7F3EA` | 地色（生成り） |
| `--ink` | `#2A2724` | 文字（墨） |
| `--ink-70` / `--ink-45` / `--ink-16` | `rgba(42,39,36,…)` | 本文（弱）/ ラベル / 罫線 |
| `--asagi` | `#3F7E86` | セクション番号・主要ボタン・リンク hover |
| `--asagi-lt` | `#8FC2C8` | 暗地の上のラベル |
| `--kurenai` | `#9E3238` | 朱印・アンケート帯・FAQ 番号 |
| `--kurenai-lt` | `#D07C80` | ナビのアクティブ罫 |
| `--yamabuki` | `#B5860B` | ルールの点のみ |
| `--ai` / `--ai-2` | `#1C1F2E` / `#232838` | 暗いプレースホルダ地 |
| `--ph-light` | `#E8E2D5` | 明るいプレースホルダ地 |

フォント: 見出し `Shippori Mincho 400`、本文 `Zen Kaku Gothic New 400/500`、
ラベル `IBM Plex Mono 400/500`。

**和文の行幅に `ch` は使わない**（半角基準のため意図の約半分になる）。ハンドオフ HTML の
`46ch` / `52ch` / `62ch` はそれぞれ `46em` / `52em` / `62em` に置き換える。

余白: コンテナ `max-width:1400px` / 左右 `48px`、セクション間 `110〜140px`、
カード内 `26〜32px`、グリッド gap `72〜88px`、カード区切りは `1px` の背景罫。

### 改行の扱い

i18n は `textContent` を書き換えるため HTML の `<br>` を保持できない。
意図的な改行を持つ見出しは、文字列に `\n` を含めて CSS 側で `white-space: pre-line` を当てる。

## アニメーション

すべて素の JS + CSS transition で実装する（GSAP なし）。
`scroll` は単一のリスナーに集約し `requestAnimationFrame` でスロットルする。

- **リビール**: `[data-reveal]` を `opacity:0 / translateY(34px)` から
  `1.05s cubic-bezier(.16,1,.3,1)` でフェードアップ。`IntersectionObserver`
  （`rootMargin: 0 0 -12% 0`, `threshold: .08`）。`data-delay` で 120/240/340ms ずらす。
  **読み込み時点で画面内にある要素は観測を待たずその場で動かす** — ヒーローの導入は
  スクロールを待つものではないし、画面下端に寄った要素は負の `rootMargin` と
  開始時の `translateY(34px)` で観測から外れ、二度と出てこられなくなる。
  到達後の transform は `translate3d(0,0,0)` ではなく `none`。前者だと包含ブロックが残り、
  中の `position:sticky` が効かなくなる
- **パララックス**: `[data-parallax]` を 係数(0.05〜0.22) × 進行度 × 320px で縦移動。
  写真は枠より `inset:-14%` 大きく敷き、はみ出し分の中で動く
- **ヒーローのドリフト**: `@keyframes drift` で 22〜24秒かけて `scale(1.06 → 1.14)` を往復
- **追従カラム**: 素の `position:sticky; top:130px`。グリッドセルではなく**内側のラッパー**に指定する。
  ハンドオフの `data-pin` 手動計算はプレビュー環境固有の回避策なので持ち込まない
- **湯幕（ページ切替）**: 立ち上がり 380ms `cubic-bezier(.65,0,.35,1)` →
  紋のフェードイン 304ms（遅延 50ms）→ 全面を覆った状態で 170ms 保持しページ差し替え＋
  スクロールリセット → 紋フェードアウト＋湯が上へ抜ける 380ms。
  割り込みガード（連打時に進行中の遷移を畳む）を持たせる
- `prefers-reduced-motion: reduce` で上記すべてを無効化し、要素は最初から表示状態にする

## ページ構成

### 共通
- **ヘッダー**: `position:fixed` / 高さ 80px。左にロゴ + `SENTO GUIDE / TOKYO`、
  中央に4タブ（和文13px + 英字9px の2行組、アクティブは下罫 2px `--kurenai-lt`）、
  右に言語切替。スクロール量が `innerHeight * 0.72` を超えると
  透明・白文字 → `rgba(247,243,234,.94)` + `blur(10px)` + 墨文字 に `.5s` で反転
- **フッター**: 上罫1本。4カラム `2fr 1fr 1fr 1fr`（ブランド / PAGES / CONTACT / SOCIAL）+ 著作権表記

### ホーム
ヒーロー(100vh) → ステートメント → データ帯(4項目) → 全幅写真(78vh) →
入浴の流れ(`1fr 1.5fr`、左は追従見出し、右に6ステップ) → 大黒湯(全画面) →
アンケート帯(紅地) → アバウト teaser(`1fr 1.4fr` + メンバー6名3列)

### 銭湯紹介
全画面見出し(92vh) → 導入(`1fr 1.2fr`) → 特徴3つ(各 88vh の全幅写真) →
アクセス(`1fr 1.2fr`、左に情報グリッド、右にマップ枠 4:3)

### マナー（サイトの主目的）
全画面見出し(92vh) → 入浴の流れ(`250px 1fr`、左に追従する索引レール、
右に6ステップ本編。各ステップ `scroll-margin-top:120px`、`#step-1〜6` へのアンカー) →
個別ルール(`1fr 1.4fr`、右に6枚カード2列) → Q&A(`250px 1fr`、`<details>` 3件)

### アバウト
全画面見出し(78vh) → 理念(`1fr 1.4fr`) → チーム(`250px 1fr`、メンバー6名3列)

## 多言語

`src/i18n/index.js` の仕組み（`data-i18n` → `textContent`、localStorage 永続化、
言語別 Web フォント遅延読み込み）は流用し、キー体系を新デザインの全文言に合わせて作り直す。
既存 4 ファイルの訳文は文言が重なる範囲で流用する。

- 漢数字の角印（壱〜陸）、ステップ番号、`F-01` `R-01` `Q-01` などの記号は翻訳しない
- メンバーの氏名は全言語で漢字表記のまま持つ（読みが確定していないため、
  推測でローマ字化しない）。`data-i18n` は付けず HTML に直接置く
- ステップのモノスペース副題は言語ごとに役割を変える。日本語では英語表記（`RECEPTION`）、
  それ以外の言語では日本語のローマ字表記（`UKETSUKE`）を出す
- 英訳見出しは和文より長い。`clamp()` の下限（例: ヒーロー `clamp(56px,7.4vw,112px)`）で
  溢れないか全言語で確認する

## モバイル

- コンテナ左右パディング `48px → 24px`、ヘッダー高さ `80px → 60px`
- ナビをハンバーガー + 全画面ドロワーに。言語切替もドロワー内へ移す
- 2カラムグリッド（`1fr 1.5fr` / `250px 1fr` / `1fr 1.4fr`）はすべて1カラム縦積み、
  gap を `72〜88px → 44px`
- マナーページの索引レールは `sticky` を解除し、本編の上に畳む
- 全画面写真は `100vh → 88vh`、`88vh → 72vh` に圧縮
- ルール6枚・メンバー6名のグリッドは 2列/3列 → 1列
- パララックスはモバイルでは無効化（アドレスバー伸縮によるガタつきを避ける）

## 引き継ぎ事項（このリデザインでは未解決）

1. 写真 — ヒーロー以外はすべてプレースホルダ。`data-ph` に必要な写真の内容を記載済み
2. アンケート — Google フォーム URL は既存の `https://forms.gle/eRkf3yYtsHTEPZaX9` を流用
3. アクセス情報 — 住所・営業時間・料金はすべて仮の値
4. Google マップ — 埋め込み未設定（4:3 の枠を用意済み）
5. SNS リンク — Instagram / X / LINE ともにリンク先未設定
6. メンバーの氏名のローマ字表記 — 読みが確定したら `team.memberN_name` として
   i18n に載せ、en では romaji に切り替えられる
7. 写真プレースホルダの `data-ph` は日本語のまま — 撮影指示の覚書なので翻訳しない。
   写真が入れば消える

## 検証

`pnpm dev` で起動し、Playwright で以下を確認する。

- 4ページすべてがデスクトップ(1440px)・タブレット(768px)・モバイル(375px)で崩れない
- タブ切替で湯幕が走り、ページが差し替わりスクロールが先頭に戻る
- ヘッダーがヒーロー通過時に反転する
- マナーページの索引レールが追従し、アンカーが対応するステップへ飛ぶ
- 4言語すべてで見出しが溢れない
- コンソールエラーがない
- `pnpm build` が通る
