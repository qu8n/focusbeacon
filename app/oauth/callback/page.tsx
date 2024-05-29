import { buildRequestBodyForAccessToken, fmOAuthUrlForAccessToken } from "@/utils/oauth";
import { encrypt, generateSessionId } from "@/utils/crypto";

export default async function Callback({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const authorizationCode = searchParams["code"] as string | undefined;

  if (!authorizationCode) {
    return <p>Authorization code not found</p>
  }

  let accessToken: string | undefined;
  let sessionId: string | undefined;

  try {
    const response = await fetch(fmOAuthUrlForAccessToken,
      buildRequestBodyForAccessToken(authorizationCode));
    const data = await response.json();
    accessToken = data.access_token;
    sessionId = generateSessionId();
    
  } catch (error) {
    console.error(error);
  }
  
  return (
    <>
      <p>Authorization code: {authorizationCode}</p>
      <p>Access token: {accessToken || "not found"}</p>
      <p>Session ID: {sessionId || "not found"}</p>
      <p>Encrypted access token: {accessToken ? encrypt(accessToken) : "not found"}</p>
      <p>Encrypted session ID: {sessionId ? encrypt(sessionId) : "not found"}</p>
    </>
  )
}
