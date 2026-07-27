/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Fragment, useContext, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { ErrorMessage, Field } from "@/components/ui/fieldset"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { Strong, Text } from "@/components/ui/text"
import { LoaderIcon } from "@/components/common/loader-icon"
import { DemoModeContext } from "@/components/common/providers"
import { fetchDashboardData } from "@/lib/dashboard-data"
import { useToast } from "@/hooks/use-toast"

export type GoalType = "sessions" | "hours"

/** Mirrors the /api/py/goal payload. `goal` counts sessions when `goal_type`
 * is "sessions" and minutes when it is "hours"; null or 0 means no goal. The
 * server sends its own validation bounds so the dialog can enforce them
 * without keeping a copy. */
interface WeeklyGoalPayload {
  goal: number | null
  goal_type: GoalType
  max_sessions: number
  max_minutes: number
}

/** Each unit keeps its own input, so switching between them never silently
 * reinterprets a number the user typed for the other one. */
interface GoalForm {
  goalType: GoalType
  sessions: string
  hours: string
  minutes: string
}

const EMPTY_FORM: GoalForm = {
  goalType: "sessions",
  sessions: "",
  hours: "",
  minutes: "",
}

const GOAL_TYPE_OPTIONS: { value: GoalType; label: string }[] = [
  { value: "sessions", label: "Sessions" },
  { value: "hours", label: "Hours" },
]

export function WeeklyGoal({
  data,
  disabled,
}: {
  data: any
  disabled: boolean
}) {
  const demoMode = useContext(DemoModeContext)
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const [form, setForm] = useState<GoalForm>(EMPTY_FORM)

  const { data: currGoal } = useQuery<WeeklyGoalPayload>({
    queryKey: ["goal", demoMode],
    queryFn: () =>
      fetchDashboardData(demoMode, `/api/py/goal`, (demo) =>
        demo.getDemoGoal()
      ),
    // The dialog below is the only thing that changes a goal, and it writes
    // the saved value straight back into this cache
    staleTime: Infinity,
  })

  const goal = currGoal?.goal ?? 0
  const goalType = currGoal?.goal_type ?? "sessions"
  const achieved =
    goalType === "hours"
      ? data?.curr_period?.hours_total
      : data?.curr_period?.sessions_total
  const target = goalType === "hours" ? goal / 60 : goal
  const progressPercent = target ? (achieved / target) * 100 : 0

  return (
    <>
      <Card className="sm:col-span-6">
        <div className="-mt-5 mb-3 inline-flex justify-between w-full items-center">
          <Text>
            <Strong>Progress to goal</Strong>
          </Text>

          <Button
            type="button"
            className="scale-90 -mr-2"
            {...(goal
              ? { outline: true as const }
              : { color: "orange" as const })}
            onClick={() => {
              // Seed on open rather than at mount, since the goal query
              // resolves after the first render
              setForm(seedForm(goal, goalType))
              setDialogIsOpen(true)
            }}
            disabled={disabled || demoMode}
          >
            {goal ? "Edit goal" : "Set goal"}
          </Button>
        </div>

        {data ? (
          <ProgressBar
            value={progressPercent}
            variant={progressPercent ? "success" : "neutral"}
            label={buildProgressLabel(
              progressPercent,
              achieved,
              target,
              goalType
            )}
          />
        ) : (
          <Skeleton className="h-[10px] w-full mb-2 mt-2" />
        )}
      </Card>

      <GoalUpdateDialog
        dialogIsOpen={dialogIsOpen}
        setDialogIsOpen={setDialogIsOpen}
        form={form}
        setForm={setForm}
        limits={currGoal}
      />
    </>
  )
}

function seedForm(goal: number, goalType: GoalType): GoalForm {
  const empty = { ...EMPTY_FORM, goalType }
  if (!goal) return empty
  if (goalType === "hours") {
    return {
      ...empty,
      hours: String(Math.floor(goal / 60)),
      minutes: String(goal % 60),
    }
  }
  return { ...empty, sessions: String(goal) }
}

