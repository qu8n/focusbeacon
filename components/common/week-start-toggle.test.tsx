import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { WeekStartToggle } from "@/components/common/week-start-toggle"
import { useWeekStart, WeekStartProvider } from "@/contexts/week-start-context"

const STORAGE_KEY = "focusbeacon-week-start"

function CurrentWeekStart() {
  const { weekStart } = useWeekStart()
  return <output data-testid="current">{weekStart}</output>
}

function renderToggle() {
  return render(
    <WeekStartProvider>
      <CurrentWeekStart />
      <WeekStartToggle />
    </WeekStartProvider>
  )
}

async function openDialog() {
  await userEvent.click(
    screen.getByRole("button", { name: /edit week start/i })
  )
  return screen.getByRole("dialog")
}

beforeEach(() => {
  localStorage.clear()
})

describe("the stored preference", () => {
  it("defaults to Monday", () => {
    renderToggle()
    expect(screen.getByTestId("current")).toHaveTextContent("monday")
  })

  it("reads a stored preference on first render", () => {
    // useSyncExternalStore reads localStorage immediately on the client, so
    // the dashboard does not flash the wrong week
    localStorage.setItem(STORAGE_KEY, "sunday")
    renderToggle()
    expect(screen.getByTestId("current")).toHaveTextContent("sunday")
  })

  it("falls back to the default for an unrecognised stored value", () => {
    localStorage.setItem(STORAGE_KEY, "caturday")
    renderToggle()
    expect(screen.getByTestId("current")).toHaveTextContent("monday")
  })
})

describe("changing the week start", () => {
  it("saves the chosen day", async () => {
    renderToggle()
    const dialog = await openDialog()

    await userEvent.click(within(dialog).getByRole("button", { name: "Sunday" }))
    await userEvent.click(within(dialog).getByRole("button", { name: /submit/i }))

    await waitFor(() =>
      expect(screen.getByTestId("current")).toHaveTextContent("sunday")
    )
    expect(localStorage.getItem(STORAGE_KEY)).toBe("sunday")
  })

  it("closes the dialog after saving", async () => {
    renderToggle()
    const dialog = await openDialog()

    await userEvent.click(within(dialog).getByRole("button", { name: "Sunday" }))
    await userEvent.click(within(dialog).getByRole("button", { name: /submit/i }))

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
  })

  it("discards the choice on cancel", async () => {
    renderToggle()
    const dialog = await openDialog()

    await userEvent.click(within(dialog).getByRole("button", { name: "Sunday" }))
    await userEvent.click(within(dialog).getByRole("button", { name: /cancel/i }))

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
    expect(screen.getByTestId("current")).toHaveTextContent("monday")
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it("reopens showing the saved day, not the discarded one", async () => {
    renderToggle()

    const first = await openDialog()
    await userEvent.click(within(first).getByRole("button", { name: "Sunday" }))
    await userEvent.click(within(first).getByRole("button", { name: /cancel/i }))
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )

    const second = await openDialog()

    expect(
      within(second).getByRole("button", { name: "Monday" })
    ).toHaveAttribute("aria-pressed", "true")
  })

  it("propagates the change to every consumer", async () => {
    // The provider drives the week and streak queries as well as this toggle
    render(
      <WeekStartProvider>
        <CurrentWeekStart />
        <WeekStartToggle />
      </WeekStartProvider>
    )
    const dialog = await openDialog()

    await userEvent.click(within(dialog).getByRole("button", { name: "Sunday" }))
    await userEvent.click(within(dialog).getByRole("button", { name: /submit/i }))

    await waitFor(() =>
      expect(screen.getByTestId("current")).toHaveTextContent("sunday")
    )
  })
})
