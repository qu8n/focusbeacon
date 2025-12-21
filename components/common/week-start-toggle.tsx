"use client"

import { useState } from "react"
import { useWeekStart, WeekStartDay } from "@/contexts/week-start-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { cx } from "@/lib/tw-class-merge"

export function WeekStartToggle() {
  const { weekStart, setWeekStart } = useWeekStart()
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<WeekStartDay>(weekStart)

  const options: { value: WeekStartDay; label: string }[] = [
    { value: "sunday", label: "Sunday" },
    { value: "monday", label: "Monday" },
  ]

  const handleOpen = () => {
    setSelectedDay(weekStart)
    setDialogIsOpen(true)
  }

  const handleSave = () => {
    setWeekStart(selectedDay)
    setDialogIsOpen(false)
  }

  return (
    <>
      <Button outline onClick={handleOpen} className="scale-90">
        Edit week start
      </Button>

      <Dialog open={dialogIsOpen} onClose={setDialogIsOpen}>
        <DialogTitle>Select the starting day of the week</DialogTitle>
        <DialogDescription>
          Choose which day your week starts on. This affects how weekly stats
          are calculated.
        </DialogDescription>
        <DialogBody>
          <div className="flex gap-3">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDay(option.value)}
                className={cx(
                  "flex-1 py-2 px-4 rounded-lg transition-colors text-base/6 sm:text-sm/6",
                  selectedDay === option.value
                    ? "bg-orange-300/80 text-orange-950 font-medium shadow-sm"
                    : "border border-stone-950/10 bg-white text-stone-500 hover:bg-orange-50 hover:text-orange-900"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setDialogIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} color="orange">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
