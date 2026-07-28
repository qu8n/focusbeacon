import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
let searchParams = new URLSearchParams()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}))

import Callback from "@/app/oauth/callback/page"

let client: QueryClient

function renderCallback(params: Record<string, string> = {}) {
  searchParams = new URLSearchParams(params)
  // gcTime is left at its default on purpose. At 0, the signinStatus value
  // this page seeds has no observer yet and is collected the moment it is
  // written, which is the very thing these tests are checking.
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <Callback />
    </QueryClientProvider>
  )
}

function stubFetch(response: Partial<Response> | Error) {
  const fetchMock =
    response instanceof Error
      ? vi.fn().mockRejectedValue(response)
      : vi.fn().mockResolvedValue(response as Response)
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

beforeEach(() => {
  push.mockClear()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("a successful callback", () => {
  it("posts the code and state to our own endpoint", async () => {
    const fetchMock = stubFetch({ ok: true, status: 200 })

    renderCallback({ code: "auth-code", state: "the-nonce" })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/callback")
    expect(JSON.parse(init.body)).toEqual({
      authorizationCode: "auth-code",
      state: "the-nonce",
    })
  })

  it("navigates to the dashboard", async () => {
    stubFetch({ ok: true, status: 200 })
    renderCallback({ code: "auth-code", state: "the-nonce" })
    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"))
  })

  it("records the session before navigating", async () => {
    // The root layout's sign-in check runs when this page mounts, before the
    // POST sets the cookie, so it answers 400 and caches a definite "signed
    // out". staleTime is Infinity, so the push below would never re-check and
    // the dashboard's route guard would bounce the user straight to /home.
    stubFetch({ ok: true, status: 200 })

    renderCallback({ code: "auth-code", state: "the-nonce" })

    await waitFor(() =>
      expect(client.getQueryData(["signinStatus"])).toBe(true)
    )
  })

  it("shows a loading skeleton while exchanging", () => {
    stubFetch({ ok: true, status: 200 })
    const { container } = renderCallback({
      code: "auth-code",
      state: "the-nonce",
    })
    expect(container.textContent).not.toMatch(/please try again/i)
  })

  it("exchanges the code only once", async () => {
    // React 18 mounts effects twice in development; a second exchange would
    // burn the single-use authorization code
    const fetchMock = stubFetch({ ok: true, status: 200 })

    const { rerender } = renderCallback({
      code: "auth-code",
      state: "the-nonce",
    })
    rerender(
      <QueryClientProvider client={client}>
        <Callback />
      </QueryClientProvider>
    )

    await waitFor(() => expect(push).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe("a failed callback", () => {
  it("offers a way to retry rather than hanging on the skeleton", async () => {
    // A code can be present and still fail: a stale or mismatched OAuth
    // state, or a Focusmate error
    stubFetch({ ok: false, status: 400 })

    renderCallback({ code: "auth-code", state: "stale-nonce" })

    expect(
      await screen.findByRole("button", { name: /try again/i })
    ).toBeInTheDocument()
  })

  it("does not navigate to the dashboard", async () => {
    stubFetch({ ok: false, status: 400 })
    renderCallback({ code: "auth-code", state: "stale-nonce" })
    await screen.findByRole("button", { name: /try again/i })
    expect(push).not.toHaveBeenCalled()
  })

  it("does not record a session", async () => {
    stubFetch({ ok: false, status: 500 })
    renderCallback({ code: "auth-code", state: "the-nonce" })
    await screen.findByRole("button", { name: /try again/i })
    expect(client.getQueryData(["signinStatus"])).toBeUndefined()
  })

  it("handles the request throwing", async () => {
    stubFetch(new Error("network down"))
    renderCallback({ code: "auth-code", state: "the-nonce" })
    expect(
      await screen.findByRole("button", { name: /try again/i })
    ).toBeInTheDocument()
  })

  it("links to the privacy policy and a way to get in touch", async () => {
    stubFetch({ ok: false, status: 400 })
    renderCallback({ code: "auth-code", state: "stale" })
    await screen.findByRole("button", { name: /try again/i })

    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))

    expect(hrefs).toContain("/privacy")
    expect(hrefs.some((href) => href?.startsWith("http"))).toBe(true)
  })
})

describe("arriving without an authorization code", () => {
  it("shows the retry view immediately", () => {
    // Focusmate sends the user here with ?error=... when they click Deny
    stubFetch({ ok: true, status: 200 })
    renderCallback({})
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument()
  })

  it("calls nothing", () => {
    const fetchMock = stubFetch({ ok: true, status: 200 })
    renderCallback({})
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("shows the retry view when consent was denied", () => {
    stubFetch({ ok: true, status: 200 })
    renderCallback({ error: "access_denied" })
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument()
  })
})
