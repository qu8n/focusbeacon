import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const cookieStore = new Map<string, string>()
const upsert = vi.fn()

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
  supabaseClient: { from: () => ({ upsert }) },
}))

import { POST } from "@/app/api/callback/route"

const PROFILE = {
  user: {
    userId: "user-1",
    name: "Ada",
    totalSessionCount: 12,
    timeZone: "America/New_York",
    photoUrl: "https://example.test/ada.png",
    memberSince: "2026-01-01T00:00:00Z",
  },
}

function request(body: Record<string, unknown>) {
  return new Request("https://focusbeacon.test/api/callback", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

/** Answers the token exchange then the profile fetch, in that order. */
function stubFetch({
  tokenOk = true,
  profileOk = true,
}: { tokenOk?: boolean; profileOk?: boolean } = {}) {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: tokenOk,
      status: tokenOk ? 200 : 400,
      json: async () => ({ access_token: "fm-access-token" }),
    })
    .mockResolvedValueOnce({
      ok: profileOk,
      status: profileOk ? 200 : 500,
      json: async () => PROFILE,
    })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

function setCookies(response: Response) {
  return response.headers.getSetCookie()
}

beforeEach(() => {
  cookieStore.clear()
  cookieStore.set("oauthState", "the-nonce")
  upsert.mockReset().mockResolvedValue({ error: null })
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("the oauth state check", () => {
  it("rejects a state that does not match the cookie", async () => {
    // Without this an attacker can complete consent with their own Focusmate
    // account and lure the victim to /oauth/callback?code=..., signing them
    // into the attacker's account
    const fetchMock = stubFetch()

    const response = await POST(
      request({ authorizationCode: "code", state: "wrong-nonce" })
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toBe("Invalid OAuth state")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects a missing state", async () => {
    stubFetch()
    const response = await POST(request({ authorizationCode: "code" }))
    expect(response.status).toBe(400)
  })

  it("rejects when no nonce cookie was ever set", async () => {
    cookieStore.clear()
    stubFetch()
    const response = await POST(
      request({ authorizationCode: "code", state: "the-nonce" })
    )
    expect(response.status).toBe(400)
  })

  it("rejects an empty state even against an empty cookie", async () => {
    cookieStore.set("oauthState", "")
    stubFetch()
    const response = await POST(
      request({ authorizationCode: "code", state: "" })
    )
    expect(response.status).toBe(400)
  })

  it("writes nothing to the database when the state check fails", async () => {
    stubFetch()
    await POST(request({ authorizationCode: "code", state: "wrong" }))
    expect(upsert).not.toHaveBeenCalled()
  })
})

describe("a successful sign-in", () => {
  const goodRequest = () =>
    request({ authorizationCode: "code", state: "the-nonce" })

  it("answers 200", async () => {
    stubFetch()
    expect((await POST(goodRequest())).status).toBe(200)
  })

  it("sets the session cookie", async () => {
    stubFetch()
    const cookies = setCookies(await POST(goodRequest()))
    const session = cookies.find((cookie) => cookie.startsWith("sessionId="))
    expect(session).toBeDefined()
    expect(session).toContain("HttpOnly")
  })

  it("issues a fresh session id", async () => {
    stubFetch()
    const cookies = setCookies(await POST(goodRequest()))
    const session = cookies.find((cookie) => cookie.startsWith("sessionId="))
    expect(session?.split(";")[0].split("=")[1]).toMatch(/^[0-9a-f]{64}$/)
  })

  it("retires the nonce, so a replayed code cannot reuse it", async () => {
    stubFetch()
    const cookies = setCookies(await POST(goodRequest()))
    const nonce = cookies.find((cookie) => cookie.startsWith("oauthState="))
    expect(nonce).toContain("Max-Age=-1")
  })

  it("exchanges the code at the token endpoint", async () => {
    const fetchMock = stubFetch()
    await POST(goodRequest())
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://api.focusmate.test/v1/oauth/token")
    expect(init.method).toBe("POST")
    expect(String(init.body)).toContain("grant_type=authorization_code")
    expect(String(init.body)).toContain("code=code")
  })

  it("fetches the profile with the access token", async () => {
    const fetchMock = stubFetch()
    await POST(goodRequest())
    const [url, init] = fetchMock.mock.calls[1]
    expect(url).toBe("https://api.focusmate.test/v1/me")
    expect(init.headers.get("Authorization")).toBe("Bearer fm-access-token")
  })

  it("stores the profile keyed by the Focusmate user id", async () => {
    stubFetch()
    await POST(goodRequest())
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        time_zone: "America/New_York",
        total_session_count: 12,
      })
    )
  })

  it("never stores the access token in the clear", async () => {
    stubFetch()
    await POST(goodRequest())
    const stored = upsert.mock.calls[0][0]
    expect(stored.access_token_encrypted).not.toContain("fm-access-token")
    expect(stored.access_token_encrypted).toContain(":")
  })

  it("stores the same session id it hands the browser", async () => {
    stubFetch()
    const response = await POST(goodRequest())
    const cookie = setCookies(response).find((c) =>
      c.startsWith("sessionId=")
    ) as string
    const fromCookie = cookie.split(";")[0].split("=")[1]
    expect(upsert.mock.calls[0][0].session_id).toBe(fromCookie)
  })
})

describe("failures", () => {
  const goodRequest = () =>
    request({ authorizationCode: "code", state: "the-nonce" })

  it("reports a failed upsert rather than signing the user in", async () => {
    // supabase-js resolves errors into `error` instead of throwing. Unchecked,
    // the caller still set a session cookie whose ID the Python API cannot
    // resolve, so the user landed on a dashboard that 401s on every request.
    stubFetch()
    upsert.mockResolvedValue({ error: { message: "duplicate key" } })

    const response = await POST(goodRequest())

    expect(response.status).toBe(500)
    expect(setCookies(response)).toEqual([])
  })

  it("reports a failed profile fetch", async () => {
    stubFetch({ profileOk: false })
    expect((await POST(goodRequest())).status).toBe(500)
  })

  it("reports a failed token exchange as a token failure", async () => {
    // The catch inside fetchAccessToken used to swallow the error and return
    // undefined, so the request carried on to the profile endpoint as
    // "Bearer undefined" and the user was told the profile fetch failed
    stubFetch({ tokenOk: false })

    const response = await POST(goodRequest())

    expect(response.status).toBe(500)
    expect(await response.text()).toContain("access token")
  })

  it("does not call the profile endpoint after a failed exchange", async () => {
    const fetchMock = stubFetch({ tokenOk: false })
    await POST(goodRequest())
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects a 200 that carries no access token", async () => {
    // Otherwise `undefined` is encrypted and stored, and the failure only
    // shows up on the user's first dashboard request
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    })
    vi.stubGlobal("fetch", fetchMock)

    const response = await POST(goodRequest())

    expect(response.status).toBe(500)
    expect(upsert).not.toHaveBeenCalled()
  })

  it("reports a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))
    expect((await POST(goodRequest())).status).toBe(500)
  })
})
