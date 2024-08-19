"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Cell, ColumnDef, Row, flexRender } from "@tanstack/react-table"
import { InfoPopover } from "@/components/common/info-popover"

declare module "@tanstack/table-core/build/lib/types" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    popoverContent?: string
  }
}

export const columns: ColumnDef<SessionDetails>[] = [
  {
    header: "Date",
    accessorKey: "date",
  },
  {
    header: "Time",
    accessorKey: "time",
  },
  {
    header: "Duration (m)",
    accessorKey: "duration_minutes",
  },
  {
    header: "On time",
    accessorKey: "on_time",
    cell: (row) => {
      return (
        <Badge color={row.getValue() ? "lime" : "neutral"}>
          {row.getValue() ? "Yes" : "No"}
        </Badge>
      )
    },
    meta: {
      popoverContent:
        "Sessions where you joined within 2 minutes after the scheduled start time",
    },
  },
  {
    header: "Completed",
    accessorKey: "completed",
    cell: (row) => {
      return (
        <Badge color={row.getValue() ? "lime" : "neutral"}>
          {row.getValue() ? "Yes" : "No"}
        </Badge>
      )
    },
    meta: {
      popoverContent:
        "Sessions where you had a partner and reached the end without cancelling",
    },
  },
  {
    header: "Title",
    accessorKey: "session_title",
  },
]

export type SessionDetails = {
  session_id: string
  date: string
  time: string
  duration_minutes: number
  on_time: boolean
  completed: boolean
  session_title: string
}

export function HistoryTable({ rows }: { rows: Row<SessionDetails>[] }) {
  return (
    <TableRoot className="overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => {
              return (
                <TableHeaderCell key={column.header as string}>
                  <div className="flex flex-row items-center gap-1">
                    {column.header as string}
                    {column.meta?.popoverContent ? (
                      <InfoPopover>{column.meta.popoverContent}</InfoPopover>
                    ) : null}
                  </div>
                </TableHeaderCell>
              )
            })}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => {
            return (
              <TableRow key={row.id}>
                {row
                  .getVisibleCells()
                  .map((cell: Cell<SessionDetails, unknown>) => {
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableRoot>
  )
}
