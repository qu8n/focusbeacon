import { buildRequestBodyForAccessToken, fmOAuthUrlForAccessToken } from "@/utils/oauth";

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

  try {
    const response = await fetch(fmOAuthUrlForAccessToken,
      buildRequestBodyForAccessToken(authorizationCode));
    const data = await response.json();
    accessToken = data.access_token;
    
  } catch (error) {
    console.error(error);
  }
  
  return (
    <>
      <p>Authorization code: {authorizationCode}</p>
      <p>Access token: {accessToken || "not found"}</p>
    </>
  )
}
