import { describe, expect, it } from "vitest"

import { GET } from "@/app/api/sign-in/route"

function stateCookie(response: Response) {
  const header = response.headers.get("Set-Cookie") ?? ""
  const [pair] = header.split(";")
  const [name, value] = pair.split("=")
  return { header, name, value }
}

describe("GET /api/sign-in", () => {
  it("redirects to Focusmate", async () => {
    const response = await GET()
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toContain(
      "https://app.focusmate.test/oauth/authorize"
    )
  })

  it("sets the oauth state cookie", async () => {
    const { name, value } = stateCookie(await GET())
    expect(name).toBe("oauthState")
    expect(value).toMatch(/^[0-9a-f]{64}$/)
  })

  it("puts the same nonce in the cookie and the redirect", async () => {
    const response = await GET()
    const { value } = stateCookie(response)
    const location = new URL(response.headers.get("Location") as string)
    // /api/callback compares these two; a mismatch is what stops an attacker
    // completing consent with their own account and handing over the code
    expect(location.searchParams.get("state")).toBe(value)
  })

  it("mints a different nonce on every sign-in", async () => {
    const first = stateCookie(await GET()).value
    const second = stateCookie(await GET()).value
    expect(first).not.toBe(second)
  })

  it("keeps the nonce out of reach of page scripts", async () => {
    expect(stateCookie(await GET()).header).toContain("HttpOnly")
  })

  it("uses lax, so the cookie survives Focusmate navigating back", async () => {
    // Strict would drop the cookie on that inbound navigation, and every
    // sign-in would fail the state check
    expect(stateCookie(await GET()).header).toContain("SameSite=Lax")
  })

  it("expires the nonce in ten minutes", async () => {
    expect(stateCookie(await GET()).header).toContain("Max-Age=600")
  })

  it("has no body", async () => {
    expect(await (await GET()).text()).toBe("")
  })
})
