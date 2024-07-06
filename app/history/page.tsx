"use client"

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import {
  PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table"
import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { historyTableColumns } from "@/components/charts/history-table"

const Button = ({
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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

  const { isLoading: loadingData, data } = useQuery({
    queryKey: ["history", pagination],
    queryFn: async () => {
      const response = await fetch(`/api/py/history`, {
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
    columns: historyTableColumns,
    rowCount: data?.row_count,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  if (loadingData || !data) {
    return <></>
  }

  return (
    <Card>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <TableHeaderCell key={header.id} scope="col">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHeaderCell>
              ))}
            </TableRow>
          ))}
        </TableHead>

        <TableBody>
          {table.getRowModel().rows.map((row) => {
            return (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

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
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Previous</span>
            <RiArrowLeftSLine className="h-5 w-5" aria-hidden={true} />
          </Button>

          <span className="h-5 border-r" aria-hidden={true} />

          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Next</span>
            <RiArrowRightSLine className="h-5 w-5" aria-hidden={true} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
