"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Heading } from "./heading"
import { TabNavigation, TabNavigationLink } from "./tabs"
import { useState } from "react"

const tabNames = ["streak", "weekly", "monthly", "yearly", "lifetime"]

export default function Subheader() {
  const [currTabName, setCurrTabName] = useState(useSelectedLayoutSegment())

  return (
    <div className="flex flex-col gap-2">
      <Heading>{currTabName}</Heading>

      <TabNavigation className="mt-4 sm:mt-0">
        {tabNames.map((tabName) => {
          return (
            <TabNavigationLink
              key={tabName}
              href={`/dashboard/${tabName}`}
              active={tabName === currTabName}
              onClick={() => setCurrTabName(tabName)}
            >
              {tabName}
            </TabNavigationLink>
          )
        })}
      </TabNavigation>
    </div>
  )
}
