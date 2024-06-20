"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Button } from "./button"
import { Heading } from "./heading"

const tabNames = ["streak", "weekly", "monthly", "yearly", "lifetime"]

export default function Header() {
  const currTabName = useSelectedLayoutSegment()

  return (
    <>
      <Heading>{currTabName}</Heading>

      <div className="flex gap-2">
        {tabNames.map((tabName) => {
          if (tabName === currTabName) {
            return (
              <Button key={tabName} href={`/dashboard/${tabName}`}>
                {tabName}
              </Button>
            )
          }
          return (
            <Button key={tabName} href={`/dashboard/${tabName}`} outline>
              {tabName}
            </Button>
          )
        })}
      </div>
    </>
  )
}
