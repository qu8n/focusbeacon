import {
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table"
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  columns,
  HistoryTable,
  SessionDetails,
} from "@/components/charts/history-table"

function row(overrides: Partial<SessionDetails> = {}): SessionDetails {
  return {
    session_id: "s1",
    date: "Mon, Mar 01, 2027",
    time: "10:00 AM",
    duration_minutes: 25,
    on_time: true,
    completed: true,
    session_title: "Focus",
    ...overrides,
  }
}

/** Drives the table through TanStack the same way app/history does, so the
 * rows arrive as the Row objects the component expects. */
function Harness({ data }: { data: SessionDetails[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  return <HistoryTable rows={table.getRowModel().rows as Row<SessionDetails>[]} />
}

function renderTable(data: SessionDetails[]) {
  return render(<Harness data={data} />)
}

describe("the header", () => {
  it("renders every column", () => {
    renderTable([row()])
    const headers = screen
      .getAllByRole("columnheader")
      .map((cell) => cell.textContent?.trim())

    expect(headers).toEqual([
      "Date",
      "Time",
      "Duration (m)",
      "On time",
      "Completed",
      "Title",
    ])
  })
})

describe("the rows", () => {
  it("renders one row per session", () => {
    renderTable([
      row({ session_id: "a" }),
      row({ session_id: "b" }),
      row({ session_id: "c" }),
    ])
    // Header row plus three data rows
    expect(screen.getAllByRole("row")).toHaveLength(4)
  })

  it("shows the session's values", () => {
    renderTable([
      row({
        date: "Fri, Mar 05, 2027",
        time: "02:30 PM",
        duration_minutes: 50,
        session_title: "Write the report",
      }),
    ])
    expect(screen.getByText("Fri, Mar 05, 2027")).toBeInTheDocument()
    expect(screen.getByText("02:30 PM")).toBeInTheDocument()
    expect(screen.getByText("50")).toBeInTheDocument()
    expect(screen.getByText("Write the report")).toBeInTheDocument()
  })

  it("renders an empty table body when there are no sessions", () => {
    renderTable([])
    expect(screen.getAllByRole("row")).toHaveLength(1) // the header only
  })
})

describe("the yes/no badges", () => {
  it("reads Yes for an on-time, completed session", () => {
    renderTable([row({ on_time: true, completed: true })])
    const [dataRow] = screen.getAllByRole("row").slice(1)
    expect(within(dataRow).getAllByText("Yes")).toHaveLength(2)
  })

  it("reads No for a late, uncompleted session", () => {
    renderTable([row({ on_time: false, completed: false })])
    const [dataRow] = screen.getAllByRole("row").slice(1)
    expect(within(dataRow).getAllByText("No")).toHaveLength(2)
  })

  it("distinguishes the two flags", () => {
    renderTable([row({ on_time: true, completed: false })])
    const [dataRow] = screen.getAllByRole("row").slice(1)
    expect(within(dataRow).getByText("Yes")).toBeInTheDocument()
    expect(within(dataRow).getByText("No")).toBeInTheDocument()
  })
})

describe("column definitions", () => {
  it("explains the on-time rule, matching the API's grace period", () => {
    // ON_TIME_GRACE_SECONDS is 60 in api_utils/metric.py; this copy is what
    // tells the user so
    const onTime = columns.find((column) => column.header === "On time")
    expect(onTime?.meta?.popoverContent).toMatch(/within 1 minute/i)
  })

  it("explains what counts as completed", () => {
    const completed = columns.find((column) => column.header === "Completed")
    expect(completed?.meta?.popoverContent).toMatch(/partner/i)
  })
})
