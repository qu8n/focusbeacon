"use client"

import { useQuery } from "@tanstack/react-query"
import { Stat } from "@/components/ui/stat"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { BarChart, Legend } from "@/components/charts/bar-chart"
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
import { updateGoal } from "@/app/actions/updateGoal"
import { DonutChart } from "@/components/charts/donut-chart"

export default function Weekly() {
  const [goal, setGoal] = useState(0)
  const [updatingGoal, setUpdatingGoal] = useState(false)
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  const {
    isLoading: goalIsLoading,
    data: currGoal,
    refetch: refetchGoal,
  } = useQuery({
    queryKey: ["goal"],
    queryFn: async () => {
      const response = await fetch(`/api/py/goal`, { next: { tags: ["goal"] } })
      const goal = await response.json()
      setGoal(goal)
      return goal
    },
  })

  const { isLoading: dataIsLoading, data } = useQuery({
    queryKey: ["weekly"],
    queryFn: async () => {
      const response = await fetch(`/api/py/weekly`)
      return await response.json()
    },
  })

  async function handleUpdateGoal() {
    setUpdatingGoal(true)
    await updateGoal(goal)
    await refetchGoal()
    setDialogIsOpen(false)
    setUpdatingGoal(false)
  }

  if (goalIsLoading || dataIsLoading) {
    return <LoadingSkeleton />
  }

  const progressPercent = currGoal && (data.total.sessions / currGoal) * 100

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
      <Card className="sm:col-span-6">
        <div className="-mt-5 mb-4 inline-flex justify-between w-full items-center gap-2">
          <Text>
            <Strong>Progress to goal</Strong>
          </Text>

          <Button
            type="button"
            className="scale-90 -mr-2"
            {...(currGoal && { outline: true })}
            {...(!currGoal && { color: "orange" })}
            onClick={() => setDialogIsOpen(true)}
          >
            {currGoal ? "Edit goal" : "Set goal"}
          </Button>
        </div>

        <ProgressBar
          value={progressPercent || 0}
          variant={progressPercent ? "success" : "neutral"}
          label={buildProgressLabel(
            progressPercent,
            data.total.sessions,
            currGoal
          )}
        />
      </Card>

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
                e.key === "Enter" && handleUpdateGoal()
              }
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setDialogIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateGoal}
            disabled={updatingGoal}
            color="orange"
          >
            {updatingGoal ? (
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

      <Card className="sm:col-span-2">
        <Stat
          title="Total sessions"
          value={data.total.sessions}
          changeVal={data.prev_period_delta.sessions}
          changeText="vs. last week"
        />
      </Card>

      <Card className="sm:col-span-2">
        <Stat
          title="Total hours"
          value={data.total.hours}
          changeVal={data.prev_period_delta.hours}
          changeText="vs. last week"
        />
      </Card>

      <Card className="sm:col-span-2">
        <Stat
          title="Total partners"
          value={data.total.partners}
          changeText={`${data.total.repeat_partners} repeat`}
        />
      </Card>

      <Card className="sm:col-span-6">
        <Text>
          <Strong>Sessions by day of the week</Strong>
        </Text>

        <BarChart
          index="start_date_str"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          data={data.chart.range}
          colors={["blue", "orange", "yellow"]}
          allowDecimals={false}
          showYAxis={false}
        />
      </Card>

      <Card className="sm:col-span-3">
        <Text>
          <Strong>Sessions by duration</Strong>
        </Text>

        <Legend
          categories={["25m", "50m", "75m"]}
          colors={["blue", "orange", "yellow"]}
        />

        <div className="grid grid-cols-2 items-center mt-3">
          <DonutChart
            data={data.chart.pie}
            variant="pie"
            category="duration"
            value="amount"
            colors={["blue", "orange", "yellow"]}
            valueFormatter={(value) =>
              `${value} (${(value / data.total.sessions) * 100}%)`
            }
            className="ml-4"
          />

          <div className="flex flex-col">
            {data.chart.pie.map(
              (item: { duration: string; amount: number }) => {
                return (
                  <Text
                    key={item.duration}
                    className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0"
                  >
                    <span>{item.duration}</span>
                    <span>
                      {item.amount} (
                      {Math.round((item.amount / data.total.sessions) * 100)}%)
                    </span>
                  </Text>
                )
              }
            )}
          </div>
        </div>
      </Card>

      <Card className="sm:col-span-3">
        <Text>
          <Strong>Sessions by punctuality</Strong>
        </Text>

        <Legend categories={["Early", "Late"]} colors={["blue", "orange"]} />

        <div className="grid grid-cols-2 items-center mt-3">
          <DonutChart
            data={data.chart.pie}
            variant="pie"
            category="punctuality"
            value="amount"
            colors={["blue", "orange"]}
            valueFormatter={(value) =>
              `${value} (${(value / data.total.sessions) * 100}%)`
            }
            className="ml-4"
          />

          <div className="flex flex-col">
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>{data.chart.punctuality.data[0].punctuality}</span>
              <span>
                {data.chart.punctuality.data[0].amount} (
                {Math.round(
                  (data.chart.punctuality.data[0].amount /
                    data.total.sessions) *
                    100
                )}
                %)
              </span>
            </Text>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>Average</span>
              <span>{data.chart.punctuality.avg}</span>
            </Text>
            <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
              <span>Median</span>
              <span>{data.chart.punctuality.median}</span>
            </Text>
          </div>
        </div>
      </Card>

      <Card className="sm:col-span-6">
        <Text>
          <Strong>Sessions by starting time</Strong>
        </Text>

        <BarChart
          index="start_time_str"
          categories={["25m", "50m", "75m"]}
          type="stacked"
          data={data.chart.time}
          colors={["blue", "orange", "yellow"]}
          allowDecimals={false}
          showYAxis={false}
          tickGap={28}
        />
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <Card className="sm:col-span-3">
        <div className="inline-flex w-full justify-between mb-5 items-center">
          <Text>
            <Strong>Progress to goal</Strong>
          </Text>
          <Skeleton className="w-[70px] h-[30px]" />
        </div>
        <Skeleton className="h-[10px] w-full" />
      </Card>

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
        <Text className="mb-3">
          <Strong>Sessions by day of the week</Strong>
        </Text>
        <Skeleton className="h-[315px] w-full" />
      </Card>

      <Card className="sm:col-span-3">
        <Text className="mb-3">
          <Strong>Sessions by starting time</Strong>
        </Text>
        <Skeleton className="h-[315px] w-full" />
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

function LoaderIcon() {
  return (
    <svg
      className="animate-spin mr-2 h-3 w-3 text-stone-900"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  )
}
