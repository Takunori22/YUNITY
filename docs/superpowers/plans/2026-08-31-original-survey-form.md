# Original Multilingual Survey Form — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the external Google Form with a built-in 4-step multilingual survey wizard whose responses append one row per submission to a Google Sheet, and add French as a full site language selected through a first-visit language gate.

**Architecture:** Static Vite + vanilla-JS tab SPA. A new `fr` locale mirrors the existing per-language i18n objects; `src/i18n/index.js` shows a full-screen language gate on first visit instead of silently auto-detecting. A new `#page-survey` tab hosts `src/survey/wizard.js`, which renders the 10 questions grouped into 4 steps, validates per step, persists a draft to `localStorage`, and POSTs a JSON payload (`Content-Type: text/plain` to stay a CORS-simple request) to a Google Apps Script Web App. The Apps Script `doPost` appends the answer row to a Sheet.

**Tech Stack:** Vite 8, vanilla ES modules, plain CSS with existing design tokens, `Intl.DisplayNames` for localized country names, Google Apps Script (`ContentService`), Playwright MCP for verification.

**Spec:** `docs/superpowers/specs/2026-08-31-original-survey-form-design.md` — read it alongside this plan.

## Global Constraints

- **No test runner in the repo.** "Write the failing test" here means: write the exact Playwright-MCP steps / `node -e` assertion described in the task, run it, and confirm it fails for the stated reason before implementing. Do not add a test framework.
- **i18n key parity is mandatory.** `setLanguage` only replaces text when `translations[lang]` has the key (`if (text != null)`). Every key present in `src/i18n/ja.js` MUST exist in `src/i18n/fr.js`, and every `surveyForm` key MUST exist in all five survey locale files. A missing key silently leaves another language's text on screen.
- **Languages, in this fixed order everywhere:** `ja`, `en`, `fr`, `zh`, `ko`. Toggle button order: JA, EN, FR, 中文, KO.
- **Preserve existing markup conventions:** localized label spans use `data-i18n="ns.key"`; monospace sub-labels (`RECEPTION`, `HOME`, …) stay hard-coded English in every language.
- **Newlines:** keep `\n` inside any translated value whose Japanese original has one (CSS renders these with `white-space: pre-line`).
- **Proper nouns unchanged in all languages:** `YU-NITY`, `Daikoku-yu`, `Daikoku-yu — Bunkyo Ward, Tokyo`, `SENTO GUIDE — TOKYO`, `© 2025 YU-NITY PROJECT. ALL RIGHTS RESERVED.`
- **Survey answer values stored are stable English keys** (e.g. `knew_a_little`), never translated labels.
- **Commit after every task** with the message shown in the task's final step. Work on `main` (repo convention: all history is direct-to-main).
- **French copy is LLM-authored.** Where a value below is marked `// NATIVE-CHECK`, it still ships, but note it in the final task's summary for a later native pass.

---

## File Structure

### Created
| File | Responsibility |
|---|---|
| `src/i18n/fr.js` | French mirror of `ja.js` (site chrome + pages), `nav.survey` included |
| `src/i18n/survey/ja.js` `en.js` `fr.js` `zh.js` `ko.js` | `surveyForm` namespace per language (questions, options, wizard UI, thanks) |
| `src/survey/questions.js` | The 10-question schema (id, section, type, required, option keys) — pure data |
| `src/survey/countries.js` | ISO 3166-1 alpha-2 code list + `localizedCountryName(code, lang)` / `englishCountryName(code)` |
| `src/survey/endpoint.js` | Exports `SURVEY_ENDPOINT` (env var or committed fallback) |
| `src/survey/submit.js` | `buildPayload(answers, lang, meta)` + `submitSurvey(payload)` |
| `src/survey/wizard.js` | `initSurvey({ rootId })` — render, step state, validation, draft, submit orchestration, thanks/error screens |
| `src/styles/lang-gate.css` | Language-gate overlay styles |
| `src/styles/survey.css` | Wizard styles |
| `docs/survey-apps-script.gs` | The Apps Script `Code.gs` to paste into the Sheet's script editor |
| `docs/survey-setup.md` | Step-by-step: create Sheet, deploy Web App, wire the URL |

### Modified
| File | Change |
|---|---|
| `index.html` | FR toggle button ×2; `#lang-gate` overlay; `nav.survey` tab; `#page-survey`; hero + teaser CTAs → `data-tab="survey"`; teaser `id` → `survey-teaser`; `<link>` the two new CSS files |
| `src/i18n/index.js` | register `fr`; merge `surveyForm`; first-visit gate; drop `survey.formUrl` href block |
| `src/i18n/ja.js` `en.js` `zh.js` `ko.js` | add `nav.survey`; remove `survey.formUrl` |
| `src/animations/tabs.js` | `VALID_TABS` gains `"survey"` |
| `src/main.js` | init language gate; call `initSurvey(...)` |

---

## PHASE 1 — French locale + first-visit language gate

### Task 1: Add the French locale and the FR toggle

**Files:**
- Create: `src/i18n/fr.js`
- Modify: `src/i18n/index.js` (imports + `translations` map + `detectDefaultLang`)
- Modify: `src/i18n/ja.js`, `src/i18n/en.js`, `src/i18n/zh.js`, `src/i18n/ko.js` (add `nav.survey`)
- Modify: `index.html` (FR button in both `.lang-switch` blocks)

**Interfaces:**
- Produces: `src/i18n/fr.js` default export with the SAME shape as `src/i18n/ja.js` **plus** `nav.survey`. `translations.fr` available to `setLanguage`.
- Consumes: nothing from other tasks.

- [ ] **Step 1: Write the failing check**

Create `/tmp/i18n-parity.mjs`:

```js
import ja from "../Users/takunori/Development/YU-NITY/src/i18n/ja.js";
import fr from "../Users/takunori/Development/YU-NITY/src/i18n/fr.js";
const keys = (o, p = "") => Object.entries(o).flatMap(([k, v]) =>
  v && typeof v === "object" ? keys(v, p + k + ".") : [p + k]);
const jaK = new Set(keys(ja)), frK = new Set(keys(fr));
const missing = [...jaK].filter(k => !frK.has(k) && k !== "survey.formUrl");
const extra = [...frK].filter(k => !jaK.has(k) && k !== "nav.survey");
console.log("missing in fr:", missing);
console.log("unexpected extra in fr:", extra);
process.exit(missing.length || extra.length ? 1 : 0);
```

- [ ] **Step 2: Run it, expect failure**

Run: `node /tmp/i18n-parity.mjs`
Expected: FAIL — `Cannot find module .../src/i18n/fr.js`.

- [ ] **Step 3: Create `src/i18n/fr.js`**

