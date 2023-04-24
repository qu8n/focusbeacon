/* eslint-disable no-unused-vars */
import { parse } from "cookie";
import CryptoJS from "crypto-js";

export default async function handler(req, res) {
  console.log("Hit request API");

  const cookies = parse(req.headers.cookie || "");
  // console.log("cookies: ", cookies);
  const encryptedAccessToken = cookies.encrypted_access_token;
  // console.log("encryptedAccessToken: ", encryptedAccessToken);

  const accessToken = CryptoJS.AES.decrypt(
    encryptedAccessToken,
    process.env.ACCESS_TOKEN_ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);

  console.log("accessToken: ", accessToken);

  const requestOptions = {
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`
    }),
    redirect: "follow"
  };

  fetch("https://api.focusmate.com/v1/me", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      console.log("result: ", result);
      res.status(200).json({ result });
    })
    .catch((error) => console.log("error", error));

  //   const focusmateApiUrl = 'https://api.focusmate.com' + req.url;
  //   const response = await fetch(focusmateApiUrl, {
  //     method: req.method,
  //     headers: {
  //       ...req.headers,
  //       'Authorization': `Bearer ${decryptedAccessToken}`,
  //     },
  //     body: req.body,
  //   });

  //   const data = await response.json();
  //   res.status(response.status).json(data);
}
