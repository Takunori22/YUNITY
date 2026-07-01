# YU-NITY サイト再構成 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** タブ構成を「ホーム／銭湯ガイド／アクセス／アバウト／ブログ」から「ホーム／銭湯紹介／マナー／アバウト」の4タブに再編し、大黒湯(文京区)を軸にした銭湯紹介ページとマナーページを新設、アバウトページのチーム紹介を拡充する。

**Architecture:** 既存の単一`index.html`タブ切替SPA構造(`.page`要素をJSで出し分け)を維持したまま、ページ内容とナビゲーションを段階的に置き換える。各タスクはビルド可能・ブラウザで確認可能な状態を保つ。

**Tech Stack:** Vite (vanilla JS) / GSAP v3 + ScrollTrigger / Lenis / 自作WebGL(`water.js`) / 温度エンジン(`temperature.js`) / 4言語i18n(`src/i18n/*.js`、`data-i18n`属性 + `textContent`書き換え、HTMLタグは埋め込めない)

## Global Constraints

- 【更新】実行フェーズ開始時にgit init済み・`site-restructure`ブランチで作業中。各タスクは`git commit`する(当初の「gitなし」前提は解消済み)。
- 自動テストは存在しない(`package.json`に test スクリプトなし)。各タスクの検証は「`npm run build`が成功する」「実際にPlaywright MCPでブラウザ確認する」の2点で代替する(後者は必須、省略不可)。
- `data-i18n`属性は`el.textContent`を書き換えるのみ(`src/i18n/index.js:38-48`)。インラインHTML(`<strong>`等)は差し込めないため、新規コピーは常に「要素まるごと1文」を1つのi18nキーに対応させる形で書く(既存の`counter-card__label`等と同じ流儀)。
- 新規テキストは日本語(ja)を基準に作成し、`en` / `zh` / `ko` も同じ意味内容で全文翻訳して4ファイルすべてに追加する。1言語でも キーが欠けると`setLanguage()`が `textContent` を更新できず前の言語の文字列が残るので、4ファイルのキー集合は必ず一致させる。
- セクション要素には既存の温度演出(`temperature.js`)に乗せるため`data-temp="0.0〜1.0"`属性を必ず付与する(値の意味は既存コードの通り、0=冷たい藍夜〜1=紅の湯気)。
- 新規セクションは「暗い(WebGL水が透ける)」か「明るい(frosted steam-glass panel)」かを決める。暗い場合は`src/styles/layout.css`のダークセクションリスト(`.hero, .survey-section, .gallery-section {`)1箇所に追記する。明るい場合は以下の**4箇所**に追記する: ①透過シェル定義リスト(`.concept-section, .access-section, ...`)、②`> .container`のフロストパネル定義リスト、③`body.no-water`側の上書きリスト、④`@media (max-width: 768px)`内の「Perf: lighter backdrop blur」モバイル軽量化リスト(`.sento-section > .container, .concept-section > .container, ...`)。**④はTask 5完了時点で発見した箇所で、Task 4完了時点では3箇所と誤認していた。Task 6以降は必ず4箇所すべてに追記すること。**追記を忘れると新セクションが素の透明背景のまま可読性が崩れる、または モバイルで重いbackdrop-filterのままになる。

---

## Task 1: 4タブナビゲーションへの再編とページ再構成

**Files:**
- Modify: `index.html`
- Modify: `src/animations/tabs.js`
- Modify: `src/i18n/ja.js`, `src/i18n/en.js`, `src/i18n/zh.js`, `src/i18n/ko.js`
- Modify: `src/utils/reveal.js`
- Modify: `src/styles/layout.css`
- Modify: `src/styles/components.css`

**Interfaces:**
- Produces: `VALID_TABS = ["home", "sento", "manner", "about"]`(以降のタスクはこの4値を前提にする)。`page-sento` / `page-manner` という新しいページID。

- [ ] **Step 1: ナビゲーションとフッターのタブボタンを4つに絞る**

`index.html`の`<nav class="nav" id="nav">`内、現在の5つの`<li>`を以下に置き換える:

```html
        <li><button class="nav__tab active" data-tab="home"   data-i18n="nav.home">ホーム</button></li>
        <li><button class="nav__tab"        data-tab="sento"  data-i18n="nav.sento">銭湯紹介</button></li>
        <li><button class="nav__tab"        data-tab="manner" data-i18n="nav.manner">マナー</button></li>
        <li><button class="nav__tab"        data-tab="about"  data-i18n="nav.about">アバウト</button></li>
```

同様に、フッターの`<nav class="footer__nav">`内の`<ul class="footer__nav-list">`を以下に置き換える:

```html
          <ul class="footer__nav-list">
            <li><button class="footer__nav-link" data-tab="home">ホーム</button></li>
            <li><button class="footer__nav-link" data-tab="sento">銭湯紹介</button></li>
            <li><button class="footer__nav-link" data-tab="manner">マナー</button></li>
            <li><button class="footer__nav-link" data-tab="about">アバウト</button></li>
          </ul>
```

- [ ] **Step 2: `page-guide`を`page-sento`にリネームし、`page-access`の中身を一時的に統合する**

現在の構造:
```html
    <div class="page" id="page-guide">
      <section class="section concept-section" id="concept" data-temp="0.4"> ... </section>
      <section class="gallery-section" id="gallery" data-temp="0.5"> ... </section>
    </div><!-- /page-guide -->
```
を、まず開始/終了タグだけ変更する(中身のconcept-section/gallery-sectionはこの時点では触らない):
```html
    <div class="page" id="page-sento">
      <section class="section concept-section" id="concept" data-temp="0.4"> ... </section>
      <section class="gallery-section" id="gallery" data-temp="0.5"> ... </section>
```
続けて、直後にあった`page-access`の中身(`access-section`一式)をこの`page-sento`の内側・末尾に移動してから閉じる:
```html
      <section class="section access-section" data-temp="0.32">
        <div class="container">
          <div class="section__label" data-i18n="access.label">場所</div>
          <h2 class="section__title" data-i18n="access.title">アクセス</h2>
          <div class="access-grid">
            <div class="access-info">
              <p class="access-info__name" data-i18n="access.name">湯島の湯</p>
              <dl class="access-details">
                <dt data-i18n="access.dt_address">住所</dt>
                <dd data-i18n="access.address">〒113-0034 東京都文京区湯島2丁目1-15</dd>
                <dt data-i18n="access.dt_hours">営業時間</dt>
                <dd data-i18n="access.hours">15:00 〜 23:00</dd>
                <dt data-i18n="access.dt_closed">定休日</dt>
                <dd data-i18n="access.closed">火曜日</dd>
                <dt data-i18n="access.dt_price">入浴料</dt>
                <dd data-i18n="access.price">大人 ¥600 ／ 子ども ¥300</dd>
              </dl>
              <a href="https://maps.google.com" target="_blank" rel="noopener" class="btn btn--primary" data-i18n="access.map_btn">Google マップで開く</a>
            </div>
            <div class="access-map">
              <div class="access-map__placeholder">
                <p style="font-size:2.5rem">📍</p>
                <p>東京都文京区湯島2丁目1-15</p>
                <p class="access-map__note">Google マップ埋め込みを設定中</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div><!-- /page-sento -->
```
`page-access`の`<div class="page" id="page-access">`開始タグと、上記を移し終えた後に残る空の終了タグ`</div><!-- /page-access -->`は削除する(中身は上で移動済みなので丸ごと消してよい)。

> 補足: この時点では大黒湯への内容差し替えは行わない(Task 7で実施)。ここは構造(タブ数・ページID)を先に揃えるための機械的な移動。

- [ ] **Step 3: `page-blog`とホームの`blog-preview-section`を削除する**

`index.html`から以下をまるごと削除する:
- ホーム内の `<!-- Blog Preview -->` コメントから始まる `<section class="section blog-preview-section" ...>...</section>` ブロック全体
- `<!-- PAGE: ブログ -->` コメントブロックと `<div class="page" id="page-blog">...</div><!-- /page-blog -->` 全体

- [ ] **Step 4: `page-manner`の空スケルトンを追加する**

`page-sento`の閉じタグの直後、`page-about`の開始タグの直前に以下を追加する:

```html
    <!-- ============================================================
         PAGE: マナー
    ============================================================ -->
    <div class="page" id="page-manner">

      <section class="section manner-page-placeholder" data-temp="0.45">
        <div class="container">
          <div class="section__label" data-i18n="manner.page_label">マナー</div>
          <h2 class="section__title" data-i18n="manner.page_title">気持ちよく、みんなで入る。</h2>
        </div>
      </section>

    </div><!-- /page-manner -->
```

- [ ] **Step 5: `tabs.js`の`VALID_TABS`とギャラリー初期化条件を更新する**

`src/animations/tabs.js`の`const VALID_TABS = ["home", "guide", "access", "about", "blog"];`を:
```js
const VALID_TABS = ["home", "sento", "manner", "about"];
```
に変更する。同ファイル内`applySwap()`の以下の条件分岐:
```js
    if (tabId === "guide" && !galleryInitialized) {
```
を:
```js
    if (tabId === "sento" && !galleryInitialized) {
```
に変更する(Task 3でギャラリーがホームへ移動するまでの暫定対応。Task 3で本条件ごと削除する)。

- [ ] **Step 6: i18nキーを更新する(4ファイル共通の変更)**

`src/i18n/ja.js` の `nav` オブジェクトを:
```js
  nav: {
    home:   "ホーム",
    sento:  "銭湯紹介",
    manner: "マナー",
    about:  "アバウト",
  },
```
に変更し、`blog: { label: "活動報告", title: "ブログ", more: "すべて見る" },` ブロックを削除する。`manner`名前空間はまだ存在しないので新規に追加する(値は Step 4 のプレースホルダで使うラベルのみ、詳細は Task 8 で追記):
```js
  manner: {
    page_label: "マナー",
    page_title: "気持ちよく、みんなで入る。",
  },
```

同じ変更を`src/i18n/en.js`(値は英語)、`src/i18n/zh.js`(簡体字)、`src/i18n/ko.js`(韓国語)にも行う。参考訳:

en.js:
```js
  nav: {
    home:   "Home",
    sento:  "Sento Guide",
    manner: "Manners",
    about:  "About",
  },
```
```js
  manner: {
    page_label: "Manners",
    page_title: "Bathe well, together.",
  },
```

zh.js:
```js
  nav: {
    home:   "首页",
    sento:  "钱汤介绍",
    manner: "礼仪",
    about:  "关于我们",
  },
```
```js
  manner: {
    page_label: "礼仪",
    page_title: "舒心入浴，与众同乐。",
  },
```

ko.js:
```js
  nav: {
    home:   "홈",
    sento:  "센토 소개",
    manner: "매너",
    about:  "소개",
  },
```
```js
  manner: {
    page_label: "매너",
    page_title: "다 함께, 기분 좋게 목욕하기.",
  },
```

各ファイルの`blog: {...}`ブロックは削除する。

- [ ] **Step 7: `reveal.js`から`.blog-card`セレクタを削除する**

`src/utils/reveal.js`の`REVEAL_SELECTORS`配列から以下の2行を削除する:
```js
  // Blog
  ".blog-card",
```

- [ ] **Step 8: CSSからブログ関連ルールを削除する**

`src/styles/layout.css`から以下を削除する:
```css
.blog-preview-section,
.blog-section {
  background-color: var(--color-cream);
}

.blog-preview-section .section__title,
.blog-section .section__title {
  color: rgba(72, 146, 155, 0.65);
  -webkit-text-stroke: 1px var(--color-charcoal);
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.blog-preview__more {
  text-align: center;
  margin-top: var(--space-lg);
}
```
続けて、frosted-glassセレクタリスト(以下の3箇所: ①透過シェル定義リスト、②`> .container`のフロストパネル定義リスト、③`body.no-water`側の上書きリスト)から `.blog-preview-section,` と `.blog-section` を取り除く。①透過シェル定義リスト:
```css
.concept-section,
.solution-section,
.access-section,
.team-section,
.blog-preview-section,
.blog-section {
```
```css
.concept-section,
.solution-section,
.access-section,
.team-section {
```
②(`> .container`セレクタ側)と③(`body.no-water`側)も同様に`.blog-preview-section > .container,` `.blog-section > .container,` および`body.no-water .blog-preview-section > .container,` `body.no-water .blog-section > .container,`の行を削除する(③は1箇所のみで、②③合わせて2行を削除する)。

`src/styles/components.css`から `/* ---- Blog Cards ---- */` コメント以降、`.blog-card`関連の全ルール(`.blog-card`, `.blog-card:hover`, `.blog-card__meta`, `.blog-card__tag`, `.blog-card__date`, `.blog-card__title`, `.blog-card__excerpt`)を削除する。`@media (max-width: 480px)`内の
```css
  /* Blog card: reduce internal padding */
  .blog-card {
    padding: var(--space-sm);
  }
```
も削除する。

- [ ] **Step 9: ビルド確認**

Run: `cd /Users/takunori/Development/YU-NITY && npm run build`
Expected: エラーなく`dist/`が生成される。

- [ ] **Step 10: ブラウザ確認**

Run: `npm run dev` してブラウザで開く。
Expected: ナビが4タブ(ホーム/銭湯紹介/マナー/アバウト)になっている。「銭湯紹介」タブをクリックすると、旧「銭湯文化とは」+ギャラリー+アクセス情報が縦に並んで表示される(見た目は暫定でよい)。「マナー」タブは見出しのみのプレースホルダが表示される。ホームにブログセクションが無いこと、コンソールエラーが無いことを確認する。

---

## Task 2: 課題(Problem)・三つの橋(Solution)セクションの削除

**Files:**
- Modify: `index.html`
- Modify: `src/animations/scrollAnimations.js`
- Modify: `src/utils/reveal.js`
- Modify: `src/styles/layout.css`
- Modify: `src/styles/components.css`
- Modify: `src/i18n/ja.js`, `src/i18n/en.js`, `src/i18n/zh.js`, `src/i18n/ko.js`

**Interfaces:**
- Consumes: Task 1で確定した`page-about`の存在。
- Produces: `page-about`の中身は`team-section`のみになる(Task 9で拡充されるまでの中間状態)。

