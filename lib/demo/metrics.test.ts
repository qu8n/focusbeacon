/**
 * The demo's port of api_utils/metric.py.
 *
 * `npm run check:demo` already proves the whole pipeline matches the real
 * endpoints at eight anchor dates. What it cannot do is say which function
 * broke, or exercise an input the fixture happens not to contain -- an empty
 * period, a lone session, a gap that only looks like a weekend. That is what
 * these are for, and the expectations mirror tests/test_metric_*.py.
 */

import { describe, expect, it } from "vitest"

import {
  calcChartDataByHour,
  calcChartDataByRange,
  calcCumulativeSessionsChart,
  calcCurrStreak,
  calcDailyRecord,
  calcDurationPieData,
  calcHistoryData,
  calcMaxDailyStreak,
  calcPunctualityPieData,
  calcRepeatPartners,
  countPartners,
  formatSeconds,
} from "@/lib/demo/metrics"
import { DemoSession, DurationKey } from "@/lib/demo/sessions"

const DURATION_MS: Record<DurationKey, number> = {
  "25m": 1500000,
  "50m": 3000000,
  "75m": 4500000,
}

let counter = 0

/** Mirrors make_sessions in tests/conftest.py. */
function session(
  date: string,
  options: {
    hour?: number
    minute?: number
    duration?: DurationKey
    joinDelta?: number | null
    completed?: boolean
    partner?: number
  } = {}
): DemoSession {
  const [year, month, day] = date.split("-").map(Number)
  const duration = options.duration ?? "25m"
  counter += 1
  return {
    sessionId: `demo-session-${counter}`,
    start: new Date(year, month - 1, day, options.hour ?? 10,
      options.minute ?? 0),
    durationMs: DURATION_MS[duration],
    durationKey: duration,
    joinDelta: options.joinDelta === undefined ? 0 : options.joinDelta,
    completed: options.completed ?? true,
    partnerId: options.partner ?? 1,
  }
}

// 2027-03-01 is a Monday
const MONDAY = "2027-03-01"
const FRIDAY = "2027-03-05"
const SATURDAY = "2027-03-06"
const SUNDAY = "2027-03-07"
const NEXT_MONDAY = "2027-03-08"

describe("countPartners", () => {
  it("counts distinct partners", () => {
    expect(
      countPartners([
        session(MONDAY, { partner: 1 }),
        session("2027-03-02", { partner: 2 }),
        session("2027-03-03", { partner: 1 }),
      ])
    ).toBe(2)
  })

  it("is zero for no sessions", () => {
    expect(countPartners([])).toBe(0)
  })
})

describe("calcRepeatPartners", () => {
  it("counts partners seen more than once", () => {
    expect(
      calcRepeatPartners([
        session(MONDAY, { partner: 1 }),
        session("2027-03-02", { partner: 1 }),
        session("2027-03-03", { partner: 2 }),
      ])
    ).toBe(1)
  })

  it("counts a partner seen three times only once", () => {
    expect(
      calcRepeatPartners([
        session(MONDAY, { partner: 1 }),
        session("2027-03-02", { partner: 1 }),
        session("2027-03-03", { partner: 1 }),
      ])
    ).toBe(1)
  })

  it("is zero when nobody repeats", () => {
    expect(
      calcRepeatPartners([
        session(MONDAY, { partner: 1 }),
        session("2027-03-02", { partner: 2 }),
      ])
    ).toBe(0)
  })

  it("is zero for no sessions", () => {
    expect(calcRepeatPartners([])).toBe(0)
  })
})

