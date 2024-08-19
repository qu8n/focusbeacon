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
import { DashboardSubheading } from "@/components/common/date-subheading"

export default function Lifetime() {
  const refTotalStats = useRef<HTMLDivElement>(null)
  const refOtherStats = useRef<HTMLDivElement>(null)
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

  console.log(data?.curr_period?.subheading)

  return (
    <>
      <div className="dashboard-layout" ref={refTotalStats}>
        <DashboardSubheading
          title="Total stats"
          dateRange={data?.curr_period?.subheading}
          takeScreenshot={() => takeScreenshot(refTotalStats)}
          popoverContent="Capture an image of your previous weeks' stats"
        />

        <TotalSessions data={data} />

        <TotalHours data={data} />

        <TotalPartners data={data} />

        <CumulativeSessions data={data} />
      </div>

      <div className="dashboard-layout" ref={refOtherStats}>
        <DashboardSubheading
          title="Additional stats"
          dateRange={data?.curr_period?.subheading}
          takeScreenshot={() => takeScreenshot(refOtherStats)}
          popoverContent="Capture an image of your previous weeks' stats"
        />

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
    </>
  )
}
