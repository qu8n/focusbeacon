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

declare module "@tanstack/table-core/build/lib/types" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
  }
}

export const columns: ColumnDef<SessionDetails>[] = [
  {
    header: "Date",
    accessorKey: "date",
    meta: {
      className: "",
    },
  },
  {
    header: "Time",
    accessorKey: "time",
    meta: {
      className: "",
    },
  },
  {
    header: "Duration (m)",
    accessorKey: "duration_minutes",
    meta: {
      className: "",
    },
  },
  {
    header: "On time",
    accessorKey: "on_time",
    cell: (row) => {
      return (
        <Badge color={row.getValue() ? "lime" : "pink"}>
          {row.getValue() ? "Yes" : "No"}
        </Badge>
      )
    },
    meta: {
      className: "",
    },
  },
  {
    header: "Completed",
    accessorKey: "completed",
    cell: (row) => {
      return (
        <Badge color={row.getValue() ? "lime" : "pink"}>
          {row.getValue() ? "Yes" : "No"}
        </Badge>
      )
    },
    meta: {
      className: "",
    },
  },
  {
    header: "Title",
    accessorKey: "session_title",
    meta: {
      className: "",
    },
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
    <TableRoot>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => {
              return (
                <TableHeaderCell
                  key={column.header as string}
                  className={column.meta?.className}
                >
                  {column.header as string}
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
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className}
                      >
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
