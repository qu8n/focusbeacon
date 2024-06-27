"use client"

import { useQuery } from "@tanstack/react-query"
import { LinkExternal } from "@/components/ui/link-external"
import { fmOAuthForAuthCodeUrl } from "@/lib/oauth"
import { Button } from "@/components/ui/button"
import { LinkInternal } from "../ui/link-internal"

export function NavbarClient() {
  const { isLoading, isSuccess } = useQuery({
    queryKey: ["signinStatus"],
    queryFn: async () => {
      const response = await fetch(`/api/signin-status`)
      if (!response.ok) throw Error
      return response.status
    },
    staleTime: Infinity, // never refetch
    retry: false,
  })

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
