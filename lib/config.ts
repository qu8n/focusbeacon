export const FOCUSBEACON_SITE_URL = process.env
  .NEXT_PUBLIC_FOCUSBEACON_SITE_URL as string

export const SESSION_COOKIE_NAME = process.env
  .NEXT_PUBLIC_SESSION_COOKIE_NAME as string

// Focusmate API endpoints
export const FM_API_URL = process.env.NEXT_PUBLIC_FM_API_URL as string
export const FM_API_PROFILE_ENDPOINT = process.env
  .NEXT_PUBLIC_FM_API_PROFILE_ENDPOINT as string
export const FM_API_SESSIONS_ENDPOINT = process.env
  .NEXT_PUBLIC_FM_API_SESSIONS_ENDPOINT as string
export const FM_API_OAUTH_TOKEN_ENDPOINT = process.env
  .NEXT_PUBLIC_FM_OAUTH_TOKEN_ENDPOINT as string

// Focusmate OAuth
export const OAUTH_REDIRECT_URL = `${FOCUSBEACON_SITE_URL}/oauth/callback`
export const FM_OAUTH_CLIENT_ID = process.env
  .NEXT_PUBLIC_FM_OAUTH_CLIENT_ID as string
export const FM_OAUTH_CLIENT_SECRET = process.env
  .FM_OAUTH_CLIENT_SECRET as string

// Build the OAuth URL for exchanging the authorization code for an access token
const urlParamsObj = {
  client_id: FM_OAUTH_CLIENT_ID,
  response_type: "code", // authorization code
  scope: process.env.NEXT_PUBLIC_FM_OAUTH_SCOPE as string,
  redirect_uri: OAUTH_REDIRECT_URL,
}
const urlParamsStr = Object.entries(urlParamsObj)
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join("&")
export const FM_OAUTH_FOR_AUTH_CODE_URL = `${process.env.NEXT_PUBLIC_FM_OAUTH_BASE_URL as string}?${urlParamsStr}`

// Supabase
export const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL as string
export const SUPABASE_SERVICE_ROLE_KEY = process.env
  .SUPABASE_SERVICE_ROLE_KEY as string
