"use client"

import { useQuery } from "@tanstack/react-query"
import { useContext, useRef } from "react"
import { DateSubheading } from "@/components/common/date-subheading"
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

export default function Year() {
  const refCurrentYear = useRef<HTMLDivElement>(null)
  const refPreviousYear = useRef<HTMLDivElement>(null)
  const demoMode = useContext(DemoModeContext)

  const { data } = useQuery({
    queryKey: ["year", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/year?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch yearly data")
      return await response.json()
    },
  })

  if (data?.zero_sessions) {
    return <ZeroSessions />
  }

  return (
    <>
      <div className="dashboard-layout" ref={refCurrentYear}>
        <DateSubheading
          title="Current year"
          dateRange={data?.curr_period?.subheading}
          takeScreenshot={() => takeScreenshot(refCurrentYear)}
          popoverContent="Capture an image of your current year's stats"
        />

        <TotalSessions data={data} />

        <TotalHours data={data} />

        <TotalPartners data={data} />

        <SessionsByPeriod
          periodType="month"
          chartData={data?.charts?.curr_period}
        />
      </div>

      <div />

      <div className="dashboard-layout" ref={refPreviousYear}>
        <DateSubheading
          title="Previous year"
          dateRange={data?.prev_period?.subheading}
          takeScreenshot={() => takeScreenshot(refPreviousYear)}
          popoverContent="Capture an image of your previous year's stats"
        />

        <TotalSessions data={data} prevPeriod />

        <TotalHours data={data} prevPeriod />

        <TotalPartners data={data} prevPeriod />

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
