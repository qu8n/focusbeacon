export const siteUrl = (
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_SITE_URL
    : process.env.NEXT_PUBLIC_DEV_SITE_URL
) as string

export const oauthRedirectUri = `${siteUrl}/oauth/callback`

const fmOAuthBaseUrlForAuthCode = process.env
  .NEXT_PUBLIC_FM_OAUTH_BASE_URL_FOR_AUTH_CODE as string

export const fmApiDomain = process.env.NEXT_PUBLIC_FM_API_URL as string

export const fmApiProfileEndpoint = process.env
  .NEXT_PUBLIC_FM_API_PROFILE_ENDPOINT as string
export const fmApiSessionsEndpoint = process.env
  .NEXT_PUBLIC_FM_API_SESSIONS_ENDPOINT as string
export const fmApiOAuthTokenEndpoint = process.env
  .NEXT_PUBLIC_FM_OAUTH_TOKEN_ENDPOINT as string

const fmOAuthScope = process.env.NEXT_PUBLIC_FM_OAUTH_SCOPE as string

export const fmOAuthClientID = process.env
  .NEXT_PUBLIC_FM_OAUTH_CLIENT_ID as string

export const fmOAuthClientSecret = process.env.FM_OAUTH_CLIENT_SECRET as string

const urlParamsAsObj = {
  client_id: fmOAuthClientID,
  response_type: "code", // authorization code
  scope: fmOAuthScope,
  redirect_uri: oauthRedirectUri,
}
const urlParamsAsString = Object.entries(urlParamsAsObj)
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join("&")
export const fmOAuthForAuthCodeUrl = `${fmOAuthBaseUrlForAuthCode}?${urlParamsAsString}`
