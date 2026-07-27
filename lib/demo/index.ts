/**
 * The demo dashboard's data source.
 *
 * Visiting any dashboard route with ?demo=true reads these functions instead
 * of calling /api/py/*. The fixture behind them stores sessions as offsets
 * from "today", so the numbers are always current without anything being
 * regenerated, and no serverless function is involved at all.
 *
 * Regenerate the fixture with:
 *
 *     uv run scripts/generate_demo_fixture.py
 *
 * and verify it still matches the API with `npm run check:demo`, which the
 * pre-push hook runs for you.
 */

import { DEMO_GOAL, HISTORY_PAGE_SIZE } from "./sessions"
import { endOfDay, WeekStartDay } from "./time"
import {
  buildHistory,
  buildLifetime,
  buildMonth,
  buildStreak,
  buildWeek,
  buildYear,
} from "./views"

export { HISTORY_PAGE_SIZE }

/**
 * Today always counts as a complete day. A signed-in user's dashboard fills in
 * as their day goes on, but a demo that shows an empty current week to anyone
 * visiting on a Monday morning is a worse demo, so the whole of today is in
 * scope whatever the clock says.
 */
function resolveNow(now?: Date): Date {
  return endOfDay(now ?? new Date())
}

export function getDemoStreak(weekStart: WeekStartDay, now?: Date) {
  return buildStreak(resolveNow(now), weekStart)
}

export function getDemoWeek(weekStart: WeekStartDay, now?: Date) {
  return buildWeek(resolveNow(now), weekStart)
}

export function getDemoMonth(now?: Date) {
  return buildMonth(resolveNow(now))
}

export function getDemoYear(now?: Date) {
  return buildYear(resolveNow(now))
}

export function getDemoLifetime(now?: Date) {
  return buildLifetime(resolveNow(now))
}

export function getDemoHistory(
  pageIndex: number,
  pageSize: number,
  now?: Date
) {
  return buildHistory(resolveNow(now), pageIndex, pageSize)
}

export function getDemoGoal() {
  return DEMO_GOAL
}
