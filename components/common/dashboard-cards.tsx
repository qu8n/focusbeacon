/* eslint-disable @typescript-eslint/no-explicit-any */

import { RiTimeLine, RiUser3Line, RiVideoOnLine } from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { Stat } from "@/components/ui/stat"
import { BarChart, Legend } from "@/components/charts/bar-chart"
import { DonutChart } from "@/components/charts/donut-chart"
import { Text } from "@/components/ui/text"
import { Skeleton } from "@/components/ui/skeleton"
import { AvailableChartColorsKeys } from "@/lib/chart-utils"
import { ReactNode } from "react"

export function ThirdWidthCardSkeleton() {
  return <Skeleton className="h-[32px] w-full" />
}

function PieCardSkeleton() {
  return <Skeleton className="h-[165px] w-full" />
}

export function FullWidthCardSkeleton() {
  return <Skeleton className="h-[320px] w-full" />
}

export function TotalSessions({
  data,
  prevPeriod = false,
}: {
  data: any
  prevPeriod?: boolean
}) {
  let period_type = "curr_period"
  if (prevPeriod) period_type = "prev_period"
  const hasDelta = data?.[period_type]?.sessions_delta
  return (
    <Card
      icon={<RiVideoOnLine size={16} className="opacity-40" />}
      title="Total sessions"
      className="sm:col-span-2"
    >
      {data ? (
        <Stat
          value={data[period_type].sessions_total}
          changeVal={hasDelta ? hasDelta : undefined}
          changeText={
            hasDelta
              ? `vs. previous ${data[period_type].period_type}`
              : undefined
          }
        />
      ) : (
        <ThirdWidthCardSkeleton />
      )}
    </Card>
  )
}

export function TotalHours({
  data,
  prevPeriod = false,
}: {
  data: any
  prevPeriod?: boolean
}) {
  let period_type = "curr_period"
  if (prevPeriod) period_type = "prev_period"
  const hasDelta = data?.[period_type]?.hours_delta
  return (
    <Card
      icon={<RiTimeLine size={16} className="opacity-40" />}
      title="Total hours"
      className="sm:col-span-2"
    >
      {data ? (
        <Stat
          value={data[period_type].hours_total}
          changeVal={hasDelta ? hasDelta : undefined}
          changeText={
            hasDelta
              ? `vs. previous ${data[period_type].period_type}`
              : undefined
          }
        />
      ) : (
        <ThirdWidthCardSkeleton />
      )}
    </Card>
  )
}

export function TotalPartners({
  data,
  prevPeriod = false,
}: {
  data: any
  prevPeriod?: boolean
}) {
  let period_type = "curr_period"
  if (prevPeriod) period_type = "prev_period"
  return (
    <Card
      icon={<RiUser3Line size={16} className="opacity-40" />}
      title="Total partners"
      className="sm:col-span-2"
    >
      {data ? (
        <Stat
          value={data[period_type].partners_total}
          changeText={`${data[period_type].partners_repeat.toLocaleString()} repeat`}
        />
      ) : (
        <ThirdWidthCardSkeleton />
      )}
    </Card>
  )
}

export function SessionsByPeriod({
  periodType,
  chartData,
}: {
  periodType: string
  chartData: any
}) {
  return (
    <Card title={`Sessions by ${periodType}`} className="sm:col-span-6">
      {chartData ? (
        <BarChart
          data={chartData}
          index="start_period_str"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          colors={["custom-1", "custom-2", "custom-3"]}
          valueFormatter={(value) => value.toLocaleString()}
          allowDecimals={false}
          showYAxis={false}
          legendPosition="left"
        />
      ) : (
        <FullWidthCardSkeleton />
      )}
    </Card>
  )
}

