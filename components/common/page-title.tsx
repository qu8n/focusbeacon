"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Heading } from "../ui/heading"

function updateTitle(currPage: string | null) {
  switch (currPage) {
    case "home":
      return null
    case "/_not-found":
      return "Not Found"
    default:
      return currPage
  }
}

export function PageTitle() {
  let currPage = useSelectedLayoutSegment()
  currPage = updateTitle(currPage)

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
