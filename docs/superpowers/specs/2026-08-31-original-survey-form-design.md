# オリジナル・アンケートフォーム — 設計書

- 日付: 2026-08-31
- 対象リポジトリ: YU-NITY（Vite + バニラJS の静的タブSPA）
- ステータス: 設計確定（実装計画待ち）

## 1. 目的

訪日外国人の「銭湯体験」アンケートを、外部 Google フォームではなく **サイトに組み込んだ自作フォーム**として提供する。回答は送信ごとに **Google スプレッドシートへ1行自動追記**され、そのまま Excel として扱える。

出典コンテンツ: `Sento Experience Survey (Multilingual)` PDF（全4ページ／10問／英・仏・中・韓）。

## 2. ゴール / 非ゴール

### ゴール
1. サイト全体を **フランス語（`fr`）にも対応**（既存の 日・英・中・韓 に追加）。
2. **初回訪問時に言語選択ゲート**を表示（5言語）。選択は記憶し、以降はヘッダートグルで変更。
3. PDF の全10問を **4ステップのマルチステップ・ウィザード**として実装。5言語（日英仏中韓）。
4. 送信データを Google Apps Script Web アプリ経由で **Google スプレッドシートへ1行追記**。
5. ホームの「回答する」導線を、外部URLから新タブ「アンケート」に差し替え。

### 非ゴール
- チームメンバーの顔写真（別件、据え置き）。
- 回答の管理画面・集計ダッシュボード（スプレッドシート標準機能で足りる）。
- ログイン／個人特定（匿名収集）。
- French 以外の新規言語。
- サーバーレス関数やデータベース（静的サイトのまま）。

## 3. 全体アーキテクチャ

```
[ブラウザ / 静的サイト]
  言語ゲート ──▶ setLanguage(lang) ──▶ localStorage['yunity-lang']
  ナビ「アンケート」タブ ──▶ #page-survey（ウィザード）
        │  4ステップ入力・ステップ単位バリデーション・下書きを localStorage 保存
        ▼ 送信
  submit.js: fetch(APPS_SCRIPT_URL, POST, Content-Type: text/plain, body=JSON)
        │
        ▼
[Google Apps Script Web アプリ]  doPost(e)
        │  JSON パース → ハニーポット判定 → ヘッダ行が無ければ作成 → 1行 append
        ▼
[Google スプレッドシート]  1送信 = 1行（= Excel）
```

- 送信は `Content-Type: text/plain;charset=utf-8` にして **CORS プリフォールトを回避**（"simple request"）。
- レスポンス本文はクロスオリジンで読めない前提。**fetch が reject しなければ成功**として扱い、サンクス画面へ。ネットワークエラー時のみインライン再試行。
- Apps Script URL は秘密情報ではない（公開フォームの送信先）。`src/survey/endpoint.js` にコミット可。`import.meta.env.VITE_SURVEY_ENDPOINT` があればそれを優先。

## 4. Phase 1 — フランス語ロケール + 言語ゲート

### 4.1 フランス語ロケール

- **新規 `src/i18n/fr.js`**: `src/i18n/ja.js` と同一のキー構造を完全複製し、全値をフランス語訳。
  対象ネームスペース: `nav` / `home` / `steps` / `sento` / `manner` / `about` / `team` / `footer`（アンケート用の `surveyForm` は 5.7 参照）。
  - キー欠落は禁止（`setLanguage` は `text != null` の場合のみ差し替えるため、欠落すると前言語の文字列が残る）。
- **`src/i18n/index.js`**:
  - `import fr from "./fr.js";` を追加、`translations` に `fr` を登録。
  - `detectDefaultLang()` の分岐に `if (browser.startsWith("fr")) return "fr";` を追加（※ゲート導入後は「候補ハイライト」用途のみ）。
  - `fontMap` に `fr` エントリは追加しない（ラテン字形は既存 `--font-sans` で足りる）。
