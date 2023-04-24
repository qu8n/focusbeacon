import CryptoJS from "crypto-js";
import { serialize } from "cookie";

export default async function handler(req, res) {
  console.log("Hit login API");
  const authorizationCode = req.body.authorizationCode;

  try {
    // Exchange authorization code for access token
    const response = await fetch("https://api.focusmate.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: process.env.FOCUSMATE_CLIENT_ID,
        client_secret: process.env.FOCUSMATE_CLIENT_SECRET,
        code: authorizationCode,
        grant_type: "authorization_code"
      })
    });
    const data = await response.json();
    const accessToken = data.access_token;

    console.log("accessToken: ", accessToken);

    // Encrypt access token and set it as a cookie
    const encryptedAccessToken = CryptoJS.AES.encrypt(
      accessToken,
      process.env.ACCESS_TOKEN_ENCRYPTION_KEY
    ).toString();

    // console.log("encryptedAccessToken: ", encryptedAccessToken);

    let cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      domain: "focusbeacon.vercel.app",
      path: "/"
    };

    if (process.env.NODE_ENV === "development") {
      cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/"
      };
    }

    const serializedCookie = serialize(
      "encrypted_access_token",
      encryptedAccessToken,
      cookieOptions
    );
    res.setHeader("Set-Cookie", serializedCookie);
    res.status(200).json({ message: "Cookie set" });
    console.log("Cookie set");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
