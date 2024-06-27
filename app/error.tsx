"use client"

import { useEffect } from "react"
import { Text } from "@/components/ui/text"
import { Button } from "@/components/ui/button"

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
    <div className="flex flex-col mx-auto mt-24">
      <Text>Something went wrong</Text>
      <Button outline className="mt-2" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
