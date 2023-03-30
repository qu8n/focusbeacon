import CryptoJS from "crypto-js";

export default function handler(req, res) {
  const authorizationCode = req.body.authorizationCode;

  const requestBody = new URLSearchParams({
    client_id: process.env.FOCUSMATE_CLIENT_ID,
    client_secret: process.env.FOCUSMATE_CLIENT_SECRET,
    code: authorizationCode,
    grant_type: "authorization_code"
  });

  fetch("https://api.focusmate.com/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: requestBody
  })
    .then((response) => response.json())
    .then((data) => {
      const accessToken = data.access_token;

      const encryptedAccessToken = CryptoJS.AES.encrypt(
        accessToken,
        process.env.ACCESS_TOKEN_ENCRYPTION_KEY
      ).toString();

      res.status(200).json({ encryptedAccessToken });

      // const requestOptions = {
      //   method: "GET",
      //   headers: new Headers({
      //     Authorization: `Bearer ${accessToken}`
      //   }),
      //   redirect: "follow"
      // };

      // fetch("https://api.focusmate.com/v1/me", requestOptions)
      //   .then((response) => response.text())
      //   .then((result) => {
      //     res.status(200).json({ result });
      //   })
      //   .catch((error) => console.log("error", error));
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: error });
    });
}
