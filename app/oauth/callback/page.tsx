"use client"

import { CONTACT_URL } from "@/components/common/footer"
import { LoaderIcon } from "@/components/common/loader-icon"
import { SigninButton } from "@/components/common/signin-button"
import { LinkExternal } from "@/components/ui/link-external"
import { LinkInternal } from "@/components/ui/link-internal"
import { TextLink, Text } from "@/components/ui/text"
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

  if (authorizationCode) {
    return (
      <div className="inline-flex items-center">
        <LoaderIcon />
        Processing your account information
        <span className="tracking-wider">...</span>
      </div>
    )
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
