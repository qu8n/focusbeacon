"use client"

import { useQuery } from "@tanstack/react-query"
import { Stat } from "@/components/ui/stat"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { BarChart, Legend } from "@/components/charts/bar-chart"
import { Text } from "@/components/ui/text"
import { useContext } from "react"
import { DonutChart } from "@/components/charts/donut-chart"
import { DemoCallout } from "@/components/common/demo-callout"
import { DemoModeContext, DevModeContext } from "@/components/common/providers"
import { ZeroSessions } from "@/components/common/zero-sessions"
import { AreaChart } from "@/components/charts/area-chart"

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
        <AreaChart
          data={data.sessions_cumulative}
          index="start_date"
          categories={["25m", "50m", "75m"]}
          colors={["custom-1", "custom-2", "custom-3"]}
          valueFormatter={(value) => value.toLocaleString()}
          startEndOnly
          type="stacked"
        />
      </Card>

      <Card title="First session" className="sm:col-span-2">
        <Stat value={data.first_session_date} />
      </Card>

      <Card title="Average session (minutes)" className="sm:col-span-2">
        <Stat value={data.average_duration} />
      </Card>

      <Card title="Daily record (hours)" className="sm:col-span-2">
        <Stat
          value={data.daily_record.duration}
          changeText={data.daily_record.date}
        />
      </Card>

      <Card title="Sessions by punctuality" className="sm:col-span-3">
        <Legend
          categories={["Early", "Late"]}
          colors={["custom-4", "custom-5"]}
        />

        <div className="grid grid-cols-2 items-center mt-3">
          <DonutChart
            data={data.punctuality.data}
            variant="pie"
            category="punctuality"
            value="amount"
            colors={["custom-4", "custom-5"]}
            valueFormatter={(value) =>
              `${value} (${Math.round((value / data.sessions_total) * 100)}%)`
            }
            className="ml-4"
          />

          <div className="flex flex-col">
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>{data.punctuality.data[0].punctuality}</span>
              <span>
                {data.punctuality.data[0].amount} (
                {Math.round(
                  (data.punctuality.data[0].amount / data.sessions_total) * 100
                )}
                %)
              </span>
            </Text>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>Average</span>
              <span>{data.punctuality.avg}</span>
            </Text>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>Median</span>
              <span>{data.punctuality.median}</span>
            </Text>
          </div>
        </div>
      </Card>

      <Card title="Sessions by duration" className="sm:col-span-3">
        <Legend
          categories={["25m", "50m", "75m"]}
          colors={["custom-1", "custom-2", "custom-3"]}
        />

        <div className="grid grid-cols-2 items-center mt-3">
          <DonutChart
            data={data.duration}
            variant="pie"
            category="duration"
            value="amount"
            colors={["custom-1", "custom-2", "custom-3"]}
            valueFormatter={(value) =>
              `${value} (${Math.round((value / data.sessions_total) * 100)}%)`
            }
            className="ml-4"
          />

          <div className="flex flex-col">
            {data.duration.map((item: { duration: string; amount: number }) => {
              return (
                <Text
                  key={item.duration}
                  className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0"
                >
                  <span>{item.duration}</span>
                  <span>
                    {item.amount} (
                    {Math.round((item.amount / data.sessions_total) * 100)}
                    %)
                  </span>
                </Text>
              )
            })}
          </div>
        </div>
      </Card>

      <Card title="Sessions by hour of the day" className="sm:col-span-6">
        <BarChart
          index="start_time_hour"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          data={data.time}
          colors={["custom-1", "custom-2", "custom-3"]}
          allowDecimals={false}
          showYAxis={false}
          tickGap={28}
          legendPosition="left"
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
