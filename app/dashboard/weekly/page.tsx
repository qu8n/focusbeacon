"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Stat } from "@/components/stat"
import { Skeleton } from "@/components/skeleton"
import { Card } from "@/components/card"

export default function Weekly() {
  const { isLoading, data } = useQuery({
    queryKey: ["weekly"],
    queryFn: async () => {
      const response = await fetch(`/api/py/weekly`)
      const data = await response.json()
      return data
    },
  })

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <Card>
        <Stat
          title="Total sessions"
          value={data.total.sessions}
          changeVal={data.prev_period_delta.sessions}
          changeText="vs. last week"
        />
      </Card>

      <Card>
        <Stat
          title="Total hours"
          value={data.total.hours}
          changeVal={data.prev_period_delta.hours}
          changeText="vs. last week"
        />
      </Card>

      <Card>
        <Stat
          title="Total partners"
          value={data.total.partners}
          changeText={`${data.total.repeat_partners} repeat`}
        />
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <Card>
        <Stat title="Total sessions">
          <div className="flex flex-row gap-4">
            <Skeleton className="h-[32px] w-[25px]" />
            <Skeleton className="h-[32px] w-[100px]" />
          </div>
        </Stat>
      </Card>

      <Card>
        <Stat title="Total hours">
          <div className="flex flex-row gap-4">
            <Skeleton className="h-[32px] w-[25px]" />
            <Skeleton className="h-[32px] w-[100px]" />
          </div>
        </Stat>
      </Card>

      <Card>
        <Stat title="Total partners">
          <div className="flex flex-row gap-4">
            <Skeleton className="h-[32px] w-[25px]" />
            <Skeleton className="h-[32px] w-[50px]" />
          </div>
        </Stat>
      </Card>
    </div>
  )
}
