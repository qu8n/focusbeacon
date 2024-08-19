/* eslint-disable @typescript-eslint/no-explicit-any */

import { ThirdWidthCardSkeleton } from "@/components/common/dashboard-cards"
import { Card } from "@/components/ui/card"
import { Stat } from "@/components/ui/stat"
import { RiFlag2Line, RiTimer2Line, RiTimerFlashLine } from "@remixicon/react"

export function FirstSessionDate({ data }: { data: any }) {
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

export function AverageSessionMinutes({ data }: { data: any }) {
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

export function DailyRecordHours({ data }: { data: any }) {
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