- **`index.html`**: 2か所の言語トグル（`.lang-switch--drawer` と `.lang-switch--bar`）それぞれに
  `<button class="lang-switch__btn" data-lang-btn="fr">FR</button>` を `en` と `zh` の間に追加。
- 既存 `src/i18n/{ja,en,zh,ko}.js` に **`nav.survey` キー**を追加（5.6 と重複しない位置、`nav` 直下）。

### 4.2 初回訪問の言語ゲート

- **`index.html`**: `<body>` 直下（ヘッダーより前）に静的マークアップを追加、既定 `hidden`:

  ```html
  <div class="lang-gate" id="lang-gate" role="dialog" aria-modal="true"
       aria-label="Choose your language" hidden>
    <div class="lang-gate__card">
      <p class="lang-gate__lead">Choose your language</p>
      <div class="lang-gate__grid">
        <button class="lang-gate__btn" data-lang-choice="ja">日本語</button>
        <button class="lang-gate__btn" data-lang-choice="en">English</button>
        <button class="lang-gate__btn" data-lang-choice="fr">Français</button>
        <button class="lang-gate__btn" data-lang-choice="zh">中文</button>
        <button class="lang-gate__btn" data-lang-choice="ko">한국어</button>
      </div>
    </div>
  </div>
  ```

- **`src/styles/lang-gate.css`（新規）** を `index.html` の `<head>` で読み込む。
  - 全画面・**不透明**オーバーレイ（`position: fixed; inset: 0; z-index: 1000`）。背後の誤操作を防ぐ。
  - 中央カード、5ボタンは縦積み（モバイル）/ 折返しグリッド（デスクトップ）。
  - サイトのトークン（`--paper` 等）を使用。`prefers-color-scheme` は既存方針に合わせる（サイト自体はテーマ切替なしなので固定配色でよい）。
- **`src/i18n/index.js` / `src/main.js`**:
  - 起動時、`localStorage.getItem("yunity-lang")` が有効値なら従来どおり `setLanguage(saved)`、ゲートは出さない。
  - 未設定または不正値なら **ゲートを表示**（`gate.hidden = false`）、`document.body` にスクロールロック用クラス付与、`navigator.language` から推定した言語のボタンに `.is-suggested`（視覚ヒント）。**自動では言語を確定しない**。
  - ゲートのボタン押下で `setLanguage(choice)` → `gate.hidden = true` → スクロールロック解除 → フォーカスを元へ。
  - フォーカストラップ: ゲート表示中は Tab を5ボタン内で循環。Esc は無効（必ず選ばせる）。矢印キーでの移動は任意（実装簡潔さ優先で Tab のみでも可）。
  - 既存のヘッダートグル（`data-lang-btn`）は従来どおり動作し、後からいつでも変更可。ゲートの再表示手段は用意しない（YAGNI）。
- FOUC 対策: オーバーレイが不透明なので背後の（English 既定の）文字がちらついても隠れる。追加の opacity 制御はしない。

## 5. Phase 2 — アンケートウィザード

### 5.1 ナビ / ルーティング

- **`index.html`**: `about` タブの後に5つ目のタブを追加:

  ```html
  <button class="site-nav__tab" data-tab="survey">
    <span class="site-nav__ja" data-i18n="nav.survey">アンケート</span>
    <span class="site-nav__en">SURVEY</span>
  </button>
  ```

- **`src/animations/tabs.js`**: `VALID_TABS` に `"survey"` を追加（`["home","sento","manner","about","survey"]`）。
- **ハッシュ衝突の解消**: 現在ホームに `id="survey"` のティーザー節がある。タブ切替は `#survey` を pushState するため衝突する。
  - ティーザー節を **`id="survey-teaser"`** にリネーム。
  - ヒーローの2次CTA `<a href="#survey">`（`home.hero_cta_secondary`）を **`<button data-tab="survey">`** に変更（`btn` クラスは踏襲）。
  - ティーザー内の「回答する」`<a id="survey-cta" href="#" target="_blank">`（`home.survey_cta`）を **`<button data-tab="survey">`** に変更。`id="survey-cta"` と `target/rel` は撤去。