describe("calcCurrStreak", () => {
  const now = new Date(2027, 2, 10, 12) // Wednesday

  it("counts consecutive days up to yesterday", () => {
    const sessions = [session(NEXT_MONDAY), session("2027-03-09")]
    expect(calcCurrStreak(sessions, "D", now)).toBe(2)
  })

  it("counts today when there is a session today", () => {
    const sessions = [
      session(NEXT_MONDAY),
      session("2027-03-09"),
      session("2027-03-10"),
    ]
    expect(calcCurrStreak(sessions, "D", now)).toBe(3)
  })

  it("does not break the streak for a day still in progress", () => {
    expect(
      calcCurrStreak([session(NEXT_MONDAY), session("2027-03-09")], "D", now)
    ).toBe(2)
  })

  it("breaks on a missed weekday", () => {
    expect(
      calcCurrStreak([session(NEXT_MONDAY), session("2027-03-10")], "D", now)
    ).toBe(1)
  })

  it("survives a missed weekend", () => {
    const tuesday = new Date(2027, 2, 9, 12)
    expect(
      calcCurrStreak([session(FRIDAY), session(NEXT_MONDAY)], "D", tuesday)
    ).toBe(2)
  })

  it("counts several sessions in one day once", () => {
    const sessions = [
      session("2027-03-09", { hour: 9 }),
      session("2027-03-09", { hour: 14 }),
    ]
    expect(calcCurrStreak(sessions, "D", now)).toBe(1)
  })

  it("is zero for a streak that lapsed long ago", () => {
    expect(
      calcCurrStreak([session("2027-01-04"), session("2027-01-05")], "D", now)
    ).toBe(0)
  })

  it("counts weekly streaks", () => {
    const sessions = [
      session("2027-02-23"),
      session("2027-03-02"),
      session("2027-03-09"),
    ]
    expect(calcCurrStreak(sessions, "W", now, "monday")).toBe(3)
  })

  it("weekly streaks follow the week start preference", () => {
    const sessions = [session("2027-03-02"), session(SUNDAY)]
    expect(calcCurrStreak(sessions, "W", now, "monday")).toBe(1)
    expect(calcCurrStreak(sessions, "W", now, "sunday")).toBe(2)
  })

  it("counts monthly streaks", () => {
    const sessions = [
      session("2027-01-15"),
      session("2027-02-15"),
      session("2027-03-05"),
    ]
    expect(calcCurrStreak(sessions, "M", now)).toBe(3)
  })
})

describe("calcMaxDailyStreak", () => {
  it("finds the longest run", () => {
    const sessions = [
      session(MONDAY),
      session("2027-03-02"),
      session("2027-03-03"),
      session("2027-03-10"),
    ]
    expect(calcMaxDailyStreak(sessions).count).toBe(3)
  })

  it("reports the date range of that run", () => {
    const sessions = [
      session(MONDAY),
      session("2027-03-02"),
      session("2027-03-10"),
    ]
    expect(calcMaxDailyStreak(sessions).date_range).toEqual([
      "2027-03-01",
      "2027-03-02",
    ])
  })

  it("bridges a real weekend", () => {
    expect(
      calcMaxDailyStreak([session(FRIDAY), session(NEXT_MONDAY)]).count
    ).toBe(2)
  })

  it("bridges Saturday to Monday", () => {
    expect(
      calcMaxDailyStreak([session(SATURDAY), session(NEXT_MONDAY)]).count
    ).toBe(2)
  })

  it("bridges Friday to Sunday", () => {
    expect(calcMaxDailyStreak([session(FRIDAY), session(SUNDAY)]).count).toBe(2)
  })

  it("does not bridge a gap of weeks", () => {
    // Friday 5 March to Monday 15 March: the weekdays line up but ten days
    // separate them
    expect(
      calcMaxDailyStreak([session(FRIDAY), session("2027-03-15")]).count
    ).toBe(1)
  })

  it("does not bridge a gap of a month", () => {
    expect(
      calcMaxDailyStreak([session(FRIDAY), session("2027-04-05")]).count
    ).toBe(1)
  })

  it("handles a single session", () => {
    expect(calcMaxDailyStreak([session(MONDAY)]).count).toBe(1)
  })

  it("handles out-of-order input", () => {
    const sessions = [
      session("2027-03-03"),
      session(MONDAY),
      session("2027-03-02"),
    ]
    expect(calcMaxDailyStreak(sessions).count).toBe(3)
  })
})

