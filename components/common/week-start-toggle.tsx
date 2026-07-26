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
import { SegmentedToggle } from "@/components/ui/segmented-toggle"

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
          <SegmentedToggle
            options={options}
            value={selectedDay}
            onChange={setSelectedDay}
          />
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