- [ ] **Step 1: `index.html`の`page-about`から課題・三つの橋セクションを削除する**

`page-about`内の`<section class="section problem-section" ...>`から`</section>`(`problem-section__bg-pattern`のdivまで含む)、および`<section class="section solution-section" ...>`から`</section>`までをまるごと削除する。`team-section`はそのまま残す。

- [ ] **Step 2: `scrollAnimations.js`からProblem/Solutionの登録処理を削除する**

`src/animations/scrollAnimations.js`の`initScrollAnimations()`内、以下のブロックを削除する:

```js
  // ── Problem ──────────────────────────────────────────
  registerAll(".problem-section .section__label",  { y: 20 });
  registerAll(".problem-section .section__title",  { y: 28 });
  registerAll(".counter-card",                     { y: 36 }, 0.1);
  register(document.querySelector(".problem-text-card:nth-child(1)"), { x: -48 });
  register(document.querySelector(".problem-text-card:nth-child(2)"), { x: 48, delay: 0.15 });
  register(document.querySelector(".problem-conclusion"),              { y: 24 });

  // カウントアップ（scroll イベントで監視）
  const counters = [];
  document.querySelectorAll("[data-counter]").forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const obj    = { val: 0 };
    let tween    = null;
    let active   = false;
    counters.push({
      el,
      check() {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
        if (inView && !active) {
          active = true;
          tween?.kill();
          obj.val = 0;
          tween = gsap.to(obj, {
            val: target, duration: 2, ease: "power1.out", snap: { val: 1 },
            onUpdate() { el.textContent = Math.round(obj.val) + suffix; },
            onComplete() {
              // Elastic landing: final-digit overshoot + 紅 ring flash
              gsap.fromTo(el, { scale: 1 },
                { scale: 1.14, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 });
              const card = el.closest(".counter-card");
              if (card) {
                card.classList.remove("counter-card--pop");
                void card.offsetWidth; // restart the keyframe
                card.classList.add("counter-card--pop");
              }
            },
          });
        } else if (!inView && active) {
          active = false;
          tween?.kill();
          el.textContent = "0" + suffix;
        }
      },
    });
  });

  // ── Solution ─────────────────────────────────────────
  // Register the container first so the white bg card is hidden until in view
  register(document.querySelector(".solution-section > .container"), { y: 20 });
  registerAll(".solution-section .section__label", { y: 20, delay: 0.15 });
  registerAll(".solution-section .section__title", { y: 28, delay: 0.15 });
  registerAll("[data-solution-card]",              { y: 40, delay: 0.15 }, 0.15);

```

`counters`変数を使っていた残りの呼び出しも削除する。具体的には次の3箇所から`counters.forEach((c) => c.check());`の行を削除する(該当行のみ削除し、他の行はそのまま残す):
1. 初期チェックのブロック(`checkVisible();`の直後)
2. `requestAnimationFrame(() => { checkVisible(); ... });`の中
3. `window.addEventListener("load", () => { checkVisible(); ... });`の中
4. `window.addEventListener("scroll", () => { checkVisible(); ... });`の中

最後に、ファイル末尾付近の以下のブロックを削除する:
```js
  // ── SVG path（スクラブのみ ScrollTrigger を維持）────
  const solutionPath  = document.querySelector(".solution-path");
  const pathContainer = document.querySelector(".solution-section__path");
  if (solutionPath && pathContainer && window.innerWidth >= 900) {
    pathContainer.style.display = "block";
    const len = solutionPath.getTotalLength();
    gsap.set(solutionPath, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(solutionPath, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: {
        trigger: ".solution-section__cards",
        start: "top 75%", end: "bottom 60%", scrub: 1,
      },
    });
  }
```

- [ ] **Step 3: `reveal.js`からProblem/Solutionセレクタを削除する**

`src/utils/reveal.js`の`REVEAL_SELECTORS`から以下を削除する:
```js
  // Problem
  ".problem-section .section__label",
  ".problem-section .section__title",
  ".counter-card",
  ".problem-text-card",
  ".problem-conclusion",
  // Solution
  ".solution-section .section__label",
  ".solution-section .section__title",
  "[data-solution-card]",
```
`revealAll()`関数内の以下のカウンター初期化ブロックも削除する(問題セクションが無くなるため`[data-counter]`要素も無くなる):
```js
  // Counters never tween under reduced motion — show final values, not "0".
  document.querySelectorAll("[data-counter]").forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    if (!Number.isNaN(target)) el.textContent = target + (el.dataset.suffix || "");
  });
```

- [ ] **Step 4: CSSからProblem/Solution関連ルールを削除する**

`src/styles/layout.css`から以下を削除する:
```css
/* ---- Problem ---- */
.problem-section {
  background-color: var(--color-indigo);
}

.problem-section__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.problem-section__bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(72,146,155,0.10) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(197,61,67,0.10) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.problem-section .container {
  position: relative;
  z-index: 1;
}

/* ---- Solution ---- */
.solution-section {
  background-color: #f0ece4;
}

.solution-section .section__title {
  color: rgba(72, 146, 155, 0.65);
  -webkit-text-stroke: 1.5px var(--color-charcoal);
}

.solution-section__cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-top: var(--space-lg);
  position: relative;
}

.solution-section__path {
  position: absolute;
  top: 50%;
  left: 10%;
  width: 80%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 0;
  display: none; /* shown at wide viewport via JS */
}
```

frosted-glassセレクタリスト(Task 1 Step 8で整理した3箇所: 透過シェル定義・`> .container`のフロストパネル定義・`body.no-water`側の上書き)すべてから`.solution-section,`を削除する。ダークセクション扱いリスト:
```css
.hero,
.problem-section,
.survey-section,
.gallery-section {
```
は:
```css
.hero,
.survey-section,
.gallery-section {
```
に変更する(`.problem-section`削除)。

`@media (max-width: 768px)`内の以下も削除する:
```css
  /* Solution: remove the vertical card offset that looks bad when stacked */
  .solution-card:nth-child(2) {
    transform: none;
  }

  .solution-card:nth-child(2):hover {
    transform: translateY(-6px);
  }

  .problem-text-grid {
    grid-template-columns: 1fr;
  }

  .problem-conclusion {
    grid-template-columns: 1fr;
  }

  .problem-conclusion__cite {
    white-space: normal;
  }
```

`src/styles/components.css`から以下のブロックをまるごと削除する: `.counter-card`〜`.counter-card__label`、`.problem-text-grid`〜`.problem-conclusion__cite`、`.solution-path`〜`.solution-card__body`(`/* ---- Solution Cards ---- */`見出しを含む、`.solution-card`, `.solution-card[data-seal]::before`, `.solution-card:nth-child(2)`, `.solution-card:hover`関連、`.solution-card__icon`, `.solution-card__title`, `.solution-card__body`すべて)。

- [ ] **Step 5: i18nからproblem/solution名前空間を削除する**

`src/i18n/ja.js`, `en.js`, `zh.js`, `ko.js` の4ファイルすべてから `problem: { ... }` ブロックと `solution: { ... }` ブロックを削除する。

- [ ] **Step 6: ビルド確認**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 7: ブラウザ確認**

`npm run dev`でアバウトタブを開き、チーム紹介セクションのみが表示され、課題/三つの橋セクションが跡形もなく消えていることを確認する。コンソールにScrollTrigger関連のエラーが出ていないことを確認する。

---

## Task 3: ホームに新規グリッドギャラリーを追加(横スクロール版を廃止)

**Files:**
- Modify: `index.html`
- Delete: `src/animations/gallery.js`
- Modify: `src/animations/tabs.js`
- Modify: `src/animations/scrollAnimations.js`
- Modify: `src/utils/reveal.js`
- Modify: `src/styles/layout.css`

**Interfaces:**
- Consumes: Task 1で確定した`page-home`(現時点でHero→Survey)と`page-sento`(暫定でconcept+旧gallery+access同居)。
- Produces: `page-home`は`Hero → Gallery(グリッド) → Survey`の順になる。以降のタスクはこの並び順の間に自分のセクションを挿し込む。

- [ ] **Step 1: `page-sento`から旧ギャラリー(横スクロール版)を削除する**

`page-sento`内の以下のブロックをまるごと削除する:
```html
      <section class="gallery-section" id="gallery" data-temp="0.5">
        <div class="gallery-section__header container">
          <div class="section__label" data-i18n="gallery.label">ギャラリー</div>
          <h2 class="section__title" data-i18n="gallery.title">銭湯の世界へ</h2>
        </div>
        <div class="gallery-track" id="gallery-track">
          <div class="gallery-item"><img src="/src/assets/images/gallery/gallery-01.webp" alt="銭湯外観" /></div>
          <div class="gallery-item"><img src="/src/assets/images/gallery/gallery-02.webp" alt="脱衣所" /></div>
          <div class="gallery-item"><img src="/src/assets/images/gallery/gallery-03.webp" alt="浴場内部" /></div>
          <div class="gallery-item"><img src="/src/assets/images/gallery/gallery-04.webp" alt="交流イベント" /></div>
          <div class="gallery-item"><img src="/src/assets/images/gallery/gallery-05.webp" alt="のれん" /></div>
          <div class="gallery-item"><img src="/src/assets/images/gallery/gallery-06.webp" alt="地域住民" /></div>
          <div class="gallery-item"><img src="/src/assets/images/gallery/gallery-07.webp" alt="外国人観光客" /></div>
        </div>
      </section>
```

- [ ] **Step 2: `page-home`のHeroとSurveyの間に新しいグリッドギャラリーを挿入する**

```html
      <!-- Gallery -->
      <section class="gallery-section" id="gallery" data-temp="0.18">
        <div class="gallery-section__header container">
          <div class="section__label" data-i18n="gallery.label">ギャラリー</div>
          <h2 class="section__title" data-i18n="gallery.title">銭湯の世界へ</h2>
        </div>
        <!-- 実写真を追加する際は各 .gallery-tile に <img src="..." alt="..."> を追加し、
             components.css の .gallery-tile::after (プレースホルダ文言) を削除する -->
        <div class="gallery-grid" id="gallery-grid">
          <div class="gallery-tile" data-index="01"></div>
          <div class="gallery-tile" data-index="02"></div>
          <div class="gallery-tile" data-index="03"></div>
          <div class="gallery-tile" data-index="04"></div>
          <div class="gallery-tile" data-index="05"></div>
          <div class="gallery-tile" data-index="06"></div>
          <div class="gallery-tile" data-index="07"></div>
          <div class="gallery-tile" data-index="08"></div>
        </div>
      </section>
```

- [ ] **Step 3: `src/animations/gallery.js`を削除する**

Run: `rm /Users/takunori/Development/YU-NITY/src/animations/gallery.js`

- [ ] **Step 4: `tabs.js`からギャラリー専用の初期化分岐を削除する**

`src/animations/tabs.js`の先頭:
```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initGallery } from "./gallery.js";

const VALID_TABS = ["home", "sento", "manner", "about"];
let galleryInitialized = false;
```
を:
```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const VALID_TABS = ["home", "sento", "manner", "about"];
```
に変更する。`applySwap()`内の以下:
```js
    // Gallery needs ScrollTrigger — initialize once when guide tab first shown.
    // Refresh AFTER the display swap so pinned-gallery offsets (scrollWidth/
    // innerWidth) are measured against the now-visible page.
    if (tabId === "sento" && !galleryInitialized) {
      galleryInitialized = true;
      requestAnimationFrame(() => {
        initGallery();
        ScrollTrigger.refresh();
      });
    } else {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
```
を:
```js
    requestAnimationFrame(() => ScrollTrigger.refresh());
```
に変更する。

- [ ] **Step 5: `scrollAnimations.js`のギャラリー登録にタイルを追加する**

```js
  // ── Gallery ──────────────────────────────────────────
  registerAll(".gallery-section .section__label",  { y: 20 });
  registerAll(".gallery-section .section__title",  { y: 28 });
```
を:
```js
  // ── Gallery ──────────────────────────────────────────
  registerAll(".gallery-section .section__label",  { y: 20 });
  registerAll(".gallery-section .section__title",  { y: 28 });
  registerAll(".gallery-tile",                     { y: 32 }, 0.06);
```
に変更する。

- [ ] **Step 6: `reveal.js`にタイルセレクタを追加する**

```js
  // Gallery
  ".gallery-section .section__label",
  ".gallery-section .section__title",
```
を:
```js
  // Gallery
  ".gallery-section .section__label",
  ".gallery-section .section__title",
  ".gallery-tile",
```
に変更する。

- [ ] **Step 7: CSSを横スクロール版からグリッド版に置き換える**

`src/styles/layout.css`の以下のブロックを削除する:
```css
.gallery-track {
  display: flex;
  flex-wrap: nowrap;
  gap: 1.5rem;
  padding: 0 2rem 4rem;
  width: max-content;
  will-change: transform;
}

.gallery-item {
  width: clamp(260px, 38vw, 560px);
  height: 60vh;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
  background: var(--color-indigo);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
  transition: transform var(--transition-slow);
}

.gallery-item__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  background: linear-gradient(135deg, var(--color-navy), rgba(72, 146, 155, 0.15));
  border: 1px solid rgba(255,255,255,0.08);
  opacity: 1;
}

.gallery-item--placeholder img {
  display: none;
}
```
その位置に代わりに以下を追加する:
```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 0 var(--space-md) var(--space-lg);
}

@media (min-width: 600px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    padding: 0 var(--space-lg) var(--space-xl);
  }
}

.gallery-tile {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-navy), rgba(72, 146, 155, 0.18));
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform var(--transition-med);
}

.gallery-tile:nth-child(3n+2) {
  background: linear-gradient(135deg, var(--color-navy), rgba(200, 150, 12, 0.16));
}

.gallery-tile:nth-child(3n+3) {
  background: linear-gradient(135deg, var(--color-navy), rgba(197, 61, 67, 0.14));
}

.gallery-tile::before {
  content: attr(data-index);
  position: absolute;
  top: 0.75rem;
  left: 0.9rem;
  font-family: var(--font-display);
  font-size: var(--text-sm);
  letter-spacing: 0.1em;
  color: rgba(238, 234, 228, 0.55);
}

.gallery-tile::after {
  content: "COMING SOON";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: rgba(238, 234, 228, 0.35);
}

@media (hover: hover) {
  .gallery-tile:hover {
    transform: translateY(-4px);
  }
}
```

