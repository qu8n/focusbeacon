import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DemoModeContext } from "@/components/common/providers"
import { WeeklyGoal } from "@/components/common/weekly-goal"

const GOAL_LIMITS = { max_sessions: 336, max_minutes: 10080 }

function goalPayload(overrides = {}) {
  return { goal: 10, goal_type: "sessions", ...GOAL_LIMITS, ...overrides }
}

function weekData(overrides = {}) {
  return {
    curr_period: { sessions_total: 4, hours_total: 2.5, ...overrides },
  }
}

let fetchMock: ReturnType<typeof vi.fn>

function renderGoal({
  data = weekData(),
  disabled = false,
  demoMode = false,
}: { data?: unknown; disabled?: boolean; demoMode?: boolean } = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={client}>
      <DemoModeContext.Provider value={demoMode}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <WeeklyGoal data={data as any} disabled={disabled} />
      </DemoModeContext.Provider>
    </QueryClientProvider>
  )
}

async function openDialog() {
  await userEvent.click(
    screen.getByRole("button", { name: /(edit|set) goal/i })
  )
  return screen.getByRole("dialog")
}

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => goalPayload(),
  })
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("the progress card", () => {
  it("shows progress towards a session goal", async () => {
    renderGoal()
    expect(await screen.findByText("4 / 10 (40%)")).toBeInTheDocument()
  })

  it("shows progress towards an hours goal in hours", async () => {
    // The goal is stored in minutes; 450 is 7.5 hours
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => goalPayload({ goal: 450, goal_type: "hours" }),
    })
    renderGoal({ data: weekData({ hours_total: 3 }) })
    expect(await screen.findByText("3 / 7.5 hrs (40%)")).toBeInTheDocument()
  })

  it("trims a trailing zero from a whole-hour goal", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => goalPayload({ goal: 420, goal_type: "hours" }),
    })
    renderGoal({ data: weekData({ hours_total: 7 }) })
    expect(await screen.findByText("7 / 7 hrs (100%)")).toBeInTheDocument()
  })

  it("reads N/A when no goal is set", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => goalPayload({ goal: 0 }),
    })
    renderGoal()
    expect(await screen.findByText("N/A")).toBeInTheDocument()
  })

  it("shows a goal with no progress yet rather than the unset state", async () => {
    // Every user's Monday: the goal exists, the percentage is zero
    renderGoal({ data: weekData({ sessions_total: 0 }) })
    expect(await screen.findByText("0 / 10 (0%)")).toBeInTheDocument()
  })

  it("offers to set a goal when there is none", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => goalPayload({ goal: 0 }),
    })
    renderGoal()
    expect(
      await screen.findByRole("button", { name: /set goal/i })
    ).toBeInTheDocument()
  })

  it("offers to edit an existing goal", async () => {
    renderGoal()
    expect(
      await screen.findByRole("button", { name: /edit goal/i })
    ).toBeInTheDocument()
  })
})

describe("availability", () => {
  it("disables the button in demo mode", async () => {
    renderGoal({ demoMode: true })
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /(edit|set) goal/i })
      ).toBeDisabled()
    )
  })

  it("disables the button while the page is loading", async () => {
    renderGoal({ data: undefined, disabled: true })
    expect(
      screen.getByRole("button", { name: /(edit|set) goal/i })
    ).toBeDisabled()
  })
})

