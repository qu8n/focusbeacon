import { describe, expect, it } from "vitest"

import {
  between,
  buildSessions,
  completedOnly,
  DEMO_GOAL,
  DEMO_PROFILE,
  DURATION_KEYS,
  emptyCounts,
  HISTORY_PAGE_SIZE,
  totalDurationMs,
} from "@/lib/demo/sessions"
import { addDays, daysBetween, startOfDay } from "@/lib/demo/time"

const NOW = new Date(2027, 2, 10, 23, 59, 59)

describe("buildSessions", () => {
  it("produces the whole fixture", () => {
    expect(buildSessions(NOW).length).toBeGreaterThan(0)
  })

  it("gives every session a stable, unique id", () => {
    const sessions = buildSessions(NOW)
    const ids = new Set(sessions.map((session) => session.sessionId))
    expect(ids.size).toBe(sessions.length)
  })

  it("only uses the three real Focusmate durations", () => {
    const keys = Array.from(
      new Set(buildSessions(NOW).map((session) => session.durationKey))
    )
    expect(keys.every((key) => DURATION_KEYS.includes(key))).toBe(true)
  })

  it("keeps durationMs and durationKey in step", () => {
    const expected = { "25m": 1500000, "50m": 3000000, "75m": 4500000 }
    for (const session of buildSessions(NOW)) {
      expect(session.durationMs).toBe(expected[session.durationKey])
    }
  })

  it("positions sessions relative to the date it is given", () => {
    // The fixture stores offsets from "today", which is what keeps the demo
    // from going stale
    const earlier = buildSessions(new Date(2027, 2, 10, 12))
    const later = buildSessions(new Date(2027, 3, 10, 12))
    expect(earlier[0].start.getTime()).not.toBe(later[0].start.getTime())
  })

  it("shifts every session by the same number of days", () => {
    // Compared in days rather than milliseconds on purpose: this window
    // spans the start of US daylight saving, so the elapsed milliseconds
    // differ by an hour either side of it while the local time of day -- the
    // thing the fixture actually pins -- does not.
    const first = buildSessions(new Date(2027, 2, 10, 12))
    const second = buildSessions(new Date(2027, 2, 17, 12))

    const shifts = first.map((session, index) =>
      daysBetween(session.start, second[index].start)
    )

    expect(new Set(shifts)).toEqual(new Set([7]))
  })

  it("keeps each session at the same local time of day", () => {
    const first = buildSessions(new Date(2027, 2, 10, 12))
    const second = buildSessions(new Date(2027, 2, 17, 12))

    first.forEach((session, index) => {
      expect(second[index].start.getHours()).toBe(session.start.getHours())
      expect(second[index].start.getMinutes()).toBe(session.start.getMinutes())
    })
  })

  it("never places a session after today", () => {
    const endOfToday = addDays(startOfDay(NOW), 1)
    expect(
      buildSessions(NOW).every((session) => session.start < endOfToday)
    ).toBe(true)
  })

  it("returns the cached array for the same calendar day", () => {
    const morning = buildSessions(new Date(2027, 5, 1, 8, 0))
    const evening = buildSessions(new Date(2027, 5, 1, 22, 0))
    // Same reference: every dashboard tab asks for these
    expect(evening).toBe(morning)
  })

  it("rebuilds when the day changes", () => {
    const today = buildSessions(new Date(2027, 5, 1, 8, 0))
    const tomorrow = buildSessions(new Date(2027, 5, 2, 8, 0))
    expect(tomorrow).not.toBe(today)
  })

  it("marks some sessions incomplete, so history has no-shows to show", () => {
    const sessions = buildSessions(NOW)
    expect(sessions.some((session) => !session.completed)).toBe(true)
  })

  it("gives unjoined sessions a null join delta", () => {
    const sessions = buildSessions(NOW)
    const unjoined = sessions.filter((session) => session.joinDelta === null)
    expect(unjoined.every((session) => !session.completed)).toBe(true)
  })
})

describe("completedOnly", () => {
  it("drops the no-shows", () => {
    const sessions = buildSessions(NOW)
    const completed = completedOnly(sessions)
    expect(completed.length).toBeLessThan(sessions.length)
    expect(completed.every((session) => session.completed)).toBe(true)
  })
})

describe("totalDurationMs", () => {
  it("sums the durations", () => {
    const sessions = buildSessions(NOW).slice(0, 3)
    expect(totalDurationMs(sessions)).toBe(
      sessions.reduce((total, session) => total + session.durationMs, 0)
    )
  })

  it("is zero for no sessions", () => {
    expect(totalDurationMs([])).toBe(0)
  })
})

describe("between", () => {
  const sessions = buildSessions(NOW)

  it("includes the lower bound and excludes the upper one", () => {
    // Half-open, so adjacent periods never double-count a session
    const start = startOfDay(NOW)
    const today = between(sessions, start)
    expect(today.every((session) => session.start >= start)).toBe(true)
  })

  it("excludes a session landing exactly on the upper bound", () => {
    const target = sessions[10].start
    const window = between(sessions, sessions[0].start, target)
    expect(window.some((session) => session.start.getTime() === +target)).toBe(
      false
    )
  })

  it("with no upper bound runs to the end", () => {
    const start = sessions[0].start
    expect(between(sessions, start).length).toBeGreaterThan(0)
  })

  it("returns nothing for a window before the fixture starts", () => {
    const ancient = new Date(1990, 0, 1)
    expect(between(sessions, ancient, new Date(1990, 0, 2))).toEqual([])
  })
})

describe("fixture constants", () => {
  it("exposes a profile with a session count", () => {
    expect(DEMO_PROFILE.total_session_count).toBeGreaterThan(0)
  })

  it("exposes a goal with the limits the API sends", () => {
    expect(DEMO_GOAL.goal).toBeGreaterThan(0)
    expect(DEMO_GOAL.max_sessions).toBe(336)
    expect(DEMO_GOAL.max_minutes).toBe(10080)
  })

  it("exposes a history page size", () => {
    expect(HISTORY_PAGE_SIZE).toBeGreaterThan(0)
  })

  it("emptyCounts starts every bucket at zero", () => {
    expect(emptyCounts()).toEqual({ "25m": 0, "50m": 0, "75m": 0 })
  })

  it("emptyCounts returns a fresh object each time", () => {
    const first = emptyCounts()
    first["25m"] = 5
    expect(emptyCounts()["25m"]).toBe(0)
  })
})