- [ ] **Step 8: ビルド確認**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 9: ブラウザ確認**

`npm run dev`でホームを開き、Heroの直後にグリッドギャラリー(2〜4列のプレースホルダタイル)が表示され、スクロールで各タイルがフェード+スタガーで出現することを確認する。「銭湯紹介」タブにギャラリーが無くなっていることを確認する。モバイル幅(375px)で2列になることを確認する。

---

## Task 4: ホームに「銭湯紹介」ティザーセクションを追加

**Files:**
- Modify: `index.html`
- Modify: `src/animations/scrollAnimations.js`
- Modify: `src/utils/reveal.js`
- Modify: `src/styles/layout.css`
- Modify: `src/i18n/ja.js`, `src/i18n/en.js`, `src/i18n/zh.js`, `src/i18n/ko.js`

**Interfaces:**
- Consumes: Task 3で確定した`page-home`の並び(Hero → Gallery → Survey)。
- Produces: `page-home`は`Hero → Gallery → 銭湯紹介(teaser) → Survey`になる。i18nキー`sento.teaser_*`(以降のタスクで`sento.*`名前空間に追記していく)。

- [ ] **Step 1: `page-home`のGalleryとSurveyの間に銭湯紹介ティザーを挿入する**

```html
      <!-- 銭湯紹介 (Home teaser) -->
      <section class="section sento-section" id="sento-teaser" data-temp="0.35">
        <div class="container sento-section__grid">
          <div class="sento-section__text">
            <div class="section__label" data-i18n="sento.teaser_label">銭湯紹介</div>
            <h2 class="section__title" data-i18n="sento.teaser_title">日本が誇る、湯の文化</h2>
            <p class="section__body" data-i18n="sento.teaser_body">銭湯は単なる入浴施設ではありません。地域のコミュニティが集まり、裸の付き合いで本音を語り合える、日本独自の文化的空間です。</p>
            <p class="sento-section__name" data-i18n="sento.teaser_name">今回ご紹介するのは、東京・文京区の「大黒湯」。</p>
            <a href="#" class="btn btn--primary" data-tab="sento" data-i18n="sento.teaser_cta">銭湯紹介ページへ →</a>
          </div>
          <div class="sento-section__map access-map">
            <div class="access-map__placeholder">
              <p style="font-size:2.5rem">📍</p>
              <p data-i18n="sento.teaser_map_area">東京都文京区</p>
              <p class="access-map__note" data-i18n="sento.teaser_map_note">Google マップ埋め込みを設定中</p>
            </div>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: i18nキーを追加する(4ファイル共通)**

`src/i18n/ja.js`の`sento`名前空間はまだ存在しないため新規追加する(`nav`ブロックの後、`concept`ブロックの前など、既存のオブジェクト内どこでもよい):
```js
  sento: {
    teaser_label: "銭湯紹介",
    teaser_title: "日本が誇る、湯の文化",
    teaser_body: "銭湯は単なる入浴施設ではありません。地域のコミュニティが集まり、裸の付き合いで本音を語り合える、日本独自の文化的空間です。",
    teaser_name: "今回ご紹介するのは、東京・文京区の「大黒湯」。",
    teaser_cta: "銭湯紹介ページへ →",
    teaser_map_area: "東京都文京区",
    teaser_map_note: "Google マップ埋め込みを設定中",
  },
```

`src/i18n/en.js`:
```js
  sento: {
    teaser_label: "Sento Guide",
    teaser_title: "Japan's Culture of the Bath",
    teaser_body: "A sento is far more than a place to bathe. It is a community gathering space where neighbors meet without pretense, sharing honest conversation.",
    teaser_name: "This time, we introduce Daikokuyu in Bunkyo, Tokyo.",
    teaser_cta: "Visit the Sento Guide →",
    teaser_map_area: "Bunkyo, Tokyo",
    teaser_map_note: "Google Maps embed coming soon",
  },
```

`src/i18n/zh.js`:
```js
  sento: {
    teaser_label: "钱汤介绍",
    teaser_title: "日本引以为傲的浴汤文化",
    teaser_body: "钱汤不仅仅是洗浴设施。它是社区居民聚集、坦诚交流的日本独特文化空间。",
    teaser_name: "这次为大家介绍东京文京区的「大黒湯」。",
    teaser_cta: "前往钱汤介绍页面 →",
    teaser_map_area: "东京都文京区",
    teaser_map_note: "谷歌地图嵌入设置中",
  },
```

`src/i18n/ko.js`:
```js
  sento: {
    teaser_label: "센토 소개",
    teaser_title: "일본이 자랑하는 목욕 문화",
    teaser_body: "센토는 단순한 목욕 시설이 아닙니다. 지역 주민들이 모여 스스럼없이 마음을 나누는 일본 고유의 문화 공간입니다.",
    teaser_name: "이번에 소개할 곳은 도쿄 분쿄구의 「다이코쿠유」입니다.",
    teaser_cta: "센토 소개 페이지로 →",
    teaser_map_area: "도쿄도 분쿄구",
    teaser_map_note: "구글 맵 embed 준비 중",
  },
```

- [ ] **Step 3: `scrollAnimations.js`にティザーの登録を追加する**

`initScrollAnimations()`内、Gallery登録ブロックの直後に追加する:
```js
  // ── Sento teaser (home) ─────────────────────────────
  registerAll(".sento-section .section__label", { y: 20 });
  registerAll(".sento-section__text > *",        { x: -40 }, 0.08);
  registerAll(".sento-section__map",             { x: 40 });
```

- [ ] **Step 4: `reveal.js`にセレクタを追加する**

`REVEAL_SELECTORS`の`// Gallery`ブロックの後に追加する:
```js
  // Sento teaser (home)
  ".sento-section .section__label",
  ".sento-section__text > *",
  ".sento-section__map",
```

- [ ] **Step 5: CSSを追加する**

`src/styles/layout.css`の`/* ---- Concept ---- */`ブロックの直前に追加する:
```css
/* ---- Sento teaser (home) ---- */
.sento-section {
  background-color: #f0ece4;
}

.sento-section .section__title {
  color: rgba(72, 146, 155, 0.65);
  -webkit-text-stroke: 1.5px var(--color-charcoal);
}

.sento-section__grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--space-lg);
  align-items: center;
}

.sento-section__name {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  color: var(--color-charcoal);
  margin-top: var(--space-sm);
  margin-bottom: var(--space-md);
}

@media (max-width: 768px) {
  .sento-section__grid {
    grid-template-columns: 1fr;
  }
}
```

`.sento-section`をfrosted-glassセレクタリスト3箇所(①`.concept-section, .solution-section, ...`の透過シェル定義リスト、②その`> .container`版のフロストパネル定義リスト、③`body.no-water`側の上書きリスト)すべてに追加する。①:
```css
.concept-section,
.access-section,
.team-section {
```
は:
```css
.sento-section,
.concept-section,
.access-section,
.team-section {
```
に変更する。残り②③(`> .container`セレクタ版と`body.no-water`側、それぞれ1箇所ずつ)も同様に`.sento-section,`(または`.sento-section > .container,`/`body.no-water .sento-section > .container,`)を先頭に追加する。

- [ ] **Step 6: ビルド確認**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 7: ブラウザ確認**

`npm run dev`でホームを開き、ギャラリーの下に「銭湯紹介」ティザー(テキスト+地図プレースホルダ)が表示されることを確認する。「銭湯紹介ページへ」ボタンをクリックすると銭湯紹介タブに遷移することを確認する。4言語切り替えでテキストが正しく変わることを確認する。

---

## Task 5: ホームに「マナー」ティザーセクションを追加

**Files:**
- Modify: `index.html`
- Modify: `src/animations/scrollAnimations.js`
- Modify: `src/utils/reveal.js`
- Modify: `src/styles/layout.css`
- Modify: `src/i18n/ja.js`, `src/i18n/en.js`, `src/i18n/zh.js`, `src/i18n/ko.js`

**Interfaces:**
- Consumes: Task 4で確定した`page-home`の並び(Hero → Gallery → 銭湯紹介 → Survey)。
- Produces: `page-home`は`Hero → Gallery → 銭湯紹介 → マナー(teaser) → Survey`になる。i18nキー`manner.teaser_*`。

- [ ] **Step 1: `page-home`の銭湯紹介ティザーとSurveyの間にマナーティザーを挿入する**

```html
      <!-- マナー (Home teaser) -->
      <section class="section manner-section" id="manner-teaser" data-temp="0.55">
        <div class="container">
          <div class="section__label" data-i18n="manner.teaser_label">マナー</div>
          <h2 class="section__title" data-i18n="manner.teaser_title">気持ちよく、みんなで入る。</h2>
          <div class="manner-highlight-grid">
            <div class="manner-highlight-card">
              <div class="manner-highlight-card__icon">🧼</div>
              <h3 class="manner-highlight-card__title" data-i18n="manner.teaser_card1_title">洗ってから浴槽へ</h3>
              <p class="manner-highlight-card__body" data-i18n="manner.teaser_card1_body">湯船に入る前に、かけ湯とからだ洗いを。</p>
            </div>
            <div class="manner-highlight-card">
              <div class="manner-highlight-card__icon">🖤</div>
              <h3 class="manner-highlight-card__title" data-i18n="manner.teaser_card2_title">タオルは湯船の外に</h3>
              <p class="manner-highlight-card__body" data-i18n="manner.teaser_card2_body">浴槽の中にタオルを浸けないのがマナーです。</p>
            </div>
            <div class="manner-highlight-card">
              <div class="manner-highlight-card__icon">🤫</div>
              <h3 class="manner-highlight-card__title" data-i18n="manner.teaser_card3_title">会話は控えめに</h3>
              <p class="manner-highlight-card__body" data-i18n="manner.teaser_card3_body">静かな時間を、みんなで気持ちよく。</p>
            </div>
            <div class="manner-highlight-card">
              <div class="manner-highlight-card__icon">🎨</div>
              <h3 class="manner-highlight-card__title" data-i18n="manner.teaser_card4_title">タトゥーも相談を</h3>
              <p class="manner-highlight-card__body" data-i18n="manner.teaser_card4_body">対応は施設ごとに異なるので、事前にご確認を。</p>
            </div>
          </div>
          <div class="manner-section__cta">
            <a href="#" class="btn btn--secondary" data-tab="manner" data-i18n="manner.teaser_cta">マナーを詳しく見る →</a>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: i18nキーを追加する(4ファイル共通)**

`src/i18n/ja.js`の既存`manner: { page_label: ..., page_title: ... }`に以下を追記する(オブジェクトを置き換える):
```js
  manner: {
    page_label: "マナー",
    page_title: "気持ちよく、みんなで入る。",
    teaser_label: "マナー",
    teaser_title: "気持ちよく、みんなで入る。",
    teaser_card1_title: "洗ってから浴槽へ",
    teaser_card1_body: "湯船に入る前に、かけ湯とからだ洗いを。",
    teaser_card2_title: "タオルは湯船の外に",
    teaser_card2_body: "浴槽の中にタオルを浸けないのがマナーです。",
    teaser_card3_title: "会話は控えめに",
    teaser_card3_body: "静かな時間を、みんなで気持ちよく。",
    teaser_card4_title: "タトゥーも相談を",
    teaser_card4_body: "対応は施設ごとに異なるので、事前にご確認を。",
    teaser_cta: "マナーを詳しく見る →",
  },
```

`src/i18n/en.js`:
```js
  manner: {
    page_label: "Manners",
    page_title: "Bathe well, together.",
    teaser_label: "Manners",
    teaser_title: "Bathe well, together.",
    teaser_card1_title: "Rinse before the tub",
    teaser_card1_body: "Wash and rinse your body before entering the bath.",
    teaser_card2_title: "Keep towels out of the water",
    teaser_card2_body: "Never let your towel touch the bathwater.",
    teaser_card3_title: "Keep your voice down",
    teaser_card3_body: "Quiet moments are part of the shared experience.",
    teaser_card4_title: "Ask about tattoos",
    teaser_card4_body: "Policies vary by bathhouse, so check in advance.",
    teaser_cta: "See the full manner guide →",
  },
```

`src/i18n/zh.js`:
```js
  manner: {
    page_label: "礼仪",
    page_title: "舒心入浴，与众同乐。",
    teaser_label: "礼仪",
    teaser_title: "舒心入浴，与众同乐。",
    teaser_card1_title: "先冲洗，后入浴",
    teaser_card1_body: "进入浴池前请先冲淋并清洗身体。",
    teaser_card2_title: "毛巾不入浴池",
    teaser_card2_body: "请勿将毛巾浸入浴池中。",
    teaser_card3_title: "请保持安静",
    teaser_card3_body: "安静的氛围是大家共同的享受。",
    teaser_card4_title: "纹身请提前确认",
    teaser_card4_body: "各店铺规定不同，请事先咨询。",
    teaser_cta: "查看完整礼仪指南 →",
  },
```

`src/i18n/ko.js`:
```js
  manner: {
    page_label: "매너",
    page_title: "다 함께, 기분 좋게 목욕하기.",
    teaser_label: "매너",
    teaser_title: "다 함께, 기분 좋게 목욕하기.",
    teaser_card1_title: "탕에 들어가기 전에 씻기",
    teaser_card1_body: "탕에 들어가기 전 몸을 씻고 헹궈주세요.",
    teaser_card2_title: "수건은 탕 밖에서",
    teaser_card2_body: "수건을 탕 안에 담그지 마세요.",
    teaser_card3_title: "대화는 조용히",
    teaser_card3_body: "조용한 분위기는 모두를 위한 배려입니다.",
    teaser_card4_title: "문신은 미리 확인을",
    teaser_card4_body: "시설마다 규정이 다르니 사전에 확인해 주세요.",
    teaser_cta: "매너 가이드 자세히 보기 →",
  },
