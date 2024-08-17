/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Heatmap } from "@/components/charts/heatmap"
import { Stat } from "@/components/ui/stat"
import { Footnote } from "@/components/ui/text"
import { useQuery } from "@tanstack/react-query"
import { getFormattedDate } from "@/lib/date"
import { Skeleton } from "@/components/ui/skeleton"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { columns, HistoryTable } from "@/components/charts/history-table"
import { LinkInternal } from "@/components/ui/link-internal"
import {
  RiArrowRightSLine,
  RiAwardLine,
  RiCalendar2Line,
  RiCalendarCheckLine,
  RiStackLine,
} from "@remixicon/react"
import { useContext, useMemo } from "react"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { DemoModeContext } from "@/components/common/providers"
import { ZeroSessions } from "@/components/common/zero-sessions"
import { ThirdWidthCardSkeleton } from "@/components/common/dashboard-cards"
import { useToast } from "@/hooks/use-toast"
import SlotCounter from "react-slot-counter"

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

  if (data?.daily_streak_increased) {
    toast({
      description: "Amazing work! You increased your daily streak 🎉",
      className: "bg-orange-50 border border-orange-600 text-orange-600",
    })
  }

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

function DailyStreak({ data }: { data: any }) {
  return (
    <Card
      icon={<RiStackLine size={16} className="opacity-40" />}
      title="Daily streak"
      className="sm:col-span-3"
    >
      {data ? (
        <Stat>
          <div className="flex flex-row items-center gap-1">
            <div className="font-semibold text-3xl/8 sm:text-2xl/8">
              {data.daily_streak_increased ? (
                <SlotCounter
                  value={data.daily_streak}
                  animateOnVisible={{
                    triggerOnce: true,
                    rootMargin: "0px 0px -100px 0px",
                  }}
                />
              ) : (
                <span>{data.daily_streak}</span>
              )}
            </div>
            {data.daily_streak > 1 && <FireIcon />}
          </div>
        </Stat>
      ) : (
        <ThirdWidthCardSkeleton />
      )}
    </Card>
  )
}

function FireIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="#f97316"
      viewBox="0 0 16 16"
    >
      <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15" />
    </svg>
  )
}

function RecordDailyStreak({ data }: { data: any }) {
  return (
    <Card
      icon={<RiAwardLine size={16} className="opacity-40" />}
      title="Record daily streak"
      className="sm:col-span-3"
    >
      {data ? (
        <Stat>
          <div className="flex flex-row items-center gap-4">
            <span className="font-semibold text-3xl/8 sm:text-2xl/8">
              {data.max_daily_streak.count}
            </span>

            <Footnote className="font-normal">
              {getFormattedDate(data.max_daily_streak.date_range[0]) +
                " - " +
                getFormattedDate(data.max_daily_streak.date_range[1])}
            </Footnote>
          </div>
        </Stat>
      ) : (
        <ThirdWidthCardSkeleton />
      )}
    </Card>
  )
}

function WeeklyStreak({ data }: { data: any }) {
  return (
    <Card
      icon={<RiCalendar2Line size={16} className="opacity-40" />}
      title="Weekly streak"
      className="sm:col-span-3"
    >
      {data ? <Stat value={data.weekly_streak} /> : <ThirdWidthCardSkeleton />}
    </Card>
  )
}

function MonthlyStreak({ data }: { data: any }) {
  return (
    <Card
      icon={<RiCalendarCheckLine size={16} className="opacity-40" />}
      title="Monthly streak"
      className="sm:col-span-3"
    >
      {data ? <Stat value={data.monthly_streak} /> : <ThirdWidthCardSkeleton />}
    </Card>
  )
}

function SessionsHeatmap({ data }: { data: any }) {
  return (
    <Card
      title="Sessions heatmap"
      subtitle={
        data &&
        `${data.heatmap_data.past_year_sessions.toLocaleString()} sessions in the last year`
      }
      className="sm:col-span-6"
    >
      {data ? (
        <Heatmap data={data.heatmap_data} />
      ) : (
        <>
          <Skeleton className="w-[180px] h-[18px]" />
          <Skeleton className="mt-6 w-full h-[138px]" />
        </>
      )}
    </Card>
  )
}

function RecentSessions({ demoMode, data }: { demoMode: boolean; data: any }) {
  const defaultData = useMemo(() => [], [])
  const table = useReactTable({
    data: data?.history_data ?? defaultData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card title="Recent sessions" className="sm:col-span-6">
      {data ? (
        <>
          <LinkInternal
            href={`/history${demoMode ? "?demo=true" : ""}`}
            className="inline-flex items-center"
          >
            <Text>View all</Text>
            <RiArrowRightSLine className="opacity-40" size={15} />
          </LinkInternal>
          <HistoryTable rows={table.getRowModel().rows} />
        </>
      ) : (
        <Skeleton className="mt-6 w-full h-[247px]" />
      )}
    </Card>
  )
}