- **`src/i18n/{ja,en,zh,ko}.js`**: `survey.formUrl` キーを削除（`fr.js` は新規なので最初から持たない）。`src/i18n/index.js` の `setLanguage` 内にある `survey.formUrl` 参照ブロック（`#survey-cta` の href 書き換え）も削除。
- ホームのティーザー文言（`home.survey_eyebrow/title/body/cta`）は残す（入口の見た目として機能）。

### 5.2 ページ構造

`about` ページ節の後、`</main>` 相当の前に:

```html
<div class="page" id="page-survey">
  <section class="survey-form" id="survey-form-root" aria-live="polite"><!-- wizard.js が描画 --></section>
</div>
```

- ウィザードのインタラクティブ部分は `data-reveal` を付けない（常時表示）。
- サイトのタイポグラフィ／余白トークン、`btn` 系ボタンクラスを流用し、ネイティブな見た目にする。

### 5.3 設問スキーマ `src/survey/questions.js`

各設問は安定した英語キーを持つ。型: `country` / `single` / `multi` / `scale5` / `longtext`。

| key | section | type | required | option keys |
|---|---|---|---|---|
| `q1_nationality` | 01 | country | ✓ | —（ISO 3166-1 alpha-2） |
| `q2_visited_before` | 01 | single | ✓ | `first_time`, `visited_before` |
| `q3_familiarity` | 02 | single | ✓ | `knew_a_lot`, `knew_a_little`, `heard_only`, `did_not_know` |
| `q4_hesitation` | 02 | single | ✓ | `a_lot`, `some`, `not_much`, `none` |
| `q5_concerns` | 02 | multi | ✓（1つ以上） | `naked`, `etiquette`, `language`, `with_others`, `tattoos`, `other`, `none` |
| `q6_explanation_helped` | 03 | scale5 | ✓ | 1–5 |
| `q7_understanding_deepened` | 03 | scale5 | ✓ | 1–5 |
| `q8_impression_change` | 03 | single | ✓ | `much_more_positive`, `somewhat_more_positive`, `no_change`, `more_negative` |
| `q9_felt_closer` | 03 | scale5 | ✓ | 1–5 |
| `q10_free_comment` | 04 | longtext | ✗（任意） | — |

- `q5_concerns` の `none` は**排他**（選ぶと他が外れる／他を選ぶと `none` が外れる）。
- `q5_concerns` の `other` は **チェックのみ**（記入欄なし）。
- ステップ = セクション: Step1=01（Q1–Q2）, Step2=02（Q3–Q5）, Step3=03（Q6–Q9）, Step4=04（Q10 + 同意文 + 送信）。

### 5.4 国籍フィールド `src/survey/countries.js`

- ISO 3166-1 alpha-2 コードの静的配列のみを保持（約250）。
- 表示名は描画時に `new Intl.DisplayNames([uiLang], { type: "region" }).of(code)` で生成（データファイル不要、対象ブラウザすべて対応）。
- UI: 検索可能なセレクト（`<input>` + フィルタ済み `<ul>`、もしくはネイティブ `<select>` + 先頭に空 option）。実装簡潔さを優先し、まずはネイティブ `<select>`（名前はロケール順にソート）で可。
- 保存値: `q1_nationality_code`（例 `"FR"`）と `q1_nationality`（**常に英語名**、`Intl.DisplayNames(["en"], …)` で導出）。

### 5.5 ウィザード `src/survey/wizard.js`

- 状態: `{ step: 1..4, answers: {}, status: "editing"|"submitting"|"done"|"error" }`。
- 描画: 現在ステップのセクション見出し＋設問群、進捗インジケータ（`Step X / 4` とバー）、`戻る`／`次へ`（Step4 は `送信`）。
- バリデーション: `次へ`／`送信` 押下時に当該ステップの必須を検証。未回答があれば進めず、最初の不備へスクロール＋メッセージ表示。
- 下書き: `answers` を変更のたび `localStorage['yunity-survey-draft']`（JSON）に保存。マウント時に復元。送信成功で削除。
- 送信フロー:
  1. `status = "submitting"`、送信ボタン無効化（多重送信ガード）。
  2. `submit.js` を呼ぶ。
  3. 解決 → `status = "done"`、下書き削除、**サンクス画面**（`surveyForm.thanks` ＋ ホームへ戻るボタン `data-tab="home"`）。
  4. reject → `status = "error"`、インラインのエラー文（`surveyForm.error_generic`）＋ `再試行` ボタン（`answers` は保持）。
