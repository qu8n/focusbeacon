"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { LinkInternal } from "../ui/link-internal"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"
import { useRouter } from "next/navigation"

export function SigninButton({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { isLoading, isSignedIn } = useGetSigninStatus()

  return (
    <>
      <Button
        disabled={isLoading}
        color="orange"
        type="button"
        onClick={() => {
          if (isSignedIn) {
            router.push("/dashboard")
          } else {
            setIsOpen(true)
          }
        }}
      >
        <span className={className}>{text}</span>
      </Button>

      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Have you already signed into Focusmate?</DialogTitle>
        <DialogDescription>
          Ensure that you have already signed in to Focusmate on your browser.{" "}
          <span className="underline underline-offset-2 decoration-2 decoration-wavy decoration-orange-400">
            If not, please do so first, then come back to this window.
          </span>
        </DialogDescription>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>

          <Button color="orange">
            <LinkInternal href="/continue">
              <span className={className}>Yes, I&apos;m ready to continue</span>
            </LinkInternal>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
