const SHEET_NAME = 'responses';
const HEADERS = [
  'timestamp','language','q1_nationality_code','q1_nationality','q2_visited_before',
  'q3_familiarity','q4_hesitation','q5_concerns','q6_explanation_helped',
  'q7_understanding_deepened','q8_impression_change','q9_felt_closer',
  'q10_free_comment'
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
      sanitize_(body.language || ''),
      sanitize_(a.q1_nationality_code || ''),
      sanitize_(a.q1_nationality || ''),
      sanitize_(a.q2_visited_before || ''),
      sanitize_(a.q3_familiarity || ''),
      sanitize_(a.q4_hesitation || ''),
      sanitize_(Array.isArray(a.q5_concerns) ? a.q5_concerns.join(';') : (a.q5_concerns || '')),
      sanitize_(a.q6_explanation_helped || ''),
      sanitize_(a.q7_understanding_deepened || ''),
      sanitize_(a.q8_impression_change || ''),
      sanitize_(a.q9_felt_closer || ''),
      sanitize_(a.q10_free_comment || '')
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

function sanitize_(v) {
  return (typeof v === 'string' && /^[=+\-@\t\r]/.test(v)) ? "'" + v : v;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