```

- [ ] **Step 3: `scrollAnimations.js`にマナーティザーの登録を追加する**

Sento teaser登録ブロックの直後に追加する:
```js
  // ── Manner teaser (home) ────────────────────────────
  registerAll(".manner-section .section__label",  { y: 20 });
  registerAll(".manner-section .section__title",  { y: 28 });
  registerAll(".manner-highlight-card",           { y: 32 }, 0.08);
```

- [ ] **Step 4: `reveal.js`にセレクタを追加する**

`// Sento teaser (home)`ブロックの後に追加する:
```js
  // Manner teaser (home)
  ".manner-section .section__label",
  ".manner-section .section__title",
  ".manner-highlight-card",
```

- [ ] **Step 5: CSSを追加する**

`src/styles/layout.css`の`/* ---- Concept ---- */`ブロックの直前(Task 4で追加した`.sento-section`ブロックの直後)に追加する:
```css
/* ---- Manner teaser (home) ---- */
.manner-section {
  background-color: var(--color-cream);
}

.manner-section .section__title {
  color: rgba(72, 146, 155, 0.65);
  -webkit-text-stroke: 1.5px var(--color-charcoal);
}

.manner-highlight-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  margin: var(--space-lg) 0;
}

.manner-highlight-card {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(44, 40, 40, 0.10);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-sm);
  text-align: center;
}

.manner-highlight-card__icon {
  font-size: 2rem;
  line-height: 1;
  margin-bottom: var(--space-xs);
}

.manner-highlight-card__title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  color: var(--color-charcoal);
  margin-bottom: 0.35rem;
}

.manner-highlight-card__body {
  font-size: var(--text-sm);
  color: rgba(44, 40, 40, 0.7);
  line-height: 1.6;
}

.manner-section__cta {
  text-align: center;
}

@media (max-width: 768px) {
  .manner-highlight-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

`.manner-section`をfrosted-glassセレクタリスト3箇所(透過シェル定義・`> .container`のフロストパネル定義・`body.no-water`側の上書き)に追加する(Task 4で`.sento-section`を加えた同じ3箇所に、続けて`.manner-section,`を追加する)。

- [ ] **Step 6: ビルド確認**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 7: ブラウザ確認**

`npm run dev`でホームを開き、銭湯紹介ティザーの下にマナーのハイライト4枚カードが表示され、「マナーを詳しく見る」ボタンでマナータブに遷移することを確認する。モバイル幅で2列になることを確認する。

---

## Task 6: ホームに「アバウト」ティザーセクションを追加(アンケートの後)

**Files:**
- Modify: `index.html`
- Modify: `src/animations/scrollAnimations.js`
- Modify: `src/utils/reveal.js`
- Modify: `src/styles/layout.css`
- Modify: `src/i18n/ja.js`, `src/i18n/en.js`, `src/i18n/zh.js`, `src/i18n/ko.js`

**Interfaces:**
- Consumes: Task 5で確定した`page-home`の並び(Hero → Gallery → 銭湯紹介 → マナー → Survey)。
- Produces: `page-home`の最終セクション順が仕様通り`Hero → Gallery → 銭湯紹介 → マナー → Survey → アバウト(teaser)`になる。i18nキー`about.teaser_*`(新規`about`名前空間)。

- [ ] **Step 1: Survey セクションの直後・`</div><!-- /page-home -->`の直前にアバウトティザーを追加する**

```html
      <!-- アバウト (Home teaser) -->
      <section class="section about-teaser-section" id="about-teaser" data-temp="0.78">
        <div class="container">
          <div class="section__label" data-i18n="about.teaser_label">アバウト</div>
          <h2 class="section__title" data-i18n="about.teaser_title">銭湯から始まる、多文化共生。</h2>
          <p class="section__body" data-i18n="about.teaser_body">YU-NITYは、銭湯文化を通じて訪日外国人と地域住民をつなぐ、学生発のプロジェクトチームです。</p>
          <div class="about-teaser__avatars">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="多田圭佑" />
            <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="大戸拓知" />
            <img src="https://randomuser.me/api/portraits/men/28.jpg" alt="神尾光季" />
            <img src="https://randomuser.me/api/portraits/men/55.jpg" alt="森田優晟" />
            <img src="https://randomuser.me/api/portraits/men/41.jpg" alt="菅原諒" />
            <img src="https://randomuser.me/api/portraits/men/67.jpg" alt="桑原遼太" />
          </div>
          <div class="about-teaser__cta">
            <a href="#" class="btn btn--secondary" data-tab="about" data-i18n="about.teaser_cta">アバウトページへ →</a>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: i18nキーを追加する(4ファイル共通、新規`about`名前空間)**

`src/i18n/ja.js`に(`footer`ブロックの前など)新規追加する:
```js
  about: {
    teaser_label: "アバウト",
    teaser_title: "銭湯から始まる、多文化共生。",
    teaser_body: "YU-NITYは、銭湯文化を通じて訪日外国人と地域住民をつなぐ、学生発のプロジェクトチームです。",
    teaser_cta: "アバウトページへ →",
  },
```

`src/i18n/en.js`:
```js
  about: {
    teaser_label: "About",
    teaser_title: "Multicultural exchange starts at the sento.",
    teaser_body: "YU-NITY is a student-led project team connecting foreign visitors and local residents through Japan's sento culture.",
    teaser_cta: "Meet the team →",
  },
```

`src/i18n/zh.js`:
```js
  about: {
    teaser_label: "关于我们",
    teaser_title: "从钱汤开始的多元文化共生。",
    teaser_body: "YU-NITY是一支学生发起的项目团队，通过日本钱汤文化连接外国游客与当地居民。",
    teaser_cta: "认识我们的团队 →",
  },
```

`src/i18n/ko.js`:
```js
  about: {
    teaser_label: "소개",
    teaser_title: "센토에서 시작되는 다문화 공생.",
    teaser_body: "YU-NITY는 일본의 센토 문화를 통해 외국인 관광객과 지역 주민을 잇는 학생 주도 프로젝트팀입니다.",
    teaser_cta: "팀 소개 보기 →",
  },
```

- [ ] **Step 3: `scrollAnimations.js`にアバウトティザーの登録を追加する**

Survey登録ブロック(`registerAll(".survey-section__inner > *", { y: 28 }, 0.12);`)の直後に追加する:
```js
  // ── About teaser (home) ─────────────────────────────
  registerAll(".about-teaser-section .section__label", { y: 20 });
  registerAll(".about-teaser-section .section__title", { y: 28 });
  registerAll(".about-teaser-section .section__body",  { y: 20, delay: 0.1 });
  registerAll(".about-teaser__avatars img",             { y: 24, delay: 0.15 }, 0.05);
```

- [ ] **Step 4: `reveal.js`にセレクタを追加する**

`// Survey`ブロックの前後どちらでもよいので追加する:
```js
  // About teaser (home)
  ".about-teaser-section .section__label",
  ".about-teaser-section .section__title",
  ".about-teaser-section .section__body",
  ".about-teaser__avatars img",
```

- [ ] **Step 5: CSSを追加する**

`src/styles/layout.css`のTask 5で追加した`.manner-section`関連ブロックの直後に追加する:
```css
/* ---- About teaser (home) ---- */
.about-teaser-section {
  background-color: var(--color-cream);
}

.about-teaser-section .section__title {
  color: rgba(72, 146, 155, 0.65);
  -webkit-text-stroke: 1.5px var(--color-charcoal);
}

.about-teaser__avatars {
  display: flex;
  gap: var(--space-sm);
  margin: var(--space-lg) 0;
}

.about-teaser__avatars img {
  width: clamp(48px, 8vw, 72px);
  height: clamp(48px, 8vw, 72px);
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-white);
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
}

.about-teaser__cta {
  text-align: center;
}
```

`.about-teaser-section`をfrosted-glassセレクタリスト3箇所に追加する(Task 4/5で`.sento-section`/`.manner-section`を加えた同じ3箇所に続けて追加する)。

- [ ] **Step 6: ビルド確認**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 7: ブラウザ確認**

`npm run dev`でホームを開き、アンケートセクションの直後にアバウトティザー(ミッション文+6名の丸型アバター+CTA)が表示されることを確認する。ホームページの最終順序が「Hero→Gallery→銭湯紹介→マナー→アンケート→アバウト」になっていることを確認する。「アバウトページへ」ボタンでアバウトタブに遷移することを確認する。

---

## Task 7: 「銭湯紹介」ページを大黒湯(文京区)の本格コンテンツに作り替える

**Files:**
- Modify: `index.html`
- Modify: `src/animations/scrollAnimations.js`
- Modify: `src/utils/reveal.js`
- Modify: `src/styles/layout.css`
- Modify: `src/i18n/ja.js`, `src/i18n/en.js`, `src/i18n/zh.js`, `src/i18n/ko.js`

**Interfaces:**
- Consumes: Task 1で`page-sento`に暫定配置した`concept-section`(削除対象)と`access-section`(大黒湯情報に更新して再利用)。
- Produces: `page-sento`は`ページヘッダー → ストーリー → 特徴紹介(feature-row×3) → アクセス情報`の構成になる。住所・営業時間・料金はダミー値のままだが、`大黒湯`という名称・文京区という所在地は反映される。

- [ ] **Step 1: 旧`concept-section`を削除し、ページヘッダー・ストーリー・特徴紹介セクションに置き換える**

`page-sento`内の以下をまるごと削除する:
```html
      <section class="section concept-section" id="concept" data-temp="0.4">
        <div class="container">
          <div class="section__label" data-i18n="concept.label">銭湯文化とは</div>
          <div class="concept-section__grid">
            ...(省略、img-wrap/stats/text/tags を含む全体)
          </div>
        </div>
      </section>
```
(`<div class="concept-section__grid">`から対応する`</div>`まで、`.section__label`の行も含めてセクション全体を削除する)

代わりに、`page-sento`の先頭(`<div class="page" id="page-sento">`の直後)に以下を追加する:

```html
      <section class="section sento-page-header" data-temp="0.3">
        <div class="container">
          <div class="section__label" data-i18n="sento.page_label">銭湯紹介</div>
          <h1 class="section__title" data-i18n="sento.page_title">大黒湯 — 文京区に息づく、昔ながらの湯</h1>
        </div>
      </section>

      <section class="section sento-story-section" data-temp="0.35">
        <div class="container">
          <p class="section__body" data-i18n="sento.story_p1">文京区の路地に佇む「大黒湯」は、地域の暮らしに寄り添いながら、何十年も湯を焚き続けてきた銭湯です。</p>
          <p class="section__body" data-i18n="sento.story_p2">番台越しに交わされるあいさつ、常連客同士の何気ない会話——ここには、都会の喧騒を忘れさせる、あたたかな時間が流れています。</p>
          <p class="section__body" data-i18n="sento.story_p3">訪れる人を選ばない懐の深さこそ、大黒湯が守り続けてきた誇りです。</p>
        </div>
      </section>

      <section class="section sento-features-section" data-temp="0.42">
        <div class="container">
          <div class="feature-row">
            <div class="feature-row__media" data-index="01"></div>
            <div class="feature-row__text">
              <h3 class="feature-row__title" data-i18n="sento.feature1_title">唐破風の屋根が出迎える玄関</h3>
              <p class="feature-row__body" data-i18n="sento.feature1_body">堂々とした唐破風造りの屋根は、大黒湯のシンボル。一歩くぐれば、昭和の面影が今も色濃く残ります。</p>
            </div>
          </div>
          <div class="feature-row">
            <div class="feature-row__media" data-index="02"></div>
            <div class="feature-row__text">
              <h3 class="feature-row__title" data-i18n="sento.feature2_title">番台からはじまる、ひとときの交流</h3>
              <p class="feature-row__body" data-i18n="sento.feature2_body">受付では、ご主人やスタッフとの何気ないやり取りが待っています。初めての方には入浴の流れも丁寧に教えてもらえます。</p>
            </div>
          </div>
          <div class="feature-row">
            <div class="feature-row__media" data-index="03"></div>
            <div class="feature-row__text">
              <h3 class="feature-row__title" data-i18n="sento.feature3_title">浴室を彩る、雄大な銭湯絵</h3>
              <p class="feature-row__body" data-i18n="sento.feature3_body">湯気の向こうに広がる富士山の銭湯絵。湯船に浸かりながら見上げる一枚は、大黒湯ならではの贅沢なひとときです。</p>
            </div>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: アクセス情報を大黒湯の内容に更新する(住所・営業時間・料金はダミー値のまま)**

`page-sento`内(Step1の直後)にある`access-section`を以下のように更新する。まず`data-temp="0.32"`を`data-temp="0.5"`に変更する。次に中身を:

```html
      <section class="section access-section" data-temp="0.5">
        <div class="container">
          <div class="section__label" data-i18n="access.label">場所</div>
          <h2 class="section__title" data-i18n="access.title">アクセス</h2>
          <div class="access-grid">
            <div class="access-info">
              <p class="access-info__name" data-i18n="access.name">大黒湯</p>
              <dl class="access-details">
                <dt data-i18n="access.dt_address">住所</dt>
                <dd data-i18n="access.address">東京都文京区〇〇 2-0-0（住所は仮の情報です）</dd>
                <dt data-i18n="access.dt_hours">営業時間</dt>
                <dd data-i18n="access.hours">15:30 〜 24:00</dd>
                <dt data-i18n="access.dt_closed">定休日</dt>
                <dd data-i18n="access.closed">金曜日</dd>
                <dt data-i18n="access.dt_price">入浴料</dt>
                <dd data-i18n="access.price">大人 ¥520 ／ 子ども ¥200</dd>
              </dl>
              <p class="access-info__disclaimer" data-i18n="access.disclaimer">※営業時間・料金は仮の情報です。正式な情報に差し替えてください。</p>
              <a href="https://maps.google.com" target="_blank" rel="noopener" class="btn btn--primary" data-i18n="access.map_btn">Google マップで開く</a>
            </div>
            <div class="access-map">
              <div class="access-map__placeholder">
                <p style="font-size:2.5rem">📍</p>
                <p data-i18n="access.map_address">東京都文京区</p>
                <p class="access-map__note" data-i18n="access.map_note_text">Google マップ埋め込みを設定中</p>
              </div>
            </div>
          </div>
        </div>
      </section>
