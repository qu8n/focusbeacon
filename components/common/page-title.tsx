"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Heading } from "../ui/heading"

export function PageTitle() {
  let currPage = useSelectedLayoutSegment()
  if (currPage === "/_not-found") currPage = "Not Found"
  if (currPage === "home") currPage = null

  return (
    <div className="flex flex-col mt-4">
      {currPage && <Heading>{currPage}</Heading>}
    </div>
  )
}
