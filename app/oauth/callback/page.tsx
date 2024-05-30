"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Callback() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const authorizationCode = searchParams.get("code")

  useEffect(() => {
    if (!authorizationCode) {
      console.error("Authorization code not found")
      return
    }

    async function handlePostCallbackFlow(authorizationCode: string) {
      const response = await fetch("/api/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorizationCode: authorizationCode,
        }),
      })
      if (!response.ok) {
        throw new Error(
          "Failed to either obtain access token or upsert profile data"
        )
      }
    }

    handlePostCallbackFlow(authorizationCode)
      .then(() => router.push("/dashboard"))
      .catch((error) => console.error(error))
  }, [router, authorizationCode])

  if (!authorizationCode) {
    return <p>Authorization code not found</p>
  } else {
    return "Loading..."
  }
}
