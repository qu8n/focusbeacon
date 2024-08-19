/* eslint-disable @typescript-eslint/no-explicit-any */

import { ThirdWidthCardSkeleton } from "@/components/common/dashboard-cards"
import { Card } from "@/components/ui/card"
import { Stat } from "@/components/ui/stat"
import { RiCalendar2Line, RiCalendarCheckLine } from "@remixicon/react"

export function WeeklyStreak({ data }: { data: any }) {
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

export function MonthlyStreak({ data }: { data: any }) {
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
