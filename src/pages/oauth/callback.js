import { useEffect } from "react";

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
        .then((data) =>
          console.log(`Client got ${JSON.stringify(data)} in return`)
        )
        .catch((error) => console.error(error));
    }
  }, []);
}
