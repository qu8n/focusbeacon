"use client"

import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { useContext } from "react"
import { DateSubheading } from "@/components/common/date-subheading"
import { DemoModeContext, DevModeContext } from "@/components/common/providers"
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

export default function Year() {
  const demoMode = useContext(DemoModeContext)
  const devMode = useContext(DevModeContext)

  const { isLoading: dataIsLoading, data } = useQuery({
    queryKey: ["year", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/year?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch yearly data")
      return await response.json()
    },
  })

  if (dataIsLoading || !data || devMode) {
    return <LoadingSkeleton />
  }

  if (data.zero_sessions) {
    return <ZeroSessions />
  }

  return (
    <>
      <DateSubheading
        title="Current year"
        dateRange={`${data.curr_period.start_label}`}
        className="sm:col-span-6"
      />

      <TotalSessions data={data} />

      <TotalHours data={data} />

      <TotalPartners data={data} />

      <SessionsByPeriod
        periodType="month"
        chartData={data.charts.curr_period}
      />

      <DateSubheading
        title="Previous year"
        dateRange={`${data.prev_period.start_label}`}
        className="sm:col-span-6 mt-4"
      />

      <SessionsByPeriod
        periodType="month"
        chartData={data.charts.prev_period}
      />

      <SessionsByPunctuality
        data={data}
        totalSessions={data.prev_period.sessions_total}
      />

      <SessionsByDuration
        data={data}
        totalSessions={data.prev_period.sessions_total}
      />

      <SessionsByHour data={data} />
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
      <DateSubheading
        title="Current year"
        dateRange={<Skeleton className="w-[210px] h-[25px]" />}
        className="sm:col-span-6"
      />

      <Card title="Total sessions" className="sm:col-span-2">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
          <Skeleton className="h-[32px] w-[125px]" />
        </div>
      </Card>

      <Card title="Total hours" className="sm:col-span-2">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
          <Skeleton className="h-[32px] w-[125px]" />
        </div>
      </Card>

      <Card title="Total partners" className="sm:col-span-2">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
          <Skeleton className="h-[32px] w-[50px]" />
        </div>
      </Card>

      <Card title="Sessions by day of the month" className="sm:col-span-6">
        <Skeleton className="h-[320px] w-full" />
      </Card>

      <DateSubheading
        title="Previous year"
        dateRange={<Skeleton className="w-[210px] h-[25px]" />}
        className="sm:col-span-6 mt-4"
      />

      <Card title="Sessions by month" className="sm:col-span-6">
        <Skeleton className="h-[320px] w-full" />
      </Card>

      <Card title="Sessions by punctuality" className="sm:col-span-3">
        <Skeleton className="h-[165px] w-full" />
      </Card>

      <Card title="Sessions by duration" className="sm:col-span-3">
        <Skeleton className="h-[165px] w-full" />
      </Card>

      <Card title="Sessions by hour of the day" className="sm:col-span-6">
        <Skeleton className="h-[320px] w-full" />
      </Card>
    </div>
  )
}
