"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { TabNavigation, TabNavigationLink } from "./tabs"

const tabNames = ["streak", "weekly", "monthly", "yearly", "lifetime"]

export default function DashboardTabs() {
  const currTab = useSelectedLayoutSegment()

  return (
    <TabNavigation className="mt-6 sm:mt-2">
      {tabNames.map((tabName) => {
        return (
          <TabNavigationLink
            key={tabName}
            href={`/dashboard/${tabName}`}
            active={tabName === currTab}
          >
            {tabName}
          </TabNavigationLink>
        )
      })}
    </TabNavigation>
  )
}
