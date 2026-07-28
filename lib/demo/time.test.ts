/**
 * These helpers exist to reproduce pandas and strftime behaviour exactly, so
 * the tests are written against the Python semantics rather than against what
 * JavaScript would do naturally. `npm run check:demo` proves the whole
 * pipeline matches; this file localises a failure to the helper that caused
 * it.
 */

import { describe, expect, it } from "vitest"

import {
  addDays,
  addMonths,
  addSeconds,
  addYears,
  dayNumber,
  daysBetween,
  daysInMonth,
  endOfDay,
  formatDateLabel,
  getCurrDayStart,
  getCurrMonthStart,
  getCurrWeekStart,
  getCurrYearStart,
  isoDate,
  msToH,
  msToHDecimal,
  msToM,
  pyRound,
  pyRound1,
  pyWeekday,
  startOfDay,
  strftime,
} from "@/lib/demo/time"

describe("pyRound", () => {
  it("rounds down below a half", () => {
    expect(pyRound(1.4)).toBe(1)
  })

  it("rounds up above a half", () => {
    expect(pyRound(1.6)).toBe(2)
  })

  it.each([
    [0.5, 0],
    [1.5, 2],
    [2.5, 2],
    [3.5, 4],
    [4.5, 4],
  ])("breaks the tie at %s to even, giving %s", (input, expected) => {
    // Math.round would give 1, 2, 3, 4, 5 here. Six 25-minute sessions come
    // to exactly 2.5 hours, which is where the two disagree.
    expect(pyRound(input)).toBe(expected)
  })

  it("handles zero and negatives the way floor-based rounding does", () => {
    expect(pyRound(0)).toBe(0)
    expect(pyRound(-1.4)).toBe(-1)
  })
})

describe("pyRound1", () => {
  it("keeps one decimal place", () => {
    expect(pyRound1(1.24)).toBe(1.2)
    expect(pyRound1(1.26)).toBe(1.3)
  })

  it("breaks a tie at the first decimal to even", () => {
    expect(pyRound1(0.25)).toBe(0.2)
    expect(pyRound1(0.35)).toBe(0.4)
  })

  it("handles a negative delta", () => {
    expect(pyRound1(-0.84)).toBe(-0.8)
  })
})

describe("duration conversions", () => {
  it("converts to whole minutes", () => {
    expect(msToM(1500000)).toBe(25)
    expect(msToM(3000000)).toBe(50)
  })

  it("converts to whole hours with banker's rounding", () => {
    expect(msToH(3600000)).toBe(1)
    expect(msToH(1.5 * 3600000)).toBe(2)
    expect(msToH(2.5 * 3600000)).toBe(2)
  })

  it("converts to one decimal hour", () => {
    expect(msToHDecimal(3 * 1500000)).toBe(1.2)
    expect(msToHDecimal(0)).toBe(0)
  })
})

describe("pyWeekday", () => {
  it("makes Monday zero and Sunday six", () => {
    // 2027-03-08 is a Monday, 2027-03-14 the Sunday that closes that week
    expect(pyWeekday(new Date(2027, 2, 8))).toBe(0)
    expect(pyWeekday(new Date(2027, 2, 14))).toBe(6)
  })
})

describe("day arithmetic", () => {
  it("startOfDay drops the time", () => {
    const result = startOfDay(new Date(2027, 2, 10, 15, 42, 7))
    expect(result.getHours()).toBe(0)
    expect(result.getDate()).toBe(10)
  })

  it("endOfDay lands on the last second", () => {
    const result = endOfDay(new Date(2027, 2, 10, 9, 0, 0))
    expect([result.getHours(), result.getMinutes(), result.getSeconds()])
      .toEqual([23, 59, 59])
  })

  it("addDays crosses a month boundary", () => {
    expect(isoDate(addDays(new Date(2027, 2, 30), 3))).toBe("2027-04-02")
  })

  it("addDays goes backwards", () => {
    expect(isoDate(addDays(new Date(2027, 2, 2), -3))).toBe("2027-02-27")
  })

  it("addSeconds crosses midnight", () => {
    const result = addSeconds(new Date(2027, 2, 10, 23, 59, 30), 60)
    expect(result.getDate()).toBe(11)
  })

  it("daysInMonth knows February in a leap year", () => {
    expect(daysInMonth(2028, 1)).toBe(29)
    expect(daysInMonth(2027, 1)).toBe(28)
  })

  it("dayNumber ignores the time of day", () => {
    expect(dayNumber(new Date(2027, 2, 10, 0, 0))).toBe(
      dayNumber(new Date(2027, 2, 10, 23, 59))
    )
  })

  it("daysBetween counts calendar days", () => {
    expect(daysBetween(new Date(2027, 2, 1), new Date(2027, 2, 10))).toBe(9)
  })

  it("daysBetween is unaffected by a daylight-saving change", () => {
    // US DST starts 2027-03-14. A timestamp subtraction would give 6.958 days
    // here and floor to 6; reading the calendar fields gives the right answer
    // whatever the runner's timezone.
    expect(daysBetween(new Date(2027, 2, 10), new Date(2027, 2, 17))).toBe(7)
  })
})

