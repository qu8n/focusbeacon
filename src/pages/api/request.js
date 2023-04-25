/* eslint-disable no-unused-vars */
import { parse } from "cookie";
import CryptoJS from "crypto-js";
import { fetchProfileData, fetchSessionsData } from "../../utils/fetchData";

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");

  const encryptedAccessToken = cookies.encrypted_access_token;

  const accessToken = CryptoJS.AES.decrypt(
    encryptedAccessToken,
    process.env.ACCESS_TOKEN_ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);

  const profileData = await fetchProfileData(accessToken);
  const memberSince = profileData?.user?.memberSince;
  const sessionsData = await fetchSessionsData(memberSince, accessToken);

  res.status(200).json({ profileData, sessionsData });
}
