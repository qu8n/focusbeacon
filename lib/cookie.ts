import { FOCUSBEACON_SITE_URL } from "@/lib/config"

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