```js
// 改行を意図している見出しは \n を入れる。CSS 側で white-space: pre-line。
export default {
  nav: {
    home: "Accueil",
    sento: "Le sento",
    manner: "Étiquette",
    about: "À propos",
    survey: "Enquête",
  },

  home: {
    hero_eyebrow: "SENTO GUIDE — TOKYO",
    hero_title: "L’eau chaude relie le monde.",
    hero_body:
      "Un projet qui favorise la coexistence multiculturelle et les échanges entre visiteurs étrangers et habitants, à travers la culture des sento japonais.",
    hero_note: "A guide to Japanese public bathhouses — written for first-time visitors.",
    hero_cta_primary: "Lire les règles du bain",
    hero_cta_secondary: "Répondre à l’enquête",

    statement: "C’est aux nouveaux venus que\nle sento est le plus ouvert.",

    stat1_value: "6",
    stat1_label: "Étapes du bain",
    stat2_value: "5",
    stat2_label: "Langues disponibles",
    stat3_value: "¥520",
    stat3_label: "Tarif adulte (Tokyo)",
    stat4_value: "15:30–",
    stat4_label: "Ouverture du Daikoku-yu",

    flow_eyebrow: "01 — LE DÉROULEMENT DU BAIN",
    flow_title: "Six étapes",
    flow_body: "De l’accueil à la sortie, suivez l’ordre et vous ne serez jamais perdu.",
    flow_cta: "Voir l’étiquette en détail",

    sento_eyebrow: "02 — LE SENTO DU JOUR",
    sento_title: "Daikoku-yu",
    sento_romaji: "Daikoku-yu — Bunkyo Ward, Tokyo",
    sento_body:
      "Niché dans une ruelle de l’arrondissement de Bunkyo, le Daikoku-yu chauffe son eau depuis des décennies, au plus près de la vie du quartier. Accueillir chacun sans distinction : telle est la fierté qu’il perpétue.",
    sento_cta: "Vers la page du sento",

    survey_eyebrow: "03 — ENQUÊTE / env. 3 min",
    survey_title: "Dites-nous ce que vous en pensez",
    survey_body:
      "Vos avis façonnent les actions de YU-NITY. Merci de participer à notre enquête.",
    survey_cta: "Répondre",

    about_eyebrow: "04 — À PROPOS",
    about_title: "La coexistence multiculturelle\ncommence au sento.",
    about_body:
      "YU-NITY est une équipe de projet étudiante qui relie visiteurs étrangers et habitants à travers la culture des sento. Nos enquêtes et entretiens l’ont montré : beaucoup de touristes s’intéressent aux sento mais n’osent pas franchir le pas, par crainte des règles ou par manque d’informations.",
    about_cta: "Vers la page À propos",
  },

  steps: {
    step1_title: "Accueil",
    step1_mono: "RECEPTION",
    step1_body:
      "Réglez le tarif du bain au comptoir ou à la caisse. Beaucoup d’établissements prêtent serviettes et savon ; en cas de doute, demandez.",
    step2_title: "Vestiaire",
    step2_mono: "CHANGING ROOM",
    step2_body:
      "Pliez soigneusement vos vêtements dans un casier ou sur une étagère. Fermez à clé votre casier pour vos objets de valeur.",
    step3_title: "Espace de lavage",
    step3_mono: "WASHING AREA",
    step3_body:
      "Avant d’entrer dans le bain, asseyez-vous sur un tabouret et rincez tout votre corps. Un simple rinçage à l’eau suffit avant de rejoindre le bassin.",
    step4_title: "Le bain",
    step4_mono: "THE BATH",
    step4_body:
      "Posez votre serviette hors de l’eau et immergez-vous doucement jusqu’aux épaules. On ne nage pas, on ne plonge pas : on se détend.",
    step5_title: "Rinçage final",
    step5_mono: "FINAL RINSE",
    step5_body:
      "En sortant du bain, rincez légèrement la transpiration à l’eau claire. Séchez-vous avant de retourner au vestiaire pour ne pas mouiller le sol.",
    step6_title: "Après le bain",
    step6_mono: "AFTER THE BATH",
    step6_body:
      "Rendez la clé du casier, vérifiez que vous n’oubliez rien, puis sortez. Un verre après le bain fait aussi partie des plaisirs du sento.",
  },

  sento: {
    page_eyebrow: "SENTO — LE SENTO",
    page_title: "Daikoku-yu",
    page_romaji: "Daikoku-yu — Bunkyo Ward, Tokyo",
    lede: "Un bain d’autrefois,\nau creux d’une ruelle de Bunkyo.",
    body1: "Le Daikoku-yu chauffe son eau depuis des décennies, au plus près de la vie du quartier.",
    body2:
      "Les salutations échangées au comptoir, les conversations anodines entre habitués — ici s’écoule un temps chaleureux qui fait oublier l’agitation de la ville. Accueillir chacun sans distinction : telle est la fierté que le Daikoku-yu perpétue.",

    feature1_title: "Une entrée au charme d’autrefois",
    feature1_body:
      "Passé la porte coulissante à claire-voie, un sol de terre battue bordé de casiers à chaussures. Une entrée restée telle qu’à l’époque Shōwa accueille les visiteurs.",
    feature2_title: "L’échange commence au comptoir",
    feature2_body:
      "À l’accueil vous attendent quelques mots avec le patron ou le personnel. Aux nouveaux venus, on explique volontiers le déroulement du bain.",
    feature3_title: "Un plafond haut où s’échappe la vapeur",
    feature3_body:
      "Le plafond de la salle de bain s’ouvre en hauteur, laissant entrer lumière et air par de hautes fenêtres. La vapeur qui monte s’évacue doucement : c’est l’architecture des sento d’autrefois.",

    access_eyebrow: "ACCESS — LIEU",
    access_title: "Accès",
    access_addr_label: "ADRESSE",
    access_addr_value: "〒112-0012 3-8-6 Otsuka, Bunkyo-ku, Tokyo",
    access_hours_label: "HORAIRES",
    access_hours_value: "15:30 — 23:30",
    access_closed_label: "FERMÉ",
    access_closed_value: "Le lundi",
    access_price_label: "TARIF",
    access_price_value: "Adultes ¥600 / Collège ¥500 / Primaire et moins ¥200",
    access_cta: "Ouvrir dans Google Maps",
  },

  manner: {
    page_eyebrow: "MANNER — ÉTIQUETTE",
    page_title: "Bien profiter du bain, tous ensemble.",
    page_intro:
      "Le sento est un lieu où des inconnus partagent la même eau. Quelques attentions suffisent pour que chacun passe un moment agréable.",
    index_title: "Le déroulement du bain",

    rules_eyebrow: "RULES — RÈGLES PARTICULIÈRES",
    rules_title: "Bon à savoir",
    rules_body:
      "Certaines règles varient d’un établissement à l’autre. En cas de doute, le plus sûr est de demander à l’accueil.",
    rule1_title: "À propos des tatouages",
    rule1_body:
      "La politique varie selon les établissements. Beaucoup acceptent les tatouages couverts d’un pansement ; renseignez-vous à l’avance.",
    rule2_title: "Photos et vidéos",
    rule2_body: "Filmer ou photographier au vestiaire et dans la salle de bain est interdit, pour protéger la vie privée des autres clients.",
    rule3_title: "La serviette reste hors du bain",
    rule3_body: "Par hygiène, ne trempez pas votre serviette dans l’eau du bassin.",
    rule4_title: "Ni nage, ni plongeon",
    rule4_body: "Le bassin est un lieu où l’on se détend en silence. Évitez de nager ou d’éclabousser.",
    rule5_title: "Parlez à voix basse",
    rule5_body: "Évitez les conversations bruyantes ; partageons tous un moment calme.",
    rule6_title: "Pas de bain après l’alcool",
    rule6_body: "Se baigner en état d’ébriété peut provoquer un malaise. Attendez d’avoir dessoûlé avant de venir.",

    faq_title: "Idées reçues",
    faq1_q: "Avec un tatouage, l’entrée est-elle vraiment impossible ?",
    faq1_a:
      "La politique varie beaucoup selon les établissements. De nombreux sento acceptent les tatouages couverts d’un pansement ; souvent, on croit à tort que « c’est interdit ». En cas de doute, contactez l’établissement à l’avance.",
    faq2_q: "Est-ce possible sans parler la langue ?",
    faq2_a:
      "Oui. Si vous connaissez les étapes de cette page, vous passerez un bon moment même avec peu d’échanges. En cas de difficulté, le personnel vous expliquera par gestes.",
    faq3_q: "Peut-on se baigner en maillot de bain ?",
    faq3_a:
      "Le maillot de bain n’est pas autorisé au sento. On se baigne nu, c’est la règle de base. Cela peut intimider au début, mais cette « camaraderie du nu » fait partie de la culture des sento.",
  },

  about: {
    page_eyebrow: "ABOUT — À PROPOS",
    page_title: "La coexistence multiculturelle commence au sento.",
    lede: "Faire tomber, peu à peu,\nles murs invisibles.",
    body1:
      "YU-NITY est une équipe de projet née d’un séminaire universitaire. Prendre le « sento », cette culture typiquement japonaise, comme point d’entrée pour créer un lieu où visiteurs étrangers et habitants se rencontrent naturellement — c’est de cette envie qu’est né notre travail.",
    body2:
      "Nos enquêtes et entretiens l’ont montré : beaucoup de touristes s’intéressent aux sento mais n’osent pas franchir le pas, par crainte des règles ou par manque d’informations.",
    body3:
      "En faisant connaître le sento et ses attraits comme il se doit, nous voulons faire tomber peu à peu ce « mur invisible ».",
    team_title: "L’équipe\nYU-NITY",
  },

  // 氏名は全言語で漢字表記のまま。仏語は性別が不明なため、人称・性数一致を避けた名詞句で記述。 // NATIVE-CHECK
  team: {
    member1_bio: "Une vue d’ensemble de l’équipe pour trouver la meilleure façon de faire connaître le sento.",
    member2_bio: "Spécialité : concevoir des projets qui relient le sento et ses visiteurs.",
    member3_bio: "Recueillir des témoignages concrets à partir de recherches documentaires et d’entretiens.",
    member4_bio: "Créer des visuels qui transmettent la chaleur du sento.",
    member5_bio: "Faire connaître les actions de YU-NITY via les réseaux sociaux et les événements.",
    member6_bio: "Organiser les événements d’échange sur le terrain, dans la bonne humeur et en toute sécurité.",
  },

  footer: {
    tagline: "Relier les mondes par le sento",
    copy: "© 2025 YU-NITY PROJECT. ALL RIGHTS RESERVED.",
  },
};
```

- [ ] **Step 4: Add `nav.survey` to the other four locales**

In each of `src/i18n/ja.js`, `en.js`, `zh.js`, `ko.js`, inside the `nav: { … }` object, add one line after `about`:
- `ja.js`: `    survey: "アンケート",`
- `en.js`: `    survey: "Survey",`
- `zh.js`: `    survey: "问卷",`
- `ko.js`: `    survey: "설문",`

- [ ] **Step 5: Register `fr` in `src/i18n/index.js`**

At the top imports add `import fr from "./fr.js";`. Change the map to:

```js
const translations = { ja, en, fr, zh, ko };
```

In `detectDefaultLang()`, add after the `zh` line:

```js
  if (browser.startsWith("fr")) return "fr";
```

Do **not** add an `fr` entry to `fontMap` (French is Latin; the existing `--font-sans` stack covers it).

- [ ] **Step 6: Add the FR toggle button to `index.html`**

In BOTH `.lang-switch` blocks (the `.lang-switch--drawer` inside `#site-nav`, and the `.lang-switch--bar`), insert between the `en` and `zh` buttons:

```html
            <button class="lang-switch__btn" data-lang-btn="fr">FR</button>
```

- [ ] **Step 7: Run the parity check, expect pass**

Run: `node /tmp/i18n-parity.mjs`
Expected: `missing in fr: []` / `unexpected extra in fr: []`, exit 0.

- [ ] **Step 8: Verify in the browser (Playwright MCP)**

Dev server is already running on `http://localhost:5173`. Steps:
1. `navigate` to `http://localhost:5173/#home`.
2. `evaluate`: `localStorage.setItem('yunity-lang','fr'); location.reload()` — wait 800 ms.
3. `evaluate` and assert all are French, non-empty:
   - `document.querySelector('[data-i18n="nav.sento"]').textContent` → `"Le sento"`
   - `document.querySelector('[data-i18n="home.hero_title"]').textContent` → `"L’eau chaude relie le monde."`
   - `document.querySelector('[data-i18n="footer.tagline"]').textContent` → `"Relier les mondes par le sento"`
4. `evaluate`: assert no `[data-i18n]` element is empty and none still shows Japanese —
   `[...document.querySelectorAll('[data-i18n]')].filter(e => !e.textContent.trim() || /[぀-ヿ一-龯]/.test(e.textContent) && !['home.sento_romaji','sento.page_romaji'].includes(e.dataset.i18n))` → length `0`.
5. `read_console_messages` (level error) → no new errors.

Expected: all assertions pass. (Before Step 3–6 this step would fail: `fr` unknown, button absent.)

- [ ] **Step 9: Commit**

```bash
git add src/i18n/fr.js src/i18n/index.js src/i18n/ja.js src/i18n/en.js src/i18n/zh.js src/i18n/ko.js index.html
git commit -m "Add French locale and FR language toggle"
```

---

### Task 2: First-visit language gate

**Files:**
- Create: `src/styles/lang-gate.css`
- Modify: `index.html` (`<link>` in `<head>`; `#lang-gate` overlay markup right after `<body>`)
- Modify: `src/i18n/index.js` (`initI18n` shows the gate when no saved lang; export `isLangChosen`)
- Modify: `src/main.js` (wire gate buttons, scroll lock, focus trap)

**Interfaces:**
- Consumes: `setLanguage(lang)` and `translations` from `src/i18n/index.js` (already exported).
- Produces: `initI18n()` no longer auto-picks a language when `localStorage['yunity-lang']` is unset — it leaves the page on the fallback render and reveals `#lang-gate`. `src/i18n/index.js` gains `export function hasStoredLang()` returning boolean.

- [ ] **Step 1: Write the failing check (Playwright MCP)**

Target behaviour to assert (run after implementation; confirm it currently FAILS because `#lang-gate` does not exist):
1. `navigate` `http://localhost:5173/`, then `evaluate`: `localStorage.clear(); location.reload()` — wait 800 ms.
2. `evaluate`: `!document.getElementById('lang-gate').hidden` → expect `true` (gate visible).
3. `evaluate`: `getComputedStyle(document.body).overflow` → expect `"hidden"` (scroll locked).
4. `evaluate`: click FR — `document.querySelector('#lang-gate [data-lang-choice="fr"]').click()`.
5. `evaluate`: `document.getElementById('lang-gate').hidden` → `true`; `localStorage.getItem('yunity-lang')` → `"fr"`; `document.querySelector('[data-i18n="nav.sento"]').textContent` → `"Le sento"`.
6. `evaluate`: `location.reload()` — wait 800 ms — `document.getElementById('lang-gate').hidden` → `true` (no gate on return).

Before implementation, step 2 throws (`getElementById('lang-gate')` is `null`). That is the expected initial failure.

- [ ] **Step 2: Create `src/styles/lang-gate.css`**

