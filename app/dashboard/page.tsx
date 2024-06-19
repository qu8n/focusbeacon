/* eslint-disable */
"use client"

import React from "react"
import { Calendar } from "@/components/calendar"
import { Stat } from "@/components/stat"
import { useQuery } from "@tanstack/react-query"
import { useBreakpoint } from "@/lib/use-breakpoint"
import { Divider } from "@/components/divider"

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
        <Stat title="Daily streak" value={data.daily_streak} />
        <Stat title="Weekly streak" value={data.weekly_streak} />
        <Stat title="Monthly streak" value={data.monthly_streak} />
      </div>

      <div className="mt-9">
        <Calendar
          title={`${data.calendar_data.past_year_sessions} sessions in the last year`}
          data={data.calendar_data.data}
          from={data.calendar_data.from}
          to={data.calendar_data.to}
          isBelowSm={isBelowSm}
        />
        <Divider />
      </div>
    </>
  )
}
