export function getFocusmateOAuthURL() {
  const siteUrl = process.env.NODE_ENV === "production" ?
    process.env.NEXT_PUBLIC_PROD_SITE_URL : process.env.NEXT_PUBLIC_DEV_SITE_URL;

  const oauthBaseUrl = "https://app.focusmate.com/oauth/authorize";

  const paramsObj = {
    client_id: process.env.NEXT_PUBLIC_FOCUSMATE_CLIENT_ID!,
    response_type: "code",
    scope: process.env.NEXT_PUBLIC_FOCUSMATE_SCOPE!,
    redirect_uri: `${siteUrl}/oauth/callback`,
  };

  const paramsString = Object.entries(paramsObj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${oauthBaseUrl}?${paramsString}`;
}