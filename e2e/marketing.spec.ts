import { expect, test } from "@playwright/test"

test.describe("the marketing page", () => {
  test("renders", async ({ page }) => {
    await page.goto("/home")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("offers a way into the demo", async ({ page }) => {
    await page.goto("/home")
    await expect(
      page.getByRole("link", { name: /demo/i }).first()
    ).toBeVisible()
  })

  test("the call to action opens the sign-in dialog", async ({ page }) => {
    await page.goto("/home")

    await page
      .getByRole("button", { name: /view your stats for free/i })
      .first()
      .click()

    // Asserted on the panel's own content: the element carrying role="dialog"
    // is a zero-height wrapper, which Playwright rightly calls invisible
    await expect(
      page.getByText(/have you already signed into focusmate/i)
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: /ready to continue/i })
    ).toBeVisible()
  })
})

test.describe("the sign-in endpoint", () => {
  test("redirects to Focusmate and mints a state nonce", async ({
    request,
  }) => {
    // Sign-in goes through our own endpoint rather than linking straight at
    // Focusmate, so the nonce is minted server-side and lands in an HttpOnly
    // cookie the page's own scripts cannot read or forge
    const response = await request.get("/api/sign-in", {
      maxRedirects: 0,
    })

    expect(response.status()).toBe(302)

    const location = new URL(response.headers()["location"])
    expect(location.origin + location.pathname).toBe(
      "https://app.focusmate.test/oauth/authorize"
    )

    const setCookie = response.headers()["set-cookie"]
    expect(setCookie).toContain("oauthState=")
    expect(setCookie).toContain("HttpOnly")

    // The nonce in the cookie is the one Focusmate is asked to echo back
    const nonce = setCookie.split("oauthState=")[1].split(";")[0]
    expect(location.searchParams.get("state")).toBe(nonce)
  })

  test("mints a different nonce per visit", async ({ request }) => {
    const first = await request.get("/api/sign-in", { maxRedirects: 0 })
    const second = await request.get("/api/sign-in", { maxRedirects: 0 })
    expect(first.headers()["set-cookie"]).not.toBe(
      second.headers()["set-cookie"]
    )
  })
})

test.describe("the root path", () => {
  test("sends a visitor with no session to /home", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/home$/)
  })
})

test.describe("routing", () => {
  test("shows a not-found page for an unknown route", async ({ page }) => {
    const response = await page.goto("/no-such-page")
    expect(response?.status()).toBe(404)
  })

  test("serves the privacy policy", async ({ page }) => {
    await page.goto("/privacy")
    await expect(page.getByRole("heading").first()).toBeVisible()
  })

  test("serves the about page", async ({ page }) => {
    await page.goto("/about")
    await expect(page.getByRole("heading").first()).toBeVisible()
  })
})
