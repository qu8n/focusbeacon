"use client"

import { useQuery } from "@tanstack/react-query"
import { useContext } from "react"
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

export default function Month() {
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
      <DateSubheading
        title="Current month"
        dateRange={data?.curr_period?.subheading}
        className="sm:col-span-6"
      />

      <TotalSessions data={data} />

      <TotalHours data={data} />

      <TotalPartners data={data} />

      <SessionsByPeriod
        periodType="day of the month"
        chartData={data?.charts?.curr_period}
      />

      <DateSubheading
        title="Previous months"
        dateRange={data?.prev_period?.subheading}
        className="sm:col-span-6 mt-4"
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
    </>
  )
}
