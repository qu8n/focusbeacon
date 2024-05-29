import { buildRequestBodyForAccessToken, fmOAuthUrlForAccessToken } from "@/utils/oauth";
import { encrypt, generateSessionId } from "@/utils/crypto";

const fmApiProfileUrl = process.env.NEXT_PUBLIC_FM_API_PROFILE_URL as string;

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
  let encryptedAccessToken: string | undefined;
  let sessionId: string | undefined;
  let encryptedSessionId: string | undefined;
  let userDataForDb: Record<string, any> | undefined;

  try {
    const response = await fetch(fmOAuthUrlForAccessToken,
      buildRequestBodyForAccessToken(authorizationCode));
    const data = await response.json();

    accessToken = data.access_token as string;
    encryptedAccessToken = encrypt(accessToken);

    sessionId = generateSessionId();
    encryptedSessionId = encrypt(sessionId);

    const response2 = await fetch(fmApiProfileUrl, {
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
      }),
      method: "GET",
      redirect: "follow",
    });
    const data2 = await response2.json();
    const { user } = data2;
    const {
      userId,
      totalSessionCount,
      timeZone,
      memberSince,
    } = user;
    userDataForDb = {
      userId,
      totalSessionCount,
      timeZone,
      memberSince,
      encryptedAccessToken,
      encryptedSessionId,
    };
  } catch (error) {
    console.error(error);
  }
  
  return (
    <>
      <p>Authorization code: {authorizationCode}</p>
      <p>Access token: {accessToken || "not found"}</p>
      <p>Session ID: {sessionId || "not found"}</p>
      <p>Encrypted access token: {encryptedAccessToken ? encryptedAccessToken : "not found"}</p>
      <p>Encrypted session ID: {encryptedSessionId ? encryptedSessionId : "not found"}</p>
      <p>User data for database: {JSON.stringify(userDataForDb)}</p>
    </>
  )
}