- 言語切替: ウィザード表示中にヘッダートグルで言語を変えたら、`setLanguage` 後に再描画（`answers` は保持、キーは言語非依存のため無変換）。

### 5.6 送信 `src/survey/submit.js` / エンドポイント `src/survey/endpoint.js`

```js
// endpoint.js
export const SURVEY_ENDPOINT =
  import.meta.env.VITE_SURVEY_ENDPOINT ||
  "https://script.google.com/macros/s/XXXXX/exec"; // Phase 3 で確定
```

```js
// submit.js
export async function submitSurvey(payload) {
  const res = await fetch(SURVEY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });
  // レスポンス本文は読めないことがある。reject しなければ成功扱い。
  return res;
}
```

送信ペイロード（client → Apps Script）:

```json
{
  "language": "en",
  "_hp": "",
  "answers": {
    "q1_nationality_code": "FR",
    "q1_nationality": "France",
    "q2_visited_before": "first_time",
    "q3_familiarity": "knew_a_little",
    "q4_hesitation": "some",
    "q5_concerns": ["naked", "language"],
    "q6_explanation_helped": 4,
    "q7_understanding_deepened": 5,
    "q8_impression_change": "much_more_positive",
    "q9_felt_closer": 4,
    "q10_free_comment": "..."
  },
  "meta": { "userAgent": "...", "startedAt": "ISO8601", "submittedAt": "ISO8601" }
}
```

- `_hp` はハニーポット（画面外の隠しテキスト入力、`autocomplete="off"`、`tabindex="-1"`、`aria-hidden`）。人間は空のまま。

### 5.7 アンケート i18n `src/i18n/survey/{ja,en,fr,zh,ko}.js`

- 各ファイルは `surveyForm` ネームスペース1つを default export。
- `src/i18n/index.js` の `translations` 構築時に各言語へマージ（`translations.en.surveyForm = surveyEn` 等）。
- **英・仏・中・韓は PDF の訳文をそのまま採用**（PDF p.1–4）。**日本語は本設計書 付録Aの訳**を採用。
- 収録キー:
  - `intro`（PDF冒頭の注意書き）
  - `section.s1`..`section.s4`（セクション見出し）
  - `q.<key>.label`（設問文）
  - `q.<key>.opt.<optKey>`（選択肢ラベル）
  - `scale.low` / `scale.high`（5段階の両端注記: 1=… / 5=…）
  - `nationality.placeholder` / `nationality.search`
  - `consent`（同意文）
  - `ui.back` / `ui.next` / `ui.submit` / `ui.step`（"Step {n} / 4"）/ `ui.required` / `ui.pick_one_plus` / `ui.retry`
  - `thanks.title` / `thanks.body` / `thanks.home`
  - `error_generic`

### 5.8 スタイル `src/styles/survey.css`

- `<head>` で読み込み。ウィザードのレイアウト（ステップ、進捗バー、ラジオ/チェックのカード型、5段階ボタン、`<select>`、サンクス画面）。
- 既存コンポーネント（`.btn`, `.eyebrow`, `.section-title`, `.body-text`, `.container`）とトークンを流用。

### 5.9 `src/main.js` 追加

- `initI18n()` → `initTabs()` の後に `initSurvey({ rootId: "survey-form-root" })` を呼ぶ。
- 言語ゲートの初期化は i18n 初期化の一部として実行（4.2）。

## 6. Phase 3 — Google Apps Script + スプレッドシート

