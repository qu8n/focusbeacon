import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SegmentedToggle } from "@/components/ui/segmented-toggle"

const OPTIONS = [
  { value: "sunday" as const, label: "Sunday" },
  { value: "monday" as const, label: "Monday" },
]

describe("SegmentedToggle", () => {
  it("renders a button per option", () => {
    render(
      <SegmentedToggle options={OPTIONS} value="monday" onChange={vi.fn()} />
    )
    expect(screen.getAllByRole("button")).toHaveLength(2)
  })

  it("marks the selected option as pressed", () => {
    // Selection used to be conveyed by background colour alone, which left
    // assistive technology with nothing to announce
    render(
      <SegmentedToggle options={OPTIONS} value="monday" onChange={vi.fn()} />
    )
    expect(screen.getByRole("button", { name: "Monday" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })

  it("marks the others as not pressed", () => {
    render(
      <SegmentedToggle options={OPTIONS} value="monday" onChange={vi.fn()} />
    )
    expect(screen.getByRole("button", { name: "Sunday" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
  })

  it("reports the value that was clicked", async () => {
    const onChange = vi.fn()
    render(
      <SegmentedToggle options={OPTIONS} value="monday" onChange={onChange} />
    )

    await userEvent.click(screen.getByRole("button", { name: "Sunday" }))

    expect(onChange).toHaveBeenCalledWith("sunday")
  })

  it("reports a click on the already-selected option", async () => {
    const onChange = vi.fn()
    render(
      <SegmentedToggle options={OPTIONS} value="monday" onChange={onChange} />
    )

    await userEvent.click(screen.getByRole("button", { name: "Monday" }))

    expect(onChange).toHaveBeenCalledWith("monday")
  })

  it("does not submit a surrounding form", () => {
    // These live inside dialogs; a default-type button would submit
    render(
      <SegmentedToggle options={OPTIONS} value="monday" onChange={vi.fn()} />
    )
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("type", "button")
    }
  })
})
