"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/tabs"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"

const tabNames = ["streak", "weekly", "monthly", "yearly", "lifetime"]

export default function DashboardTabs() {
  const initialTab = useSelectedLayoutSegment()

  return (
    <Tabs defaultValue={initialTab ?? undefined} className="mt-6 sm:mt-4">
      <TabsList variant="solid">
        {tabNames.map((tabName) => {
          return (
            <TabsTrigger key={tabName} value={tabName}>
              <Link className="capitalize" href={`/dashboard/${tabName}`}>
                {tabName}
              </Link>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
