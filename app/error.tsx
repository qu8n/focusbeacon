"use client"

import { useEffect } from "react"
import { Text, TextLink } from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import { navItems } from "@/components/common/footer"

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

  const contactUrl = navItems.find((item) => item.label === "Contact")?.url

  return (
    <div className="flex flex-col mt-10 text-left items-start">
      <Text>Something went wrong.</Text>
      <Text>Please try again.</Text>
      <Text>
        If that doesn&apos;t work, let us know{" "}
        <TextLink href={contactUrl!}>here</TextLink>.
      </Text>
      <Button className="mt-2" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
