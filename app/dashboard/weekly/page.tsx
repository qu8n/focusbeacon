"use client"

import { useQuery } from "@tanstack/react-query"
import { Stat } from "@/components/ui/stat"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { BarChart } from "@/components/charts/bar-chart"
import { Text, Strong } from "@/components/ui/text"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/fieldset"
import { Input } from "@/components/ui/input"

function buildProgressLabel(progressPercent: number) {
  if (!progressPercent) return "N/A"
  const progressPercentStr = progressPercent.toString() + "%"
  return progressPercent >= 100
    ? progressPercentStr + " " + "🎉"
    : progressPercentStr
}

export default function Weekly() {
  const { isLoading, data } = useQuery({
    queryKey: ["weekly"],
    queryFn: async () => {
      const response = await fetch(`/api/py/weekly`)
      const data = await response.json()
      return data
    },
  })

  const [isOpen, setIsOpen] = useState(false)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const progressPercent = data.goal && (data.total.sessions / data.goal) * 100

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <Card className="sm:col-span-3">
        <div className="-mt-4 mb-6 inline-flex justify-between w-full items-center gap-2">
          <Text>
            <Strong>Progress to goal</Strong>
          </Text>

          <Button
            type="button"
            className="scale-90"
            {...(data.goal && { outline: true })}
            {...(!data.goal && { color: "orange" })}
            onClick={() => setIsOpen(true)}
          >
            {data.goal ? "Change goal" : "Set goal"}
          </Button>
        </div>

        <ProgressBar
          value={progressPercent || 0}
          variant={progressPercent >= 100 ? "success" : "neutral"}
          label={buildProgressLabel(progressPercent)}
        />
      </Card>

      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Weekly session goal</DialogTitle>
        <DialogDescription>
          How many sessions would you like to achieve this week? You can change
          this number at any time.
        </DialogDescription>
        <DialogBody>
          <Field>
            <Input name="weekly session goal" placeholder="10" autoFocus />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)} color="orange">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Card>
        <Stat
          title="Total sessions"
          value={data.total.sessions}
          changeVal={data.prev_period_delta.sessions}
          changeText="vs. last week"
        />
      </Card>

      <Card>
        <Stat
          title="Total hours"
          value={data.total.hours}
          changeVal={data.prev_period_delta.hours}
          changeText="vs. last week"
        />
      </Card>

      <Card>
        <Stat
          title="Total partners"
          value={data.total.partners}
          changeText={`${data.total.repeat_partners} repeat`}
        />
      </Card>

      <Card className="sm:col-span-3">
        <Text className="flex flex-col mb-3">
          <Strong>Sessions this week</Strong>
        </Text>

        <div className="mb-2 mr-4 -ml-4">
          <BarChart
            index="start_date_str"
            categories={["25 minutes", "50 minutes", "75 minutes"]}
            type="stacked"
            data={data.chart.range}
            colors={["blue", "orange", "yellow"]}
            allowDecimals={false}
          />
        </div>
      </Card>

      <Card className="sm:col-span-3">
        <Text className="flex flex-col mb-3">
          <Strong>Sessions by starting time</Strong>
        </Text>

        <div className="mb-2 mr-4 -ml-4">
          <BarChart
            index="start_time_str"
            categories={["25 minutes", "50 minutes", "75 minutes"]}
            type="stacked"
            data={data.chart.time}
            colors={["blue", "orange", "yellow"]}
            allowDecimals={false}
            tickGap={28}
          />
        </div>
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <Card>
        <Stat title="Total sessions">
          <div className="flex flex-row gap-4">
            <Skeleton className="h-[32px] w-[25px]" />
            <Skeleton className="h-[32px] w-[100px]" />
          </div>
        </Stat>
      </Card>

      <Card>
        <Stat title="Total hours">
          <div className="flex flex-row gap-4">
            <Skeleton className="h-[32px] w-[25px]" />
            <Skeleton className="h-[32px] w-[100px]" />
          </div>
        </Stat>
      </Card>

      <Card>
        <Stat title="Total partners">
          <div className="flex flex-row gap-4">
            <Skeleton className="h-[32px] w-[25px]" />
            <Skeleton className="h-[32px] w-[50px]" />
          </div>
        </Stat>
      </Card>

      <Card className="sm:col-span-3">
        <Text className="flex flex-col mb-3">
          <Strong>Sessions this week</Strong>
        </Text>
        <Skeleton className="h-[328px] w-full" />
      </Card>

      <Card className="sm:col-span-3">
        <Text className="flex flex-col mb-3">
          <Strong>Sessions by starting time</Strong>
        </Text>
        <Skeleton className="h-[328px] w-full" />
      </Card>
    </div>
  )
}
