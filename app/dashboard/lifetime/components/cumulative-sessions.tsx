/* eslint-disable @typescript-eslint/no-explicit-any */

import { AreaChart } from "@/components/charts/area-chart"
import { FullWidthCardSkeleton } from "@/components/common/dashboard-cards"
import { Card } from "@/components/ui/card"

export function CumulativeSessions({ data }: { data: any }) {
  return (
    <Card title="Cumulative sessions over time" className="sm:col-span-6">
      {data ? (
        <AreaChart
          data={data?.charts.sessions_cumulative}
          index="start_date"
          categories={["25m", "50m", "75m"]}
          colors={["custom-1", "custom-2", "custom-3"]}
          valueFormatter={(value) => value.toLocaleString()}
          startEndOnly
          type="stacked"
        />
      ) : (
        <FullWidthCardSkeleton />
      )}
    </Card>
  )
}
