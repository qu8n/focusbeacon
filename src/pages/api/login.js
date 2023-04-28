import CryptoJS from "crypto-js";
import setCookie from "../../utils/setCookie";

export default async function handler(req, res) {
  const authorizationCode = req.body.authorizationCode;

  try {
    // Exchange authorization code for access token
    const response = await fetch("https://api.focusmate.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_FOCUSMATE_CLIENT_ID,
        client_secret: process.env.FOCUSMATE_CLIENT_SECRET,
        code: authorizationCode,
        grant_type: "authorization_code"
      })
    });
    const data = await response.json();
    const accessToken = data.access_token;

    // Encrypt access token and turn it into a secure, HttpOnly cookie
    const encryptedAccessToken = CryptoJS.AES.encrypt(
      accessToken,
      process.env.ACCESS_TOKEN_ENCRYPTION_KEY
    ).toString();

    const serializedCookie = setCookie(
      process.env.NODE_ENV,
      "encrypted_access_token",
      encryptedAccessToken
    );

    // Set the encrypted access token as cookie on the client side
    res.setHeader("Set-Cookie", serializedCookie);
    res.status(200).json({ message: "Cookie set" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
