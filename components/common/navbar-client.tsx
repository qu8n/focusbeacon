"use client"

import { Button } from "@/components/ui/button"
import { LinkInternal } from "../ui/link-internal"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"
import { SigninButton } from "./signin-button"

export function NavbarClient() {
  const { isLoading, isSignedIn } = useGetSigninStatus(["signinStatus0"])

  if (isLoading) {
    return <></>
  }

  if (!isSignedIn) {
    return <SigninButton text="Sign in" />
  }

  return (
    <LinkInternal href="/dashboard">
      <Button outline>Dashboard</Button>
    </LinkInternal>
  )
}
