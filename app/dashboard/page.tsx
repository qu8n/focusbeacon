/* eslint-disable */
"use client"

import React, { useCallback, useState } from "react"
import { ResponsiveTimeRange } from "@nivo/calendar"

export default function Dashboard() {
  const [calendarData, setCalendarData] = useState<any | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/py/calendar")
      const data = await response.json()
      setCalendarData(data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }, [])

  if (calendarData) {
    return (
      <>
        <div style={{ height: 300 }}>
          <MyResponsiveCalendarCanvas
            data={calendarData.data}
            from={calendarData.from}
            to={calendarData.to}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <button onClick={fetchData}>Fetch Data</button>
    </>
  )
}

const MyResponsiveCalendarCanvas = ({
  data,
  from,
  to,
}: {
  data: {
    value: number
    day: string
  }[]
  from: string
  to: string
}) => (
  <ResponsiveTimeRange
    data={data}
    from={from}
    direction="horizontal" // TODO: vertical on mobile
    to={to}
    firstWeekday="monday"
    weekdayTicks={[0, 1, 2, 3, 4, 5, 6]}
    emptyColor="#EBEDF0"
    colors={["#ffedd5", "#fdba74", "#f97316"]}
    margin={{ top: 40, right: 40, bottom: 100, left: 40 }}
    dayBorderWidth={5}
    dayBorderColor="#ffffff"
  />
)
