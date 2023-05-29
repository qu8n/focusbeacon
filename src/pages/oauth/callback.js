import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { LoaderSpinner } from "../../components/LoaderSpinner";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Redirect to home if there is an error
    const error = urlParams.get("error");
    if (error && typeof window !== "undefined") {
      router.push("/");
    }

    // Send the authorization code to the backend to exchange it for an access token,
    // which will be encrypted and set as a HttpOnly cookie on the client
    const authorizationCode = urlParams.get("code");
    if (authorizationCode) {
      try {
        getAndSaveAccessToken(authorizationCode);
      } catch (error) {
        console.error(error);
      } finally {
        router.push("/dashboard");
      }
    }

    async function getAndSaveAccessToken(authorizationCode) {
      await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          authorizationCode: authorizationCode
        })
      });
    }
  }, []);

  return <LoaderSpinner />;
}
