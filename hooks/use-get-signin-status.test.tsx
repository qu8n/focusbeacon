import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useGetSigninStatus } from "@/hooks/use-get-signin-status"

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }
}

function freshClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
}

function stubFetch(response: Partial<Response> | Error) {
  const fetchMock =
    response instanceof Error
      ? vi.fn().mockRejectedValue(response)
      : vi.fn().mockResolvedValue(response as Response)
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

function render(client = freshClient(), enabled = true) {
  return renderHook(() => useGetSigninStatus(enabled), {
    wrapper: wrapper(client),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("a definite answer", () => {
  it("reports signed in on a 200", async () => {
    stubFetch({ ok: true, status: 200 })
    const { result } = render()

    await waitFor(() => expect(result.current.isCheckingSignInStatus).toBe(false))

    expect(result.current.isSignedIn).toBe(true)
    expect(result.current.isSignInStatusUnknown).toBe(false)
  })

  it.each([400, 401, 403, 404])(
    "reports signed out on a %s",
    async (status) => {
      // A 4xx is an answer: there is no valid session
      stubFetch({ ok: false, status })
      const { result } = render()

      await waitFor(() =>
        expect(result.current.isCheckingSignInStatus).toBe(false)
      )

      expect(result.current.isSignedIn).toBe(false)
      expect(result.current.isSignInStatusUnknown).toBe(false)
    }
  )
})

describe("no answer at all", () => {
  // A timeout, a dropped connection or a 5xx is the check failing to finish,
  // which is not the same as being signed out. Treating it as signed out
  // bounces a legitimate user off the dashboard -- most likely on the very
  // first request after signing in, which is when a cold start is likeliest.
  it.each([500, 502, 503])("is unknown on a %s", async (status) => {
    stubFetch({ ok: false, status })
    const { result } = render()

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )

    expect(result.current.isSignedIn).toBe(false)
    expect(result.current.isSignInStatusUnknown).toBe(true)
  })

  it("is unknown when the request throws", async () => {
    stubFetch(new Error("network down"))
    const { result } = render()

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )

    expect(result.current.isSignInStatusUnknown).toBe(true)
  })

  it("is unknown when the request times out", async () => {
    const abortError = new Error("The operation was aborted")
    abortError.name = "TimeoutError"
    stubFetch(abortError)
    const { result } = render()

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )

    expect(result.current.isSignInStatusUnknown).toBe(true)
  })
})

describe("the request itself", () => {
  it("calls the Python status endpoint", async () => {
    const fetchMock = stubFetch({ ok: true, status: 200 })
    const { result } = render()

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/py/signin-status",
      expect.objectContaining({ signal: expect.anything() })
    )
  })

  it("bounds the wait, so a cold start cannot hang the button", async () => {
    // SigninButton stays disabled while this is in flight
    const fetchMock = stubFetch({ ok: true, status: 200 })
    const { result } = render()

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )

    const { signal } = fetchMock.mock.calls[0][1]
    expect(signal).toBeInstanceOf(AbortSignal)
  })

  it("does not retry", async () => {
    const fetchMock = stubFetch({ ok: false, status: 500 })
    const { result } = render()

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe("demo mode", () => {
  it("never calls the endpoint when disabled", async () => {
    // Demo views read a static fixture, so this would otherwise be the one
    // call that still wakes the Python function on a demo page load
    const fetchMock = stubFetch({ ok: true, status: 200 })

    const { result } = render(freshClient(), false)

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("reports unknown rather than signed out when disabled", async () => {
    stubFetch({ ok: true, status: 200 })
    const { result } = render(freshClient(), false)

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )

    expect(result.current.isSignInStatusUnknown).toBe(true)
  })

  it("still returns an answer already in the cache", async () => {
    // The OAuth callback seeds this after a successful sign-in
    const client = freshClient()
    client.setQueryData(["signinStatus"], true)
    const fetchMock = stubFetch({ ok: false, status: 401 })

    const { result } = render(client, false)

    expect(result.current.isSignedIn).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("caching", () => {
  it("does not refetch once answered", async () => {
    const client = freshClient()
    const fetchMock = stubFetch({ ok: true, status: 200 })

    const first = render(client)
    await waitFor(() =>
      expect(first.result.current.isCheckingSignInStatus).toBe(false)
    )

    const second = render(client)
    await waitFor(() =>
      expect(second.result.current.isSignedIn).toBe(true)
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
