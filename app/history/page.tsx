"use client"

import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiDownloadLine,
} from "@remixicon/react"
import {
  PaginationState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import { Text } from "@/components/ui/text"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import HistoryTable, { columns } from "@/components/charts/history-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { exportJSONToCSV } from "@/lib/export"
import { Card } from "@/components/ui/card"
import { usePathname, useSearchParams } from "next/navigation"

const PageNavButton = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) => {
  return (
    <button
      type="button"
      className="group px-2.5 py-2 text-tremor-default disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default function History() {
  const searchParams = useSearchParams()
  const demoMode = searchParams.get("demo") === "true"

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isLoading: loadingData, data } = useQuery({
    queryKey: ["history", pagination, demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/history?demo=${demoMode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_index: pagination.pageIndex,
          page_size: pagination.pageSize,
        }),
      })
      const data = await response.json()
      return data
    },
    // Prevent 0 rows flashing while loading next page
    placeholderData: keepPreviousData,
  })

  const defaultData = useMemo(() => [], [])
  const table = useReactTable({
    data: data?.rows ?? defaultData,
    columns: columns,
    rowCount: data?.row_count,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  // Temp patch for Next.js bug. See more at https://github.com/vercel/next.js/issues/45187
  const pathname = usePathname()
  useEffect(() => {
    window.scroll(0, 0)
  }, [pathname])

  async function handleDownload() {
    const response = await fetch(`/api/py/history-all`)
    const data = await response.json()
    exportJSONToCSV(data)
  }

  if (loadingData || !data) {
    return <Skeleton className="w-full h-[680px]" />
  }

  return (
    <>
      <Card>
        <HistoryTable rows={table.getRowModel().rows} />

        <div className="mt-6 flex items-center justify-between">
          <Text className="tabular-nums">
            Page{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-medium">
              {table.getPageCount().toLocaleString()}
            </span>
          </Text>

          <div className="inline-flex items-center border rounded-md">
            <PageNavButton
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Previous</span>
              <RiArrowLeftSLine className="h-5 w-5" aria-hidden={true} />
            </PageNavButton>

            <span className="h-5 border-r" aria-hidden={true} />

            <PageNavButton
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Next</span>
              <RiArrowRightSLine className="h-5 w-5" aria-hidden={true} />
            </PageNavButton>
          </div>
        </div>
      </Card>

      <Button className="mt-4" outline onClick={handleDownload}>
        <RiDownloadLine size={14} /> Download as CSV
      </Button>
    </>
  )
}
