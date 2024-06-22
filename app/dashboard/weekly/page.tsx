"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"

export default function Weekly() {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["weekly"],
    queryFn: async () => {
      const response = await fetch(`/api/py/weekly`)
      const data = await response.json()
      return data
    },
  })

  if (isError) {
    return <p>Error: {error.message}</p>
  }

  if (isLoading || !data) {
    return <div></div>
  }

  return <></>
}
