/* eslint-disable */
"use client"

import React, { useCallback, useState } from "react"
import { Calendar } from "@/components/calendar"

export default function Dashboard() {
  const [calendarData, setCalendarData] = useState<any | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/py/streak")
      const data = await response.json()
      // setCalendarData(data)
      console.log(data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }, [])

  if (calendarData) {
    return (
      <>
        <Calendar
          data={calendarData.data}
          from={calendarData.from}
          to={calendarData.to}
          height={300}
        />
      </>
    )
  }

  return (
    <>
      <button onClick={fetchData}>Fetch Data</button>
    </>
  )
}
