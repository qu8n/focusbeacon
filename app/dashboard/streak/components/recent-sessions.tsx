/* eslint-disable @typescript-eslint/no-explicit-any */

import { columns, HistoryTable } from "@/components/charts/history-table"
import { Card } from "@/components/ui/card"
import { LinkInternal } from "@/components/ui/link-internal"
import { Skeleton } from "@/components/ui/skeleton"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Text } from "@/components/ui/text"
import { useMemo } from "react"
import { RiArrowRightSLine } from "@remixicon/react"

export function RecentSessions({
  demoMode,
  data,
}: {
  demoMode: boolean
  data: any
}) {
  const defaultData = useMemo(() => [], [])
  const table = useReactTable({
    data: data?.history_data ?? defaultData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card title="Recent sessions" className="sm:col-span-6">
      {data ? (
        <>
          <LinkInternal
            href={`/history${demoMode ? "?demo=true" : ""}`}
            className="inline-flex items-center"
          >
            <Text>View all</Text>
            <RiArrowRightSLine className="opacity-40" size={15} />
          </LinkInternal>
          <HistoryTable rows={table.getRowModel().rows} />
        </>
      ) : (
        <Skeleton className="mt-6 w-full h-[247px]" />
      )}
    </Card>
  )
}
