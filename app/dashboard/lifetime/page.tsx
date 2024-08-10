"use client"

import { useQuery } from "@tanstack/react-query"
import { Stat } from "@/components/ui/stat"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { useContext } from "react"
import { DemoModeContext, DevModeContext } from "@/components/common/providers"
import { ZeroSessions } from "@/components/common/zero-sessions"
import { AreaChart } from "@/components/charts/area-chart"
import { RiFlag2Line, RiTimer2Line, RiTimerFlashLine } from "@remixicon/react"
import {
  SessionsByDuration,
  SessionsByHour,
  SessionsByPunctuality,
  TotalHours,
  TotalPartners,
  TotalSessions,
} from "@/components/common/dashboard-cards"

export default function Lifetime() {
  const demoMode = useContext(DemoModeContext)
  const devMode = useContext(DevModeContext)

  const { isLoading: dataIsLoading, data } = useQuery({
    queryKey: ["lifetime", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/lifetime?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch lifetime data")
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
      <TotalSessions data={data} />

      <TotalHours data={data} />

      <TotalPartners data={data} />

      <Card title="Cumulative sessions over time" className="sm:col-span-6">
        <AreaChart
          data={data.charts.sessions_cumulative}
          index="start_date"
          categories={["25m", "50m", "75m"]}
          colors={["custom-1", "custom-2", "custom-3"]}
          valueFormatter={(value) => value.toLocaleString()}
          startEndOnly
          type="stacked"
        />
      </Card>

      <Card
        icon={<RiFlag2Line size={16} className="opacity-40" />}
        title="First session"
        className="sm:col-span-2"
      >
        <Stat value={data.curr_period.first_session_date} />
      </Card>

      <Card
        icon={<RiTimer2Line size={16} className="opacity-40" />}
        title="Average session (minutes)"
        className="sm:col-span-2"
      >
        <Stat value={data.curr_period.average_duration} />
      </Card>

      <Card
        icon={<RiTimerFlashLine size={16} className="opacity-40" />}
        title="Daily record (hours)"
        className="sm:col-span-2"
      >
        <Stat
          value={data.curr_period.daily_record.duration}
          changeText={data.curr_period.daily_record.date}
        />
      </Card>

      <SessionsByPunctuality
        data={data}
        totalSessions={data.curr_period.sessions_total}
      />

      <SessionsByDuration
        data={data}
        totalSessions={data.curr_period.sessions_total}
      />

      <SessionsByHour data={data} />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
      <Card title="Total sessions" className="sm:col-span-2">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
        </div>
      </Card>

      <Card title="Total hours" className="sm:col-span-2">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
        </div>
      </Card>

      <Card title="Total partners" className="sm:col-span-2">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
          <Skeleton className="h-[32px] w-[50px]" />
        </div>
      </Card>
    </div>
  )
}
