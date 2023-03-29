import { useEffect } from "react";

export default function Callback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      // Do something with the authorization code, such as send it to your server
      console.log(`Sent ${code}`);

      // Send the authorization code to the backend server
      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          authorizationCode: code
        })
      })
        .then((response) => response.json())
        .then((data) => console.log(`Got ${JSON.stringify(data)} in return`))
        .catch((error) => console.error(error));
    }
  }, []);
}
