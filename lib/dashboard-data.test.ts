import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchDashboardData } from "@/lib/dashboard-data"

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubFetch(response: Partial<Response>) {
  const fetchMock = vi.fn().mockResolvedValue(response as Response)
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("fetchDashboardData when signed in", () => {
  it("calls the endpoint and returns the body", async () => {
    const fetchMock = stubFetch({
      ok: true,
      json: async () => ({ daily_streak: 4 }),
    })

    const data = await fetchDashboardData(false, "/api/py/streak", () => {
      throw new Error("the fixture must not be read when signed in")
    })

    expect(fetchMock).toHaveBeenCalledWith("/api/py/streak")
    expect(data).toEqual({ daily_streak: 4 })
  })

  it("throws on a non-ok response", async () => {
    stubFetch({ ok: false, status: 500, json: async () => ({}) })

    await expect(
      fetchDashboardData(false, "/api/py/streak", () => ({}))
    ).rejects.toThrow("/api/py/streak")
  })

  it("throws rather than returning a partial payload on a 401", async () => {
    // React Query needs the rejection so the route guard can act on it
    stubFetch({ ok: false, status: 401, json: async () => ({}) })
    await expect(
      fetchDashboardData(false, "/api/py/week", () => ({}))
    ).rejects.toThrow()
  })
})

describe("fetchDashboardData in demo mode", () => {
  it("reads the fixture instead of the endpoint", async () => {
    const fetchMock = stubFetch({ ok: true, json: async () => ({}) })

    const data = await fetchDashboardData(true, "/api/py/streak", (demo) =>
      demo.getDemoStreak("monday")
    )

    // The whole point of demo mode is that no serverless function wakes up
    expect(fetchMock).not.toHaveBeenCalled()
    expect(data).toHaveProperty("daily_streak")
  })

  it("passes the real demo module to the selector", async () => {
    const data = await fetchDashboardData(true, "/api/py/goal", (demo) =>
      demo.getDemoGoal()
    )
    expect(data).toMatchObject({ goal: expect.any(Number) })
  })

  it("ignores the endpoint argument entirely", async () => {
    const data = await fetchDashboardData(true, "/nonexistent", (demo) =>
      demo.getDemoLifetime()
    )
    expect(data.curr_period.sessions_total).toBeGreaterThan(0)
  })
})
