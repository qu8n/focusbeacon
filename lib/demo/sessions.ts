/**
 * Turns the committed fixture into sessions positioned against a real date.
 *
 * The fixture stores each session as an offset from "today" rather than as a
 * date, which is what keeps the demo from going stale: the same six numbers
 * describe a session two Tuesdays ago whichever Tuesday that happens to be.
 */

import fixture from "./fixture.json"
import { addDays, dayNumber, startOfDay } from "./time"

export const DURATION_KEYS = ["25m", "50m", "75m"] as const

export type DurationKey = (typeof DURATION_KEYS)[number]

export type DurationCounts = Record<DurationKey, number>

export interface DemoSession {
  sessionId: string
  start: Date
  durationMs: number
  durationKey: DurationKey
  /** Seconds between the scheduled start and the join, negative when early.
   * Null when the session was never joined. */
  joinDelta: number | null
  completed: boolean
  partnerId: number
}

export const DEMO_PROFILE = fixture.profile
export const HISTORY_PAGE_SIZE = fixture.history_page_size

/** The demo goal is fixed, and the dialog that would change it is disabled in
 * demo mode. The limits ride along because the API sends them too. */
export const DEMO_GOAL = fixture.goal as {
  goal: number
  goal_type: "sessions" | "hours"
  max_sessions: number
  max_minutes: number
}

export function emptyCounts(): DurationCounts {
  return { "25m": 0, "50m": 0, "75m": 0 }
}

/** Rebuilding 1,500 sessions costs a millisecond or two, but every dashboard
 * tab asks for them, so hold onto the last day's worth. */
let cached: { day: number; sessions: DemoSession[] } | null = null

export function buildSessions(now: Date): DemoSession[] {
  const today = startOfDay(now)
  const day = dayNumber(today)
  if (cached && cached.day === day) return cached.sessions

  const sessions = fixture.sessions.map((row, index) => {
    const [dayOffset, minuteOfDay, durationIndex, joinDelta, completed, partner] =
      row as [number, number, number, number | null, number, number]
    const start = addDays(today, dayOffset)
    start.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0)

    return {
      sessionId: `demo-session-${String(index).padStart(4, "0")}`,
      start,
      durationMs: fixture.duration_ms[durationIndex],
      durationKey: DURATION_KEYS[durationIndex],
      joinDelta,
      completed: completed === 1,
      partnerId: partner,
    }
  })

  cached = { day, sessions }
  return sessions
}

export function completedOnly(sessions: DemoSession[]): DemoSession[] {
  return sessions.filter((session) => session.completed)
}

export function totalDurationMs(sessions: DemoSession[]): number {
  return sessions.reduce((total, session) => total + session.durationMs, 0)
}

export function between(
  sessions: DemoSession[],
  from: Date,
  to?: Date
): DemoSession[] {
  return sessions.filter(
    (session) =>
      session.start >= from && (to === undefined || session.start < to)
  )
}
