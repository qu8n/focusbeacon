import { describe, expect, it } from "vitest"

import { getFormattedDate } from "@/lib/date"

describe("getFormattedDate", () => {
  it("formats a Date", () => {
    expect(getFormattedDate(new Date(2027, 2, 10))).toBe("March 10, 2027")
  })

  it("formats a date-only string from the API", () => {
    expect(getFormattedDate("2027-03-10")).toBe("March 10, 2027")
  })

  it("does not shift the day for viewers behind UTC", () => {
    // new Date("2024-03-10") is UTC midnight, which is still 9 March in the
    // Americas. The API sends local calendar days, so the parts are read out
    // individually instead.
    expect(getFormattedDate("2024-03-10")).toBe("March 10, 2024")
  })

  it("handles the first of the month", () => {
    expect(getFormattedDate("2027-01-01")).toBe("January 1, 2027")
  })

  it("handles the last of the month", () => {
    expect(getFormattedDate("2027-12-31")).toBe("December 31, 2027")
  })

  it("handles a leap day", () => {
    expect(getFormattedDate("2028-02-29")).toBe("February 29, 2028")
  })

  it("agrees between the two input shapes", () => {
    expect(getFormattedDate("2027-07-04")).toBe(
      getFormattedDate(new Date(2027, 6, 4))
    )
  })
})
