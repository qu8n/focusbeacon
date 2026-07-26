"use client"

import { cx } from "@/lib/tw-class-merge"

/** A row of equal-width buttons for picking one of a few mutually exclusive
 * options — the week-start day, the weekly goal's unit. */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cx(
            "flex-1 py-2 px-4 rounded-lg transition-colors text-base/6 sm:text-sm/6",
            value === option.value
              ? "bg-orange-300/80 text-orange-950 font-medium shadow-sm"
              : "border border-stone-950/10 bg-white text-stone-500 hover:bg-orange-50 hover:text-orange-900"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
