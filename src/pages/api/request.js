import { parse } from "cookie";
import CryptoJS from "crypto-js";
import { fetchProfileData, fetchSessionsData } from "../../utils/fetchData";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  // Get headers content for Focusmate API requests
  let headers;
  if (req.query.isDemo === "true") {
    headers = new Headers({
      "X-API-KEY": process.env.DEMO_FOCUSMATE_API_KEY
    });
  } else {
    // Get access token from cookie and set headers with it
    if (!req.headers.cookie) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const cookies = parse(req.headers.cookie);
    const encryptedAccessToken = cookies.encrypted_access_token;
    const accessToken = CryptoJS.AES.decrypt(
      encryptedAccessToken,
      process.env.ACCESS_TOKEN_ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);
    headers = new Headers({
      Authorization: `Bearer ${accessToken}`
    });
  }

  // Fetch data from Focusmate API
  const profileData = await fetchProfileData(headers);
  const { userId, timeZone, memberSince } = profileData.user;
  const sessionsData = await fetchSessionsData(headers, memberSince);

  // Save data to Supabase
  await supabase?.from("user").upsert({
    user_id: userId,
    time_zone: timeZone
  });

  res.status(200).json({ profileData, sessionsData });
}

// Override Next.js API response's data limit of 4MB
export const config = {
  api: {
    responseLimit: false
  }
};
