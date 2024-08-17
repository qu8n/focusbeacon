"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Heading } from "@/components/ui/heading"

export function PageTitle() {
  let currPage = useSelectedLayoutSegment()

  switch (currPage) {
    case "home":
      currPage = null
      break
    case "signin":
      currPage = "Sign In"
      break
    case "oauth":
      currPage = "Dashboard"
      break
    case "/_not-found":
      currPage = "Not Found"
      break
  }

  return (
    <>
      {currPage && (
        <div className="flex flex-col mt-4">
          <Heading>{currPage}</Heading>
        </div>
      )}
    </>
  )
}
