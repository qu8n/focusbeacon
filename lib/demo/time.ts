/**
 * Date and number helpers that reproduce what the Python API does, down to the
 * rounding mode and the leading-zero handling.
 *
 * Anything here that looks fussier than it needs to be is matching a pandas or
 * strftime behaviour exactly. scripts/check-demo-fixture.ts compares this
 * module's output against real endpoint payloads, so "close enough" fails.
 */

export type WeekStartDay = "monday" | "sunday"

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]
const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/**
 * Python's round(), which breaks ties to even where JavaScript's Math.round
 * breaks them upward. Six 25-minute sessions come to exactly 2.5 hours, and
 * the two disagree there.
 */
export function pyRound(value: number): number {
  const floor = Math.floor(value)
  const remainder = value - floor
  if (remainder > 0.5) return floor + 1
  if (remainder < 0.5) return floor
  return floor % 2 === 0 ? floor : floor + 1
}

/** Python's round(value, 1). Scaling by ten is exact for the only values that
 * land on a tie, so the ties-to-even rule above still applies. */
export function pyRound1(value: number): number {
  return pyRound(value * 10) / 10
}

export function msToM(ms: number): number {
  return pyRound(ms / 60000)
}

/** Hours to one decimal, for periods short enough that whole hours would round
 * away most of the progress. */
export function msToHDecimal(ms: number): number {
  return pyRound1(ms / 3600000)
}

export function pyWeekday(date: Date): number {
  return (date.getDay() + 6) % 7
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59
  )
}

export function addDays(date: Date, days: number): Date {
  const shifted = new Date(date.getTime())
  shifted.setDate(shifted.getDate() + days)
  return shifted
}

export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000)
}

/** pandas DateOffset clamps to the end of the target month rather than
 * overflowing into the next one, so January 31 minus one month is February 28
 * and not March 3. */
export function addMonths(date: Date, months: number): Date {
  const target = date.getMonth() + months
  const year = date.getFullYear() + Math.floor(target / 12)
  const month = ((target % 12) + 12) % 12
  return new Date(
    year,
    month,
    Math.min(date.getDate(), daysInMonth(year, month)),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  )
}

export function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12)
}

/** Whole days since the epoch, from the calendar fields rather than the
 * timestamp, so a daylight-saving boundary cannot shift the count. */
export function dayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  )
}

export function daysBetween(from: Date, to: Date): number {
  return dayNumber(to) - dayNumber(from)
}

const TOKENS = /%-?[AaBbdYmIMp]/g

export function strftime(date: Date, format: string): string {
  return format.replace(TOKENS, (token) => {
    switch (token) {
      case "%A":
        return DAY_NAMES[date.getDay()]
      case "%a":
        return DAY_ABBR[date.getDay()]
      case "%B":
        return MONTH_NAMES[date.getMonth()]
      case "%b":
        return MONTH_ABBR[date.getMonth()]
      case "%d":
        return String(date.getDate()).padStart(2, "0")
      case "%-d":
        return String(date.getDate())
      case "%Y":
        return String(date.getFullYear())
      case "%m":
        return String(date.getMonth() + 1).padStart(2, "0")
      case "%I":
        return String(date.getHours() % 12 || 12).padStart(2, "0")
      case "%-I":
        return String(date.getHours() % 12 || 12)
      case "%M":
        return String(date.getMinutes()).padStart(2, "0")
      case "%p":
        return date.getHours() < 12 ? "AM" : "PM"
      default:
        return token
    }
  })
}

/**
 * The API's format_date_label, which strips a zero that follows a space so
 * that "Monday, Jul 06" reads "Monday, Jul 6". Only the subheadings go through
 * this. Chart axis labels are formatted raw and keep their padding, which is
 * why "Jul 03" appears on the previous-weeks chart.
 */
export function formatDateLabel(date: Date, format: string): string {
  return strftime(date, format).split(" 0").join(" ")
}

export function isoDate(date: Date): string {
  return strftime(date, "%Y-%m-%d")
}

export function getCurrDayStart(now: Date): Date {
  return startOfDay(now)
}

export function getCurrWeekStart(now: Date, weekStart: WeekStartDay): Date {
  const today = startOfDay(now)
  const daysSinceWeekStart =
    weekStart === "sunday" ? today.getDay() : pyWeekday(today)
  return addDays(today, -daysSinceWeekStart)
}

export function getCurrMonthStart(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export function getCurrYearStart(now: Date): Date {
  return new Date(now.getFullYear(), 0, 1)
}
