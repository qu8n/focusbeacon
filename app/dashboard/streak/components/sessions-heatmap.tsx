/* eslint-disable @typescript-eslint/no-explicit-any */

import { Heatmap } from "@/components/charts/heatmap"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SessionsHeatmap({ data }: { data: any }) {
  return (
    <Card
      title="Sessions heatmap"
      subtitle={
        data &&
        `${data.heatmap_data.past_year_sessions.toLocaleString()} sessions in the last year`
      }
      className="sm:col-span-6"
    >
      {data ? (
        <Heatmap data={data.heatmap_data} />
      ) : (
        <>
          <Skeleton className="w-[180px] h-[18px]" />
          <Skeleton className="mt-6 w-full h-[138px]" />
        </>
      )}
    </Card>
  )
}
