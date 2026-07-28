/**
 * A TypeScript port of the endpoint bodies in api/index.py, for the demo only.
 *
 * Each function returns exactly what its endpoint returns, so the dashboard
 * components cannot tell the difference. scripts/check-demo-fixture.ts holds
 * that claim to the letter.
 */

import {
  calcChartDataByHour,
  calcChartDataByRange,
  calcCumulativeSessionsChart,
  calcCurrStreak,
  calcDailyRecord,
  calcDurationPieData,
  calcHeatmapData,
  calcHistoryData,
  calcTimeHeatmapData,
  calcMaxDailyStreak,
  calcPunctualityPieData,
  calcRepeatPartners,
  countPartners,
} from "./metrics"
import {
  between,
  buildSessions,
  completedOnly,
  DEMO_PROFILE,
  totalDurationMs,
} from "./sessions"
import {
  addDays,
  addMonths,
  addSeconds,
  addYears,
  formatDateLabel,
  getCurrDayStart,
  getCurrMonthStart,
  getCurrWeekStart,
  getCurrYearStart,
  msToHDecimal,
  msToM,
  pyRound1,
  WeekStartDay,
} from "./time"

const DATE_LABEL = "%A, %b %d"
const END_OF_DAY_SECONDS = 23 * 3600 + 59 * 60 + 59

export function buildStreak(now: Date, weekStart: WeekStartDay) {
  const allSessions = buildSessions(now)
  const sessions = completedOnly(allSessions)

  const currDayStart = getCurrDayStart(now)
  const prevDayStart = addDays(currDayStart, -1)

  const currDaySessions = between(sessions, currDayStart)
  const prevDaySessions = between(sessions, prevDayStart, currDayStart)

  const currDayHours = msToHDecimal(totalDurationMs(currDaySessions))
  const prevDayHours = msToHDecimal(totalDurationMs(prevDaySessions))

  return {
    daily_streak: calcCurrStreak(sessions, "D", now),
    // Nothing to write to, so nothing ever increases
    daily_streak_increased: false,
    weekly_streak: calcCurrStreak(sessions, "W", now, weekStart),
    monthly_streak: calcCurrStreak(sessions, "M", now),
    max_daily_streak: calcMaxDailyStreak(sessions),
    heatmap_data: calcHeatmapData(sessions, now, weekStart),
    time_heatmap_data: calcTimeHeatmapData(sessions, now, weekStart),
    history_data: calcHistoryData(allSessions, now, 3),
    daily: {
      subheading: formatDateLabel(currDayStart, DATE_LABEL),
      sessions_total: currDaySessions.length,
      sessions_delta: currDaySessions.length - prevDaySessions.length,
      hours_total: currDayHours,
      // Deltas come off the rounded hours so they always reconcile with the
      // two numbers a user can actually see
      hours_delta: pyRound1(currDayHours - prevDayHours),
      partners_total: countPartners(currDaySessions),
      partners_repeat: calcRepeatPartners(currDaySessions),
      period_type: "day",
    },
    charts: {
      hour: calcChartDataByHour(currDaySessions),
    },
  }
}

export function buildWeek(now: Date, weekStart: WeekStartDay) {
  const sessions = completedOnly(buildSessions(now))

  const currWeekStart = getCurrWeekStart(now, weekStart)
  const currWeekEnd = addSeconds(addDays(currWeekStart, 6), END_OF_DAY_SECONDS)
  const prevWeekStart = addDays(currWeekStart, -7)
  const l4wStart = addDays(currWeekStart, -28)
  const l4wEnd = addDays(currWeekEnd, -7)

  const currWeekSessions = between(sessions, currWeekStart)
  const prevWeekSessions = between(sessions, prevWeekStart, currWeekStart)
  const l4wSessions = between(sessions, l4wStart, currWeekStart)

  // Decimal hours because an hours goal is measured against this number, and
  // whole hours would round away up to half an hour of progress
  const currWeekHours = msToHDecimal(totalDurationMs(currWeekSessions))
  const prevWeekHours = msToHDecimal(totalDurationMs(prevWeekSessions))

  return {
    curr_period: {
      subheading: `${formatDateLabel(currWeekStart, DATE_LABEL)} - ${formatDateLabel(currWeekEnd, DATE_LABEL)}`,
      sessions_total: currWeekSessions.length,
      sessions_delta: currWeekSessions.length - prevWeekSessions.length,
      hours_total: currWeekHours,
      hours_delta: pyRound1(currWeekHours - prevWeekHours),
      partners_total: countPartners(currWeekSessions),
      partners_repeat: calcRepeatPartners(currWeekSessions),
      period_type: "week",
    },
    prev_period: {
      subheading: `${formatDateLabel(l4wStart, DATE_LABEL)} - ${formatDateLabel(l4wEnd, DATE_LABEL)}`,
      sessions_total: l4wSessions.length,
    },
    charts: {
      curr_period: calcChartDataByRange(
        currWeekSessions,
        currWeekStart,
        currWeekEnd,
        "D",
        "%a",
        weekStart
      ),
      prev_period: calcChartDataByRange(
        l4wSessions,
        l4wStart,
        l4wEnd,
        "W",
        "%b %d",
        weekStart
      ),
      punctuality: calcPunctualityPieData(l4wSessions),
      duration: calcDurationPieData(l4wSessions),
      hour: calcChartDataByHour(l4wSessions),
    },
  }
}

