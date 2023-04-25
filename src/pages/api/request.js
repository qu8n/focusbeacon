/* eslint-disable no-unused-vars */
import { parse } from "cookie";
import CryptoJS from "crypto-js";
import { fetchProfileData, fetchSessionsData } from "../../utils/fetchData";

export default async function handler(req, res) {
  // Get access token from cookie
  const cookies = parse(req.headers.cookie || "");
  const encryptedAccessToken = cookies.encrypted_access_token;
  const accessToken = CryptoJS.AES.decrypt(
    encryptedAccessToken,
    process.env.ACCESS_TOKEN_ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);

  // Set headers for API request
  let headers = new Headers({
    Authorization: `Bearer ${accessToken}`
  });
  if (req.query.isDemo === "true") {
    headers = new Headers({
      "X-API-KEY": process.env.DEMO_FOCUSMATE_API_KEY
    });
  }

  // Fetch data from Focusmate API
  const profileData = await fetchProfileData(headers);
  const sessionsData = await fetchSessionsData(
    headers,
    profileData.user.memberSince
  );

  res.status(200).json({ profileData, sessionsData });
}
