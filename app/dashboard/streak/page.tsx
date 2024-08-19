/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"
import { useContext, useEffect } from "react"
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

export default function Streak() {
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
    <>
      <DailyStreak data={data} />
      <RecordDailyStreak data={data} />
      <WeeklyStreak data={data} />
      <MonthlyStreak data={data} />
      <SessionsHeatmap data={data} />
      <RecentSessions data={data} demoMode={demoMode} />
    </>
  )
}
