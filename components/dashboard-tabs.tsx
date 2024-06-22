"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { TabNavigation, TabNavigationLink } from "./tabs"
import { useState } from "react"

const tabNames = ["streak", "weekly", "monthly", "yearly", "lifetime"]

export default function DashboardTabs() {
  const [currTab, setCurrTab] = useState(useSelectedLayoutSegment())

  return (
    <TabNavigation className="mt-6 sm:mt-2">
      {tabNames.map((tabName) => {
        return (
          <TabNavigationLink
            key={tabName}
            href={`/dashboard/${tabName}`}
            active={tabName === currTab}
            onClick={() => setCurrTab(tabName)}
          >
            {tabName}
          </TabNavigationLink>
        )
      })}
    </TabNavigation>
  )
}
