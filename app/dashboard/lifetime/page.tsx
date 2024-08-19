/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"
import { Stat } from "@/components/ui/stat"
import { Card } from "@/components/ui/card"
import { useContext, useRef } from "react"
import { DemoModeContext } from "@/components/common/providers"
import { ZeroSessions } from "@/components/common/zero-sessions"
import { AreaChart } from "@/components/charts/area-chart"
import {
  RiCameraLine,
  RiFlag2Line,
  RiTimer2Line,
  RiTimerFlashLine,
} from "@remixicon/react"
import {
  FullWidthCardSkeleton,
  SessionsByDuration,
  SessionsByHour,
  SessionsByPunctuality,
  ThirdWidthCardSkeleton,
  TotalHours,
  TotalPartners,
  TotalSessions,
} from "@/components/common/dashboard-cards"
import { takeScreenshot } from "@/lib/screenshot"
import { Button } from "@/components/ui/button"
import { InfoPopover } from "@/components/common/info-popover"
import { useBreakpoint } from "@/hooks/use-breakpoint"

export default function Lifetime() {
  const ref = useRef<HTMLDivElement>(null)
  const { isAboveSm } = useBreakpoint("sm")
  const demoMode = useContext(DemoModeContext)

  const { data } = useQuery({
    queryKey: ["lifetime", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/lifetime?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch lifetime data")
      return await response.json()
    },
  })

  if (data?.zero_sessions) {
    return <ZeroSessions />
  }

  return (
    <>
      <div className="dashboard-layout" ref={ref}>
        <TotalSessions data={data} />

        <TotalHours data={data} />

        <TotalPartners data={data} />

        <CumulativeSessions data={data} />

        <FirstSessionDate data={data} />

        <AverageSessionMinutes data={data} />

        <DailyRecordHours data={data} />

        <SessionsByPunctuality
          data={data}
          totalSessions={data?.curr_period?.sessions_total}
        />

        <SessionsByDuration
          data={data}
          totalSessions={data?.curr_period?.sessions_total}
        />

        <SessionsByHour data={data} />
      </div>

      {isAboveSm && (
        <div className="flex flex-row gap-1 items-center sm:col-span-6">
          <Button outline onClick={() => takeScreenshot(ref)}>
            <RiCameraLine size={16} />
          </Button>

          <InfoPopover>Capture an image of your Lifetime stats</InfoPopover>
        </div>
      )}
    </>
  )
}

function CumulativeSessions({ data }: { data: any }) {
  return (
    <Card title="Cumulative sessions over time" className="sm:col-span-6">
      {data ? (
        <AreaChart
          data={data?.charts.sessions_cumulative}
          index="start_date"
          categories={["25m", "50m", "75m"]}
          colors={["custom-1", "custom-2", "custom-3"]}
          valueFormatter={(value) => value.toLocaleString()}
          startEndOnly
          type="stacked"
        />
      ) : (
        <FullWidthCardSkeleton />
      )}
    </Card>
  )
}

function FirstSessionDate({ data }: { data: any }) {
  return (
    <Card
      icon={<RiFlag2Line size={16} className="opacity-40" />}
      title="First session"
      className="sm:col-span-2"
    >
      {data ? (
        <Stat value={data?.curr_period?.first_session_date} />
      ) : (
        <ThirdWidthCardSkeleton />
      )}
    </Card>
  )
}

function AverageSessionMinutes({ data }: { data: any }) {
  return (
    <Card
      icon={<RiTimer2Line size={16} className="opacity-40" />}
      title="Average session (minutes)"
      className="sm:col-span-2"
    >
      {data ? (
        <Stat value={data?.curr_period?.average_duration} />
      ) : (
        <ThirdWidthCardSkeleton />
      )}
    </Card>
  )
}

function DailyRecordHours({ data }: { data: any }) {
  return (
    <Card
      icon={<RiTimerFlashLine size={16} className="opacity-40" />}
      title="Daily record (hours)"
      className="sm:col-span-2"
    >
      {data ? (
        <Stat
          value={data?.curr_period?.daily_record.duration}
          changeText={data?.curr_period?.daily_record.date}
        />
      ) : (
        <ThirdWidthCardSkeleton />
      )}
    </Card>
  )
}
