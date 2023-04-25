import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const error = urlParams.get("error");
    if (error && typeof window !== "undefined") {
      router.push("/welcome");
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
    if (response.status === 200) {
      router.push("/");
    } else {
      const data = await response.json();
      console.error(data.error);
      router.push("/welcome");
    }
  }
}