/** Trims a trailing ".0" so a 7-hour goal reads as "7" and not "7.0". */
function formatHours(hours: number) {
  return String(Number(hours.toFixed(1)))
}

function buildProgressLabel(
  progressPercent: number,
  achieved: number,
  target: number,
  goalType: GoalType
) {
  if (!progressPercent) return "N/A"
  const progressPercentStr = Math.round(progressPercent).toString() + "%"
  if (goalType === "hours") {
    return `${formatHours(achieved)} / ${formatHours(
      target
    )} hrs (${progressPercentStr})`
  }
  return `${achieved} / ${target} (${progressPercentStr})`
}

function GoalUpdateDialog({
  dialogIsOpen,
  setDialogIsOpen,
  form,
  setForm,
  limits,
}: {
  dialogIsOpen: boolean
  setDialogIsOpen: (isOpen: boolean) => void
  form: GoalForm
  setForm: (form: GoalForm) => void
  limits: WeeklyGoalPayload | undefined
}) {
  const demoMode = useContext(DemoModeContext)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { goalType, sessions, hours, minutes } = form
  const goal =
    goalType === "hours"
      ? Number(hours) * 60 + Number(minutes)
      : Number(sessions)
  // Before the goal query resolves there is no bound to enforce here; the
  // server validates the same one either way
  const maxGoal =
    (goalType === "hours" ? limits?.max_minutes : limits?.max_sessions) ??
    Infinity
  const isTooLarge = goal > maxGoal

  const { mutate, isPending } = useMutation({
    mutationFn: async (): Promise<WeeklyGoalPayload> => {
      const response = await fetch(`/api/py/goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, goal_type: goalType }),
      })
      if (!response.ok) throw new Error("Failed to update goal")
      return await response.json()
    },
    onSuccess: (saved) => {
      // The POST echoes the saved goal, so there is nothing left to refetch
      queryClient.setQueryData(["goal", demoMode], saved)
      setDialogIsOpen(false)
    },
    onError: () => {
      toast({
        description: "We couldn't save your goal. Please try again.",
        className: "bg-red-50 border border-red-400 text-red-700",
      })
    },
  })

  const submit = () => {
    if (!isTooLarge) mutate()
  }

  const fields =
    goalType === "hours"
      ? [
          { key: "hours" as const, placeholder: "7" },
          { key: "minutes" as const, placeholder: "30" },
        ]
      : [{ key: "sessions" as const, placeholder: "10" }]

  return (
    <Dialog open={dialogIsOpen} onClose={setDialogIsOpen}>
      <DialogTitle>Weekly goal</DialogTitle>
      <DialogDescription>
        What would you like to aim for this week? You can change this at any
        time. 0 means no goal.
      </DialogDescription>
      <DialogBody className="flex flex-col gap-5">
        <SegmentedToggle
          options={GOAL_TYPE_OPTIONS}
          value={goalType}
          onChange={(type) => setForm({ ...form, goalType: type })}
        />

        <div className="flex items-center gap-3">
          {fields.map(({ key, placeholder }, index) => (
            <Fragment key={key}>
              <Field className="flex-1">
                <Input
                  name={`weekly goal ${key}`}
                  type="number"
                  min={0}
                  placeholder={placeholder}
                  autoFocus={index === 0}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  onKeyUp={(e: { key: string }) => e.key === "Enter" && submit()}
                />
              </Field>
              <Text className="whitespace-nowrap">{key}</Text>
            </Fragment>
          ))}
        </div>

        {isTooLarge && (
          <ErrorMessage>
            {goalType === "hours"
              ? `A weekly goal can't exceed ${maxGoal / 60} hours.`
              : `A weekly goal can't exceed ${maxGoal} sessions.`}
          </ErrorMessage>
        )}
      </DialogBody>
      <DialogActions>
        <Button plain onClick={() => setDialogIsOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          disabled={isPending || isTooLarge}
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
