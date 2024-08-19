/* eslint-disable @typescript-eslint/no-explicit-any */

import { ThirdWidthCardSkeleton } from "@/components/common/dashboard-cards"
import { Card } from "@/components/ui/card"
import { Stat } from "@/components/ui/stat"
import { RiStackLine } from "@remixicon/react"
import SlotCounter from "react-slot-counter"

export function DailyStreak({ data }: { data: any }) {
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
