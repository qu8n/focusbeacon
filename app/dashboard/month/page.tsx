"use client"

import { useQuery } from "@tanstack/react-query"
import { useContext, useRef } from "react"
import { DashboardSubheading } from "@/components/common/date-subheading"
import { DemoModeContext } from "@/components/common/providers"
import { ZeroSessions } from "@/components/common/zero-sessions"
import {
  SessionsByDuration,
  SessionsByHour,
  SessionsByPeriod,
  SessionsByPunctuality,
  TotalHours,
  TotalPartners,
  TotalSessions,
} from "@/components/common/dashboard-cards"
import { takeScreenshot } from "@/lib/screenshot"

export default function Month() {
  const refCurrentMonth = useRef<HTMLDivElement>(null)
  const refPreviousMonths = useRef<HTMLDivElement>(null)
  const demoMode = useContext(DemoModeContext)

  const { data } = useQuery({
    queryKey: ["month", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/month?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch monthly data")
      return await response.json()
    },
  })

  if (data?.zero_sessions) {
    return <ZeroSessions />
  }

  return (
    <>
      <div className="dashboard-layout" ref={refCurrentMonth}>
        <DashboardSubheading
          title="Current month"
          dateRange={data?.curr_period?.subheading}
          takeScreenshot={() => takeScreenshot(refCurrentMonth)}
          popoverContent="Capture an image of your current month's stats"
        />

        <TotalSessions data={data} />

        <TotalHours data={data} />

        <TotalPartners data={data} />

        <SessionsByPeriod
          periodType="day of the month"
          chartData={data?.charts?.curr_period}
        />
      </div>

      <div />

      <div className="dashboard-layout" ref={refPreviousMonths}>
        <DashboardSubheading
          title="Previous months"
          dateRange={data?.prev_period?.subheading}
          takeScreenshot={() => takeScreenshot(refPreviousMonths)}
          popoverContent="Capture an image of your previous months' stats"
        />

        <SessionsByPeriod
          periodType="month"
          chartData={data?.charts?.prev_period}
        />

        <SessionsByPunctuality
          data={data}
          totalSessions={data?.prev_period?.sessions_total}
        />

        <SessionsByDuration
          data={data}
          totalSessions={data?.prev_period?.sessions_total}
        />

        <SessionsByHour data={data} />
      </div>
    </>
  )
}
