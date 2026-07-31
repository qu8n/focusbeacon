/* eslint-disable @typescript-eslint/no-explicit-any */

import { Heatmap } from "@/components/charts/heatmap"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TimeHeatmap({ data }: { data: any }) {
  return (
    <Card
      title="Time heatmap"
      subtitle={
        data &&
        `${data.time_heatmap_data.past_year_hours.toLocaleString()} hours in the last year`
      }
      className="sm:col-span-6"
    >
      {data ? (
        <Heatmap
          data={data.time_heatmap_data}
          valueLabel={(value) => `${value}h`}
        />
      ) : (
        <>
          <Skeleton className="w-[180px] h-[18px]" />
          <Skeleton className="mt-6 w-full h-[138px]" />
        </>
      )}
    </Card>
  )
}
