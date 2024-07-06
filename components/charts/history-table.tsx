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
import { LinkInternal } from "@/components/ui/link-internal"
import { RiArrowRightSLine } from "@remixicon/react"
import { Text, Strong } from "@/components/ui/text"
import { ColumnDef } from "@tanstack/react-table"

export const historyTableColumns: ColumnDef<SessionDetails>[] = [
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
  },
  {
    header: "Completed",
    accessorKey: "completed",
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

export default function HistoryTable({ data }: { data: SessionDetails[] }) {
  return (
    <>
      <Text className="mb-3">
        <Strong>Recent sessions</Strong>
      </Text>

      <TableRoot className="mb-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Time</TableHeaderCell>
              <TableHeaderCell>Duration</TableHeaderCell>
              <TableHeaderCell>On time</TableHeaderCell>
              <TableHeaderCell>Completed</TableHeaderCell>
              <TableHeaderCell>Title</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.session_id}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>{row.duration_minutes}</TableCell>
                <TableCell>
                  <Badge color={row.on_time ? "lime" : "pink"}>
                    {row.on_time ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge color={row.completed ? "lime" : "pink"}>
                    {row.completed ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>{row.session_title}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableRoot>

      <Text className="flex justify-end">
        <LinkInternal href="/history" className="inline-flex items-center">
          View all <RiArrowRightSLine size={16} />
        </LinkInternal>
      </Text>
    </>
  )
}
