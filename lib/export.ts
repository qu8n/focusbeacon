import { SessionDetails } from "@/components/charts/history-table"

// A quoted CSV field escapes its own quotes by doubling them (RFC 4180),
// otherwise a session title like `he said "hi"` ends the field early and
// shifts every later column of that row
function toCsvField(value: unknown) {
  let str = String(value)
  // Excel and Sheets evaluate a field starting with any of these as a formula,
  // quoted or not. Session titles are set by whoever you were paired with, so
  // a partner could otherwise land `=HYPERLINK(...)` in your spreadsheet
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }
  return `"${str.replace(/"/g, '""')}"`
}

export function exportJSONToCSV(rows: SessionDetails[]) {
  if (rows.length === 0) return

  const csvContent =
    [Object.keys(rows[0]), ...rows.map((row) => Object.values(row))]
      .map((fields) => fields.map(toCsvField).join(","))
      .join("\r\n") + "\r\n"

  // A blob URL rather than a `data:` URL: `encodeURI` leaves `#` alone, so one
  // session titled "Sprint #3" used to cut the download off at that point --
  // everything after it read as the URL's fragment
  const url = URL.createObjectURL(
    new Blob([csvContent], { type: "text/csv;charset=utf-8" })
  )

  const element = document.createElement("a")
  element.href = url
  element.download = "export.csv"
  // Firefox only honors a programmatic click on an anchor in the document
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)

  // Revoking in the same tick can cancel the download that click just started
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
