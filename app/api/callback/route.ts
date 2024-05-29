import {
  fmApiProfileUrl,
  fmOAuthClientID,
  fmOAuthClientSecret,
  fmOAuthUrlForAccessToken,
  oauthRedirectUri,
  siteUrl,
} from "@/utils/oauth"
import { serialize } from "cookie"
import { encrypt, generateSessionId } from "@/utils/crypto"

export const sessionCookieName = "sessionId"

export async function POST(request: Request) {
  const { authorizationCode } = await request.json()

  try {
    const accessToken = await fetchAccessToken(authorizationCode)
    const { user } = await fetchProfileData(accessToken)
    const sessionId = generateSessionId()

    saveProfileDataToDb(user, accessToken, sessionId)

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
  const response = await fetch(fmOAuthUrlForAccessToken, {
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
  const data = await response.json()
  return data.access_token
}

async function fetchProfileData(accessToken: string) {
  const response = await fetch(fmApiProfileUrl, {
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
      sameSite: "strict" as "strict", // due to this Next cookie option not being standardized yet
      path: "/",
    }
  } else {
    return {
      secure: false,
      httpOnly: true,
      path: "/",
      sameSite: "strict" as "strict",
    }
  }
}

interface FocusmateUser {
  userId: string
  name: string
  totalSessionCount: number
  timeZone: string
  photoUrl: string
  memberSince: string
}

// TODO: Save user data to Supabase db
async function saveProfileDataToDb(
  user: FocusmateUser,
  accessToken: string,
  sessionId: string
) {
  const userDataForDb = {
    userId: user.userId,
    totalSessionCount: user.totalSessionCount,
    timeZone: user.timeZone,
    memberSince: user.memberSince,
    encryptedAccessToken: encrypt(accessToken),
    encryptedSessionId: encrypt(sessionId),
  }
}
