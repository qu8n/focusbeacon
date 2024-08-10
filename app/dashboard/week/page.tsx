/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
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
import { DateSubheading } from "@/components/common/date-subheading"
import { DemoModeContext } from "@/components/common/providers"
import { ZeroSessions } from "@/components/common/zero-sessions"
import { LoaderIcon } from "@/components/common/loader-icon"
import {
  SessionsByDuration,
  SessionsByHour,
  SessionsByPeriod,
  SessionsByPunctuality,
  TotalHours,
  TotalPartners,
  TotalSessions,
} from "@/components/common/dashboard-cards"

export default function Week() {
  const demoMode = useContext(DemoModeContext)
  const [goal, setGoal] = useState(0)
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  const { data: currGoal } = useQuery({
    queryKey: ["goal", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/goal?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch goal")
      const goal = await response.json()
      setGoal(goal)
      return goal
    },
  })

  const { data } = useQuery({
    queryKey: ["weekly", demoMode],
    queryFn: async () => {
      const response = await fetch(`/api/py/week?demo=${demoMode}`)
      if (!response.ok) throw new Error("Failed to fetch weekly data")
      return await response.json()
    },
  })

  if (data?.zero_sessions) {
    return <ZeroSessions />
  }

  return (
    <>
      <DateSubheading
        title="Current week"
        dateRange={data?.curr_period?.subheading}
        className="sm:col-span-6"
      />

      <WeeklyGoal
        data={data}
        currGoal={currGoal}
        setDialogIsOpen={setDialogIsOpen}
        demoMode={demoMode}
      />

      <GoalUpdateDialog
        dialogIsOpen={dialogIsOpen}
        setDialogIsOpen={setDialogIsOpen}
        goal={goal}
        setGoal={setGoal}
        demoMode={demoMode}
      />

      <TotalSessions data={data} />

      <TotalHours data={data} />

      <TotalPartners data={data} />

      <SessionsByPeriod
        periodType="day of the week"
        chartData={data?.charts?.curr_period}
      />

      <DateSubheading
        title="Previous four weeks"
        dateRange={data?.prev_period?.subheading}
        className="sm:col-span-6 mt-4"
      />

      <SessionsByPeriod
        periodType="week"
        chartData={data?.charts?.prev_period}
      />

      <SessionsByPunctuality
        data={data}
        totalSessions={data?.prev_period?.sessions_total}
      />

      <SessionsByDuration
        data={data}
        totalSessions={data?.prev_period?.sessions_total}
      />

      <SessionsByHour data={data} />
    </>
  )
}

function WeeklyGoal({
  data,
  currGoal,
  setDialogIsOpen,
  demoMode,
}: {
  data: any
  currGoal: any
  setDialogIsOpen: (isOpen: boolean) => void
  demoMode: boolean
}) {
  const progressPercent =
    currGoal && (data?.curr_period?.sessions_total / currGoal) * 100

  return (
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
          disabled={!data || demoMode}
        >
          {currGoal ? "Edit goal" : "Set goal"}
        </Button>
      </div>

      {data ? (
        <>
          <ProgressBar
            value={progressPercent || 0}
            variant={progressPercent ? "success" : "neutral"}
            label={buildProgressLabel(
              progressPercent,
              data.curr_period.sessions_total,
              currGoal
            )}
          />
        </>
      ) : (
        <Skeleton className="h-[10px] w-full mb-2 mt-2" />
      )}
    </Card>
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

function GoalUpdateDialog({
  dialogIsOpen,
  setDialogIsOpen,
  goal,
  setGoal,
  demoMode,
}: {
  dialogIsOpen: boolean
  setDialogIsOpen: (isOpen: boolean) => void
  goal: number
  setGoal: (goal: number) => void
  demoMode: boolean
}) {
  const queryClient = useQueryClient()

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

  return (
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
            onKeyUp={(e: { key: string }) => e.key === "Enter" && mutate(goal)}
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
  )
}