describe("calcChartDataByRange", () => {
  it("buckets by duration", () => {
    const rows = calcChartDataByRange(
      [
        session(MONDAY, { duration: "25m" }),
        session(MONDAY, { duration: "25m" }),
        session(MONDAY, { duration: "50m" }),
      ],
      new Date(2027, 2, 1),
      new Date(2027, 2, 1),
      "D",
      "%-d"
    )
    expect(rows).toEqual([
      { start_period_str: "1", "25m": 2, "50m": 1, "75m": 0 },
    ])
  })

  it("pads periods with no sessions", () => {
    const rows = calcChartDataByRange(
      [session(MONDAY), session("2027-03-03")],
      new Date(2027, 2, 1),
      new Date(2027, 2, 3),
      "D",
      "%-d"
    )
    expect(rows.map((row) => row.start_period_str)).toEqual(["1", "2", "3"])
    expect(rows[1]["25m"]).toBe(0)
  })

  it("draws a full axis for an empty period", () => {
    const rows = calcChartDataByRange(
      [],
      new Date(2027, 2, 1),
      new Date(2027, 2, 7),
      "D",
      "%a"
    )
    expect(rows).toHaveLength(7)
    expect(rows.map((row) => row.start_period_str)).toEqual([
      "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
    ])
    expect(rows.every((row) => row["25m"] === 0)).toBe(true)
  })

  it("buckets by month", () => {
    const rows = calcChartDataByRange(
      [session("2027-01-15"), session("2027-03-20")],
      new Date(2027, 0, 1),
      new Date(2027, 2, 31),
      "M",
      "%b"
    )
    expect(rows.map((row) => row.start_period_str)).toEqual([
      "Jan", "Feb", "Mar",
    ])
    expect(rows.map((row) => row["25m"])).toEqual([1, 0, 1])
  })

  it("weekly buckets follow the week start preference", () => {
    const sessions = [session(SUNDAY)]
    const monday = calcChartDataByRange(
      sessions, new Date(2027, 2, 1), new Date(2027, 2, 14), "W", "%b %d",
      "monday")
    const sunday = calcChartDataByRange(
      sessions, new Date(2027, 2, 1), new Date(2027, 2, 14), "W", "%b %d",
      "sunday")
    expect(monday.map((row) => row["25m"])).toEqual([1, 0])
    expect(sunday.map((row) => row["25m"])).toEqual([0, 1, 0])
  })
})

describe("calcChartDataByHour", () => {
  it("returns all 24 hours", () => {
    expect(calcChartDataByHour([session(MONDAY)])).toHaveLength(24)
  })

  it("runs midnight to 11 PM", () => {
    const rows = calcChartDataByHour([session(MONDAY)])
    expect(rows[0].start_time_hour).toBe("12 AM")
    expect(rows[23].start_time_hour).toBe("11 PM")
  })

  it("places a session in its hour", () => {
    const rows = calcChartDataByHour([
      session(MONDAY, { hour: 14, minute: 30, duration: "50m" }),
    ])
    const twoPm = rows.find((row) => row.start_time_hour === "2 PM")
    expect(twoPm).toMatchObject({ "25m": 0, "50m": 1, "75m": 0 })
  })

  it("draws a full empty day", () => {
    const rows = calcChartDataByHour([])
    expect(rows).toHaveLength(24)
    expect(rows.every((row) => row["25m"] === 0)).toBe(true)
  })
})

describe("calcHistoryData", () => {
  const now = new Date(2027, 2, 10, 12)

  it("sorts most recent first", () => {
    const rows = calcHistoryData([session(MONDAY), session(FRIDAY)], now)
    expect(rows.map((row) => row.date)).toEqual([
      "Fri, Mar 05, 2027",
      "Mon, Mar 01, 2027",
    ])
  })

  it("excludes sessions that have not started yet", () => {
    const rows = calcHistoryData(
      [session("2027-03-09"), session("2027-03-20")],
      now
    )
    expect(rows).toHaveLength(1)
  })

  it("limits to the head count", () => {
    const sessions = [
      session(MONDAY),
      session("2027-03-02"),
      session("2027-03-03"),
      session("2027-03-04"),
    ]
    expect(calcHistoryData(sessions, now, 3)).toHaveLength(3)
  })

  it("reports duration in minutes", () => {
    const rows = calcHistoryData([session(MONDAY, { duration: "50m" })], now)
    expect(rows[0].duration_minutes).toBe(50)
  })

  it("keeps sessions that were not completed", () => {
    const rows = calcHistoryData(
      [session(MONDAY, { completed: false, joinDelta: null })],
      now
    )
    expect(rows[0].completed).toBe(false)
  })

  it("formats the time with a meridiem", () => {
    const rows = calcHistoryData(
      [session(MONDAY, { hour: 14, minute: 30 })],
      now
    )
    expect(rows[0].time).toBe("02:30 PM")
  })

  it("is empty when there are no sessions", () => {
    expect(calcHistoryData([], now)).toEqual([])
  })

  describe("on time", () => {
    it.each([
      [-30, true],
      [0, true],
      [59, true],
      [60, true],
      [61, false],
      [600, false],
    ])("a join delta of %ss reads as %s", (joinDelta, expected) => {
      const rows = calcHistoryData([session(MONDAY, { joinDelta })], now)
      expect(rows[0].on_time).toBe(expected)
    })

    it("a session never joined is not on time", () => {
      const rows = calcHistoryData(
        [session(MONDAY, { joinDelta: null, completed: false })],
        now
      )
      expect(rows[0].on_time).toBe(false)
    })
  })
})

