/**
 * Receives RSVP submissions from the wedding website and writes
 * each one as a new row in this spreadsheet.
 *
 * Setup is in the README, step 4. You do not need to change anything
 * in this file unless you add or remove fields on the RSVP form.
 */

// These must match the `name` attributes on the form inputs in rsvp.html.
var FIELDS = [
  'submittedAt',
  'name',
  'email',
  'attending',
  'guests',
  'guestNames',
  'dietary',
  'song',
  'message'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write the header row once, the first time a reply comes in.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(FIELDS);
      sheet.getRange(1, 1, 1, FIELDS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var params = (e && e.parameter) ? e.parameter : {};
    var row = FIELDS.map(function (field) {
      return params[field] || '';
    });

    sheet.appendRow(row);

    // Optional: email yourself on every reply.
    // Remove the // from the next three lines and put your address in.
    // MailApp.sendEmail('you@example.com',
    //   'RSVP: ' + (params.name || 'someone'),
    //   FIELDS.map(function (f) { return f + ': ' + (params[f] || '-'); }).join('\n'));

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('RSVP endpoint is running.');
}
