"use client"

import { SigninButton } from "@/components/common/signin-button"
import { useContext, useEffect, useState } from "react"
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
import { FadeIn } from "@/components/common/fade-in"
import { useToast } from "@/hooks/use-toast"

export function NavbarClient() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isSignedIn } = useContext(SignInStatusContext)
  const [profilePhoto, setProfilePhoto] = useState(null)

  const { isLoading, data } = useQuery({
    queryKey: ["profilePhoto"],
    queryFn: async () => {
      const response = await fetch(`/api/py/profile-photo`)
      if (!response.ok) throw new Error("Failed to fetch goal")
      const data = await response.json()
      setProfilePhoto(data.photo_url)
      return data
    },
    enabled: !!isSignedIn,
  })

  const { mutate } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setProfilePhoto(null)
      router.push("/home")
    },
    // Sign-out answers 5xx when it cannot revoke the session server-side, and
    // the cookie is deliberately left in place in that case. Without this the
    // click just does nothing -- the user walks away from a shared machine
    // believing they signed out while the session is still live.
    onError: () => {
      toast({
        description:
          "We couldn't sign you out. Your session may still be active — please try again.",
        className: "bg-red-50 border border-red-400 text-red-700",
      })
    },
  })

  useEffect(() => {
    if (data) {
      setProfilePhoto(data.photo_url)
    }
  }, [data])

  return (
    <div className="flex flex-row items-center gap-3">
      {isSignedIn ? (
        <>
          <FadeIn
            index={0}
            initial={{ x: 25 }}
            animationDefinition={{
              opacity: 1,
              x: 0,
              transition: { duration: 0.5 },
            }}
          >
            <SigninButton text="Dashboard" />
          </FadeIn>

          <FadeIn
            index={1}
            initial={{ opacity: 0 }}
            animationDefinition={{
              opacity: 1,
              transition: { duration: 0.5, delay: 0.5 },
            }}
          >
            <Dropdown>
              <DropdownButton
                className="size-8 pt-2"
                as={AvatarButton}
                src={isLoading ? DEFAULT_PHOTO_URL : profilePhoto}
                aria-label="Account options"
              />
              <DropdownMenu>
                <DropdownItem onClick={() => mutate()}>Sign out</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </FadeIn>
        </>
      ) : (
        <SigninButton text="Dashboard" />
      )}
    </div>
  )
}
