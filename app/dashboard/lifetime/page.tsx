"use client"

import { useQuery } from "@tanstack/react-query"
import { Stat } from "@/components/ui/stat"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { BarChart, Legend } from "@/components/charts/bar-chart"
import { Text } from "@/components/ui/text"
import { useContext } from "react"
import { DonutChart } from "@/components/charts/donut-chart"
import { DateSubheading } from "@/components/common/date-subheading"
import { DemoCallout } from "@/components/common/demo-callout"
import { DemoModeContext, DevModeContext } from "@/components/common/providers"
import { ZeroSessions } from "@/components/common/zero-sessions"
import { LineChart } from "@/components/charts/line-chart"

export default function LifetimeTab() {
  const demoMode = useContext(DemoModeContext)
  return (
    <>
      {demoMode && <DemoCallout />}
      <Lifetime demoMode={demoMode} />
    </>
  )
}

function Lifetime({ demoMode }: { demoMode: boolean }) {
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
      <Card title="Total sessions" className="sm:col-span-2">
        <Stat value={data.sessions_total} />
      </Card>

      <Card title="Total hours" className="sm:col-span-2">
        <Stat value={data.hours_total} />
      </Card>

      <Card title="Total partners" className="sm:col-span-2">
        <Stat
          value={data.partners_total}
          changeText={`${data.partners_repeat.toLocaleString()} repeat`}
        />
      </Card>

      <Card title="Cumulative sessions over time" className="sm:col-span-6">
        <LineChart
          data={data.sessions_cumulative}
          index="start_date"
          categories={["Cumulative sessions"]}
          showLegend={false}
          valueFormatter={(value) => value.toLocaleString()}
          startEndOnly
        />
      </Card>
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
