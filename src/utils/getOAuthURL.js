// Build the OAuth URL to redirect to Focusmate's OAuth page following their guide:
// https://focusmate.notion.site/OAuth-Integration-Guide-89dbff2ce67b43fd8719d20a6a7d50c8
export function getOAuthURL() {
  const baseURL = "https://www.focusmate.com/oauth/authorize";
  const paramsObj = {
    client_id: process.env.NEXT_PUBLIC_FOCUSMATE_CLIENT_ID,
    response_type: "code",
    scope: "profile sessions",
    redirect_uri:
      process.env.NODE_ENV === "production"
        ? "https://www.focusbeacon.com/oauth/callback"
        : "http://localhost:3000/oauth/callback"
  };

  const paramsString = Object.entries(paramsObj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${baseURL}?${paramsString}`;
}
