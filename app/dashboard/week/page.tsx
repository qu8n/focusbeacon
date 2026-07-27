/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"
import { useContext, useRef } from "react"
import { DashboardSubheading } from "@/components/common/date-subheading"
import { DemoModeContext } from "@/components/common/providers"
import { useWeekStart } from "@/contexts/week-start-context"
import { WeekStartToggle } from "@/components/common/week-start-toggle"
import { WeeklyGoal } from "@/components/common/weekly-goal"
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

export default function Week() {
  const refCurrentWeek = useRef<HTMLDivElement>(null)
  const refPreviousWeeks = useRef<HTMLDivElement>(null)
  const demoMode = useContext(DemoModeContext)
  const { weekStart } = useWeekStart()

  const { data, isLoading } = useQuery({
    queryKey: ["weekly", demoMode, weekStart],
    queryFn: () =>
      fetchDashboardData(
        demoMode,
        `/api/py/week?week_start=${weekStart}`,
        (demo) => demo.getDemoWeek(weekStart)
      ),
  })

  if (data?.zero_sessions) {
    return <ZeroSessions />
  }

  return (
    <>
      <div className="dashboard-layout" ref={refCurrentWeek}>
        <DashboardSubheading
          title="Current week"
          dateRange={data?.curr_period?.subheading}
          takeScreenshot={() => takeScreenshot(refCurrentWeek)}
          popoverContent="Capture an image of your current week's stats"
          extraControls={<WeekStartToggle />}
        />

        <WeeklyGoal data={data} disabled={isLoading} />

        <TotalSessions data={data} />

        <TotalHours data={data} />

        <TotalPartners data={data} />

        <SessionsByPeriod
          periodType="day of the week"
          chartData={data?.charts?.curr_period}
        />
      </div>

      <div />

      <div className="dashboard-layout" ref={refPreviousWeeks}>
        <DashboardSubheading
          title="Previous weeks"
          dateRange={data?.prev_period?.subheading}
          takeScreenshot={() => takeScreenshot(refPreviousWeeks)}
          popoverContent="Capture an image of your previous weeks' stats"
        />

        <SessionsByPeriod
          periodType="week"
          chartData={data?.charts?.prev_period}
        />

        <SessionsByPunctuality data={data} />

        <SessionsByDuration data={data} />

        <SessionsByHour chartData={data?.charts?.hour} />
      </div>
    </>
  )
}
