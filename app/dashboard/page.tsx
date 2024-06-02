"use client"

import React, { useCallback } from "react"

export default function Dashboard() {
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/py/streak")
      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }, [])

  return <button onClick={fetchData}>Fetch Data</button>
}
