"use client"

import { LinkExternal } from "@/components/ui/link-external"
import { fmOAuthForAuthCodeUrl } from "@/lib/oauth"
import { Button } from "@/components/ui/button"
import { LinkInternal } from "../ui/link-internal"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"

export function NavbarClient() {
  const { isLoading, isSuccess } = useGetSigninStatus()

  if (isLoading) {
    return <></>
  }

  if (!isSuccess) {
    return (
      <LinkExternal href={fmOAuthForAuthCodeUrl} openInNewTab={false}>
        <Button>Sign In</Button>
      </LinkExternal>
    )
  }

  return (
    <LinkInternal href="/dashboard">
      <Button outline>Dashboard</Button>
    </LinkInternal>
  )
}
