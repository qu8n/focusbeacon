import {
  FM_API_URL,
  FM_API_OAUTH_TOKEN_ENDPOINT,
  FM_API_PROFILE_ENDPOINT,
  FM_OAUTH_CLIENT_ID,
  FM_OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URL,
  OAUTH_STATE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/config"
import { serialize } from "cookie"
import { cookies } from "next/headers"
import { encrypt, generateSessionId } from "@/lib/encryption"
import { supabaseClient } from "@/lib/supabase"
import { FmProfile, FmUser } from "@/types/focusmate"
import { TablesInsert } from "@/types/supabase"
import { buildCookieOptions, buildOauthStateCookieOptions } from "@/lib/cookie"

export async function POST(request: Request) {
  const { authorizationCode, state } = await request.json()

  // Only exchange a code this browser actually asked for. Skipping the check
  // lets anyone lure a user to /oauth/callback with an authorization code for
  // someone else's Focusmate account and sign them in as that person.
  const expectedState = (await cookies()).get(OAUTH_STATE_COOKIE_NAME)?.value
  if (!expectedState || !state || state !== expectedState) {
    return new Response("Invalid OAuth state", { status: 400 })
  }

  try {
    const accessToken = await fetchAccessToken(authorizationCode)
    const { user } = await fetchProfileData(accessToken)
    const sessionId = generateSessionId()

    await saveProfileDataToDb(user, accessToken, sessionId)

    // Set HTTPOnly cookie with user's session ID
    const headers = new Headers()
    headers.append(
      "Set-Cookie",
      serialize(SESSION_COOKIE_NAME, sessionId, buildCookieOptions())
    )
    // The nonce covers one sign-in, so retire it rather than leaving it
    // available for a replayed code
    headers.append(
      "Set-Cookie",
      serialize(OAUTH_STATE_COOKIE_NAME, "", {
        ...buildOauthStateCookieOptions(),
        maxAge: -1,
      })
    )

    return new Response("Cookie set", { status: 200, headers })
  } catch (error) {
    console.error(error)
    return new Response(`Error: ${error}`, {
      status: 500,
    })
  }
}

// Errors propagate to the POST handler rather than being caught here. Logging
// and returning undefined meant the caller carried on to the profile endpoint
// as "Bearer undefined", so a token-exchange failure was reported to the user
// as a profile failure -- or, once the undefined token reached encrypt(), as a
// TypeError out of the crypto layer.
async function fetchAccessToken(authorizationCode: string) {
  const response = await fetch(FM_API_URL + FM_API_OAUTH_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: FM_OAUTH_CLIENT_ID,
      client_secret: FM_OAUTH_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: authorizationCode,
      redirect_uri: OAUTH_REDIRECT_URL,
    }),
  })
  if (!response.ok) {
    throw new Error(
      `Failed to get access token: Focusmate returned ${response.status}`
    )
  }

  const { access_token } = await response.json()
  // A 200 carrying no token would otherwise be stored as ciphertext of
  // "undefined" and fail much later, on the user's first dashboard request
  if (!access_token) {
    throw new Error("Failed to get access token: response carried none")
  }
  return access_token as string
}

async function fetchProfileData(accessToken: string): Promise<FmProfile> {
  const response = await fetch(FM_API_URL + FM_API_PROFILE_ENDPOINT, {
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
    }),
    method: "GET",
    redirect: "follow",
  })
  if (!response.ok) {
    throw new Error("Failed to get profile data")
  }
  return response.json()
}

async function saveProfileDataToDb(
  user: FmUser,
  accessToken: string,
  sessionId: string
) {
  const dbUser: TablesInsert<"profile"> = {
    user_id: user.userId,
    total_session_count: user.totalSessionCount,
    time_zone: user.timeZone,
    access_token_encrypted: encrypt(accessToken),
    session_id: sessionId,
  }

  // Same reason as the sign-out revoke: supabase-js reports failures through
  // `error` instead of throwing. Unchecked, a rejected upsert still let the
  // caller set a session cookie whose ID the Python API cannot resolve, so the
  // user landed on a dashboard that 401s on every request.
  const { error } = await supabaseClient.from("profile").upsert(dbUser)

  if (error) {
    throw new Error(`Failed to save profile: ${error.message}`)
  }
}
