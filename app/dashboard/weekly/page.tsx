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
import { updateGoal } from "@/app/actions/updateGoal"

function buildProgressLabel(progressPercent: number) {
  if (!progressPercent) return "N/A"
  const progressPercentStr = progressPercent.toString() + "%"
  return progressPercent >= 100
    ? progressPercentStr + " " + "🎉"
    : progressPercentStr
}

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
      const data = await response.json()
      return data
    },
  })

  if (goalIsLoading || dataIsLoading) {
    return <LoadingSkeleton />
  }

  const progressPercent = currGoal && (data.total.sessions / currGoal) * 100

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
            {...(currGoal && { outline: true })}
            {...(!currGoal && { color: "orange" })}
            onClick={() => setDialogIsOpen(true)}
          >
            {currGoal ? "Change goal" : "Set goal"}
          </Button>
        </div>

        <ProgressBar
          value={progressPercent || 0}
          variant={progressPercent >= 100 ? "success" : "neutral"}
          label={buildProgressLabel(progressPercent)}
        />
      </Card>

      <Dialog open={dialogIsOpen} onClose={setDialogIsOpen}>
        <DialogTitle>Weekly session goal</DialogTitle>
        <DialogDescription>
          How many sessions would you like to achieve this week? You can change
          this number at any time.
        </DialogDescription>
        <DialogBody>
          <Field>
            <Input
              name="weekly session goal"
              placeholder="10"
              autoFocus
              onChange={(e) => setGoal(Number(e.target.value))}
              value={goal ?? ""}
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setDialogIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setUpdatingGoal(true)
              await updateGoal(goal)
              await refetchGoal()
              setDialogIsOpen(false)
              setUpdatingGoal(false)
            }}
            disabled={updatingGoal}
            color="orange"
          >
            {updatingGoal ? (
              <span className="inline-flex items-center">
                <svg
                  className="animate-spin mr-2 h-3 w-3 text-zinc-900"
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
                Submitting<span className="tracking-wider">...</span>
              </span>
            ) : (
              <span>Submit</span>
            )}
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
