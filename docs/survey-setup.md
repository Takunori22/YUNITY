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
5. どちらかで設定（未設定＝`REPLACE_WITH_DEPLOYMENT_ID` のままだと送信はエラー画面になる）:
   - `src/survey/endpoint.js` の fallback 文字列（`REPLACE_WITH_DEPLOYMENT_ID` を含む URL）を貼り替えてコミット、または
   - プロジェクト直下 `.env` に `VITE_SURVEY_ENDPOINT=<コピーしたURL>`（`.env.example` 参照）。
6. `npm run dev` でフォームを1回送信し、スプレッドシートの `responses` シートに
   行が増えることを確認。ヘッダ行は初回送信時に自動作成される。
7. Excel 化: スプレッドシートはそのまま Excel でも開ける。固定ファイルが要る場合は
   ファイル → ダウンロード → Microsoft Excel (.xlsx)。

## 列

`timestamp | language | q1_nationality_code | q1_nationality | q2_visited_before |
q3_familiarity | q4_hesitation | q5_concerns | q6_explanation_helped |
q7_understanding_deepened | q8_impression_change | q9_felt_closer |
q10_free_comment`

- `q5_concerns` は `;` 連結（例 `naked;language`）。
- 値は英語の安定キー（回答言語に依存しない）。

## 再デプロイ時の注意

`Code.gs` を変更したら「デプロイを管理」→ 既存デプロイの鉛筆 → バージョン「新規」→ デプロイ。
URL は変わらない。新規デプロイを作ると URL が変わるので注意。
