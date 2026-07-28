import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SessionDetails } from "@/components/charts/history-table"
import { exportJSONToCSV } from "@/lib/export"

let capturedBlob: Blob | undefined
let clicked: HTMLAnchorElement[] = []

function row(overrides: Partial<SessionDetails> = {}) {
  return {
    session_id: "s1",
    date: "Mon, Mar 01, 2027",
    time: "10:00 AM",
    duration_minutes: 25,
    on_time: true,
    completed: true,
    session_title: "Focus",
    ...overrides,
  } as SessionDetails
}

/** The blob is never fetched, so read the text back from what was passed in. */
async function csv() {
  return capturedBlob ? await capturedBlob.text() : ""
}

beforeEach(() => {
  capturedBlob = undefined
  clicked = []

  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn((blob: Blob) => {
      capturedBlob = blob
      return "blob:mock-url"
    }),
    revokeObjectURL: vi.fn(),
  })

  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
    function (this: HTMLAnchorElement) {
      clicked.push(this)
    }
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("the csv body", () => {
  it("starts with a header row taken from the keys", async () => {
    exportJSONToCSV([row()])
    expect((await csv()).split("\r\n")[0]).toBe(
      '"session_id","date","time","duration_minutes","on_time","completed",' +
        '"session_title"'
    )
  })

  it("writes one line per session", async () => {
    exportJSONToCSV([row({ session_id: "a" }), row({ session_id: "b" })])
    const lines = (await csv()).trimEnd().split("\r\n")
    expect(lines).toHaveLength(3) // header plus two rows
  })

  it("uses CRLF line endings and a trailing newline", async () => {
    exportJSONToCSV([row()])
    const text = await csv()
    expect(text).toContain("\r\n")
    expect(text.endsWith("\r\n")).toBe(true)
  })

  it("quotes every field", async () => {
    exportJSONToCSV([row({ duration_minutes: 25 })])
    expect(await csv()).toContain('"25"')
  })

  it("declares a utf-8 csv content type", () => {
    exportJSONToCSV([row()])
    expect(capturedBlob?.type).toBe("text/csv;charset=utf-8")
  })
})

describe("escaping", () => {
  it("doubles a quote inside a field", async () => {
    // RFC 4180. Otherwise the field ends early and every later column of that
    // row shifts across
    exportJSONToCSV([row({ session_title: 'he said "hi"' })])
    expect(await csv()).toContain('"he said ""hi"""')
  })

  it("keeps a comma inside its field", async () => {
    exportJSONToCSV([row({ session_title: "write, then edit" })])
    const dataLine = (await csv()).split("\r\n")[1]
    expect(dataLine).toContain('"write, then edit"')
  })

  it("keeps a newline inside its field", async () => {
    exportJSONToCSV([row({ session_title: "line one\nline two" })])
    expect(await csv()).toContain('"line one\nline two"')
  })
})

describe("formula injection", () => {
  // Session titles are set by whoever you were paired with, so a partner could
  // otherwise land a live formula in your spreadsheet
  it.each([
    ["=", "=HYPERLINK(\"http://evil.test\")"],
    ["+", "+1+1"],
    ["-", "-1+1"],
    ["@", "@SUM(A1:A9)"],
    ["tab", "\tleading tab"],
    ["carriage return", "\rleading cr"],
  ])("neutralises a title starting with %s", async (_label, title) => {
    exportJSONToCSV([row({ session_title: title })])
    expect(await csv()).toContain(`"'${title.replace(/"/g, '""')}"`)
  })

  it("leaves an ordinary title alone", async () => {
    exportJSONToCSV([row({ session_title: "Focus" })])
    expect(await csv()).toContain('"Focus"')
    expect(await csv()).not.toContain("\"'Focus\"")
  })

  it("does not prefix a hyphen that appears mid-string", async () => {
    exportJSONToCSV([row({ session_title: "deep-work" })])
    expect(await csv()).toContain('"deep-work"')
  })
})

describe("the download", () => {
  it("clicks an anchor named export.csv", () => {
    exportJSONToCSV([row()])
    expect(clicked).toHaveLength(1)
    expect(clicked[0].download).toBe("export.csv")
  })

  it("points the anchor at a blob url", () => {
    // A data: URL would break on "#": encodeURI leaves it alone, so a session
    // titled "Sprint #3" cut the download off at that point
    exportJSONToCSV([row({ session_title: "Sprint #3" })])
    expect(clicked[0].getAttribute("href")).toBe("blob:mock-url")
  })

  it("survives a title containing a hash", async () => {
    exportJSONToCSV([row({ session_title: "Sprint #3" })])
    expect(await csv()).toContain("Sprint #3")
  })

  it("removes the anchor again", () => {
    exportJSONToCSV([row()])
    expect(document.querySelectorAll("a")).toHaveLength(0)
  })

  it("defers revoking the url past the current tick", async () => {
    // Revoking in the same tick can cancel the download the click just started
    exportJSONToCSV([row()])
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url")
  })

  it("does nothing at all for an empty table", () => {
    exportJSONToCSV([])
    expect(clicked).toHaveLength(0)
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })
})
