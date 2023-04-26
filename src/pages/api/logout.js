import { parse } from "cookie";
import setCookie from "../../utils/setCookie";

export default async function handler(req, res) {
  // Get the encrypted access token from the cookie
  const cookies = parse(req.headers.cookie);
  const encryptedAccessToken = cookies.encrypted_access_token;

  // Delete the cookie by setting it to expire now
  const serializedCookie = setCookie(
    process.env.NODE_ENV,
    "encrypted_access_token",
    encryptedAccessToken,
    true // expires now
  );

  res.setHeader("Set-Cookie", serializedCookie);
  res.status(200).json({ success: true });
}
