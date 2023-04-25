/* eslint-disable no-unused-vars */
import { parse } from "cookie";
import CryptoJS from "crypto-js";
import { fetchProfileData, fetchSessionsData } from "../../utils/fetchData";

export default async function handler(req, res) {
  // Get headers content for Focusmate API requests
  let headers;
  if (req.query.isDemo === "true") {
    headers = new Headers({
      "X-API-KEY": process.env.DEMO_FOCUSMATE_API_KEY
    });
  } else {
    try {
      // Get access token from cookie and set headers with it
      const cookies = parse(req.headers.cookie);
      const encryptedAccessToken = cookies.encrypted_access_token;
      const accessToken = CryptoJS.AES.decrypt(
        encryptedAccessToken,
        process.env.ACCESS_TOKEN_ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8);
      headers = new Headers({
        Authorization: `Bearer ${accessToken}`
      });
    } catch (error) {
      console.error(error);
      // Using 500 because fetch doesn't recognize 4xx as an error
      res.status(500).json({ error: "Unauthorized" });
      return;
    }
  }

  // Fetch data from Focusmate API
  const profileData = await fetchProfileData(headers);
  const sessionsData = await fetchSessionsData(
    headers,
    profileData.user.memberSince
  );

  res.status(200).json({ profileData, sessionsData });
}
