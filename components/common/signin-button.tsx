"use client"

import { LinkExternal } from "@/components/ui/link-external"
import { fmOAuthForAuthCodeUrl } from "@/lib/oauth"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

export function SigninButton({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button color="orange" type="button" onClick={() => setIsOpen(true)}>
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
            <LinkExternal href={fmOAuthForAuthCodeUrl} openInNewTab={false}>
              <span className={className}>Yes, I&apos;m ready to continue</span>
            </LinkExternal>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
