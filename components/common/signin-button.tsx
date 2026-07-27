"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { dialog } from "@/app/home/components/config"
import { SignInStatusContext } from "@/components/common/providers"

export function SigninButton({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { isSignedIn, isCheckingSignInStatus } = useContext(SignInStatusContext)

  // Only reached if the answer changes while the dialog is already open (a
  // sign-out invalidates this query). Close before navigating, or the modal
  // stays up over the transition. The button below is what keeps this from
  // being the common path.
  useEffect(() => {
    if (isOpen && isSignedIn) {
      setIsOpen(false)
      router.push("/dashboard")
    }
  }, [isOpen, isSignedIn, router])

  return (
    <>
      <Button
        color="orange"
        type="button"
        // The check is one un-retried request, so this is brief. Staying
        // disabled through it means the dialog can never open while the
        // answer is unknown -- otherwise a signed-in user who clicks early
        // gets the "have you signed into Focusmate?" prompt they don't need,
        // and in the navbar the resolving check swaps this whole subtree out,
        // tearing the dialog down without ever reaching the dashboard.
        disabled={isCheckingSignInStatus}
        onClick={() => {
          if (isSignedIn) {
            router.push("/dashboard")
          } else {
            setIsOpen(true)
          }
        }}
        className={className}
      >
        {text}
      </Button>

      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>{dialog.title}</DialogTitle>
        <DialogDescription>
          {dialog.description_normal}{" "}
          <span className="underline underline-offset-4 decoration-2 decoration-wavy decoration-orange-400">
            {dialog.description_underlined}
          </span>
        </DialogDescription>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            {dialog.cancel}
          </Button>

          {/* Navigates to our own endpoint rather than straight to Focusmate,
              so the server mints the OAuth state nonce. Deliberately not an
              <a> nested inside the Button -- that leaves only the text
              clickable while the surrounding padding does nothing -- and
              deliberately not Button's `href`, which routes through next/link
              and would prefetch /api/sign-in, burning a nonce and setting a
              cookie just from opening this dialog. */}
          <Button
            color="orange"
            onClick={() => {
              window.location.href = "/api/sign-in"
            }}
          >
            {dialog.continue}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