### 6.1 スプレッドシート列（Apps Script が生成。ヘッダは初回自動）

```
timestamp | language | q1_nationality_code | q1_nationality | q2_visited_before |
q3_familiarity | q4_hesitation | q5_concerns | q6_explanation_helped |
q7_understanding_deepened | q8_impression_change | q9_felt_closer |
q10_free_comment | user_agent
```

- `q5_concerns` は `;` 連結（例 `naked;language`）。
- 値は**英語安定キー**（翻訳ラベルではない）。回答言語に依存せず集計可能。
- `timestamp` は Apps Script 側 `new Date()`（スプレッドシートのタイムゾーン）。

### 6.2 `docs/survey-apps-script.gs`

```js
const SHEET_NAME = 'responses';
const HEADERS = [
  'timestamp','language','q1_nationality_code','q1_nationality','q2_visited_before',
  'q3_familiarity','q4_hesitation','q5_concerns','q6_explanation_helped',
  'q7_understanding_deepened','q8_impression_change','q9_felt_closer',
  'q10_free_comment','user_agent'
];

function doGet() {
  return json_({ ok: true, service: 'yu-nity-survey' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body._hp) return json_({ ok: true, skipped: true }); // ハニーポット
    const a = body.answers || {};
    const sheet = getSheet_();
    const row = [
      new Date(),
      body.language || '',
      a.q1_nationality_code || '',
      a.q1_nationality || '',
      a.q2_visited_before || '',
      a.q3_familiarity || '',
      a.q4_hesitation || '',
      Array.isArray(a.q5_concerns) ? a.q5_concerns.join(';') : (a.q5_concerns || ''),
      a.q6_explanation_helped || '',
      a.q7_understanding_deepened || '',
      a.q8_impression_change || '',
      a.q9_felt_closer || '',
      a.q10_free_comment || '',
      (body.meta && body.meta.userAgent) || ''
    ];
    sheet.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 6.3 `docs/survey-setup.md`（手順）

1. Google ドライブで新規スプレッドシート「YU-NITY Survey Responses」を作成。
2. 拡張機能 → Apps Script。`Code.gs` に `docs/survey-apps-script.gs` の内容を貼り付けて保存。
3. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」。実行するユーザー = **自分**、アクセスできるユーザー = **全員**。デプロイ。
4. 発行された `https://script.google.com/macros/s/…/exec` をコピー。
5. `src/survey/endpoint.js` の URL を差し替え（または `.env` に `VITE_SURVEY_ENDPOINT=…`）。
6. ブラウザでフォームを1回送信し、`responses` シートに行が増えることを確認。
7. Excel 化: スプレッドシートを開いたまま Excel で扱えるほか、ファイル → ダウンロード → Microsoft Excel (.xlsx)。

## 7. エラーハンドリング

| ケース | 挙動 |
|---|---|
| 送信のネットワークエラー（fetch reject） | インラインのエラー文＋`再試行`。回答は state と下書きに保持 |
| Apps Script が非2xx | 本文をクロスオリジンで読めないため成功扱いになりうる（許容）。監視は Apps Script 実行ログ側 |
| 多重送信 | 送信ボタン無効化＋`status` ガード。強制再試行での重複行は許容 |
| ステップ内の未回答 | `次へ`/`送信` をブロック、最初の不備へスクロール＋メッセージ |
| 下書き破損（JSON parse 失敗） | 無視して空状態から開始 |
| `Intl.DisplayNames` 非対応（極端に古い環境） | 国名はコード表示にフォールバック。ゲートと送信は影響なし |

## 8. テスト方針

リポジトリにテストランナーなし → **Playwright（プロジェクト標準）で検証**。ローカル `vite` に対して:

