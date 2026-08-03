import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const cookieStore = new Map<string, string>()
const eq = vi.fn()
const update = vi.fn(() => ({ eq }))

// Async since Next 15: the route awaits it, so a synchronous mock would pass
// here while the real handler resolves a promise
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieStore.get(name)
      return value === undefined ? undefined : { name, value }
    },
  }),
}))

vi.mock("@/lib/supabase", () => ({
  supabaseClient: { from: () => ({ update }) },
}))

import { POST } from "@/app/api/sign-out/route"

beforeEach(() => {
  cookieStore.clear()
  cookieStore.set("sessionId", "the-session")
  update.mockClear()
  eq.mockReset().mockResolvedValue({ error: null })
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("POST /api/sign-out", () => {
  it("answers 200", async () => {
    expect((await POST()).status).toBe(200)
  })

  it("expires the session cookie", async () => {
    const cookie = (await POST()).headers.get("Set-Cookie") ?? ""
    expect(cookie).toContain("sessionId=")
    expect(cookie).toContain("Max-Age=-1")
  })

  it("revokes the session server-side", async () => {
    // Expiring the cookie only stops this browser sending it. The session ID
    // is a bearer credential the Python API accepts from anyone, so a copied
    // cookie would keep working long after the user thinks they signed out.
    await POST()
    expect(update).toHaveBeenCalledWith({ session_id: null })
    expect(eq).toHaveBeenCalledWith("session_id", "the-session")
  })

  it("reports a failed revocation instead of claiming success", async () => {
    // supabase-js resolves errors into `error` rather than throwing, so
    // without the check the user is told they signed out while their session
    // stays live
    eq.mockResolvedValue({ error: { message: "permission denied" } })

    const response = await POST()

    expect(response.status).toBe(500)
    expect(response.headers.get("Set-Cookie")).toBeNull()
  })

  it("reports a thrown database error too", async () => {
    eq.mockRejectedValue(new Error("connection reset"))
    expect((await POST()).status).toBe(500)
  })

  it("still clears the cookie when no session was presented", async () => {
    cookieStore.clear()

    const response = await POST()

    expect(response.status).toBe(200)
    expect(response.headers.get("Set-Cookie")).toContain("Max-Age=-1")
  })

  it("writes nothing when no session was presented", async () => {
    cookieStore.clear()
    await POST()
    expect(update).not.toHaveBeenCalled()
  })

  it("keeps the cookie httpOnly while expiring it", async () => {
    // A non-httpOnly replacement would leave the name readable to scripts
    expect((await POST()).headers.get("Set-Cookie")).toContain("HttpOnly")
  })
})
