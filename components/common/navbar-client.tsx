"use client"

import { Button } from "@/components/ui/button"
import { LinkInternal } from "../ui/link-internal"
import { SigninButton } from "./signin-button"
import { useContext } from "react"
import { SignInStatusContext } from "@/components/common/providers"

export function NavbarClient() {
  const { isCheckingSignInStatus, isSignedIn } = useContext(SignInStatusContext)

  if (isCheckingSignInStatus || !isSignedIn) {
    return <SigninButton text="Sign in" />
  }

  return (
    <LinkInternal href="/dashboard">
      <Button outline>Dashboard</Button>
    </LinkInternal>
  )
}
