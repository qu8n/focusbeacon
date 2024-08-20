/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"
import { useContext, useEffect, useRef } from "react"
import { DemoModeContext } from "@/components/common/providers"
import { ZeroSessions } from "@/components/common/zero-sessions"
import { useToast } from "@/hooks/use-toast"
import { RecordDailyStreak } from "@/app/dashboard/streak/components/record-daily-streak"
import { DailyStreak } from "@/app/dashboard/streak/components/daily-streak"
import {
  MonthlyStreak,
  WeeklyStreak,
} from "@/app/dashboard/streak/components/w-m-streak"
import { SessionsHeatmap } from "@/app/dashboard/streak/components/sessions-heatmap"
import { RecentSessions } from "@/app/dashboard/streak/components/recent-sessions"
import { takeScreenshot } from "@/lib/screenshot"
import { DashboardSubheading } from "@/components/common/date-subheading"

export default function Streak() {
  const ref = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const demoMode = useContext(DemoModeContext)

  const { data } = useQuery({
    queryKey: ["streak", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/streak?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch streak data")
      const data = await response.json()
      return data
    },
  })

  useEffect(() => {
    // Wrap inside useEffect to avoid warning "Cannot update a component (Toaster)
    // while rendering a different component (Streak)", which occurs when updating
    // the state of a component during the rendering phase of another component
    if (data?.daily_streak_increased) {
      toast({
        description: "Amazing! You increased your daily streak 🎉",
        className: "bg-orange-50 border border-orange-600 text-orange-600",
      })
    }
  }, [data, toast])

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
        />
        <DailyStreak data={data} />
        <RecordDailyStreak data={data} />
        <WeeklyStreak data={data} />
        <MonthlyStreak data={data} />
        <SessionsHeatmap data={data} />
      </div>

      <div />

      <div className="dashboard-layout">
        <DashboardSubheading title="Recent sessions" dateRange={null} />
        <RecentSessions data={data} demoMode={demoMode} />
      </div>
    </div>
  )
}
