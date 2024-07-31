"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Heading } from "../ui/heading"

export function PageTitle() {
  let currPage = useSelectedLayoutSegment()

  switch (currPage) {
    case "home":
      currPage = null
      break
    case "oauth":
      currPage = null
      break
    case "/_not-found":
      currPage = "Not Found"
      break
  }

  return (
    <>
      {currPage && (
        <div className="flex flex-col mt-4 mb-12">
          <Heading>{currPage}</Heading>
        </div>
      )}
    </>
  )
}
