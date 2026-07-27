"use client"

import { DashboardSkeleton } from "@/components/common/dashboard-skeleton"
import { CONTACT_URL } from "@/components/common/footer"
import { SigninButton } from "@/components/common/signin-button"
import { LinkExternal } from "@/components/ui/link-external"
import { LinkInternal } from "@/components/ui/link-internal"
import { TextLink, Text } from "@/components/ui/text"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function Callback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasCalled = useRef(false)
  // A code can be present and still fail to exchange -- a stale or mismatched
  // OAuth state, or a Focusmate error. Without this the page sits on the
  // loading skeleton forever with no way back
  const [failed, setFailed] = useState(false)

  const authorizationCode = searchParams.get("code")
  // Echoed back by Focusmate; /api/callback checks it against the HttpOnly
  // nonce set when sign-in started
  const state = searchParams.get("state")

  useEffect(() => {
    // Prevents handlePostCallbackFlow being called multiple times
    if (hasCalled.current) {
      return
    } else if (!authorizationCode) {
      console.error("Authorization code not found")
      return
    }

    async function handlePostCallbackFlow(authorizationCode: string) {
      hasCalled.current = true

      const response = await fetch("/api/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorizationCode: authorizationCode,
          state: state,
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
      .catch((error) => {
        console.error(error)
        setFailed(true)
      })
  }, [router, authorizationCode, state])

  if (authorizationCode && !failed) {
    return <DashboardSkeleton />
  } else {
    return (
      <div className="flex flex-col mt-10 text-left items-start">
        <Text>
          Please try again and click &quot;Allow&quot; on the new window.
        </Text>
        <Text>
          If that doesn&apos;t work, let us know{" "}
          <LinkExternal href={CONTACT_URL} openInNewTab>
            <TextLink>here</TextLink>.
          </LinkExternal>
        </Text>
        <Text>
          For details on our privacy policy, find out more{" "}
          <LinkInternal href="/privacy">
            <TextLink>here</TextLink>.
          </LinkInternal>
        </Text>
        <SigninButton className="mt-2" text="Try again" />
      </div>
    )
  }
}
