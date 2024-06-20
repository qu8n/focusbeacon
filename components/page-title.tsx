"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Heading } from "./heading"

export default function PageTitle() {
  const currPage = useSelectedLayoutSegment()

  return (
    <div className="flex flex-col gap-2">
      <Heading>{currPage}</Heading>
    </div>
  )
}
