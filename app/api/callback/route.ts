import {
  fmApiDomain,
  fmApiOAuthTokenEndpoint,
  fmApiProfileEndpoint,
  fmOAuthClientID,
  fmOAuthClientSecret,
  oauthRedirectUri,
  siteUrl,
} from "@/lib/oauth"
import { serialize } from "cookie"
import { encrypt, generateSessionId } from "@/lib/cryptography"
import { supabaseClient } from "@/lib/supabase"
import { FmProfile, FmUser } from "@/types/focusmate"
import { TablesInsert } from "@/types/supabase"

const sessionCookieName = process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME as string

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
          sessionCookieName,
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
    const response = await fetch(fmApiDomain + fmApiOAuthTokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: fmOAuthClientID,
        client_secret: fmOAuthClientSecret,
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: oauthRedirectUri,
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
  const response = await fetch(fmApiDomain + fmApiProfileEndpoint, {
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
      domain: new URL(siteUrl).hostname,
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
    member_since: user.memberSince,
    access_token_encrypted: encrypt(accessToken),
    session_id: sessionId,
  }

  await supabaseClient.from("profile").upsert(dbUser)
}
