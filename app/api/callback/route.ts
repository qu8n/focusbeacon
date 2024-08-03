import {
  FM_API_URL,
  FM_API_OAUTH_TOKEN_ENDPOINT,
  FM_API_PROFILE_ENDPOINT,
  FM_OAUTH_CLIENT_ID,
  FM_OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URL,
  FOCUSBEACON_SITE_URL,
  SESSION_COOKIE_NAME,
} from "@/lib/config"
import { serialize } from "cookie"
import { encrypt, generateSessionId } from "@/lib/encryption"
import { supabaseClient } from "@/lib/supabase"
import { FmProfile, FmUser } from "@/types/focusmate"
import { TablesInsert } from "@/types/supabase"

export async function POST(request: Request) {
  const { authorizationCode } = await request.json()

  try {
    const accessToken = await fetchAccessToken(authorizationCode)
    const { user } = await fetchProfileData(accessToken)
    const sessionId = generateSessionId()

    await saveProfileDataToDb(user, accessToken, sessionId)

    // Set HTTPOnly cookie with user's session ID
    return new Response("Cookie set", {
      status: 200,
      headers: {
        "Set-Cookie": serialize(
          SESSION_COOKIE_NAME,
          sessionId,
          buildCookieOptions()
        ),
      },
    })
  } catch (error) {
    console.error(error)
    return new Response(`Error: ${error}`, {
      status: 500,
    })
  }
}

async function fetchAccessToken(authorizationCode: string) {
  try {
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
      throw new Error("Failed to get access token")
    }
    const { access_token } = await response.json()
    return access_token
  } catch (error) {
    console.error(error)
  }
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

function buildCookieOptions() {
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

  await supabaseClient.from("profile").upsert(dbUser)
}
