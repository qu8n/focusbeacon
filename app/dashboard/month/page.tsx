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

export default function MonthTab() {
  const demoMode = useContext(DemoModeContext)
  return (
    <>
      {demoMode && <DemoCallout />}
      <Month demoMode={demoMode} />
    </>
  )
}

function Month({ demoMode }: { demoMode: boolean }) {
  const devMode = useContext(DevModeContext)

  const { isLoading: dataIsLoading, data } = useQuery({
    queryKey: ["month", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/month?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch monthly data")
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
      <DateSubheading
        title="Current month"
        dateRange={`${data.curr_month.start_label}`}
        className="sm:col-span-6"
      />

      <Card title="Total sessions" className="sm:col-span-2">
        <Stat
          value={data.curr_month.sessions_total}
          changeVal={data.curr_month.sessions_delta}
          changeText="vs. previous month"
        />
      </Card>

      <Card title="Total hours" className="sm:col-span-2">
        <Stat
          value={data.curr_month.hours_total}
          changeVal={data.curr_month.hours_delta}
          changeText="vs. previous month"
        />
      </Card>

      <Card title="Total partners" className="sm:col-span-2">
        <Stat
          value={data.curr_month.partners_total}
          changeText={`${data.curr_month.partners_repeat} repeat`}
        />
      </Card>

      <Card title="Sessions by day of the month" className="sm:col-span-6">
        <BarChart
          index="start_date_str"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          data={data.curr_month.chart_data}
          colors={["custom-1", "custom-2", "custom-3"]}
          allowDecimals={false}
          showYAxis={false}
          legendPosition="left"
        />
      </Card>

      <DateSubheading
        title="Previous months"
        dateRange={`${data.prev_months.start_label} - ${data.prev_months.end_label}`}
        className="sm:col-span-6 mt-4"
      />

      <Card title="Sessions by month" className="sm:col-span-6">
        <BarChart
          index="start_period_str"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          data={data.prev_months.month}
          colors={["custom-1", "custom-2", "custom-3"]}
          allowDecimals={false}
          showYAxis={false}
          legendPosition="left"
        />
      </Card>

      <Card title="Sessions by punctuality" className="sm:col-span-3">
        <Legend
          categories={["Early", "Late"]}
          colors={["custom-4", "custom-5"]}
        />

        <div className="grid grid-cols-2 items-center mt-3">
          <DonutChart
            data={data.prev_months.punctuality.data}
            variant="pie"
            category="punctuality"
            value="amount"
            colors={["custom-4", "custom-5"]}
            valueFormatter={(value) =>
              `${value} (${Math.round((value / data.prev_months.sessions_total) * 100)}%)`
            }
            className="ml-4"
          />

          <div className="flex flex-col">
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>{data.prev_months.punctuality.data[0].punctuality}</span>
              <span>
                {data.prev_months.punctuality.data[0].amount} (
                {Math.round(
                  (data.prev_months.punctuality.data[0].amount /
                    data.prev_months.sessions_total) *
                    100
                )}
                %)
              </span>
            </Text>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>Average</span>
              <span>{data.prev_months.punctuality.avg}</span>
            </Text>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>Median</span>
              <span>{data.prev_months.punctuality.median}</span>
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
            data={data.prev_months.duration}
            variant="pie"
            category="duration"
            value="amount"
            colors={["custom-1", "custom-2", "custom-3"]}
            valueFormatter={(value) =>
              `${value} (${Math.round((value / data.prev_months.sessions_total) * 100)}%)`
            }
            className="ml-4"
          />

          <div className="flex flex-col">
            {data.prev_months.duration.map(
              (item: { duration: string; amount: number }) => {
                return (
                  <Text
                    key={item.duration}
                    className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0"
                  >
                    <span>{item.duration}</span>
                    <span>
                      {item.amount} (
                      {Math.round(
                        (item.amount / data.prev_months.sessions_total) * 100
                      )}
                      %)
                    </span>
                  </Text>
                )
              }
            )}
          </div>
        </div>
      </Card>

      <Card title="Sessions by hour of the day" className="sm:col-span-6">
        <BarChart
          index="start_time_hour"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          data={data.prev_months.time}
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
      <DateSubheading
        title="Current month"
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
        title="Previous month"
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
