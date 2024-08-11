"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { LinkExternal } from "@/components/ui/link-external"
import { dialog } from "@/app/home/components/config"
import { SignInStatusContext } from "@/components/common/providers"
import { FM_OAUTH_FOR_AUTH_CODE_URL } from "@/lib/config"

export function SigninButton({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { isSignedIn } = useContext(SignInStatusContext)

  if (router && isOpen && isSignedIn) {
    router.push("/dashboard")
  }

  return (
    <>
      <Button
        color="orange"
        type="button"
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

          <Button color="orange">
            <LinkExternal
              href={FM_OAUTH_FOR_AUTH_CODE_URL}
              openInNewTab={false}
            >
              {dialog.continue}
            </LinkExternal>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
