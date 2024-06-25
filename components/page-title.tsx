"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Heading } from "./heading"

export default function PageTitle() {
  const currPage = useSelectedLayoutSegment()

  return (
    <div className="flex flex-col mt-4">
      <Heading>{currPage}</Heading>
    </div>
  )
}