describe("addMonths", () => {
  it("adds a month", () => {
    expect(isoDate(addMonths(new Date(2027, 0, 15), 1))).toBe("2027-02-15")
  })

  it("clamps to the end of a shorter target month", () => {
    // pandas DateOffset clamps rather than overflowing, so 31 January minus
    // one month is 28 February, not 3 March
    expect(isoDate(addMonths(new Date(2027, 0, 31), 1))).toBe("2027-02-28")
    expect(isoDate(addMonths(new Date(2027, 2, 31), -1))).toBe("2027-02-28")
  })

  it("clamps to 29 February in a leap year", () => {
    expect(isoDate(addMonths(new Date(2028, 0, 31), 1))).toBe("2028-02-29")
  })

  it("crosses a year backwards", () => {
    expect(isoDate(addMonths(new Date(2027, 1, 15), -3))).toBe("2026-11-15")
  })

  it("crosses a year forwards", () => {
    expect(isoDate(addMonths(new Date(2027, 10, 15), 3))).toBe("2028-02-15")
  })

  it("preserves the time of day", () => {
    const result = addMonths(new Date(2027, 0, 15, 13, 45, 30), 1)
    expect([result.getHours(), result.getMinutes(), result.getSeconds()])
      .toEqual([13, 45, 30])
  })

  it("addYears clamps a leap day", () => {
    expect(isoDate(addYears(new Date(2028, 1, 29), 1))).toBe("2029-02-28")
  })
})

describe("strftime", () => {
  const date = new Date(2027, 2, 6, 9, 5) // Saturday 6 March 2027, 09:05

  it.each([
    ["%A", "Saturday"],
    ["%a", "Sat"],
    ["%B", "March"],
    ["%b", "Mar"],
    ["%d", "06"],
    ["%-d", "6"],
    ["%Y", "2027"],
    ["%m", "03"],
    ["%I", "09"],
    ["%M", "05"],
    ["%p", "AM"],
  ])("renders %s", (token, expected) => {
    expect(strftime(date, token)).toBe(expected)
  })

  it("renders a composite format", () => {
    expect(strftime(date, "%A, %b %d")).toBe("Saturday, Mar 06")
  })

  it("renders midnight as 12 AM and noon as 12 PM", () => {
    expect(strftime(new Date(2027, 2, 6, 0, 0), "%I %p")).toBe("12 AM")
    expect(strftime(new Date(2027, 2, 6, 12, 0), "%I %p")).toBe("12 PM")
  })

  it("leaves an unknown token alone", () => {
    expect(strftime(date, "%Z")).toBe("%Z")
  })

  it("leaves literal text alone", () => {
    expect(strftime(date, "week of %b %-d")).toBe("week of Mar 6")
  })
})

describe("formatDateLabel", () => {
  it("strips the zero padding after a space", () => {
    expect(formatDateLabel(new Date(2027, 6, 6), "%A, %b %d")).toBe(
      "Tuesday, Jul 6"
    )
  })

  it("leaves a two-digit day alone", () => {
    expect(formatDateLabel(new Date(2027, 6, 16), "%A, %b %d")).toBe(
      "Friday, Jul 16"
    )
  })

  it("matches the Python helper, which only strips after a space", () => {
    // Chart axis labels are formatted raw and keep their padding, which is
    // why "Jul 03" appears on the previous-weeks chart
    expect(strftime(new Date(2027, 6, 3), "%b %d")).toBe("Jul 03")
    expect(formatDateLabel(new Date(2027, 6, 3), "%b %d")).toBe("Jul 3")
  })
})

describe("period starts", () => {
  it("getCurrDayStart drops the time", () => {
    expect(isoDate(getCurrDayStart(new Date(2027, 2, 10, 23, 59)))).toBe(
      "2027-03-10"
    )
  })

  it.each([
    [new Date(2027, 2, 10), "2027-03-08"], // Wednesday
    [new Date(2027, 2, 8), "2027-03-08"], // Monday itself
    [new Date(2027, 2, 14), "2027-03-08"], // Sunday closes that week
  ])("getCurrWeekStart with a Monday start", (now, expected) => {
    expect(isoDate(getCurrWeekStart(now, "monday"))).toBe(expected)
  })

  it.each([
    [new Date(2027, 2, 10), "2027-03-07"],
    [new Date(2027, 2, 7), "2027-03-07"], // Sunday itself
    [new Date(2027, 2, 13), "2027-03-07"], // Saturday closes that week
  ])("getCurrWeekStart with a Sunday start", (now, expected) => {
    expect(isoDate(getCurrWeekStart(now, "sunday"))).toBe(expected)
  })

  it("getCurrMonthStart", () => {
    expect(isoDate(getCurrMonthStart(new Date(2027, 2, 31)))).toBe(
      "2027-03-01"
    )
  })

  it("getCurrYearStart", () => {
    expect(isoDate(getCurrYearStart(new Date(2027, 11, 31)))).toBe(
      "2027-01-01"
    )
  })
})
