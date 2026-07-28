import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DemoModeContext } from "@/components/common/providers"
import { useProtectRoute } from "@/hooks/use-protect-route"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

function render(demoMode = false) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return renderHook(() => useProtectRoute(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>
        <DemoModeContext.Provider value={demoMode}>
          {children}
        </DemoModeContext.Provider>
      </QueryClientProvider>
    ),
  })
}

function stubFetch(response: Partial<Response> | Error) {
  vi.stubGlobal(
    "fetch",
    response instanceof Error
      ? vi.fn().mockRejectedValue(response)
      : vi.fn().mockResolvedValue(response as Response)
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  push.mockClear()
})

describe("useProtectRoute", () => {
  it("redirects on a definite signed-out answer", async () => {
    stubFetch({ ok: false, status: 401 })

    const { result } = render()

    await waitFor(() => expect(push).toHaveBeenCalledWith("/home"))
    expect(result.current.isSignedIn).toBe(false)
  })

  it("stays put when signed in", async () => {
    stubFetch({ ok: true, status: 200 })

    const { result } = render()

    await waitFor(() => expect(result.current.isSignedIn).toBe(true))
    expect(push).not.toHaveBeenCalled()
  })

  it("does not redirect while the check is still running", () => {
    stubFetch({ ok: false, status: 401 })
    const { result } = render()
    expect(result.current.isCheckingSignInStatus).toBe(true)
    expect(push).not.toHaveBeenCalled()
  })

  it.each([500, 502, 503])(
    "does not redirect when the check fails with a %s",
    async (status) => {
      // Throwing a signed-in user out to the marketing page is the worse of
      // the two mistakes, so an inconclusive check leaves them where they are
      stubFetch({ ok: false, status })

      const { result } = render()

      await waitFor(() =>
        expect(result.current.isCheckingSignInStatus).toBe(false)
      )
      expect(push).not.toHaveBeenCalled()
    }
  )

  it("does not redirect when the check times out", async () => {
    const timeout = new Error("aborted")
    timeout.name = "TimeoutError"
    stubFetch(timeout)

    const { result } = render()

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )
    expect(push).not.toHaveBeenCalled()
  })

  it("never redirects in demo mode", async () => {
    stubFetch({ ok: false, status: 401 })

    const { result } = render(true)

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )
    expect(push).not.toHaveBeenCalled()
    expect(result.current.demoMode).toBe(true)
  })

  it("does not call the endpoint in demo mode", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const { result } = render(true)

    await waitFor(() =>
      expect(result.current.isCheckingSignInStatus).toBe(false)
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
