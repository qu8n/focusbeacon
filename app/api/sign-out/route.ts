import { SESSION_COOKIE_NAME } from "@/lib/config"
import { buildCookieOptions } from "@/lib/cookie"
import { supabaseClient } from "@/lib/supabase"
import { serialize } from "cookie"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const cookieOptions = {
    ...buildCookieOptions(),
    maxAge: -1, // overrides current cookie with one that expires immediately
  }

  try {
    // Expiring the cookie only stops this browser from sending it. The session
    // ID is a bearer credential -- the Python API authenticates anyone who
    // presents it -- so it has to be revoked server-side as well, or a copied
    // cookie keeps working long after the user thinks they signed out
    if (sessionId) {
      // supabase-js resolves errors into `error` rather than throwing, so
      // without this check the catch below never fires and a failed revocation
      // still answers 200 -- the user is told they signed out while their
      // session stays live
      const { error } = await supabaseClient
        .from("profile")
        .update({ session_id: null })
        .eq("session_id", sessionId)

      if (error) {
        throw new Error(`Failed to revoke session: ${error.message}`)
      }
    }

    return new Response("Cookie cleared", {
      status: 200,
      headers: {
        "Set-Cookie": serialize(SESSION_COOKIE_NAME, "", cookieOptions),
      },
    })
  } catch (error) {
    console.error(error)
    return new Response(`Error: ${error}`, {
      status: 500,
    })
  }
}