```css
/* 初回訪問の言語選択ゲート */
.lang-gate {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--paper, #efe9df);
}
.lang-gate__card {
  width: 100%;
  max-width: 420px;
  text-align: center;
}
.lang-gate__lead {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(42, 39, 36, 0.55);
  margin: 0 0 24px;
}
.lang-gate__grid {
  display: grid;
  gap: 10px;
}
.lang-gate__btn {
  appearance: none;
  border: 1px solid rgba(42, 39, 36, 0.24);
  background: transparent;
  color: #2a2724;
  font-size: 17px;
  letter-spacing: 0.04em;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.lang-gate__btn:hover,
.lang-gate__btn:focus-visible {
  background: rgba(42, 39, 36, 0.06);
  border-color: rgba(42, 39, 36, 0.5);
  outline: none;
}
.lang-gate__btn.is-suggested {
  border-color: #2a7d7b;
  box-shadow: inset 0 0 0 1px #2a7d7b;
}
@media (min-width: 560px) {
  .lang-gate__grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

- [ ] **Step 3: Add markup + `<link>` to `index.html`**

In `<head>`, after the `animations.css` link:

```html
    <link rel="stylesheet" href="/src/styles/lang-gate.css" />
```

Immediately after `<body>` (before `<header …>`):

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

- [ ] **Step 4: Change `src/i18n/index.js` init behaviour**

Add a stored-lang helper and stop auto-picking on first visit. Replace `initI18n` and add `hasStoredLang`:

```js
export function hasStoredLang() {
  const saved = localStorage.getItem("yunity-lang");
  return !!(saved && translations[saved]);
}

