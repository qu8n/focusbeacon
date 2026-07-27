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
import { fetchDashboardData } from "@/lib/dashboard-data"
import { takeScreenshot } from "@/lib/screenshot"

export default function Year() {
  const refCurrentYear = useRef<HTMLDivElement>(null)
  const refPreviousYear = useRef<HTMLDivElement>(null)
  const demoMode = useContext(DemoModeContext)

  const { data } = useQuery({
    queryKey: ["year", demoMode],
    queryFn: () =>
      fetchDashboardData(demoMode, `/api/py/year`, (demo) =>
        demo.getDemoYear()
      ),
  })

  if (data?.zero_sessions) {
    return <ZeroSessions />
  }

  return (
    <>
      <div className="dashboard-layout" ref={refCurrentYear}>
        <DashboardSubheading
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
        <DashboardSubheading
          title="Previous year"
          dateRange={data?.prev_period?.subheading}
          takeScreenshot={() => takeScreenshot(refPreviousYear)}
          popoverContent="Capture an image of your previous year's stats"
        />

        <TotalSessions data={data} periodKey="prev_period" />

        <TotalHours data={data} periodKey="prev_period" />

        <TotalPartners data={data} periodKey="prev_period" />

        <SessionsByPeriod
          periodType="month"
          chartData={data?.charts?.prev_period}
        />

        <SessionsByPunctuality data={data} />

        <SessionsByDuration data={data} />

        <SessionsByHour chartData={data?.charts?.hour} />
      </div>
    </>
  )
}