```

(`access-map__note`の内側テキストは元々`data-i18n`が付いていなかったため、新規に`access.map_note_text`キーとして追加する。)

- [ ] **Step 3: i18nキーを追加・更新する(4ファイル共通)**

`src/i18n/ja.js`の`sento`名前空間(Task 4で追加済み)に以下のキーを追記する:
```js
  sento: {
    teaser_label: "銭湯紹介",
    teaser_title: "日本が誇る、湯の文化",
    teaser_body: "銭湯は単なる入浴施設ではありません。地域のコミュニティが集まり、裸の付き合いで本音を語り合える、日本独自の文化的空間です。",
    teaser_name: "今回ご紹介するのは、東京・文京区の「大黒湯」。",
    teaser_cta: "銭湯紹介ページへ →",
    teaser_map_area: "東京都文京区",
    teaser_map_note: "Google マップ埋め込みを設定中",
    page_label: "銭湯紹介",
    page_title: "大黒湯 — 文京区に息づく、昔ながらの湯",
    story_p1: "文京区の路地に佇む「大黒湯」は、地域の暮らしに寄り添いながら、何十年も湯を焚き続けてきた銭湯です。",
    story_p2: "番台越しに交わされるあいさつ、常連客同士の何気ない会話——ここには、都会の喧騒を忘れさせる、あたたかな時間が流れています。",
    story_p3: "訪れる人を選ばない懐の深さこそ、大黒湯が守り続けてきた誇りです。",
    feature1_title: "唐破風の屋根が出迎える玄関",
    feature1_body: "堂々とした唐破風造りの屋根は、大黒湯のシンボル。一歩くぐれば、昭和の面影が今も色濃く残ります。",
    feature2_title: "番台からはじまる、ひとときの交流",
    feature2_body: "受付では、ご主人やスタッフとの何気ないやり取りが待っています。初めての方には入浴の流れも丁寧に教えてもらえます。",
    feature3_title: "浴室を彩る、雄大な銭湯絵",
    feature3_body: "湯気の向こうに広がる富士山の銭湯絵。湯船に浸かりながら見上げる一枚は、大黒湯ならではの贅沢なひとときです。",
  },
```

同じく`access`名前空間の値を更新する(キー名は既存のまま、値のみ変更):
```js
  access: {
    label:      "場所",
    title:      "アクセス",
    name:       "大黒湯",
    dt_address: "住所",
    address:    "東京都文京区〇〇 2-0-0（住所は仮の情報です）",
    dt_hours:   "営業時間",
    hours:      "15:30 〜 24:00",
    dt_closed:  "定休日",
    closed:     "金曜日",
    dt_price:   "入浴料",
    price:      "大人 ¥520 ／ 子ども ¥200",
    map_btn:    "Google マップで開く",
    disclaimer: "※営業時間・料金は仮の情報です。正式な情報に差し替えてください。",
    map_address: "東京都文京区",
    map_note_text: "Google マップ埋め込みを設定中",
  },
```

`src/i18n/en.js`の`sento`名前空間に追記:
```js
  sento: {
    teaser_label: "Sento Guide",
    teaser_title: "Japan's Culture of the Bath",
    teaser_body: "A sento is far more than a place to bathe. It is a community gathering space where neighbors meet without pretense, sharing honest conversation.",
    teaser_name: "This time, we introduce Daikokuyu in Bunkyo, Tokyo.",
    teaser_cta: "Visit the Sento Guide →",
    teaser_map_area: "Bunkyo, Tokyo",
    teaser_map_note: "Google Maps embed coming soon",
    page_label: "Sento Guide",
    page_title: "Daikokuyu — A Timeless Bathhouse in Bunkyo",
    story_p1: "Tucked into a quiet street in Bunkyo, Daikokuyu has kept its furnace burning for decades, woven into the daily rhythm of the neighborhood.",
    story_p2: "A greeting across the reception counter, easy chatter between regulars — here, time slows down in a way the city rarely allows.",
    story_p3: "Welcoming everyone who walks through its doors, without exception, is the quiet pride Daikokuyu has carried all along.",
    feature1_title: "A gabled roof greets every visitor",
    feature1_body: "The bathhouse's signature karahafu gable roof still stands proud, carrying the atmosphere of a bygone era the moment you step inside.",
    feature2_title: "Connection begins at the reception counter",
    feature2_body: "A few words exchanged at the counter set the tone for your visit — staff are happy to walk first-timers through the routine.",
    feature3_title: "A grand mural watches over the bathing hall",
    feature3_body: "Through the rising steam, a sweeping mural of Mt. Fuji unfolds above the tub — a small luxury unique to Daikokuyu.",
  },
```
`access`名前空間の値を更新:
```js
  access: {
    label:      "Location",
    title:      "Access",
    name:       "Daikokuyu",
    dt_address: "Address",
    address:    "0-0-0 〇〇, Bunkyo-ku, Tokyo (placeholder — to be confirmed)",
    dt_hours:   "Hours",
    hours:      "15:30 – 24:00",
    dt_closed:  "Closed",
    closed:     "Fridays",
    dt_price:   "Admission",
    price:      "Adults ¥520 / Children ¥200",
    map_btn:    "Open in Google Maps",
    disclaimer: "*Hours and pricing shown are placeholders — please replace with confirmed details.",
    map_address: "Bunkyo-ku, Tokyo",
    map_note_text: "Google Maps embed coming soon",
  },
```

`src/i18n/zh.js`の`sento`名前空間に追記:
```js
  sento: {
    teaser_label: "钱汤介绍",
    teaser_title: "日本引以为傲的浴汤文化",
    teaser_body: "钱汤不仅仅是洗浴设施。它是社区居民聚集、坦诚交流的日本独特文化空间。",
    teaser_name: "这次为大家介绍东京文京区的「大黒湯」。",
    teaser_cta: "前往钱汤介绍页面 →",
    teaser_map_area: "东京都文京区",
    teaser_map_note: "谷歌地图嵌入设置中",
    page_label: "钱汤介绍",
    page_title: "大黒湯 — 扎根文京区的老式钱汤",
    story_p1: "大黒湯坐落在文京区的小巷深处，数十年如一日地烧着热水，融入了当地居民的日常生活。",
    story_p2: "柜台前的一句问候，常客之间不经意的闲聊——这里流淌着让都市喧嚣暂时远去的温暖时光。",
    story_p3: "对每一位到访者都敞开怀抱，这正是大黒湯一直守护的骄傲。",
    feature1_title: "唐破风屋顶迎接来客",
    feature1_body: "气派的唐破风屋顶是大黒湯的标志，一踏入店内，昭和时代的氛围便扑面而来。",
    feature2_title: "从柜台开始的交流时光",
    feature2_body: "在柜台前，与店主或工作人员的简单交谈由此展开，初次到访者也会被耐心告知入浴流程。",
    feature3_title: "浴室中壮丽的钱汤壁画",
    feature3_body: "透过氤氲热气，一幅富士山壁画在浴池上方展开——这是大黒湯独有的奢侈时刻。",
  },
```
`access`名前空间の値を更新:
```js
  access: {
    label:      "场所",
    title:      "交通指南",
    name:       "大黒湯",
    dt_address: "地址",
    address:    "东京都文京区〇〇 2-0-0（地址为占位信息，待确认）",
    dt_hours:   "营业时间",
    hours:      "15:30 – 24:00",
    dt_closed:  "定休日",
    closed:     "周五",
    dt_price:   "入浴费",
    price:      "成人 ¥520 ／ 儿童 ¥200",
    map_btn:    "在谷歌地图中打开",
    disclaimer: "※营业时间与价格为临时信息，请替换为正式内容。",
    map_address: "东京都文京区",
    map_note_text: "谷歌地图嵌入设置中",
  },
```

`src/i18n/ko.js`の`sento`名前空間に追記:
```js
  sento: {
    teaser_label: "센토 소개",
    teaser_title: "일본이 자랑하는 목욕 문화",
    teaser_body: "센토는 단순한 목욕 시설이 아닙니다. 지역 주민들이 모여 스스럼없이 마음을 나누는 일본 고유의 문화 공간입니다.",
    teaser_name: "이번에 소개할 곳은 도쿄 분쿄구의 「다이코쿠유」입니다.",
    teaser_cta: "센토 소개 페이지로 →",
    teaser_map_area: "도쿄도 분쿄구",
    teaser_map_note: "구글 맵 embed 준비 중",
    page_label: "센토 소개",
    page_title: "다이코쿠유 — 분쿄구에 자리한 오래된 목욕탕",
    story_p1: "분쿄구의 골목 한켠에 자리한 다이코쿠유는 수십 년간 가마솥에 불을 지피며 지역 주민의 일상 속에 녹아들어 왔습니다.",
    story_p2: "카운터 너머로 오가는 인사, 단골 손님들의 스스럼없는 대화——이곳에는 도심의 소란을 잊게 하는 따뜻한 시간이 흐릅니다.",
    story_p3: "찾아오는 그 누구도 가리지 않는 넉넉함이야말로 다이코쿠유가 지켜온 자부심입니다.",
    feature1_title: "가라하후 지붕이 맞이하는 입구",
    feature1_body: "당당한 가라하후 양식의 지붕은 다이코쿠유의 상징입니다. 문을 들어서는 순간 옛 정취가 짙게 남아 있습니다.",
    feature2_title: "카운터에서 시작되는 교류의 시간",
    feature2_body: "카운터에서 나누는 사소한 대화가 방문의 시작입니다. 처음 오신 분에게는 입욕 순서도 친절히 알려줍니다.",
    feature3_title: "욕실을 수놓는 웅장한 센토 벽화",
    feature3_body: "피어오르는 김 너머로 펼쳐지는 후지산 벽화. 탕에 몸을 담근 채 올려다보는 그 풍경은 다이코쿠유만의 특별한 순간입니다.",
  },
```
`access`名前空間の値を更新:
```js
  access: {
    label:      "위치",
    title:      "오시는 길",
    name:       "다이코쿠유",
    dt_address: "주소",
    address:    "도쿄도 분쿄구 〇〇 2-0-0 (임시 주소, 추후 확인 필요)",
    dt_hours:   "영업시간",
    hours:      "15:30 – 24:00",
    dt_closed:  "정기 휴일",
    closed:     "금요일",
    dt_price:   "입욕료",
    price:      "성인 ¥520 / 어린이 ¥200",
    map_btn:    "구글 맵에서 열기",
    disclaimer: "※ 영업시간과 요금은 임시 정보입니다. 정식 정보로 교체해 주세요.",
    map_address: "도쿄도 분쿄구",
    map_note_text: "구글 맵 embed 준비 중",
  },
```

- [ ] **Step 4: `scrollAnimations.js`にストーリー・特徴紹介の登録を追加し、Conceptの登録を差し替える**

既存の以下のブロック(Concept登録、旧concept-sectionを対象にしていた):
```js
  // ── Concept ──────────────────────────────────────────
  registerAll(".concept-section .section__label", { y: 20 });
  registerAll(".concept-section__visual",          { x: -50 });
  registerAll(".concept-section__text > *",        { x: 40 }, 0.1);
```
を削除し、代わりに以下を追加する:
```js
  // ── Sento page (dedicated) ──────────────────────────
  registerAll(".sento-page-header .section__label", { y: 20 });
  registerAll(".sento-page-header .section__title", { y: 28 });
  registerAll(".sento-story-section .section__body", { y: 20 }, 0.08);
  registerAll(".feature-row",                        { y: 36 }, 0.12);
```

- [ ] **Step 5: `reveal.js`からConceptセレクタを削除し、新セレクタを追加する**

以下を削除する:
```js
  // Concept
  ".concept-section .section__label",
  ".concept-section__visual",
  ".concept-section__text > *",
```
代わりに追加する:
```js
  // Sento page (dedicated)
  ".sento-page-header .section__label",
  ".sento-page-header .section__title",
  ".sento-story-section .section__body",
  ".feature-row",
```

- [ ] **Step 6: CSSを更新する**

`src/styles/layout.css`から`/* ---- Concept ---- */`ブロック(`.concept-section`〜`.concept-section__tags`まで)をまるごと削除する。代わりにその位置へ以下を追加する:

```css
/* ---- Sento page (dedicated) ---- */
.sento-page-header,
.sento-story-section {
  background-color: #f0ece4;
}

.sento-page-header .section__title,
.sento-story-section .section__title {
  color: rgba(72, 146, 155, 0.65);
  -webkit-text-stroke: 1.5px var(--color-charcoal);
}

.sento-story-section .section__body {
  margin-bottom: var(--space-md);
}

.sento-story-section .section__body:last-child {
  margin-bottom: 0;
}

.sento-features-section {
  background-color: transparent !important;
}

.feature-row {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.feature-row:last-child {
  margin-bottom: 0;
}

.feature-row:nth-child(even) {
  flex-direction: row-reverse;
}

.feature-row__media {
  position: relative;
  flex: 0 0 42%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-navy), rgba(72, 146, 155, 0.18));
  border: 1px solid rgba(255,255,255,0.08);
}

.feature-row__media::before {
  content: attr(data-index);
  position: absolute;
  top: 0.75rem;
  left: 0.9rem;
  font-family: var(--font-display);
  font-size: var(--text-sm);
  letter-spacing: 0.1em;
  color: rgba(238, 234, 228, 0.55);
}

.feature-row__text {
  flex: 1;
}

.feature-row__title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--color-cream);
  margin-bottom: var(--space-xs);
}

.feature-row__body {
  font-size: var(--text-base);
  line-height: 1.8;
  color: rgba(238, 234, 228, 0.8);
}

.access-info__disclaimer {
  font-size: var(--text-xs);
  color: rgba(44, 40, 40, 0.5);
  margin-top: -0.5rem;
  margin-bottom: var(--space-md);
}

