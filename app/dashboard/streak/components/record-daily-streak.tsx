/* eslint-disable @typescript-eslint/no-explicit-any */

import { ThirdWidthCardSkeleton } from "@/components/common/dashboard-cards"
import { Card } from "@/components/ui/card"
import { Stat } from "@/components/ui/stat"
import { Footnote } from "@/components/ui/text"
import { getFormattedDate } from "@/lib/date"
import { RiAwardLine } from "@remixicon/react"

export function RecordDailyStreak({ data }: { data: any }) {
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
