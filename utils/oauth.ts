
export const siteUrl = (process.env.NODE_ENV === "production" ? 
  process.env.NEXT_PUBLIC_PROD_SITE_URL : process.env.NEXT_PUBLIC_DEV_SITE_URL) as string;

export const oauthRedirectUri = `${siteUrl}/oauth/callback`;

const fmOAuthBaseUrlForAuthCode = process.env.NEXT_PUBLIC_FM_OAUTH_BASE_URL_FOR_AUTH_CODE as string;
export const fmOAuthUrlForAccessToken = process.env.NEXT_PUBLIC_FM_OAUTH_URL_FOR_ACCESS_TOKEN as string;

export const fmApiProfileUrl = process.env.NEXT_PUBLIC_FM_API_PROFILE_URL as string;
export const fmApiSesssionsBaseUrl = process.env.NEXT_PUBLIC_FM_API_SESSIONS_BASE_URL as string;

const fmOAuthScope = process.env.NEXT_PUBLIC_FM_OAUTH_SCOPE as string;
export const fmOAuthClientID = process.env.NEXT_PUBLIC_FM_OAUTH_CLIENT_ID as string;
export const fmOAuthClientSecret = process.env.FM_OAUTH_CLIENT_SECRET as string;

const urlParamsAsObj = {
  client_id: fmOAuthClientID,
  response_type: "code", // authorization code
  scope: fmOAuthScope,
  redirect_uri: oauthRedirectUri,
};
const urlParamsAsString = Object.entries(urlParamsAsObj)
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join("&");
export const fmOAuthForAuthCodeUrl = `${fmOAuthBaseUrlForAuthCode}?${urlParamsAsString}`;
