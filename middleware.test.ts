import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const single = vi.fn()

vi.mock("@/lib/supabase", () => ({
  supabaseClient: {
    from: () => ({ select: () => ({ eq: () => ({ single }) }) }),
  },
}))

import { middleware } from "@/middleware"

function request(path: string, sessionId?: string) {
  const next = new NextRequest(new URL(path, "https://focusbeacon.test"))
  if (sessionId) next.cookies.set("sessionId", sessionId)
  return next
}

beforeEach(() => {
  single.mockReset().mockResolvedValue({ data: { user_id: "user-1" } })
})

describe("the root path", () => {
  it("sends a signed-in visitor to the dashboard", async () => {
    const response = await middleware(request("/", "the-session"))
    expect(response?.status).toBe(307)
    expect(response?.headers.get("location")).toBe(
      "https://focusbeacon.test/dashboard"
    )
  })

  it("sends a visitor with no cookie to the marketing page", async () => {
    const response = await middleware(request("/"))
    expect(response?.headers.get("location")).toBe(
      "https://focusbeacon.test/home"
    )
  })

  it("does not query the database without a cookie", async () => {
    await middleware(request("/"))
    expect(single).not.toHaveBeenCalled()
  })

  it("sends a visitor with an unrecognised session to /home", async () => {
    // A signed-out session ID is still presented by the browser until the
    // cookie expires
    single.mockResolvedValue({ data: null })
    const response = await middleware(request("/", "revoked-session"))
    expect(response?.headers.get("location")).toBe(
      "https://focusbeacon.test/home"
    )
  })
})

describe("every other path", () => {
  it.each([
    "/home",
    "/dashboard",
    "/dashboard/streak",
    "/history",
    "/privacy",
    "/oauth/callback",
    "/api/py/streak",
  ])("passes %s straight through", async (path) => {
    expect(await middleware(request(path, "the-session"))).toBeUndefined()
  })

  it("does not query the database for a path it ignores", async () => {
    await middleware(request("/dashboard", "the-session"))
    expect(single).not.toHaveBeenCalled()
  })

  it("leaves a path that merely starts with a slash alone", async () => {
    expect(await middleware(request("/h", "the-session"))).toBeUndefined()
  })
})
