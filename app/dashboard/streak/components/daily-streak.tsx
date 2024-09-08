/* eslint-disable @typescript-eslint/no-explicit-any */

import { ThirdWidthCardSkeleton } from "@/components/common/dashboard-cards"
import { Card } from "@/components/ui/card"
import { Stat } from "@/components/ui/stat"
import { useToast } from "@/hooks/use-toast"
import { RiStackLine } from "@remixicon/react"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import confetti from "canvas-confetti"
import { useEffect } from "react"
import SlotCounter from "react-slot-counter"

export function DailyStreak({
  data,
  refetch,
}: {
  data: any
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>
}) {
  const { toast } = useToast()

  useEffect(() => {
    if (data?.daily_streak_increased) {
      // Wrap inside useEffect to avoid warning "Cannot update a component (Toaster)
      // while rendering a different component (Streak)", which occurs when updating
      // the state of a component during the rendering phase of another component
      setTimeout(() => {
        toast({
          description: "Amazing work! You increased your daily streak 🎉",
          className: "bg-orange-50 border border-orange-400 text-orange-700",
        })
        refetch()
      }, 1000)

      setTimeout(() => {
        const end = Date.now() + 1000 // 1s
        const colors = ["#E2B352"] // matches custom-1 in tailwind.config.ts
        const frame = () => {
          if (Date.now() > end) return
          confetti({
            particleCount: 1,
            angle: 60,
            spread: 55,
            startVelocity: 60,
            origin: { x: 0, y: 0.5 },
            colors: colors,
          })
          confetti({
            particleCount: 1,
            angle: 120,
            spread: 55,
            startVelocity: 60,
            origin: { x: 1, y: 0.5 },
            colors: colors,
          })
          requestAnimationFrame(frame)
        }
        frame()
      }, 2000)
    }
  }, [data, toast, refetch])

  return (
    <Card
      icon={<RiStackLine size={16} className="opacity-40" />}
      title="Daily streak"
      className="sm:col-span-3"
      popoverContent="The number of consecutive days you've completed a session. Sessions on the weekend count, but skipping the weekend doesn't break your streak."
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
