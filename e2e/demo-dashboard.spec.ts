import { expect, Page, test } from "@playwright/test"

/**
 * Smoke coverage for the dashboard as a browser actually renders it.
 *
 * Everything runs in demo mode, which reads a static fixture client-side, so
 * these never touch OAuth, Supabase or the Python API. What they catch is the
 * class of failure the unit suites structurally cannot: a chart library that
 * throws on mount, a client component that breaks hydration, a route that
 * 404s.
 */

const TABS = ["streak", "week", "month", "year", "lifetime"] as const

/** Fails the test on any console error, so a React or chart exception cannot
 * hide behind a page that still looks roughly right. */
function watchForConsoleErrors(page: Page) {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))
  return errors
}

test.describe("the demo dashboard", () => {
  for (const tab of TABS) {
    test(`${tab} renders`, async ({ page }) => {
      const errors = watchForConsoleErrors(page)

      await page.goto(`/dashboard/${tab}?demo=true`)

      await expect(
        page.getByRole("heading", { level: 1 })
      ).toBeVisible()
      // The skeleton is replaced once the fixture resolves
      await expect(page.getByText(/Demo/i).first()).toBeVisible()
      expect(errors).toEqual([])
    })
  }

  test("the streak tab shows its stat cards", async ({ page }) => {
    await page.goto("/dashboard/streak?demo=true")
    await expect(page.getByText("Streak stats")).toBeVisible()
    await expect(page.getByText(/Daily streak/i).first()).toBeVisible()
  })

  test("the lifetime tab shows a first-session date", async ({ page }) => {
    await page.goto("/dashboard/lifetime?demo=true")
    // Both subheadings on this page render the same range, hence first()
    await expect(page.getByText(/- Present/).first()).toBeVisible()
  })

  test("renders charts as svg rather than failing silently", async ({
    page,
  }) => {
    await page.goto("/dashboard/week?demo=true")
    await expect(page.locator("svg").first()).toBeVisible()
  })

  // A present, correctly sized <svg> is not evidence a chart drew anything.
  // recharts discovers its series by walking children through react-is, and
  // when that copy of react-is cannot recognise the running React's element
  // type it finds none: axes and container still render, the plot area is
  // empty, and nothing is logged. So assert on the series itself.
  test("the cumulative sessions chart plots one area per duration", async ({
    page,
  }) => {
    await page.goto("/dashboard/lifetime?demo=true")

    const chart = page
      .locator(".recharts-wrapper")
      .filter({ has: page.locator("path.recharts-area-area") })
      .first()

    // One stacked area per category: 25m, 50m, 75m
    await expect(chart.locator("path.recharts-area-area")).toHaveCount(3)

    // Each area needs real geometry -- an empty or absent `d` means the
    // series was discovered but had nothing to plot
    for (const d of await chart
      .locator("path.recharts-area-area")
      .evaluateAll((paths) => paths.map((p) => p.getAttribute("d") ?? ""))) {
      expect(d.length).toBeGreaterThan(100)
    }

    // Every fill must resolve to a gradient that actually exists, or the
    // areas draw transparent
    const fills = await chart
      .locator("path.recharts-area-area")
      .evaluateAll((paths) =>
        paths.map((p) => p.getAttribute("fill") ?? "")
      )
    for (const fill of fills) {
      const id = fill.match(/^url\(#(.+)\)$/)?.[1]
      expect(id, `fill should be a gradient reference, got ${fill}`).toBeTruthy()
      // Attribute selector rather than `#id`: useId() ids are not valid CSS
      // identifiers, and CSS.escape is a browser global the runner lacks
      await expect(
        page.locator(`linearGradient[id="${id}"]`)
      ).toHaveCount(1)
    }

    // A y-axis with ticks proves a domain was derived from the data
    await expect(
      chart.locator(".recharts-yAxis .recharts-cartesian-axis-tick-value").first()
    ).toBeVisible()
  })
})

test.describe("navigation", () => {
  test("moves between tabs and stays in demo mode", async ({ page }) => {
    await page.goto("/dashboard/streak?demo=true")

    await page.getByRole("link", { name: "week", exact: true }).click()

    await expect(page).toHaveURL(/\/dashboard\/week\?demo=true/)
    await expect(page.getByText("Current week")).toBeVisible()
  })

  test("walks the whole tab strip without error", async ({ page }) => {
    const errors = watchForConsoleErrors(page)
    await page.goto("/dashboard/streak?demo=true")

    for (const tab of ["week", "month", "year", "lifetime"]) {
      await page.getByRole("link", { name: tab, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`/dashboard/${tab}`))
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    }

    expect(errors).toEqual([])
  })

  test("reaches the history table", async ({ page }) => {
    await page.goto("/history?demo=true")
    await expect(page.getByRole("columnheader", { name: "Date" })).toBeVisible()
    await expect(page.getByRole("row").nth(1)).toBeVisible()
  })
})

test.describe("the week start preference", () => {
  test("relabels the current week when switched to Sunday", async ({
    page,
  }) => {
    await page.goto("/dashboard/week?demo=true")
    const subheading = page.getByText(/^(Monday|Sunday),/).first()
    await expect(subheading).toContainText("Monday")

    await page.getByRole("button", { name: /edit week start/i }).click()
    await page.getByRole("button", { name: "Sunday" }).click()
    await page.getByRole("button", { name: /submit/i }).click()

    await expect(subheading).toContainText("Sunday")
  })

  test("survives a reload", async ({ page }) => {
    await page.goto("/dashboard/week?demo=true")
    await page.getByRole("button", { name: /edit week start/i }).click()
    await page.getByRole("button", { name: "Sunday" }).click()
    await page.getByRole("button", { name: /submit/i }).click()
    await expect(page.getByText(/^Sunday,/).first()).toBeVisible()

    await page.reload()

    await expect(page.getByText(/^Sunday,/).first()).toBeVisible()
  })
})

test.describe("demo mode boundaries", () => {
  test("never calls the Python API", async ({ page }) => {
    // The whole point of the static fixture is that no serverless function
    // wakes up for a demo visitor
    const apiCalls: string[] = []
    page.on("request", (request) => {
      if (request.url().includes("/api/py/")) apiCalls.push(request.url())
    })

    await page.goto("/dashboard/streak?demo=true")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

    expect(apiCalls).toEqual([])
  })

  test("disables the goal editor", async ({ page }) => {
    await page.goto("/dashboard/week?demo=true")
    await expect(
      page.getByRole("button", { name: /(edit|set) goal/i })
    ).toBeDisabled()
  })
})