1. **言語ゲート**: `localStorage` クリア → 初回訪問でゲート表示。言語選択後は非表示・記憶され、リロードで再表示されない。
2. **フランス語**: `fr` 選択で nav ＋ 1ページ分（例: sento）の主要文字列がフランス語になる。キー欠落なし（`data-i18n` 要素に空/前言語残りがない）。
3. **ウィザード全問**: 5言語それぞれで Step1→4 を完走。必須バリデーション（未選択で `次へ` 不可）、`q5_concerns` の `none` 排他、`q10` 任意。
4. **送信ペイロード**: `window.fetch` をスタブして本文JSONを捕捉し、付録Bのスキーマと一致することをアサート。`_hp` 空。
5. **サンクス／エラー**: スタブ解決でサンクス画面、reject で再試行UI（回答保持）。
6. **下書き**: 途中離脱→リロードで復元、送信成功で `yunity-survey-draft` が消える。
7. **導線**: ヒーロー2次CTA／ティーザーCTA が `#survey` タブを開く。旧 `#survey` アンカーの衝突がない。
8. 手動: Phase 3 配線後、実スプレッドシートへ1回実送信。

## 9. リスク / 前提

- **フランス語訳は LLM 生成**。ローンチ前に主要コピー（ヒーロー、CTA、同意文）のネイティブ確認を推奨。
- 日本語のアンケート訳（付録A）も同様に確認推奨。
- **ホスティング先未確認**。静的ビルドのままを前提。Apps Script URL はどのオリジンからでも動作。ビルド時に `VITE_SURVEY_ENDPOINT` を渡せない環境なら `endpoint.js` の直書きで運用。
- スプレッドシートの Apps Script は**同時大量送信に弱い**（appendRow のロック）。想定トラフィック（イベント時に数十〜数百）なら問題なし。必要なら `LockService` を後日追加。
- スパム対策はハニーポットのみ（軽量）。増える場合は所要時間チェックや Turnstile を後日検討。
- 実装状況（2026-08-31）: French ロケール・言語ゲート・アンケートウィザード（日英仏中韓）・Apps Script/スプレッドシート手順まで実装済み。French コピーはネイティブ確認が未実施（`src/i18n/fr.js` に `// NATIVE-CHECK` マーカー）。survey のフランス語コピー（`src/i18n/survey/fr.js`）と日本語訳もネイティブ確認が必要だが、マーカーは未設置。
- `src/survey/endpoint.js` は placeholder URL（`REPLACE_WITH_DEPLOYMENT_ID`）のまま。`docs/survey-setup.md` を実施し実 URL を設定して実送信を1回確認するまで、本番の回答は保存されない。

## 10. 変更ファイル一覧

### 新規
- `src/i18n/fr.js`
- `src/i18n/survey/ja.js` `en.js` `fr.js` `zh.js` `ko.js`
- `src/survey/questions.js` `countries.js` `wizard.js` `submit.js` `endpoint.js`
- `src/styles/lang-gate.css` `src/styles/survey.css`
- `docs/survey-apps-script.gs` `docs/survey-setup.md`

### 変更
- `index.html` — FRボタン×2、言語ゲート、`nav.survey` タブ、`#page-survey`、ヒーロー/ティーザーCTAを `data-tab="survey"` 化、ティーザー `id` 変更、`survey.css`/`lang-gate.css` の `<link>`
- `src/i18n/index.js` — `fr` 登録、`surveyForm` マージ、`survey.formUrl` 参照削除、初回ゲート分岐
- `src/i18n/ja.js` `en.js` `zh.js` `ko.js` — `nav.survey` 追加、`survey.formUrl` 削除
- `src/animations/tabs.js` — `VALID_TABS` に `"survey"`
- `src/main.js` — 言語ゲート初期化、`initSurvey()`

---

## 付録A — 日本語訳（アンケート）

- イントロ: 特に指定がない場合は1つだけ選んでください。正解・不正解はありません。
- セクション: `01 基本情報` / `02 体験前` / `03 体験後` / `04 最後に`
- 5段階の両端: `1 = まったくそう思わない` / `5 = とてもそう思う`
- 同意文: いただいた回答は匿名で集計し、YU-NITY の活動改善のためだけに使用します。
- サンクス: `ご回答ありがとうございました。` / ホームへ戻る

