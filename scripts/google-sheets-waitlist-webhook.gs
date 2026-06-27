const SHEET_NAME = 'Care List'
const EXPECTED_HEADERS = ['Submitted At', 'Email', 'Source', 'Tags']

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}')
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('WAITLIST_WEBHOOK_SECRET')

    if (expectedSecret && payload.secret !== expectedSecret) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    const email = String(payload.email || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ success: false, error: 'Invalid email' }, 400)
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    const sheet = getOrCreateSheet(spreadsheet)
    ensureHeaders(sheet)

    const existingRow = findEmailRow(sheet, email)
    const rowValues = [
      payload.submittedAt || new Date().toISOString(),
      email,
      payload.source || 'Hubs & Babydoll website care list',
      Array.isArray(payload.tags) ? payload.tags.join(', ') : String(payload.tags || ''),
    ]

    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues])
      return jsonResponse({ success: true, updated: true })
    }

    sheet.appendRow(rowValues)
    return jsonResponse({ success: true, created: true })
  } catch (error) {
    return jsonResponse({ success: false, error: error.message }, 500)
  }
}

function getOrCreateSheet(spreadsheet) {
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME)
}

function ensureHeaders(sheet) {
  const currentHeaders = sheet.getRange(1, 1, 1, EXPECTED_HEADERS.length).getValues()[0]
  const needsHeaders = EXPECTED_HEADERS.some((header, index) => currentHeaders[index] !== header)

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, EXPECTED_HEADERS.length).setValues([EXPECTED_HEADERS])
    sheet.setFrozenRows(1)
  }
}

function findEmailRow(sheet, email) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return null

  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues()
  const index = values.findIndex(([storedEmail]) => String(storedEmail).trim().toLowerCase() === email)
  return index === -1 ? null : index + 2
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
}
