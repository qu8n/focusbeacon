"use client"

import React from "react"
import { Heatmap } from "@/components/heatmap"
import { Stat } from "@/components/stat"
import { useQuery } from "@tanstack/react-query"
import { useBreakpoint } from "@/lib/use-breakpoint"

export default function Dashboard() {
  const { isBelowSm } = useBreakpoint("sm")

  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["focusmateData"],
    queryFn: async () => {
      const response = await fetch(`/api/py/streak`)
      const data = await response.json()
      return data
    },
  })

  if (isError) {
    return <p>Error: {error.message}</p>
  }

  if (isLoading || !data) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div className="grid gap-8 mt-4 sm:grid-cols-3">
        <Stat title="Daily streak">
          {data.daily_streak}
          {data.daily_streak > 1 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="#f97316"
              viewBox="0 0 16 16"
            >
              <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15" />
            </svg>
          )}
        </Stat>
        <Stat title="Weekly streak">{data.weekly_streak}</Stat>
        <Stat title="Monthly streak">{data.monthly_streak}</Stat>
      </div>

      <div className="mt-9">
        <Heatmap
          title="Sessions heatmap"
          data={data.heatmap_data}
          isBelowSm={isBelowSm}
        />
      </div>
    </>
  )
}