// A pie's percentages have to be relative to the pie itself. Taking the
// denominator from anywhere else lets it drift from the slices: the lifetime
// tab used to divide by the profile's total session count while the slices
// counted only completed sessions, so its percentages summed to ~95%.
function sumSliceAmounts(chartData: { amount: number }[] | undefined) {
  return chartData?.reduce((total, slice) => total + slice.amount, 0) ?? 0
}

// An empty pie makes the denominator 0, which would render "0 (NaN%)".
function toPercentage(amount: number, total: number) {
  return total > 0 ? Math.round((amount / total) * 100) : 0
}

export function SessionsByPunctuality({ data }: { data: any }) {
  const punctuality = data?.charts?.punctuality
  const chartData = punctuality?.data
  const totalSessions = sumSliceAmounts(chartData)
  return (
    <PieChartCard
      chartData={chartData}
      title="Sessions by punctuality"
      popoverContent="'On time' are sessions where you joined within 1 minute after the scheduled start time"
      categories={["On time", "Late"]}
      colors={["custom-4", "custom-5"]}
      category="punctuality"
      tableContent={
        punctuality && (
          <>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>{chartData[0].punctuality}</span>
              <span>
                {chartData[0].amount.toLocaleString()} (
                {toPercentage(chartData[0].amount, totalSessions)}
                %)
              </span>
            </Text>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>Average</span>
              <span>{punctuality.avg}</span>
            </Text>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>Median</span>
              <span>{punctuality.median}</span>
            </Text>
          </>
        )
      }
    />
  )
}

export function SessionsByDuration({ data }: { data: any }) {
  const chartData = data?.charts?.duration
  const totalSessions = sumSliceAmounts(chartData)
  return (
    <PieChartCard
      chartData={chartData}
      title="Sessions by duration"
      categories={["25m", "50m", "75m"]}
      colors={["custom-1", "custom-2", "custom-3"]}
      category="duration"
      tableContent={
        <>
          {chartData &&
            chartData.map((item: { duration: string; amount: number }) => {
              return (
                <Text
                  key={item.duration}
                  className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0"
                >
                  <span>{item.duration}</span>
                  <span>
                    {item.amount.toLocaleString()} (
                    {toPercentage(item.amount, totalSessions)}
                    %)
                  </span>
                </Text>
              )
            })}
        </>
      }
    />
  )
}

function PieChartCard({
  chartData,
  title,
  popoverContent,
  categories,
  colors,
  category,
  tableContent,
}: {
  chartData: any
  title: string
  popoverContent?: string
  categories: string[]
  colors: AvailableChartColorsKeys[]
  category: string
  tableContent?: ReactNode
}) {
  const totalSessions = sumSliceAmounts(chartData)
  return (
    <Card
      title={title}
      className="sm:col-span-3"
      popoverContent={popoverContent}
    >
      {chartData ? (
        <>
          <Legend categories={categories} colors={colors} />

          <div className="grid md:grid-cols-2 grid-cols-1 items-center mt-3">
            <DonutChart
              data={chartData}
              variant="pie"
              category={category}
              value="amount"
              colors={colors}
              valueFormatter={(value) =>
                `${value} (${toPercentage(value, totalSessions)}%)`
              }
              className="mx-auto md:ml-3"
            />

            <div className="flex flex-col">{tableContent}</div>
          </div>
        </>
      ) : (
        <PieCardSkeleton />
      )}
    </Card>
  )
}

export function SessionsByHour({ data }: { data: any }) {
  return (
    <Card
      title="Sessions by hour of the day"
      className="sm:col-span-6"
      popoverContent="Sessions are counted in the hour they start. For example, sessions start at 7:15am are counted in the 7am bar"
    >
      {data ? (
        <BarChart
          index="start_time_hour"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          data={data.charts.hour}
          colors={["custom-1", "custom-2", "custom-3"]}
          allowDecimals={false}
          showYAxis={false}
          tickGap={28}
          legendPosition="left"
        />
      ) : (
        <FullWidthCardSkeleton />
      )}
    </Card>
  )
}
