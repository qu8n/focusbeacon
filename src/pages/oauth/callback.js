import { useEffect } from "react";

export default function Callback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const error = urlParams.get("error");
    if (error && typeof window !== "undefined") {
      window.location.href = "/";
    }

    // Send the authorization code to the backend to exchange it for an access token,
    // which will be encrypted and set as a cookie on the client
    const authorizationCode = urlParams.get("code");
    if (authorizationCode) {
      try {
        fetchAccessToken(authorizationCode);
      } catch (error) {
        console.error(error);
      }
    }
  }, []);
}

async function fetchAccessToken(authorizationCode) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      authorizationCode: authorizationCode
    })
  });
  const data = await response.json();
  if (data.message === "Cookie set") {
    window.location.href = "/dashboard";
  }
}
