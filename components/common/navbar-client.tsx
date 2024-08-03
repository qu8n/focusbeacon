"use client"

import { Button } from "@/components/ui/button"
import { LinkInternal } from "../ui/link-internal"
import { SigninButton } from "./signin-button"
import { useContext } from "react"
import { SignInStatusContext } from "@/components/common/providers"
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from "@/components/ui/dropdown"
import { AvatarButton } from "@/components/ui/avatar"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DEFAULT_PHOTO_URL } from "@/lib/config"
import { useRouter } from "next/navigation"

export function NavbarClient() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isCheckingSignInStatus, isSignedIn } = useContext(SignInStatusContext)

  const { isLoading, data } = useQuery({
    queryKey: ["profilePhoto"],
    queryFn: async () => {
      const response = await fetch(`/api/py/profile-photo`)
      if (!response.ok) throw new Error("Failed to fetch goal")
      return await response.json()
    },
    enabled: !!isSignedIn,
  })

  const { mutate } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Fix for Nextjs/Vercel's bug that prevents cookie from being deleted
        // Source: https://stackoverflow.com/questions/66747845
        body: JSON.stringify({
          key: "static_key",
        }),
      })
      if (!response.ok) throw new Error("Failed to sign out")
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["signinStatus"] })
      await queryClient.invalidateQueries({
        queryKey: ["profilePhoto"],
        refetchType: "none",
      })
      router.push("/home")
    },
  })

  return (
    <>
      {isCheckingSignInStatus || !isSignedIn ? (
        <SigninButton text="Sign in" />
      ) : (
        <>
          <LinkInternal href="/dashboard">
            <Button outline>Dashboard</Button>
          </LinkInternal>

          <Dropdown>
            <DropdownButton
              className="size-8"
              as={AvatarButton}
              src={isLoading ? DEFAULT_PHOTO_URL : data.photo_url}
              aria-label="Account options"
            />
            <DropdownMenu>
              <DropdownItem onClick={() => mutate()}>Sign out</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </>
      )}
    </>
  )
}