describe("calcDurationPieData", () => {
  it("counts each bucket", () => {
    expect(
      calcDurationPieData([
        session(MONDAY, { duration: "25m" }),
        session("2027-03-02", { duration: "25m" }),
        session("2027-03-03", { duration: "75m" }),
      ])
    ).toEqual([
      { duration: "25m", amount: 2, hours: 0.8 },
      { duration: "50m", amount: 0, hours: 0 },
      { duration: "75m", amount: 1, hours: 1.2 },
    ])
  })

  it("gives three zeroes for no sessions", () => {
    expect(calcDurationPieData([]).map((entry) => entry.amount)).toEqual([
      0, 0, 0,
    ])
  })
})

describe("calcPunctualityPieData", () => {
  it("splits on time from late", () => {
    const result = calcPunctualityPieData([
      session(MONDAY, { joinDelta: 0 }),
      session("2027-03-02", { joinDelta: 30 }),
      session("2027-03-03", { joinDelta: 300 }),
    ])
    expect(result.data).toEqual([
      { punctuality: "On time", amount: 2 },
      { punctuality: "Late", amount: 1 },
    ])
  })

  it("reports the average and median", () => {
    const result = calcPunctualityPieData([
      session(MONDAY, { joinDelta: 10 }),
      session("2027-03-02", { joinDelta: 20 }),
      session("2027-03-03", { joinDelta: 120 }),
    ])
    expect(result.avg).toBe("50s late")
    expect(result.median).toBe("20s late")
  })

  it("reports N/A for a period with no sessions", () => {
    const result = calcPunctualityPieData([])
    expect(result.avg).toBe("N/A")
    expect(result.data.map((entry) => entry.amount)).toEqual([0, 0])
  })
})

describe("formatSeconds", () => {
  it.each([
    [0, "0s early"],
    [-30, "30s early"],
    [30, "30s late"],
    [61, "1m 1s late"],
    [-90, "1m 30s early"],
    [3600, "60m 0s late"],
  ])("formats %s as %s", (seconds, expected) => {
    expect(formatSeconds(seconds)).toBe(expected)
  })

  it("rounds a fractional second", () => {
    expect(formatSeconds(30.4)).toBe("30s late")
    expect(formatSeconds(30.6)).toBe("31s late")
  })
})

describe("calcCumulativeSessionsChart", () => {
  it("accumulates over time", () => {
    const rows = calcCumulativeSessionsChart([
      session(MONDAY),
      session("2027-03-02"),
      session("2027-03-03"),
    ])
    expect(rows.map((row) => row["25m"])).toEqual([1, 2, 3])
  })

  it("holds flat across a gap rather than dropping", () => {
    const rows = calcCumulativeSessionsChart([
      session(MONDAY),
      session("2027-03-04"),
    ])
    expect(rows).toHaveLength(4)
    expect(rows.map((row) => row["25m"])).toEqual([1, 1, 1, 2])
  })

  it("tracks each duration separately", () => {
    const rows = calcCumulativeSessionsChart([
      session(MONDAY, { duration: "25m" }),
      session("2027-03-02", { duration: "75m" }),
    ])
    expect(rows.map((row) => row["25m"])).toEqual([1, 1])
    expect(rows.map((row) => row["75m"])).toEqual([0, 1])
  })

  it("formats the date for display", () => {
    const rows = calcCumulativeSessionsChart([session(FRIDAY)])
    expect(rows[0].start_date).toBe("Mar 5, 2027")
  })
})

describe("calcDailyRecord", () => {
  it("reports the heaviest day", () => {
    const record = calcDailyRecord([
      session(MONDAY, { duration: "25m" }),
      session("2027-03-02", { duration: "75m" }),
      session("2027-03-02", { hour: 14, duration: "75m" }),
    ])
    expect(record.date).toBe("Mar 2, 2027")
    expect(record.duration).toBe(2.5) // 150 minutes, to one decimal hour
  })

  it("breaks a tie with the earliest day", () => {
    const record = calcDailyRecord([
      session(MONDAY, { duration: "50m" }),
      session("2027-03-02", { duration: "50m" }),
    ])
    expect(record.date).toBe("Mar 1, 2027")
  })
})
