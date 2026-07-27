import { FOCUSBEACON_SITE_URL } from "@/lib/config"

// The OAuth nonce is written just before we hand the browser to Focusmate and
// read when Focusmate navigates back, so it needs `lax` rather than the
// session cookie's `strict`. Short-lived because it covers one sign-in only.
export function buildOauthStateCookieOptions() {
  return {
    ...buildCookieOptions(),
    sameSite: "lax" as const,
    maxAge: 600,
  }
}

export function buildCookieOptions() {
  if (process.env.NODE_ENV === "production") {
    return {
      domain: new URL(FOCUSBEACON_SITE_URL).hostname,
      secure: true,
      httpOnly: true,
      // Typing as `const` to avoid a TS error that generalizes the type of sameSite
      sameSite: "strict" as const,
      path: "/",
    }
  } else {
    return {
      secure: false,
      httpOnly: true,
      path: "/",
      sameSite: "strict" as const,
    }
  }
}
