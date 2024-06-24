"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Stat } from "@/components/stat"
import { Skeleton } from "@/components/skeleton"

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
    return <LoadingSkeleton />
  }

  return (
    <>
      <div className="grid gap-6 mt-9 sm:mt-6 sm:grid-cols-3">
        <Stat
          title="Total sessions"
          value={data.total.sessions}
          changeVal={data.total.sessions - data.prev.sessions}
          changeText="vs. last week"
        />
        <Stat
          title="Total hours"
          value={data.total.hours}
          changeVal={data.total.hours - data.prev.hours}
          changeText="vs. last week"
        />
        <Stat
          title="Total partners"
          value={data.total.partners}
          changeText={`${data.total.repeat_partners} repeat`}
        />
      </div>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 mt-9 sm:mt-6 sm:grid-cols-3">
      <Stat title="Total sessions">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
          <Skeleton className="h-[32px] w-[135px]" />
        </div>
      </Stat>
      <Stat title="Total hours">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
          <Skeleton className="h-[32px] w-[135px]" />
        </div>
      </Stat>
      <Stat title="Total partners">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
          <Skeleton className="h-[32px] w-[60px]" />
        </div>
      </Stat>
    </div>
  )
}
