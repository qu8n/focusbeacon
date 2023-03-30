import { useEffect } from "react";
import CryptoJS from "crypto-js";

export default function Callback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get("code");
    if (authorizationCode) {
      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          authorizationCode: authorizationCode
        })
      })
        .then((response) => response.json())
        .then((data) => {
          const encryptedAccessToken = JSON.stringify(
            data.encryptedAccessToken
          );
        })
        .catch((error) => console.error(error));
    }
  }, []);
}
