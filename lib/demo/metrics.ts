/**
 * A TypeScript port of api_utils/metric.py, for the demo dashboard only.
 *
 * Signed-in users still get these numbers from Python. This exists so the demo
 * can derive its charts from a static fixture in the browser rather than
 * waking a serverless function, and every function below is checked against
 * the real endpoint output by scripts/check-demo-fixture.ts at eight different
 * dates. Where the Python does something surprising, this matches the Python.
 */

import {
  DemoSession,
  DurationCounts,
  DURATION_KEYS,
  DurationKey,
  emptyCounts,
} from "./sessions"

// Mirrors ON_TIME_GRACE_SECONDS in api_utils/metric.py. History and the
// punctuality chart used to disagree here -- 2 minutes vs 60s -- so the same
// session read "On time: Yes" in the table and Late in the chart.
const ON_TIME_GRACE_SECONDS = 60
import {
  addDays,
  addMonths,
  addYears,
  dayNumber,
  getCurrWeekStart,
  isoDate,
  msToH,
  pyRound,
  pyWeekday,
  startOfDay,
  strftime,
  WeekStartDay,
} from "./time"

export type PeriodFreq = "D" | "W" | "M"

export interface RangeChartRow extends DurationCounts {
  start_period_str: string
}

export interface HourChartRow extends DurationCounts {
  start_time_hour: string
}

