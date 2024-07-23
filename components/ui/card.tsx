// Tremor Raw Card [v0.0.0]

import React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cx } from "@/lib/utils"

interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild, ...props }, forwardedRef) => {
    const Component = asChild ? Slot : "div"
    return (
      <Component
        ref={forwardedRef}
        className={cx(
          // base
          "relative w-full rounded-md border p-6 text-left shadow-sm",
          // background color
          " bg-[#FDFDFA]",
          // border color
          "border-stone-200",
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

export { Card, type CardProps }