export function buildMonth(now: Date) {
  const sessions = completedOnly(buildSessions(now))

  const currMonthStart = getCurrMonthStart(now)
  const currMonthEnd = addDays(addMonths(currMonthStart, 1), -1)
  const prevMonthStart = addMonths(currMonthStart, -1)
  const l6mStart = addMonths(currMonthStart, -6)
  const l6mEnd = addMonths(currMonthEnd, -1)

  const currMonthSessions = between(sessions, currMonthStart)
  const prevMonthSessions = between(sessions, prevMonthStart, currMonthStart)
  const l6mSessions = between(sessions, l6mStart, currMonthStart)

  const dateFormat = "%B %Y"
  const currMonthHours = msToHDecimal(totalDurationMs(currMonthSessions))
  const prevMonthHours = msToHDecimal(totalDurationMs(prevMonthSessions))

  return {
    curr_period: {
      subheading: formatDateLabel(currMonthStart, dateFormat),
      sessions_total: currMonthSessions.length,
      sessions_delta: currMonthSessions.length - prevMonthSessions.length,
      hours_total: currMonthHours,
      hours_delta: pyRound1(currMonthHours - prevMonthHours),
      partners_total: countPartners(currMonthSessions),
      partners_repeat: calcRepeatPartners(currMonthSessions),
      period_type: "month",
    },
    prev_period: {
      subheading: `${formatDateLabel(l6mStart, dateFormat)} - ${formatDateLabel(l6mEnd, dateFormat)}`,
      sessions_total: l6mSessions.length,
    },
    charts: {
      curr_period: calcChartDataByRange(
        currMonthSessions,
        currMonthStart,
        currMonthEnd,
        "D",
        "%-d"
      ),
      prev_period: calcChartDataByRange(
        l6mSessions,
        l6mStart,
        l6mEnd,
        "M",
        "%b %Y"
      ),
      punctuality: calcPunctualityPieData(l6mSessions),
      duration: calcDurationPieData(l6mSessions),
      hour: calcChartDataByHour(l6mSessions),
    },
  }
}

export function buildYear(now: Date) {
  const sessions = completedOnly(buildSessions(now))

  const currYearStart = getCurrYearStart(now)
  const currYearEnd = addDays(addYears(currYearStart, 1), -1)
  const prevYearStart = addYears(currYearStart, -1)
  const prevYearEnd = addYears(currYearEnd, -1)

  const currYearSessions = between(sessions, currYearStart)
  const prevYearSessions = between(sessions, prevYearStart, currYearStart)

  const dateFormat = "%Y"
  const currYearHours = msToHDecimal(totalDurationMs(currYearSessions))
  const prevYearHours = msToHDecimal(totalDurationMs(prevYearSessions))

  return {
    curr_period: {
      subheading: formatDateLabel(currYearStart, dateFormat),
      sessions_total: currYearSessions.length,
      sessions_delta: currYearSessions.length - prevYearSessions.length,
      hours_total: currYearHours,
      hours_delta: pyRound1(currYearHours - prevYearHours),
      partners_total: countPartners(currYearSessions),
      partners_repeat: calcRepeatPartners(currYearSessions),
      period_type: "year",
    },
    prev_period: {
      subheading: formatDateLabel(prevYearStart, dateFormat),
      sessions_total: prevYearSessions.length,
      hours_total: prevYearHours,
      partners_total: countPartners(prevYearSessions),
      partners_repeat: calcRepeatPartners(prevYearSessions),
    },
    charts: {
      curr_period: calcChartDataByRange(
        currYearSessions,
        currYearStart,
        currYearEnd,
        "M",
        "%b"
      ),
      prev_period: calcChartDataByRange(
        prevYearSessions,
        prevYearStart,
        prevYearEnd,
        "M",
        "%b"
      ),
      punctuality: calcPunctualityPieData(prevYearSessions),
      duration: calcDurationPieData(prevYearSessions),
      hour: calcChartDataByHour(prevYearSessions),
    },
  }
}

export function buildLifetime(now: Date) {
  const sessions = completedOnly(buildSessions(now))

  let earliest = sessions[0].start
  sessions.forEach((session) => {
    if (session.start < earliest) earliest = session.start
  })
  const firstSessionDate = formatDateLabel(earliest, "%B %-d, %Y")

  return {
    curr_period: {
      subheading: `${firstSessionDate} - Present`,
      sessions_total: DEMO_PROFILE.total_session_count,
      hours_total: msToHDecimal(totalDurationMs(sessions)),
      partners_total: countPartners(sessions),
      partners_repeat: calcRepeatPartners(sessions),
      first_session_date: firstSessionDate,
      average_duration: msToM(totalDurationMs(sessions) / sessions.length),
      daily_record: calcDailyRecord(sessions),
    },
    charts: {
      sessions_cumulative: calcCumulativeSessionsChart(sessions),
      duration: calcDurationPieData(sessions),
      punctuality: calcPunctualityPieData(sessions),
      hour: calcChartDataByHour(sessions),
    },
  }
}

export function buildHistory(now: Date, pageIndex: number, pageSize: number) {
  const rows = calcHistoryData(buildSessions(now), now)
  return {
    rows: rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    row_count: rows.length,
  }
}
