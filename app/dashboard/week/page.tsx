"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Stat } from "@/components/ui/stat"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { BarChart, Legend } from "@/components/charts/bar-chart"
import { Text, Strong } from "@/components/ui/text"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Button } from "@/components/ui/button"
import { useContext, useState } from "react"
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/fieldset"
import { Input } from "@/components/ui/input"
import { DonutChart } from "@/components/charts/donut-chart"
import { DateSubheading } from "@/components/common/date-subheading"
import { DemoCallout } from "@/components/common/demo-callout"
import { DemoModeContext, DevModeContext } from "@/components/common/providers"
import { ZeroSessions } from "@/components/common/zero-sessions"
import { LoaderIcon } from "@/components/common/loader-icon"
import {
  RiClockwiseLine,
  RiTimeLine,
  RiUser3Line,
  RiVideoOnLine,
} from "@remixicon/react"

export default function WeekTab() {
  const demoMode = useContext(DemoModeContext)
  return (
    <>
      {demoMode && <DemoCallout />}
      <Week demoMode={demoMode} />
    </>
  )
}

function Week({ demoMode }: { demoMode: boolean }) {
  const devMode = useContext(DevModeContext)
  const queryClient = useQueryClient()
  const [goal, setGoal] = useState(0)
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  const { isLoading: goalIsLoading, data: currGoal } = useQuery({
    queryKey: ["goal", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/goal?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch goal")
      const goal = await response.json()
      setGoal(goal)
      return goal
    },
  })

  const { isLoading: dataIsLoading, data } = useQuery({
    queryKey: ["weekly", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/week?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch weekly data")
      return await response.json()
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (goal: number) => {
      const response = await fetch(`/api/py/goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      })
      if (!response.ok) throw new Error("Failed to update goal")
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["goal", demoMode] })
      setDialogIsOpen(false)
    },
  })

  if (goalIsLoading || dataIsLoading || !data || devMode) {
    return <LoadingSkeleton />
  }

  if (data.zero_sessions) {
    return <ZeroSessions />
  }

  const progressPercent =
    currGoal && (data.curr_period.sessions_total / currGoal) * 100

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
      <Dialog open={dialogIsOpen} onClose={setDialogIsOpen}>
        <DialogTitle>Weekly session goal</DialogTitle>
        <DialogDescription>
          How many sessions would you like to achieve this week? You can change
          this number at any time. 0 means no goal.
        </DialogDescription>
        <DialogBody>
          <Field>
            <Input
              name="weekly session goal"
              placeholder="10"
              autoFocus
              onChange={(e) => setGoal(Number(e.target.value))}
              value={goal ?? ""}
              onKeyUp={(e: { key: string }) =>
                e.key === "Enter" && mutate(goal)
              }
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setDialogIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutate(goal)}
            disabled={isPending}
            color="orange"
          >
            {isPending ? (
              <div className="inline-flex items-center">
                <LoaderIcon />
                Submitting<span className="tracking-wider">...</span>
              </div>
            ) : (
              <span>Submit</span>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <DateSubheading
        title="Current week"
        dateRange={`${data.curr_period.start_label} - ${data.curr_period.end_label}`}
        className="sm:col-span-6"
      />

      <Card className="sm:col-span-6">
        <div className="-mt-5 mb-3 inline-flex justify-between w-full items-center">
          <Text>
            <Strong>Progress to goal</Strong>
          </Text>

          <Button
            type="button"
            className="scale-90 -mr-2"
            {...(currGoal && { outline: true })}
            {...(!currGoal && { color: "orange" })}
            onClick={() => setDialogIsOpen(true)}
            disabled={demoMode}
          >
            {currGoal ? "Edit goal" : "Set goal"}
          </Button>
        </div>

        <ProgressBar
          value={progressPercent || 0}
          variant={progressPercent ? "success" : "neutral"}
          label={buildProgressLabel(
            progressPercent,
            data.curr_period.sessions_total,
            currGoal
          )}
        />
      </Card>

      <Card
        icon={<RiVideoOnLine size={16} className="opacity-40" />}
        title="Total sessions"
        className="sm:col-span-2"
      >
        <Stat
          value={data.curr_period.sessions_total}
          changeVal={data.curr_period.sessions_delta}
          changeText="vs. previous week"
        />
      </Card>

      <Card
        icon={<RiTimeLine size={16} className="opacity-40" />}
        title="Total hours"
        className="sm:col-span-2"
      >
        <Stat
          value={data.curr_period.hours_total}
          changeVal={data.curr_period.hours_delta}
          changeText="vs. previous week"
        />
      </Card>

      <Card
        icon={<RiUser3Line size={16} className="opacity-40" />}
        title="Total partners"
        className="sm:col-span-2"
      >
        <Stat
          value={data.curr_period.partners_total}
          changeText={`${data.curr_period.partners_repeat} repeat`}
        />
      </Card>

      <Card title="Sessions by day of the week" className="sm:col-span-6">
        <BarChart
          index="start_period_str"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          data={data.curr_period.chart_data}
          colors={["custom-1", "custom-2", "custom-3"]}
          allowDecimals={false}
          showYAxis={false}
          legendPosition="left"
        />
      </Card>

      <DateSubheading
        title="Previous weeks"
        dateRange={`${data.prev_period.start_label} - ${data.prev_period.end_label}`}
        className="sm:col-span-6 mt-4"
      />

      <Card title="Sessions by week" className="sm:col-span-6">
        <BarChart
          index="start_period_str"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          data={data.prev_period.week}
          colors={["custom-1", "custom-2", "custom-3"]}
          allowDecimals={false}
          showYAxis={false}
          legendPosition="left"
        />
      </Card>

      <Card title="Sessions by punctuality" className="sm:col-span-3">
        <Legend
          categories={["Early", "Late"]}
          colors={["custom-4", "custom-5"]}
        />

        <div className="grid grid-cols-2 items-center mt-3">
          <DonutChart
            data={data.prev_period.punctuality.data}
            variant="pie"
            category="punctuality"
            value="amount"
            colors={["custom-4", "custom-5"]}
            valueFormatter={(value) =>
              `${value} (${Math.round((value / data.prev_period.sessions_total) * 100)}%)`
            }
            className="ml-4"
          />

          <div className="flex flex-col">
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>{data.prev_period.punctuality.data[0].punctuality}</span>
              <span>
                {data.prev_period.punctuality.data[0].amount} (
                {Math.round(
                  (data.prev_period.punctuality.data[0].amount /
                    data.prev_period.sessions_total) *
                    100
                )}
                %)
              </span>
            </Text>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>Average</span>
              <span>{data.prev_period.punctuality.avg}</span>
            </Text>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>Median</span>
              <span>{data.prev_period.punctuality.median}</span>
            </Text>
          </div>
        </div>
      </Card>

      <Card title="Sessions by duration" className="sm:col-span-3">
        <Legend
          categories={["25m", "50m", "75m"]}
          colors={["custom-1", "custom-2", "custom-3"]}
        />

        <div className="grid grid-cols-2 items-center mt-3">
          <DonutChart
            data={data.prev_period.duration}
            variant="pie"
            category="duration"
            value="amount"
            colors={["custom-1", "custom-2", "custom-3"]}
            valueFormatter={(value) =>
              `${value} (${Math.round((value / data.prev_period.sessions_total) * 100)}%)`
            }
            className="ml-4"
          />

          <div className="flex flex-col">
            {data.prev_period.duration.map(
              (item: { duration: string; amount: number }) => {
                return (
                  <Text
                    key={item.duration}
                    className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0"
                  >
                    <span>{item.duration}</span>
                    <span>
                      {item.amount} (
                      {Math.round(
                        (item.amount / data.prev_period.sessions_total) * 100
                      )}
                      %)
                    </span>
                  </Text>
                )
              }
            )}
          </div>
        </div>
      </Card>

      <Card title="Sessions by hour of the day" className="sm:col-span-6">
        <BarChart
          index="start_time_hour"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          data={data.prev_period.time}
          colors={["custom-1", "custom-2", "custom-3"]}
          allowDecimals={false}
          showYAxis={false}
          tickGap={28}
          legendPosition="left"
        />
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
      <DateSubheading
        title="Current week"
        dateRange={<Skeleton className="w-[210px] h-[25px]" />}
        className="sm:col-span-6"
      />

      <Card className="sm:col-span-6">
        <div className="inline-flex w-full justify-between mb-4 items-center">
          <Text>
            <Strong>Progress to goal</Strong>
          </Text>
          <Skeleton className="w-[70px] h-[30px]" />
        </div>
        <Skeleton className="h-[10px] w-full mb-2" />
      </Card>

      <Card title="Total sessions" className="sm:col-span-2">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
          <Skeleton className="h-[32px] w-[125px]" />
        </div>
      </Card>

      <Card title="Total hours" className="sm:col-span-2">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
          <Skeleton className="h-[32px] w-[125px]" />
        </div>
      </Card>

      <Card title="Total partners" className="sm:col-span-2">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-[32px] w-[25px]" />
          <Skeleton className="h-[32px] w-[50px]" />
        </div>
      </Card>

      <Card title="Sessions by day of the week" className="sm:col-span-6">
        <Skeleton className="h-[320px] w-full" />
      </Card>

      <DateSubheading
        title="Previous weeks"
        dateRange={<Skeleton className="w-[210px] h-[25px]" />}
        className="sm:col-span-6 mt-4"
      />

      <Card title="Sessions by week" className="sm:col-span-6">
        <Skeleton className="h-[320px] w-full" />
      </Card>

      <Card title="Sessions by punctuality" className="sm:col-span-3">
        <Skeleton className="h-[165px] w-full" />
      </Card>

      <Card title="Sessions by duration" className="sm:col-span-3">
        <Skeleton className="h-[165px] w-full" />
      </Card>

      <Card title="Sessions by hour of the day" className="sm:col-span-6">
        <Skeleton className="h-[320px] w-full" />
      </Card>
    </div>
  )
}

function buildProgressLabel(
  progressPercent: number,
  sessions: number,
  goal: number
) {
  if (!progressPercent) return "N/A"
  const progressPercentStr = Math.round(progressPercent).toString() + "%"
  return `${sessions} / ${goal} (${progressPercentStr})`
}
