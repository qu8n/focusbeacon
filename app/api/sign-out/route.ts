import { SESSION_COOKIE_NAME } from "@/lib/config"
import { buildCookieOptions } from "@/lib/cookie"
import { serialize } from "cookie"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("sessionId")?.value
  const cookieOptions = {
    ...buildCookieOptions(),
    maxAge: -1, // overrides current cookie with one that expires immediately
  }

  try {
    // Set HTTPOnly cookie with user's session ID
    return new Response("Cookie set", {
      status: 200,
      headers: {
        "Set-Cookie": serialize(SESSION_COOKIE_NAME, sessionId!, cookieOptions),
      },
    })
  } catch (error) {
    console.error(error)
    return new Response(`Error: ${error}`, {
      status: 500,
    })
  }
}
