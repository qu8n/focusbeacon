"use client"

import { useEffect } from "react"
import { Text, TextLink } from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import { CONTACT_URL } from "@/components/common/footer"
import { LinkExternal } from "@/components/ui/link-external"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col mt-10 text-left items-start">
      <Text>Something went wrong. Try refreshing the page.</Text>
      <Text>
        If that doesn&apos;t work, let us know{" "}
        <LinkExternal href={CONTACT_URL} openInNewTab>
          <TextLink>here</TextLink>.
        </LinkExternal>
      </Text>
      <Button className="mt-2" onClick={() => reset()}>
        Refresh the page
      </Button>
    </div>
  )
}
