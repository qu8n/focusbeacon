/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"
import { useContext, useRef } from "react"
import { DemoModeContext } from "@/components/common/providers"
import { useWeekStart } from "@/contexts/week-start-context"
import { WeekStartToggle } from "@/components/common/week-start-toggle"
import { ZeroSessions } from "@/components/common/zero-sessions"
import { RecordDailyStreak } from "@/app/dashboard/streak/components/record-daily-streak"
import { DailyStreak } from "@/app/dashboard/streak/components/daily-streak"
import {
  MonthlyStreak,
  WeeklyStreak,
} from "@/app/dashboard/streak/components/w-m-streak"
import { SessionsHeatmap } from "@/app/dashboard/streak/components/sessions-heatmap"
import { TimeHeatmap } from "@/app/dashboard/streak/components/time-heatmap"
import { RecentSessions } from "@/app/dashboard/streak/components/recent-sessions"
import { fetchDashboardData } from "@/lib/dashboard-data"
import { takeScreenshot } from "@/lib/screenshot"
import { DashboardSubheading } from "@/components/common/date-subheading"
import {
  SessionsByHour,
  TotalHours,
  TotalPartners,
  TotalSessions,
} from "@/components/common/dashboard-cards"

export default function Streak() {
  const ref = useRef<HTMLDivElement>(null)
  const refDaily = useRef<HTMLDivElement>(null)
  const demoMode = useContext(DemoModeContext)
  const { weekStart } = useWeekStart()

  const { data, refetch } = useQuery({
    queryKey: ["streak", demoMode, weekStart],
    queryFn: () =>
      fetchDashboardData(
        demoMode,
        `/api/py/streak?week_start=${weekStart}`,
        (demo) => demo.getDemoStreak(weekStart)
      ),
  })

  if (data?.zero_sessions) {
    return <ZeroSessions />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="dashboard-layout" ref={ref}>
        <DashboardSubheading
          title="Streak stats"
          dateRange={null}
          takeScreenshot={() => takeScreenshot(ref)}
          popoverContent="Capture an image of your streak stats"
          extraControls={<WeekStartToggle />}
        />
        <DailyStreak data={data} refetch={refetch} />
        <RecordDailyStreak data={data} />
        <WeeklyStreak data={data} />
        <MonthlyStreak data={data} />
        <SessionsHeatmap data={data} />
        <TimeHeatmap data={data} />
      </div>

      <div />

      <div className="dashboard-layout" ref={refDaily}>
        <DashboardSubheading
          title="Daily stats"
          dateRange={data?.daily?.subheading}
          takeScreenshot={() => takeScreenshot(refDaily)}
          popoverContent="Capture an image of your daily stats"
        />
        <TotalSessions data={data} periodKey="daily" />
        <TotalHours data={data} periodKey="daily" />
        <TotalPartners data={data} periodKey="daily" />
        <SessionsByHour chartData={data?.charts?.hour} />
      </div>

      <div />

      <div className="dashboard-layout">
        <DashboardSubheading title="Recent sessions" dateRange={null} />
        <RecentSessions data={data} demoMode={demoMode} />
      </div>
    </div>
  )
}