export interface HistoryRow {
  session_id: string
  completed: boolean
  session_title: string
  date: string
  time: string
  duration_minutes: number
  on_time: boolean
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, hour) => {
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`
})

/** Day 0 of the epoch was a Thursday, which Python numbers 3. */
function weekdayOfDay(day: number): number {
  return (((day + 3) % 7) + 7) % 7
}

// Mirrors WEEKEND_BRIDGE_DAYS in api_utils/metric.py. Keyed
// "previousWeekday-currentWeekday", valued with the gap the bridge may span.
// Matching on weekday alone made a Friday and a Monday ten days later count
// as consecutive.
const WEEKEND_BRIDGE_DAYS: Record<string, number> = {
  "4-0": 3, // Friday -> Monday, over Saturday and Sunday
  "5-0": 2, // Saturday -> Monday, over Sunday
  "4-6": 2, // Friday -> Sunday, over Saturday
}

function bridgesAWeekend(previousDay: number, currentDay: number): boolean {
  const expectedGap =
    WEEKEND_BRIDGE_DAYS[
      `${weekdayOfDay(previousDay)}-${weekdayOfDay(currentDay)}`
    ]
  return expectedGap !== undefined && currentDay - previousDay === expectedGap
}

function dateOfDay(day: number, reference: Date): Date {
  return addDays(reference, day - dayNumber(reference))
}

export function countPartners(sessions: DemoSession[]): number {
  const seen: Record<number, true> = {}
  sessions.forEach((session) => {
    seen[session.partnerId] = true
  })
  return Object.keys(seen).length
}

export function calcRepeatPartners(sessions: DemoSession[]): number {
  const counts: Record<number, number> = {}
  sessions.forEach((session) => {
    counts[session.partnerId] = (counts[session.partnerId] || 0) + 1
  })
  return Object.keys(counts).filter((id) => counts[Number(id)] > 1).length
}

function periodKey(
  date: Date,
  freq: PeriodFreq,
  weekStart: WeekStartDay
): number {
  if (freq === "D") return dayNumber(date)
  if (freq === "W") return dayNumber(getCurrWeekStart(date, weekStart))
  return date.getFullYear() * 12 + date.getMonth()
}

/**
 * Consecutive periods, most recent first, that hold at least one session.
 * Missing today does not break the streak but having one extends it, and a
 * skipped weekend does not break a daily streak.
 */
export function calcCurrStreak(
  sessions: DemoSession[],
  freq: PeriodFreq,
  now: Date,
  weekStart: WeekStartDay = "monday"
): number {
  if (sessions.length === 0) return 0

  const keys: Record<number, true> = {}
  let earliest = Infinity
  sessions.forEach((session) => {
    const key = periodKey(session.start, freq, weekStart)
    keys[key] = true
    if (key < earliest) earliest = key
  })

  const step = freq === "W" ? 7 : 1
  const currPeriod = periodKey(now, freq, weekStart)
  let streak = 0

  for (let key = currPeriod - step; key >= earliest; key -= step) {
    if (keys[key]) {
      streak += 1
      continue
    }
    if (freq === "D" && weekdayOfDay(key) > 4) continue
    break
  }

  if (keys[currPeriod]) streak += 1
  return streak
}

/**
 * The longest daily streak on record, and when it ran.
 *
 * The weekend rule here is the Python's: a Friday followed by a Monday extends
 * the streak on weekday grounds alone, without checking that the two are
 * actually one weekend apart. Reproduced rather than corrected, so the demo
 * shows what a signed-in user would see.
 */
export function calcMaxDailyStreak(sessions: DemoSession[]): {
  count: number
  date_range: [string, string]
} {
  const days: number[] = []
  const seen: Record<number, true> = {}
  sessions.forEach((session) => {
    const day = dayNumber(session.start)
    if (!seen[day]) {
      seen[day] = true
      days.push(day)
    }
  })
  days.sort((a, b) => a - b)

  let maxStreak = 0
  let maxStart = days[0]
  let maxEnd = days[0]
  let current = 1
  let currentStart = days[0]

  for (let i = 1; i < days.length; i += 1) {
    const currentDate = days[i]
    const previousDate = days[i - 1]

    if (currentDate === previousDate + 1) {
      current += 1
    } else if (bridgesAWeekend(previousDate, currentDate)) {
      current += 1
    } else {
      if (current > maxStreak) {
        maxStreak = current
        maxStart = currentStart
        maxEnd = previousDate
      }
      current = 1
      currentStart = currentDate
    }
  }

  if (current > maxStreak) {
    maxStreak = current
    maxStart = currentStart
    maxEnd = days[days.length - 1]
  }

  const reference = sessions[0].start
  return {
    count: maxStreak,
    date_range: [
      isoDate(dateOfDay(maxStart, reference)),
      isoDate(dateOfDay(maxEnd, reference)),
    ],
  }
}

export function calcHeatmapData(
  sessions: DemoSession[],
  now: Date,
  weekStart: WeekStartDay = "monday"
) {
  // The Nivo calendar's "to" is exclusive, hence tomorrow rather than today.
  // Anchored to midnight, matching calc_heatmap_data: carrying the time of day
  // pushed the week-start day out of the window, leaving the first column
  // empty, and dropped sessions earlier in the day than the current time.
  const tomorrow = addDays(startOfDay(now), 1)
  const oneYearAgo = addYears(tomorrow, -1)
  const daysToWeekStart =
    weekStart === "sunday" ? oneYearAgo.getDay() : pyWeekday(oneYearAgo)
  const windowStart = addDays(oneYearAgo, -daysToWeekStart)

  const inWindow = sessions.filter(
    (session) => session.start >= windowStart && session.start <= tomorrow
  )

  const counts: Record<string, number> = {}
  inWindow.forEach((session) => {
    const day = isoDate(session.start)
    counts[day] = (counts[day] || 0) + 1
  })

  const data = Object.keys(counts)
    .sort()
    .map((day) => ({ day, value: counts[day] }))

  return {
    from: isoDate(windowStart),
    to: isoDate(tomorrow),
    data,
    past_year_sessions: inWindow.length,
  }
}

function periodStart(
  date: Date,
  freq: PeriodFreq,
  weekStart: WeekStartDay
): Date {
  if (freq === "D") return startOfDay(date)
  if (freq === "W") return getCurrWeekStart(date, weekStart)
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function nextPeriod(date: Date, freq: PeriodFreq): Date {
  if (freq === "D") return addDays(date, 1)
  if (freq === "W") return addDays(date, 7)
  return addMonths(date, 1)
}

export function calcChartDataByRange(
  sessions: DemoSession[],
  startDate: Date,
  endDate: Date,
  freq: PeriodFreq,
  format: string,
  weekStart: WeekStartDay = "monday"
): RangeChartRow[] {
  const counts: Record<string, DurationCounts> = {}
  const starts: Record<string, Date> = {}

  const claim = (date: Date): string => {
    const start = periodStart(date, freq, weekStart)
    const key = isoDate(start)
    if (!counts[key]) {
      counts[key] = emptyCounts()
      starts[key] = start
    }
    return key
  }

  sessions.forEach((session) => {
    counts[claim(session.start)][session.durationKey] += 1
  })

  // Periods with no sessions still need a bar
  const last = periodStart(endDate, freq, weekStart)
  for (
    let cursor = periodStart(startDate, freq, weekStart);
    cursor <= last;
    cursor = nextPeriod(cursor, freq)
  ) {
    claim(cursor)
  }

  return Object.keys(counts)
    .sort()
    .map((key) => ({
      start_period_str: strftime(starts[key], format),
      ...counts[key],
    }))
}

export function calcChartDataByHour(sessions: DemoSession[]): HourChartRow[] {
  const rows = HOUR_LABELS.map((label) => ({
    start_time_hour: label,
    ...emptyCounts(),
  }))
  sessions.forEach((session) => {
    rows[session.start.getHours()][session.durationKey] += 1
  })
  return rows
}

export function calcHistoryData(
  sessions: DemoSession[],
  now: Date,
  head?: number
): HistoryRow[] {
  const rows = sessions
    .slice()
    .sort((a, b) => b.start.getTime() - a.start.getTime())
    .filter((session) => session.start < now)

  return (head === undefined ? rows : rows.slice(0, head)).map((session) => ({
    session_id: session.sessionId,
    completed: session.completed,
    // The faker leaves every title blank, and blank titles read as "N/A"
    session_title: "N/A",
    date: strftime(session.start, "%a, %b %d, %Y"),
    time: strftime(session.start, "%I:%M %p"),
    duration_minutes: session.durationMs / 60000,
    on_time:
      session.joinDelta !== null &&
      session.joinDelta <= ON_TIME_GRACE_SECONDS,
  }))
}

export function calcDurationPieData(sessions: DemoSession[]) {
  return DURATION_KEYS.map((duration: DurationKey) => ({
    duration,
    amount: sessions.filter((session) => session.durationKey === duration)
      .length,
  }))
}

export function formatSeconds(value: number): string {
  if (Number.isNaN(value)) return "N/A"

  const rounded = pyRound(value)
  const punctuality = rounded <= 0 ? "early" : "late"
  const seconds = Math.abs(rounded)

  if (seconds <= 60) return `${seconds}s ${punctuality}`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s ${punctuality}`
}