export function initI18n() {
  if (hasStoredLang()) {
    setLanguage(localStorage.getItem("yunity-lang"));
  } else {
    // 言語未確定。フォールバック描画のまま main.js がゲートを開く。
    document.documentElement.lang = "en";
  }

  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.langBtn));
  });
}
```

Keep `detectDefaultLang` exported — it is reused by `main.js` only to pre-highlight a gate button.

- [ ] **Step 5: Wire the gate in `src/main.js`**

Add imports: `import { initI18n, hasStoredLang, setLanguage, detectDefaultLang } from "./i18n/index.js";` (extend the existing import).

After `initI18n();` add:

```js
function initLangGate() {
  const gate = document.getElementById("lang-gate");
  if (!gate || hasStoredLang()) return;

  const suggestion = detectDefaultLang();
  const btns = [...gate.querySelectorAll("[data-lang-choice]")];
  const suggested = btns.find((b) => b.dataset.langChoice === suggestion);
  if (suggested) suggested.classList.add("is-suggested");

  gate.hidden = false;
  document.body.style.overflow = "hidden";
  (suggested || btns[0]).focus();

  function trap(e) {
    if (e.key !== "Tab") return;
    const first = btns[0], last = btns[btns.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  gate.addEventListener("keydown", trap);

  btns.forEach((b) =>
    b.addEventListener("click", () => {
      setLanguage(b.dataset.langChoice);
      gate.hidden = true;
      document.body.style.overflow = "";
      gate.removeEventListener("keydown", trap);
    })
  );
}
initLangGate();
```

- [ ] **Step 6: Run the Step-1 checks, expect pass**

Run the six Playwright-MCP sub-steps from Step 1. Expected: gate visible on cleared storage, scroll locked, choosing FR hides it + sets `yunity-lang=fr` + renders French, reload shows no gate. `read_console_messages` (error) → none new.

- [ ] **Step 7: Commit**

```bash
git add src/styles/lang-gate.css index.html src/i18n/index.js src/main.js
git commit -m "Show a language-selection gate on first visit"
```

---

## PHASE 2 — Survey wizard

### Task 3: Survey tab, route, and CTA rewiring

**Files:**
- Modify: `index.html` (nav tab; `#page-survey` container; hero + teaser CTA; teaser `id`; `<link>` `survey.css`)
- Modify: `src/animations/tabs.js` (`VALID_TABS`)
- Modify: `src/i18n/index.js` (remove the `survey.formUrl` href block)
- Modify: `src/i18n/ja.js`, `en.js`, `fr.js`, `zh.js`, `ko.js` (remove `survey.formUrl`; `fr.js` never had it)
- Create: `src/styles/survey.css` (empty shell with one rule; filled in Task 6)

**Interfaces:**
- Produces: a `<div class="page" id="page-survey">` containing `<div id="survey-form-root">`. Tab id `survey` routes to it. `initSurvey` (Task 6) mounts into `#survey-form-root`.
- Consumes: `nav.survey` from Task 1.

- [ ] **Step 1: Write the failing check (Playwright MCP)**

Assert after implementation (currently FAILS — no such tab):
1. `navigate` `http://localhost:5173/#home` (set `yunity-lang=en` first to skip the gate).
2. `evaluate`: click the nav tab — `document.querySelector('.site-nav__tab[data-tab="survey"]').click()` — wait 600 ms.
3. `evaluate`: `document.querySelector('#page-survey').classList.contains('active')` → `true`; `location.hash` → `"#survey"`.
4. `evaluate`: `document.querySelectorAll('#survey').length` → `0` (old teaser id renamed) and `document.querySelector('#survey-teaser')` is not null.
5. `read_console_messages` (error) → none.

- [ ] **Step 2: `VALID_TABS` in `src/animations/tabs.js`**

```js
const VALID_TABS = ["home", "sento", "manner", "about", "survey"];
```

- [ ] **Step 3: Nav tab in `index.html`**

After the `about` `<button class="site-nav__tab" …>` block (still inside `#site-nav`, before the `.lang-switch--drawer` div):

```html
          <button class="site-nav__tab" data-tab="survey">
            <span class="site-nav__ja" data-i18n="nav.survey">アンケート</span>
            <span class="site-nav__en">SURVEY</span>
          </button>
```

- [ ] **Step 4: `#page-survey` container**

After the closing `</div><!-- /page-about -->` line, add:

```html
    <!-- ============================================================
         PAGE: アンケート
    ============================================================ -->
    <div class="page" id="page-survey">
      <section class="survey-form" id="survey-form-root" aria-live="polite"></section>
    </div>
```

- [ ] **Step 5: Rewire CTAs + rename teaser id in `index.html`**

- The teaser `<section class="survey" id="survey">` → `<section class="survey" id="survey-teaser">`.
- Hero secondary CTA — replace:
  `<a class="btn btn--underline btn--on-dark" href="#survey" data-i18n="home.hero_cta_secondary">アンケートに答える</a>`
  with:
  `<button class="btn btn--underline btn--on-dark" data-tab="survey" data-i18n="home.hero_cta_secondary">アンケートに答える</button>`
- Teaser CTA — replace:
  `<a class="btn btn--paper" id="survey-cta" href="#" target="_blank" rel="noopener noreferrer" data-reveal data-delay="120" data-i18n="home.survey_cta">回答する</a>`
  with:
  `<button class="btn btn--paper" data-tab="survey" data-reveal data-delay="120" data-i18n="home.survey_cta">回答する</button>`

- [ ] **Step 6: Drop `survey.formUrl`**

- In `src/i18n/index.js` `setLanguage`, delete the block:
  ```js
  const formUrl = translations[lang].survey?.formUrl;
  const cta = document.getElementById("survey-cta");
  if (cta && formUrl) cta.href = formUrl;
  ```
- In `src/i18n/ja.js`, `en.js`, `zh.js`, `ko.js`, delete the `survey: { formUrl: "…" },` object entirely (mind the trailing comma of the preceding `team` block stays valid). `fr.js` has no such key.

- [ ] **Step 7: Create `src/styles/survey.css` shell + `<link>`**

`src/styles/survey.css`:

```css
/* アンケートウィザード。詳細は Task 6 で追加。 */
#page-survey .survey-form {
  max-width: 720px;
  margin: 0 auto;
  padding: 140px 24px 120px;
}
```

`index.html` `<head>` after `lang-gate.css`:

```html
    <link rel="stylesheet" href="/src/styles/survey.css" />
```

- [ ] **Step 8: Run the Step-1 checks, expect pass**

Expected: tab activates `#page-survey`, hash `#survey`, no `#survey` id remains, `#survey-teaser` present, no console errors. Also click the hero CTA and the teaser CTA and confirm each opens the survey tab.

- [ ] **Step 9: Commit**

```bash
git add index.html src/animations/tabs.js src/i18n/index.js src/i18n/ja.js src/i18n/en.js src/i18n/fr.js src/i18n/zh.js src/i18n/ko.js src/styles/survey.css
git commit -m "Add the survey tab and route the home CTAs to it"
```

---

### Task 4: Survey i18n (`surveyForm` namespace, five languages)

**Files:**
- Create: `src/i18n/survey/ja.js`, `en.js`, `fr.js`, `zh.js`, `ko.js`
- Modify: `src/i18n/index.js` (merge `surveyForm` into each `translations[lang]`)

**Interfaces:**
- Produces: `translations[lang].surveyForm` with the key tree below, for all five languages. Consumed by `questions.js` labels indirectly and by `wizard.js` directly.
- Consumes: nothing.

Key tree (identical across languages):

```
surveyForm.intro
surveyForm.consent
surveyForm.section.s1 .s2 .s3 .s4
surveyForm.q.q1_nationality.label
surveyForm.q.q2_visited_before.label
surveyForm.q.q2_visited_before.opt.first_time / .visited_before
surveyForm.q.q3_familiarity.label
surveyForm.q.q3_familiarity.opt.knew_a_lot / .knew_a_little / .heard_only / .did_not_know
surveyForm.q.q4_hesitation.label
surveyForm.q.q4_hesitation.opt.a_lot / .some / .not_much / .none
surveyForm.q.q5_concerns.label
surveyForm.q.q5_concerns.opt.naked / .etiquette / .language / .with_others / .tattoos / .other / .none
surveyForm.q.q6_explanation_helped.label
surveyForm.q.q7_understanding_deepened.label
surveyForm.q.q8_impression_change.label
surveyForm.q.q8_impression_change.opt.much_more_positive / .somewhat_more_positive / .no_change / .more_negative
surveyForm.q.q9_felt_closer.label
surveyForm.q.q10_free_comment.label
surveyForm.scale.low   // "1 = …"
surveyForm.scale.high  // "5 = …"
surveyForm.nationality.placeholder
surveyForm.ui.back / .next / .submit / .step   // .step contains "{n}" and "{total}" tokens
surveyForm.ui.required / .pick_one_plus / .retry
surveyForm.thanks.title / .body / .home
surveyForm.error_generic
```

- [ ] **Step 1: Write the failing check**

`/tmp/survey-i18n-parity.mjs`:

```js
const langs = ["ja","en","fr","zh","ko"];
const mods = Object.fromEntries(await Promise.all(langs.map(async l =>
  [l, (await import(`../Users/takunori/Development/YU-NITY/src/i18n/survey/${l}.js`)).default])));
const keys = (o,p="") => Object.entries(o).flatMap(([k,v]) =>
  v && typeof v === "object" ? keys(v,p+k+".") : [p+k]);
const base = new Set(keys(mods.ja));
let ok = true;
for (const l of langs) {
  const k = new Set(keys(mods[l]));
  const miss = [...base].filter(x => !k.has(x));
  const ext  = [...k].filter(x => !base.has(x));
  if (miss.length || ext.length) { ok = false; console.log(l, "missing", miss, "extra", ext); }
}
process.exit(ok ? 0 : 1);
```

Run: `node /tmp/survey-i18n-parity.mjs` → FAIL (module not found).

- [ ] **Step 2: Create `src/i18n/survey/en.js`**

Values are the English column of `Sento_Experience_Survey_Multilingual.pdf` (p.1–4), verbatim.

```js
export default {
  intro: "Please check one box unless otherwise stated. There are no right or wrong answers.",
  consent: "Your responses are collected anonymously and used only to improve the YU-NITY project.",
  section: {
    s1: "Basic information",
    s2: "Before the experience",
    s3: "After experiencing the sento",
    s4: "Finally",
  },
  q: {
    q1_nationality: { label: "What is your nationality?" },
    q2_visited_before: {
      label: "Have you ever visited a Japanese sento (public bath) before?",
      opt: { first_time: "This is my first time", visited_before: "I have visited one before" },
    },
    q3_familiarity: {
      label: "Before this experience, were you familiar with sento as part of Japanese culture?",
      opt: {
        knew_a_lot: "I knew a lot about it",
        knew_a_little: "I knew a little about it",
        heard_only: "I had only heard of it",
        did_not_know: "I did not know about it",
      },
    },
    q4_hesitation: {
      label: "Did you have any concerns or hesitation about experiencing a sento?",
      opt: { a_lot: "A lot", some: "Some", not_much: "Not much", none: "None at all" },
    },
    q5_concerns: {
      label: "What were you concerned about? (Select all that apply)",
      opt: {
        naked: "Being naked",
        etiquette: "Bathing procedures and etiquette",
        language: "Not understanding the language",
        with_others: "Bathing together with other people",
        tattoos: "Tattoos",
        other: "Other",
        none: "None",
      },
    },
    q6_explanation_helped: {
      label: "Did the explanation of the rules and etiquette beforehand help you feel more comfortable using the sento?",
    },
    q7_understanding_deepened: {
      label: "After experiencing the sento, do you feel that your understanding of Japanese culture and customs has deepened?",
    },
    q8_impression_change: {
      label: "Did your impression of Japanese sento change after the experience?",
      opt: {
        much_more_positive: "It became much more positive",
        somewhat_more_positive: "It became somewhat more positive",
        no_change: "It did not change",
        more_negative: "It became more negative",
      },
    },
    q9_felt_closer: {
      label: "Did the sento experience help you feel closer to Japanese culture and everyday life?",
    },
    q10_free_comment: {
      label: "Please tell us anything that stood out to you during this sento experience, or any aspects of Japanese culture that you learned about for the first time.",
    },
  },
  scale: { low: "1 = Not at all", high: "5 = Very much" },
  nationality: { placeholder: "Select your country" },
  ui: {
    back: "Back",
    next: "Next",
    submit: "Submit",
    step: "Step {n} / {total}",
    required: "This question is required.",
    pick_one_plus: "Please select at least one option.",
    retry: "Try again",
  },
  thanks: {
    title: "Thank you for sharing your experience.",
    body: "Your response has been recorded.",
    home: "Back to home",
  },
  error_generic: "Something went wrong sending your response. Please try again.",
};
```

- [ ] **Step 3: Create `src/i18n/survey/fr.js`**

Values are the Français column of the PDF, verbatim. `ui.*`, `nationality.placeholder`, `thanks.body`, `thanks.home`, `error_generic`, `consent` are not in the PDF — use these:

```js
export default {
  intro: "Veuillez cocher une case sauf indication contraire. Il n’y a pas de bonne ou de mauvaise réponse.",
  consent: "Vos réponses sont recueillies de façon anonyme et servent uniquement à améliorer le projet YU-NITY.",
  section: {
    s1: "Informations de base",
    s2: "Avant l’expérience",
    s3: "Après l’expérience",
    s4: "Pour finir",
  },
  q: {
    q1_nationality: { label: "Quelle est votre nationalité ?" },
    q2_visited_before: {
      label: "Avez-vous déjà fréquenté un sento (bain public japonais) ?",
      opt: { first_time: "C’est ma première fois", visited_before: "J’en ai déjà fréquenté un" },
    },
    q3_familiarity: {
      label: "Avant cette expérience, connaissiez-vous les sento en tant qu’élément de la culture japonaise ?",
      opt: {
        knew_a_lot: "Je connaissais bien",
        knew_a_little: "Je connaissais un peu",
        heard_only: "J’en avais seulement entendu parler",
        did_not_know: "Je ne connaissais pas",
      },
    },
    q4_hesitation: {
      label: "Aviez-vous des inquiétudes ou des réticences à l’idée de vivre l’expérience d’un sento ?",
      opt: { a_lot: "Beaucoup", some: "Un peu", not_much: "Pas beaucoup", none: "Pas du tout" },
    },
    q5_concerns: {
      label: "Qu’est-ce qui vous inquiétait ? (Plusieurs réponses possibles)",
      opt: {
        naked: "Être nu(e)",
        etiquette: "Les règles et les bonnes manières dans le bain",
        language: "Ne pas comprendre la langue",
        with_others: "Se baigner avec d’autres personnes",
        tattoos: "Les tatouages",
        other: "Autre",
        none: "Aucune",
      },
    },
    q6_explanation_helped: {
      label: "L’explication préalable des règles et des bonnes manières vous a-t-elle aidé(e) à utiliser le sento plus sereinement ?",
    },
    q7_understanding_deepened: {
      label: "Après cette expérience, pensez-vous avoir approfondi votre compréhension de la culture et des coutumes japonaises ?",
    },
    q8_impression_change: {
      label: "Votre image des sento japonais a-t-elle changé après l’expérience ?",
      opt: {
        much_more_positive: "Elle est devenue beaucoup plus positive",
        somewhat_more_positive: "Elle est devenue un peu plus positive",
        no_change: "Elle n’a pas changé",
        more_negative: "Elle est devenue plus négative",
      },
    },
    q9_felt_closer: {
      label: "Cette expérience vous a-t-elle permis de vous sentir plus proche de la culture et de la vie quotidienne japonaises ?",
    },
    q10_free_comment: {
      label: "Veuillez nous parler librement de ce qui vous a marqué pendant cette expérience du sento ou des aspects de la culture japonaise que vous avez découverts pour la première fois.",
    },
  },
  scale: { low: "1 = Pas du tout", high: "5 = Tout à fait" },
  nationality: { placeholder: "Sélectionnez votre pays" },
  ui: {
    back: "Retour",
    next: "Suivant",
    submit: "Envoyer",
    step: "Étape {n} / {total}",
    required: "Cette question est obligatoire.",
    pick_one_plus: "Veuillez sélectionner au moins une option.",
    retry: "Réessayer",
  },
  thanks: {
    title: "Merci d’avoir partagé votre expérience.",
    body: "Votre réponse a bien été enregistrée.",
    home: "Retour à l’accueil",
  },
  error_generic: "Une erreur s’est produite lors de l’envoi. Veuillez réessayer.",
};
```

- [ ] **Step 4: Create `src/i18n/survey/zh.js`**

Values are the 中文 column of the PDF, verbatim. Non-PDF keys:

```js
export default {
  intro: "除非另有说明，请勾选一个选项。答案没有对错之分。",
  consent: "您的回答将以匿名方式收集，仅用于改善 YU-NITY 项目。",
  section: { s1: "基本信息", s2: "体验前", s3: "体验钱汤后", s4: "最后" },
  q: {
    q1_nationality: { label: "您的国籍是什么？" },
    q2_visited_before: {
      label: "您以前去过日本的“钱汤”（公共浴场）吗？",
      opt: { first_time: "这是第一次", visited_before: "以前去过" },
    },
    q3_familiarity: {
      label: "体验之前，您了解作为日本文化之一的“钱汤”吗？",
      opt: { knew_a_lot: "非常了解", knew_a_little: "稍微了解", heard_only: "只听说过名字", did_not_know: "不了解" },
    },
    q4_hesitation: {
      label: "您对体验钱汤是否感到不安或有所抵触？",
      opt: { a_lot: "非常有", some: "有一些", not_much: "不太有", none: "完全没有" },
    },
    q5_concerns: {
      label: "您对哪些方面感到不安？（可多选）",
      opt: {
        naked: "裸体",
        etiquette: "入浴方法和礼仪",
        language: "听不懂语言",
        with_others: "与他人一起入浴",
        tattoos: "纹身",
        other: "其他",
        none: "没有",
      },
    },
    q6_explanation_helped: { label: "事先对规则和礼仪的说明是否帮助您更安心地体验钱汤？" },
    q7_understanding_deepened: { label: "实际体验钱汤后，您觉得自己对日本文化和习惯的理解加深了吗？" },
    q8_impression_change: {
      label: "体验前后，您对日本钱汤的印象有变化吗？",
      opt: { much_more_positive: "变得好很多", somewhat_more_positive: "变得稍微好一些", no_change: "没有变化", more_negative: "变差了" },
    },
    q9_felt_closer: { label: "通过这次钱汤体验，您是否更加切身地感受到日本人的文化和日常生活？" },
    q10_free_comment: { label: "请自由填写这次钱汤体验中给您留下深刻印象的事情，或您新了解到的日本文化。" },
  },
  scale: { low: "1 = 完全没有", high: "5 = 非常" },
  nationality: { placeholder: "请选择您的国家/地区" },
  ui: {
    back: "上一步",
    next: "下一步",
    submit: "提交",
    step: "第 {n} / {total} 步",
    required: "此题为必答题。",
    pick_one_plus: "请至少选择一项。",
    retry: "重试",
  },
  thanks: { title: "感谢您分享您的体验。", body: "您的回答已记录。", home: "返回首页" },
  error_generic: "提交时发生错误，请重试。",
};
```

- [ ] **Step 5: Create `src/i18n/survey/ko.js`**

Values are the 한국어 column of the PDF, verbatim. Non-PDF keys:

```js
export default {
  intro: "별도 안내가 없는 경우 하나의 항목에 체크해 주세요. 정답이나 오답은 없습니다.",
  consent: "응답은 익명으로 수집되며 YU-NITY 프로젝트 개선을 위해서만 사용됩니다.",
  section: { s1: "기본 정보", s2: "체험 전", s3: "센토 체험 후", s4: "마지막으로" },
  q: {
    q1_nationality: { label: "국적은 무엇입니까?" },
    q2_visited_before: {
      label: "일본의 센토(대중목욕탕)를 이용해 본 적이 있습니까?",
      opt: { first_time: "이번이 처음입니다", visited_before: "이용한 적이 있습니다" },
    },
    q3_familiarity: {
      label: "체험 전, 일본 문화의 하나인 센토에 대해 알고 있었습니까?",
      opt: { knew_a_lot: "잘 알고 있었다", knew_a_little: "조금 알고 있었다", heard_only: "이름만 들어봤다", did_not_know: "몰랐다" },
    },
    q4_hesitation: {
      label: "센토를 체험하는 것에 대해 불안감이나 거부감이 있었습니까?",
      opt: { a_lot: "매우 있었다", some: "조금 있었다", not_much: "별로 없었다", none: "전혀 없었다" },
    },
    q5_concerns: {
      label: "어떤 점이 불안했습니까? (복수 선택 가능)",
      opt: {
        naked: "나체가 되는 것",
        etiquette: "입욕 방법 및 예절",
        language: "언어를 이해하지 못하는 것",
        with_others: "다른 사람과 함께 목욕하는 것",
        tattoos: "문신",
        other: "기타",
        none: "특별 없음",
      },
    },
    q6_explanation_helped: { label: "사전에 받은 규칙 및 예절 설명이 안심하고 센토를 체험하는 데 도움이 되었습니까?" },
    q7_understanding_deepened: { label: "센토를 직접 체험한 후 일본 문화와 생활 습관에 대한 이해가 깊어졌다고 느끼십니까?" },
    q8_impression_change: {
      label: "체험 전후로 일본 센토에 대한 이미지가 바뀌었습니까?",
      opt: { much_more_positive: "매우 좋아졌다", somewhat_more_positive: "조금 좋아졌다", no_change: "변하지 않았다", more_negative: "나빠졌다" },
    },
    q9_felt_closer: { label: "센토 체험을 통해 일본인의 문화와 일상생활을 더 가깝게 느낄 수 있었습니까?" },
    q10_free_comment: { label: "이번 센토 체험에서 인상 깊었던 점이나 새롭게 알게 된 일본 문화에 대해 자유롭게 적어 주세요." },
  },
  scale: { low: "1 = 전혀 그렇지 않다", high: "5 = 매우 그렇다" },
  nationality: { placeholder: "국가를 선택하세요" },
  ui: {
    back: "이전",
    next: "다음",
    submit: "제출",
    step: "{n} / {total} 단계",
    required: "이 문항은 필수입니다.",
    pick_one_plus: "하나 이상 선택해 주세요.",
    retry: "다시 시도",
  },
  thanks: { title: "소중한 경험을 공유해 주셔서 감사합니다.", body: "응답이 저장되었습니다.", home: "홈으로" },
  error_generic: "전송 중 오류가 발생했습니다. 다시 시도해 주세요.",
};
```

- [ ] **Step 6: Create `src/i18n/survey/ja.js`**

From the spec's Appendix A.

```js
export default {
  intro: "特に指定がない場合は1つだけ選んでください。正解・不正解はありません。",
  consent: "いただいた回答は匿名で集計し、YU-NITY の活動改善のためだけに使用します。",
  section: { s1: "基本情報", s2: "体験前", s3: "体験後", s4: "最後に" },
  q: {
    q1_nationality: { label: "国籍を教えてください" },
    q2_visited_before: {
      label: "これまでに日本の銭湯（公衆浴場）を利用したことがありますか？",
      opt: { first_time: "今回が初めて", visited_before: "以前に利用したことがある" },
    },
    q3_familiarity: {
      label: "今回の体験の前から、日本文化のひとつとして銭湯を知っていましたか？",
      opt: { knew_a_lot: "よく知っていた", knew_a_little: "少し知っていた", heard_only: "名前を聞いたことがある程度", did_not_know: "知らなかった" },
    },
    q4_hesitation: {
      label: "銭湯を体験することに、不安やためらいはありましたか？",
      opt: { a_lot: "とてもあった", some: "少しあった", not_much: "あまりなかった", none: "まったくなかった" },
    },
    q5_concerns: {
      label: "どんなことが不安でしたか？（複数選択可）",
      opt: {
        naked: "裸になること",
        etiquette: "入浴の手順やマナー",
        language: "言葉が分からないこと",
        with_others: "他の人と一緒に入浴すること",
        tattoos: "タトゥー",
        other: "その他",
        none: "特にない",
      },
    },
    q6_explanation_helped: { label: "事前のルール・マナー説明は、安心して銭湯を利用するのに役立ちましたか？" },
    q7_understanding_deepened: { label: "銭湯を体験して、日本の文化や習慣への理解が深まったと感じますか？" },
    q8_impression_change: {
      label: "体験の前後で、日本の銭湯に対する印象は変わりましたか？",
      opt: { much_more_positive: "とても良くなった", somewhat_more_positive: "少し良くなった", no_change: "変わらなかった", more_negative: "悪くなった" },
    },
    q9_felt_closer: { label: "銭湯の体験を通じて、日本の文化や日常生活を身近に感じられましたか？" },
    q10_free_comment: { label: "今回の銭湯体験で印象に残ったことや、初めて知った日本文化について自由にお書きください。" },
  },
  scale: { low: "1 = まったくそう思わない", high: "5 = とてもそう思う" },
  nationality: { placeholder: "国を選択してください" },
  ui: {
    back: "戻る",
    next: "次へ",
    submit: "送信",
    step: "ステップ {n} / {total}",
    required: "この設問は必須です。",
    pick_one_plus: "1つ以上選んでください。",
    retry: "再試行",
  },
  thanks: { title: "ご回答ありがとうございました。", body: "回答を記録しました。", home: "ホームへ戻る" },
  error_generic: "送信中にエラーが発生しました。もう一度お試しください。",
};
```

- [ ] **Step 7: Merge into `src/i18n/index.js`**

At the top, after the site-locale imports:

```js
import surveyJa from "./survey/ja.js";
import surveyEn from "./survey/en.js";
import surveyFr from "./survey/fr.js";
import surveyZh from "./survey/zh.js";
import surveyKo from "./survey/ko.js";
```

After `const translations = { ja, en, fr, zh, ko };`:

```js
translations.ja.surveyForm = surveyJa;
translations.en.surveyForm = surveyEn;
translations.fr.surveyForm = surveyFr;
translations.zh.surveyForm = surveyZh;
translations.ko.surveyForm = surveyKo;
```

- [ ] **Step 8: Run the parity check, expect pass**

Run: `node /tmp/survey-i18n-parity.mjs` → exit 0, no output.

- [ ] **Step 9: Commit**

```bash
git add src/i18n/survey/ src/i18n/index.js
git commit -m "Add the survey i18n namespace in five languages"
```

---

### Task 5: Question schema and country list (pure modules)

**Files:**
- Create: `src/survey/questions.js`
- Create: `src/survey/countries.js`

**Interfaces:**
- Produces:
  - `questions.js`: `export const QUESTIONS` — ordered array of `{ id, section: 1|2|3|4, type: "country"|"single"|"multi"|"scale5"|"longtext", required: boolean, options?: string[] }`. `export const STEPS = [[q…],[q…],[q…],[q…]]` grouping `QUESTIONS` by `section`. `export const SCALE_QUESTIONS`, `export const SINGLE_QUESTIONS` etc. not required — consumers filter `QUESTIONS`.
  - `countries.js`: `export const COUNTRY_CODES` (string[] of ISO 3166-1 alpha-2, uppercase). `export function englishCountryName(code)` → string. `export function localizedCountryName(code, lang)` → string (falls back to `code` if `Intl.DisplayNames` unavailable). `export function sortedCountries(lang)` → `[{ code, name }]` sorted by localized `name` with `localeCompare(lang)`.
- Consumes: nothing.

- [ ] **Step 1: Write the failing check**

`/tmp/survey-schema.mjs`:

```js
import { QUESTIONS, STEPS } from "../Users/takunori/Development/YU-NITY/src/survey/questions.js";
import { COUNTRY_CODES, englishCountryName, localizedCountryName, sortedCountries }
  from "../Users/takunori/Development/YU-NITY/src/survey/countries.js";

const ids = QUESTIONS.map(q => q.id);
console.assert(ids.length === 10, "10 questions", ids.length);
console.assert(JSON.stringify(ids) === JSON.stringify([
  "q1_nationality","q2_visited_before","q3_familiarity","q4_hesitation","q5_concerns",
  "q6_explanation_helped","q7_understanding_deepened","q8_impression_change","q9_felt_closer","q10_free_comment"
]), "id order");
console.assert(STEPS.length === 4 && STEPS.flat().length === 10, "4 steps cover 10");
console.assert(QUESTIONS.find(q => q.id === "q10_free_comment").required === false, "q10 optional");
console.assert(QUESTIONS.find(q => q.id === "q5_concerns").type === "multi", "q5 multi");
console.assert(QUESTIONS.find(q => q.id === "q5_concerns").options.at(-1) === "none", "q5 none last");
console.assert(COUNTRY_CODES.includes("FR") && COUNTRY_CODES.includes("JP"), "codes");
console.assert(englishCountryName("FR") === "France", englishCountryName("FR"));
console.assert(localizedCountryName("JP","fr") === "Japon", localizedCountryName("JP","fr"));
console.assert(sortedCountries("en")[0].name.localeCompare(sortedCountries("en").at(-1).name) < 0, "sorted");
console.log("ok");
```

Run: `node /tmp/survey-schema.mjs` → FAIL (module not found).

- [ ] **Step 2: Create `src/survey/questions.js`**

```js
// アンケートの設問スキーマ。保存値はすべて英語安定キー。
export const QUESTIONS = [
  { id: "q1_nationality", section: 1, type: "country", required: true },
  { id: "q2_visited_before", section: 1, type: "single", required: true,
    options: ["first_time", "visited_before"] },
  { id: "q3_familiarity", section: 2, type: "single", required: true,
    options: ["knew_a_lot", "knew_a_little", "heard_only", "did_not_know"] },
  { id: "q4_hesitation", section: 2, type: "single", required: true,
    options: ["a_lot", "some", "not_much", "none"] },
  { id: "q5_concerns", section: 2, type: "multi", required: true,
    options: ["naked", "etiquette", "language", "with_others", "tattoos", "other", "none"] },
  { id: "q6_explanation_helped", section: 3, type: "scale5", required: true },
  { id: "q7_understanding_deepened", section: 3, type: "scale5", required: true },
  { id: "q8_impression_change", section: 3, type: "single", required: true,
    options: ["much_more_positive", "somewhat_more_positive", "no_change", "more_negative"] },
  { id: "q9_felt_closer", section: 3, type: "scale5", required: true },
  { id: "q10_free_comment", section: 4, type: "longtext", required: false },
];

// q5 の排他オプション（選ぶと他を外す／他を選ぶと外れる）
export const EXCLUSIVE_OPTION = { q5_concerns: "none" };

export const STEPS = [1, 2, 3, 4].map((s) => QUESTIONS.filter((q) => q.section === s));
```

- [ ] **Step 3: Create `src/survey/countries.js`**

```js
export const COUNTRY_CODES = [
  "AD","AE","AF","AG","AL","AM","AO","AR","AT","AU","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ",
  "BN","BO","BR","BS","BT","BW","BY","BZ","CA","CD","CF","CG","CH","CI","CL","CM","CN","CO","CR","CU",
  "CV","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","ER","ES","ET","FI","FJ","FM","FR","GA",
  "GB","GD","GE","GH","GM","GN","GQ","GR","GT","GW","GY","HN","HR","HT","HU","ID","IE","IL","IN","IQ",
  "IR","IS","IT","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KZ","LA","LB","LC","LI",
  "LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MG","MH","MK","ML","MM","MN","MR","MT","MU",
  "MV","MW","MX","MY","MZ","NA","NE","NG","NI","NL","NO","NP","NR","NZ","OM","PA","PE","PG","PH","PK",
  "PL","PT","PW","PY","QA","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SI","SK","SL","SM","SN",
  "SO","SR","SS","ST","SV","SY","SZ","TD","TG","TH","TJ","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
  "UA","UG","US","UY","UZ","VA","VC","VE","VN","VU","WS","YE","ZA","ZM","ZW",
];

function displayNames(lang) {
  try {
    return new Intl.DisplayNames([lang], { type: "region" });
  } catch {
    return null;
  }
}

export function englishCountryName(code) {
  const dn = displayNames("en");
  return (dn && dn.of(code)) || code;
}

export function localizedCountryName(code, lang) {
  const dn = displayNames(lang);
  return (dn && dn.of(code)) || code;
}

export function sortedCountries(lang) {
  return COUNTRY_CODES
    .map((code) => ({ code, name: localizedCountryName(code, lang) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));
}
```

- [ ] **Step 4: Run the check, expect pass**

Run: `node /tmp/survey-schema.mjs` → prints `ok`, no assertion output.

- [ ] **Step 5: Commit**

```bash
git add src/survey/questions.js src/survey/countries.js
git commit -m "Add survey question schema and country list modules"
```

---

### Task 6: The wizard (render, steps, validation, draft)

**Files:**
- Create: `src/survey/wizard.js`
- Modify: `src/styles/survey.css` (append the full wizard styles)
- Modify: `src/main.js` (call `initSurvey`)

**Interfaces:**
- Consumes: `QUESTIONS`, `STEPS`, `EXCLUSIVE_OPTION` from `questions.js`; `sortedCountries`, `englishCountryName` from `countries.js`; `translations`, `getCurrentLang`, `setLanguage` from `src/i18n/index.js` (add `export` for `translations` and a `t(path)` helper — see Step 2).
- Produces: `export function initSurvey({ rootId })` — mounts the wizard into `#<rootId>`, idempotent (safe to call once on load). `export function getSurveyState()` for tests → `{ step, answers }`. Submit wiring is added in Task 8 via `export`ed `onSubmit` hook: `initSurvey({ rootId, submit })` where `submit(payload)` returns a Promise; when omitted the Submit button calls a no-op that just shows the thanks screen (lets this task be verified independently).

- [ ] **Step 1: Write the failing check (Playwright MCP)**

After implementation assert (initially FAILS — `#survey-form-root` is empty):
1. `navigate` `http://localhost:5173/` with `localStorage` set `yunity-lang=en`; click nav `survey` tab.
2. `evaluate`: `document.querySelectorAll('#survey-form-root .survey-step').length` → `1` (only current step rendered).
3. `evaluate`: `document.querySelector('#survey-form-root .survey-progress').textContent` contains `"Step 1 / 4"`.
4. `evaluate`: click `Next` without answering → a `.survey-error` appears, step stays 1.
5. `evaluate`: pick a country in the `<select>`, pick `q2` `first_time`, click `Next` → step 2 renders, progress `Step 2 / 4`.
6. `evaluate` on step 2: check `q5` `none` then check `naked` → `none` auto-unchecks; check `none` again → `naked` unchecks.
7. `evaluate`: fill step 2 + 3 valid, reach step 4, reload the page → wizard reopens at a step with the previously chosen answers still selected (draft restore); `JSON.parse(localStorage['yunity-survey-draft']).q2_visited_before` → `"first_time"`.
8. `evaluate`: switch language to `fr` via header toggle while on step 2 → question labels become French, selected answers unchanged.
9. `read_console_messages` (error) → none.

- [ ] **Step 2: Add a `t()` helper + `translations` export to `src/i18n/index.js`**

```js
export { translations };

export function t(path, vars) {
  const lang = getCurrentLang();
  let s = path.split(".").reduce((o, k) => o?.[k], translations[lang]);
  if (s == null) s = path.split(".").reduce((o, k) => o?.[k], translations.en);
  if (typeof s === "string" && vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  }
  return s ?? path;
}
```

- [ ] **Step 3: Create `src/survey/wizard.js`**

```js
import { QUESTIONS, STEPS, EXCLUSIVE_OPTION } from "./questions.js";
import { sortedCountries, englishCountryName } from "./countries.js";
import { t, getCurrentLang, setLanguage } from "../i18n/index.js";

const DRAFT_KEY = "yunity-survey-draft";

const state = {
  step: 1,
  answers: {},
  status: "editing", // editing | submitting | done | error
  submit: null,
  root: null,
};

export function getSurveyState() {
  return { step: state.step, answers: { ...state.answers } };
}

export function initSurvey({ rootId, submit = null } = {}) {
  const root = document.getElementById(rootId);
  if (!root) return;
  state.root = root;
  state.submit = submit;
  state.answers = loadDraft();
  state.step = firstIncompleteStep();
  render();

  // 言語切替に追従（ヘッダートグル）
  document.querySelectorAll("[data-lang-btn]").forEach((b) =>
    b.addEventListener("click", () => {
      if (state.status !== "done") render();
    })
  );
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state.answers));
  } catch {}
}
function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

function firstIncompleteStep() {
  for (let s = 1; s <= 4; s++) {
    if (STEPS[s - 1].some((q) => q.required && !isAnswered(q))) return s;
  }
  return 4;
}

function isAnswered(q) {
  const v = state.answers[q.id];
  if (q.type === "multi") return Array.isArray(v) && v.length > 0;
  if (q.type === "longtext") return true; // optional
  return v !== undefined && v !== null && v !== "";
}

function setAnswer(id, value) {
  state.answers[id] = value;
  saveDraft();
}

function toggleMulti(id, opt) {
  const cur = new Set(state.answers[id] || []);
  const exclusive = EXCLUSIVE_OPTION[id];
  if (opt === exclusive) {
    cur.has(opt) ? cur.delete(opt) : (cur.clear(), cur.add(opt));
  } else {
    cur.delete(exclusive);
    cur.has(opt) ? cur.delete(opt) : cur.add(opt);
  }
  setAnswer(id, [...cur]);
}

function validateStep() {
  const missing = STEPS[state.step - 1].filter((q) => q.required && !isAnswered(q));
  return missing[0] || null;
}

// ---------- rendering ----------

function render() {
  const root = state.root;
  root.innerHTML = "";
  if (state.status === "done") return renderThanks(root);

  const step = STEPS[state.step - 1];

  const head = el("div", "survey-head");
  head.append(
    el("p", "survey-progress", t("surveyForm.ui.step", { n: state.step, total: 4 })),
    el("div", "survey-bar", "", (b) => {
      const fill = el("span", "survey-bar__fill");
      fill.style.width = `${(state.step / 4) * 100}%`;
      b.append(fill);
    }),
    el("h2", "survey-section", t(`surveyForm.section.s${state.step}`))
  );
  if (state.step === 1) {
    head.append(el("p", "survey-intro", t("surveyForm.intro")));
  }
  root.append(head);

  const form = el("div", "survey-step");
  step.forEach((q) => form.append(renderQuestion(q)));
  if (state.step === 4) {
    form.append(el("p", "survey-consent", t("surveyForm.consent")));
  }
  root.append(form);

  const err = el("p", "survey-error");
  err.hidden = true;
  root.append(err);

  const nav = el("div", "survey-nav");
  if (state.step > 1) {
    nav.append(
      btn("survey-btn survey-btn--ghost", t("surveyForm.ui.back"), () => {
        state.step--;
        render();
        scrollTop();
      })
    );
  }
  const isLast = state.step === 4;
  const primary = btn(
    "survey-btn survey-btn--primary",
    isLast ? t("surveyForm.ui.submit") : t("surveyForm.ui.next"),
    isLast ? onSubmit : onNext
  );
  if (state.status === "submitting") primary.disabled = true;
  nav.append(primary);
  root.append(nav);

  if (state.status === "error") {
    err.hidden = false;
    err.textContent = t("surveyForm.error_generic");
  }

  function onNext() {
    const bad = validateStep();
    if (bad) return showInvalid(bad, err);
    state.step++;
    render();
    scrollTop();
  }
  function onSubmit() {
    const bad = validateStep();
    if (bad) return showInvalid(bad, err);
    doSubmit();
  }
}

function renderQuestion(q) {
  const wrap = el("fieldset", "survey-q");
  wrap.dataset.qid = q.id;
  wrap.append(el("legend", "survey-q__label", t(`surveyForm.q.${q.id}.label`)));

  if (q.type === "country") {
    const sel = document.createElement("select");
    sel.className = "survey-select";
    const ph = new Option(t("surveyForm.nationality.placeholder"), "");
    ph.disabled = true;
    ph.selected = !state.answers.q1_nationality_code;
    sel.append(ph);
    for (const c of sortedCountries(getCurrentLang())) {
      const o = new Option(c.name, c.code);
      if (c.code === state.answers.q1_nationality_code) o.selected = true;
      sel.append(o);
    }
    sel.addEventListener("change", () => {
      state.answers.q1_nationality_code = sel.value;
      state.answers.q1_nationality = englishCountryName(sel.value);
      // keep the schema id "answered" for validation
      state.answers.q1_nationality = englishCountryName(sel.value);
      state.answers["q1_nationality"] = englishCountryName(sel.value);
      state.answers["q1_nationality_code"] = sel.value;
      state.answers["q1_nationality"] = englishCountryName(sel.value);
      state.answers["q1_nationality"] = englishCountryName(sel.value);
      saveDraft();
    });
    wrap.append(sel);
    return wrap;
  }

  if (q.type === "longtext") {
    const ta = document.createElement("textarea");
    ta.className = "survey-textarea";
    ta.rows = 6;
    ta.value = state.answers[q.id] || "";
    ta.addEventListener("input", () => setAnswer(q.id, ta.value));
    wrap.append(ta);
    return wrap;
  }

  if (q.type === "scale5") {
    const row = el("div", "survey-scale");
    for (let n = 1; n <= 5; n++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "survey-scale__btn";
      b.textContent = String(n);
      if (state.answers[q.id] === n) b.classList.add("is-on");
      b.addEventListener("click", () => {
        setAnswer(q.id, n);
        render();
      });
      row.append(b);
    }
    wrap.append(row);
    wrap.append(
      el("div", "survey-scale__ends", "", (d) => {
        d.append(
          el("span", "", t("surveyForm.scale.low")),
          el("span", "", t("surveyForm.scale.high"))
        );
      })
    );
    return wrap;
  }

  // single | multi
  const list = el("div", "survey-opts");
  q.options.forEach((opt) => {
    const id = `${q.id}__${opt}`;
    const label = el("label", "survey-opt");
    const input = document.createElement("input");
    input.type = q.type === "multi" ? "checkbox" : "radio";
    input.name = q.id;
    input.id = id;
    if (q.type === "multi") {
      input.checked = (state.answers[q.id] || []).includes(opt);
      input.addEventListener("change", () => {
        toggleMulti(q.id, opt);
        render();
      });
    } else {
      input.checked = state.answers[q.id] === opt;
      input.addEventListener("change", () => {
        setAnswer(q.id, opt);
      });
    }
    label.append(input, el("span", "", t(`surveyForm.q.${q.id}.opt.${opt}`)));
    list.append(label);
  });
  wrap.append(list);
  return wrap;
}

function renderThanks(root) {
  root.append(
    el("div", "survey-thanks", "", (d) => {
      d.append(
        el("h2", "survey-thanks__title", t("surveyForm.thanks.title")),
        el("p", "survey-thanks__body", t("surveyForm.thanks.body")),
        btn("survey-btn survey-btn--primary", t("surveyForm.thanks.home"), () => {
          document.querySelector('.site-nav__tab[data-tab="home"]').click();
        })
      );
    })
  );
}

async function doSubmit() {
  state.status = "submitting";
  render();
  try {
    if (state.submit) await state.submit(buildAnswersView());
    state.status = "done";
    clearDraft();
  } catch {
    state.status = "error";
  }
  render();
}

function buildAnswersView() {
  // Task 8 で submit.js の buildPayload に置き換わる。ここでは answers をそのまま渡す。
  return { answers: state.answers, language: getCurrentLang() };
}

// ---------- tiny dom helpers ----------
function el(tag, cls, text, build) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  if (build) build(n);
  return n;
}
function btn(cls, text, onClick) {
  const b = el("button", cls, text);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}
function showInvalid(q, errNode) {
  const bad = q.type === "multi" ? t("surveyForm.ui.pick_one_plus") : t("surveyForm.ui.required");
  errNode.hidden = false;
  errNode.textContent = bad;
  const target = state.root.querySelector(`[data-qid="${q.id}"]`);
  if (target) target.scrollIntoView({ block: "center", behavior: "smooth" });
}
function scrollTop() {
  state.root.scrollIntoView({ block: "start" });
}
```

> Note for the implementer: the `sel.addEventListener("change", …)` body above has redundant repeated assignments — collapse it to exactly:
> ```js
> sel.addEventListener("change", () => {
>   state.answers.q1_nationality_code = sel.value;
>   state.answers.q1_nationality = englishCountryName(sel.value);
>   saveDraft();
> });
> ```
> and update `isAnswered` for `q1_nationality` to check `state.answers.q1_nationality_code`. Add this branch at the top of `isAnswered`:
> ```js
> if (q.id === "q1_nationality") return !!state.answers.q1_nationality_code;
> ```

- [ ] **Step 4: Append wizard styles to `src/styles/survey.css`**

```css
.survey-head { margin-bottom: 32px; }
.survey-progress {
  font-family: var(--font-mono, monospace);
  font-size: 11px; letter-spacing: 0.16em; color: rgba(42,39,36,0.5);
  margin: 0 0 10px;
}
.survey-bar { height: 2px; background: rgba(42,39,36,0.14); margin-bottom: 24px; }
.survey-bar__fill { display: block; height: 100%; background: #2a7d7b; transition: width 0.25s ease; }
.survey-section { font-size: 22px; margin: 0 0 8px; }
.survey-intro, .survey-consent {
  font-size: 13px; line-height: 1.8; color: rgba(42,39,36,0.62); margin: 12px 0 0;
}
.survey-q { border: 0; padding: 0; margin: 0 0 40px; }
.survey-q__label { font-size: 15px; line-height: 1.7; padding: 0; margin-bottom: 14px; }
.survey-opts { display: grid; gap: 8px; }
.survey-opt {
  display: flex; gap: 12px; align-items: flex-start;
  border: 1px solid rgba(42,39,36,0.2); padding: 14px 16px; cursor: pointer; font-size: 14px;
}
.survey-opt:hover { background: rgba(42,39,36,0.04); }
.survey-opt input { margin-top: 3px; }
.survey-select, .survey-textarea {
  width: 100%; font: inherit; padding: 12px 14px; border: 1px solid rgba(42,39,36,0.28); background: #fff;
}
.survey-scale { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.survey-scale__btn {
  appearance: none; border: 1px solid rgba(42,39,36,0.28); background: transparent;
  font-size: 16px; padding: 14px 0; cursor: pointer;
}
.survey-scale__btn.is-on { background: #2a7d7b; color: #fff; border-color: #2a7d7b; }
.survey-scale__ends {
  display: flex; justify-content: space-between; font-size: 11px; color: rgba(42,39,36,0.5); margin-top: 8px;
}
.survey-error { color: #b3261e; font-size: 13px; margin: 4px 0 0; }
.survey-nav { display: flex; gap: 12px; margin-top: 40px; }
.survey-btn {
  appearance: none; border: 1px solid #2a2724; background: #2a2724; color: #efe9df;
  font: inherit; letter-spacing: 0.06em; padding: 14px 28px; cursor: pointer;
}
.survey-btn--ghost { background: transparent; color: #2a2724; }
.survey-btn[disabled] { opacity: 0.5; cursor: default; }
.survey-thanks { text-align: center; padding: 60px 0; }
.survey-thanks__title { font-size: 22px; margin: 0 0 12px; }
.survey-thanks__body { font-size: 14px; color: rgba(42,39,36,0.62); margin: 0 0 28px; }
```

- [ ] **Step 5: Call `initSurvey` from `src/main.js`**

Add import: `import { initSurvey } from "./survey/wizard.js";`
After `initTabs(...)` / `initReveal()` near the end (before `initNavToggle()` is fine):

```js
initSurvey({ rootId: "survey-form-root" });
```

- [ ] **Step 6: Run the Step-1 checks, expect pass**

Walk all nine sub-steps with Playwright MCP. Expected: single step rendered at a time, progress text correct, validation blocks Next, `q5` exclusivity works both directions, draft persists across reload and restores selections, header language toggle re-renders labels without losing answers, no console errors.

- [ ] **Step 7: Commit**

```bash
git add src/survey/wizard.js src/styles/survey.css src/main.js src/i18n/index.js
git commit -m "Build the multi-step survey wizard (render, validation, draft)"
```

---

### Task 7: Payload builder + submit module

**Files:**
- Create: `src/survey/endpoint.js`
- Create: `src/survey/submit.js`
- Create: `.env.example`

**Interfaces:**
- Produces:
  - `endpoint.js`: `export const SURVEY_ENDPOINT` — `import.meta.env.VITE_SURVEY_ENDPOINT` or the committed fallback string `"https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec"`.
  - `submit.js`:
    - `export function buildPayload(answers, lang, meta)` → object exactly matching spec Appendix B:
      `{ language, _hp: "", answers: { q1_nationality_code, q1_nationality, q2_visited_before, q3_familiarity, q4_hesitation, q5_concerns: string[], q6_explanation_helped: number, q7_understanding_deepened: number, q8_impression_change, q9_felt_closer: number, q10_free_comment: string }, meta: { userAgent, startedAt, submittedAt } }`.
    - `export async function submitSurvey(payload)` → `fetch(SURVEY_ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload), redirect: "follow" })`; returns the `Response`; lets network errors reject.
- Consumes: `SURVEY_ENDPOINT`.

- [ ] **Step 1: Write the failing check**

`/tmp/survey-payload.mjs`:

```js
import { buildPayload } from "../Users/takunori/Development/YU-NITY/src/survey/submit.js";
const answers = {
  q1_nationality_code: "FR", q1_nationality: "France",
  q2_visited_before: "first_time", q3_familiarity: "knew_a_little",
  q4_hesitation: "some", q5_concerns: ["naked", "language"],
  q6_explanation_helped: 4, q7_understanding_deepened: 5,
  q8_impression_change: "much_more_positive", q9_felt_closer: 4,
  q10_free_comment: "hi",
};
const p = buildPayload(answers, "fr", { userAgent: "UA", startedAt: "S", submittedAt: "E" });
console.assert(p.language === "fr", "language");
console.assert(p._hp === "", "honeypot empty");
console.assert(Array.isArray(p.answers.q5_concerns) && p.answers.q5_concerns.length === 2, "q5 array");
console.assert(typeof p.answers.q6_explanation_helped === "number", "scale number");
console.assert(p.answers.q10_free_comment === "hi", "q10");
console.assert(p.meta.userAgent === "UA", "meta");
console.assert(Object.keys(p.answers).length === 11, "11 answer keys");
console.log("ok");
```

Run: `node /tmp/survey-payload.mjs` → FAIL (module not found).

- [ ] **Step 2: Create `src/survey/endpoint.js`**

```js
// アンケート送信先（Google Apps Script Web アプリ）。秘密情報ではない。
// Phase 3 の手順でデプロイ後、この文字列を差し替えるか .env に VITE_SURVEY_ENDPOINT を設定する。
export const SURVEY_ENDPOINT =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SURVEY_ENDPOINT) ||
  "https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec";
```

- [ ] **Step 3: Create `src/survey/submit.js`**

```js
import { SURVEY_ENDPOINT } from "./endpoint.js";

export function buildPayload(answers, lang, meta = {}) {
  return {
    language: lang,
    _hp: "",
    answers: {
      q1_nationality_code: answers.q1_nationality_code || "",
      q1_nationality: answers.q1_nationality || "",
      q2_visited_before: answers.q2_visited_before || "",
      q3_familiarity: answers.q3_familiarity || "",
      q4_hesitation: answers.q4_hesitation || "",
      q5_concerns: Array.isArray(answers.q5_concerns) ? answers.q5_concerns : [],
      q6_explanation_helped: numOrEmpty(answers.q6_explanation_helped),
      q7_understanding_deepened: numOrEmpty(answers.q7_understanding_deepened),
      q8_impression_change: answers.q8_impression_change || "",
      q9_felt_closer: numOrEmpty(answers.q9_felt_closer),
      q10_free_comment: answers.q10_free_comment || "",
    },
    meta: {
      userAgent: meta.userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : ""),
      startedAt: meta.startedAt || "",
      submittedAt: meta.submittedAt || new Date().toISOString(),
    },
  };
}

function numOrEmpty(v) {
  return typeof v === "number" ? v : "";
}

export async function submitSurvey(payload) {
  return fetch(SURVEY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });
}
```

- [ ] **Step 4: Create `.env.example`**

```
# Google Apps Script Web アプリの /exec URL（docs/survey-setup.md 参照）
VITE_SURVEY_ENDPOINT=
```

- [ ] **Step 5: Run the check, expect pass**

Run: `node /tmp/survey-payload.mjs` → prints `ok`.
(`import.meta.env` is undefined under plain Node — the `typeof import.meta !== "undefined"` guard makes `endpoint.js` fall back to the string without throwing.)

- [ ] **Step 6: Commit**

```bash
git add src/survey/endpoint.js src/survey/submit.js .env.example
git commit -m "Add survey payload builder and submit module"
```

---

### Task 8: Wire submit into the wizard (thanks / error / retry)

**Files:**
- Modify: `src/survey/wizard.js` (use `buildPayload` + real submit; `startedAt`; retry)
- Modify: `src/main.js` (pass `submit` to `initSurvey`)

**Interfaces:**
- Consumes: `buildPayload`, `submitSurvey` from `submit.js`.
- Produces: `initSurvey({ rootId, submit })` where `submit` defaults to the real `submitSurvey`-backed function; still injectable for tests.

- [ ] **Step 1: Write the failing check (Playwright MCP)**

After implementation assert (initially FAILS because submit currently no-ops):
1. `navigate` with `yunity-lang=en`; `evaluate` to stub the network:
   `window.__posts = []; const _f = window.fetch; window.fetch = (u, o) => { window.__posts.push({ u, body: o && o.body }); return Promise.resolve(new Response('{"ok":true}', { status: 200 })); };`
2. Walk the whole wizard with valid answers, click `Submit`.
3. `evaluate`: `window.__posts.length` → `1`; `JSON.parse(window.__posts[0].body)` matches Appendix B (has `language`, `_hp === ""`, `answers.q5_concerns` array, numeric scale answers, `meta.submittedAt` non-empty).
4. `evaluate`: `document.querySelector('.survey-thanks__title')` is present; `localStorage.getItem('yunity-survey-draft')` → `null`.
5. Reload; `evaluate` set `window.fetch = () => Promise.reject(new TypeError('net'))`; walk the wizard again; `Submit` → `.survey-error` visible with the localized generic error, a `Retry`/`Submit` button still present, answers still selected. Restore `window.fetch = _f`.
6. `read_console_messages` (error) → none.

- [ ] **Step 2: Update `src/survey/wizard.js`**

- Add import: `import { buildPayload, submitSurvey } from "./submit.js";`
- Add `state.startedAt = new Date().toISOString();` set inside `initSurvey` (once).
- Replace `buildAnswersView()` and `doSubmit()` with:

```js
async function doSubmit() {
  state.status = "submitting";
  render();
  const payload = buildPayload(state.answers, getCurrentLang(), {
    startedAt: state.startedAt,
    submittedAt: new Date().toISOString(),
  });
  try {
    const fn = state.submit || submitSurvey;
    await fn(payload);
    state.status = "done";
    clearDraft();
  } catch {
    state.status = "error";
  }
  render();
}
```

- In `initSurvey`, keep `state.submit = submit;` (already there) — when `null`, `doSubmit` uses `submitSurvey`.
- In the error branch of `render()`, the primary button already reads `surveyForm.ui.submit` on step 4; that doubles as Retry. No extra button needed. (Optional: when `state.status === "error"`, set its label to `t("surveyForm.ui.retry")`.)

- [ ] **Step 3: Pass the real submit from `src/main.js`**

```js
import { initSurvey } from "./survey/wizard.js";
// …
initSurvey({ rootId: "survey-form-root" }); // submit defaults to submitSurvey inside wizard
```

(No change needed if Step 2 defaults correctly; keep `main.js` calling `initSurvey({ rootId: "survey-form-root" })`.)

- [ ] **Step 4: Run the Step-1 checks, expect pass**

Expected: one POST with the correct body, thanks screen, draft cleared; on forced `fetch` rejection the error message shows and answers survive; no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/survey/wizard.js src/main.js
git commit -m "Wire survey submission, thank-you and error retry"
```

---

## PHASE 3 — Apps Script + Sheet

### Task 9: Apps Script file and setup guide

**Files:**
- Create: `docs/survey-apps-script.gs`
- Create: `docs/survey-setup.md`

**Interfaces:**
- Produces: a deployable `Code.gs` and the operator steps. The deployment URL is pasted into `src/survey/endpoint.js` (or `.env`) by the operator — not in this task.
- Consumes: the payload shape from Task 7 (Appendix B).

- [ ] **Step 1: Create `docs/survey-apps-script.gs`**

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
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body._hp) return json_({ ok: true, skipped: true });
    const a = body.answers || {};
    const sheet = getSheet_();
    sheet.appendRow([
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
    ]);
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

- [ ] **Step 2: Create `docs/survey-setup.md`**

```markdown
# アンケート回答の保存先セットアップ

1. Google ドライブで新規スプレッドシート「YU-NITY Survey Responses」を作成。
2. 拡張機能 → Apps Script。既定の `Code.gs` の中身を全消去し、`docs/survey-apps-script.gs`
   の内容を貼り付けて保存。
3. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」。
   - 説明: `yu-nity survey`
   - 実行するユーザー: **自分**
   - アクセスできるユーザー: **全員**
   - 「デプロイ」。初回は権限承認ダイアログが出るので許可する。
4. 表示される `https://script.google.com/macros/s/XXXXXXXX/exec` をコピー。
5. どちらかで設定:
   - `src/survey/endpoint.js` の fallback 文字列を貼り替えてコミット、または
   - プロジェクト直下 `.env` に `VITE_SURVEY_ENDPOINT=<コピーしたURL>`（`.env.example` 参照）。
6. `npm run dev` でフォームを1回送信し、スプレッドシートの `responses` シートに
   行が増えることを確認。ヘッダ行は初回送信時に自動作成される。
7. Excel 化: スプレッドシートはそのまま Excel でも開ける。固定ファイルが要る場合は
   ファイル → ダウンロード → Microsoft Excel (.xlsx)。

## 列

`timestamp | language | q1_nationality_code | q1_nationality | q2_visited_before |
q3_familiarity | q4_hesitation | q5_concerns | q6_explanation_helped |
q7_understanding_deepened | q8_impression_change | q9_felt_closer |
q10_free_comment | user_agent`

- `q5_concerns` は `;` 連結（例 `naked;language`）。
- 値は英語の安定キー（回答言語に依存しない）。

## 再デプロイ時の注意

`Code.gs` を変更したら「デプロイを管理」→ 既存デプロイの鉛筆 → バージョン「新規」→ デプロイ。
URL は変わらない。新規デプロイを作ると URL が変わるので注意。
```

- [ ] **Step 3: Verify (manual review — no browser)**

- `docs/survey-apps-script.gs`: read top-to-bottom. `HEADERS` has 14 entries and the `appendRow` in `doPost` pushes exactly 14 values in the same order. `doGet`/`doPost` both return via `json_`.
- `docs/survey-setup.md`: every step is concrete; the column list matches `HEADERS`.

- [ ] **Step 4: Commit**

```bash
git add docs/survey-apps-script.gs docs/survey-setup.md
git commit -m "Add Apps Script and setup guide for survey responses"
```

---

### Task 10: Full multilingual regression + spec note

**Files:**
- Modify: `docs/superpowers/specs/2026-08-31-original-survey-form-design.md` (§9: mark French copy / JA survey copy as shipped-pending-native-check; note the endpoint is still the placeholder until the operator runs `docs/survey-setup.md`)

- [ ] **Step 1: Full walkthrough per language (Playwright MCP)**

For each `lang` in `["ja","en","fr","zh","ko"]`:
1. `evaluate`: `localStorage.clear(); location.reload()` → language gate visible.
2. Click that language in the gate.
3. `evaluate`: assert nav labels + `#page-home` hero + footer are in `lang`, no empty `[data-i18n]`, no leftover other-language text (reuse Task 1 Step 8 assertion #4).
4. Open the survey tab; stub `window.fetch` to resolve `{"ok":true}`; complete all 4 steps with valid answers; Submit.
5. `evaluate`: captured POST body validates against Appendix B; `.survey-thanks__title` shows `surveyForm.thanks.title` for `lang`; `yunity-survey-draft` cleared.
6. `read_console_messages` (error) → none.

- [ ] **Step 2: Edge checks**

- `q5_concerns` `none` exclusivity (both directions) in one language.
- Refresh mid-wizard → draft restores answers and lands on first incomplete step.
- Header language toggle mid-wizard → labels swap, answers kept.
- Hero secondary CTA and teaser CTA both open the survey tab; visiting `#home` and scrolling shows no broken `#survey` anchor.
- Return visit (with `yunity-lang` set) → no language gate.

- [ ] **Step 3: Update the spec's §9**

Append to the spec's "リスク / 前提" section:

```markdown
- 実装状況（2026-08-31 時点）: French ロケール・アンケート日本語訳ともに出荷済み。ネイティブ確認は未実施（`fr.js` の `// NATIVE-CHECK` 箇所と survey `fr.js`）。
- `src/survey/endpoint.js` は placeholder URL のまま。`docs/survey-setup.md` を実施し、実 URL を設定して実送信1回を確認するまで本番回答は保存されない。
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-08-31-original-survey-form-design.md
git commit -m "Record survey feature status in the spec"
```

---

## Self-Review

**1. Spec coverage**

| Spec section | Task(s) |
|---|---|
| §4.1 French locale | Task 1 |
| §4.2 language gate | Task 2 |
| §5.1 nav tab / routing / CTA rewire / hash-collision | Task 3 |
| §5.2 `#page-survey` structure | Task 3 (container) + Task 6 (content) |
| §5.3 question schema | Task 5 |
| §5.4 country field | Task 5 (data) + Task 6 (`<select>` render) |
| §5.5 wizard state/steps/validation/draft/thanks/error | Task 6 + Task 8 |
| §5.6 submit + endpoint | Task 7 (+ wired in Task 8) |
| §5.7 survey i18n | Task 4 |
| §5.8 survey.css | Task 3 (shell) + Task 6 (full) |
| §5.9 main.js init | Task 6 + Task 8 |
| §6 Apps Script + Sheet + setup doc | Task 9 |
| §7 error handling | Task 2 (gate), Task 6 (validation), Task 8 (submit failure) |
| §8 testing | every task's verify step + Task 10 |
| §9 risks / status note | Task 10 |
| §10 file list | matches the File Structure table above |

No uncovered spec requirement.

**2. Placeholder scan** — the only intentional literal placeholder is `REPLACE_WITH_DEPLOYMENT_ID` in `endpoint.js`, which the spec (§5.6) and `docs/survey-setup.md` both call out as operator-filled. No "TBD"/"handle edge cases"/"similar to Task N"/uncoded steps remain. The redundant lines inside the Task 6 `sel` change handler are explicitly flagged with the corrected version to use.

**3. Type consistency**

- `initSurvey({ rootId, submit })` — same signature in Task 6 and Task 8.
- `buildPayload(answers, lang, meta)` — defined Task 7, called Task 8 with `(state.answers, getCurrentLang(), { startedAt, submittedAt })`. Matches.
- `submitSurvey(payload)` — defined Task 7, used Task 8.
- Answer keys: `q1_nationality_code` / `q1_nationality` set by the wizard's country `<select>` (Task 6) and read by `buildPayload` (Task 7) — same names. `isAnswered` special-cases `q1_nationality` on `q1_nationality_code` (Task 6 note).
- `EXCLUSIVE_OPTION` — defined Task 5, consumed Task 6.
- `t(path, vars)` and `translations` export — added Task 6 Step 2, used across Task 6/8.
- `hasStoredLang` — added Task 2, used in `main.js` Task 2.
- Sheet `HEADERS` (Task 9) column order === `buildPayload` answer order + `timestamp`/`language`/`user_agent` framing. 14 == 14.

No signature mismatches found.
