/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"
import { useContext, useRef } from "react"
import { DemoModeContext } from "@/components/common/providers"
import { ZeroSessions } from "@/components/common/zero-sessions"
import { RiCameraLine } from "@remixicon/react"
import {
  SessionsByDuration,
  SessionsByHour,
  SessionsByPunctuality,
  TotalHours,
  TotalPartners,
  TotalSessions,
} from "@/components/common/dashboard-cards"
import { takeScreenshot } from "@/lib/screenshot"
import { Button } from "@/components/ui/button"
import { InfoPopover } from "@/components/common/info-popover"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { CumulativeSessions } from "@/app/dashboard/lifetime/components/cumulative-sessions"
import {
  AverageSessionMinutes,
  DailyRecordHours,
  FirstSessionDate,
} from "@/app/dashboard/lifetime/components/individual-stats"

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
          <Button outline onClick={() => takeScreenshot(ref)} disabled={!data}>
            <RiCameraLine size={16} />
          </Button>

          <InfoPopover>Capture an image of your Lifetime stats</InfoPopover>
        </div>
      )}
    </>
  )
}