@media (max-width: 768px) {
  .feature-row,
  .feature-row:nth-child(even) {
    flex-direction: column;
    align-items: stretch;
  }
  .feature-row__media {
    flex: none;
  }
}
```

`.sento-page-header`と`.sento-story-section`をfrosted-glassセレクタリスト3箇所に追加し、同時にこの3箇所すべてから(旧concept-sectionのHTMLをStep1で削除したため不要になった)`.concept-section,`(および`> .container`版・`body.no-water`版)を取り除く。3箇所とも、Task 4〜6で`.sento-section`/`.manner-section`/`.about-teaser-section`を加えてきた同じ場所に続けて追加・削除する。`.sento-features-section`はダーク(透過)セクション扱いなので、ダークセクションリスト:
```css
.hero,
.survey-section,
.gallery-section {
```
を:
```css
.hero,
.survey-section,
.gallery-section,
.sento-features-section {
```
に変更する。

- [ ] **Step 7: ビルド確認**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 8: ブラウザ確認**

`npm run dev`で「銭湯紹介」タブを開き、ページヘッダー→ストーリー(3段落)→特徴紹介(3行、画像プレースホルダが左右交互に配置)→アクセス情報(大黒湯・ダミー住所・disclaimer付き)の順に表示されることを確認する。4言語切り替えで全テキストが切り替わることを確認する。モバイル幅で特徴紹介が縦積みになることを確認する。

---

## Task 8: 「マナー」ページを本格的な入浴ガイドに作り替える

**Files:**
- Modify: `index.html`
- Modify: `src/animations/scrollAnimations.js`
- Modify: `src/utils/reveal.js`
- Modify: `src/styles/layout.css`
- Modify: `src/i18n/ja.js`, `src/i18n/en.js`, `src/i18n/zh.js`, `src/i18n/ko.js`

**Interfaces:**
- Consumes: Task 1で追加した`page-manner`のプレースホルダ(`manner.page_label`/`manner.page_title`キーは既存のまま再利用)。
- Produces: `page-manner`は`導入 → 六ステップ(壱〜陸の朱印カード) → 個別ルール → よくある誤解Q&A`の構成になる。

- [ ] **Step 1: `page-manner`の中身をプレースホルダから本格コンテンツに置き換える**

`page-manner`内の以下(Task 1で追加したプレースホルダ)を:
```html
      <section class="section manner-page-placeholder" data-temp="0.45">
        <div class="container">
          <div class="section__label" data-i18n="manner.page_label">マナー</div>
          <h2 class="section__title" data-i18n="manner.page_title">気持ちよく、みんなで入る。</h2>
        </div>
      </section>
```
以下にまるごと置き換える:
```html
      <section class="section manner-page-header" data-temp="0.3">
        <div class="container">
          <div class="section__label" data-i18n="manner.page_label">マナー</div>
          <h1 class="section__title" data-i18n="manner.page_title">気持ちよく、みんなで入る。</h1>
          <p class="section__body" data-i18n="manner.page_intro">銭湯は、見知らぬ人同士が同じ湯を分かち合う場所。ちょっとした心づかいが、みんなが気持ちよく過ごせる時間をつくります。</p>
        </div>
      </section>

      <section class="section manner-steps-section" data-temp="0.4">
        <div class="container">
          <div class="section__label" data-i18n="manner.steps_label">入浴の流れ</div>
          <h2 class="section__title" data-i18n="manner.steps_title">六つのステップ</h2>
          <div class="step-grid">
            <div class="step-card" data-seal="壱">
              <h3 class="step-card__title" data-i18n="manner.step1_title">受付</h3>
              <p class="step-card__body" data-i18n="manner.step1_body">番台やフロントで入浴料を払います。タオルや石鹸は貸し出している施設も多いので、心配な方は聞いてみましょう。</p>
            </div>
            <div class="step-card" data-seal="弐">
              <h3 class="step-card__title" data-i18n="manner.step2_title">脱衣所</h3>
              <p class="step-card__body" data-i18n="manner.step2_body">衣類はロッカーや棚にきちんとたたんで収納します。貴重品はロッカーの鍵をかけて管理しましょう。</p>
            </div>
            <div class="step-card" data-seal="参">
              <h3 class="step-card__title" data-i18n="manner.step3_title">洗い場</h3>
              <p class="step-card__body" data-i18n="manner.step3_body">湯船に入る前に、必ず椅子に座って体を洗い流します。かけ湯だけでもよいので、湯を浴びてから浴槽へ。</p>
            </div>
            <div class="step-card" data-seal="肆">
              <h3 class="step-card__title" data-i18n="manner.step4_title">湯船</h3>
              <p class="step-card__body" data-i18n="manner.step4_body">タオルは湯船の外に置き、静かに肩まで浸かります。泳いだり潜ったりはせず、ゆったりと過ごしましょう。</p>
            </div>
            <div class="step-card" data-seal="伍">
              <h3 class="step-card__title" data-i18n="manner.step5_title">上がり湯</h3>
              <p class="step-card__body" data-i18n="manner.step5_body">湯船から上がったら、かけ湯で汗を軽く流します。体を拭いてから脱衣所に戻ると、床が濡れずに済みます。</p>
            </div>
            <div class="step-card" data-seal="陸">
              <h3 class="step-card__title" data-i18n="manner.step6_title">退出後</h3>
              <p class="step-card__body" data-i18n="manner.step6_body">ロッカーの鍵を返却し、忘れ物がないか確認して退出しましょう。湯上がりの一杯も銭湯の楽しみのひとつです。</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section manner-rules-section" data-temp="0.5">
        <div class="container">
          <div class="section__label" data-i18n="manner.rules_label">個別ルール</div>
          <h2 class="section__title" data-i18n="manner.rules_title">知っておきたいこと</h2>
          <div class="manner-rules-grid">
            <div class="manner-highlight-card">
              <div class="manner-highlight-card__icon">🎨</div>
              <h3 class="manner-highlight-card__title" data-i18n="manner.rule1_title">タトゥーについて</h3>
              <p class="manner-highlight-card__body" data-i18n="manner.rule1_body">対応は施設ごとに異なります。シールで隠せば入浴できる施設も多いので、事前に確認しましょう。</p>
            </div>
            <div class="manner-highlight-card">
              <div class="manner-highlight-card__icon">📷</div>
              <h3 class="manner-highlight-card__title" data-i18n="manner.rule2_title">写真・動画の撮影</h3>
              <p class="manner-highlight-card__body" data-i18n="manner.rule2_body">脱衣所・浴室での撮影は他のお客様のプライバシーを守るため禁止です。</p>
            </div>
            <div class="manner-highlight-card">
              <div class="manner-highlight-card__icon">🖤</div>
              <h3 class="manner-highlight-card__title" data-i18n="manner.rule3_title">タオルは湯船の外へ</h3>
              <p class="manner-highlight-card__body" data-i18n="manner.rule3_body">衛生のため、タオルを湯船の中に浸けないようにしましょう。</p>
            </div>
            <div class="manner-highlight-card">
              <div class="manner-highlight-card__icon">🏊</div>
              <h3 class="manner-highlight-card__title" data-i18n="manner.rule4_title">泳がない・潜らない</h3>
              <p class="manner-highlight-card__body" data-i18n="manner.rule4_body">浴槽は静かに浸かる場所です。泳いだり水しぶきをあげたりするのは控えましょう。</p>
            </div>
            <div class="manner-highlight-card">
              <div class="manner-highlight-card__icon">🤫</div>
              <h3 class="manner-highlight-card__title" data-i18n="manner.rule5_title">私語は控えめに</h3>
              <p class="manner-highlight-card__body" data-i18n="manner.rule5_body">大きな声での会話は避け、静かな時間をみんなで共有しましょう。</p>
            </div>
            <div class="manner-highlight-card">
              <div class="manner-highlight-card__icon">🍺</div>
              <h3 class="manner-highlight-card__title" data-i18n="manner.rule6_title">飲酒後の入浴は控える</h3>
              <p class="manner-highlight-card__body" data-i18n="manner.rule6_body">酔った状態での入浴は体調を崩す原因になります。時間をおいてから訪れましょう。</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section manner-faq-section" data-temp="0.58">
        <div class="container">
          <div class="section__label" data-i18n="manner.faq_label">よくある誤解</div>
          <h2 class="section__title" data-i18n="manner.faq_title">Q&A</h2>
          <div class="faq-list">
            <details class="faq-item">
              <summary class="faq-item__question" data-i18n="manner.faq1_q">タトゥーがあると絶対に入れませんか?</summary>
              <p class="faq-item__answer" data-i18n="manner.faq1_a">施設によって対応は様々です。シールでカバーすれば入浴できる銭湯も多く、実際には「入れない」と思い込んでいるだけのケースが少なくありません。気になる場合は事前に施設へ問い合わせてみましょう。</p>
            </details>
            <details class="faq-item">
              <summary class="faq-item__question" data-i18n="manner.faq2_q">言葉が話せなくても大丈夫ですか?</summary>
              <p class="faq-item__answer" data-i18n="manner.faq2_a">大丈夫です。このページのステップさえ押さえておけば、会話が少なくても気持ちよく過ごせます。困ったときはスタッフに聞けば、身振りを交えて教えてくれます。</p>
            </details>
            <details class="faq-item">
              <summary class="faq-item__question" data-i18n="manner.faq3_q">水着を着て入浴してもいいですか?</summary>
              <p class="faq-item__answer" data-i18n="manner.faq3_a">銭湯では水着の着用はできません。裸で入るのが基本のマナーです。慣れないうちは緊張するかもしれませんが、これも「裸の付き合い」という銭湯文化のひとつです。</p>
            </details>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: i18nキーを追加する(4ファイル共通、既存`manner`名前空間に追記)**

`src/i18n/ja.js`の`manner`名前空間(Task 1/5で追加済み)に以下を追記する:
```js
    page_intro: "銭湯は、見知らぬ人同士が同じ湯を分かち合う場所。ちょっとした心づかいが、みんなが気持ちよく過ごせる時間をつくります。",
    steps_label: "入浴の流れ",
    steps_title: "六つのステップ",
    step1_title: "受付",
    step1_body: "番台やフロントで入浴料を払います。タオルや石鹸は貸し出している施設も多いので、心配な方は聞いてみましょう。",
    step2_title: "脱衣所",
    step2_body: "衣類はロッカーや棚にきちんとたたんで収納します。貴重品はロッカーの鍵をかけて管理しましょう。",
    step3_title: "洗い場",
    step3_body: "湯船に入る前に、必ず椅子に座って体を洗い流します。かけ湯だけでもよいので、湯を浴びてから浴槽へ。",
    step4_title: "湯船",
    step4_body: "タオルは湯船の外に置き、静かに肩まで浸かります。泳いだり潜ったりはせず、ゆったりと過ごしましょう。",
    step5_title: "上がり湯",
    step5_body: "湯船から上がったら、かけ湯で汗を軽く流します。体を拭いてから脱衣所に戻ると、床が濡れずに済みます。",
    step6_title: "退出後",
    step6_body: "ロッカーの鍵を返却し、忘れ物がないか確認して退出しましょう。湯上がりの一杯も銭湯の楽しみのひとつです。",
    rules_label: "個別ルール",
    rules_title: "知っておきたいこと",
    rule1_title: "タトゥーについて",
    rule1_body: "対応は施設ごとに異なります。シールで隠せば入浴できる施設も多いので、事前に確認しましょう。",
    rule2_title: "写真・動画の撮影",
    rule2_body: "脱衣所・浴室での撮影は他のお客様のプライバシーを守るため禁止です。",
    rule3_title: "タオルは湯船の外へ",
    rule3_body: "衛生のため、タオルを湯船の中に浸けないようにしましょう。",
    rule4_title: "泳がない・潜らない",
    rule4_body: "浴槽は静かに浸かる場所です。泳いだり水しぶきをあげたりするのは控えましょう。",
    rule5_title: "私語は控えめに",
    rule5_body: "大きな声での会話は避け、静かな時間をみんなで共有しましょう。",
    rule6_title: "飲酒後の入浴は控える",
    rule6_body: "酔った状態での入浴は体調を崩す原因になります。時間をおいてから訪れましょう。",
    faq_label: "よくある誤解",
    faq_title: "Q&A",
    faq1_q: "タトゥーがあると絶対に入れませんか?",
    faq1_a: "施設によって対応は様々です。シールでカバーすれば入浴できる銭湯も多く、実際には「入れない」と思い込んでいるだけのケースが少なくありません。気になる場合は事前に施設へ問い合わせてみましょう。",
    faq2_q: "言葉が話せなくても大丈夫ですか?",
    faq2_a: "大丈夫です。このページのステップさえ押さえておけば、会話が少なくても気持ちよく過ごせます。困ったときはスタッフに聞けば、身振りを交えて教えてくれます。",
    faq3_q: "水着を着て入浴してもいいですか?",
    faq3_a: "銭湯では水着の着用はできません。裸で入るのが基本のマナーです。慣れないうちは緊張するかもしれませんが、これも「裸の付き合い」という銭湯文化のひとつです。",
```

`src/i18n/en.js`の`manner`名前空間に追記:
```js
    page_intro: "A sento is a place where strangers share the same bathwater. A little consideration goes a long way toward making it comfortable for everyone.",
    steps_label: "How It Works",
    steps_title: "Six Simple Steps",
    step1_title: "Check in",
    step1_body: "Pay your admission at the front desk. Many bathhouses rent towels and soap, so just ask if you need them.",
    step2_title: "Changing room",
    step2_body: "Fold your clothes neatly into a locker or shelf. Lock up your valuables before heading to the bath.",
    step3_title: "Washing area",
    step3_body: "Always sit and rinse your body before entering the tub — even a quick rinse is fine, just wash before you soak.",
    step4_title: "The bath",
    step4_body: "Keep your towel out of the tub and settle in quietly up to your shoulders. No swimming or diving — just relax.",
    step5_title: "Rinsing off",
    step5_body: "After the bath, a light rinse washes away the sweat. Dry off before returning to the changing room to keep the floor dry.",
    step6_title: "Heading out",
    step6_body: "Return your locker key and check for anything left behind. A cold drink afterward is part of the sento experience.",
    rules_label: "Good to Know",
    rules_title: "A Few More Things",
    rule1_title: "About tattoos",
    rule1_body: "Policies vary by bathhouse. Many allow entry if tattoos are covered with a patch, so it's worth checking ahead.",
    rule2_title: "Photos and video",
    rule2_body: "Filming in the changing room or bath is prohibited, out of respect for other guests' privacy.",
    rule3_title: "Keep towels out of the tub",
    rule3_body: "For hygiene, never let your towel touch the bathwater.",
    rule4_title: "No swimming or diving",
    rule4_body: "The tub is a place to sit quietly — please don't swim or splash.",
    rule5_title: "Keep conversation quiet",
    rule5_body: "Avoid loud talking so everyone can share a peaceful atmosphere.",
    rule6_title: "Skip the bath after drinking",
    rule6_body: "Bathing while intoxicated can be dangerous — come back once you've sobered up.",
    faq_label: "Common Misconceptions",
    faq_title: "Q&A",
    faq1_q: "Are tattoos always a dealbreaker?",
    faq1_a: "It depends on the bathhouse. Many allow entry if you cover tattoos with a patch — often the real barrier is just assuming you can't go in. If you're unsure, it's worth asking ahead.",
    faq2_q: "What if I don't speak Japanese?",
    faq2_a: "You'll be fine. Follow the steps on this page and you can enjoy a sento with very little conversation. Staff are used to helping with gestures when needed.",
    faq3_q: "Can I wear a swimsuit?",
    faq3_a: "Swimsuits aren't worn at a sento — bathing without clothes is the standard practice. It might feel unfamiliar at first, but it's part of the culture of unguarded, honest connection sento are known for.",
```

`src/i18n/zh.js`の`manner`名前空間に追記:
```js
    page_intro: "钱汤是陌生人共享同一池热水的地方。一点点体贴，就能让大家都舒心自在。",
    steps_label: "入浴流程",
    steps_title: "六个简单步骤",
    step1_title: "前台",
    step1_body: "在前台支付入浴费。许多钱汤也提供毛巾和肥皂租借，有需要请直接询问。",
    step2_title: "更衣室",
    step2_body: "将衣物整齐地放入储物柜或架子。贵重物品请上锁保管后再进入浴室。",
    step3_title: "洗澡区",
    step3_body: "进入浴池前，请务必先坐下冲洗身体，哪怕只是简单淋浴也好——先洗净，再入浴。",
    step4_title: "浴池",
    step4_body: "请将毛巾放在浴池外，安静地泡到肩膀。不要游泳或跳水，放松地享受就好。",
    step5_title: "出浴冲洗",
    step5_body: "起身后用清水冲去汗水。擦干身体后再回更衣室，可以保持地面干爽。",
    step6_title: "离开前",
    step6_body: "归还储物柜钥匙，确认没有遗漏物品。泡后来一杯冷饮也是钱汤乐趣之一。",
    rules_label: "需要留意",
    rules_title: "还有这些小提示",
    rule1_title: "关于纹身",
    rule1_body: "各店铺规定不同。许多钱汤允许用贴布遮住纹身后入浴，建议事先确认。",
    rule2_title: "拍照与录像",
    rule2_body: "为保护其他客人的隐私，更衣室与浴室内禁止拍摄。",
    rule3_title: "毛巾不入池",
    rule3_body: "出于卫生考虑，请勿将毛巾浸入浴池中。",
    rule4_title: "禁止游泳、潜水",
    rule4_body: "浴池是安静泡浴的地方，请不要游泳或戏水。",
    rule5_title: "交谈请轻声",
    rule5_body: "请避免大声交谈，与大家共享安静的氛围。",
    rule6_title: "饮酒后请勿入浴",
    rule6_body: "醉酒状态下入浴容易引发身体不适，请等酒醒后再来。",
    faq_label: "常见误解",
    faq_title: "问答",
    faq1_q: "有纹身就绝对不能入浴吗？",
    faq1_a: "这取决于店铺。许多钱汤允许贴布遮盖后入浴，很多时候只是「以为不能进」的误解。如果担心，不妨事先向店铺确认。",
    faq2_q: "不会说日语也没关系吗？",
    faq2_a: "没问题。只要掌握本页的流程，即使交流不多也能舒心享受钱汤。遇到困难时，工作人员也会用手势耐心讲解。",
    faq3_q: "可以穿泳装入浴吗？",
    faq3_a: "钱汤不可穿泳装，赤裸入浴是基本礼仪。刚开始可能会有些紧张，但这正是钱汤「坦诚相待」文化的一部分。",
```

`src/i18n/ko.js`の`manner`名前空間に追記:
```js
    page_intro: "센토는 낯선 사람들이 같은 탕물을 함께 나누는 곳입니다. 작은 배려 하나가 모두에게 편안한 시간을 만들어 줍니다.",
    steps_label: "입욕 순서",
    steps_title: "여섯 가지 단계",
    step1_title: "접수",
    step1_body: "카운터에서 입욕료를 지불합니다. 수건과 비누를 대여해주는 곳도 많으니 필요하면 물어보세요.",
    step2_title: "탈의실",
    step2_body: "옷은 사물함이나 선반에 단정히 정리합니다. 귀중품은 사물함에 잠가서 보관하세요.",
    step3_title: "세신 공간",
    step3_body: "탕에 들어가기 전 반드시 의자에 앉아 몸을 씻습니다. 가볍게 헹구는 것만으로도 괜찮으니, 씻고 나서 탕에 들어가세요.",
    step4_title: "탕",
    step4_body: "수건은 탕 밖에 두고 어깨까지 조용히 몸을 담급니다. 수영이나 잠수는 하지 말고 편안히 쉬세요.",
    step5_title: "탕에서 나온 후",
    step5_body: "탕에서 나오면 가볍게 헹궈 땀을 씻어냅니다. 몸을 닦은 후 탈의실로 돌아가면 바닥이 젖지 않습니다.",
    step6_title: "나가기 전",
    step6_body: "사물함 열쇠를 반납하고 놓고 가는 물건이 없는지 확인하세요. 목욕 후 마시는 차가운 음료도 센토의 즐거움 중 하나입니다.",
    rules_label: "알아두면 좋은 것",
    rules_title: "몇 가지 더",
    rule1_title: "문신에 대하여",
    rule1_body: "시설마다 규정이 다릅니다. 스티커로 가리면 입욕이 가능한 곳도 많으니 미리 확인해 보세요.",
    rule2_title: "사진 및 영상 촬영",
    rule2_body: "다른 손님의 사생활 보호를 위해 탈의실과 욕실에서의 촬영은 금지되어 있습니다.",
    rule3_title: "수건은 탕 밖에서",
    rule3_body: "위생을 위해 수건을 탕 안에 담그지 마세요.",
    rule4_title: "수영·잠수 금지",
    rule4_body: "탕은 조용히 몸을 담그는 곳입니다. 수영이나 물장난은 삼가주세요.",
    rule5_title: "대화는 조용히",
    rule5_body: "큰 소리로 대화하지 말고, 모두가 조용한 분위기를 함께 누릴 수 있도록 해주세요.",
    rule6_title: "음주 후 입욕은 피하기",
    rule6_body: "취한 상태에서의 입욕은 몸에 무리를 줄 수 있습니다. 시간을 두었다가 방문해 주세요.",
    faq_label: "흔한 오해",
    faq_title: "Q&A",
    faq1_q: "문신이 있으면 절대 입욕할 수 없나요?",
    faq1_a: "시설마다 다릅니다. 스티커로 가리면 입욕 가능한 센토도 많아, 실제로는 '안 될 것'이라는 선입견인 경우가 적지 않습니다. 걱정되신다면 미리 시설에 문의해 보세요.",
    faq2_q: "일본어를 못해도 괜찮나요?",
    faq2_a: "괜찮습니다. 이 페이지의 순서만 알아두면 대화가 적어도 충분히 즐길 수 있습니다. 어려운 점이 있으면 직원이 몸짓을 섞어 친절히 알려줍니다.",
    faq3_q: "수영복을 입고 들어가도 되나요?",
    faq3_a: "센토에서는 수영복을 입지 않습니다. 옷을 벗고 입욕하는 것이 기본 매너입니다. 처음에는 낯설 수 있지만, 이는 센토 특유의 '스스럼없는 교류' 문화의 일부입니다.",
```

- [ ] **Step 3: `scrollAnimations.js`にマナーページの登録を追加する**

`initScrollAnimations()`内、Sento page登録ブロックの後に追加する:
```js
  // ── Manner page (dedicated) ─────────────────────────
  registerAll(".manner-page-header .section__label", { y: 20 });
  registerAll(".manner-page-header .section__title", { y: 28 });
  registerAll(".manner-page-header .section__body",  { y: 20, delay: 0.1 });
  registerAll(".step-card",                           { y: 32 }, 0.06);
  registerAll(".manner-rules-section .section__label",{ y: 20 });
  registerAll(".manner-rules-section .section__title",{ y: 28 });
  registerAll(".manner-rules-grid .manner-highlight-card", { y: 28 }, 0.06);
  registerAll(".manner-faq-section .section__label",  { y: 20 });
  registerAll(".manner-faq-section .section__title",  { y: 28 });
  registerAll(".faq-item",                            { y: 24 }, 0.08);
```

> 注意: `.manner-rules-grid .manner-highlight-card`のようにコンテナで絞り込んだセレクタを使うこと。Task 5でホームの`.manner-highlight-card`をすでに汎用登録しているため、絞り込まずに`registerAll(".manner-highlight-card", ...)`を再度呼ぶと同じ要素が二重登録されてしまう。

- [ ] **Step 4: `reveal.js`にセレクタを追加する**

```js
  // Manner page (dedicated)
  ".manner-page-header .section__label",
  ".manner-page-header .section__title",
  ".manner-page-header .section__body",
  ".step-card",
  ".manner-rules-section .section__label",
  ".manner-rules-section .section__title",
  ".manner-rules-grid .manner-highlight-card",
  ".manner-faq-section .section__label",
  ".manner-faq-section .section__title",
  ".faq-item",
```

- [ ] **Step 5: CSSを追加する**

`src/styles/layout.css`のTask 6で追加した`.about-teaser-section`ブロックの直後に追加する:
```css
/* ---- Manner page (dedicated) ---- */
.manner-page-header,
.manner-steps-section,
.manner-rules-section,
.manner-faq-section {
  background-color: #f0ece4;
}

.manner-page-header .section__title,
.manner-steps-section .section__title,
.manner-rules-section .section__title,
.manner-faq-section .section__title {
  color: rgba(72, 146, 155, 0.65);
  -webkit-text-stroke: 1.5px var(--color-charcoal);
}

.manner-page-header .section__body {
  margin-top: var(--space-sm);
}

.step-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.step-card {
  position: relative;
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.06);
}

.step-card[data-seal]::before {
  content: attr(data-seal);
  position: absolute;
  top: -0.7rem;
  right: 1.1rem;
  width: 2.3rem;
  height: 2.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  color: var(--color-cream);
  background: var(--seal);
  border-radius: 7px 7px 7px 0;
  box-shadow: 0 4px 14px rgba(197, 61, 67, 0.35);
}

.step-card__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  color: var(--color-navy);
  margin-bottom: var(--space-xs);
}

.step-card__body {
  font-size: var(--text-sm);
  color: var(--color-charcoal);
  line-height: 1.7;
}

.manner-rules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

.faq-list {
  margin-top: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.faq-item {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(44, 40, 40, 0.10);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
}

.faq-item__question {
  font-family: var(--font-display);
  font-size: var(--text-base);
  color: var(--color-navy);
  cursor: pointer;
  list-style: none;
}

.faq-item__question::-webkit-details-marker {
  display: none;
}

.faq-item__question::before {
  content: "＋";
  display: inline-block;
  margin-right: 0.6rem;
  color: var(--color-teal);
}

.faq-item[open] .faq-item__question::before {
  content: "－";
}

.faq-item__answer {
  font-size: var(--text-sm);
  color: rgba(44, 40, 40, 0.75);
  line-height: 1.8;
  margin-top: var(--space-sm);
}

@media (max-width: 900px) {
  .step-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .manner-rules-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .step-grid,
  .manner-rules-grid {
    grid-template-columns: 1fr;
  }
}
```

`.manner-page-header`, `.manner-steps-section`, `.manner-rules-section`, `.manner-faq-section`をfrosted-glassセレクタリスト3箇所に追加する(これまでのタスクで追加してきた同じ3箇所に続けて追加する)。

- [ ] **Step 6: ビルド確認**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 7: ブラウザ確認**

`npm run dev`で「マナー」タブを開き、導入文→六ステップ(壱〜陸の朱印付きカード、3列)→個別ルール6枚→Q&A(クリックで開閉するアコーディオン)の順に表示されることを確認する。Q&Aの開閉が正しく動作すること、4言語切り替えで全テキストが切り替わることを確認する。モバイル幅でステップ・ルールが1〜2列になることを確認する。

---

## Task 9: 「アバウト」ページにチームストーリーと拡充メンバー紹介を追加

**Files:**
- Modify: `index.html`
- Modify: `src/animations/scrollAnimations.js`
- Modify: `src/utils/reveal.js`
- Modify: `src/styles/layout.css`
- Modify: `src/i18n/ja.js`, `src/i18n/en.js`, `src/i18n/zh.js`, `src/i18n/ko.js`

**Interfaces:**
- Consumes: Task 2で`team-section`のみになった`page-about`。既存6名の氏名(多田圭佑/大戸拓知/神尾光季/森田優晟/菅原諒/桑原遼太)と役割はそのまま使う。
- Produces: `page-about`は`ストーリー(理念・発足経緯) → チーム(既存6名+一言紹介)`の構成になる。

- [ ] **Step 1: `page-about`の先頭(`team-section`の直前)にストーリーセクションを追加する**

```html
      <section class="section about-story-section" data-temp="0.3">
        <div class="container">
          <div class="section__label" data-i18n="about.story_label">アバウト</div>
          <h1 class="section__title" data-i18n="about.story_title">銭湯から始まる、多文化共生。</h1>
          <p class="section__body" data-i18n="about.story_p1">YU-NITYは、大学のゼミ活動から生まれたプロジェクトチームです。「銭湯」という日本ならではの文化を入り口に、訪日外国人と地域住民が自然に交わる場をつくりたい——そんな想いから活動を始めました。</p>
          <p class="section__body" data-i18n="about.story_p2">調査やインタビューを重ねる中で見えてきたのは、外国人観光客の多くが銭湯に関心を持ちながらも、マナーへの不安や情報不足から一歩を踏み出せずにいるという現実でした。</p>
          <p class="section__body" data-i18n="about.story_p3">私たちは、銭湯とその魅力を正しく伝えることで、この「見えない壁」を少しずつ取り払っていきたいと考えています。</p>
        </div>
      </section>
```

- [ ] **Step 2: 既存の`team-section`内、各`team-card__info`に一言自己紹介(`team-card__bio`)を追加する**

`team-section`内の`team-grid`を以下に置き換える(既存の氏名・役割・画像URLはそのまま、各カードに`<p class="team-card__bio">`を追加する):

```html
          <div class="team-grid">
            <div class="team-card">
              <div class="team-card__photo"><img src="https://randomuser.me/api/portraits/men/32.jpg" alt="多田圭佑" /></div>
              <div class="team-card__info">
                <h3 class="team-card__name">多田 圭佑</h3>
                <p class="team-card__role">代表</p>
                <p class="team-card__bio" data-i18n="about.member1_bio">チーム全体を見渡しながら、銭湯の魅力を伝える最善の形を探っています。</p>
              </div>
            </div>
            <div class="team-card">
              <div class="team-card__photo"><img src="https://randomuser.me/api/portraits/men/45.jpg" alt="大戸拓知" /></div>
              <div class="team-card__info">
                <h3 class="team-card__name">大戸 拓知</h3>
                <p class="team-card__role">企画・運営</p>
                <p class="team-card__bio" data-i18n="about.member2_bio">銭湯とゲストをつなぐ企画づくりが得意分野です。</p>
              </div>
            </div>
            <div class="team-card">
              <div class="team-card__photo"><img src="https://randomuser.me/api/portraits/men/28.jpg" alt="神尾光季" /></div>
              <div class="team-card__info">
                <h3 class="team-card__name">神尾 光季</h3>
                <p class="team-card__role">リサーチ</p>
                <p class="team-card__bio" data-i18n="about.member3_bio">文献調査とインタビューから、リアルな声を拾い上げます。</p>
              </div>
            </div>
            <div class="team-card">
              <div class="team-card__photo"><img src="https://randomuser.me/api/portraits/men/55.jpg" alt="森田優晟" /></div>
              <div class="team-card__info">
                <h3 class="team-card__name">森田 優晟</h3>
                <p class="team-card__role">デザイン</p>
                <p class="team-card__bio" data-i18n="about.member4_bio">銭湯の温かさが伝わるビジュアルづくりを担当しています。</p>
              </div>
            </div>
            <div class="team-card">
              <div class="team-card__photo"><img src="https://randomuser.me/api/portraits/men/41.jpg" alt="菅原諒" /></div>
              <div class="team-card__info">
                <h3 class="team-card__name">菅原 諒</h3>
                <p class="team-card__role">広報</p>
                <p class="team-card__bio" data-i18n="about.member5_bio">SNSやイベントを通じて、YU-NITYの活動を発信しています。</p>
              </div>
            </div>
            <div class="team-card">
              <div class="team-card__photo"><img src="https://randomuser.me/api/portraits/men/67.jpg" alt="桑原遼太" /></div>
              <div class="team-card__info">
                <h3 class="team-card__name">桑原 遼太</h3>
                <p class="team-card__role">イベント運営</p>
                <p class="team-card__bio" data-i18n="about.member6_bio">現場での交流イベントを、楽しく安全に運営します。</p>
              </div>
            </div>
          </div>
```

- [ ] **Step 3: i18nキーを追加する(4ファイル共通、新規キーを既存`about`名前空間に追記)**

`src/i18n/ja.js`の`about`名前空間(Task 6で追加済み)に以下を追記する:
```js
    story_label: "アバウト",
    story_title: "銭湯から始まる、多文化共生。",
    story_p1: "YU-NITYは、大学のゼミ活動から生まれたプロジェクトチームです。「銭湯」という日本ならではの文化を入り口に、訪日外国人と地域住民が自然に交わる場をつくりたい——そんな想いから活動を始めました。",
    story_p2: "調査やインタビューを重ねる中で見えてきたのは、外国人観光客の多くが銭湯に関心を持ちながらも、マナーへの不安や情報不足から一歩を踏み出せずにいるという現実でした。",
    story_p3: "私たちは、銭湯とその魅力を正しく伝えることで、この「見えない壁」を少しずつ取り払っていきたいと考えています。",
    member1_bio: "チーム全体を見渡しながら、銭湯の魅力を伝える最善の形を探っています。",
    member2_bio: "銭湯とゲストをつなぐ企画づくりが得意分野です。",
    member3_bio: "文献調査とインタビューから、リアルな声を拾い上げます。",
    member4_bio: "銭湯の温かさが伝わるビジュアルづくりを担当しています。",
    member5_bio: "SNSやイベントを通じて、YU-NITYの活動を発信しています。",
    member6_bio: "現場での交流イベントを、楽しく安全に運営します。",
```

`src/i18n/en.js`の`about`名前空間に追記:
```js
    story_label: "About",
    story_title: "Multicultural exchange starts at the sento.",
    story_p1: "YU-NITY began as a university seminar project. We wanted to use Japan's uniquely local sento culture as a doorway for foreign visitors and local residents to meet naturally — and that's where our activities started.",
    story_p2: "Through research and interviews, we learned that many foreign visitors are genuinely curious about sento but hesitate to take the first step, held back by uncertainty about etiquette and a lack of information.",
    story_p3: "By sharing sento culture accurately and warmly, we hope to gradually take down that invisible wall.",
    member1_bio: "I keep an eye on the whole team while we figure out the best way to share what makes sento special.",
    member2_bio: "Planning the programs that connect sento with visitors is where I do my best work.",
    member3_bio: "I dig through research and interviews to surface what people really think and feel.",
    member4_bio: "I handle the visuals that carry the warmth of the sento experience.",
    member5_bio: "I share YU-NITY's activities through social media and events.",
    member6_bio: "I run our on-site exchange events — safely, and with plenty of fun.",
```

`src/i18n/zh.js`の`about`名前空間に追記:
```js
    story_label: "关于我们",
    story_title: "从钱汤开始的多元文化共生。",
    story_p1: "YU-NITY源自大学的研讨课项目。我们希望以「钱汤」这一日本独有的文化作为入口，让外国游客与当地居民自然地相遇——这正是我们活动的起点。",
    story_p2: "在调研与访谈中我们发现，许多外国游客其实对钱汤抱有兴趣，却因为对礼仪的不安和信息不足而迟迟无法迈出第一步。",
    story_p3: "我们希望通过准确、真诚地传递钱汤文化，一点点拆除这堵「看不见的墙」。",
    member1_bio: "统筹团队整体，摸索传递钱汤魅力的最佳方式。",
    member2_bio: "擅长策划连接钱汤与访客的活动企划。",
    member3_bio: "通过文献调查与访谈，收集最真实的声音。",
    member4_bio: "负责传达钱汤温度的视觉设计工作。",
    member5_bio: "通过社交媒体与活动发布YU-NITY的动态。",
    member6_bio: "负责现场交流活动的运营，兼顾趣味与安全。",
```

`src/i18n/ko.js`の`about`名前空間に追記:
```js
    story_label: "소개",
    story_title: "센토에서 시작되는 다문화 공생.",
    story_p1: "YU-NITY는 대학 세미나 활동에서 시작된 프로젝트 팀입니다. '센토'라는 일본 고유의 문화를 입구 삼아 외국인 관광객과 지역 주민이 자연스럽게 어우러지는 장을 만들고 싶다는 마음에서 활동을 시작했습니다.",
    story_p2: "조사와 인터뷰를 거듭하며 알게 된 것은, 많은 외국인 관광객이 센토에 관심이 있으면서도 매너에 대한 불안과 정보 부족으로 선뜻 발걸음을 옮기지 못한다는 현실이었습니다.",
    story_p3: "저희는 센토와 그 매력을 올바르게 전함으로써 이 '보이지 않는 벽'을 조금씩 허물어가고 싶습니다.",
    member1_bio: "팀 전체를 살피며 센토의 매력을 전할 최선의 방법을 고민합니다.",
    member2_bio: "센토와 방문객을 잇는 기획이 제 전문 분야입니다.",
    member3_bio: "문헌 조사와 인터뷰를 통해 생생한 목소리를 모읍니다.",
    member4_bio: "센토의 따뜻함이 전해지는 비주얼 작업을 담당합니다.",
    member5_bio: "SNS와 이벤트를 통해 YU-NITY의 활동을 알립니다.",
    member6_bio: "현장 교류 이벤트를 즐겁고 안전하게 운영합니다.",
```

- [ ] **Step 4: `scrollAnimations.js`にストーリーセクションの登録を追加する**

`initScrollAnimations()`内、Team登録ブロック(`register(document.querySelector(".team-section > .container"), ...)`以下3行)の直前に追加する:
```js
  // ── About story (dedicated page) ────────────────────
  registerAll(".about-story-section .section__label", { y: 20 });
  registerAll(".about-story-section .section__title", { y: 28 });
  registerAll(".about-story-section .section__body",  { y: 20 }, 0.08);

```
(`team-card__bio`は既存の`.team-card`登録に含まれるため、個別の登録は不要。)

- [ ] **Step 5: `reveal.js`にセレクタを追加する**

`// Team`ブロックの直前に追加する:
```js
  // About story (dedicated page)
  ".about-story-section .section__label",
  ".about-story-section .section__title",
  ".about-story-section .section__body",
```

- [ ] **Step 6: CSSを追加する**

`src/styles/layout.css`のTask 8で追加した`.manner-faq-section`関連ブロックの直後に追加する:
```css
/* ---- About page (dedicated) ---- */
.about-story-section {
  background-color: #f0ece4;
}

.about-story-section .section__title {
  color: rgba(72, 146, 155, 0.65);
  -webkit-text-stroke: 1.5px var(--color-charcoal);
}

.about-story-section .section__body {
  margin-bottom: var(--space-md);
}

.about-story-section .section__body:last-child {
  margin-bottom: 0;
}

.team-card__bio {
  font-size: var(--text-xs);
  color: rgba(44, 40, 40, 0.65);
  line-height: 1.6;
  margin-top: 0.4rem;
}
```

`.about-story-section`をfrosted-glassセレクタリスト3箇所に追加する(これまでのタスクで追加してきた同じ3箇所に続けて追加する)。

- [ ] **Step 7: ビルド確認**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 8: ブラウザ確認**

`npm run dev`で「アバウト」タブを開き、チームストーリー(3段落)→チームメンバー6名(各カードに一言紹介付き)の順に表示されることを確認する。4言語切り替えで全テキストが切り替わることを確認する。

---

## Task 10: 最終統合確認

**Files:** なし(検証のみ、コード変更はしない)

**Interfaces:**
- Consumes: Task 1〜9で完成した全ファイル。

- [ ] **Step 1: ビルド確認**

Run: `cd /Users/takunori/Development/YU-NITY && npm run build`
Expected: エラー・警告なく`dist/`が生成される。

- [ ] **Step 2: 削除し忘れた古い参照が残っていないかgrepで確認する**

Run:
```bash
cd /Users/takunori/Development/YU-NITY
grep -rn "page-guide\|page-access\|page-blog" index.html src/ ; echo "exit:$?"
grep -rn "blog-section\|blog-preview\|blog-card\|blog-grid" index.html src/ ; echo "exit:$?"
grep -rn "problem-section\|solution-section\|solution-card\|counter-card" index.html src/ ; echo "exit:$?"
grep -rn "gallery-track\|gallery-item\"\|initGallery" index.html src/ ; echo "exit:$?"
```
Expected: 4つの`grep`すべてが該当なし(`exit:1`、出力なし)であること。もし何か出力されたら、該当タスクに戻って消し忘れを修正する。

- [ ] **Step 3: 4言語のi18nキー構成が一致しているか確認する**

Run:
```bash
cd /Users/takunori/Development/YU-NITY
for f in en zh ko; do
  echo "--- ja vs $f ---"
  diff <(grep -oE '^\s+[a-zA-Z0-9_]+:' src/i18n/ja.js | tr -d ' :') <(grep -oE '^\s+[a-zA-Z0-9_]+:' src/i18n/$f.js | tr -d ' :')
done
```
Expected: 3つの`diff`すべてが差分なし(無出力)であること。差分が出た場合、キーが漏れている言語ファイルに該当タスクの翻訳を追記する。

- [ ] **Step 4: ブラウザで全体を通し確認する(`/verify`スキルまたはPlaywright MCPを使用)**

`npm run dev`でローカルサーバーを起動し、ブラウザで以下を確認する:
1. 初回アクセス時に言語選択オーバーレイが出る→日本語を選ぶとホームが表示される
2. ナビの4タブ(ホーム/銭湯紹介/マナー/アバウト)をすべてクリックし、各ページが正しく表示され、コンソールエラーが出ないこと
3. ホームページの並びが「Hero→Gallery(グリッド)→銭湯紹介→マナー→アンケート→アバウト」であること
4. 言語切り替え(JA/EN/ZH/KO)を行い、すべての新規セクションのテキストが揺れなく切り替わること(未翻訳キーが英語のまま残るなどがないこと)
5. OSまたはブラウザの「アニメーションを減らす設定」を有効にして再読み込みし、すべてのセクションが省略されずに表示されること
6. ブラウザ幅を375pxにリサイズし、ギャラリーグリッド・マナーのステップ/ルールグリッド・特徴紹介行が読みやすく縦積みになること
7. マナーページのFAQアコーディオンが開閉すること

Expected: 上記すべてが問題なく動作する。問題があれば該当タスクに戻って修正する。

- [ ] **Step 5: 完了報告**

すべてのタスクが完了し、Step 1〜4の検証がすべて通過したら、本計画は完了。gitリポジトリではないためコミットは行わない。ユーザーに実施内容と、保留事項(Googleマップ埋め込みURL・大黒湯の正確な住所や営業時間・実写真素材)を報告する。
