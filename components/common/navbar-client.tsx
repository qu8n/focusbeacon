"use client"

import { Button } from "@/components/ui/button"
import { LinkInternal } from "../ui/link-internal"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"
import { SigninButton } from "./signin-button"

export function NavbarClient() {
  const { isLoading, isSuccess } = useGetSigninStatus()

  if (isLoading) {
    return <></>
  }

  if (!isSuccess) {
    return <SigninButton text="Sign in" />
  }

  return (
    <LinkInternal href="/dashboard">
      <Button outline>Dashboard</Button>
    </LinkInternal>
  )
}
