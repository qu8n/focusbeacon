import { buildAuthorizeUrl, OAUTH_STATE_COOKIE_NAME } from "@/lib/config"
import { buildOauthStateCookieOptions } from "@/lib/cookie"
import { serialize } from "cookie"
import { randomBytes } from "crypto"

// Next caches GET route handlers by default, which would prerender one nonce
// at build time and hand every visitor the same one -- exactly the thing the
// nonce exists to prevent
export const dynamic = "force-dynamic"

// Sign-in starts here rather than by linking straight at Focusmate, so the
// nonce is minted server-side and lands in an HttpOnly cookie the page's own
// scripts can't read or forge.
export async function GET() {
  // Ties the authorization code that comes back to the browser that asked for
  // it. Without it, an attacker can complete consent with their own Focusmate
  // account and hand the victim a /oauth/callback?code=... link, which signs
  // the victim into the attacker's account.
  const state = randomBytes(32).toString("hex")

  return new Response(null, {
    status: 302,
    headers: {
      Location: buildAuthorizeUrl(state),
      "Set-Cookie": serialize(
        OAUTH_STATE_COOKIE_NAME,
        state,
        buildOauthStateCookieOptions()
      ),
    },
  })
}
