"use client"

import { Heatmap } from "@/components/charts/heatmap"
import { Stat } from "@/components/ui/stat"
import { Footnote } from "@/components/ui/text"
import { useQuery } from "@tanstack/react-query"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { getFormattedDate } from "@/lib/date"
import { Skeleton } from "@/components/ui/skeleton"
import { Text, Strong } from "@/components/ui/text"
import { Card } from "@/components/ui/card"

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

export default function Streak() {
  const { isBelowSm } = useBreakpoint("sm")

  const { isLoading: loadingData, data } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const response = await fetch(`/api/py/streak`)
      const data = await response.json()
      return data
    },
  })

  if (loadingData || !data) {
    return <LoadingSkeleton />
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Card>
        <Stat title="Daily streak">
          <div className="flex flex-row items-center gap-1">
            <span className="font-semibold text-3xl/8 sm:text-2xl/8">
              {data.daily_streak}
            </span>
            {data.daily_streak > 1 && <FireIcon />}
          </div>
        </Stat>
      </Card>

      <Card>
        <Stat title="Record daily streak">
          <div className="flex flex-row items-center gap-4">
            <span className="font-semibold text-3xl/8 sm:text-2xl/8">
              {data.max_daily_streak.count}
            </span>

            <Footnote className="font-normal">
              {getFormattedDate(data.max_daily_streak.date_range[0]) +
                " - " +
                getFormattedDate(data.max_daily_streak.date_range[1])}
            </Footnote>
          </div>
        </Stat>
      </Card>

      <Card>
        <Stat title="Weekly streak" value={data.weekly_streak} />
      </Card>

      <Card>
        <Stat title="Monthly streak" value={data.monthly_streak} />
      </Card>

      <Card className="sm:col-span-2">
        <Heatmap
          title="Sessions heatmap"
          data={data.heatmap_data}
          isBelowSm={isBelowSm}
        />
      </Card>

      <Card className="sm:col-span-2">
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
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.recent_history.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.time}</TableCell>
                  <TableCell>{item.duration_minutes}</TableCell>
                  <TableCell>
                    <Badge color={item.on_time ? "lime" : "pink"}>
                      {item.on_time ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge color={item.completed ? "lime" : "pink"}>
                      {item.completed ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.session_title}</TableCell>
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
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Card>
        <Stat title="Daily streak">
          <Skeleton className="h-[32px] w-[25px]" />
        </Stat>
      </Card>

      <Card>
        <Stat title="Record daily streak">
          <div className="flex flex-row gap-4">
            <Skeleton className="h-[32px] w-[25px]" />
            <Skeleton className="h-[32px] w-[190px]" />
          </div>
        </Stat>
      </Card>

      <Card>
        <Stat title="Weekly streak">
          <Skeleton className="h-[32px] w-[25px]" />
        </Stat>
      </Card>

      <Card>
        <Stat title="Monthly streak">
          <Skeleton className="h-[32px] w-[25px]" />
        </Stat>
      </Card>

      <Card className="sm:col-span-2">
        <Text className="flex flex-col">
          <Strong>Sessions heatmap</Strong>
        </Text>
        <Skeleton className="mt-2 w-[180px] h-[20px]" />
        <Skeleton className="mt-6 w-full h-[130px]" />
      </Card>
    </div>
  )
}

function FireIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="#f97316"
      viewBox="0 0 16 16"
    >
      <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15" />
    </svg>
  )
}
