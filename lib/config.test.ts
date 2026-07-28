import { describe, expect, it } from "vitest"

import { buildAuthorizeUrl, OAUTH_REDIRECT_URL } from "@/lib/config"

function paramsOf(url: string) {
  return new URL(url).searchParams
}

describe("buildAuthorizeUrl", () => {
  it("points at the Focusmate authorize endpoint", () => {
    const url = new URL(buildAuthorizeUrl("nonce"))
    expect(`${url.origin}${url.pathname}`).toBe(
      "https://app.focusmate.test/oauth/authorize"
    )
  })

  it("asks for an authorization code", () => {
    expect(paramsOf(buildAuthorizeUrl("nonce")).get("response_type")).toBe(
      "code"
    )
  })

  it("carries the client id and scope", () => {
    const params = paramsOf(buildAuthorizeUrl("nonce"))
    expect(params.get("client_id")).toBe("test-client-id")
    expect(params.get("scope")).toBe("profile sessions")
  })

  it("carries the state nonce it was given", () => {
    // This is what ties the returned code to the browser that asked for it
    expect(paramsOf(buildAuthorizeUrl("abc123")).get("state")).toBe("abc123")
  })

  it("builds a fresh url per sign-in rather than reusing one", () => {
    expect(buildAuthorizeUrl("first")).not.toBe(buildAuthorizeUrl("second"))
  })

  it("sends Focusmate back to our callback page", () => {
    expect(paramsOf(buildAuthorizeUrl("nonce")).get("redirect_uri")).toBe(
      "https://focusbeacon.test/oauth/callback"
    )
    expect(OAUTH_REDIRECT_URL).toBe("https://focusbeacon.test/oauth/callback")
  })

  it("percent-encodes the redirect uri", () => {
    // Unencoded, the ":" and "/" would terminate the query parameter
    expect(buildAuthorizeUrl("nonce")).toContain(
      "redirect_uri=https%3A%2F%2Ffocusbeacon.test%2Foauth%2Fcallback"
    )
  })

  it("percent-encodes the space in the scope", () => {
    expect(buildAuthorizeUrl("nonce")).toContain("scope=profile%20sessions")
  })

  it("escapes a state value containing url metacharacters", () => {
    // The nonce is hex today, but the encoding must not depend on that
    const url = buildAuthorizeUrl("a&b=c d")
    expect(paramsOf(url).get("state")).toBe("a&b=c d")
  })
})
