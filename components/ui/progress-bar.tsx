// Tremor Raw ProgressBar [v0.0.1]

import React from "react"
import { tv, type VariantProps } from "tailwind-variants"
import { cx } from "@/lib/tw-class-merge"
import { Text } from "@/components/ui/text"

const progressBarVariants = tv({
  slots: {
    background: "",
    bar: "",
  },
  variants: {
    variant: {
      neutral: {
        background: "bg-stone-100",
        bar: "bg-stone-400/[0.8]",
      },
      success: {
        background: "bg-custom-2/[0.4]",
        bar: "bg-custom-2",
      },
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
})

interface ProgressBarProps
  extends React.HTMLProps<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  value?: number
  max?: number
  showAnimation?: boolean
  label?: string
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value = 0,
      max = 100,
      label,
      showAnimation = false,
      variant,
      className,
      ...props
    }: ProgressBarProps,
    forwardedRef
  ) => {
    const safeValue = Math.min(max, Math.max(value, 0))
    const { background, bar } = progressBarVariants({ variant })
    return (
      <div
        ref={forwardedRef}
        className={cx("flex w-full items-center", className)}
        {...props}
      >
        <div
          className={cx(
            "relative flex h-2 w-full items-center rounded-full",
            background()
          )}
          aria-label="progress bar"
          aria-valuenow={value}
          aria-valuemax={max}
        >
          <div
            className={cx(
              "h-full flex-col rounded-full",
              bar(),
              showAnimation &&
                "transform-gpu transition-all duration-300 ease-in-out"
            )}
            style={{
              width: max ? `${(safeValue / max) * 100}%` : `${safeValue}%`,
            }}
          />
        </div>

        {label ? (
          <Text className={cx("ml-4 whitespace-nowrap leading-none")}>
            {label}
          </Text>
        ) : null}
      </div>
    )
  }
)

ProgressBar.displayName = "ProgressBar"

export { ProgressBar, progressBarVariants, type ProgressBarProps }