describe("the goal dialog", () => {
  it("seeds the input with the current goal", async () => {
    renderGoal()
    await screen.findByText("4 / 10 (40%)")

    const dialog = await openDialog()

    expect(within(dialog).getByRole("spinbutton")).toHaveValue(10)
  })

  it("splits an hours goal into hours and minutes", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => goalPayload({ goal: 450, goal_type: "hours" }),
    })
    renderGoal()
    await screen.findByText(/hrs/)

    const dialog = await openDialog()
    const inputs = within(dialog).getAllByRole("spinbutton")

    expect(inputs[0]).toHaveValue(7)
    expect(inputs[1]).toHaveValue(30)
  })

  it("saves a new session goal", async () => {
    renderGoal()
    await screen.findByText("4 / 10 (40%)")
    const dialog = await openDialog()

    const input = within(dialog).getByRole("spinbutton")
    await userEvent.clear(input)
    await userEvent.type(input, "20")
    await userEvent.click(within(dialog).getByRole("button", { name: /submit/i }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/py/goal",
        expect.objectContaining({ method: "POST" })
      )
    )
    const body = JSON.parse(fetchMock.mock.calls.at(-1)![1].body)
    expect(body).toEqual({ goal: 20, goal_type: "sessions" })
  })

  it("sends an hours goal as minutes", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => goalPayload({ goal: 450, goal_type: "hours" }),
    })
    renderGoal()
    await screen.findByText(/hrs/)
    const dialog = await openDialog()

    const [hours, minutes] = within(dialog).getAllByRole("spinbutton")
    await userEvent.clear(hours)
    await userEvent.type(hours, "8")
    await userEvent.clear(minutes)
    await userEvent.type(minutes, "15")
    await userEvent.click(within(dialog).getByRole("button", { name: /submit/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const body = JSON.parse(fetchMock.mock.calls.at(-1)![1].body)
    expect(body).toEqual({ goal: 495, goal_type: "hours" })
  })

  it("closes without saving on cancel", async () => {
    renderGoal()
    await screen.findByText("4 / 10 (40%)")
    const dialog = await openDialog()

    await userEvent.click(within(dialog).getByRole("button", { name: /cancel/i }))

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
    expect(fetchMock).toHaveBeenCalledTimes(1) // the initial GET only
  })
})

describe("the server-sent limits", () => {
  it("rejects a session goal beyond the weekly maximum", async () => {
    // 336 half-hour slots in a week; anything more is a typo
    renderGoal()
    await screen.findByText("4 / 10 (40%)")
    const dialog = await openDialog()

    const input = within(dialog).getByRole("spinbutton")
    await userEvent.clear(input)
    await userEvent.type(input, "400")

    expect(
      await within(dialog).findByText(/can't exceed 336 sessions/i)
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole("button", { name: /submit/i })
    ).toBeDisabled()
  })

  it("states the hours limit in hours, not minutes", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => goalPayload({ goal: 450, goal_type: "hours" }),
    })
    renderGoal()
    await screen.findByText(/hrs/)
    const dialog = await openDialog()

    const [hours] = within(dialog).getAllByRole("spinbutton")
    await userEvent.clear(hours)
    await userEvent.type(hours, "200")

    expect(
      await within(dialog).findByText(/can't exceed 168 hours/i)
    ).toBeInTheDocument()
  })

  it("accepts the boundary itself", async () => {
    renderGoal()
    await screen.findByText("4 / 10 (40%)")
    const dialog = await openDialog()

    const input = within(dialog).getByRole("spinbutton")
    await userEvent.clear(input)
    await userEvent.type(input, "336")

    expect(
      within(dialog).queryByText(/can't exceed/i)
    ).not.toBeInTheDocument()
    expect(
      within(dialog).getByRole("button", { name: /submit/i })
    ).toBeEnabled()
  })

  it("does not POST an over-limit goal", async () => {
    renderGoal()
    await screen.findByText("4 / 10 (40%)")
    const dialog = await openDialog()

    const input = within(dialog).getByRole("spinbutton")
    await userEvent.clear(input)
    await userEvent.type(input, "999")
    await userEvent.click(
      within(dialog).getByRole("button", { name: /submit/i })
    )

    expect(fetchMock).toHaveBeenCalledTimes(1) // still just the initial GET
  })
})

describe("when saving fails", () => {
  it("keeps the dialog open", async () => {
    renderGoal()
    await screen.findByText("4 / 10 (40%)")
    const dialog = await openDialog()

    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    await userEvent.click(
      within(dialog).getByRole("button", { name: /submit/i })
    )

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})
