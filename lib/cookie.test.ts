import { afterEach, describe, expect, it, vi } from "vitest"

import { buildCookieOptions, buildOauthStateCookieOptions } from "@/lib/cookie"

/**
 * `NODE_ENV` decides which branch runs, and Vitest sets it to "test", so the
 * production shape has to be provoked explicitly. `process.env` rejects a
 * plain defineProperty, so this goes through Vitest's own stub.
 */
function withNodeEnv<T>(value: string, run: () => T): T {
  vi.stubEnv("NODE_ENV", value as "production" | "development" | "test")
  try {
    return run()
  } finally {
    vi.unstubAllEnvs()
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("buildCookieOptions in production", () => {
  const options = () => withNodeEnv("production", buildCookieOptions)

  it("scopes the cookie to the site hostname", () => {
    expect(options().domain).toBe("focusbeacon.test")
  })

  it("is https-only", () => {
    expect(options().secure).toBe(true)
  })

  it("is unreadable from JavaScript", () => {
    // The session ID is a bearer credential for the Python API
    expect(options().httpOnly).toBe(true)
  })

  it("is strict, so it never rides a cross-site request", () => {
    expect(options().sameSite).toBe("strict")
  })

  it("covers the whole site", () => {
    expect(options().path).toBe("/")
  })
})

describe("buildCookieOptions in development", () => {
  const options = () => withNodeEnv("development", buildCookieOptions)

  it("drops the secure flag so http://localhost works", () => {
    expect(options().secure).toBe(false)
  })

  it("sets no domain, so the cookie follows whatever host is in use", () => {
    expect(options()).not.toHaveProperty("domain")
  })

  it("keeps the protections that do not depend on https", () => {
    expect(options().httpOnly).toBe(true)
    expect(options().sameSite).toBe("strict")
  })
})

describe("buildOauthStateCookieOptions", () => {
  it("is lax, because Focusmate navigates the browser back to us", () => {
    // A strict cookie would not be sent on that inbound navigation, and the
    // callback would reject every sign-in
    expect(buildOauthStateCookieOptions().sameSite).toBe("lax")
  })

  it("expires in ten minutes", () => {
    // It covers exactly one sign-in
    expect(buildOauthStateCookieOptions().maxAge).toBe(600)
  })

  it("stays httpOnly, so page scripts cannot read or forge the nonce", () => {
    expect(buildOauthStateCookieOptions().httpOnly).toBe(true)
  })

  it("inherits the rest from the session cookie options", () => {
    expect(buildOauthStateCookieOptions().path).toBe(
      buildCookieOptions().path
    )
  })
})