| key | 設問文（JA） | 選択肢（key: JA） |
|---|---|---|
| q1_nationality | 国籍を教えてください | （国名ドロップダウン） |
| q2_visited_before | これまでに日本の銭湯（公衆浴場）を利用したことがありますか？ | first_time: 今回が初めて / visited_before: 以前に利用したことがある |
| q3_familiarity | 今回の体験の前から、日本文化のひとつとして銭湯を知っていましたか？ | knew_a_lot: よく知っていた / knew_a_little: 少し知っていた / heard_only: 名前を聞いたことがある程度 / did_not_know: 知らなかった |
| q4_hesitation | 銭湯を体験することに、不安やためらいはありましたか？ | a_lot: とてもあった / some: 少しあった / not_much: あまりなかった / none: まったくなかった |
| q5_concerns | どんなことが不安でしたか？【複数選択可】 | naked: 裸になること / etiquette: 入浴の手順やマナー / language: 言葉が分からないこと / with_others: 他の人と一緒に入浴すること / tattoos: タトゥー / other: その他 / none: 特にない |
| q6_explanation_helped | 事前のルール・マナー説明は、安心して銭湯を利用するのに役立ちましたか？【5段階】 | 1–5 |
| q7_understanding_deepened | 銭湯を体験して、日本の文化や習慣への理解が深まったと感じますか？【5段階】 | 1–5 |
| q8_impression_change | 体験の前後で、日本の銭湯に対する印象は変わりましたか？ | much_more_positive: とても良くなった / somewhat_more_positive: 少し良くなった / no_change: 変わらなかった / more_negative: 悪くなった |
| q9_felt_closer | 銭湯の体験を通じて、日本の文化や日常生活を身近に感じられましたか？【5段階】 | 1–5 |
| q10_free_comment | 今回の銭湯体験で印象に残ったことや、初めて知った日本文化について自由にお書きください。 | （自由記述・任意） |

英・仏・中・韓の文言は PDF `Sento_Experience_Survey_Multilingual.pdf` p.1–4 の該当行をそのまま使用する。

サンクス文（PDF は英語のみのため他言語は下記を採用）:
- en: Thank you for sharing your experience.
- fr: Merci d'avoir partagé votre expérience.
- zh: 感谢您分享您的体验。
- ko: 소중한 경험을 공유해 주셔서 감사합니다.
- ja: ご回答ありがとうございました。

同意文（PDF になし。全言語で新規）:
- ja: いただいた回答は匿名で集計し、YU-NITY の活動改善のためだけに使用します。
- en: Your responses are collected anonymously and used only to improve the YU-NITY project.
- fr: Vos réponses sont recueillies de façon anonyme et servent uniquement à améliorer le projet YU-NITY.
- zh: 您的回答将以匿名方式收集，仅用于改善 YU-NITY 项目。
- ko: 응답은 익명으로 수집되며 YU-NITY 프로젝트 개선을 위해서만 사용됩니다.

## 付録B — 送信ペイロードのスキーマ（テスト用）

```
language: "ja"|"en"|"fr"|"zh"|"ko"
_hp: ""（常に空。非空なら bot）
answers.q1_nationality_code: /^[A-Z]{2}$/
answers.q1_nationality: string（英語国名）
answers.q2_visited_before: "first_time"|"visited_before"
answers.q3_familiarity: "knew_a_lot"|"knew_a_little"|"heard_only"|"did_not_know"
answers.q4_hesitation: "a_lot"|"some"|"not_much"|"none"
answers.q5_concerns: Array<"naked"|"etiquette"|"language"|"with_others"|"tattoos"|"other"|"none">（1件以上、"none" は排他）
answers.q6_explanation_helped: 1..5
answers.q7_understanding_deepened: 1..5
answers.q8_impression_change: "much_more_positive"|"somewhat_more_positive"|"no_change"|"more_negative"
answers.q9_felt_closer: 1..5
answers.q10_free_comment: string（"" 可）
meta.userAgent: string
meta.startedAt / meta.submittedAt: ISO8601
```