export function calcPunctualityPieData(sessions: DemoSession[]) {
  const deltas: number[] = []
  sessions.forEach((session) => {
    if (session.joinDelta !== null) deltas.push(session.joinDelta)
  })

  const sorted = deltas.slice().sort((a, b) => a - b)
  const mean = deltas.length
    ? deltas.reduce((total, value) => total + value, 0) / deltas.length
    : NaN
  const middle = Math.floor(sorted.length / 2)
  const median = !sorted.length
    ? NaN
    : sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2

  const lateSeconds = ON_TIME_GRACE_SECONDS
  return {
    data: [
      {
        punctuality: "On time",
        amount: deltas.filter((delta) => delta <= lateSeconds).length,
      },
      {
        punctuality: "Late",
        amount: deltas.filter((delta) => delta > lateSeconds).length,
      },
    ],
    avg: formatSeconds(mean),
    median: formatSeconds(median),
  }
}

export function calcCumulativeSessionsChart(sessions: DemoSession[]) {
  const perDay: Record<number, DurationCounts> = {}
  let first = Infinity
  let last = -Infinity

  sessions.forEach((session) => {
    const day = dayNumber(session.start)
    if (!perDay[day]) perDay[day] = emptyCounts()
    perDay[day][session.durationKey] += 1
    if (day < first) first = day
    if (day > last) last = day
  })

  const running = emptyCounts()
  const rows = []
  let cursor = startOfDay(dateOfDay(first, sessions[0].start))

  for (let day = first; day <= last; day += 1) {
    const counts = perDay[day]
    if (counts) {
      DURATION_KEYS.forEach((key) => {
        running[key] += counts[key]
      })
    }
    rows.push({
      start_date: strftime(cursor, "%b %-d, %Y"),
      ...running,
    })
    cursor = addDays(cursor, 1)
  }

  return rows
}

export function calcDailyRecord(sessions: DemoSession[]) {
  const perDay: Record<number, number> = {}
  sessions.forEach((session) => {
    const day = dayNumber(session.start)
    perDay[day] = (perDay[day] || 0) + session.durationMs
  })

  const days = Object.keys(perDay)
    .map(Number)
    .sort((a, b) => a - b)

  // Ties go to the earliest day, matching idxmax on a date-sorted index
  let best = days[0]
  days.forEach((day) => {
    if (perDay[day] > perDay[best]) best = day
  })

  return {
    date: strftime(dateOfDay(best, sessions[0].start), "%b %-d, %Y"),
    duration: msToH(perDay[best]),
  }
}
