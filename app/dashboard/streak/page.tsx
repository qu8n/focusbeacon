"use client"

import React from "react"
import { Heatmap } from "@/components/heatmap"
import { Stat } from "@/components/stat"
import { Text } from "@/components/text"
import { useQuery } from "@tanstack/react-query"
import { useBreakpoint } from "@/lib/use-breakpoint"
import { getFormattedDate } from "@/lib/date"
import { Label } from "@/components/fieldset"
import { Switch } from "@/components/switch"
import * as Headless from "@headlessui/react"

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
      <div className="grid gap-6 mt-9 sm:mt-6 sm:grid-cols-2">
        <Stat title="Current streak">
          <div className="flex flex-col gap-2 font-semibold text-3xl/8 sm:text-2xl/8">
            <div className="flex flex-row items-center gap-1">
              <span>{data.daily_streak} days</span>
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
            </div>

            <span className="font-normal">{data.weekly_streak} weeks</span>
            <span className="font-normal">{data.monthly_streak} months</span>
          </div>
        </Stat>

        <Stat title="Record streak">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-3xl/8 sm:text-2xl/8">
              {data.max_daily_streak.count} days
            </span>

            <Text className="font-normal">
              {getFormattedDate(data.max_daily_streak.date_range[0]) +
                " - " +
                getFormattedDate(data.max_daily_streak.date_range[1])}
            </Text>

            <Headless.Field className="flex items-center gap-4 mt-6">
              <Switch name="weekend_breaks_daily_streak" />
              <Label>Weekend breaks daily streak</Label>
            </Headless.Field>
          </div>
        </Stat>
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
