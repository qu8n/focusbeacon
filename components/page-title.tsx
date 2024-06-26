"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Heading } from "./heading"
import { Fraunces } from "next/font/google"
import { cx } from "@/lib/utils"

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
})

export default function PageTitle() {
  const currPage = useSelectedLayoutSegment()

  return (
    <div className={cx(fraunces.className, "flex flex-col mt-4")}>
      <Heading>{currPage}</Heading>
    </div>
  )
}
