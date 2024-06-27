"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Heading } from "../ui/heading"
import { Fraunces } from "next/font/google"
import { cx } from "@/lib/utils"

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
})

export function PageTitle() {
  let currPage = useSelectedLayoutSegment()
  if (currPage === "/_not-found") currPage = "Not Found"
  if (currPage === "home") currPage = null

  return (
    <div className={cx(fraunces.className, "flex flex-col mt-4")}>
      {currPage && <Heading>{currPage}</Heading>}
    </div>
  )
}
